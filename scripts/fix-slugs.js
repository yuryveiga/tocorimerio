import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase credentials not found.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

function slugify(text) {
  return text
    .toString()
    .normalize('NFD')                   // split accented characters into their base characters and diacritical marks
    .replace(/[\u0300-\u036f]/g, '')   // remove all the accents, which happen to be all in the \u03xx range 
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')              // replace spaces with -
    .replace(/[^\w-]+/g, '')           // remove all non-word chars
    .replace(/--+/g, '-');             // replace multiple - with single -
}

async function fixSlugs() {
  console.log('--- Cleaning Slugs in Supabase ---');

  // 1. Fix Tours
  console.log('\nChecking Tours...');
  const { data: tours, error: toursError } = await supabase.from('tours').select('id, slug');
  if (toursError) console.error('Error fetching tours:', toursError);
  else {
    for (const tour of tours) {
      if (!tour.slug) continue;
      const cleanSlug = slugify(tour.slug);
      if (cleanSlug !== tour.slug) {
        console.log(`Updating Tour ${tour.id}: ${tour.slug} -> ${cleanSlug}`);
        const { error } = await supabase.from('tours').update({ slug: cleanSlug }).eq('id', tour.id);
        if (error) console.error(`Error updating tour ${tour.id}:`, error);
      }
    }
  }

  // 2. Fix Blog Posts
  console.log('\nChecking Blog Posts...');
  const { data: posts, error: postsError } = await supabase.from('blog_posts').select('id, slug');
  if (postsError) console.error('Error fetching blog posts:', postsError);
  else {
    for (const post of posts) {
      if (!post.slug) continue;
      const cleanSlug = slugify(post.slug);
      if (cleanSlug !== post.slug) {
        console.log(`Updating Post ${post.id}: ${post.slug} -> ${cleanSlug}`);
        const { error } = await supabase.from('blog_posts').update({ slug: cleanSlug }).eq('id', post.id);
        if (error) console.error(`Error updating post ${post.id}:`, error);
      }
    }
  }

  // 3. Fix Generic Pages
  console.log('\nChecking Generic Pages...');
  const { data: pages, error: pagesError } = await supabase.from('pages').select('id, slug');
  if (pagesError) {
     // If pages table doesn't exist, just skip
     console.log('Pages table not found or error, skipping.');
  } else {
    for (const page of pages) {
      if (!page.slug) continue;
      const cleanSlug = slugify(page.slug);
      if (cleanSlug !== page.slug) {
        console.log(`Updating Page ${page.id}: ${page.slug} -> ${cleanSlug}`);
        const { error } = await supabase.from('pages').update({ slug: cleanSlug }).eq('id', page.id);
        if (error) console.error(`Error updating page ${page.id}:`, error);
      }
    }
  }

  console.log('\n--- Finished Cleaning Slugs ---');
}

fixSlugs();
