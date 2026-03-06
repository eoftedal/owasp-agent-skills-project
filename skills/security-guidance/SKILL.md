---
name: security-guidance
description: Security-first development guidance based on OWASP ASVS (Application Security Verification Standard). Use this skill automatically when planning or implementing any code that touches user input, authentication, data persistence, network communication, file I/O, cryptography, or access control. This skill ensures all generated code adheres to industry-standard security practices with explicit references to applied guidance.
---

# Security Guidance

## Core Principle

Security is a first-class requirement. Before completing any plan or producing any code that touches security-sensitive operations, consult the ASVS reference index below and apply all relevant guidance.

**All generated code and plans must demonstrably adhere to the selected guidance, with safe defaults and explicit inline citations.**

## Workflow

1. **Identify relevant sections** — Match the current task against the `When to use:` triggers in the index below. A task may match multiple sections; apply all of them.
2. **Read the reference file** — For each matched section, read the full reference file listed at the end of its index entry to get the complete verification requirements.
3. **Apply the guidance** — Implement the requirements. Default to the most secure option when the requirements allow choice. Apply all Level 1 requirements as a minimum baseline; note any Level 2 or Level 3 requirements that are relevant but not yet implemented.
4. **Cite applied requirements inline** — In code comments or plan notes, reference each requirement you satisfy: `// ASVS 6.2.4: password checked against top-3000 list`.

## Escalation

If no section in the index matches a task that involves security-sensitive operations, or if guidance is conflicting or unclear, **stop and flag the gap** before proceeding. Do not guess or paraphrase guidance — escalate instead.

If the index below is empty, report that the reference index failed to load and list which ASVS chapters are likely relevant based on the task description.

## Reference Index

! expand.sh
