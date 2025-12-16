type ValidationResult =
  | { ok: true }
  | {
      ok: false;
      error: string;
    };

export function validateFramerOutput(output: string): ValidationResult {
  if (!output) return { ok: false, error: "Empty output" };

  const hasTypeHeader = output.includes("### Type");
  const typeMatch = output.match(/### Type\s+(Code Component|Code Override)/i);
  const orderedSections = /### Type\s+(Code Component|Code Override)\s+### Description[\s\S]+?### Code\s+```tsx[\s\S]+?```[\s\S]*?Usage Notes/i.test(
    output
  );
  const hasDescription = /### Description/i.test(output);
  const hasCode = /### Code/i.test(output);
  const hasTsxFence = /```tsx[\s\S]+```/im.test(output);
  const hasUsageNotes = /Usage Notes/i.test(output);
  const hasUsageBullets = /Usage Notes[\s\S]*?(?:- |\u2022 )/i.test(output);
  const hasPropertyControls =
    /(propertyControls|addPropertyControls)/i.test(output);
  const hasDefaultExport = /export default/i.test(output);

  if (!hasTypeHeader || !typeMatch) {
    return { ok: false, error: "Missing Type section or invalid type value" };
  }
  if (!orderedSections) {
    return {
      ok: false,
      error: "Sections must be ordered: Type → Description → Code → Usage Notes",
    };
  }
  if (!hasDescription) {
    return { ok: false, error: "Missing Description section" };
  }
  if (!hasCode || !hasTsxFence) {
    return { ok: false, error: "Code block missing or not TSX fenced" };
  }
  if (!hasUsageNotes || !hasUsageBullets) {
    return { ok: false, error: "Usage Notes missing or not bulletized" };
  }
  if (!hasPropertyControls) {
    return { ok: false, error: "Property Controls not found" };
  }
  if (!hasDefaultExport) {
    return { ok: false, error: "Default export missing" };
  }

  return { ok: true };
}

