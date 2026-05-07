import { createClient } from '@supabase/supabase-js';
const c = createClient("https://mwxbskzggzznxvkwgrnz.supabase.co","eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im13eGJza3pnZ3p6bnh2a3dncm56Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzNjE5OTUsImV4cCI6MjA4ODkzNzk5NX0.EFfaaN79uifOMgFdIZlQ5C8c-HQH-YodNGWf0MEcf9o");
const { data: m } = await c.from('matches').select('*').ilike('slug','%fluminense-vs-bolivar%');
console.log('MATCH', JSON.stringify(m,null,2));
if(m && m[0]){
  const { data: p } = await c.from('match_packages').select('*').eq('match_id', m[0].id);
  console.log('PKGS', JSON.stringify(p,null,2));
}
