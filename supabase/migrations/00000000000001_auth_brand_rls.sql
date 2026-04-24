-- Supabase SQL Migration: Auth-owned brand bootstrap RLS policies

ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_brands ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'brands'
      AND policyname = 'brands_select_owned'
  ) THEN
    CREATE POLICY brands_select_owned
      ON public.brands
      FOR SELECT
      TO authenticated
      USING (
        id = auth.uid()
        OR EXISTS (
          SELECT 1
          FROM public.user_brands
          WHERE user_brands.brand_id = brands.id
            AND user_brands.user_id = auth.uid()
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'brands'
      AND policyname = 'brands_insert_own_default'
  ) THEN
    CREATE POLICY brands_insert_own_default
      ON public.brands
      FOR INSERT
      TO authenticated
      WITH CHECK (id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'brands'
      AND policyname = 'brands_update_own_default'
  ) THEN
    CREATE POLICY brands_update_own_default
      ON public.brands
      FOR UPDATE
      TO authenticated
      USING (id = auth.uid())
      WITH CHECK (id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'user_brands'
      AND policyname = 'user_brands_select_own'
  ) THEN
    CREATE POLICY user_brands_select_own
      ON public.user_brands
      FOR SELECT
      TO authenticated
      USING (user_id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'user_brands'
      AND policyname = 'user_brands_insert_own'
  ) THEN
    CREATE POLICY user_brands_insert_own
      ON public.user_brands
      FOR INSERT
      TO authenticated
      WITH CHECK (user_id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'user_brands'
      AND policyname = 'user_brands_update_own'
  ) THEN
    CREATE POLICY user_brands_update_own
      ON public.user_brands
      FOR UPDATE
      TO authenticated
      USING (user_id = auth.uid())
      WITH CHECK (user_id = auth.uid());
  END IF;
END
$$;
