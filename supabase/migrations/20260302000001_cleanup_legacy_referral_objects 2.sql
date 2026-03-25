-- Migration to clean up legacy referral objects that might reference the dropped "referrals" table

DO $$
DECLARE
    trig_record RECORD;
    func_record RECORD;
BEGIN
    -- 1. Find and drop any triggers that reference the word 'referral' in their name or action
    -- (This is broad, but safe if names are descriptive)
    FOR trig_record IN 
        SELECT 
            tgname AS trigger_name,
            relname AS table_name
        FROM pg_trigger
        JOIN pg_class ON pg_trigger.tgrelid = pg_class.oid
        JOIN pg_namespace ON pg_class.relnamespace = pg_namespace.oid
        WHERE (tgname ILIKE '%referral%' AND tgname NOT ILIKE '%v1%')  -- Avoid dropping our new V1 triggers
           OR (tgname ILIKE '%refree%')
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS %I ON %I;', trig_record.trigger_name, trig_record.table_name);
        RAISE NOTICE 'Dropped trigger: % on table: %', trig_record.trigger_name, trig_record.table_name;
    END LOOP;

    -- 2. Find and drop any functions that reference the "public.referrals" table in their body
    FOR func_record IN
        SELECT 
            n.nspname as schema_name,
            p.proname as function_name,
            pg_get_function_identity_arguments(p.oid) as args
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE (p.prosrc ILIKE '%public.referrals%' OR p.prosrc ILIKE '%insert into referrals%')
          AND p.prosrc NOT ILIKE '%referrals_v1%' -- Avoid dropping our new V1 functions
    LOOP
        EXECUTE format('DROP FUNCTION IF EXISTS %I.%I(%s) CASCADE;', func_record.schema_name, func_record.function_name, func_record.args);
        RAISE NOTICE 'Dropped function: %.%(%)', func_record.schema_name, func_record.function_name, func_record.args;
    END LOOP;

END $$;
