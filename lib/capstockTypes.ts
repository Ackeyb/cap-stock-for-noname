export type CapstockData = Record<string, number>;

export type FirestoreCapstockData = {
  [key: string]: number | string[] | undefined;
  _order?: string[];
};

export type Operation = "increase" | "decrease";
