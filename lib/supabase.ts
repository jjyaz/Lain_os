import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const getOpenAIKey = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('openai_key') || '';
  }
  return '';
};

export const setOpenAIKey = (key: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('openai_key', key);
  }
};
