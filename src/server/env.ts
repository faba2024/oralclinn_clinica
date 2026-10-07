/** Configuração do servidor lida das variáveis de ambiente. */
export const serverEnv = {
  isProduction: process.env.NODE_ENV === "production",
  isVercel: !!process.env.VERCEL,
  supabaseUrl: (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim(),
  supabaseServiceRoleKey: (
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SECRET_KEY ||
    ""
  ).trim(),
  dataFile: process.env.DATA_FILE || ".data/oralclin-db.json",
  seedDemoData: process.env.SEED_DEMO_DATA === "true",
};
