// Real details about who runs the site, used on the About, Contact, Privacy, and Terms pages.
// Leave a field as null until it is confirmed. Pages hide anything that is null, and the
// Contact page stays noindex (and out of the sitemap) until contactEmail is set.
export const owner = {
  /** Person or company that owns and operates the site, e.g. "Jane Doe" or "Example LLC". */
  name: null,
  /** Public contact address, e.g. "contact@checkvitalsnow.com". */
  contactEmail: null,
  /** Country (and state, if relevant) whose laws govern the Terms of Use, e.g. "the State of Florida, USA". */
  jurisdiction: null,
};

/** Date the legal pages (privacy, terms, disclosures) were last reviewed. */
export const legalUpdated = '2026-10-12';
