export class HttpError extends Error {
  status: number;
  code: string;
  data?: any;

  constructor(message: string, status: number, code: string, data?: any) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.code = code;
    this.data = data;
  }
}
