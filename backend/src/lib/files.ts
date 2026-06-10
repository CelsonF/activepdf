// Detecção de tipo real de arquivo por magic bytes — nunca confiar no MIME do client.

export interface DetectedImage {
  mime: "image/png" | "image/jpeg" | "image/webp";
  ext: "png" | "jpg" | "webp";
}

export interface DetectedAudio {
  mime: "audio/mpeg" | "audio/ogg" | "audio/webm" | "audio/mp4";
}

function startsWith(buf: Buffer, bytes: number[], offset = 0): boolean {
  if (buf.length < offset + bytes.length) return false;
  return bytes.every((b, i) => buf[offset + i] === b);
}

function ascii(buf: Buffer, text: string, offset = 0): boolean {
  return startsWith(buf, [...text].map((ch) => ch.charCodeAt(0)), offset);
}

export function detectImage(buf: Buffer): DetectedImage | null {
  if (startsWith(buf, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) {
    return { mime: "image/png", ext: "png" };
  }
  if (startsWith(buf, [0xff, 0xd8, 0xff])) {
    return { mime: "image/jpeg", ext: "jpg" };
  }
  if (ascii(buf, "RIFF") && ascii(buf, "WEBP", 8)) {
    return { mime: "image/webp", ext: "webp" };
  }
  return null;
}

export function detectAudio(buf: Buffer): DetectedAudio | null {
  if (ascii(buf, "ID3")) return { mime: "audio/mpeg" };
  // Frame MPEG sem tag ID3: sync de 11 bits (0xFF + 0xE0 no segundo byte)
  if (buf.length >= 2 && buf[0] === 0xff && (buf[1] & 0xe0) === 0xe0) {
    return { mime: "audio/mpeg" };
  }
  if (ascii(buf, "OggS")) return { mime: "audio/ogg" };
  if (startsWith(buf, [0x1a, 0x45, 0xdf, 0xa3])) return { mime: "audio/webm" };
  if (ascii(buf, "ftyp", 4)) return { mime: "audio/mp4" };
  return null;
}

/** Remove o prefixo "data:...;base64," se presente e decodifica. */
export function decodeBase64Payload(data: string): Buffer {
  const comma = data.startsWith("data:") ? data.indexOf(",") : -1;
  return Buffer.from(comma >= 0 ? data.slice(comma + 1) : data, "base64");
}
