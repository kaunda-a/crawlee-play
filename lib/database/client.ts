// lib/database/client.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gzaizkumidcpxagbfrim.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || ''; // Ensure this is set in your .env file

export const supabase = createClient(supabaseUrl, supabaseKey);