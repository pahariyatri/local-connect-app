export function isExcludedRoute(pathname: string, excludedRoutes: string[]): boolean {
    return excludedRoutes.some((route) => pathname.startsWith(route));
}