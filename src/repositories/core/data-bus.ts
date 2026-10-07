/**
 * Barramento simples de eventos de dados. Repositórios emitem o nome da
 * coleção alterada; hooks de leitura se reinscrevem e recarregam.
 * Também sincroniza abas abertas via BroadcastChannel.
 */
type Listener = (collection: string) => void;

const listeners = new Set<Listener>();
const remoteHooks = new Set<Listener>();
let channel: BroadcastChannel | null = null;

function getChannel(): BroadcastChannel | null {
  if (typeof window === "undefined" || typeof BroadcastChannel === "undefined") return null;
  if (!channel) {
    channel = new BroadcastChannel("oralclin-data");
    channel.onmessage = (event: MessageEvent<string>) => {
      // Alteração feita em outra aba: descarta caches antes de recarregar.
      remoteHooks.forEach((h) => h(event.data));
      listeners.forEach((l) => l(event.data));
    };
  }
  return channel;
}

export const dataBus = {
  /** `local: true` recarrega apenas esta aba (usado no polling). */
  emit(collection: string, options?: { local?: boolean }) {
    listeners.forEach((l) => l(collection));
    if (!options?.local) getChannel()?.postMessage(collection);
  },
  subscribe(listener: Listener): () => void {
    getChannel();
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  onRemoteChange(hook: Listener): () => void {
    getChannel();
    remoteHooks.add(hook);
    return () => {
      remoteHooks.delete(hook);
    };
  },
};
