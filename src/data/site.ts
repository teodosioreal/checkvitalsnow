export const site = {
  name: 'CheckVitalsNow',
  url: 'https://checkvitalsnow.com',
  description:
    'Clear, practical health and wellness guides on everyday questions, from energy and stress to bladder health, hormones, and healthy aging, based on trusted medical sources.',
  locale: 'en_US',
};

export const categories = {
  'womens-health': {
    name: "Women's Health",
    title: "Women's Health Guides | CheckVitalsNow",
    metaDescription:
      'Practical, medically sourced guides on bladder leakage, hormones, fatigue, stress, and bone health for women.',
    description:
      'Bladder leakage, hormone changes, constant tiredness, stress, and bone health: practical guides for women from perimenopause to life after menopause.',
    about: [
      "Many of the questions in this section are ones women put off asking: small leaks when you laugh, waking up at night to pee, hot flashes that arrive years before your last period, or a tiredness that sleep doesn't fix. They are common, and most have clear first steps.",
      "Each guide explains what is happening in the body in plain language, gives you a practical tool to use at home, such as a bladder diary or a symptom checklist, and lists the signs that mean it is time to see a doctor.",
    ],
  },
  'pain-and-nerves': {
    name: 'Pain & Nerve Health',
    title: 'Pain and Nerve Health Guides | CheckVitalsNow',
    metaDescription:
      'Plain-language guides on sciatica, back and neck pain, numb hands, burning feet, restless legs, and stiffness, with steps you can try at home.',
    description:
      'Sciatica, back and neck pain, numb or tingling hands, burning feet, restless legs, and stiff joints: what is behind the pain, what you can try at home, and the signs that need a doctor.',
    about: [
      "Back pain, a stiff neck, numb hands at night, or burning feet can make ordinary days harder. These guides help you understand where the pain may be coming from and what you can safely try at home first.",
      "You will find simple routines, posture and sleep changes, and trackers to bring to your appointment. Every guide also names the warning signs, such as weakness or loss of bladder control, that need medical care right away.",
    ],
  },
  'brain-and-balance': {
    name: 'Brain, Balance & Hearing',
    title: 'Brain Fog, Dizziness and Tinnitus Guides | CheckVitalsNow',
    metaDescription:
      'Clear guides on brain fog, constant fatigue, dizziness, vertigo, and ringing in the ears: common causes, what can help, and when to see a doctor.',
    description:
      'Brain fog, constant fatigue, dizziness, vertigo, and ringing in the ears: common causes, practical steps, and the warning signs to take seriously.',
    about: [
      "Brain fog, dizziness, ringing in the ears, and changes in hearing or memory can be unsettling, especially when they come on without a clear reason. Many causes are common and manageable once you know what to look for.",
      "These guides help you describe what you are feeling, sort everyday causes from the ones that need a doctor, and take practical steps for sleep, focus, and balance in the meantime.",
    ],
  },
  'heart-health': {
    name: 'Heart Health',
    title: 'Heart Health and Blood Pressure Guides | CheckVitalsNow',
    metaDescription:
      'Plain-language guides on blood pressure, cholesterol, heart rate, palpitations, walking, and sleep, with steps you can take today.',
    description:
      'Blood pressure, cholesterol, heart rate, and palpitations: what your numbers mean, daily habits that can help, and when to get care.',
    about: [
      "Heart health is built in daily habits: how much you move, how you sleep, what you eat, and whether you know your numbers. This section explains blood pressure, cholesterol, and heart rate in plain language.",
      "You will find logs to track your readings, simple plans for walking and sitting less, and clear guidance on which symptoms can wait for a regular visit and which need care right away.",
    ],
  },
  'mens-health': {
    name: "Men's Health",
    title: "Men's Health Guides | CheckVitalsNow",
    metaDescription:
      'Clear, medically sourced guides for men on prostate health, testosterone, sleep, weight, strength, stress, and checkups by age.',
    description:
      'Prostate changes, testosterone, sleep, strength, stress, and the checkups men tend to put off: plain-language guides on what is normal, what can help, and when to see a doctor.',
    about: [
      "Men often wait longer than they should to bring up health questions. This section covers the everyday ones: prostate and urinary changes, energy and testosterone, sleep, weight, strength, stress, and the checkups that matter at each age.",
      "Each guide gives you a clear explanation, a practical tool such as a bladder diary, a training plan, or a screening checklist, and the signs that mean it is time to see a doctor.",
    ],
  },
} as const;

export const author = {
  name: 'CheckVitalsNow Editorial Team',
};

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
  'Our guides do not sell or promote products.',
  'We never promise cures or quick fixes.',
  'We never invent statistics, studies, quotes, or experts.',
  'We tell you when the evidence is thin.',
  'We will always point you to a doctor when symptoms need one.',
];

export const disclaimers = {
  medical:
    'This content is for general information only and is not a substitute for professional medical advice, diagnosis, or treatment. Always ask your doctor or another qualified health professional about any questions you have about your health.',
};

/**
 * Reader comments (functions/api/comments.js). Every comment is held for moderation at /moderate/.
 * turnstileSiteKey is the public Cloudflare Turnstile site key; until it is set, the form stays closed.
 */
export const comments = {
  turnstileSiteKey: null as string | null,
};
