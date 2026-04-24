import { env } from "@/config/env";

export function getSanityFileUrl(ref?: string): string | null {
  if (!ref || !ref.startsWith("file-")) return null;
  
  // Format: file-027401f31c3aec1eaeb91c28ffdd5287be415ae3-pdf
  const parts = ref.split("-");
  if (parts.length < 3) return null;
  
  const id = parts[1];
  const ext = parts[2];
  
  return `https://cdn.sanity.io/files/${env.sanityProjectId}/${env.sanityDataset}/${id}.${ext}`;
}
