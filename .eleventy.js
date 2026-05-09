const yaml = require("js-yaml");
const fs = require("fs");
const path = require("path");

const MEDIA_TYPES = ["image", "youtube", "vimeo", "linkedin", "html"];
const DEFAULT_TERMINAL = {
  host: "root@spencer-portfolio",
  rootPath: "~",
  navigationCommand: "./display_categories",
  navigationPrompt: "Enter module ID",
};

function loadYamlFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  return yaml.load(fs.readFileSync(filePath, "utf8")) || {};
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeHtmlText(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeHtmlBlock(value) {
  return escapeHtmlText(value).replace(/\n/g, "<br>");
}

function buildStyleAttribute(styles) {
  const declarations = Object.entries(styles)
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .map(([property, value]) => `${property}:${String(value).trim()}`);

  return declarations.length
    ? ` style='${escapeHtml(declarations.join(";"))}'`
    : "";
}

function getPageUrl(page) {
  return page.slug === "home" ? "/" : `/${page.slug}/`;
}

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getProjectSlug(project) {
  return slugify(project.slug || project.title);
}

function renderRelated(related) {
  if (!Array.isArray(related)) return "";
  const items = related.filter((r) => r && r.href && r.text);
  if (!items.length) return "";
  const links = items
    .map((r) => {
      const href = escapeHtml(r.href);
      const isExternal = /^https?:\/\//i.test(r.href);
      const target = isExternal ? " target='_blank' rel='noopener noreferrer'" : "";
      return `<a href='${href}' class='terminal-link-inline'${target}>${escapeHtmlText(r.text)}</a>`;
    })
    .join(", ");
  return `<strong>Related:</strong> ${links}`;
}

function getDefaultNavLabel(page) {
  if (page.slug === "home") return "~Root/ (Home)";
  if (page.windowTitle) {
    const normalized = page.windowTitle.replace(/^\/|\/$/g, "");
    if (normalized) return `${normalized}/`;
  }
  return `${page.slug}/`;
}

function normalizePage(rawPage) {
  const page = rawPage || {};
  const slug = page.slug || "page";

  return {
    ...page,
    slug,
    seo: page.seo || {},
    prompt: page.prompt || {},
    navigation: {
      showInNavigation: true,
      ...page.navigation,
      label: page.navigation?.label || getDefaultNavLabel({ ...page, slug }),
    },
    content: Array.isArray(page.content) ? page.content : [],
  };
}

function buildNavigationLinks(pages) {
  return pages
    .filter((page) => page.navigation?.showInNavigation !== false)
    .sort((a, b) => {
      const orderA = Number.isFinite(a.navigation?.order)
        ? a.navigation.order
        : Number.MAX_SAFE_INTEGER;
      const orderB = Number.isFinite(b.navigation?.order)
        ? b.navigation.order
        : Number.MAX_SAFE_INTEGER;
      if (orderA !== orderB) return orderA - orderB;
      return a.slug.localeCompare(b.slug);
    })
    .map((page, index) => ({
      id: String(index),
      href: getPageUrl(page),
      text: `[${index}]  ${page.navigation.label}`,
    }));
}

function buildProjectRoutes(pages) {
  const routes = [];

  for (const page of pages) {
    if (!page || page.slug === "home") continue;

    for (const item of page.content || []) {
      if (item.type !== "section") continue;

      for (const project of item.projects || []) {
        const projectSlug = getProjectSlug(project);
        if (!projectSlug) continue;

        routes.push({
          title: project.title || "",
          slug: projectSlug,
          pageSlug: page.slug,
          permalink: `/${page.slug}/${projectSlug}/`,
          redirectUrl: `/${page.slug}/#${projectSlug}`,
        });
      }
    }
  }

  return routes;
}

function getTerminalSettings(page) {
  return { ...DEFAULT_TERMINAL, ...(page._terminal || {}) };
}

function renderButtonLink(link) {
  const href = escapeHtml(link.href || "#");
  const target = link.openInNewTab === false ? "_self" : "_blank";
  const rel = target === "_blank" ? "noopener noreferrer" : "";
  const ariaLabel = link.ariaLabel ? ` aria-label='${escapeHtml(link.ariaLabel)}'` : "";
  const relAttr = rel ? ` rel='${rel}'` : "";

  return `<a href='${href}' class='terminal-link' target='${target}'${relAttr}${ariaLabel}>${escapeHtml(
    link.text || "Open link",
  )}</a>`;
}

function renderStack(stack) {
  if (!stack || !stack.length) return "";
  const lines = stack.map((item) => `• ${escapeHtmlText(item)}`).join("<br>");
  return `<strong>The Stack:</strong><br>${lines}`;
}

function renderLinkedMedia(mediaHtml, item) {
  if (!item.linkUrl) return mediaHtml;

  const href = escapeHtml(item.linkUrl);
  const target = item.openInNewTab === false ? "_self" : "_blank";
  const rel = target === "_blank" ? "noopener noreferrer" : "";
  const relAttr = rel ? ` rel='${rel}'` : "";

  return `<a href='${href}' class='media-link' target='${target}'${relAttr}>${mediaHtml}</a>`;
}

function buildMediaFrameStyle(item, fallbackRatio) {
  return buildStyleAttribute({
    width: item.width,
    height: item.height,
    "max-width": item.maxWidth,
    "max-height": item.maxHeight,
    "aspect-ratio": item.height ? undefined : item.aspectRatio || fallbackRatio,
  });
}

function buildMediaElementStyle(item) {
  return buildStyleAttribute({
    height: item.height,
    "max-height": item.maxHeight,
    "object-fit": item.objectFit,
  });
}

function renderMediaWrapper(innerHtml, item) {
  const classes = ["media-dialup-container"];
  if (item.variant) classes.push(`media-dialup-container--${item.variant}`);
  if (item.align) classes.push(`media-dialup-container--align-${item.align}`);

  const styleAttr = buildStyleAttribute({
    width: item.width,
    "max-width": item.maxWidth,
    "margin-top": item.spacingTop,
    "margin-bottom": item.spacingBottom,
  });

  const caption = item.caption
    ? `<figcaption class='media-caption'>${escapeHtmlBlock(item.caption)}</figcaption>`
    : "";

  return `<figure class='${classes.join(" ")}'${styleAttr}>${renderLinkedMedia(
    innerHtml,
    item,
  )}${caption}</figure>`;
}

function renderFramedEmbed(iframeHtml, item, fallbackRatio) {
  const styleAttr = buildMediaFrameStyle(item, fallbackRatio);
  return `<div class='media-frame'${styleAttr}>${iframeHtml}</div>`;
}

function renderMediaItem(item) {
  if (item.type === "image") {
    const imageSrc = item.image || item.pickExisting || item.src || "";
    const styleAttr = buildMediaElementStyle(item);
    const loadingAttrs = item.eager
      ? "loading='eager' fetchpriority='high'"
      : "loading='lazy' decoding='async'";
    const image = `<img src='${escapeHtml(imageSrc)}' alt='${escapeHtml(
      item.alt || "",
    )}' ${loadingAttrs}${styleAttr}>`;
    return renderMediaWrapper(image, item);
  }

  if (item.type === "youtube") {
    const title = escapeHtml(item.title || "");
    const iframe = `<iframe src='https://www.youtube-nocookie.com/embed/${escapeHtml(
      item.videoId || "",
    )}?rel=0&modestbranding=1' title='${title}' loading='lazy' frameborder='0' allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share' referrerpolicy='strict-origin-when-cross-origin' allowfullscreen></iframe>`;
    return renderMediaWrapper(renderFramedEmbed(iframe, item, "16 / 9"), item);
  }

  if (item.type === "vimeo") {
    const iframe = `<iframe src='${escapeHtml(
      item.src || "",
    )}' title='${escapeHtml(item.title || "")}' loading='lazy' frameborder='0' allow='autoplay; fullscreen; picture-in-picture' allowfullscreen></iframe>`;
    return renderMediaWrapper(renderFramedEmbed(iframe, item, "16 / 9"), item);
  }

  if (item.type === "linkedin") {
    const iframe = `<iframe src='${escapeHtml(
      item.src || "",
    )}' title='${escapeHtml(item.title || "")}' loading='lazy' frameborder='0' allowfullscreen></iframe>`;
    return renderMediaWrapper(renderFramedEmbed(iframe, item, "4 / 5"), item);
  }

  if (item.type === "html") {
    const html = item.aspectRatio
      ? renderFramedEmbed(item.html || "", item, item.aspectRatio)
      : `<div class='media-html'>${item.html || ""}</div>`;
    return renderMediaWrapper(html, item);
  }

  return "";
}

function appendContentItem(segments, item) {
  if (item.type === "text") {
    segments.push({ type: "type", content: item.text });
  } else if (MEDIA_TYPES.includes(item.type)) {
    segments.push({ type: "inject", html: renderMediaItem(item) });
  } else if (item.type === "buttonlink") {
    segments.push({
      type: "buttonlink",
      href: item.href,
      text: item.text,
      openInNewTab: item.openInNewTab !== false,
    });
    if (item.newline !== false) segments.push({ type: "type", content: "\n" });
  } else if (item.type === "inlinelink") {
    segments.push({ type: "inlinelink", href: item.href, text: item.text });
  } else if (item.type === "linebreak") {
    segments.push({ type: "inject", html: "<span class='line-break'></span>" });
  } else if (item.type === "section") {
    segments.push({ type: "element", tag: "h2", className: "h2", text: item.heading });
    if (item.intro) {
      segments.push({ type: "type", content: item.intro });
    }
    for (const project of item.projects || []) {
      segments.push({
        type: "dropdown",
        text: `[+]  ${project.title}`,
        slug: getProjectSlug(project),
      });
    }
    if (item.trailingLineBreak !== false) {
      segments.push({ type: "inject", html: "<span class='line-break'></span>" });
    }
  }
}

function renderDropdownBody(project) {
  const order = project.order || ["media", "description", "stack"];
  const parts = [];
  const kinds = [];
  let mediaCursor = 0;
  let buttonCursor = 0;
  const media = project.media || [];
  const buttonlinks = project.buttonlinks || [];

  for (const key of order) {
    if (key === "description" && project.description) {
      parts.push(escapeHtmlBlock(project.description).trim());
      kinds.push("text");
    } else if (key === "media") {
      if (mediaCursor < media.length) {
        parts.push(renderMediaItem(media[mediaCursor]));
        kinds.push("media");
        mediaCursor += 1;
      }
    } else if (key === "stack" && project.stack && project.stack.length) {
      parts.push(renderStack(project.stack));
      kinds.push("text");
    } else if (key === "buttonlink") {
      if (buttonCursor < buttonlinks.length) {
        parts.push(renderButtonLink(buttonlinks[buttonCursor]));
        kinds.push("button");
        buttonCursor += 1;
      }
    } else if (key === "note" && project.note) {
      parts.push(`<em>${escapeHtmlBlock(project.note)}</em>`);
      kinds.push("text");
    } else if (key === "related") {
      const relatedHtml = renderRelated(project.related);
      if (relatedHtml) {
        parts.push(relatedHtml);
        kinds.push("text");
      }
    }
  }

  if (project.note && !order.includes("note")) {
    parts.push(`<em>${escapeHtmlBlock(project.note)}</em>`);
    kinds.push("text");
  }

  if (!order.includes("related")) {
    const relatedHtml = renderRelated(project.related);
    if (relatedHtml) {
      parts.push(relatedHtml);
      kinds.push("text");
    }
  }

  let output = "";
  for (let i = 0; i < parts.length; i += 1) {
    if (i > 0) {
      const prev = kinds[i - 1];
      const current = kinds[i];
      if (prev !== "media" && current !== "media") {
        output += "<br><br>";
      }
    }
    output += parts[i];
  }

  return output;
}

function pushSearchText(values, value) {
  if (value === undefined || value === null) return;
  if (typeof value === "string" || typeof value === "number") {
    const text = String(value).trim();
    if (text) values.push(text);
  }
}

function buildProjectSearchText(project, section, page) {
  const values = [];
  pushSearchText(values, page.windowTitle);
  pushSearchText(values, page.h1);
  pushSearchText(values, page.navigation?.label);
  pushSearchText(values, section.heading);
  pushSearchText(values, section.intro);
  pushSearchText(values, project.title);
  pushSearchText(values, project.description);
  pushSearchText(values, project.note);

  for (const item of project.stack || []) {
    pushSearchText(values, item);
  }

  for (const item of project.media || []) {
    pushSearchText(values, item.title);
    pushSearchText(values, item.alt);
    pushSearchText(values, item.caption);
  }

  for (const item of project.buttonlinks || []) {
    pushSearchText(values, item.text);
    pushSearchText(values, item.ariaLabel);
  }

  for (const item of project.related || []) {
    pushSearchText(values, item.text);
  }

  return values.join(" ");
}

function buildSearchIndex(pages) {
  const index = [];

  for (const page of pages || []) {
    if (!page || page.slug === "home") continue;

    for (const section of page.content || []) {
      if (section.type !== "section") continue;

      for (const project of section.projects || []) {
        const slug = getProjectSlug(project);
        if (!slug) continue;

        index.push({
          title: project.title || "",
          pageTitle: page.windowTitle ? page.windowTitle.replace(/^\/|\/$/g, "") : page.slug,
          sectionTitle: section.heading || "",
          href: `${getPageUrl(page)}#${slug}`,
          text: buildProjectSearchText(project, section, page),
        });
      }
    }
  }

  return index;
}

function pushNavLinks(segments, navLinks, terminal) {
  segments.push({ type: "element", tag: "strong", text: "ID   MODULE", addBreak: true });

  for (let i = 0; i < navLinks.length; i += 1) {
    const nav = navLinks[i];
    const segment = { type: "navlink", href: nav.href, text: nav.text };
    if (i === navLinks.length - 1) segment.extraBreak = true;
    segments.push(segment);
  }

  const promptRange = navLinks.length ? ` [0-${navLinks.length - 1}]` : "";
  segments.push({
    type: "type",
    content: `Enter ID${promptRange} or grep "keyword":`,
  });
}

function buildPromptLine(terminal, cwd = "") {
  return `${terminal.host}:${terminal.rootPath}${cwd ? `/${cwd}` : ""}`;
}

function buildSegments(page) {
  const content = page.content || [];
  const navLinks = page._navLinks || [];
  const terminal = getTerminalSettings(page);

  if (page.slug === "home") {
    const segments = [];
    segments.push({ type: "type", content: `${buildPromptLine(terminal)}\n` });

    for (const item of content) {
      appendContentItem(segments, item);
    }

    segments.push({ type: "element", tag: "span", className: "prompt-arrow", text: "$" });
    segments.push({
      type: "type",
      content: ` ${terminal.navigationCommand}\n\n`,
    });
    pushNavLinks(segments, navLinks, terminal);
    return segments;
  }

  const prompt = page.prompt || {};
  const cwd = prompt.cwd !== undefined ? prompt.cwd : page.slug;
  const command = prompt.command || "./display_page";
  const segments = [];

  segments.push({ type: "type", content: `${buildPromptLine(terminal, cwd)}\n` });
  segments.push({ type: "element", tag: "span", className: "prompt-arrow", text: "$" });
  segments.push({ type: "type", content: ` ${command}\n\n` });

  if (page.h1) {
    segments.push({ type: "element", tag: "h1", className: "h1", text: page.h1 });
  }

  for (const item of content) {
    appendContentItem(segments, item);
  }

  const last = content[content.length - 1];
  const hasTrailingBreak = last && (last.type === "section" || last.type === "linebreak");
  if (!hasTrailingBreak) {
    segments.push({ type: "inject", html: "<span class='line-break'></span>" });
  }

  segments.push({ type: "element", tag: "h2", className: "h2", text: "Navigate" });
  segments.push({ type: "type", content: `${buildPromptLine(terminal)}\n` });
  segments.push({ type: "element", tag: "span", className: "prompt-arrow", text: "$" });
  segments.push({
    type: "type",
    content: ` ${terminal.navigationCommand}\n\n`,
  });
  pushNavLinks(segments, navLinks, terminal);

  return segments;
}

function buildDropdownBodies(page) {
  const bodies = [];

  for (const item of page.content || []) {
    if (item.type === "section") {
      for (const project of item.projects || []) {
        bodies.push(renderDropdownBody(project));
      }
    }
  }

  return bodies;
}

module.exports = function (eleventyConfig) {
  eleventyConfig.addDataExtension("yml,yaml", (contents) => yaml.load(contents));

  eleventyConfig.addPassthroughCopy({ "src/static": "static" });
  eleventyConfig.addPassthroughCopy({ "src/CNAME": "CNAME" });
  eleventyConfig.addPassthroughCopy({ "src/robots.txt": "robots.txt" });

  eleventyConfig.addFilter("buildSegments", buildSegments);
  eleventyConfig.addFilter("buildDropdownBodies", buildDropdownBodies);
  eleventyConfig.addFilter("buildSearchInputPrompt", (page) => {
    const navLinks = page._navLinks || [];
    const promptRange = navLinks.length ? ` [0-${navLinks.length - 1}]` : "";
    return `Enter ID${promptRange} or grep "keyword":`;
  });

  function buildProjectIndex(page) {
    const list = [];
    for (const item of page.content || []) {
      if (item.type === "section") {
        for (const project of item.projects || []) {
          list.push({
            title: project.title || "",
            slug: getProjectSlug(project),
            description: project.description || "",
          });
        }
      }
    }
    return list;
  }

  function absUrl(url, base) {
    if (!url) return "";
    if (/^https?:\/\//i.test(url)) return url;
    return (base || "").replace(/\/$/, "") + url;
  }

  function buildJsonLd(page, site) {
    site = site || {};
    const baseUrl = (site.url || "").replace(/\/$/, "");
    const pageUrl =
      (page.seo && page.seo.url) ||
      `${baseUrl}${page.slug === "home" ? "/" : `/${page.slug}/`}`;
    const personId = `${baseUrl}/#person`;
    const websiteId = `${baseUrl}/#website`;
    const personImage =
      site.branding && site.branding.logoDesktopSrc
        ? absUrl(site.branding.logoDesktopSrc, baseUrl)
        : undefined;

    const personNode = {
      "@type": "Person",
      "@id": personId,
      name: "Spencer Flaherty",
      url: baseUrl || undefined,
      jobTitle: "Marketing & AI Engineer",
      sameAs: ["https://www.linkedin.com/in/spencer-flaherty/"],
    };
    if (personImage) personNode.image = personImage;

    const websiteNode = {
      "@type": "WebSite",
      "@id": websiteId,
      url: baseUrl || undefined,
      name: "Spencer Flaherty",
      publisher: { "@id": personId },
    };

    const isWork = ["ai-systems", "demand-gen", "digital-media"].includes(page.slug);
    const webPageType = page.slug === "about"
      ? "AboutPage"
      : isWork
      ? "CollectionPage"
      : "WebPage";

    const webPageNode = {
      "@type": webPageType,
      "@id": `${pageUrl}#webpage`,
      url: pageUrl,
      name: (page.seo && page.seo.title) || page.windowTitle || "Spencer Flaherty",
      isPartOf: { "@id": websiteId },
      about: { "@id": personId },
    };
    if (page.seo && page.seo.description) {
      webPageNode.description = page.seo.description;
    }

    const graph = [personNode, websiteNode, webPageNode];

    if (isWork) {
      const projects = buildProjectIndex(page);
      if (projects.length) {
        graph.push({
          "@type": "ItemList",
          "@id": `${pageUrl}#projects`,
          itemListElement: projects.map((p, i) => ({
            "@type": "ListItem",
            position: i + 1,
            url: `${pageUrl}#${p.slug}`,
            name: p.title,
          })),
        });
      }
    }

    return JSON.stringify({ "@context": "https://schema.org", "@graph": graph });
  }

  eleventyConfig.addFilter("buildJsonLd", buildJsonLd);
  eleventyConfig.addFilter("jsonify", (value) => JSON.stringify(value));
  eleventyConfig.addFilter("absUrl", (url, base) => {
    if (!url) return "";
    if (/^https?:\/\//i.test(url)) return url;
    return (base || "").replace(/\/$/, "") + url;
  });

  eleventyConfig.addGlobalData("pages", () => {
    const pagesDir = path.join(__dirname, "src/content/pages");
    if (!fs.existsSync(pagesDir)) return [];

    const siteSettings = loadYamlFile(path.join(__dirname, "src/_data/site.yml"));
    const terminalSettings = siteSettings.terminal || {};
    const pages = fs
      .readdirSync(pagesDir)
      .filter((file) => file.endsWith(".yml") || file.endsWith(".yaml"))
      .map((file) => normalizePage(loadYamlFile(path.join(pagesDir, file))));

    const navLinks = buildNavigationLinks(pages);

    const searchIndex = buildSearchIndex(pages);

    return pages.map((page) => ({
      ...page,
      _navLinks: navLinks,
      _searchIndex: searchIndex,
      _terminal: terminalSettings,
    }));
  });

  eleventyConfig.addGlobalData("projectRoutes", () => {
    const pagesDir = path.join(__dirname, "src/content/pages");
    if (!fs.existsSync(pagesDir)) return [];

    const pages = fs
      .readdirSync(pagesDir)
      .filter((file) => file.endsWith(".yml") || file.endsWith(".yaml"))
      .map((file) => normalizePage(loadYamlFile(path.join(pagesDir, file))));

    return buildProjectRoutes(pages);
  });

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data",
    },
    templateFormats: ["njk", "html"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
};
