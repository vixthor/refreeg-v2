-- Migration to fix missing foreign key relationship for logs table
-- This enables PostgREST to navigate the relationship between logs and profiles

DO $$
BEGIN
    -- Check if logs table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'logs' AND table_schema = 'public') THEN
        -- Check if foreign key exists on admin_id
        IF NOT EXISTS (
            SELECT 1 
            FROM information_schema.table_constraints tc 
            JOIN information_schema.key_column_usage kcu
              ON tc.constraint_name = kcu.constraint_name
              AND tc.table_schema = kcu.table_schema
            WHERE tc.constraint_type = 'FOREIGN KEY' 
              AND tc.table_name = 'logs' 
              AND kcu.column_name = 'admin_id'
        ) THEN
            -- Add the foreign key constraint
            -- Note: We use public.profiles(id)
            ALTER TABLE public.logs
            ADD CONSTRAINT logs_admin_id_fkey
            FOREIGN KEY (admin_id)
            REFERENCES public.profiles(id)
            ON DELETE CASCADE;
            
            RAISE NOTICE 'Added foreign key constraint logs_admin_id_fkey';
        END IF;
    ELSE
        -- Create logs table if it doesn't exist
        CREATE TABLE public.logs (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            action TEXT NOT NULL,
            admin_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
            created_at TIMESTAMPTZ DEFAULT NOW()
        );
        
        -- Add RLS
        ALTER TABLE public.logs ENABLE ROW LEVEL SECURITY;
        
        -- Only admins and managers can view logs
        CREATE POLICY "Admins and managers can view logs"
            ON public.logs
            FOR SELECT
            USING (
                EXISTS (
                    SELECT 1 FROM public.roles 
                    WHERE user_id = auth.uid() 
                    AND role IN ('admin', 'manager')
                )
            );
            
        -- Service role can do everything
        CREATE POLICY "Service role can manage logs"
            ON public.logs
            USING (auth.jwt() ->> 'role' = 'service_role');
            
        RAISE NOTICE 'Created logs table with foreign key and RLS';
    END IF;
END $$;
