// The Supabase SDK (~50 KB gzipped) is intentionally NOT imported at module
// scope: public reads go through a plain REST fetch so a first-time visitor
// never downloads the SDK before first paint. Writes / protected tables load
// the SDK on demand.
const getSupabase = async () => (await import("@/integrations/supabase/client")).supabase;
const notifyError = async (message: string) => {
  const { toast } = await import("sonner");
  toast.error(message);
};

const REST_URL = import.meta.env.VITE_SUPABASE_URL as string;
const REST_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

// Tables readable with the anonymous key (public RLS policies). Anything else
// needs the authenticated session held by the SDK.
const PUBLIC_TABLES = new Set([
  "tours", "pages", "site_images", "social_media", "site_settings",
  "blog_posts", "guides", "blog_post_ratings", "tour_categories",
]);


export async function uploadLovableFile(file: File): Promise<string | null> {
  try {
    // Compress and convert to WebP before upload
    const { compressImage } = await import("@/utils/imageCompression");
    const optimizedFile = await compressImage(file);
    const supabase = await getSupabase();
    
    // Update filename to use .webp extension
    const originalName = optimizedFile.name;
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.webp`;
    
    const { error: uploadError } = await supabase.storage
      .from('site-images')
      .upload(fileName, optimizedFile, {
        cacheControl: '31536000', // 1 year — filename is unique, safe to cache forever
        contentType: 'image/webp',
      });

    if (uploadError) {
      void notifyError(`ERRO DE BUCKET (Storage): ${uploadError.message}`);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('site-images')
      .getPublicUrl(fileName);

    return publicUrl;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    void notifyError(`ERRO DE BUCKET: ${message}`);
    return null;
  }
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
  });
}

export async function fetchLovable<T>(table: string, columns: string = '*'): Promise<T[]> {
  const ordered = table === 'tours' || table === 'pages' || table === 'social_media';
  try {
    // Fast path: public table → plain REST call, no SDK on the critical path.
    if (PUBLIC_TABLES.has(table)) {
      const params = new URLSearchParams({ select: columns });
      if (ordered) params.set('order', 'sort_order');
      const res = await fetch(`${REST_URL}/rest/v1/${table}?${params.toString()}`, {
        headers: { apikey: REST_KEY, Authorization: `Bearer ${REST_KEY}`, Accept: 'application/json' },
      });
      if (!res.ok) throw new Error(await res.text());
      return (await res.json()) as T[];
    }

    const supabase = await getSupabase();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = supabase.from(table as any).select(columns);
    if (ordered) query = query.order('sort_order');
    const { data, error } = await query;
    if (error) throw error;
    return (data || []) as T[];
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    void notifyError(`Erro ao carregar ${table}: ` + message);
    return [];
  }
}

export async function insertLovable<T>(table: string, data: Partial<T>): Promise<T | null> {
  try {
    const supabase = await getSupabase();
    const sanitizedData = { ...data } as Record<string, unknown>;
    delete sanitizedData.id;
    delete sanitizedData.created_at;
    delete sanitizedData.updated_at;
    
    const { data: result, error } = await supabase
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .from(table as any)
      .insert(sanitizedData as any)
      .select()
      .single();
      
    if (error) throw error;
    return result as T;
  } catch (error: unknown) {
    void notifyError(`Erro ao salvar no banco (${table}): \n\n` + JSON.stringify(error));
    return null;
  }
}

export async function updateLovable<T>(table: string, id: string, data: Partial<T>): Promise<boolean> {
  try {
    const supabase = await getSupabase();
    const sanitizedData = { ...data } as Record<string, unknown>;
    delete sanitizedData.id;
    delete sanitizedData.created_at;
    delete sanitizedData.updated_at;

    const { error } = await supabase
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .from(table as any)
      .update(sanitizedData as any)
      .eq('id', id)
      .select();
      
    if (error) {
      throw error;
    }
    
    return true;
  } catch (error: unknown) {
    void notifyError(`Erro ao atualizar no banco (${table}): \n\n` + JSON.stringify(error));
    return false;
  }
}

export async function deleteLovable(table: string, id: string): Promise<boolean> {
  try {
    const supabase = await getSupabase();
    const { error } = await supabase
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .from(table as any)
      .delete()
      .eq('id', id);
      
    if (error) throw error;
    return true;
  } catch (error: unknown) {
    void notifyError(`Erro ao excluir no banco (${table}): \n\n` + JSON.stringify(error));
    return false;
  }
}

import { 
  LovableTour, 
  LovablePage, 
  LovableSiteImage, 
  LovableSocialMedia, 
  LovableSale, 
  LovableBlogPost, 
  LovableSiteSetting, 
  LovableProfile 
} from "@/types";

export type { 
  LovableTour, 
  LovablePage, 
  LovableSiteImage, 
  LovableSocialMedia, 
  LovableSale, 
  LovableBlogPost, 
  LovableSiteSetting, 
  LovableProfile 
};

