import { createClient } from '@supabase/supabase-js';

// Anon key is a public, publishable credential — safe to embed in client code.
// Override at build time via VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY env vars.
const supabaseUrl =
  (import.meta.env.VITE_SUPABASE_URL as string) ||
  'https://njgzkxvftoccdckcivaj.supabase.co';

// pragma: allowlist secret
const supabaseAnonKey =
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string) ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qZ3preHZmdG9jY2Rja2NpdmFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk0MTA4MjgsImV4cCI6MjA5NDk4NjgyOH0.xnVp98nXsdr_4VthFoeBxsd4MRJMcpFDnKNqaqJODIM'; // pragma: allowlist secret

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
