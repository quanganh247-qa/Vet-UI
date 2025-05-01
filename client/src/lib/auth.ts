/**
 * Gets the user's authentication token from localStorage
 * @returns The authentication token or null if not found
 */
export function getUserToken(): string | null {
  return localStorage.getItem('access_token');
}

/**
 * Stores the user's authentication token in localStorage
 * @param token The authentication token to store
 */
export function setUserToken(token: string): void {
  localStorage.setItem('access_token', token);
}

/**
 * Removes the user's authentication token from localStorage
 */
export function clearUserToken(): void {
  localStorage.removeItem('access_token');
}

/**
 * Checks if the user is authenticated (has a token)
 * @returns True if the user is authenticated, false otherwise
 */
export function isAuthenticated(): boolean {
  return !!getUserToken();
} 