---
status: accepted
---

# Import is PDF-only and does not use any LinkedIn API

Version 1 imports text-based PDFs only. LinkedIn users reach it through LinkedIn's own "Save to PDF", which produces a normal PDF.

LinkedIn has no public API for reading a member's profile, and scraping breaks its terms, so a "connect LinkedIn" button is not a legitimate option. Its data-export ZIP is structured and would need no AI, but it is a second format to support. DOCX, scanned or image PDFs, and pasted text are also out of scope for now; each can be added behind the same Review step later.

## Consequences

- The extraction is never trusted blindly: every import ends in Review inside the normal editor.
- A scanned PDF with no text layer must fail with a clear message, not produce an empty resume.
