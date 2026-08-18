const SITE_URL = "https://zohrehsadeghi.se";

export const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Zohreh Sadeghi",
  url: SITE_URL,
  jobTitle: "Fullstack Developer",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Malmö",
    addressCountry: "SE",
  },
};

export const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Zohreh Sadeghi — Portfolio",
  url: SITE_URL,
};
