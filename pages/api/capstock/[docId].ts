import type { NextApiRequest, NextApiResponse } from "next";
import { fetchCapstockDoc } from "../../../lib/serverCapstockService";
import type { FirestoreCapstockData } from "../../../lib/capstockTypes";

type DocResponse = { doc: FirestoreCapstockData | null };
type ErrorResponse = { error: string };

export default async function handler(req: NextApiRequest, res: NextApiResponse<DocResponse | ErrorResponse>) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const docId = Array.isArray(req.query.docId) ? req.query.docId[0] : req.query.docId;

  if (!docId) {
    res.status(400).json({ error: "docId is required" });
    return;
  }

  try {
    res.status(200).json({ doc: await fetchCapstockDoc(docId) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    res.status(500).json({ error: message });
  }
}
