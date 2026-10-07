"use client";

import { useSitePublicData } from "./public-data";

/**
 * Hooks do site público. Os dados vêm do banco compartilhado com o painel,
 * carregados no servidor a cada visita (SSR) — sem cópia local no navegador.
 */
export const useSiteContent = () => useSitePublicData().content;
export const usePublicTreatments = () => useSitePublicData().treatments;
export const usePublicProfessionals = () => useSitePublicData().professionals;
export const usePublicCases = () => useSitePublicData().cases;
export const useBookingSettings = () => useSitePublicData().booking;
export const useOnlineBookingEnabled = () => useSitePublicData().booking.allowOnlineBooking;
