const yaml = require("js-yaml");
const fs = require("fs");
const path = require("path");

const NAV_LINKS = [
  { href: "https://www.spencerflaherty.com", text: "[0]  ~Root/ (Home)" },
  { href: "https://www.spencerflaherty.com/about", text: "[1]  About/" },
  { href: "https://www.spencerflaherty.com/automation", text: "[2]  Automation/" },
  { href: "https://www.spencerflaherty.com/media", text: "[3]  Media/" },
  { href: "https://www.spencerflaherty.com/paid-ads", text: "[4]  Paid_Ads/" },
  { href: "https://www.spencerflaherty.com/reporting", text: "[5]  Reporting/" },
  { href: "https://www.spencerflaherty.com/resources", text: "[6]  Resources/" },
  { href: "https://www.spencerflaherty.com/websites", text: "[7]  Websites/" },
];

function esc(str) {
  return String(str);
}

function renderMediaItem(item) {
  const variant = item.variant ? ` media-dialup-container--${item.variant}` : "";
  if (item.type === "image") {
    return `<div class='media-dialup-container${variant}'><img src='${item.src}' alt='${item.alt || ""}'></div>`;
  }
  if (item.type === "youtube") {
    return `<div class='media-dialup-container${variant}'><iframe src='https://www.youtube-nocookie.com/embed/${item.videoId}?rel=0&modestbranding=1' title='${item.title || ""}' frameborder='0' allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share' referrerpolicy='strict-origin-when-cross-origin' allowfullscreen></iframe></div>`;
  }
  if (item.type === "vimeo") {
    return `<div class='media-dialup-container${variant}'><div style='padding:56.25% 0 0 0;position:relative;'><iframe src='${item.src}' style='position:absolute;top:0;left:0;width:100%;height:100%;' frameborder='0' allow='autoplay; fullscreen; picture-in-picture' allowfullscreen></iframe></div></div>`;
  }
  if (item.type === "linkedin") {
    return `<div class='media-dialup-container${variant}'><iframe src='${item.src}' height='399' frameborder='0' allowfullscreen title='${item.title || ""}'></iframe></div>`;
  }
  if (item.type === "html") {
    return `<div class='media-dialup-container${variant}'>${item.html}</div>`;
  }
  return "";
}

function renderButtonLink(link) {
  return `<a href='${link.href}' class='terminal-link' target='_blank' rel='noopener noreferrer'>${link.text}</a>`;
}

function renderStack(stack) {
  if (!stack || !stack.length) return "";
  const lines = stack.map((s) => `• ${s}`).join("<br>");
  return `<strong>The Stack:</strong><br>${lines}`;
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
      parts.push(esc(project.description).trim());
      kinds.push("text");
    } else if (key === "media") {
      if (mediaCursor < media.length) {
        parts.push(renderMediaItem(media[mediaCursor]));
        kinds.push("media");
        mediaCursor++;
      }
    } else if (key === "stack" && project.stack && project.stack.length) {
      parts.push(renderStack(project.stack));
      kinds.push("text");
    } else if (key === "buttonlink") {
      if (buttonCursor < buttonlinks.length) {
        parts.push(renderButtonLink(buttonlinks[buttonCursor]));
        kinds.push("button");
        buttonCursor++;
      }
    } else if (key === "note" && project.note) {
      parts.push(`<em>${esc(project.note)}</em>`);
      kinds.push("text");
    }
  }

  // Append trailing note if not in order but defined
  if (project.note && !order.includes("note")) {
    parts.push(`<em>${esc(project.note)}</em>`);
    kinds.push("text");
  }

  // Separators: any media boundary gets no <br> (CSS margin handles spacing).
  // Button-to-text and text-to-button need <br><br> for readability (buttons are inline-block).
  // Text-to-text also gets <br><br>.
  let out = "";
  for (let i = 0; i < parts.length; i++) {
    if (i > 0) {
      const prev = kinds[i - 1];
      const cur = kinds[i];
      if (prev === "media" || cur === "media") {
        // no separator — CSS margin handles it
      } else {
        out += "<br><br>";
      }
    }
    out += parts[i];
  }
  return out;
}

function pushNavLinks(segs) {
  segs.push({ type: "element", tag: "strong", text: "ID   MODULE", addBreak: true });
  for (let i = 0; i < NAV_LINKS.length; i++) {
    const nav = NAV_LINKS[i];
    const seg = { type: "navlink", href: nav.href, text: nav.text };
    if (i === NAV_LINKS.length - 1) seg.extraBreak = true;
    segs.push(seg);
  }
  segs.push({ type: "type", content: "Enter module ID [0-7]:" });
}

function buildSegments(page) {
  const MEDIA_TYPES = ["image", "youtube", "vimeo", "linkedin", "html"];
  const content = page.content || [];

  // Home page: custom layout — cwd → media → prompt → command → navlinks.
  if (page.slug === "home") {
    const segs = [];
    segs.push({ type: "type", content: "root@spencer-portfolio:~\n" });
    for (const item of content) {
      if (MEDIA_TYPES.includes(item.type)) {
        segs.push({ type: "inject", html: renderMediaItem(item) });
      }
    }
    segs.push({ type: "element", tag: "span", className: "prompt-arrow", text: "$" });
    segs.push({ type: "type", content: " ./display_categories\n\n" });
    pushNavLinks(segs);
    return segs;
  }

  const segs = [];
  const prompt = page.prompt || {};
  const cwd = prompt.cwd !== undefined ? prompt.cwd : page.slug;
  const cmd = prompt.command || "./display_page";
  const cwdSuffix = cwd ? `/${cwd}` : "";

  segs.push({ type: "type", content: `root@spencer-portfolio:~${cwdSuffix}\n` });
  segs.push({ type: "element", tag: "span", className: "prompt-arrow", text: "$" });
  segs.push({ type: "type", content: ` ${cmd}\n\n` });
  if (page.h1) {
    segs.push({ type: "element", tag: "h1", className: "h1", text: page.h1 });
  }

  for (const item of content) {
    if (item.type === "text") {
      segs.push({ type: "type", content: item.text });
    } else if (MEDIA_TYPES.includes(item.type)) {
      segs.push({ type: "inject", html: renderMediaItem(item) });
    } else if (item.type === "buttonlink") {
      segs.push({ type: "buttonlink", href: item.href, text: item.text });
      if (item.newline !== false) segs.push({ type: "type", content: "\n" });
    } else if (item.type === "inlinelink") {
      segs.push({ type: "inlinelink", href: item.href, text: item.text });
    } else if (item.type === "linebreak") {
      segs.push({ type: "inject", html: "<span class='line-break'></span>" });
    } else if (item.type === "section") {
      segs.push({ type: "element", tag: "h2", className: "h2", text: item.heading });
      if (item.intro) {
        segs.push({ type: "type", content: item.intro });
      }
      for (const project of item.projects || []) {
        segs.push({ type: "dropdown", text: `[+]  ${project.title}` });
      }
      if (item.trailingLineBreak !== false) {
        segs.push({ type: "inject", html: "<span class='line-break'></span>" });
      }
    }
  }

  // Standard Navigate section (auto-appended)
  // If the content ended with a section, the line-break from that section serves as separator.
  // Otherwise, add an explicit line-break before Navigate.
  const last = content[content.length - 1];
  const hasTrailingBreak =
    last && (last.type === "section" || last.type === "linebreak");
  if (!hasTrailingBreak) {
    segs.push({ type: "inject", html: "<span class='line-break'></span>" });
  }

  segs.push({ type: "element", tag: "h2", className: "h2", text: "Navigate" });
  segs.push({ type: "type", content: "root@spencer-portfolio:~\n" });
  segs.push({ type: "element", tag: "span", className: "prompt-arrow", text: "$" });
  segs.push({ type: "type", content: " ./display_categories\n\n" });
  pushNavLinks(segs);

  return segs;
}

function buildDropdownBodies(page) {
  const bodies = [];
  const content = page.content || [];
  for (const item of content) {
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

  eleventyConfig.addFilter("buildSegments", buildSegments);
  eleventyConfig.addFilter("buildDropdownBodies", buildDropdownBodies);
  eleventyConfig.addFilter("jsonify", (v) => JSON.stringify(v));
  eleventyConfig.addFilter("absUrl", (url, base) => {
    if (!url) return "";
    if (/^https?:\/\//i.test(url)) return url;
    return (base || "").replace(/\/$/, "") + url;
  });

  eleventyConfig.addGlobalData("pages", () => {
    const pagesDir = path.join(__dirname, "src/content/pages");
    if (!fs.existsSync(pagesDir)) return [];
    const files = fs
      .readdirSync(pagesDir)
      .filter((f) => f.endsWith(".yml") || f.endsWith(".yaml"));
    return files.map((file) => {
      const raw = fs.readFileSync(path.join(pagesDir, file), "utf8");
      return yaml.load(raw);
    });
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
