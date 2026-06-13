import { BASE_URL, getDict, LOCALES, localePath, type Locale } from "@/lib/i18n";

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
  return {
    meta: [
      { title: t.meta.homeTitle },
      { name: "description", content: t.meta.homeDesc },
      { property: "og:title", content: t.meta.homeOgTitle },
      { property: "og:description", content: t.meta.homeOgDesc },
      { property: "og:url", content: url },
      { property: "og:locale", content: locale === "pt" ? "pt_BR" : locale === "es" ? "es_ES" : "en_US" },
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
  return {
    meta: [
      { title: t.meta.dashboardTitle },
      { name: "description", content: t.meta.dashboardDesc },
      { property: "og:title", content: t.meta.dashboardTitle },
      { property: "og:description", content: t.meta.dashboardDesc },
      { property: "og:url", content: url },
      { property: "og:locale", content: locale === "pt" ? "pt_BR" : locale === "es" ? "es_ES" : "en_US" },
    ],
    links: [
      { rel: "canonical", href: url },
      ...hreflangLinks("/dashboard"),
    ],
  };
}