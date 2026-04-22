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

function escapeHtmlBlock(value) {
  return escapeHtml(value).replace(/\n/g, "<br>");
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
  const lines = stack.map((item) => `• ${escapeHtml(item)}`).join("<br>");
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

function renderMediaWrapper(innerHtml, item) {
  const classes = ["media-dialup-container"];
  if (item.variant) classes.push(`media-dialup-container--${item.variant}`);
  if (item.align) classes.push(`media-dialup-container--align-${item.align}`);

  const styleAttr = buildStyleAttribute({
    "max-width": item.width,
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
  const aspectRatio = item.aspectRatio || fallbackRatio;
  const styleAttr = buildStyleAttribute({ "aspect-ratio": aspectRatio });
  return `<div class='media-frame'${styleAttr}>${iframeHtml}</div>`;
}

function renderMediaItem(item) {
  if (item.type === "image") {
    const image = `<img src='${escapeHtml(item.src || "")}' alt='${escapeHtml(
      item.alt || "",
    )}' loading='lazy'>`;
    return renderMediaWrapper(image, item);
  }

  if (item.type === "youtube") {
    const title = escapeHtml(item.title || "");
    const iframe = `<iframe src='https://www.youtube-nocookie.com/embed/${escapeHtml(
      item.videoId || "",
    )}?rel=0&modestbranding=1' title='${title}' frameborder='0' allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share' referrerpolicy='strict-origin-when-cross-origin' allowfullscreen></iframe>`;
    return renderMediaWrapper(renderFramedEmbed(iframe, item, "16 / 9"), item);
  }

  if (item.type === "vimeo") {
    const iframe = `<iframe src='${escapeHtml(
      item.src || "",
    )}' title='${escapeHtml(item.title || "")}' frameborder='0' allow='autoplay; fullscreen; picture-in-picture' allowfullscreen></iframe>`;
    return renderMediaWrapper(renderFramedEmbed(iframe, item, "16 / 9"), item);
  }

  if (item.type === "linkedin") {
    const iframe = `<iframe src='${escapeHtml(
      item.src || "",
    )}' title='${escapeHtml(item.title || "")}' frameborder='0' allowfullscreen></iframe>`;
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
    }
  }

  if (project.note && !order.includes("note")) {
    parts.push(`<em>${escapeHtmlBlock(project.note)}</em>`);
    kinds.push("text");
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
    content: `${terminal.navigationPrompt}${promptRange}:`,
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
      if (MEDIA_TYPES.includes(item.type)) {
        segments.push({ type: "inject", html: renderMediaItem(item) });
      }
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
        segments.push({ type: "dropdown", text: `[+]  ${project.title}` });
      }
      if (item.trailingLineBreak !== false) {
        segments.push({ type: "inject", html: "<span class='line-break'></span>" });
      }
    }
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
  eleventyConfig.addPassthroughCopy({ "src/admin": "admin" });
  eleventyConfig.addPassthroughCopy({ "src/CNAME": "CNAME" });

  eleventyConfig.addFilter("buildSegments", buildSegments);
  eleventyConfig.addFilter("buildDropdownBodies", buildDropdownBodies);
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

    return pages.map((page) => ({
      ...page,
      _navLinks: navLinks,
      _terminal: terminalSettings,
    }));
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
