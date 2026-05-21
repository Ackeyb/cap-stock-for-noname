import type { NextApiRequest, NextApiResponse } from "next";
import { fetchRecentCapstockDocIds, saveCapstockDoc } from "../../../lib/serverCapstockService";
import type { FirestoreCapstockData } from "../../../lib/capstockTypes";

type ListResponse = { docIds: string[] };
type SaveResponse = { ok: true };
type ErrorResponse = { error: string };

export default async function handler(req: NextApiRequest, res: NextApiResponse<ListResponse | SaveResponse | ErrorResponse>) {
  try {
    if (req.method === "GET") {
      res.status(200).json({ docIds: await fetchRecentCapstockDocIds() });
      return;
    }

    if (req.method === "POST") {
      const { docId, data } = req.body as { docId?: string; data?: FirestoreCapstockData };

      if (!docId || !data) {
        res.status(400).json({ error: "docId and data are required" });
        return;
      }

      await saveCapstockDoc(docId, data);
      res.status(200).json({ ok: true });
      return;
    }

    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    res.status(500).json({ error: message });
  }
}
