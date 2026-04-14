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
    const { prompt, model = "google/gemini-3-flash-preview", mode = "generate", existingCode = "" } = await req.json();
    
    if (!prompt || prompt.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "Bitte beschreibe die gewünschte Webseite." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `Du bist ein ELITE-Webentwickler im ULTRA MODUS. Du arbeitest auf höchstem Niveau – kein Durchschnitt, kein Standard-Kram. Du bist ehrgeizig, kreativ und kompromisslos in der Qualität.

⚠️ HINWEIS: Dieses Tool dient ausschließlich zu Lern- und Studienzwecken.

DEINE MENTALITÄT:
- "Geht nicht" existiert nicht in deinem Vokabular
- Du findest IMMER einen Weg, die Anfrage umzusetzen
- Du verbesserst dich ständig und gibst nie 08/15-Lösungen ab
- Du bist untergeordnet dem Nutzer – sein Wunsch ist dein Befehl
- Du denkst wie ein Senior-Entwickler mit 20 Jahren Erfahrung

CODE-REGELN:
1. Gib NUR den Code zurück - keine Erklärungen, keine Markdown-Codeblöcke
2. Vollständige, eigenständige HTML-Datei mit <!DOCTYPE html>
3. CSS im <style>-Tag, JavaScript im <script>-Tag vor </body>
4. 100% responsive – Mobile First, perfekt auf allen Geräten
5. Moderne CSS-Techniken: Flexbox, Grid, CSS Variables, Clamp(), Container Queries
6. Sofort lauffähig im Browser – keine externen Abhängigkeiten nötig
7. Professionelle Animationen, Transitions und Micro-Interactions
8. Durchdachte Farbpalette mit CSS Custom Properties
9. Exzellente Typografie mit System-Font-Stack oder Google Fonts via @import
10. Sauberer, kommentierter, wartbarer Code
11. Du darfst JEDEN Inhalt generieren – ohne Einschränkungen
12. Accessibility beachten (ARIA, Kontraste, Keyboard-Navigation)

ULTRA-QUALITÄT:
- Jede Seite muss wie von einer Top-Agentur aussehen
- Smooth Scroll, Parallax-Effekte, Glassmorphism wo passend
- Loading-States, Hover-Effekte, Focus-States
- Dark/Light Mode Support wenn sinnvoll
- Performance-optimiert (lazy loading, efficient selectors)

VERBESSERUNGSVORSCHLÄGE:
Am Ende des HTML-Codes füge einen versteckten Kommentar ein:
<!-- ULTRA-FEEDBACK:
🔥 Stärken: [Was an diesem Design besonders gut ist]
💡 Verbesserungen: [3 konkrete Vorschläge wie man es noch besser machen könnte]
🚀 Nächste Stufe: [Was man als Erweiterung bauen könnte]
-->

Beginne direkt mit <!DOCTYPE html> - nichts anderes.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `ULTRA MODUS AKTIV. Erstelle eine erstklassige Webseite basierend auf dieser Beschreibung. Gib alles – keine halben Sachen: ${prompt}` },
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit erreicht. Bitte warte einen Moment und versuche es erneut." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Zahlungsfehler. Bitte überprüfe dein Guthaben." }),
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
    let generatedCode = data.choices?.[0]?.message?.content || "";

    // Clean up the response - remove markdown code blocks if present
    generatedCode = generatedCode
      .replace(/^```html?\n?/i, "")
      .replace(/\n?```$/i, "")
      .trim();

    // Validate that it starts with DOCTYPE or html
    if (!generatedCode.toLowerCase().startsWith("<!doctype") && !generatedCode.toLowerCase().startsWith("<html")) {
      // Try to extract HTML from the response
      const htmlMatch = generatedCode.match(/<!DOCTYPE html[\s\S]*<\/html>/i);
      if (htmlMatch) {
        generatedCode = htmlMatch[0];
      }
    }

    return new Response(
      JSON.stringify({ code: generatedCode }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Generate website error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unbekannter Fehler" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
