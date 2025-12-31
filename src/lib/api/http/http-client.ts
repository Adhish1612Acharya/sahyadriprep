import { axiosClient } from "@/lib/axiosClient";
import { HttpError } from "./http-error";
import { RequestConfig } from "./types";

export async function httpRequest<TResponse = any, TBody = any>(
  config: RequestConfig<TBody>
): Promise<TResponse> {
  const { url, method, body, params, headers } = config;

  try {
    const response = await axiosClient.request<TResponse>({
      url,
      method,
      data: body,
      params,
      headers,
    });

    return response.data;
  } catch (err: any) {
    // Normalize axios error
    const status = err?.response?.status ?? 0;
    const data = err?.response?.data ?? null;
    const message =
      data?.error ??
      data?.message ??
      err?.message ??
      "Something went wrong while communicating with the server";

    console.error("❌ HTTP error:", { url, method, status, data, raw: err });

    throw new HttpError(message, status, data);
  }
}

export function httpGet<TResponse = any>(url: string) {
  return httpRequest<TResponse>({ url, method: "GET" });
}

export function httpPost<TResponse = any, TBody = any>(
  url: string,
  body: TBody
) {
  return httpRequest<TResponse, TBody>({ url, method: "POST", body });
}

export function httpPut<TResponse = any, TBody = any>(
  url: string,
  body: TBody
) {
  return httpRequest<TResponse, TBody>({ url, method: "PUT", body });
}

export function httpPatch<TResponse = any, TBody = any>(
  url: string,
  body: TBody
) {
  return httpRequest<TResponse, TBody>({ url, method: "PATCH", body });
}

export function httpDelete<TResponse = any>(url: string) {
  return httpRequest<TResponse>({ url, method: "DELETE" });
}
