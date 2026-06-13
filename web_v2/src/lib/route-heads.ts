import { BASE_URL, getDict, LOCALES, localePath, type Locale } from "@/lib/i18n";

/** Build the absolute URL of the dynamic OG image (/og.png) for a page. */
export function ogImageUrl(params: { eyebrow?: string; title: string; desc?: string }): string {
  const sp = new URLSearchParams();
  if (params.eyebrow) sp.set("eyebrow", params.eyebrow);
  sp.set("title", params.title);
  if (params.desc) sp.set("desc", params.desc);
  return `${BASE_URL}/og.png?${sp.toString()}`;
}

/** Full set of og:image + twitter:image meta tags for a given image URL. */
export function ogImageMeta(imageUrl: string, alt: string) {
  return [
    { property: "og:image", content: imageUrl },
    { property: "og:image:type", content: "image/png" },
    { property: "og:image:width", content: "1200" },
    { property: "og:image:height", content: "630" },
    { property: "og:image:alt", content: alt },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:image", content: imageUrl },
  ];
}

function hreflangLinks(page: "/" | "/dashboard") {
  const items: { rel: "alternate"; hrefLang: string; href: string }[] = LOCALES.map((l) => ({
    rel: "alternate",
    hrefLang: l,
    href: `${BASE_URL}${localePath(l, page)}`,
  }));
  items.push({
    rel: "alternate",
    hrefLang: "x-default",
    href: `${BASE_URL}${localePath("pt", page)}`,
  });
  return items;
}

export function buildLandingHead(locale: Locale) {
  const t = getDict(locale);
  const url = `${BASE_URL}${localePath(locale, "/")}`;
  const ogImage = ogImageUrl({ title: t.meta.homeOgTitle, desc: t.meta.homeOgDesc });
  return {
    meta: [
      { title: t.meta.homeTitle },
      { name: "description", content: t.meta.homeDesc },
      { property: "og:title", content: t.meta.homeOgTitle },
      { property: "og:description", content: t.meta.homeOgDesc },
      { property: "og:url", content: url },
      { property: "og:locale", content: locale === "pt" ? "pt_BR" : locale === "es" ? "es_ES" : "en_US" },
      ...ogImageMeta(ogImage, t.meta.homeOgTitle),
    ],
    links: [
      { rel: "canonical", href: url },
      ...hreflangLinks("/"),
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: "Grifo",
          applicationCategory: "EducationalApplication",
          operatingSystem: "All",
          url,
          inLanguage: locale,
          offers: { "@type": "Offer", price: "0", priceCurrency: locale === "pt" ? "BRL" : locale === "es" ? "EUR" : "USD" },
        }),
      },
    ],
  };
}

export function buildDashboardHead(locale: Locale) {
  const t = getDict(locale);
  const url = `${BASE_URL}${localePath(locale, "/dashboard")}`;
  const ogImage = ogImageUrl({
    eyebrow: "Grifo · Dashboard",
    title: t.meta.dashboardTitle,
    desc: t.meta.dashboardDesc,
  });
  return {
    meta: [
      { title: t.meta.dashboardTitle },
      { name: "description", content: t.meta.dashboardDesc },
      { property: "og:title", content: t.meta.dashboardTitle },
      { property: "og:description", content: t.meta.dashboardDesc },
      { property: "og:url", content: url },
      { property: "og:locale", content: locale === "pt" ? "pt_BR" : locale === "es" ? "es_ES" : "en_US" },
      ...ogImageMeta(ogImage, t.meta.dashboardTitle),
    ],
    links: [
      { rel: "canonical", href: url },
      ...hreflangLinks("/dashboard"),
    ],
  };
}