# @kana/db-services

Shared database services for Kana applications.

## Overview

This package provides type-safe database operations for lists and authentication management, shared between the web app and admin app.

## Installation

This is an internal workspace package. Install dependencies from the root:

```bash
npm install
```

## Building

```bash
npm run build --workspace=@kana/db-services
```

## Usage

### ListsService

Manages custom lists and their operations:

```typescript
import { ListsService } from '@kana/db-services';
import { supabaseAdmin } from './supabase.server';

const listsService = new ListsService(supabaseAdmin);

// Get all lists with filtering
const lists = await listsService.getAllLists({
  filter: 'public',
  search: 'Japanese',
});

// Promote a list to example status
const list = await listsService.promoteToExample('list-id');

// Delete a list
await listsService.deleteList('list-id');
```

### AuthService

Manages user authentication and roles:

```typescript
import { AuthService } from '@kana/db-services';

const authService = new AuthService(supabase);

// Check if user is admin
const isAdmin = await authService.isAdmin('user-id');

// Set user role
await authService.setUserRole('user-id', 'admin');
```

## Types

All database types are exported:

```typescript
import type {
  DbList,
  DbCard,
  DbProfile,
  ListWithCardCount
} from '@kana/db-services';
```

## API Reference

See [ADMIN_SETUP.md](../../ADMIN_SETUP.md) for complete API documentation.
