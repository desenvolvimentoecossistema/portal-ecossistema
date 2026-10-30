// Cookie-authenticated writes must originate from this application, including
// when another application is hosted under the same parent domain.
export function isSameOriginMutation(request: Request): boolean {
  try {
    return request.headers.get("origin") === new URL(request.url).origin;
  } catch {
    return false;
  }
}
