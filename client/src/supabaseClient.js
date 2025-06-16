import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://obfaymsnynnbhhbhrfri.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'; // Your full key here

export const supabase = createClient(supabaseUrl, supabaseAnonKey);