export interface Resource {
  id: string;
  subject_id: string;
  module_id: string;
  exam_id: string;
  created_by: string;
  visibility: "public" | "private";
  created_at: string;
  updated_at: string;
}
