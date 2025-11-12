// Re-export based on environment detection
export { fetchProfileByUserId } from "./fetch.client";
export { fetchProfileByUserId as fetchProfileByUserIdServer } from "./fetch.server";
export { fetchProfileByUserIdCore } from "./fetch.core";

export * from "./update";
