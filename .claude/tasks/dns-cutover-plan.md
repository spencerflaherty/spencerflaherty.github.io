# DNS Cutover Plan: Squarespace to GitHub Pages

**Domain:** spencerflaherty.com
**Registrar:** GoDaddy
**Target:** GitHub Pages (`spencerflaherty/spencerflaherty.github.io`)
**Est. total time:** 30 min hands-on + 1-24 hrs waiting on DNS/cert

---

## 1. Pre-Cutover Checks

Do every one of these BEFORE touching DNS. A failed precheck = aborted cutover.

- [ ] **Repo is live at** `https://spencerflaherty.github.io` and renders correctly.
- [ ] **`CNAME` file committed to repo root** containing exactly one line: `spencerflaherty.com` (no `www`, no protocol, no trailing newline issues). Without this file, GitHub Pages will 404 traffic from the custom domain. The Eleventy build must copy this file into the site output (verify by checking the deployed artifact or the `_site`/`dist` directory).
- [ ] **`.github/workflows/deploy.yml`** does not overwrite or delete the `CNAME` file on deploy. If Eleventy's output directory is published, add `CNAME` to Eleventy's passthrough copy config.
- [ ] **GitHub Pages settings** (repo → Settings → Pages): Source is "GitHub Actions" (since you're deploying via workflow). Custom domain field will be set LATER, after DNS propagates.
- [ ] **Sveltia OAuth app**: Register the GitHub OAuth application's callback URL using the future custom domain, e.g. `https://spencerflaherty.com/admin/`. If it currently points to `spencerflaherty.github.io`, add the apex domain as a second callback (OAuth apps support multiple callback URLs via comma-separation on GitHub, or register a second app). Don't remove the `.github.io` one until cutover is confirmed working.
- [ ] **TTL pre-lowering (optional but recommended):** 24 hours before cutover, lower TTL on current Squarespace records at GoDaddy from default (1 hour) to **600 seconds** (10 min). This makes rollback faster if needed.
- [ ] **Capture a backup** of current GoDaddy DNS: screenshot every record in the DNS Management page. This is your rollback blueprint.

---

## 2. Exact GoDaddy DNS Records

GitHub's current apex IPs (verified against `docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site`):

```
185.199.108.153
185.199.109.153
185.199.110.153
185.199.111.153
```

In GoDaddy, go to **My Products → Domains → spencerflaherty.com → DNS** (new UI as of late 2025 labels this "DNS" under the domain's control panel, not "Manage DNS"). Delete the existing Squarespace A records (currently pointing to `198.49.23.x` / `198.185.159.x`) and the `www` CNAME (currently `ext-sq.squarespace.com`), then add:

| Type | Name / Host | Value | TTL |
|---|---|---|---|
| A | `@` | `185.199.108.153` | 600 |
| A | `@` | `185.199.109.153` | 600 |
| A | `@` | `185.199.110.153` | 600 |
| A | `@` | `185.199.111.153` | 600 |
| AAAA | `@` | `2606:50c0:8000::153` | 600 |
| AAAA | `@` | `2606:50c0:8001::153` | 600 |
| AAAA | `@` | `2606:50c0:8002::153` | 600 |
| AAAA | `@` | `2606:50c0:8003::153` | 600 |
| CNAME | `www` | `spencerflaherty.github.io.` | 600 |

Notes:
- GoDaddy uses `@` to represent the apex (root). Do NOT type `spencerflaherty.com` into the Name field.
- GoDaddy does NOT support ALIAS/ANAME records. You must use A records for the apex — this is the supported GitHub Pages configuration.
- Leave MX records alone if you use custom email; those are unrelated.
- After saving, GoDaddy's new UI shows a confirmation banner. Changes apply within ~1 min at GoDaddy's edge; downstream propagation depends on TTL.

---

## 3. GitHub Pages Settings

Once `dig spencerflaherty.com` returns the `185.199.x.x` IPs (see Section 5):

1. Repo → **Settings → Pages**.
2. Under **Custom domain**, enter `spencerflaherty.com` and click Save.
3. GitHub runs a DNS check. Green check = good. If it fails, wait 15 min and retry — don't panic.
4. GitHub provisions a Let's Encrypt cert automatically. Takes **5-30 min typically, up to 24 hrs worst case**.
5. Once the cert is issued, the **Enforce HTTPS** checkbox becomes enabled. Tick it.
6. Confirm `CNAME` file in repo now matches `spencerflaherty.com` (GitHub may auto-commit this; if your workflow overwrites it, commit it manually to the source).

---

## 4. Apex vs www Strategy

**Recommendation: apex (`spencerflaherty.com`) as canonical**, with `www` redirecting to it.

Reason: it's what's already in use, it's shorter, and GitHub Pages handles the www→apex redirect automatically when the custom domain is set to the apex and a `www` CNAME exists. No extra config needed.

Pros of apex-canonical: cleaner URL, matches existing SEO/backlinks, one less hop.
Cons: apex A records can't use CDN failover the way a CNAME can — not relevant for GitHub Pages.

With the DNS records above + `spencerflaherty.com` set as the custom domain in GitHub Pages, visits to `www.spencerflaherty.com` automatically 301 to `https://spencerflaherty.com`.

---

## 5. Verification Steps

Run these in order. Don't proceed to the next until the current one passes.

```bash
# 1. DNS propagation — apex
dig +short spencerflaherty.com
# Expect: the four 185.199.x.153 IPs

# 2. DNS propagation — www
dig +short www.spencerflaherty.com
# Expect: spencerflaherty.github.io. followed by the four IPs

# 3. From outside your ISP's cache
dig @8.8.8.8 spencerflaherty.com +short
dig @1.1.1.1 spencerflaherty.com +short

# 4. HTTPS serves without cert warning
curl -I https://spencerflaherty.com
# Expect: HTTP/2 200, server: GitHub.com

# 5. www redirects to apex
curl -I https://www.spencerflaherty.com
# Expect: HTTP/2 301, location: https://spencerflaherty.com/

# 6. HTTP redirects to HTTPS
curl -I http://spencerflaherty.com
# Expect: 301 to https://
```

- [ ] Visit `https://spencerflaherty.com` in an incognito window — site loads, padlock is clean.
- [ ] Visit `https://spencerflaherty.com/admin/` — Sveltia loads, GitHub OAuth flow completes, you can edit content.
- [ ] Test on mobile data (not your home Wi-Fi) to confirm propagation beyond your local resolver.

---

## 6. Timing & Propagation

- GoDaddy pushes changes to its nameservers in ~1 minute.
- Public resolvers honor the previous TTL. If Squarespace records had a 1-hour TTL, expect up to 60 min for most of the world to see the change.
- **The 24-hour trap:** if you didn't pre-lower TTL, some ISP resolvers cache for the full original TTL (often 1 hour but occasionally longer). Don't declare failure until ~2 hours have passed.
- Let's Encrypt cert provisioning: typically 5-30 min after GitHub's DNS check passes. If it's stuck >1 hour, remove the custom domain in GitHub Pages settings, wait 5 min, re-add it. This re-triggers provisioning.

---

## 7. Squarespace Overlap Period

- You can keep the Squarespace site "live" in your Squarespace account while DNS flips — it just stops receiving traffic the moment DNS changes hit resolvers.
- **Do not cancel Squarespace for at least 7 days** after cutover. Reasons:
  - Confirm no edge-case issues surface (email, analytics, subdomains you forgot about).
  - Keeps rollback (Section 8) viable.
  - Any remaining DNS records Squarespace was serving (MX, TXT for email verification, etc.) continue resolving from GoDaddy — Squarespace was not your DNS provider, so cancellation of Squarespace doesn't affect DNS.
- After 7 days of verified stable operation, cancel the Squarespace subscription.

---

## 8. Rollback Plan

If the new site breaks or the cert won't provision and you need spencerflaherty.com back on Squarespace right now:

1. GoDaddy DNS → delete the four `185.199.x.153` A records and the four AAAA records.
2. Restore the original Squarespace A records from your screenshot:
   - A `@` → `198.185.159.144`
   - A `@` → `198.185.159.145`
   - A `@` → `198.49.23.144`
   - A `@` → `198.49.23.145`
3. Change CNAME `www` value from `spencerflaherty.github.io.` back to `ext-sq.squarespace.com.`
4. In GitHub Pages settings, remove the custom domain (prevents it from hijacking the cert next time).
5. Wait 10-60 min for DNS to revert (hence the 600s TTL pre-lower).

If the 24-hour TTL wasn't pre-lowered, rollback can take up to 24 hrs for all users — which is the main argument for doing the TTL pre-lower in Section 1.

---

## 9. Common Gotchas

- **Missing AAAA records:** IPv6-only users (rare but real) get no response. Always set all four AAAA records.
- **CNAME on apex:** GoDaddy won't let you, and it would break email anyway. Use A records.
- **CNAME file missing / stripped by build:** Eleventy won't copy it unless told to. Add `eleventyConfig.addPassthroughCopy("CNAME")` (or equivalent) and verify the file exists in the deployed artifact.
- **Trailing dot in CNAME values:** GoDaddy's new UI adds it automatically. Entering `spencerflaherty.github.io` (no dot) is fine; entering `spencerflaherty.github.io..` breaks.
- **www redirect loop:** happens if you set BOTH a `www` CNAME AND a `www` A record pointing at GitHub. Pick one (CNAME).
- **Let's Encrypt rate limit:** 5 cert issuances per domain per week. If you toggle the custom domain repeatedly trying to "fix" provisioning, you can lock yourself out for 7 days. Be patient.
- **OAuth callback mismatch:** After cutover, Sveltia at `/admin` will fail login if the OAuth app's callback URL still points to `spencerflaherty.github.io` exclusively. Update it before or immediately after cutover.
- **Enforce HTTPS ticked too early:** if ticked before the cert provisions, visitors get cert errors. Wait for the checkbox to un-grey.
- **Browser HSTS cache:** if you previously forced HTTPS on Squarespace and something misconfigures during cutover, your own browser may refuse to load the site. Test in incognito or a different browser.
- **Trailing slash / 404s:** GitHub Pages serves `/about/index.html` for `/about/` and `/about`. Confirm Eleventy outputs directory-style URLs (permalinks ending in `/`), not bare `.html` files, or internal links may 404.

---

Last Updated: 2026-04-21
