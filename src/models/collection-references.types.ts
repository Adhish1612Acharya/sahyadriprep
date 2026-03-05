export type ReferenceType = "youtube" | "external";

export interface CollectionReferences {
  id: string;
  collection_id: string;
  reference_url: string;
  reference_type: ReferenceType;
  created_at: string;
  updated_at: string;
}
