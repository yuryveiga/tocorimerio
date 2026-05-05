import { LovableBlogPost } from "@/integrations/lovable/client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, AlertCircle, XCircle, Sparkles, Wand2, Search, Info } from "lucide-react";
import { useMemo } from "react";
import { toast } from "sonner";

interface BlogSEOAuditProps {
  post: Partial<LovableBlogPost>;
  onUpdate: (updates: Partial<LovableBlogPost>) => void;
}

export function BlogSEOAudit({ post, onUpdate }: BlogSEOAuditProps) {
  const issues = useMemo(() => {
    const list: { 
      type: 'success' | 'warning' | 'error'; 
      message: string; 
      tip?: string;
      action?: string;
      onFix?: () => void;
    }[] = [];
    
    // Title Analysis
    const title = post.title || "";
    if (title.length === 0) {
      list.push({ 
        type: 'error', 
        message: "Título ausente", 
        tip: "O Google precisa de um título para exibir nos resultados." 
      });
    } else if (title.length < 30) {
      list.push({ 
        type: 'warning', 
        message: "Título muito curto", 
        tip: "Títulos entre 50-60 caracteres performam melhor.",
        action: "Expandir Título",
        onFix: () => onUpdate({ title: title + " | Melhores Passeios no Rio de Janeiro" })
      });
    } else if (title.length > 70) {
      list.push({ 
        type: 'warning', 
        message: "Título muito longo", 
        tip: "Títulos acima de 70 caracteres podem ser cortados no Google.",
        action: "Encurtar",
        onFix: () => onUpdate({ title: title.substring(0, 65).trim() })
      });
    } else {
      list.push({ type: 'success', message: "Tamanho do título ideal" });
    }

    // Slug Analysis
    const slug = post.slug || "";
    if (!slug) {
      list.push({ 
        type: 'error', 
        message: "URL amigável (slug) ausente",
        action: "Gerar Slug",
        onFix: () => onUpdate({ slug: title ? title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '') : "post-" + Date.now() })
      });
    } else if (slug.includes('_') || /[A-Z]/.test(slug)) {
      list.push({ 
        type: 'warning', 
        message: "Slug mal formatado", 
        tip: "Use apenas letras minúsculas e hifens (-) para melhor indexação.",
        action: "Corrigir Slug",
        onFix: () => onUpdate({ slug: slug.toLowerCase().replace(/_/g, '-').replace(/[^\w-]+/g, '') })
      });
    } else if (slug.length > 50) {
      list.push({ 
        type: 'warning', 
        message: "Slug muito longo", 
        tip: "URLs curtas e descritivas são preferidas.",
        action: "Encurtar Slug",
        onFix: () => onUpdate({ slug: slug.substring(0, 40).replace(/-$/, '') })
      });
    } else {
      list.push({ type: 'success', message: "URL amigável bem estruturada" });
    }

    // Excerpt (Meta Description) Analysis
    const excerpt = post.excerpt || "";
    if (excerpt.length === 0) {
      list.push({ 
        type: 'error', 
        message: "Descrição (meta description) ausente", 
        tip: "Sem isso, o Google escolherá um trecho aleatório do texto.",
        action: "Gerar do Texto",
        onFix: () => {
          const plainText = (post.content || "").replace(/<[^>]*>/g, "").trim();
          if (plainText) {
            onUpdate({ excerpt: plainText.substring(0, 155).trim() + "..." });
          }
        }
      });
    } else if (excerpt.length < 120) {
      list.push({ 
        type: 'warning', 
        message: "Descrição muito curta", 
        tip: "Tente usar entre 140-160 caracteres para maior taxa de clique.",
        action: "Completar",
        onFix: () => onUpdate({ excerpt: excerpt + " Confira todos os detalhes e dicas exclusivas em nosso blog oficial da Tocorime Rio." })
      });
    } else if (excerpt.length > 165) {
      list.push({ 
        type: 'warning', 
        message: "Descrição muito longa", 
        tip: "O Google cortará o texto se passar de 160 caracteres.",
        action: "Ajustar Tamanho",
        onFix: () => onUpdate({ excerpt: excerpt.substring(0, 157).trim() + "..." })
      });
    } else {
      list.push({ type: 'success', message: "Descrição otimizada" });
    }

    // Content Analysis
    const content = post.content || "";
    const cleanContent = content.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
    const wordCount = cleanContent.split(" ").filter(Boolean).length;
    
    if (wordCount < 10) {
       list.push({ type: 'error', message: "Conteúdo não detectado", tip: "Escreva algo no post para que o Google possa indexá-lo." });
    } else if (wordCount < 300) {
      list.push({ type: 'warning', message: `Conteúdo curto (${wordCount} palavras)`, tip: "Artigos com mais de 600 palavras tendem a ranquear melhor." });
    } else if (wordCount > 1500) {
      list.push({ type: 'success', message: `Conteúdo épico (${wordCount} palavras)!` });
    } else {
      list.push({ type: 'success', message: `Bom volume de conteúdo (${wordCount} palavras)` });
    }

    // Image Analysis
    if (!post.image_url) {
      list.push({ type: 'error', message: "Imagem de capa ausente", tip: "Posts com imagens têm 94% mais visualizações." });
    } else {
      list.push({ type: 'success', message: "Imagem de capa configurada" });
    }

    // Keyword Analysis
    const keywords = title.toLowerCase().split(' ').filter(w => w.length > 4);
    const topKeywords = keywords.slice(0, 3);
    if (topKeywords.length > 0) {
      const contentLower = cleanContent.toLowerCase();
      topKeywords.forEach(kw => {
        const count = (contentLower.match(new RegExp(kw, 'g')) || []).length;
        if (count === 0 && wordCount > 0) {
          list.push({ 
            type: 'warning', 
            message: `Palavra-chave "${kw}" ausente no texto`, 
            tip: "Incluir a palavra principal no primeiro parágrafo ajuda no SEO.",
            action: "Inserir no Início",
            onFix: () => onUpdate({ content: `<p><strong>${kw.charAt(0).toUpperCase() + kw.slice(1)}</strong> é um tema essencial para quem busca o melhor do Rio. </p>` + content })
          });
        } else if (count > 0) {
          list.push({ type: 'success', message: `Palavra-chave "${kw}" presente (${count}x)` });
        }
      });
    }

    return list;
  }, [post, onUpdate]);

  const score = useMemo(() => {
    const total = issues.length;
    if (total === 0) return 0;
    const success = issues.filter(i => i.type === 'success').length;
    const warning = issues.filter(i => i.type === 'warning').length;
    return Math.round(((success + warning * 0.5) / total) * 100) || 0;
  }, [issues]);

  const handleAutoOptimize = () => {
    issues.forEach(issue => {
      if (issue.onFix) issue.onFix();
    });
    toast.success("Otimização automática aplicada!");
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-y-auto max-h-full">
      <div className="flex flex-col md:flex-row gap-8 items-start">
        <div className="flex-1 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-serif font-black text-foreground flex items-center gap-2">
                <Search className="w-6 h-6 text-primary" />
                Análise de SEO em Tempo Real
              </h3>
              <p className="text-muted-foreground text-sm">Otimize seu post para dominar os resultados do Google.</p>
            </div>
            <Button 
              onClick={handleAutoOptimize}
              variant="outline" 
              className="border-primary/20 hover:bg-primary/5 font-bold rounded-xl h-11"
            >
              <Wand2 className="w-4 h-4 mr-2 text-primary" />
              Otimizar Tudo
            </Button>
          </div>

          <div className="grid gap-4">
            {issues.map((issue, idx) => (
              <div 
                key={idx} 
                className={`p-4 rounded-2xl border flex items-center gap-4 transition-all hover:scale-[1.01] ${
                  issue.type === 'success' ? 'bg-green-50/50 border-green-100' : 
                  issue.type === 'warning' ? 'bg-amber-50/50 border-amber-100' : 
                  'bg-red-50/50 border-red-100'
                }`}
              >
                <div className="shrink-0">
                  {issue.type === 'success' && <CheckCircle2 className="w-5 h-5 text-green-600" />}
                  {issue.type === 'warning' && <AlertCircle className="w-5 h-5 text-amber-600" />}
                  {issue.type === 'error' && <XCircle className="w-5 h-5 text-red-600" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-black text-sm uppercase tracking-tight truncate ${
                    issue.type === 'success' ? 'text-green-800' : 
                    issue.type === 'warning' ? 'text-amber-800' : 
                    'text-red-800'
                  }`}>
                    {issue.message}
                  </p>
                  {issue.tip && <p className="text-xs text-muted-foreground mt-0.5 font-medium">{issue.tip}</p>}
                </div>
                {issue.onFix && (
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="shrink-0 text-[10px] font-black uppercase tracking-widest text-primary hover:text-primary hover:bg-primary/10"
                    onClick={issue.onFix}
                  >
                    <Sparkles className="w-3 h-3 mr-1" />
                    {issue.action || "Otimizar"}
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="w-full md:w-80 shrink-0 space-y-6">
          <div className="p-8 rounded-[2rem] bg-card border border-border shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
              <Sparkles className="w-16 h-16 text-primary" />
            </div>
            
            <div className="relative space-y-6 text-center">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary bg-primary/10 px-4 py-1.5 rounded-full">Score de Rank</span>
              <div className="relative inline-flex items-center justify-center">
                <svg className="w-32 h-32 transform -rotate-90">
                  <circle
                    className="text-muted/20"
                    strokeWidth="8"
                    stroke="currentColor"
                    fill="transparent"
                    r="58"
                    cx="64"
                    cy="64"
                  />
                  <circle
                    className="text-primary transition-all duration-1000 ease-out"
                    strokeWidth="8"
                    strokeDasharray={364.4}
                    strokeDashoffset={364.4 - (364.4 * score) / 100}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="58"
                    cx="64"
                    cy="64"
                  />
                </svg>
                <span className="absolute text-3xl font-black font-serif">{score}%</span>
              </div>
              <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                {score === 100 ? "Perfeito! Este post está pronto para o topo do Google." : 
                 score > 70 ? "Muito bom! Alguns ajustes e você chega lá." : 
                 "Precisa de atenção. Siga as dicas ao lado."}
              </p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-muted/30 border border-border space-y-4">
            <h4 className="font-bold text-xs uppercase tracking-widest flex items-center gap-2">
              <Info className="w-4 h-4 text-primary" />
              Preview do Google
            </h4>
            <div className="space-y-1 bg-white p-4 rounded-xl border shadow-sm">
              <p className="text-[11px] text-zinc-500 truncate">eco-wanderlust.com.br › blog › {post.slug || '...'}</p>
              <h5 className="text-blue-700 text-lg font-medium hover:underline cursor-pointer line-clamp-1">{post.title || "Título do Post"}</h5>
              <p className="text-xs text-zinc-600 line-clamp-2">{post.excerpt || "Adicione uma descrição para ver o preview de como seu post aparecerá nos resultados de busca do Google..."}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
