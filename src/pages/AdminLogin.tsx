import { useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { OptimizedImage } from "@/components/OptimizedImage";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSent, setForgotSent] = useState(false);
  const { signIn, resetPassword } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const rawNext = searchParams.get("next");
  // Only allow same-origin relative paths.
  const next = rawNext && rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const { error } = await signIn(email, password);
    if (error) {
      toast({ title: "Erro", description: error, variant: "destructive" });
    } else {
      if (next) {
        window.location.href = next;
      } else {
        navigate("/admin");
      }
    }
    setIsLoading(false);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setIsLoading(true);
    const { error } = await resetPassword(forgotEmail);
    if (error) {
      toast({ title: "Erro", description: error, variant: "destructive" });
    } else {
      setForgotSent(true);
      toast({ title: "Email enviado!", description: "Verifique sua caixa de entrada para redefinir a senha." });
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-md bg-card rounded-2xl shadow-lg border border-border/50 p-8">
        <div className="text-center mb-8">
          <OptimizedImage 
            src="https://ogzasprtfgimjqrtcseg.supabase.co/storage/v1/object/public/site-images//images__1_-removebg-preview.png" 
            alt="Tocorime Rio" 
            width={80}
            containerClassName="w-20 h-20 mx-auto mb-4"
            className="w-full h-full object-contain"
          />
          <h1 className="font-serif text-2xl font-bold text-foreground">Painel Admin</h1>
        </div>

        {!showForgot ? (
          <>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="font-sans">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="seu@email.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="font-sans">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  minLength={4}
                />
              </div>
              <div className="flex items-center space-x-2 py-2">
                <input 
                  type="checkbox" 
                  id="remember" 
                  className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                  defaultChecked
                />
                <label htmlFor="remember" className="text-sm text-muted-foreground font-sans cursor-pointer select-none">
                  Permanecer conectado
                </label>
              </div>
              <Button type="submit" className="w-full font-sans" disabled={isLoading}>
                {isLoading ? "Carregando..." : "Entrar"}
              </Button>
            </form>
            <div className="mt-4 flex items-center justify-between">
              <button
                onClick={() => setShowForgot(true)}
                className="text-sm text-primary hover:underline font-sans"
              >
                Esqueci minha senha
              </button>
              <Link to="/" className="text-sm text-muted-foreground hover:text-foreground font-sans inline-flex items-center gap-1">
                <ArrowLeft className="w-3 h-3" /> Voltar para Home
              </Link>
            </div>
          </>
        ) : (
          <>
            {forgotSent ? (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <span className="text-3xl">✉️</span>
                </div>
                <h2 className="font-serif text-lg font-bold text-foreground">Email enviado!</h2>
                <p className="text-sm text-muted-foreground font-sans">
                  Enviamos um link para <strong>{forgotEmail}</strong>. Verifique sua caixa de entrada e spam.
                </p>
                <Button
                  variant="outline"
                  onClick={() => { setShowForgot(false); setForgotSent(false); setForgotEmail(""); }}
                  className="w-full font-sans"
                >
                  Voltar ao login
                </Button>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <p className="text-sm text-muted-foreground font-sans text-center mb-2">
                  Digite seu email para receber um link de redefinição de senha.
                </p>
                <div className="space-y-2">
                  <Label htmlFor="forgotEmail" className="font-sans">Email</Label>
                  <Input
                    id="forgotEmail"
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    required
                    placeholder="seu@email.com"
                  />
                </div>
                <Button type="submit" className="w-full font-sans" disabled={isLoading}>
                  {isLoading ? "Enviando..." : "Enviar link de redefinição"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => { setShowForgot(false); setForgotEmail(""); }}
                  className="w-full font-sans"
                >
                  Voltar ao login
                </Button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminLogin;
