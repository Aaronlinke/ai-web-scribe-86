import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, model = "google/gemini-3-flash-preview" } = await req.json();

    if (!prompt || prompt.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "Bitte beschreibe das gewünschte Termux-Skript." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Kollektiv-Prompt: EIN Call, aber die KI simuliert intern ein Team aus
    // spezialisierten Rollen. Kostet nur 1 Request, liefert aber die Tiefe
    // eines mehrstufigen Reviews. Keine Fantasie-Begriffe, keine Mythologie.
    const systemPrompt = `Du bist ein Team aus erfahrenen Linux/Termux-Entwicklern, das ein einziges, produktionsreifes Bash-Skript für Termux (Android) liefert. Die Rollen im Team denken parallel mit und stimmen sich intern ab, bevor du antwortest:

ROLLEN (intern, nicht ausgeben):
1. Termux-Spezialist: kennt pkg, termux-api, storage-permissions, PATH ($PREFIX), fehlende Standard-Tools (kein sudo, kein systemd).
2. Bash-Engineer: strict mode (set -euo pipefail), IFS, sauberes Error-Handling, trap, Funktionen, Argument-Parsing (getopts), Exit-Codes.
3. Security-Reviewer: prüft Quoting, Injection-Risiken, unsichere curl | bash, Rechte, Secrets, Rate-Limits.
4. UX-Reviewer: klare CLI-Ausgaben, Farben (tput oder ANSI mit Fallback), Fortschrittsanzeigen, --help, --version.
5. Tester: denkt Edge Cases durch (kein Netz, fehlende Pakete, alte Termux-Version, Speicher voll, User bricht ab).

REGELN FÜR DIE AUSGABE:
- Antworte AUSSCHLIESSLICH als JSON, das exakt diesem Schema folgt (kein Markdown, keine Codefences außerhalb der JSON-Strings):
{
  "name": "kurzer-dateiname.sh",
  "summary": "1-2 Sätze was das Skript tut",
  "requirements": ["pkg install ...", "termux-setup-storage", ...],
  "usage": "beispielhafter Aufruf inkl. Flags",
  "script": "#!/data/data/com.termux/files/usr/bin/bash\\n...vollständiges Skript...",
  "notes": ["kurze technische Hinweise / bekannte Grenzen"],
  "review": {
    "strengths": ["..."],
    "risks": ["..."],
    "improvements": ["..."]
  }
}

QUALITÄTSANFORDERUNGEN AN "script":
- Shebang IMMER: #!/data/data/com.termux/files/usr/bin/bash
- set -euo pipefail und IFS=$'\\n\\t'
- Keine Abhängigkeiten von sudo, systemd, /etc-Dingen die es in Termux nicht gibt.
- Nutze $PREFIX statt hartkodierter /usr/-Pfade wo sinnvoll.
- Pakete via 'pkg install -y' prüfen und nur installieren wenn fehlend (command -v ...).
- Sauberes trap 'cleanup' EXIT INT TERM.
- Farbige Ausgaben mit ANSI, aber Fallback wenn kein TTY.
- --help implementieren.
- Kommentare auf Deutsch, aber Variablen/Funktionen englisch.
- KEINE Platzhalter wie "TODO", "hier deinen Code", "..." – alles muss lauffähig sein.
- Wenn API-Keys nötig sind: aus Env-Variable lesen, nicht hartkodieren, und im "requirements" dokumentieren.

WICHTIG:
- Denke die Rollen intern durch, gib aber NUR das JSON aus.
- Keine Erklärung vor oder nach dem JSON.
- Das Skript muss 100% lauffähig sein, keine halben Sachen.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Termux-Skript-Auftrag: ${prompt}` },
        ],
        response_format: { type: "json_object" },
        temperature: 0.4,
        max_tokens: 6000,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate Limit erreicht. Kurz warten und erneut versuchen." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Guthaben aufgebraucht. Bitte im Workspace aufladen." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "Fehler bei der KI-Generierung" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content ?? "{}";

    let parsed: any;
    try {
      parsed = JSON.parse(raw);
    } catch {
      // Fallback: JSON aus dem Text extrahieren
      const match = raw.match(/\{[\s\S]*\}/);
      parsed = match ? JSON.parse(match[0]) : { script: raw };
    }

    if (!parsed.script) {
      return new Response(
        JSON.stringify({ error: "Kein Skript in der KI-Antwort gefunden." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("generate-termux-script error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unbekannter Fehler" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
