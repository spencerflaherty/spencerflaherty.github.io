# SEO Reference Guide

Complete SEO meta tags for all portfolio pages.

---

## SEO Best Practices Applied

1. **Title Length:** All under 60 characters for optimal display
2. **Description Length:** All under 160 characters
3. **Keywords Included:** Relevant keywords per page (portfolio, Spencer Flaherty, expertise)
4. **Unique Content:** Each page has unique title/description
5. **Brand Consistency:** "Spencer Flaherty" in all titles
6. **Location Signal:** "Baltimore" in Home and About pages
7. **Social Media Optimized:** All pages have Open Graph and Twitter Card tags

---

## Page Meta Tags

### Home Page
**Title:** `Spencer Flaherty | Marketing, Media & AI Portfolio`
**Description:** `Baltimore-based marketer specializing in AI automation, video production, and paid ads. Explore work spanning marketing engineering, media, and web design.`

### About Page
**Title:** `About Spencer Flaherty | Marketing & AI Engineer`
**Description:** `15 years creating at the intersection of sales, media, and AI. Baltimore-based marketing professional with expertise in automation, video, and engineering.`

### Automation Page
**Title:** `Marketing Automation Portfolio | Spencer Flaherty`
**Description:** `AI-powered marketing automation: geospatial prospecting, RAG-based personalization, intent conversion engines, and custom CRM tools built to scale lead generation.`

### Media Page
**Title:** `Video Production & Media Portfolio | Spencer Flaherty`
**Description:** `Commercial video production, podcast studio builds, and documentary filmmaking. From case studies to AI-enhanced archival projects in Baltimore and beyond.`

### Paid Ads Page
**Title:** `Paid Advertising Campaigns Portfolio | Spencer Flaherty`
**Description:** `Facebook and LinkedIn ad campaigns for EV infrastructure, electrical services, and eCommerce. AI-generated creative, conversion optimization, and lead gen.`

### Reporting Page
**Title:** `BI Dashboards & Analytics Portfolio | Spencer Flaherty`
**Description:** `Custom attribution models, Power BI dashboards, and automated reporting systems. Multi-touch attribution, pipeline tracking, and customer operations tools.`

### Resources Page
**Title:** `Content Marketing & SEO Portfolio | Spencer Flaherty`
**Description:** `Whitepapers, training docs, and SEO-driven blog content. Built crawlable PDFs cited by AI, managed 300%+ organic growth, and automated sales enablement tools.`

### Websites Page
**Title:** `Web Design & Development Portfolio | Spencer Flaherty`
**Description:** `Custom web projects on Squarespace, WordPress, and HubSpot. Terminal-style portfolio site, local business SEO builds, and agency redesigns that triple traffic.`

---

## Social Media Tags

All pages share the same Open Graph image:
```
https://images.squarespace-cdn.com/content/67758c2dcfaa0679c00768d7/4d19da35-4186-4b41-826b-b67ce7c95d71/OG+Image.png?content-type=image%2Fpng
```

**Meta tag format used across all pages:**
```html
<!-- Open Graph / Social Media -->
<meta property="og:title" content="[Page Title]">
<meta property="og:description" content="[Page Description]">
<meta property="og:type" content="website">
<meta property="og:url" content="https://www.spencerflaherty.com/[page-slug]">
<meta property="og:image" content="[OG Image URL]">

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="[Page Title]">
<meta name="twitter:description" content="[Page Description]">
<meta name="twitter:image" content="[OG Image URL]">
```

---

## Technical SEO Status

| Check | Status | Notes |
|-------|--------|-------|
| HTTPS | ✅ Pass | Site loads securely |
| Mobile responsive | ✅ Pass | Viewport configured, responsive design |
| Image alt text | ✅ Pass | All images have alt attributes |
| Structured data | ✅ Pass | JSON-LD scripts present |
| Meta descriptions | ✅ Pass | All pages optimized |
| H1 tags | ✅ Pass | Semantic H1 on all pages |
| Canonical tags | ⚠️ Warning | Verify Squarespace settings |
| XML sitemap | ⚠️ Warning | Verify at /sitemap.xml |
| Page speed | ⚠️ Warning | Monitor typing animation impact on LCP |
| Core Web Vitals | ⚠️ Warning | Monitor JavaScript animation impact on INP |

---

Last Updated: 2026-02-03
