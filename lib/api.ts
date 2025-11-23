const BASE = process.env.NEXT_PUBLIC_API_URL || '';

export interface LinkItem {
  id: number;
  target: string;
  shortCode: string;
  totalClicks: number;
  lastClicked: string | null;
  createdAt?: string | null;
}

interface ApiErrorBody {
    message: string;
    status?: number; 
}

async function handleResponse<T>(response: Response): Promise<T> {
    if (response.ok) {
        const contentType = response.headers.get("content-type");
        if (!contentType || response.status === 204) {
            return {} as T;
        }
        return response.json();
    }
    
    let errorBody: ApiErrorBody = { message: 'Unknown error occurred' };
    try {
        const parsedBody = await response.json();
        errorBody.message = parsedBody.message || parsedBody.error || errorBody.message; 
    } catch (e) {
        errorBody.message = `Server responded with status ${response.status}`;
    }

    const error = new Error(errorBody.message);
    (error as any).status = response.status; 
    throw error;
}

export async function fetchLinks(): Promise<LinkItem[]> {
    const res = await fetch(`${BASE}/api/links`, { cache: 'no-store' });
    return handleResponse<LinkItem[]>(res);
}

export async function createLink(payload: { target: string, code?: string }): Promise<LinkItem> {
    const res = await fetch(`${BASE}/api/links`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    return handleResponse<LinkItem>(res); 
}

export async function deleteLink(code: string): Promise<void> {
    const res = await fetch(`${BASE}/api/links/${code}`, { method: 'DELETE' });
    await handleResponse<void>(res);
}

export async function fetchLinkStats(code: string): Promise<LinkItem> {
  const res = await fetch(`${BASE}/api/links/${code}`, { cache: 'no-store' });
  return handleResponse<LinkItem>(res);
}