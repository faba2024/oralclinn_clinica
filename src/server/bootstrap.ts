/**
 * Inicializa o backend de dados do servidor. Importado (efeito colateral)
 * por todas as rotas /api e páginas server-side que usam os services.
 */
import { setDataBackend } from "@/repositories/core/backend";
import { ServerBackend } from "./server-backend";

setDataBackend(new ServerBackend());

export {};
