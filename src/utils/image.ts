/**
 * Lê um arquivo de imagem e devolve um data URL redimensionado.
 * Mantém o armazenamento local leve. Em produção, o upload irá para o
 * provedor de storage configurado (ver src/lib/storage/file-storage.ts).
 */
export async function readImageAsDataUrl(file: File, maxSize = 1600, quality = 0.85): Promise<string> {
  const source = await readFileAsDataUrl(file);
  if (!file.type.startsWith("image/") || file.type === "image/svg+xml") return source;

  const image = await loadImage(source);
  const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
  if (scale === 1 && file.size < 400_000) return source;

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(image.width * scale);
  canvas.height = Math.round(image.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) return source;
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", quality);
}

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}
