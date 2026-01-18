import type { PageMeta } from "../interface/meta";

const DEFAULT_TITLE = "Fractal";
const DEFAULT_ICON = "/FractalFrontend/vite.svg";

export const applyPageMeta = (meta: PageMeta = {}) => {
  // TITLE
  document.title = meta.base?.title
    ? `${meta.base.title} | ${DEFAULT_TITLE}`
    : DEFAULT_TITLE;

  // ICON
  setFavicon(meta.base?.icon || DEFAULT_ICON);

  // BASE META TAGS
  applyNamedMeta({
    description: meta.base?.description,
    keywords: meta.base?.keywords,
  });

  // OPEN GRAPH
  applyPropertyMeta("og", meta.og);

  // TWITTER
  applyNamedMeta(
    Object.entries(meta.twitter || {}).reduce(
      (acc, [key, value]) => {
        acc[`twitter:${key}`] = value;
        return acc;
      },
      {} as Record<string, string>,
    ),
  );

  // CUSTOM META
  if (meta.custom) {
    applyNamedMeta(meta.custom);
  }
};

const applyNamedMeta = (meta: Record<string, any>) => {
  Object.entries(meta).forEach(([name, content]) => {
    if (!content) return;

    let tag =
      document.querySelector(`meta[name="${name}"]`) ||
      document.createElement("meta");

    tag.setAttribute("name", name);
    tag.setAttribute("content", String(content));

    document.head.appendChild(tag);
  });
};

const applyPropertyMeta = (prefix: string, meta?: Record<string, any>) => {
  if (!meta) return;

  Object.entries(meta).forEach(([key, value]) => {
    if (!value) return;

    const property = `${prefix}:${key}`;

    let tag =
      document.querySelector(`meta[property="${property}"]`) ||
      document.createElement("meta");

    tag.setAttribute("property", property);
    tag.setAttribute("content", String(value));

    document.head.appendChild(tag);
  });
};

const setFavicon = (icon: string) => {
  let link =
    document.querySelector("link[rel='icon']") ||
    document.createElement("link");

  link.setAttribute("rel", "icon");
  link.setAttribute("href", icon);

  document.head.appendChild(link);
};
