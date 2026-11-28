export class HttpError extends Error {
  constructor(status, code, message) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.code = code;
  }
}

export const badRequest = (code, message) => new HttpError(400, code, message);
export const unauthorized = (message = "Authentication required.") =>
  new HttpError(401, "UNAUTHORIZED", message);
export const forbidden = (message = "You do not have access to this resource.") =>
  new HttpError(403, "FORBIDDEN", message);
export const notFound = (message = "Resource not found.") =>
  new HttpError(404, "NOT_FOUND", message);
