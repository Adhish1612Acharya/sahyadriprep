export interface LearningResource {
  id: string;
  collection_id: string | null;
  title: string;
  description: string | null;
  type: "image" | "document" | "youtube";
  position: number;
  is_publishable: boolean;
  created_at: string;
  updated_at: string;
}
