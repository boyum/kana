/**
 * Auto-generated database types from Supabase
 *
 * Run `npm run supabase:types` to regenerate after schema changes
 *
 * This file will be overwritten each time you run the command.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// Database types will be generated here
// Run: npm run supabase:types
export interface Database {
  public: {
    Tables: {
      // Your tables will appear here after running npm run supabase:types
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
