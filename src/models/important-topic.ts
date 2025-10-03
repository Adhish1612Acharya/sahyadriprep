export interface ImportantTopic {
  id: string;
  resource_id: string;
  title: string;
  created_by: string;
  visibility: "public" | "private";
  created_at: string;
}
