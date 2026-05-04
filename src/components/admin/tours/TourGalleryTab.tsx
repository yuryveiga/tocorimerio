import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OptimizedImage } from "@/components/OptimizedImage";
import { Upload, Star, Trash, Plus, ImageIcon } from "lucide-react";
import { TourFormValues } from "@/schemas/tour";
import { LovableSiteImage } from "@/integrations/lovable/client";

interface TourGalleryTabProps {
  form: UseFormReturn<TourFormValues>;
  handleFileUpload: (files: FileList | null) => Promise<void>;
  isUploading: boolean;
  galleryImages: LovableSiteImage[];
}

export function TourGalleryTab({ 
  form, 
  handleFileUpload, 
  isUploading, 
  galleryImages 
}: TourGalleryTabProps) {
  const images = form.watch("images_json") || [];
  const mainImage = form.watch("image_url");

  const setMainImage = (url: string) => {
    form.setValue("image_url", url);
  };

  const removeImage = (index: number) => {
    const newImages = [...images];
    const removed = newImages.splice(index, 1)[0];
    form.setValue("images_json", newImages);
    if (mainImage === removed) {
      form.setValue("image_url", newImages[0] || "");
    }
  };

  const addFromSiteGallery = (url: string) => {
    if (!images.includes(url)) {
      form.setValue("images_json", [...images, url]);
      if (!mainImage) form.setValue("image_url", url);
    }
  };

  return (
    <div className="space-y-6">
      <div className="p-12 border-4 border-dashed rounded-[40px] bg-muted/20 flex flex-col items-center justify-center gap-4 transition-all hover:bg-muted/30 text-center relative group">
        <Upload className="w-10 h-10 text-primary" />
        <div>
          <h4 className="font-black text-xl">Galeria de Fotos</h4>
          <p className="text-sm text-muted-foreground mt-2">Arraste fotos ou clique para carregar.</p>
          <Input 
            type="file" 
            multiple 
            accept="image/*" 
            onChange={(e) => handleFileUpload(e.target.files)} 
            className="hidden" 
            id="tour-files-upload" 
            disabled={isUploading} 
          />
          <Label htmlFor="tour-files-upload" className="absolute inset-0 cursor-pointer opacity-0" />
        </div>
      </div>
      
      {galleryImages.length > 0 && (
        <div className="border-t pt-6">
          <h4 className="font-black text-lg mb-4">Escolher da Galeria do Site</h4>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
            {galleryImages.map((img) => (
              <button
                key={img.id}
                type="button"
                onClick={() => addFromSiteGallery(img.image_url)}
                className="relative aspect-square rounded-xl overflow-hidden border-2 hover:border-primary transition-all"
              >
                <OptimizedImage 
                  src={img.image_url} 
                  alt={img.label} 
                  width={200}
                  containerClassName="w-full h-full"
                  className="w-full h-full object-cover" 
                />
                <div className="absolute inset-0 bg-primary/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Plus className="w-6 h-6 text-white" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-8">
        {images.map((url, index) => (
          <div key={index} className={`group relative aspect-square rounded-3xl overflow-hidden border-4 transition-all ${mainImage === url ? "border-primary shadow-lg scale-[0.98]" : "border-transparent"}`}>
            <OptimizedImage 
              src={url} 
              alt={`Gallery ${index}`} 
              width={300}
              containerClassName="w-full h-full"
              className="w-full h-full object-cover" 
            />
            
            {mainImage === url && (
              <div className="absolute top-3 left-3 bg-primary text-white text-[10px] font-black px-2 py-1 rounded-full shadow-lg z-10 flex items-center gap-1">
                <Star className="w-3 h-3 fill-white" /> CAPA
              </div>
            )}

            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3">
              <div className="flex justify-between items-start w-full">
                <Button 
                  type="button"
                  size="icon" 
                  variant={mainImage === url ? "default" : "secondary"} 
                  className={`h-8 w-8 rounded-full shadow-xl ${mainImage === url ? "bg-amber-500 hover:bg-amber-600" : "bg-white/90"}`} 
                  onClick={() => setMainImage(url)}
                >
                  <Star className={`w-4 h-4 ${mainImage === url ? "fill-white" : "text-amber-500"}`} />
                </Button>
                <Button 
                  type="button"
                  size="icon" 
                  variant="destructive" 
                  className="h-8 w-8 rounded-full shadow-xl" 
                  onClick={() => removeImage(index)}
                >
                  <Trash className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
