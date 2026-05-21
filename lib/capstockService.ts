import type { FirestoreCapstockData } from "./capstockTypes";

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function fetchRecentCapstockDocIds(): Promise<string[]> {
  const data = await requestJson<{ docIds: string[] }>("/api/capstock");
  return data.docIds;
}

export async function fetchCapstockDoc(docId: string): Promise<FirestoreCapstockData | null> {
  const data = await requestJson<{ doc: FirestoreCapstockData | null }>(`/api/capstock/${encodeURIComponent(docId)}`);
  return data.doc;
}

export async function saveCapstockDoc(docId: string, data: FirestoreCapstockData) {
  await requestJson<{ ok: true }>("/api/capstock", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ docId, data }),
  });
}
