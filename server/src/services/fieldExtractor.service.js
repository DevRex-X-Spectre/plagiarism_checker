const NOISE_PATTERNS = [
  /^(UNIVERSITY|INSTITUTE|COLLEGE|FACULTY|SCHOOL)\s+OF/i,
  /^DEPARTMENT\s+OF/i,
  /^TABLE\s+OF\s+CONTENTS/i,
  /^CHAPTER\s+(ONE|TWO|THREE|FOUR|FIVE|\d+)/i,
  /^REFERENCES$/i,
  /^BIBLIOGRAPHY$/i,
  /^APPENDIX/i,
  /^\d+\s*\.\s*$/,
];

const HEADING_PATTERNS = [
  /^(?:CHAPTER|INTRODUCTION|BACKGROUND|LITERATURE|METHODOLOGY|RESULTS|DISCUSSION|CONCLUSION|REFERENCES|BIBLIOGRAPHY|APPENDIX|TABLE OF CONTENTS)/i,
  /^(?:\d+\.?\s+[A-Z])/,
  /^(?:I+\.?|II|III|IV|V|VI|VII|VIII|IX|X)\.\s+[A-Z]/,
];

const DEPT_PATTERNS = [
  /(?:DEPARTMENT OF|DEPT\.?\s+OF)\s+([A-Za-z][A-Za-z &]+?)(?:\s*,|\r?\n|$)/i,
  /FACULTY\s+OF\s+([A-Za-z][A-Za-z &]+?)(?:\s*,|\r?\n|$)/i,
];

export function extractFields(rawText) {
  const lines = rawText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const currentYear = new Date().getFullYear();

  let title = '';
  let abstract = '';
  let authorName = '';
  let department = '';
  let year = null;

  // Extract title — first non-noise line > 10 chars
  for (let i = 0; i < Math.min(15, lines.length); i++) {
    const line = lines[i];
    if (line.length < 10) continue;
    const isNoise = NOISE_PATTERNS.some(p => p.test(line));
    if (!isNoise) {
      title = line;
      break;
    }
  }

  // Extract abstract — section between ABSTRACT and next heading
  const abstractStartIdx = lines.findIndex(l => /^\s*ABSTRACT\s*$/i.test(l));
  if (abstractStartIdx !== -1) {
    const abstractLines = [];
    for (let i = abstractStartIdx + 1; i < lines.length; i++) {
      const line = lines[i];
      const isHeading = HEADING_PATTERNS.some(p => p.test(line));
      if (isHeading) break;
      abstractLines.push(line);
    }
    abstract = abstractLines.join(' ').trim();
    if (abstract.length > 2000) {
      abstract = abstract.slice(0, 2000);
    }
  }

  // Extract author — line after title with 2-4 capitalized words
  const titleIdx = lines.indexOf(title);
  if (titleIdx !== -1) {
    for (let i = titleIdx + 1; i < Math.min(titleIdx + 5, lines.length); i++) {
      const line = lines[i];
      const byMatch = line.match(/^BY\s+(.+)/i);
      if (byMatch) {
        authorName = byMatch[1].trim();
        break;
      }
      const words = line.split(/\s+/);
      if (words.length >= 2 && words.length <= 4 && words.every(w => /^[A-Z][a-z]+$/.test(w))) {
        authorName = line;
        break;
      }
    }
  }

  // Extract department
  for (const pattern of DEPT_PATTERNS) {
    const match = rawText.match(pattern);
    if (match) {
      department = match[1].trim();
      break;
    }
  }

  // Extract year — first 4-digit year in range 2000–current+1
  const yearMatch = rawText.match(/\b(20\d{2})\b/);
  if (yearMatch) {
    const candidate = parseInt(yearMatch[1], 10);
    if (candidate >= 2000 && candidate <= currentYear + 1) {
      year = candidate;
    }
  }

  return {
    title,
    abstract,
    authorName,
    department,
    year,
  };
}
