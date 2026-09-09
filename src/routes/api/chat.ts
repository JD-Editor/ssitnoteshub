import { createFileRoute } from "@tanstack/react-router";

type Msg = { role: "user" | "assistant"; content: string };

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as { messages?: Msg[]; context?: string };
        const messages = Array.isArray(body.messages) ? body.messages.slice(-12) : [];
        if (!messages.length) return new Response("Messages are required", { status: 400 });

        const key = process.env["LOVABLE_API_KEY"];
        if (!key) return new Response("AI is not configured", { status: 500 });

        const system = [
          "You are SSIT AI Assistant for the SSIT Notes Hub website (Shree Swaminarayan Institute of Technology, Gandhinagar).",
          "Students use the site for BCA, MCA and IT course material: semester-wise subjects, unit-wise textbook PDFs, practicals and previous year papers (PYQs).",
          "Answer briefly (under 150 words) in simple, student-friendly language. Use short markdown-free plain text with dashes for lists.",
          "NEVER invent notes, PDFs or files. Only mention resources listed in the site data below. If nothing matches, say: I couldn't find that resource on SSIT Notes Hub. Try searching with another subject or keyword.",
          "You may explain academic topics (e.g. DBMS, normalization) and give short study plans even without site resources.",
          "",
          "SITE DATA:",
          body.context ?? "(none)",
        ].join("\n");

        const res = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
          body: JSON.stringify({
            model: "openai/gpt-6-astra",
            reasoning: { effort: "low" },
            instructions: system,
            input: messages.map((m) => ({
              role: m.role,
              content: [
                { type: m.role === "user" ? "input_text" : "output_text", text: String(m.content) },
              ],
            })),
          }),
        });

        if (!res.ok) {
          const text = await res.text().catch(() => "");
          return new Response(text || "AI request failed", { status: res.status });
        }

        const data = (await res.json()) as {
          output_text?: string;
          output?: Array<{ content?: Array<{ type?: string; text?: string }> }>;
        };
        const reply =
          data.output_text ??
          data.output
            ?.flatMap((o) => o.content ?? [])
            .filter((c) => c.type === "output_text")
            .map((c) => c.text ?? "")
            .join("") ??
          "";

        return new Response(JSON.stringify({ reply: reply.trim() }), {
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});
