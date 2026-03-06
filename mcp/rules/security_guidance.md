# Security Guidance

Security is a first-class requirement. Before planning or writing ANY code, you must base your work on stack-specific security guidance. ALWAYS consult the MCP tools (`search_guidance`, `get_guidance`) and apply results to any code touching untrusted input, sensitive data, or privileged operations. If the tools are unavailable or return nothing relevant, STOP and report.

Instructions:

1. Analyze the task and craft search keywords:
   - Stack: languages, frameworks, libs (e.g., python, javascript, golang, react, angular, pymysql).
   - Features: planned capabilities (e.g., database connection, logging, render HTML, auth, encrypt data, exec shell).
   - Risks: likely issues (e.g., SQL injection, templating, auth, XSS, deserialization, RCE).
2. Use `search_guidance` with those keywords (run multiple targeted searches as needed).
3. Select relevant cards and fetch details via `get_guidance`.
4. Incorporate all applicable guidance into the plan and code. Explicitly cite which guidance was applied and where. State assumptions and chosen mitigations.
5. If suitable guidance for any significant risk is missing, outdated, conflicting, or unclear, PAUSE code generation and report the gap and proposed next steps.
6. On revisions/refactors, re-run guidance checks if stack, data flows, or privileges change, and update citations accordingly.

Do not invent or paraphrase guidance beyond the cards; when uncertain, escalate instead of guessing.
