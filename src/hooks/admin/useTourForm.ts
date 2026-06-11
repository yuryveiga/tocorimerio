import { useState, useEffect } from "react";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { tourSchema, TourFormValues } from "@/schemas/tour";
import { insertLovable, updateLovable, uploadLovableFile, LovableTour } from "@/integrations/lovable/client";
import { translateText } from "@/utils/translate";
import confetti from "canvas-confetti";

export function useTourForm(initialData: Partial<LovableTour> | null, onSuccess: () => void) {
  const [isUploading, setIsUploading] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const { toast } = useToast();

  const form = useForm<TourFormValues>({
    resolver: zodResolver(tourSchema),
    defaultValues: {
      title: "",
      short_description: "",
      price: 0,
      duration: "",
      max_group_size: 1,
      image_url: "",
      is_featured: false,
      category: "CITY TOUR",
      is_active: true,
      itinerary_json: [],
      included_json: [],
      highlights_json: [],
      faq_json: [],
      difficulty: "Leve",
      youtube_video_url: "",
      external_url: "",
      pricing_model: "fixed",
      carousel_images_json: [],
      tiered_pricing_json: [],
      ...initialData,
    } as TourFormValues,
  });

  // Reset form when initialData changes (essential for editing existing items)
  useEffect(() => {
    if (initialData) {
      form.reset({
        title: "",
        short_description: "",
        price: 0,
        duration: "",
        max_group_size: 1,
        image_url: "",
        is_featured: false,
        category: "CITY TOUR",
        is_active: true,
        itinerary_json: [],
        included_json: [],
        highlights_json: [],
        faq_json: [],
        difficulty: "Leve",
        youtube_video_url: "",
        external_url: "",
        pricing_model: "fixed",
        carousel_images_json: [],
        tiered_pricing_json: [],
        ...initialData,
      } as TourFormValues);
    }
  }, [initialData, form]);


  const translateTourData = async (data: TourFormValues): Promise<TourFormValues> => {
    const [
      tTitleEn, tTitleEs, tTitleZhCN, tTitleZhTW,
      tCatEn, tCatEs, tCatZhCN, tCatZhTW,
      tDescEn, tDescEs, tDescZhCN, tDescZhTW,
      tDifEn, tDifEs, tDifZhCN, tDifZhTW,
      tAddrEn, tAddrEs, tAddrZhCN, tAddrZhTW,
    ] = await Promise.all([
      translateText(data.title || "", "en"),
      translateText(data.title || "", "es"),
      translateText(data.title || "", "zh"),
      translateText(data.title || "", "zh-TW"),
      translateText(data.category || "", "en"),
      translateText(data.category || "", "es"),
      translateText(data.category || "", "zh"),
      translateText(data.category || "", "zh-TW"),
      translateText(data.short_description || "", "en"),
      translateText(data.short_description || "", "es"),
      translateText(data.short_description || "", "zh"),
      translateText(data.short_description || "", "zh-TW"),
      translateText(data.difficulty || "", "en"),
      translateText(data.difficulty || "", "es"),
      translateText(data.difficulty || "", "zh"),
      translateText(data.difficulty || "", "zh-TW"),
      translateText(data.meeting_point_address || "", "en"),
      translateText(data.meeting_point_address || "", "es"),
      translateText(data.meeting_point_address || "", "zh"),
      translateText(data.meeting_point_address || "", "zh-TW"),
    ]);

    const translateJsonArray = async (arr: any[], fields: string[], lang: string) => {
      if (!arr || !Array.isArray(arr)) return arr;
      return Promise.all(arr.map(async (item) => {
        const newItem = { ...item };
        for (const field of fields) {
          if (item[field]) {
            newItem[field] = await translateText(item[field], lang);
          }
        }
        return newItem;
      }));
    };

    const [
      tItineraryEn, tItineraryEs, tItineraryZhCN, tItineraryZhTW,
      tIncludedEn, tIncludedEs, tIncludedZhCN, tIncludedZhTW,
      tHighlightsEn, tHighlightsEs, tHighlightsZhCN, tHighlightsZhTW,
      tFaqEn, tFaqEs, tFaqZhCN, tFaqZhTW,
    ] = await Promise.all([
      translateJsonArray(data.itinerary_json || [], ['time', 'description'], "en"),
      translateJsonArray(data.itinerary_json || [], ['time', 'description'], "es"),
      translateJsonArray(data.itinerary_json || [], ['time', 'description'], "zh"),
      translateJsonArray(data.itinerary_json || [], ['time', 'description'], "zh-TW"),
      translateJsonArray(data.included_json || [], ['text'], "en"),
      translateJsonArray(data.included_json || [], ['text'], "es"),
      translateJsonArray(data.included_json || [], ['text'], "zh"),
      translateJsonArray(data.included_json || [], ['text'], "zh-TW"),
      translateJsonArray(data.highlights_json || [], ['text'], "en"),
      translateJsonArray(data.highlights_json || [], ['text'], "es"),
      translateJsonArray(data.highlights_json || [], ['text'], "zh"),
      translateJsonArray(data.highlights_json || [], ['text'], "zh-TW"),
      translateJsonArray(data.faq_json || [], ['q', 'a'], "en"),
      translateJsonArray(data.faq_json || [], ['q', 'a'], "es"),
      translateJsonArray(data.faq_json || [], ['q', 'a'], "zh"),
      translateJsonArray(data.faq_json || [], ['q', 'a'], "zh-TW"),
    ]);

    return {
      ...data,
      title_en: tTitleEn,
      title_es: tTitleEs,
      title_zh_cn: tTitleZhCN,
      title_zh_tw: tTitleZhTW,
      category_en: tCatEn,
      category_es: tCatEs,
      category_zh_cn: tCatZhCN,
      category_zh_tw: tCatZhTW,
      short_description_en: tDescEn,
      short_description_es: tDescEs,
      short_description_zh_cn: tDescZhCN,
      short_description_zh_tw: tDescZhTW,
      difficulty_en: tDifEn,
      difficulty_es: tDifEs,
      difficulty_zh_cn: tDifZhCN,
      difficulty_zh_tw: tDifZhTW,
      meeting_point_address_en: tAddrEn,
      meeting_point_address_es: tAddrEs,
      meeting_point_address_zh_cn: tAddrZhCN,
      meeting_point_address_zh_tw: tAddrZhTW,
      itinerary_json_en: tItineraryEn,
      itinerary_json_es: tItineraryEs,
      itinerary_json_zh_cn: tItineraryZhCN,
      itinerary_json_zh_tw: tItineraryZhTW,
      included_json_en: tIncludedEn,
      included_json_es: tIncludedEs,
      included_json_zh_cn: tIncludedZhCN,
      included_json_zh_tw: tIncludedZhTW,
      highlights_json_en: tHighlightsEn,
      highlights_json_es: tHighlightsEs,
      highlights_json_zh_cn: tHighlightsZhCN,
      highlights_json_zh_tw: tHighlightsZhTW,
      faq_json_en: tFaqEn,
      faq_json_es: tFaqEs,
      faq_json_zh_cn: tFaqZhCN,
      faq_json_zh_tw: tFaqZhTW,
    } as TourFormValues;
  };


  const handleAutoTranslate = async () => {
    const values = form.getValues();
    if (!values.title) {
      toast({ title: "Atenção", description: "Escreva algo em Português primeiro." });
      return;
    }

    setIsTranslating(true);
    toast({ title: "Mágica em andamento...", description: "Traduzindo..." });

    try {
      const translated = await translateTourData(values);
      form.reset(translated);
      toast({ title: "Sucesso!", description: "Tradução concluída." });
    } catch (err) {
      toast({ title: "Erro", description: "Falha na tradução", variant: "destructive" });
    } finally {
      setIsTranslating(false);
    }
  };

  const onSubmit = async (values: TourFormValues) => {
    setIsTranslating(true);
    toast({ title: "Salvando...", description: "Isso pode levar alguns segundos." });

    try {
      const slug = values.slug || values.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const dataToSave = { ...values, slug };

      if (!initialData?.id) {
        await insertLovable("tours", dataToSave);
        toast({ title: "Passeio criado!" });
      } else {
        await updateLovable("tours", initialData.id, dataToSave);
        toast({ title: "Passeio atualizado!" });
      }

      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#22c55e', '#10b981', '#3b82f6']
      });

      onSuccess();
    } catch (error) {
      toast({ title: "Erro", description: "Falha ao salvar", variant: "destructive" });
    } finally {
      setIsTranslating(false);
    }
  };

  const handleFileUpload = async (files: FileList | null, fieldName: "images_json" | "carousel_images_json" = "images_json") => {
    if (!files || files.length === 0) return;
    setIsUploading(true);
    try {
      const currentImages = form.getValues(fieldName) || [];
      const newImages = [...currentImages];
      for (const file of Array.from(files)) {
        const url = await uploadLovableFile(file);
        if (url) newImages.push(url);
      }
      form.setValue(fieldName, newImages);
      if (!form.getValues("image_url") && fieldName === "images_json") {
        form.setValue("image_url", newImages[0]);
      }
      toast({ title: "Imagens carregadas!" });
    } catch {
      toast({ title: "Erro", description: "Falha ao enviar", variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  return {
    form,
    onSubmit: form.handleSubmit(onSubmit),
    handleAutoTranslate,
    handleFileUpload,
    isUploading,
    isTranslating,
  };
}
