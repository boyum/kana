// Base62 encoding utilities for custom lists sharing
import type { CustomList, SerializedCustomList } from "$lib/types/customLists";
import { generateId } from "./storage";

// Base62 character set (URL-safe, no special encoding needed)
const BASE62_CHARS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_";

/**
 * Convert a byte array to base62 string
 */
function bytesToBase62(bytes: Uint8Array): string {
  let result = "";
  let num = BigInt(0);
  
  // Convert bytes to a big integer
  for (let i = 0; i < bytes.length; i++) {
    num = (num << BigInt(8)) | BigInt(bytes[i]);
  }
  
  // Convert to base62
  if (num === BigInt(0)) {
    return BASE62_CHARS[0];
  }
  
  while (num > BigInt(0)) {
    const remainder = Number(num % BigInt(62));
    result = BASE62_CHARS[remainder] + result;
    num = num / BigInt(62);
  }
  
  return result;
}

/**
 * Convert a base62 string to byte array
 */
function base62ToBytes(str: string): Uint8Array {
  let num = BigInt(0);
  
  // Convert base62 string to big integer
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    const value = BASE62_CHARS.indexOf(char);
    if (value === -1) {
      throw new Error("Invalid base62 character");
    }
    num = num * BigInt(62) + BigInt(value);
  }
  
  // Convert big integer to bytes
  const bytes: number[] = [];
  while (num > BigInt(0)) {
    bytes.unshift(Number(num & BigInt(0xff)));
    num = num >> BigInt(8);
  }
  
  return new Uint8Array(bytes.length > 0 ? bytes : [0]);
}

/**
 * Compress data using native browser compression
 */
async function compressData(data: string): Promise<Uint8Array> {
  const encoder = new TextEncoder();
  const input = encoder.encode(data);
  
  // Use browser's native compression
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(input);
      controller.close();
    }
  });
  
  const compressedStream = stream.pipeThrough(
    new CompressionStream("gzip")
  );
  
  const chunks: Uint8Array[] = [];
  const reader = compressedStream.getReader();
  
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }
  
  // Combine all chunks
  const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }
  
  return result;
}

/**
 * Decompress data using native browser decompression
 */
async function decompressData(compressed: Uint8Array): Promise<string> {
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(compressed);
      controller.close();
    }
  });
  
  const decompressedStream = stream.pipeThrough(
    new DecompressionStream("gzip")
  );
  
  const chunks: Uint8Array[] = [];
  const reader = decompressedStream.getReader();
  
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }
  
  // Combine all chunks and decode
  const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }
  
  const decoder = new TextDecoder();
  return decoder.decode(result);
}

// Helper to serialize list for sharing
function serializeList(list: CustomList): Omit<SerializedCustomList, 'type'> {
  return {
    id: list.id,
    name: list.name,
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

// Helper to deserialize list from shared data
function deserializeList(serialized: Partial<SerializedCustomList>): CustomList {
  return {
    id: serialized.id!,
    name: serialized.name!,
    cards: (serialized.cards || []).map(card => ({
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
    createdAt: new Date(serialized.createdAt!),
    updatedAt: new Date(serialized.updatedAt!),
    defaultDirection: serialized.defaultDirection,
  };
}

/**
 * Generate a shareable base62 token containing the list data
 * @param list The custom list to share
 * @returns Promise<string> The base62 encoded token
 */
export async function generateShareToken(list: CustomList): Promise<string> {
  try {
    const serialized = serializeList(list);
    const json = JSON.stringify(serialized);
    
    // Compress the JSON data
    const compressed = await compressData(json);
    
    // Encode to base62 (URL-safe)
    const token = bytesToBase62(compressed);
    
    return token;
  } catch (error) {
    console.error("Failed to generate share token:", error);
    throw new Error("Kunne ikke generere delingskode");
  }
}

/**
 * Decode a share token and import the list
 * @param token The base62 token to decode
 * @returns Promise<CustomList> The imported list with new IDs
 */
export async function decodeShareToken(token: string): Promise<CustomList> {
  try {
    // Decode from base62
    const compressed = base62ToBytes(token);
    
    // Decompress
    const json = await decompressData(compressed);
    
    // Parse JSON
    const serialized = JSON.parse(json) as Partial<SerializedCustomList>;

    // Validate structure
    if (
      !serialized.name ||
      !serialized.cards ||
      !Array.isArray(serialized.cards)
    ) {
      throw new Error("Invalid list structure");
    }

    // Deserialize and generate new IDs to avoid conflicts
    const list = deserializeList(serialized);
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
      if (error.message.includes("Invalid base62")) {
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
  const url = new URL("/egendefinert", baseUrl);
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
