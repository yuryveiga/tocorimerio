import { LovableTour } from "@/integrations/lovable/client";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Image as ImageIcon, Star } from "lucide-react";
import { OptimizedImage } from "@/components/OptimizedImage";

interface TourCardProps {
  tour: LovableTour;
  onEdit: (tour: LovableTour) => void;
  onDelete: (id: string) => void;
}

export function TourCard({ tour, onEdit, onDelete }: TourCardProps) {
  return (
    <div className="bg-card rounded-2xl border border-border/50 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group">
      <div className="relative h-48 bg-muted">
        {tour.image_url ? (
          <OptimizedImage 
            src={tour.image_url} 
            alt={tour.title} 
            width={400}
            containerClassName="w-full h-full"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
          />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <ImageIcon className="w-10 h-10 opacity-30" />
          </div>
        )}
        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button 
            size="icon" 
            variant="secondary" 
            className="h-9 w-9 shadow-lg backdrop-blur-sm bg-white/90" 
            onClick={() => onEdit(tour)}
          >
            <Pencil className="w-4 h-4" />
          </Button>
          <Button 
            size="icon" 
            variant="destructive" 
            className="h-9 w-9 shadow-lg" 
            onClick={() => onDelete(tour.id)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
        <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-black font-sans text-primary shadow-sm uppercase tracking-widest">
          {tour.category}
        </div>
      </div>
      <div className="p-5 flex-1 flex flex-col">
        <h3 className="font-serif font-bold text-xl leading-tight mb-3 line-clamp-2">{tour.title}</h3>
        <div className="mt-auto pt-4 flex items-center justify-between border-t border-border/50">
          <div className="flex flex-col">
            <span className="text-primary font-black font-sans text-lg">
              {(() => {
                if (tour.pricing_model === 'dynamic') {
                  return `R$ ${tour.price_1_person || 0} (1p)`;
                } else if (tour.pricing_model === 'group') {
                  return `R$ ${tour.price || 0} (Gr)`;
                } else if (tour.pricing_model === 'custom') {
                  return `Pers.`;
                }
                return `R$ ${tour.price || 0}`;
              })()}
            </span>
            {!tour.is_active && <span className="text-[10px] text-red-500 font-bold uppercase tracking-tighter">Inativo</span>}
          </div>
          <span className="text-xs text-muted-foreground font-sans font-medium uppercase tracking-wider">{tour.duration}</span>
        </div>
      </div>
    </div>
  );
}
