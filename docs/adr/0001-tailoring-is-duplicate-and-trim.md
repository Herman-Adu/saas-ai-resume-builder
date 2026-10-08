---
status: accepted
---

# Tailoring copies the master resume and the copy is independent

Users tailor by taking their complete resume and removing what a job does not need. We decided that Tailor makes a full copy that is independent of the master resume, rather than a linked variant or a set of show/hide toggles on one document.

A copy fits the current database schema, needs no sync or override rules, and lets many tailored versions exist at once. The cost is that later edits to the master resume do not flow into earlier copies. If users ask for that, we can introduce a linked master profile later as an additive change.

## Considered options

- **Linked master plus tailored variants.** Most powerful, but needs rules for which edits win. Deferred.
- **One resume with show/hide toggles.** Cannot hold several versions at once, so it fails the "one per application" use case.
