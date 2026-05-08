export const contact = {
  whatsappNumber: '6281200000000', // founder to replace
  whatsappMessages: {
    id: 'Halo Banua Coder, saya tertarik untuk konsultasi mengenai',
    en: "Hi Banua Coder, I'd like to discuss a project —",
  },
  email: 'hello@banuacoder.com',
  office: {
    city: 'Palu',
    region: 'Sulawesi Tengah',
    country: 'Indonesia',
    coords: { lat: -0.8917, lng: 119.8707 }, // approx Palu
  },
  hours: { id: 'Senin–Jumat, 09:00–17:00 WITA', en: 'Mon–Fri, 09:00–17:00 WITA' },
  socials: {
    linkedin: 'https://linkedin.com/company/banuacoder',
    instagram: 'https://instagram.com/banuacoder',
    github: 'https://github.com/banua-coder',
    youtube: 'https://youtube.com/@banuacoder',
  },
}

export function buildWhatsAppUrl(locale: 'id' | 'en'): string {
  const msg = contact.whatsappMessages[locale]
  return `https://wa.me/${contact.whatsappNumber}?text=${encodeURIComponent(msg)}`
}
