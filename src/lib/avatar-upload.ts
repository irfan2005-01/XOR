export const AVATAR_TARGET_SIZE = 400;
export const MAX_AVATAR_BYTES = 300 * 1024; // 300KB
export const ALLOWED_AVATAR_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

const ALLOWED_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp"]);

export function isAllowedAvatarFile(file: { type?: string; name?: string }): boolean {
  const mime = (file.type ?? "").toLowerCase();
  if ((ALLOWED_AVATAR_MIME_TYPES as readonly string[]).includes(mime)) {
    return true;
  }
  const ext = (file.name ?? "").split(".").pop()?.toLowerCase() ?? "";
  return ALLOWED_EXTENSIONS.has(ext);
}

/**
 * Extracts crisp 1-2 character uppercase initials for legacy member fallback avatars.
 */
export function getMemberInitials(fullName: string): string {
  const parts = fullName
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return "XR";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
}

export interface ProcessedAvatarResult {
  file: File;
  previewUrl: string;
  sizeBytes: number;
}

/**
 * Center-crops and resizes an uploaded student photo to 400x400px and
 * compresses it under 300KB using HTML5 Canvas.
 */
export async function processAvatarImage(
  rawFile: File
): Promise<ProcessedAvatarResult> {
  if (!isAllowedAvatarFile(rawFile)) {
    throw new Error("Please select a JPG, PNG, or WebP profile photo.");
  }

  const objectUrl = URL.createObjectURL(rawFile);

  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () =>
        reject(new Error("Could not read image file. Please try another photo."));
      el.src = objectUrl;
    });

    const canvas = document.createElement("canvas");
    canvas.width = AVATAR_TARGET_SIZE;
    canvas.height = AVATAR_TARGET_SIZE;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Image processor is unavailable in this browser.");
    }

    // Center square crop
    const srcSide = Math.min(img.naturalWidth, img.naturalHeight);
    const sx = Math.max(0, (img.naturalWidth - srcSide) / 2);
    const sy = Math.max(0, (img.naturalHeight - srcSide) / 2);

    ctx.fillStyle = "#050507";
    ctx.fillRect(0, 0, AVATAR_TARGET_SIZE, AVATAR_TARGET_SIZE);
    ctx.drawImage(
      img,
      sx,
      sy,
      srcSide,
      srcSide,
      0,
      0,
      AVATAR_TARGET_SIZE,
      AVATAR_TARGET_SIZE
    );

    const qualities = [0.88, 0.76, 0.64, 0.52, 0.4];
    let selectedBlob: Blob | null = null;

    for (const quality of qualities) {
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/jpeg", quality)
      );
      if (blob) {
        selectedBlob = blob;
        if (blob.size <= MAX_AVATAR_BYTES) {
          break;
        }
      }
    }

    if (!selectedBlob) {
      throw new Error("Failed to compress profile photo.");
    }

    if (selectedBlob.size > MAX_AVATAR_BYTES) {
      throw new Error("Photo is still larger than 300KB after compression. Please pick another photo.");
    }

    const processedFile = new File([selectedBlob], "xor-avatar.jpg", {
      type: "image/jpeg",
    });
    const previewUrl = URL.createObjectURL(processedFile);

    return {
      file: processedFile,
      previewUrl,
      sizeBytes: processedFile.size,
    };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}
