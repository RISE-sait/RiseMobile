// 🔹 Error Type System for API Responses
export type APIErrorType =
  | 'network'              // Network connection issues (fetch failed, etc.)
  | 'auth'                 // Authentication issues (401 - token expired)
  | 'permission'           // Authorization issues (403 - insufficient permissions)
  | 'not_found'            // Resource not found (404)
  | 'server'               // Server errors (500, 502)
  | 'service_unavailable'  // Service unavailable (503 - maintenance)
  | 'validation'           // Request validation errors (400)
  | 'conflict'             // Resource conflict (409 - duplicate, out of stock)
  | 'timeout'              // Request timeout (408 - payment timeout)
  | 'rate_limit'           // Too many requests (429)
  | 'payload_too_large'    // File too large (413 - >10MB)
  | 'gone'                 // Resource permanently gone (410 - account expired)
  | 'unknown';             // Other errors

export interface APIError {
  message: string;           // Technical error message for logging
  status: number;            // HTTP status code
  type: APIErrorType;        // Error type for handling
  userMessage?: string;      // User-friendly message for display
}

export interface APIResponse<T> {
  data: T | null;
  error: APIError | null;
}
