export interface ImportantQuestion {
  id: string;
  resource_id: string;
  question: string;
  created_by: string;
  visibility: "public" | "private";
  created_at: string;
}
