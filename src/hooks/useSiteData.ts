import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { fetchLovable, LovableTour, LovablePage, LovableSiteImage, LovableSocialMedia, LovableSiteSetting } from "@/integrations/lovable/client";

const fallbackTours: LovableTour[] = [
  { id: "1", title: "City Tour Rio Completo", short_description: "Conheça os pontos turísticos mais icônicos do Rio de Janeiro.", price: 250, duration: "8 horas", max_group_size: 15, image_url: "/placeholder.svg", is_featured: true, category: "City Tour", is_active: true, sort_order: 1 },
  { id: "2", title: "Arraial do Cabo", short_description: "Descubra o Caribe Brasileiro com águas cristalinas.", price: 180, duration: "12 horas", max_group_size: 20, image_url: "/placeholder.svg", is_featured: true, category: "Praia", is_active: true, sort_order: 2 },
  { id: "3", title: "Angra dos Reis", short_description: "Navegue pelas ilhas paradisíacas de Angra dos Reis.", price: 200, duration: "10 horas", max_group_size: 25, image_url: "/placeholder.svg", is_featured: true, category: "Barco", is_active: true, sort_order: 3 },
];

const TOUR_LISTING_COLUMNS = "id,title,short_description,price,duration,max_group_size,image_url,is_featured,category,is_active,sort_order,slug,pricing_model,price_1_person,price_2_people,price_3_6_people,price_7_19_people,use_custom_options,custom_options_json,tiered_pricing_json,external_url,title_en,title_es,short_description_en,short_description_es,category_en,category_es,included_json,included_json_en,included_json_es";

export function useTours() {
  return useQuery({
    queryKey: ["tours"],
    queryFn: async () => {
      const data = await fetchLovable<LovableTour>("tours", TOUR_LISTING_COLUMNS);
      return data.filter((t) => t.is_active).sort((a, b) => a.sort_order - b.sort_order);
    },
    staleTime: 1000 * 60 * 10,
  });
}

export function usePages() {
  return useQuery({
    queryKey: ["pages"],
    queryFn: async () => {
      const data = await fetchLovable<LovablePage>("pages");
      return data.filter((p) => p.is_visible).sort((a, b) => a.sort_order - b.sort_order);
    },
    staleTime: 1000 * 60 * 60, // 1 hour for pages
  });
}

export function useSiteImages() {
  return useQuery({
    queryKey: ["siteImages"],
    queryFn: async () => {
      const data = await fetchLovable<LovableSiteImage>("site_images");
      const imagesMap: Record<string, string> = {};
      data.forEach((img) => { 
        // Prevent loading the deleted Maracana image
        if (img.image_url?.includes('maracana-hero')) {
          imagesMap[img.key] = "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?q=80&w=2070";
        } else {
          imagesMap[img.key] = img.image_url; 
        }
      });
      
      const galleryImages = data
        .filter(img => img.key?.startsWith('gallery'))
        .map(img => ({ id: img.id, url: img.image_url, key: img.key }));

      const maracanaGallery = data
        .filter(img => img.key?.startsWith('gallery__maracana'))
        .map(img => ({ id: img.id, url: img.image_url, key: img.key }));

      return { imagesMap, galleryImages, maracanaGallery };
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useSocialMedia() {
  return useQuery({
    queryKey: ["socialMedia"],
    queryFn: async () => {
      const data = await fetchLovable<LovableSocialMedia>("social_media");
      return data.filter((s) => s.is_active).sort((a, b) => a.sort_order - b.sort_order);
    },
    staleTime: 1000 * 60 * 60,
  });
}

export function useSiteSettings() {
  return useQuery({
    queryKey: ["siteSettings"],
    queryFn: async () => {
      const data = await fetchLovable<LovableSiteSetting>("site_settings");
      const settingsMap: Record<string, string> = {};
      data.forEach((s) => { settingsMap[s.key] = s.value; });
      
      if (data.length > 0 && typeof window !== 'undefined') {
        localStorage.setItem('site_settings', JSON.stringify(settingsMap));
      }
      
      return settingsMap;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Backward compatible combined hook
export function useSiteData() {
  const toursQuery = useTours();
  const pagesQuery = usePages();
  const imagesQuery = useSiteImages();
  const socialQuery = useSocialMedia();
  const settingsQuery = useSiteSettings();

  // isLoading is true ONLY during the very first fetch of ANY critical resource
  const isLoading = toursQuery.isPending || pagesQuery.isPending || imagesQuery.isPending || socialQuery.isPending || settingsQuery.isPending;

  // Handle cached settings fallback - MUST be stable for hydration
  const cachedSettings = useMemo(() => {
    if (typeof window === 'undefined') return {};
    try {
      return JSON.parse(localStorage.getItem('site_settings') || '{}');
    } catch {
      return {};
    }
  }, []);

  return useMemo(() => ({
    tours: toursQuery.data || fallbackTours,
    pages: pagesQuery.data || [],
    images: imagesQuery.data?.imagesMap || {},
    gallery: imagesQuery.data?.galleryImages || [],
    maracanaGallery: imagesQuery.data?.maracanaGallery || [],
    socialMedia: socialQuery.data || [],
    siteSettings: settingsQuery.data || cachedSettings,
    isLoading,
    isError: toursQuery.isError || pagesQuery.isError || imagesQuery.isError,
    // version is bumped only when images refetch; settings refetches don't
    // need to invalidate every cached <img> in the tree.
    version: imagesQuery.dataUpdatedAt || 0,
  }), [
    toursQuery.data, 
    pagesQuery.data, 
    imagesQuery.data, 
    imagesQuery.dataUpdatedAt,
    socialQuery.data, 
    settingsQuery.data,
    isLoading, 
    cachedSettings,
    toursQuery.isError,
    pagesQuery.isError,
    imagesQuery.isError
  ]);
}