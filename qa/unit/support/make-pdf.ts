// Builds tiny but valid PDFs so tests read real bytes instead of mocking the
// parser. Offsets are computed, so the cross-reference table is correct.

function escapeText(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function buildPdf(contentStream: string): Uint8Array {
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>",
    `<< /Length ${contentStream.length} >>\nstream\n${contentStream}\nendstream`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  ];

  let body = "%PDF-1.4\n";
  const offsets: number[] = [];

  objects.forEach((object, index) => {
    offsets.push(body.length);
    body += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const xrefStart = body.length;
  body += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const offset of offsets) {
    body += `${String(offset).padStart(10, "0")} 00000 n \n`;
  }
  body += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF\n`;

  return new TextEncoder().encode(body);
}

export function makeTextPdf(lines: string[]): Uint8Array {
  const text = lines.map((line) => `(${escapeText(line)}) Tj T*`).join("\n");
  return buildPdf(`BT /F1 11 Tf 50 750 Td 14 TL\n${text}\nET`);
}

// A page with no text at all, like a scanned CV that is only an image.
export function makeBlankPdf(): Uint8Array {
  return buildPdf("");
}

export const sampleCvLines = [
  "Jane Doe",
  "Senior Software Engineer",
  "London, United Kingdom  jane@example.com  +44 7000 000000",
  "SUMMARY",
  "Engineer with ten years of experience building web platforms for retail and finance.",
  "EXPERIENCE",
  "Senior Software Engineer, Acme Ltd, Jan 2020 - Present",
  "Led a team of six engineers and cut page load time by forty percent.",
  "Built a payments service that processes two million transactions each month.",
  "Software Engineer, Globex, Jun 2015 - Dec 2019",
  "Shipped a customer portal used by thirty thousand people every week.",
  "EDUCATION",
  "BSc Computer Science, University of Leeds, 2011 - 2014",
  "SKILLS",
  "TypeScript, React, Node.js, PostgreSQL, AWS",
];
