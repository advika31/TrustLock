Design notes — TrustLock theme

- Primary usage: Use `--color-primary` (the warm pink) for high-impact CTAs, interactive primary buttons, and micro-affirmations (success badges, inline highlights). For text on `--color-primary` use `--on-primary` to ensure readable foreground.
- Secondary usage: Use `--color-secondary` (calm indigo) for links, focus borders, non-primary actions, and information accents. `--accent-gradient` and `--brand-gradient` are ideal for hero backgrounds and prominent CTAs.

- When to use gradients: Reserve `--brand-gradient` for hero banners and primary CTAs that benefit from a subtle, layered brand expression. Use `--accent-gradient` for supporting accent surfaces (cards, promotional chips). Avoid heavy use of gradients on small UI chrome — prefer solid tokens for accessibility.

- Microcopy & sizing rules:
  - Headings: follow a clear scale (H1 ~ 2rem, H2 ~ 1.5rem, H3 ~ 1.25rem) — keep headings at least 18px for readability.
  - Body text: use `--color-on-surface` at 16px (1rem) for primary body copy; muted helper text use `--color-on-surface-muted`.

Rationale (2 lines): We chose a warm pink accent to deliver a human, friendly call-to-action voice, paired with an indigo trust color for links and focus. The palette emphasizes accessible contrast, neutral surfaces, and clear semantic tokens so components can rely on predictable tokens rather than raw hex values.
