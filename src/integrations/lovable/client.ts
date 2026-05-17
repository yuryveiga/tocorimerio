import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { compressImage } from "@/utils/imageCompression";


export async function uploadLovableFile(file: File): Promise<string | null> {
  try {
    // Compress and convert to WebP before upload
    const optimizedFile = await compressImage(file);
    
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
      toast.error(`ERRO DE BUCKET (Storage): ${uploadError.message}`);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('site-images')
      .getPublicUrl(fileName);

    return publicUrl;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    toast.error(`ERRO DE BUCKET: ${message}`);
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
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = supabase.from(table as any).select(columns);
    
    if (table === 'tours' || table === 'pages' || table === 'social_media') {
      query = query.order('sort_order');
    }
    
    const { data, error } = await query;
    if (error) {
      throw error;
    }
    return (data || []) as T[];
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    toast.error(`Erro ao carregar ${table}: ` + message);
    return [];
  }
}

export async function insertLovable<T>(table: string, data: Partial<T>): Promise<T | null> {
  try {
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
    toast.error(`Erro ao salvar no banco (${table}): \n\n` + JSON.stringify(error));
    return null;
  }
}

export async function updateLovable<T>(table: string, id: string, data: Partial<T>): Promise<boolean> {
  try {
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
    toast.error(`Erro ao atualizar no banco (${table}): \n\n` + JSON.stringify(error));
    return false;
  }
}

export async function deleteLovable(table: string, id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .from(table as any)
      .delete()
      .eq('id', id);
      
    if (error) throw error;
    return true;
  } catch (error: unknown) {
    toast.error(`Erro ao excluir no banco (${table}): \n\n` + JSON.stringify(error));
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

