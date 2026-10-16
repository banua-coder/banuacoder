export const contact = {
  // TODO(owner): PLACEHOLDER scheduler link. Replace with the real Cal.com/Calendly URL before launch.
  bookingUrl: 'https://cal.com/banuacoder/intro',
  whatsappNumber: '6287784808269',
  whatsappMessages: {
    id: 'Halo Banua Coder, saya tertarik untuk konsultasi mengenai',
    en: "Hi Banua Coder, I'd like to discuss a project —",
  },
  email: 'contact@banuacoder.com',
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
    medium: 'https://medium.com/@banuacoder',
  },
}

export function buildWhatsAppUrl(locale: 'id' | 'en', topic?: string): string {
  const base = contact.whatsappMessages[locale]
  const msg = topic ? `${base} ${topic}` : base
  return `https://wa.me/${contact.whatsappNumber}?text=${encodeURIComponent(msg)}`
}

/** Prefilled per-service WhatsApp link. */
export const buildServiceWhatsAppUrl = (locale: 'id' | 'en', service: string) =>
  buildWhatsAppUrl(
    locale,
    locale === 'en' ? `${service}. Could we talk?` : `${service}. Bisa berdiskusi?`,
  )

export const bookingLabel = { id: 'Jadwalkan Panggilan', en: 'Schedule a Call' }
export const bookingShortLabel = { id: 'Jadwalkan panggilan', en: 'Book a call' }
