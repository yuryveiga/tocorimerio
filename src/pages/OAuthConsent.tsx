import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

// Local typed wrapper: the beta `auth.oauth` namespace ships in supabase-js
// runtime but is not yet in the exported types.
type OAuthNs = {
  getAuthorizationDetails: (id: string) => Promise<{ data: any; error: any }>;
  approveAuthorization: (id: string) => Promise<{ data: any; error: any }>;
  denyAuthorization: (id: string) => Promise<{ data: any; error: any }>;
};
const oauth = (supabase.auth as unknown as { oauth: OAuthNs }).oauth;

function safeNext(): string {
  return window.location.pathname + window.location.search;
}

export default function OAuthConsent() {
  const [params] = useSearchParams();
  const authorizationId = params.get("authorization_id") ?? "";
  const [details, setDetails] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!authorizationId) return setError("Missing authorization_id");
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) {
        window.location.href = "/admin/login?next=" + encodeURIComponent(safeNext());
        return;
      }
      if (!oauth?.getAuthorizationDetails) {
        setError(
          "OAuth server not available on this Supabase project yet. Try again after the OAuth server is enabled.",
        );
        return;
      }
      const { data, error } = await oauth.getAuthorizationDetails(authorizationId);
      if (!active) return;
      if (error) return setError(error.message ?? String(error));
      const immediate = data?.redirect_url ?? data?.redirect_to;
      if (immediate && !data?.client) {
        window.location.href = immediate;
        return;
      }
      setDetails(data);
    })();
    return () => {
      active = false;
    };
  }, [authorizationId]);

  async function decide(approve: boolean) {
    setBusy(true);
    const call = approve ? oauth.approveAuthorization : oauth.denyAuthorization;
    const { data, error } = await call(authorizationId);
    if (error) {
      setBusy(false);
      return setError(error.message ?? String(error));
    }
    const target = data?.redirect_url ?? data?.redirect_to;
    if (!target) {
      setBusy(false);
      return setError("No redirect returned by the authorization server.");
    }
    window.location.href = target;
  }

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-card border border-border rounded-2xl p-6 shadow">
          <h1 className="font-serif text-xl font-bold mb-2">Cannot load authorization</h1>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </main>
    );
  }

  if (!details) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </main>
    );
  }

  const clientName = details?.client?.name ?? details?.client?.client_name ?? "an app";
  const redirectUri: string | undefined =
    details?.client?.redirect_uri ??
    details?.client?.redirect_uris?.[0] ??
    details?.redirect_uri;

  return (
    <main className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-md bg-card rounded-2xl shadow-lg border border-border/50 p-8 space-y-6">
        <div>
          <h1 className="font-serif text-2xl font-bold text-foreground">
            Connect {clientName} to Tocorime Rio
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            This lets {clientName} use Tocorime Rio as you. It can call the
            enabled tools while you are signed in.
          </p>
        </div>

        {redirectUri && (
          <div className="text-xs text-muted-foreground break-all border border-border rounded-lg p-3 bg-muted/40">
            <div className="font-semibold mb-1 text-foreground">Redirect URI</div>
            {redirectUri}
          </div>
        )}

        <p className="text-xs text-muted-foreground">
          This does not bypass this app's permissions or backend policies. Admin
          data (like reservations) is only returned if your account has the
          admin role.
        </p>

        <div className="flex gap-2">
          <Button
            className="flex-1"
            disabled={busy}
            onClick={() => decide(true)}
          >
            {busy ? "Working…" : "Approve"}
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            disabled={busy}
            onClick={() => decide(false)}
          >
            Cancel
          </Button>
        </div>
      </div>
    </main>
  );
}