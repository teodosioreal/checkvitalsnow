export const site = {
  name: 'CheckVitalsNow',
  url: 'https://checkvitalsnow.com',
  description:
    "Clear, practical women's health guides on bladder health, hormones, energy, stress, and bone health, based on trusted medical sources.",
  locale: 'en_US',
};

export const categories = {
  'womens-health': {
    name: "Women's Health",
    description:
      'Bladder leakage, hormone changes, constant tiredness, stress, and bone health: practical guides for women from perimenopause to life after menopause.',
  },
} as const;

export const author = {
  name: 'CheckVitalsNow Editorial Team',
};

export const nav: { label: string; href: string }[] = [
  { label: "Women's Health", href: '/womens-health/' },
  { label: 'About', href: '/about/' },
  { label: 'How We Write', href: '/editorial-policy/' },
];

export const footerLinks: { label: string; href: string }[] = [
  { label: 'About Us', href: '/about/' },
  { label: 'Editorial Policy', href: '/editorial-policy/' },
  { label: 'Medical Disclaimer', href: '/medical-disclaimer/' },
  { label: 'Privacy Policy', href: '/privacy-policy/' },
  { label: 'Terms of Use', href: '/terms-of-use/' },
  { label: 'Contact', href: '/contact/' },
];

// How every guide is researched and written.
export const standards = [
  {
    name: 'Built on trusted sources',
    text: 'We rely on primary sources such as the NIH, CDC, MedlinePlus, Mayo Clinic, Cleveland Clinic, and peer-reviewed research, and we link them at the end of every guide.',
  },
  {
    name: 'Written in plain language',
    text: 'Short sentences, everyday words, and concrete steps you can use today. Medical terms are explained the first time they appear.',
  },
  {
    name: 'Honest about the evidence',
    text: 'When research is limited or mixed, we say so instead of overstating what is known.',
  },
  {
    name: 'Safety first',
    text: 'Every guide lists the warning signs that mean you should see a doctor, and none of them is meant to replace one.',
  },
  {
    name: 'Kept up to date',
    text: 'Each guide shows when it was published and last updated, and we correct mistakes as soon as we confirm them.',
  },
];

export const promises = [
  'Our guides do not sell or recommend products.',
  'We never claim a supplement, food, or home remedy cures, treats, or prevents a disease.',
  'We never invent statistics, studies, quotes, or experts.',
  'We tell you when the evidence is thin.',
  'We will always point you to a doctor when symptoms need one.',
];

export const disclaimers = {
  fda: 'These statements have not been evaluated by the Food and Drug Administration. This product is not intended to diagnose, treat, cure, or prevent any disease.',
  medical:
    'This content is for informational purposes only and is not a substitute for professional medical advice. Talk to your doctor before starting any supplement, especially if you are pregnant, nursing, taking medication, or have a medical condition.',
};
