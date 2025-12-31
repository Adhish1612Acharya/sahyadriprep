export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface RequestConfig<TBody = any> {
  url: string;
  method: HttpMethod;
  body?: TBody;
  params?: Record<string, any>;
  headers?: Record<string, string>;
}
