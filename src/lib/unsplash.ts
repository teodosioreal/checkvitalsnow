// Unsplash requires hotlinking; imgix params resize and convert on their CDN.
export const unsplash = (raw: string, w: number) =>
  `${raw}${raw.includes('?') ? '&' : '?'}w=${w}&h=${Math.round((w * 9) / 16)}&fit=crop&crop=entropy&fm=webp&q=70`;
