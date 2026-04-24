const required = <T extends string | undefined>(value: T, fallback = ""): string =>
  value ?? fallback;

export const env = {
  apiBaseUrl: required(process.env.NEXT_PUBLIC_API_BASE_URL),
  sanityProjectId: required(process.env.NEXT_PUBLIC_SANITY_PROJECT_ID),
  sanityDataset: required(process.env.NEXT_PUBLIC_SANITY_DATASET, "production"),
  sanityApiVersion: required(process.env.NEXT_PUBLIC_SANITY_API_VERSION, "2025-04-05"),
};

export const hasApiBaseUrl = env.apiBaseUrl.length > 0;
export const hasSanityConfig = env.sanityProjectId.length > 0;
