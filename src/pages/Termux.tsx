import { useState } from "react";
import { Link } from "react-router-dom";
import { Terminal, ArrowLeft, Copy, Check, Download, Loader2, ShieldCheck, AlertTriangle, Lightbulb } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface TermuxResult {
  name?: string;
  summary?: string;
  requirements?: string[];
  usage?: string;
  script: string;
  notes?: string[];
  review?: {
    strengths?: string[];
    risks?: string[];
    improvements?: string[];
  };
}

const EXAMPLES = [
  "Backup meines Termux-Home ($HOME) täglich als tar.gz mit Zeitstempel, Rotation nach 7 Tagen.",
  "System-Info-Dashboard: CPU, RAM, Akku (termux-battery-status), Netz, Speicher – hübsch formatiert.",
  "Ordner überwachen und bei neuer Datei automatisch nach ~/storage/shared/Upload verschieben.",
  "SSH-Server aufsetzen: openssh installieren, Passwort setzen, sshd starten, IP + Port anzeigen.",
  "Git-Repo Auto-Sync: pull, commit lokaler Änderungen mit Zeitstempel, push, mit Fehler-Logging.",
];

const Termux = () => {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TermuxResult | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Bitte beschreibe, was das Skript machen soll.");
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("generate-termux-script", {
        body: { prompt },
      });
      if (error) {
        toast.error(error.message || "Fehler bei der Generierung");
        return;
      }
      if (data?.error) {
        toast.error(data.error);
        return;
      }
      setResult(data as TermuxResult);
      toast.success("Skript ist fertig.");
    } catch (e) {
      console.error(e);
      toast.error("Unerwarteter Fehler");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!result?.script) return;
    await navigator.clipboard.writeText(result.script);
    setCopied(true);
    toast.success("In Zwischenablage kopiert");
    setTimeout(() => setCopied(false), 1500);
  };

  const handleDownload = () => {
    if (!result?.script) return;
    const blob = new Blob([result.script], { type: "text/x-shellscript" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = result.name || "termux-script.sh";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/">
              <Button variant="ghost" size="sm" className="gap-1.5">
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Zurück</span>
              </Button>
            </Link>
            <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center">
              <Terminal className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold gradient-text">Termux Script Studio</h1>
              <p className="text-[10px] text-muted-foreground">Bash • Termux • produktionsreif</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 grid gap-6 lg:grid-cols-[400px_1fr]">
        {/* Input */}
        <section className="space-y-4">
          <Card className="p-4 space-y-3">
            <div>
              <h2 className="text-sm font-semibold mb-1">Auftrag beschreiben</h2>
              <p className="text-xs text-muted-foreground">
                Klar, konkret, technisch. Das interne Review-Team (Termux-, Bash-, Security-, UX- und Test-Rolle)
                arbeitet den Prompt in <b>einem</b> KI-Call durch, damit Kosten und Rate-Limits niedrig bleiben.
              </p>
            </div>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="z. B.: Skript, das jeden Tag um 03:00 mein Termux-Home nach ~/storage/shared/Backups sichert, alte Backups nach 7 Tagen löscht und mir per termux-notification Bescheid gibt."
              className="min-h-[160px] font-mono text-sm"
            />
            <Button onClick={handleGenerate} disabled={loading} className="w-full gap-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Terminal className="w-4 h-4" />}
              {loading ? "Team arbeitet…" : "Skript generieren"}
            </Button>
          </Card>

          <Card className="p-4 space-y-2">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Beispiele</h3>
            <div className="space-y-1.5">
              {EXAMPLES.map((ex, i) => (
                <button
                  key={i}
                  onClick={() => setPrompt(ex)}
                  className="w-full text-left text-xs p-2 rounded border border-border hover:border-primary/50 hover:bg-primary/5 transition-colors"
                >
                  {ex}
                </button>
              ))}
            </div>
          </Card>
        </section>

        {/* Output */}
        <section className="space-y-4">
          {!result && !loading && (
            <Card className="p-10 text-center border-dashed">
              <Terminal className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Noch kein Skript. Beschreibe links, was du in Termux automatisieren willst.
              </p>
            </Card>
          )}

          {loading && (
            <Card className="p-10 text-center">
              <Loader2 className="w-8 h-8 mx-auto mb-3 animate-spin text-primary" />
              <p className="text-sm">Termux-, Bash-, Security-, UX- und Test-Rolle arbeiten intern…</p>
            </Card>
          )}

          {result && (
            <>
              <Card className="p-4 space-y-2">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-semibold">{result.name || "termux-script.sh"}</h2>
                      <Badge variant="outline" className="text-[10px]">bash</Badge>
                    </div>
                    {result.summary && <p className="text-sm text-muted-foreground mt-1">{result.summary}</p>}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleCopy} className="gap-1.5">
                      {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
                      {copied ? "Kopiert" : "Kopieren"}
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleDownload} className="gap-1.5">
                      <Download className="w-4 h-4" /> .sh
                    </Button>
                  </div>
                </div>

                {result.requirements && result.requirements.length > 0 && (
                  <div className="pt-2">
                    <p className="text-xs font-semibold text-muted-foreground mb-1">Voraussetzungen</p>
                    <ul className="text-xs space-y-0.5 font-mono">
                      {result.requirements.map((r, i) => (
                        <li key={i} className="text-foreground/80">$ {r}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {result.usage && (
                  <div className="pt-2">
                    <p className="text-xs font-semibold text-muted-foreground mb-1">Aufruf</p>
                    <code className="text-xs font-mono block bg-muted/50 rounded p-2">{result.usage}</code>
                  </div>
                )}
              </Card>

              <Card className="overflow-hidden">
                <div className="px-4 py-2 bg-muted/40 border-b border-border text-xs font-mono text-muted-foreground">
                  {result.name || "script.sh"} — {result.script.split("\n").length} Zeilen
                </div>
                <pre className="p-4 text-xs leading-relaxed overflow-auto max-h-[60vh]">
                  <code className="font-mono">
                    {result.script.split("\n").map((line, i) => (
                      <div key={i} className="flex">
                        <span className="w-10 flex-shrink-0 text-right pr-3 text-muted-foreground select-none">{i + 1}</span>
                        <span className="flex-1 whitespace-pre-wrap break-all">{line || " "}</span>
                      </div>
                    ))}
                  </code>
                </pre>
              </Card>

              {result.notes && result.notes.length > 0 && (
                <Card className="p-4">
                  <p className="text-xs font-semibold text-muted-foreground mb-2">Hinweise</p>
                  <ul className="text-xs space-y-1 list-disc pl-4">
                    {result.notes.map((n, i) => <li key={i}>{n}</li>)}
                  </ul>
                </Card>
              )}

              {result.review && (
                <div className="grid gap-3 md:grid-cols-3">
                  {result.review.strengths && result.review.strengths.length > 0 && (
                    <Card className="p-3 border-green-500/30">
                      <div className="flex items-center gap-2 mb-2 text-green-400">
                        <ShieldCheck className="w-4 h-4" />
                        <span className="text-xs font-semibold">Stärken</span>
                      </div>
                      <ul className="text-xs space-y-1 list-disc pl-4 text-foreground/80">
                        {result.review.strengths.map((s, i) => <li key={i}>{s}</li>)}
                      </ul>
                    </Card>
                  )}
                  {result.review.risks && result.review.risks.length > 0 && (
                    <Card className="p-3 border-orange-500/30">
                      <div className="flex items-center gap-2 mb-2 text-orange-400">
                        <AlertTriangle className="w-4 h-4" />
                        <span className="text-xs font-semibold">Risiken</span>
                      </div>
                      <ul className="text-xs space-y-1 list-disc pl-4 text-foreground/80">
                        {result.review.risks.map((s, i) => <li key={i}>{s}</li>)}
                      </ul>
                    </Card>
                  )}
                  {result.review.improvements && result.review.improvements.length > 0 && (
                    <Card className="p-3 border-primary/30">
                      <div className="flex items-center gap-2 mb-2 text-primary">
                        <Lightbulb className="w-4 h-4" />
                        <span className="text-xs font-semibold">Verbesserungen</span>
                      </div>
                      <ul className="text-xs space-y-1 list-disc pl-4 text-foreground/80">
                        {result.review.improvements.map((s, i) => <li key={i}>{s}</li>)}
                      </ul>
                    </Card>
                  )}
                </div>
              )}
            </>
          )}
        </section>
      </main>
    </div>
  );
};

export default Termux;
