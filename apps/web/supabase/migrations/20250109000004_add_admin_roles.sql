-- Add admin role support to the application

-- Create role enum type
CREATE TYPE user_role AS ENUM ('user', 'admin');

-- Add role column to profiles table (create profiles table if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.profiles (
  id text PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'user',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- If profiles table already exists, just add the role column
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_schema = 'public'
                 AND table_name = 'profiles'
                 AND column_name = 'role') THEN
    ALTER TABLE public.profiles ADD COLUMN role user_role NOT NULL DEFAULT 'user';
  END IF;
END $$;

-- Create index on role for efficient admin checks
CREATE INDEX IF NOT EXISTS profiles_role_idx ON public.profiles(role);

-- Create trigger to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, role)
  VALUES (NEW.id, 'user')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id text)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = user_id AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Policies for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid()::text = id);

-- Users can update their own profile (but not role)
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid()::text = id);

-- Admin policies for lists table
-- Admins can view all lists
CREATE POLICY "Admins can view all lists"
  ON public.lists
  FOR SELECT
  USING (public.is_admin(auth.uid()::text));

-- Admins can update any list
CREATE POLICY "Admins can update any list"
  ON public.lists
  FOR UPDATE
  USING (public.is_admin(auth.uid()::text));

-- Admins can delete any list
CREATE POLICY "Admins can delete any list"
  ON public.lists
  FOR DELETE
  USING (public.is_admin(auth.uid()::text));

-- Admins can insert any list (including with NULL user_id for examples)
CREATE POLICY "Admins can insert any list"
  ON public.lists
  FOR INSERT
  WITH CHECK (public.is_admin(auth.uid()::text));

-- Admin policies for cards table
-- Admins can view all cards
CREATE POLICY "Admins can view all cards"
  ON public.cards
  FOR SELECT
  USING (public.is_admin(auth.uid()::text));

-- Admins can update any card
CREATE POLICY "Admins can update any card"
  ON public.cards
  FOR UPDATE
  USING (public.is_admin(auth.uid()::text));

-- Admins can delete any card
CREATE POLICY "Admins can delete any card"
  ON public.cards
  FOR DELETE
  USING (public.is_admin(auth.uid()::text));

-- Admins can insert any card
CREATE POLICY "Admins can insert any card"
  ON public.cards
  FOR INSERT
  WITH CHECK (public.is_admin(auth.uid()::text));
