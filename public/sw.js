/*
 * Oralclin — service worker de limpeza.
 *
 * Este projeto NÃO usa PWA. Navegadores que já tiveram outro app em
 * localhost:3000 (ou uma versão antiga com service worker) continuam
 * pedindo /sw.js periodicamente, o que gerava "GET /sw.js 404" no terminal.
 *
 * Este arquivo responde a essa verificação e se auto-remove: limpa caches
 * antigos, cancela o registro e recarrega as abas controladas.
 * Nenhum código do projeto registra service workers.
 */
self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));
      await self.registration.unregister();
      const clients = await self.clients.matchAll({ type: "window" });
      clients.forEach((client) => client.navigate(client.url));
    })(),
  );
});
