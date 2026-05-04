import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info, AlertTriangle, CheckCircle2 } from "lucide-react";
import { TourFormValues } from "@/schemas/tour";

interface TourSEOAuditProps {
  values: TourFormValues;
}

export function TourSEOAudit({ values }: TourSEOAuditProps) {
  const issues: { type: 'error' | 'warning' | 'success'; message: string }[] = [];

  // Title analysis
  if (!values.title) {
    issues.push({ type: 'error', message: 'Título é obrigatório para SEO.' });
  } else if (values.title.length < 30) {
    issues.push({ type: 'warning', message: 'Título muito curto. Tente entre 50-60 caracteres para melhor visibilidade no Google.' });
  } else {
    issues.push({ type: 'success', message: 'Comprimento do título está bom.' });
  }

  // Description analysis
  if (!values.short_description) {
    issues.push({ type: 'error', message: 'Descrição (meta description) ausente.' });
  } else if (values.short_description.length < 120) {
    issues.push({ type: 'warning', message: 'Descrição muito curta. O ideal é entre 120 e 160 caracteres.' });
  } else {
    issues.push({ type: 'success', message: 'Meta descrição está com bom tamanho.' });
  }

  // Media analysis
  if (!values.image_url) {
    issues.push({ type: 'error', message: 'Falta imagem principal. Google prioriza resultados com imagens.' });
  }

  if (!values.youtube_video_url) {
    issues.push({ type: 'warning', message: 'Dica: Vídeos do YouTube aumentam o tempo de permanência na página.' });
  }

  return (
    <div className="space-y-4 bg-muted/20 p-6 rounded-3xl border border-border/50">
      <div className="flex items-center gap-2 mb-2">
        <Info className="w-4 h-4 text-primary" />
        <h4 className="font-black text-xs uppercase tracking-widest">Análise de SEO em Tempo Real</h4>
      </div>
      
      <div className="space-y-3">
        {issues.map((issue, i) => (
          <div key={i} className="flex items-start gap-3 text-sm">
            {issue.type === 'error' && <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />}
            {issue.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />}
            {issue.type === 'success' && <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />}
            <span className={issue.type === 'error' ? 'text-red-600 font-medium' : issue.type === 'warning' ? 'text-amber-700' : 'text-green-700'}>
              {issue.message}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-border/50">
        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">
          Dica Pro: Use palavras-chave como "Rio de Janeiro", "Tour", "Passeio" e o nome do local no título.
        </p>
      </div>
    </div>
  );
}
