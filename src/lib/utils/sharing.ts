// JWT-based sharing utilities for custom lists
import type { CustomList, SerializedCustomList } from "$lib/types/customLists";
import { SignJWT, jwtVerify } from "jose";
import { generateId } from "./storage";

// Secret for JWT - in client-side only apps, this is just for encoding/decoding
// Not for security since anyone can decode JWTs
const JWT_SECRET = new TextEncoder().encode("kana-flashcard-sharing-v1");
const JWT_ISSUER = "kana-flashcard-app";
const JWT_AUDIENCE = "kana-flashcard-users";

// Helper to serialize list for JWT payload
function serializeForJWT(list: CustomList): SerializedCustomList {
  return {
    id: list.id,
    name: list.name,
    type: list.type,
    cards: list.cards.map(card => ({
      id: card.id,
      front: card.front,
      back: card.back,
      type: card.type,
      meaning: card.meaning,
      notes: card.notes,
      tags: card.tags,
      createdAt: card.createdAt.toISOString(),
      lastReviewed: card.lastReviewed?.toISOString(),
    })),
    createdAt: list.createdAt.toISOString(),
    updatedAt: list.updatedAt.toISOString(),
    defaultDirection: list.defaultDirection,
  };
}

// Helper to deserialize list from JWT payload
function deserializeFromJWT(serialized: SerializedCustomList): CustomList {
  return {
    id: serialized.id,
    name: serialized.name,
    type: serialized.type,
    cards: serialized.cards.map(card => ({
      id: card.id,
      front: card.front,
      back: card.back,
      type: card.type,
      meaning: card.meaning,
      notes: card.notes,
      tags: card.tags,
      createdAt: new Date(card.createdAt),
      lastReviewed: card.lastReviewed ? new Date(card.lastReviewed) : undefined,
    })),
    createdAt: new Date(serialized.createdAt),
    updatedAt: new Date(serialized.updatedAt),
    defaultDirection: serialized.defaultDirection,
  };
}

/**
 * Generate a shareable JWT token containing the list data
 * @param list The custom list to share
 * @returns Promise<string> The JWT token
 */
export async function generateShareToken(list: CustomList): Promise<string> {
  try {
    const serialized = serializeForJWT(list);

    const token = await new SignJWT({ list: serialized })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setIssuer(JWT_ISSUER)
      .setAudience(JWT_AUDIENCE)
      .setExpirationTime("365d") // Token valid for 1 year
      .sign(JWT_SECRET);

    return token;
  } catch (error) {
    console.error("Failed to generate share token:", error);
    throw new Error("Kunne ikke generere delingskode");
  }
}

/**
 * Decode a share token and import the list
 * @param token The JWT token to decode
 * @returns Promise<CustomList> The imported list with new IDs
 */
export async function decodeShareToken(token: string): Promise<CustomList> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET, {
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    });

    if (!payload.list || typeof payload.list !== "object") {
      throw new Error("Invalid token payload");
    }

    const serialized = payload.list as SerializedCustomList;

    // Validate structure
    if (
      !serialized.name ||
      !serialized.cards ||
      !Array.isArray(serialized.cards)
    ) {
      throw new Error("Invalid list structure");
    }

    // Deserialize and generate new IDs to avoid conflicts
    const list = deserializeFromJWT(serialized);
    list.id = generateId();
    list.createdAt = new Date();
    list.updatedAt = new Date();

    // Regenerate card IDs
    list.cards = list.cards.map(card => ({
      ...card,
      id: generateId(),
      createdAt: new Date(),
    }));

    return list;
  } catch (error) {
    console.error("Failed to decode share token:", error);

    if (error instanceof Error) {
      if (error.message.includes("expired")) {
        throw new Error("Delingskoden er utløpt");
      }
      if (error.message.includes("signature")) {
        throw new Error("Ugyldig delingskode");
      }
    }

    throw new Error(
      "Kunne ikke importere liste. Sjekk at delingskoden er gyldig.",
    );
  }
}

/**
 * Generate a shareable URL with the token as a query parameter
 * @param list The custom list to share
 * @param baseUrl The base URL of the app (e.g., window.location.origin)
 * @returns Promise<string> The shareable URL
 */
export async function generateShareUrl(
  list: CustomList,
  baseUrl: string,
): Promise<string> {
  const token = await generateShareToken(list);
  const url = new URL("/custom", baseUrl);
  url.searchParams.set("import", token);
  return url.toString();
}

/**
 * Extract import token from URL if present
 * @param url The URL to check (e.g., window.location.href)
 * @returns string | null The token if present, null otherwise
 */
export function extractImportToken(url: string): string | null {
  try {
    const urlObj = new URL(url);
    return urlObj.searchParams.get("import");
  } catch {
    return null;
  }
}
