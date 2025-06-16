import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://obfaymsnynnbhhbhrfri.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9iZmF5bXNueW5uYmhoYmhyZnJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5Mzg4ODQsImV4cCI6MjA2NTUxNDg4NH0.NVaoCAX3nY8-Gm_T0ObDmKo_UDlw4QwlIetj3sgtQwY';

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;