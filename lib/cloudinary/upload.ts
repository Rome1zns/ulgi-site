const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

export interface CloudinaryResult {
  url: string;
  publicId: string;
  type: "image" | "video";
}

export async function uploadToCloudinary(
  file: File,
  folder: string = "ulgi/posts",
  onProgress?: (percent: number) => void
): Promise<CloudinaryResult> {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error("Cloudinary конфигурациясы жоқ. .env.local тексеріңіз.");
  }

  const isVideo = file.type.startsWith("video/");

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);
  formData.append("folder", folder);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        onProgress?.(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText);
          resolve({
            url: data.secure_url,
            publicId: data.public_id,
            type: isVideo ? "video" : "image",
          });
        } catch {
          reject(new Error("Cloudinary жауабын оқу қатесі"));
        }
      } else {
        try {
          const err = JSON.parse(xhr.responseText);
          reject(new Error(err?.error?.message || "Жүктеу қатесі: " + xhr.status));
        } catch {
          reject(new Error("Жүктеу қатесі: " + xhr.status));
        }
      }
    };

    xhr.onerror = () => reject(new Error("Желі қатесі"));
    xhr.ontimeout = () => reject(new Error("Жүктеу тым ұзақ"));
    xhr.timeout = 120000;

    xhr.send(formData);
  });
}

export function optimizeUrl(url: string, width: number = 800): string {
  if (!url.includes("cloudinary.com")) return url;
  return url.replace("/upload/", `/upload/w_${width},f_auto,q_auto/`);
}

export function thumbnailUrl(url: string, size: number = 200): string {
  if (!url.includes("cloudinary.com")) return url;
  return url.replace("/upload/", `/upload/w_${size},h_${size},c_fill,f_auto,q_auto/`);
}
