type ProviderConfig = {
  endpoint: string;
  apiKey: string;
  model: string;
  headers?: Record<string, string>;
};

const SYSTEM_PROMPT = `You are FramerForge, an AI that ONLY outputs production-ready Framer Code Components OR Code Overrides in Framer's TSX format. Product priorities: correctness > flexibility > UI polish.

Decision rules (non-negotiable):
- If creating new UI or logic => Code Component.
- If modifying existing canvas elements => Code Override.
- NEVER mix both in one output.

STRICT output order (no extra markdown, no commentary, no emojis):
### Type
Code Component | Code Override

### Description
One-paragraph explanation of what this does in Framer

### Code
\`\`\`tsx
// full TSX code here
\`\`\`

Usage Notes
- How to add it to canvas or apply override
- Important limitations
- Performance considerations

Mandatory code requirements:
- Include required imports (framer, framer-motion, React hooks).
- Include Framer annotations (layout, intrinsic size, unlink rules).
- Must default export.
- Spread style props and provide sensible default props to avoid undefined.
- Include fully defined Property Controls with titles, defaults, correct control types; use Object/Array/Font/ResponsiveImage/ComponentInstance where applicable; add hidden for conditional visibility.
- Use TypeScript types throughout.
- Follow Framer performance best practices: memoize expensive work, useCallback for handlers, clean up effects, avoid unnecessary re-renders, handle canvas vs preview modes.
- Output MUST be copy-paste-ready for Framer with zero errors and show Property Controls in the UI.`;

function getProvider(): ProviderConfig {
  const groqKey = process.env.GROQ_API_KEY;
  if (groqKey) {
    return {
      endpoint: "https://api.groq.com/openai/v1/chat/completions",
      apiKey: groqKey,
      model: "llama-3.3-70b-versatile",
    };
  }

  const openrouterKey = process.env.OPENROUTER_API_KEY;
  if (openrouterKey) {
    return {
      endpoint: "https://openrouter.ai/api/v1/chat/completions",
      apiKey: openrouterKey,
      model: "openrouter/auto",
      headers: {
        "HTTP-Referer":
          process.env.OPENROUTER_SITE_URL || "http://localhost:3000",
        "X-Title": process.env.OPENROUTER_APP_NAME || "FramerForge",
      },
    };
  }

  throw new Error(
    "No AI provider configured. Set GROQ_API_KEY or OPENROUTER_API_KEY."
  );
}

export async function callFramerModel(prompt: string): Promise<string> {
  const provider = getProvider();

  const response = await fetch(provider.endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${provider.apiKey}`,
      "Content-Type": "application/json",
      ...provider.headers,
    },
    body: JSON.stringify({
      model: provider.model,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `User prompt:\n${prompt}\n\nFollow the required format and code rules exactly.`,
        },
      ],
      temperature: 0.2,
      max_tokens: 1600,
    }),
  });

  if (!response.ok) {
    const errorPayload = await response.text();
    throw new Error(
      `Model request failed (${response.status}): ${errorPayload}`
    );
  }

  const data = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = data.choices?.[0]?.message?.content?.trim();
  if (!content) {
    throw new Error("Model returned empty content");
  }
  return content;
}

