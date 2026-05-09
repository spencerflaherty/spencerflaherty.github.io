import { config, fields, singleton } from "@keystatic/core";
import { readdirSync, statSync } from "fs";
import { join } from "path";

const COLLECTIONS_DIR = "src/static/collections";
const SHARED_DIR = `${COLLECTIONS_DIR}/shared`;
const IMAGE_EXT = /\.(webp|png|jpe?g|gif|svg)$/i;

const optionalText = (label: string, description?: string) =>
  fields.text({ label, description, validation: { isRequired: false } });

const optionalLongText = (label: string, description?: string) =>
  fields.text({
    label,
    description,
    multiline: true,
    validation: { isRequired: false },
  });

const cssValue = (label: string, description?: string) =>
  optionalText(
    label,
    description ?? "CSS value, e.g. 680px, 60vw, 100%, or 16 / 9. Leave blank for default.",
  );

const imageUpload = (label: string, directory: string, description?: string) =>
  fields.image({
    label,
    description,
    directory,
    publicPath: directory.replace(/^src/, ""),
  });

const pageUploadDir = (slug: string) => `${COLLECTIONS_DIR}/${slug}/_uploads`;

function collectImages(dir: string, results: string[]) {
  let entries: string[];
  try {
    entries = readdirSync(dir);
  } catch {
    return;
  }
  for (const entry of entries) {
    const full = join(dir, entry);
    let stat;
    try {
      stat = statSync(full);
    } catch {
      continue;
    }
    if (stat.isDirectory()) {
      collectImages(full, results);
    } else if (IMAGE_EXT.test(entry)) {
      results.push(full);
    }
  }
}

function listExistingImageOptions(pageSlug: string) {
  const options: { label: string; value: string }[] = [
    { label: "— No selection (use upload or manual path) —", value: "" },
  ];
  const pageImages: string[] = [];
  collectImages(`${COLLECTIONS_DIR}/${pageSlug}`, pageImages);
  pageImages.sort();
  for (const full of pageImages) {
    const publicPath = full.replace(/^src/, "");
    const display = publicPath.replace(`/static/collections/${pageSlug}/`, "");
    options.push({ label: display, value: publicPath });
  }
  const sharedImages: string[] = [];
  collectImages(SHARED_DIR, sharedImages);
  sharedImages.sort();
  for (const full of sharedImages) {
    const publicPath = full.replace(/^src/, "");
    const display = `shared/${publicPath.replace("/static/collections/shared/", "")}`;
    options.push({ label: display, value: publicPath });
  }
  return options;
}

const selectOptions = {
  align: [
    { label: "Default", value: "" },
    { label: "Left", value: "left" },
    { label: "Center", value: "center" },
    { label: "Right", value: "right" },
    { label: "Full width", value: "full" },
  ],
  variant: [
    { label: "Default", value: "" },
    { label: "Small", value: "sm" },
    { label: "Medium", value: "md" },
    { label: "Large", value: "lg" },
  ],
  objectFit: [
    { label: "Default", value: "" },
    { label: "Contain (fit inside)", value: "contain" },
    { label: "Cover (fill, may crop)", value: "cover" },
    { label: "Fill (stretch)", value: "fill" },
    { label: "None (original size)", value: "none" },
    { label: "Scale down", value: "scale-down" },
  ],
} as const;

const navigationSchema = fields.object(
  {
    showInNavigation: fields.checkbox({
      label: "Show in main navigation",
      description: "Uncheck to hide this page from the numbered nav list (and from sitemap.xml).",
      defaultValue: true,
    }),
    label: fields.text({
      label: "Menu link text",
      description: "Shown in the numbered navigation list, e.g. \"Demand_Gen/\".",
    }),
    order: fields.integer({
      label: "Menu order",
      description: "Lower numbers appear first. Home should be 0.",
      defaultValue: 0,
      validation: { isRequired: true, min: 0 },
    }),
  },
  { label: "Navigation" },
);

const seoSchema = fields.object(
  {
    title: fields.text({
      label: "Page title",
      description: "Shown in the browser tab and as the search-result heading. ~50–60 chars.",
    }),
    description: fields.text({
      label: "Meta description",
      description: "Search-result snippet. ~150 chars, written for humans.",
      multiline: true,
    }),
    url: optionalText(
      "Canonical URL",
      "Full URL of this page, e.g. https://spencerflaherty.com/demand-gen. Used for canonical + Open Graph URL.",
    ),
    ogImage: imageUpload(
      "Open Graph image",
      `${SHARED_DIR}/seo`,
      "Preview image when shared on Facebook/LinkedIn. 1200×630 recommended.",
    ),
    ogTitle: optionalText("Open Graph title override", "Optional. Defaults to Page title."),
    ogDescription: optionalLongText(
      "Open Graph description override",
      "Optional. Defaults to Meta description.",
    ),
    twitterTitle: optionalText("Twitter title override", "Optional. Defaults to Page title."),
    twitterDescription: optionalLongText(
      "Twitter description override",
      "Optional. Defaults to Meta description.",
    ),
    twitterImage: imageUpload(
      "Twitter image override",
      `${SHARED_DIR}/seo`,
      "Optional. Defaults to Open Graph image.",
    ),
  },
  { label: "SEO & social sharing" },
);

const promptSchema = fields.object(
  {
    cwd: optionalText(
      "Prompt working directory",
      "Shown after host:~/ in the terminal prompt. Leave blank to default to the page slug.",
    ),
    command: fields.text({
      label: "Prompt command",
      description: "Shown after the $ in the terminal prompt. Default: ./display_page",
    }),
  },
  { label: "Terminal prompt" },
);

const buttonLinkSchema = fields.object({
  href: fields.text({ label: "URL", description: "Full URL the button opens." }),
  text: fields.text({ label: "Button text" }),
  openInNewTab: fields.checkbox({
    label: "Open in new tab",
    defaultValue: true,
  }),
});

function makeMediaSchema(pageSlug: string) {
  const uploadsDir = pageUploadDir(pageSlug);
  return fields.object({
    type: fields.select({
      label: "Media type",
      description: "Image, YouTube, Vimeo, LinkedIn embed, or raw HTML/iframe.",
      defaultValue: "image",
      options: [
        { label: "Image", value: "image" },
        { label: "YouTube", value: "youtube" },
        { label: "Vimeo", value: "vimeo" },
        { label: "LinkedIn", value: "linkedin" },
        { label: "Custom HTML", value: "html" },
      ],
    }),
    pickExisting: fields.select({
      label: "Pick existing image (image only)",
      description:
        "Pick an image already uploaded to this page's folder (or shared/). Used when no new upload is provided. Ignored for non-image types.",
      defaultValue: "",
      options: listExistingImageOptions(pageSlug),
    }),
    image: imageUpload(
      "Upload new image (image only)",
      uploadsDir,
      "Uploads land in this page's _uploads/ folder. You can move them into a project subfolder later. Takes precedence over the picker above.",
    ),
    src: optionalText(
      "Manual path or embed URL",
      "Image path (/static/collections/...), Vimeo player URL, LinkedIn embed URL, or fallback when no upload/picker is set.",
    ),
    videoId: optionalText("YouTube video ID", "Just the ID (e.g. dQw4w9WgXcQ), not the full URL."),
    title: optionalText("Embed title", "Used as iframe title for accessibility."),
    alt: optionalText("Alt text (image only)", "Describe the image for screen readers and SEO."),
    eager: fields.checkbox({
      label: "Load eagerly (above the fold)",
      description:
        "Image only. Skip lazy-loading and prioritize this image. Use for the hero / first visible image only.",
      defaultValue: false,
    }),
    html: optionalLongText(
      "Custom HTML (HTML type only)",
      "Pasted iframe or HTML snippet. Used when type = Custom HTML.",
    ),
    caption: optionalLongText(
      "Caption",
      "Optional caption shown beneath the media. Supports line breaks.",
    ),
    width: cssValue("Width"),
    maxWidth: cssValue("Max width"),
    height: cssValue("Height"),
    maxHeight: cssValue("Max height"),
    aspectRatio: cssValue("Aspect ratio", "CSS aspect-ratio, e.g. 16 / 9 or 4 / 5."),
    align: fields.select({
      label: "Alignment",
      defaultValue: "",
      options: selectOptions.align,
    }),
    variant: fields.select({
      label: "Size variant",
      description: "Preset width container.",
      defaultValue: "",
      options: selectOptions.variant,
    }),
    objectFit: fields.select({
      label: "Object fit",
      description: "How the image fills its frame when width/height are constrained.",
      defaultValue: "",
      options: selectOptions.objectFit,
    }),
    linkUrl: optionalText("Link URL", "Wrap the media in a link to this URL."),
    openInNewTab: fields.checkbox({
      label: "Open link in new tab",
      defaultValue: true,
    }),
    spacingTop: cssValue("Spacing above"),
    spacingBottom: cssValue("Spacing below"),
  });
}

function makeProjectSchema(pageSlug: string) {
  const mediaSchema = makeMediaSchema(pageSlug);
  const relatedSchema = fields.object({
    text: fields.text({
      label: "Anchor text",
      description: "Link text shown in the Related: line.",
    }),
    href: fields.text({
      label: "URL or anchor",
      description:
        "Where the link points. Use /digital-media/#project-slug to deep-link another project, or a full URL for external pages.",
    }),
  });
  return fields.object({
    title: fields.text({
      label: "Project title",
      description: "Shown as the dropdown header on the page.",
    }),
    slug: optionalText(
      "URL slug (optional)",
      "Anchor used for deep-linking (e.g. ?...#my-project). Auto-derived from the title if blank.",
    ),
    order: fields.array(
      fields.select({
        label: "Content part",
        description:
          "Choose the order parts appear inside the dropdown. Each entry pulls the next item from its corresponding list below.",
        defaultValue: "description",
        options: [
          { label: "Description", value: "description" },
          { label: "Media (next item)", value: "media" },
          { label: "Stack list", value: "stack" },
          { label: "Button link (next item)", value: "buttonlink" },
          { label: "Note", value: "note" },
          { label: "Related projects", value: "related" },
        ],
      }),
      {
        label: "Display order",
        description: "Order of parts inside the open dropdown.",
        itemLabel: (props) => props.value || "—",
      },
    ),
    description: optionalLongText(
      "Description",
      "1–3 sentences describing the project. Plain text, line breaks supported.",
    ),
    media: fields.array(mediaSchema, {
      label: "Media items",
      description:
        "Images / videos / embeds for this project. Pulled in order by each \"Media\" entry in Display order.",
      itemLabel: (props) => {
        const t = props.fields.type.value;
        const label =
          props.fields.title.value ||
          props.fields.alt.value ||
          props.fields.pickExisting.value ||
          props.fields.src.value ||
          "(unnamed)";
        return `${t}: ${label}`;
      },
    }),
    buttonlinks: fields.array(buttonLinkSchema, {
      label: "Button links",
      description: "Pulled in order by each \"Button link\" entry in Display order.",
      itemLabel: (props) => props.fields.text.value || props.fields.href.value || "(unnamed)",
    }),
    stack: fields.array(fields.text({ label: "Stack item" }), {
      label: "Stack",
      description: "Tools / tech bullets shown under \"The Stack:\".",
      itemLabel: (props) => props.value || "(empty)",
    }),
    note: optionalLongText(
      "Note",
      "Italic note shown at the end (or wherever \"Note\" appears in Display order).",
    ),
    related: fields.array(relatedSchema, {
      label: "Related projects",
      description:
        "Optional. Renders as \"Related: link, link\" under the stack (or wherever \"Related projects\" appears in Display order). Empty = nothing renders.",
      itemLabel: (props) => props.fields.text.value || props.fields.href.value || "(empty)",
    }),
  });
}

function makeContentItemSchema(pageSlug: string) {
  const projectSchema = makeProjectSchema(pageSlug);
  const uploadsDir = pageUploadDir(pageSlug);
  return fields.object({
    type: fields.select({
      label: "Block type",
      description: "What kind of content block this is.",
      defaultValue: "text",
      options: [
        { label: "Text", value: "text" },
        { label: "Image", value: "image" },
        { label: "YouTube", value: "youtube" },
        { label: "Vimeo", value: "vimeo" },
        { label: "LinkedIn", value: "linkedin" },
        { label: "Custom HTML", value: "html" },
        { label: "Button link", value: "buttonlink" },
        { label: "Inline link", value: "inlinelink" },
        { label: "Line break", value: "linebreak" },
        { label: "Section (H2 + projects)", value: "section" },
      ],
    }),
    text: optionalLongText("Text (Text / link types)", "Body text, button label, or link text."),
    href: optionalText("URL (link types)", "Where the button or inline link points."),
    newline: fields.checkbox({
      label: "Add newline after button",
      description: "Adds a line break after a Button link block.",
      defaultValue: true,
    }),
    heading: optionalText("Section heading (Section only)", "Shown as the H2 above the projects."),
    intro: optionalLongText(
      "Section intro (Section only)",
      "Optional paragraph shown between the heading and the project dropdowns.",
    ),
    trailingLineBreak: fields.checkbox({
      label: "Trailing line break after section",
      defaultValue: true,
    }),
    projects: fields.array(projectSchema, {
      label: "Projects (Section only)",
      description: "Each project becomes an expandable dropdown under the section heading.",
      itemLabel: (props) => props.fields.title.value || "(untitled project)",
    }),
    pickExisting: fields.select({
      label: "Pick existing image (Image only)",
      description: "For Image blocks: pick an existing image from this page's folder.",
      defaultValue: "",
      options: listExistingImageOptions(pageSlug),
    }),
    image: imageUpload(
      "Upload new image (Image only)",
      uploadsDir,
      "For Image blocks. Uploads land in this page's _uploads/ folder.",
    ),
    src: optionalText(
      "Manual path or embed URL",
      "Image path or Vimeo/LinkedIn/HTML embed URL.",
    ),
    videoId: optionalText("YouTube video ID", "Just the ID, not the full URL."),
    title: optionalText("Embed or link title", "Used as iframe title for accessibility."),
    alt: optionalText("Alt text", "Describe the image for screen readers."),
    eager: fields.checkbox({
      label: "Load eagerly (above the fold)",
      description:
        "Image only. Skip lazy-loading and prioritize this image. Use for the hero / first visible image only.",
      defaultValue: false,
    }),
    html: optionalLongText("Custom HTML (HTML only)"),
    caption: optionalLongText("Caption"),
    width: cssValue("Width"),
    maxWidth: cssValue("Max width"),
    height: cssValue("Height"),
    maxHeight: cssValue("Max height"),
    aspectRatio: cssValue("Aspect ratio"),
    align: fields.select({ label: "Alignment", defaultValue: "", options: selectOptions.align }),
    variant: fields.select({
      label: "Size variant",
      defaultValue: "",
      options: selectOptions.variant,
    }),
    objectFit: fields.select({
      label: "Object fit",
      defaultValue: "",
      options: selectOptions.objectFit,
    }),
    linkUrl: optionalText("Media link URL", "Wrap the media in a link."),
    openInNewTab: fields.checkbox({
      label: "Open link in new tab",
      defaultValue: true,
    }),
    spacingTop: cssValue("Spacing above"),
    spacingBottom: cssValue("Spacing below"),
  });
}

function makePageSchema(pageSlug: string) {
  return {
    slug: fields.text({
      label: "Slug",
      description: "URL path segment. Don't change this casually — it changes the page URL.",
    }),
    windowTitle: fields.text({
      label: "Terminal window title",
      description: "Shown in the fake terminal title bar, e.g. \"/Demand_Gen/\".",
    }),
    h1: optionalText("H1 heading", "Optional H1 shown above the content. Leave blank for none."),
    navigation: navigationSchema,
    seo: seoSchema,
    prompt: promptSchema,
    content: fields.array(makeContentItemSchema(pageSlug), {
      label: "Page content",
      description: "Blocks render top to bottom inside the terminal window.",
      itemLabel: (props) => {
        const type = props.fields.type.value;
        const summary =
          props.fields.heading.value ||
          props.fields.text.value ||
          props.fields.alt.value ||
          props.fields.pickExisting.value ||
          props.fields.src.value ||
          "";
        return summary ? `${type}: ${summary}` : type;
      },
    }),
  };
}

const pageSingleton = (label: string, slug: string) =>
  singleton({
    label,
    path: `src/content/pages/${slug}`,
    entryLayout: "form",
    schema: makePageSchema(slug),
  });

function getRepoConfig(): `${string}/${string}` {
  const repo = process.env.NEXT_PUBLIC_KEYSTATIC_REPO;
  if (repo && repo.includes("/")) return repo as `${string}/${string}`;
  return "spencerflaherty/spencerflaherty.github.io";
}

export default config({
  storage:
    process.env.NEXT_PUBLIC_KEYSTATIC_STORAGE_KIND === "local"
      ? { kind: "local" }
      : {
          kind: "github",
          repo: getRepoConfig(),
        },
  ui: {
    brand: { name: "Spencer Flaherty Portfolio CMS" },
  },
  singletons: {
    site: singleton({
      label: "Site Settings",
      path: "src/_data/site",
      entryLayout: "form",
      schema: {
        url: fields.text({
          label: "Base URL",
          description: "Site origin without trailing slash, e.g. https://spencerflaherty.com.",
        }),
        branding: fields.object(
          {
            homeAriaLabel: optionalText(
              "Home link aria-label",
              "Accessible label for the logo link.",
            ),
            logoAlt: fields.text({ label: "Logo alt text" }),
            faviconSrc: imageUpload("Favicon", SHARED_DIR),
            logoDesktopSrc: imageUpload("Desktop logo", SHARED_DIR),
            logoDesktopWidth: fields.integer({
              label: "Desktop logo width (px)",
              validation: { isRequired: true, min: 1 },
            }),
            logoDesktopHeight: fields.integer({
              label: "Desktop logo height (px)",
              validation: { isRequired: true, min: 1 },
            }),
            logoMobileSrc: imageUpload("Mobile logo", SHARED_DIR),
            logoMobileWidth: fields.integer({
              label: "Mobile logo width (px)",
              validation: { isRequired: true, min: 1 },
            }),
            logoMobileHeight: fields.integer({
              label: "Mobile logo height (px)",
              validation: { isRequired: true, min: 1 },
            }),
          },
          { label: "Branding" },
        ),
        terminal: fields.object(
          {
            host: fields.text({
              label: "Prompt host label",
              description: "First half of the prompt, e.g. root@spencer-portfolio.",
            }),
            rootPath: fields.text({
              label: "Prompt root path",
              description: "Path shown after the host, e.g. ~.",
            }),
            navigationCommand: fields.text({
              label: "Navigation command",
              description: "Command shown before the nav menu, e.g. ./display_categories.",
            }),
            navigationPrompt: fields.text({
              label: "Navigation prompt",
              description: "Text shown asking the user to pick a number, e.g. \"Enter module ID\".",
            }),
            typeSpeed: fields.integer({
              label: "Typing speed (ms per character)",
              description: "Lower = faster typing animation.",
              validation: { isRequired: true, min: 1 },
            }),
            initialDelayMs: fields.integer({
              label: "Initial load delay (ms)",
              description: "Pause before typing starts on page load.",
              validation: { isRequired: true, min: 0 },
            }),
          },
          { label: "Terminal behavior" },
        ),
        layout: fields.object(
          {
            logoLinkUrl: fields.text({
              label: "Logo link URL",
              description: "Where clicking the logo goes. Usually /.",
            }),
            paddingAboveLogo: cssValue("Padding above logo"),
            paddingBelowLogo: cssValue("Padding below logo"),
            paddingBelowWindow: cssValue("Padding below terminal window"),
            windowWidthDesktop: cssValue("Terminal window width, desktop"),
            windowWidthMobile: cssValue("Terminal window width, mobile"),
            spacing: fields.object(
              {
                h1MarginTop: cssValue("H1 margin top"),
                h1MarginBottom: cssValue("H1 margin bottom"),
                h2MarginTop: cssValue("H2 margin top"),
                h2MarginBottom: cssValue("H2 margin bottom"),
                dropdownMarginBottom: cssValue("Dropdown margin bottom"),
              },
              { label: "Spacing" },
            ),
          },
          { label: "Layout" },
        ),
      },
    }),
    home: pageSingleton("Home Page", "home"),
    about: pageSingleton("About Page", "about"),
    demandGen: pageSingleton("Demand Gen Page", "demand-gen"),
    aiSystems: pageSingleton("AI Systems Page", "ai-systems"),
    digitalMedia: pageSingleton("Digital Media Page", "digital-media"),
  },
});
