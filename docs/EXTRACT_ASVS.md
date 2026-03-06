# ASVS Reference Extraction

## Purpose

This document describes how OWASP ASVS verification chapters are processed into per-subsection reference files under `references/ASVS/`.

The goal is to help AI coding agents know _when_ to pull in ASVS security guidance — framed in terms of **programming tasks** (e.g., "when communicating with a database") rather than security threats (e.g., "to prevent SQL injection"). This framing lets agents match guidance to what they are currently building, not to abstract attack categories.

## Source

Files matching `0x[0-9][0-9]-V*.md` in a checked-out ASVS repository. The source path is configured at the top of `scripts/extract_asvs.py`.

## Output

- **Directory**: `references/ASVS/`
- **Naming**: `V{N}.{M}.md` (e.g., `V1.2.md`, `V10.3.md`)
- **One file per subsection** — each `## VN.M` heading in a chapter becomes its own file

### Output file structure

```
---
title: "VN.M Section Title"
asvs_chapter: "VN.M"
when_to_use:
  - <programming task trigger>
  - ...
threats:
  - <short threat name>
  - ...
summary: "<one-line description of what the section covers>"
---

# VN.M Section Title

<original section content verbatim — not modified>
```

The chapter-level **Control Objective** intro is prepended (verbatim) to the first subsection (VN.1) of each chapter to provide context.

### Front matter fields

| Field         | Purpose                                                                                                                                                                                                           |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `when_to_use` | Task-oriented triggers — what the developer is currently building (e.g., "building database queries"). Helps agents fetch guidance proactively.                                                                   |
| `threats`     | Short names of attack categories this section mitigates (e.g., "SQL injection", "CSRF"). Complementary to `when_to_use`; useful when an agent is reasoning about what risks apply to code it has already written. |
| `summary`     | One sentence describing what the section covers.                                                                                                                                                                  |

## Writing front matter

### when_to_use

Describes **what the developer is building or doing** when they should consult this section.

- Use concrete, recognizable programming activities: "building database queries", "implementing file upload", "configuring TLS"
- Match the vocabulary a developer uses when describing their task, not the security vocabulary in the ASVS text
- Prefer specific triggers over general ones — "implementing OAuth authorization code flow" is more useful than "implementing authentication"
- A section can have multiple triggers covering different entry points to the same guidance

**Good:**

```yaml
when_to_use:
  - building database queries (SQL, NoSQL, HQL, Cypher, XPath)
  - constructing OS commands or shell scripts with dynamic data
  - generating CSV or spreadsheet exports with user data
```

**Avoid:**

```yaml
when_to_use:
  - preventing SQL injection # threat-oriented, not task-oriented
  - protecting against CSRF # same problem
  - securing the application # too vague to be useful
```

### threats

Short, recognizable names for the attack categories this section helps mitigate. Complementary to `when_to_use` — useful when an agent is reviewing code it has already written and needs to reason about what risks might apply.

- Use well-known names: "SQL injection", "XSS", "CSRF", "path traversal", "IDOR"
- Keep each entry brief — a threat name, not a description
- 2–5 threats per section is typical; documentation-only sections may have just one meta-risk

**Good:**

```yaml
threats:
  - SQL injection
  - OS command injection
  - LDAP injection
```

**Avoid:**

```yaml
threats:
  - attackers can manipulate database queries # description, not a name
  - injection # too vague
```

## Front matter reference (ASVS v.5.0.0)

The table below documents the `when_to_use` triggers for each section. The `threats` field is maintained in `scripts/extract_asvs.py` alongside the `when_to_use` values. Update both when you update the script.

### V1 – Encoding and Sanitization

| Section                                     | when_to_use                                                                                                                                                                                                                                                                                                                                                                                                      |
| ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| V1.1 Encoding and Sanitization Architecture | designing a data processing pipeline that handles untrusted input; deciding where in the request/response lifecycle to encode or escape data; storing data that will later be rendered in different output contexts                                                                                                                                                                                              |
| V1.2 Injection Prevention                   | building database queries (SQL, NoSQL, HQL, Cypher, XPath); constructing OS commands or shell scripts with dynamic data; building URLs or redirects with user-supplied values; rendering user input inside HTML, CSS, or JavaScript; building LDAP queries; processing LaTeX input; evaluating regular expressions containing user-supplied patterns; generating CSV, XLS, or spreadsheet exports with user data |
| V1.3 Sanitization                           | accepting rich text or HTML input from users (e.g., WYSIWYG editors); using eval() or dynamic code execution with user-supplied content; rendering user-submitted markup where encoding alone is insufficient                                                                                                                                                                                                    |
| V1.4 Memory, String, and Unmanaged Code     | writing or integrating unmanaged code (C, C++, assembly); using unsafe memory operations, pointer arithmetic, or raw buffers; calling native libraries or FFI from a managed language                                                                                                                                                                                                                            |
| V1.5 Safe Deserialization                   | deserializing objects or data structures from untrusted sources; accepting serialized data via network, file upload, or API payloads; using Java serialization, Python pickle, PHP unserialize, or similar mechanisms                                                                                                                                                                                            |

### V2 – Validation and Business Logic

| Section                      | when_to_use                                                                                                                                             |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| V2.1 Documentation           | documenting what inputs an application accepts; defining business rules and workflow constraints                                                        |
| V2.2 Input Validation        | processing any user-supplied input at an application boundary; validating types, formats, lengths, or value ranges                                      |
| V2.3 Business Logic Security | implementing multi-step workflows or transaction sequences; enforcing ordering or timing constraints; handling financial transactions or state machines |
| V2.4 Anti-automation         | adding rate limiting to endpoints; protecting against automated abuse or credential stuffing; implementing CAPTCHA or bot detection                     |

### V3 – Web Frontend Security

| Section                                    | when_to_use                                                                          |
| ------------------------------------------ | ------------------------------------------------------------------------------------ |
| V3.1 Documentation                         | documenting security decisions for a web frontend application                        |
| V3.2 Unintended Content Interpretation     | serving user-uploaded files; setting Content-Type headers; preventing MIME-sniffing  |
| V3.3 Cookie Setup                          | setting cookies in HTTP responses; configuring HttpOnly, Secure, SameSite attributes |
| V3.4 Browser Security Mechanism Headers    | setting HTTP security headers (CSP, HSTS, X-Frame-Options, etc.)                     |
| V3.5 Browser Origin Separation             | configuring CORS policies; implementing CSRF protection; using postMessage           |
| V3.6 External Resource Integrity           | loading third-party scripts or styles from CDNs; using subresource integrity (SRI)   |
| V3.7 Other Browser Security Considerations | browser storage (localStorage, sessionStorage, IndexedDB); service workers           |

### V4 – API and Web Service

| Section                                | when_to_use                                                              |
| -------------------------------------- | ------------------------------------------------------------------------ |
| V4.1 Generic Web Service Security      | building or consuming HTTP-based APIs; implementing REST endpoints       |
| V4.2 HTTP Message Structure Validation | parsing HTTP request headers, query parameters, or body                  |
| V4.3 GraphQL                           | implementing a GraphQL API, schema, queries, mutations, or subscriptions |
| V4.4 WebSocket                         | implementing WebSocket connections or servers                            |

### V5 – File Handling

| Section                      | when_to_use                                                      |
| ---------------------------- | ---------------------------------------------------------------- |
| V5.1 Documentation           | documenting file upload or download features                     |
| V5.2 File Upload and Content | implementing file upload; validating file type, size, or content |
| V5.3 File Storage            | storing files on disk or object storage; constructing file paths |
| V5.4 File Download           | serving files for download; setting Content-Disposition headers  |

### V6 – Authentication

| Section                              | when_to_use                                                                         |
| ------------------------------------ | ----------------------------------------------------------------------------------- |
| V6.1 Documentation                   | documenting authentication mechanisms                                               |
| V6.2 Password Security               | implementing password-based login; storing or verifying passwords                   |
| V6.3 General Authentication Security | any authentication mechanism; login flows; credential verification                  |
| V6.4 Factor Lifecycle and Recovery   | account recovery or password reset flows; managing authentication factors           |
| V6.5 General MFA Requirements        | adding MFA; implementing TOTP or hardware keys                                      |
| V6.6 Out-of-Band Authentication      | SMS, email, or push notification-based authentication                               |
| V6.7 Cryptographic Authentication    | certificate-based auth; FIDO2, WebAuthn, passkeys                                   |
| V6.8 Authentication with IdP         | integrating with an external identity provider; social login; SAML, OIDC federation |

### V7 – Session Management

| Section                             | when_to_use                                                 |
| ----------------------------------- | ----------------------------------------------------------- |
| V7.1 Documentation                  | documenting session management design                       |
| V7.2 Fundamental Session Security   | issuing session tokens or cookies after authentication      |
| V7.3 Session Timeout                | implementing session expiry or idle timeout                 |
| V7.4 Session Termination            | implementing logout; invalidating sessions server-side      |
| V7.5 Defenses Against Session Abuse | protecting against session fixation, hijacking, or replay   |
| V7.6 Federated Re-authentication    | sessions in federated SSO environments; single logout (SLO) |

### V8 – Authorization

| Section                                 | when_to_use                                                                     |
| --------------------------------------- | ------------------------------------------------------------------------------- |
| V8.1 Documentation                      | documenting access control rules and permission models                          |
| V8.2 General Authorization Design       | controlling access to resources; implementing RBAC/ABAC; preventing IDOR        |
| V8.3 Operation Level Authorization      | enforcing authorization server-side; handling permission changes; microservices |
| V8.4 Other Authorization Considerations | multi-tenant applications; administrative interfaces                            |

### V9 – Self-contained Tokens

| Section                         | when_to_use                                                                     |
| ------------------------------- | ------------------------------------------------------------------------------- |
| V9.1 Token Source and Integrity | validating JWTs; verifying token signatures; configuring accepted algorithms    |
| V9.2 Token Content              | defining JWT claims; setting expiry, audience, issuer; minimizing token payload |

### V10 – OAuth and OIDC

| Section                               | when_to_use                                                   |
| ------------------------------------- | ------------------------------------------------------------- |
| V10.1 Generic OAuth and OIDC Security | any OAuth 2.0 or OIDC flow                                    |
| V10.2 OAuth Client                    | requesting access tokens; authorization code flow; PKCE       |
| V10.3 OAuth Resource Server           | APIs that accept and validate OAuth access tokens             |
| V10.4 OAuth Authorization Server      | implementing or configuring an authorization server           |
| V10.5 OIDC Client                     | OpenID Connect login in a relying party; validating ID tokens |
| V10.6 OpenID Provider                 | implementing an OpenID Provider; issuing ID tokens            |
| V10.7 Consent Management              | OAuth consent screens; managing user consent decisions        |

### V11 – Cryptography

| Section                                | when_to_use                                                            |
| -------------------------------------- | ---------------------------------------------------------------------- |
| V11.1 Inventory and Documentation      | documenting cryptographic choices; planning PQC migration              |
| V11.2 Secure Implementation            | implementing cryptographic operations; choosing crypto libraries       |
| V11.3 Encryption Algorithms            | encrypting or decrypting data; choosing algorithms and modes           |
| V11.4 Hashing and Hash-based Functions | hashing for integrity; HMACs; choosing hash algorithms                 |
| V11.5 Random Values                    | generating random tokens, nonces, salts, or keys                       |
| V11.6 Public Key Cryptography          | asymmetric signing/verification; RSA/EC encryption; digital signatures |
| V11.7 In-Use Data Cryptography         | protecting data in memory; confidential computing; secure enclaves     |

### V12 – Secure Communication

| Section                                | when_to_use                                                               |
| -------------------------------------- | ------------------------------------------------------------------------- |
| V12.1 General TLS Security             | configuring TLS; selecting versions and cipher suites                     |
| V12.2 HTTPS with External Services     | public-facing HTTP endpoints; TLS certificates for external services      |
| V12.3 Service-to-Service Communication | internal service communication; connecting to databases or backends; mTLS |

### V13 – Configuration

| Section                                   | when_to_use                                                      |
| ----------------------------------------- | ---------------------------------------------------------------- |
| V13.1 Documentation                       | documenting security configuration decisions                     |
| V13.2 Backend Communication Configuration | configuring outbound connections to databases, APIs, or services |
| V13.3 Secret Management                   | storing or accessing secrets, API keys, or credentials           |
| V13.4 Unintended Information Leakage      | configuring error pages; disabling debug output in production    |

### V14 – Data Protection

| Section                           | when_to_use                                                                     |
| --------------------------------- | ------------------------------------------------------------------------------- |
| V14.1 Documentation               | classifying data sensitivity; documenting protection requirements for PII       |
| V14.2 General Data Protection     | storing or transmitting PII; preventing data leakage into URLs, logs, or caches |
| V14.3 Client-side Data Protection | browser storage; client-side caching; sensitive data in mobile/desktop clients  |

### V15 – Secure Coding and Architecture

| Section                                      | when_to_use                                                                  |
| -------------------------------------------- | ---------------------------------------------------------------------------- |
| V15.1 Documentation                          | managing third-party dependencies; documenting risky components              |
| V15.2 Security Architecture and Dependencies | updating libraries; sandboxing risky components; supply chain security       |
| V15.3 Defensive Coding                       | dynamic execution or reflection; memory safety; security-critical code paths |
| V15.4 Safe Concurrency                       | multi-threaded code; shared state; locks and synchronization primitives      |

### V16 – Security Logging and Error Handling

| Section               | when_to_use                                                               |
| --------------------- | ------------------------------------------------------------------------- |
| V16.1 Documentation   | designing a logging strategy                                              |
| V16.2 General Logging | implementing application logging; log formats and output                  |
| V16.3 Security Events | logging auth events; recording access control failures; audit trails      |
| V16.4 Log Protection  | protecting logs from tampering; centralized or immutable log stores       |
| V16.5 Error Handling  | error handling and exception management; error responses to users or APIs |

### V17 – WebRTC

| Section           | when_to_use                                                       |
| ----------------- | ----------------------------------------------------------------- |
| V17.1 TURN Server | operating or configuring a TURN server for NAT traversal          |
| V17.2 Media       | hosting a WebRTC media server (SFU, MCU, recording server)        |
| V17.3 Signaling   | implementing a WebRTC signaling server; SDP offer/answer exchange |
