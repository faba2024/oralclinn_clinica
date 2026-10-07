export interface Testimonial {
  id: string;
  name: string;
  treatment: string;
  text: string;
  rating: number;
  published: boolean;
}

export interface OpeningHour {
  id: string;
  label: string; // "Segunda a sexta"
  hours: string; // "08h às 19h"
}

export interface SiteContent {
  logo: string | null;
  brandName: string;
  brandTagline: string;
  heroEyebrow: string;
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string;
  heroHighlights: string[];
  clinicTitle: string;
  clinicText: string;
  clinicImage: string;
  clinicStats: { id: string; value: string; label: string }[];
  ctaTitle: string;
  ctaText: string;
  testimonials: Testimonial[];
  phone: string;
  whatsapp: string;
  email: string;
  instagram: string;
  address: string;
  city: string;
  mapsUrl: string;
  hours: OpeningHour[];
  seoTitle: string;
  seoDescription: string;
}
