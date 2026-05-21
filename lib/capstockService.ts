import { collection, deleteDoc, doc, getDoc, getDocs, setDoc } from "firebase/firestore";
import { db } from "./firebase";
import type { FirestoreCapstockData } from "./capstockTypes";

const COLLECTION_NAME = "capstock";
const MAX_DOCS = 20;

export async function fetchRecentCapstockDocIds(): Promise<string[]> {
  const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
  let docIds = querySnapshot.docs.map((snapshot) => snapshot.id).sort().reverse();

  if (docIds.length > MAX_DOCS) {
    for (let i = MAX_DOCS; i < docIds.length; i++) {
      await deleteDoc(doc(db, COLLECTION_NAME, docIds[i]));
    }
    docIds = docIds.slice(0, MAX_DOCS);
  }

  return docIds;
}

export async function fetchCapstockDoc(docId: string): Promise<FirestoreCapstockData | null> {
  const docRef = doc(db, COLLECTION_NAME, docId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return null;
  }

  return docSnap.data() as FirestoreCapstockData;
}

export async function saveCapstockDoc(docId: string, data: FirestoreCapstockData) {
  const docRef = doc(db, COLLECTION_NAME, docId);
  await setDoc(docRef, data);
}
