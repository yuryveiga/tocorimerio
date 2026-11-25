// Modo /vendas: no computador, o site inteiro (passeio, carrinho e pagamento)
// abre dentro de uma moldura de celular, para o cliente ver a versão mobile.
const KEY = "vendas-mobile-frame";
const MOBILE_MAX = 640;

export function isFramed() {
  try { return window.self !== window.top; } catch { return true; }
}

/** Retorna true quando a moldura foi montada (o app normal não deve iniciar). */
export function mountVendasFrame(root: HTMLElement): boolean {
  if (isFramed()) return false;
  const { pathname, search, hash } = window.location;
  try {
    if (pathname.startsWith("/vendas")) sessionStorage.setItem(KEY, "1");
    if (sessionStorage.getItem(KEY) !== "1") return false;
  } catch { return false; }
  if (window.innerWidth <= MOBILE_MAX) return false;

  root.innerHTML = "";
  root.style.cssText = "min-height:100vh;display:flex;align-items:center;justify-content:center;background:hsl(var(--muted));padding:16px";
  const iframe = document.createElement("iframe");
  iframe.title = "Tocorime Rio";
  iframe.src = pathname + search + hash;
  iframe.style.cssText = "width:390px;height:min(844px,calc(100vh - 32px));border:10px solid hsl(var(--foreground));border-radius:36px;background:hsl(var(--background));box-shadow:0 20px 60px -20px hsl(var(--foreground)/.5)";
  iframe.addEventListener("load", () => {
    try {
      const l = iframe.contentWindow!.location;
      window.history.replaceState(null, "", l.pathname + l.search + l.hash);
      document.title = iframe.contentDocument?.title || document.title;
    } catch {}
  });
  root.appendChild(iframe);
  return true;
}

/** Abre o pagamento na janela principal (o Stripe não abre dentro da moldura). */
export function goToPayment(url: string) {
  try { (window.top || window).location.href = url; } catch { window.location.href = url; }
}
