---
status: accepted
---

# Uploaded CV files are read in memory and never stored

When a user imports a PDF, we read its text in memory, store only the structured result, and discard the file in the same request. We do not write the original to Vercel Blob or any other storage.

A CV is dense personal data (address, phone, work history). Not keeping the file means less to protect, no retention or deletion obligations for the original, and a simpler UK GDPR position. The cost is that we cannot re-run extraction on the original later; the user re-uploads instead.

The text sent to the AI provider for extraction is personal data too, so the provider must not train on it, and import is limited to paid plans.
