const SITE_URL = "https://www.zohrehsadeghi.se";

export const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Zohreh Sadeghi",
  url: SITE_URL,
  jobTitle: "Fullstack Developer",
  sameAs: ["https://github.com/Zoritta", "https://www.linkedin.com/in/zohreh-sadeghi"],
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
