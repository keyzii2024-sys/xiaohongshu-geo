export class NetworkError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = "NetworkError";
  }
}

export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  maxRetries: number = 3,
  baseDelay: number = 1000,
): Promise<Response> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);

      if (response.ok) {
        return response;
      }

      if (response.status >= 500 && attempt < maxRetries) {
        throw new NetworkError(`Server error: ${response.status}`, response.status);
      }

      return response;
    } catch (error) {
      lastError = error as Error;

      if (attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError || new NetworkError("Request failed after retries");
}
