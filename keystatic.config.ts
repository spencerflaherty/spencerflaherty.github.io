import { config, fields, singleton } from "@keystatic/core";

const optionalText = (label: string, description?: string) =>
  fields.text({ label, description, validation: { isRequired: false } });

const optionalLongText = (label: string, description?: string) =>
  fields.text({
    label,
    description,
    multiline: true,
    validation: { isRequired: false },
  });

const cssValue = (label: string) =>
  optionalText(label, "CSS value, for example 680px, 60vw, 100%, or 16 / 9.");

const imageUpload = (label: string, directory = "src/static/collections/uploads") =>
  fields.image({
    label,
    directory,
    publicPath: directory.replace(/^src/, ""),
  });

const selectOptions = {
  align: [
    { label: "Default", value: "" },
    { label: "Left", value: "left" },
    { label: "Center", value: "center" },
    { label: "Right", value: "right" },
    { label: "Full", value: "full" },
  ],
  variant: [
    { label: "Default", value: "" },
    { label: "Small", value: "sm" },
    { label: "Medium", value: "md" },
    { label: "Large", value: "lg" },
  ],
  objectFit: [
    { label: "Default", value: "" },
    { label: "Contain", value: "contain" },
    { label: "Cover", value: "cover" },
    { label: "Fill", value: "fill" },
    { label: "None", value: "none" },
    { label: "Scale down", value: "scale-down" },
  ],
} as const;

const navigationSchema = fields.object({
  showInNavigation: fields.checkbox({ label: "Show in navigation", defaultValue: true }),
  label: fields.text({ label: "Menu label" }),
  order: fields.integer({
    label: "Menu order",
    defaultValue: 0,
    validation: { isRequired: true, min: 0 },
  }),
});

const seoSchema = fields.object({
  title: fields.text({ label: "Title" }),
  description: fields.text({ label: "Description", multiline: true }),
  url: optionalText("Canonical / Open Graph URL"),
  ogImage: imageUpload("Open Graph image", "src/static/collections/shared"),
  ogTitle: optionalText("Open Graph title override"),
  ogDescription: optionalLongText("Open Graph description override"),
  twitterTitle: optionalText("Twitter title override"),
  twitterDescription: optionalLongText("Twitter description override"),
  twitterImage: imageUpload("Twitter image override", "src/static/collections/shared"),
});

const promptSchema = fields.object({
  cwd: optionalText("Working directory"),
  command: fields.text({ label: "Command" }),
});

const mediaSchema = fields.object({
  type: fields.select({
    label: "Type",
    defaultValue: "image",
    options: [
      { label: "Image", value: "image" },
      { label: "YouTube", value: "youtube" },
      { label: "Vimeo", value: "vimeo" },
      { label: "LinkedIn", value: "linkedin" },
      { label: "Custom HTML", value: "html" },
    ],
  }),
  src: optionalText("Image path or embed URL"),
  image: imageUpload("Image upload"),
  videoId: optionalText("YouTube video ID"),
  title: optionalText("Embed title"),
  alt: optionalText("Alt text"),
  html: optionalLongText("Custom HTML"),
  caption: optionalLongText("Caption"),
  width: cssValue("Width"),
  maxWidth: cssValue("Max width"),
  height: cssValue("Height"),
  maxHeight: cssValue("Max height"),
  aspectRatio: cssValue("Aspect ratio"),
  align: fields.select({ label: "Alignment", defaultValue: "", options: selectOptions.align }),
  variant: fields.select({ label: "Size variant", defaultValue: "", options: selectOptions.variant }),
  objectFit: fields.select({ label: "Object fit", defaultValue: "", options: selectOptions.objectFit }),
  linkUrl: optionalText("Link URL"),
  openInNewTab: fields.checkbox({ label: "Open link in new tab", defaultValue: true }),
  spacingTop: cssValue("Spacing top"),
  spacingBottom: cssValue("Spacing bottom"),
});

const buttonLinkSchema = fields.object({
  href: fields.text({ label: "URL" }),
  text: fields.text({ label: "Text" }),
  openInNewTab: fields.checkbox({ label: "Open in new tab", defaultValue: true }),
});

const projectSchema = fields.object({
  title: fields.text({ label: "Title" }),
  order: fields.array(
    fields.select({
      label: "Content part",
      defaultValue: "description",
      options: [
        { label: "Description", value: "description" },
        { label: "Media", value: "media" },
        { label: "Stack", value: "stack" },
        { label: "Button link", value: "buttonlink" },
        { label: "Note", value: "note" },
      ],
    }),
    { label: "Display order", itemLabel: (props) => props.value },
  ),
  description: optionalLongText("Description"),
  media: fields.array(mediaSchema, {
    label: "Media",
    itemLabel: (props) =>
      props.fields.title.value ||
      props.fields.alt.value ||
      props.fields.src.value ||
      props.fields.type.value,
  }),
  buttonlinks: fields.array(buttonLinkSchema, {
    label: "Button links",
    itemLabel: (props) => props.fields.text.value || props.fields.href.value,
  }),
  stack: fields.array(fields.text({ label: "Stack item" }), {
    label: "Stack",
    itemLabel: (props) => props.value,
  }),
  note: optionalLongText("Note"),
});

const contentItemSchema = fields.object({
  type: fields.select({
    label: "Type",
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
      { label: "Section", value: "section" },
    ],
  }),
  text: optionalLongText("Text"),
  href: optionalText("URL"),
  newline: fields.checkbox({ label: "Add newline after button", defaultValue: true }),
  heading: optionalText("Section heading"),
  intro: optionalLongText("Section intro"),
  trailingLineBreak: fields.checkbox({
    label: "Add trailing line break after section",
    defaultValue: true,
  }),
  projects: fields.array(projectSchema, {
    label: "Projects",
    itemLabel: (props) => props.fields.title.value,
  }),
  src: optionalText("Image path or embed URL"),
  image: imageUpload("Image upload"),
  videoId: optionalText("YouTube video ID"),
  title: optionalText("Embed or link title"),
  alt: optionalText("Alt text"),
  html: optionalLongText("Custom HTML"),
  caption: optionalLongText("Caption"),
  width: cssValue("Width"),
  maxWidth: cssValue("Max width"),
  height: cssValue("Height"),
  maxHeight: cssValue("Max height"),
  aspectRatio: cssValue("Aspect ratio"),
  align: fields.select({ label: "Alignment", defaultValue: "", options: selectOptions.align }),
  variant: fields.select({ label: "Size variant", defaultValue: "", options: selectOptions.variant }),
  objectFit: fields.select({ label: "Object fit", defaultValue: "", options: selectOptions.objectFit }),
  linkUrl: optionalText("Media link URL"),
  openInNewTab: fields.checkbox({ label: "Open link in new tab", defaultValue: true }),
  spacingTop: cssValue("Spacing top"),
  spacingBottom: cssValue("Spacing bottom"),
});

const pageSchema = {
  slug: fields.text({ label: "Slug" }),
  windowTitle: fields.text({ label: "Window title" }),
  h1: optionalText("H1"),
  navigation: navigationSchema,
  seo: seoSchema,
  prompt: promptSchema,
  content: fields.array(contentItemSchema, {
    label: "Content",
    itemLabel: (props) =>
      props.fields.heading.value ||
      props.fields.title.value ||
      props.fields.text.value ||
      props.fields.type.value,
  }),
};

const pageSingleton = (label: string, path: string) =>
  singleton({
    label,
    path,
    entryLayout: "form",
    schema: pageSchema,
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
        url: fields.text({ label: "Base URL" }),
        branding: fields.object({
          homeAriaLabel: optionalText("Home link aria label"),
          logoAlt: fields.text({ label: "Logo alt text" }),
          faviconSrc: imageUpload("Favicon", "src/static/collections/shared"),
          logoDesktopSrc: imageUpload("Desktop logo", "src/static/collections/shared"),
          logoDesktopWidth: fields.integer({
            label: "Desktop logo width",
            validation: { isRequired: true, min: 1 },
          }),
          logoDesktopHeight: fields.integer({
            label: "Desktop logo height",
            validation: { isRequired: true, min: 1 },
          }),
          logoMobileSrc: imageUpload("Mobile logo", "src/static/collections/shared"),
          logoMobileWidth: fields.integer({
            label: "Mobile logo width",
            validation: { isRequired: true, min: 1 },
          }),
          logoMobileHeight: fields.integer({
            label: "Mobile logo height",
            validation: { isRequired: true, min: 1 },
          }),
        }),
        terminal: fields.object({
          host: fields.text({ label: "Prompt host label" }),
          rootPath: fields.text({ label: "Prompt root path" }),
          navigationCommand: fields.text({ label: "Navigation command" }),
          navigationPrompt: fields.text({ label: "Navigation prompt" }),
          typeSpeed: fields.integer({
            label: "Typing speed",
            validation: { isRequired: true, min: 1 },
          }),
          initialDelayMs: fields.integer({
            label: "Initial load delay (ms)",
            validation: { isRequired: true, min: 0 },
          }),
        }),
        layout: fields.object({
          logoLinkUrl: fields.text({ label: "Logo link URL" }),
          paddingAboveLogo: cssValue("Padding above logo"),
          paddingBelowLogo: cssValue("Padding below logo"),
          paddingBelowWindow: cssValue("Padding below terminal window"),
          windowWidthDesktop: cssValue("Terminal window width, desktop"),
          windowWidthMobile: cssValue("Terminal window width, mobile"),
          spacing: fields.object({
            h1MarginTop: cssValue("H1 margin top"),
            h1MarginBottom: cssValue("H1 margin bottom"),
            h2MarginTop: cssValue("H2 margin top"),
            h2MarginBottom: cssValue("H2 margin bottom"),
            dropdownMarginBottom: cssValue("Dropdown margin bottom"),
          }),
        }),
      },
    }),
    home: pageSingleton("Home Page", "src/content/pages/home"),
    about: pageSingleton("About Page", "src/content/pages/about"),
    demandGen: pageSingleton("Demand Gen Page", "src/content/pages/demand-gen"),
    aiSystems: pageSingleton("AI Systems Page", "src/content/pages/ai-systems"),
    digitalMedia: pageSingleton("Digital Media Page", "src/content/pages/digital-media"),
  },
});
