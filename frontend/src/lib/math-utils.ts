/**
 * Helper to preprocess text containing LaTeX block equations \[ ... \]
 * and inline equations \( ... \) by replacing them with $$ ... $$
 * and $ ... $ which are understood natively by remark-math.
 */
export function preprocessMath(text: string | null | undefined): string {
  if (!text) return '';
  return text
    .replace(/\\\[/g, '$$$$')
    .replace(/\\\]/g, '$$$$')
    .replace(/\\\(/g, '$$')
    .replace(/\\\)/g, '$$');
}

/**
 * Helper to preprocess chat tutor responses to ensure list items, emoji lists,
 * and key concepts are well-spaced, structured, and not compressed.
 */
export function preprocessTutorResponse(text: string | null | undefined): string {
  if (!text) return '';
  
  // 1. First, preprocess LaTeX equations
  let processed = preprocessMath(text);
  
  // 2. Normalize single newlines before list items or steps to double newlines
  processed = processed.replace(/\n\s*([0-9]+\.\s+[A-Z])/g, '\n\n$1');
  processed = processed.replace(/\n\s*([0-9])\ufe0f?\u20e3/g, '\n\n$1');
  processed = processed.replace(/\n\s*(Step\s+\d+:)/gi, '\n\n$1');
  
  // 3. If list items or step markers are inline (no newline) but preceded by punctuation and space, split them
  processed = processed.replace(/([.!?])\s+([0-9]+\.\s+[A-Z])/g, '$1\n\n$2');
  processed = processed.replace(/([.!?])\s+([0-9])\ufe0f?\u20e3/g, '$1\n\n$2');
  processed = processed.replace(/([.!?])\s+(Step\s+\d+:)/gi, '$1\n\n$2');
  
  // 4. Format emoji list numbers (e.g. 1️⃣, 2️⃣) as proper markdown list items (e.g. 1. 1️⃣ )
  processed = processed.replace(/([0-9])\ufe0f?\u20e3/g, '\n\n$1. $&');
  
  // 5. Clean up any accidental triple newlines or excessive spacing
  processed = processed.replace(/\n{3,}/g, '\n\n');
  
  return processed.trim();
}

