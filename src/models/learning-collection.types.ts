export interface LearningCollection {
  id: string;
  title: string;
  description: string | null;
  thumbnailMediaId: string | null;
  status: "draft" | "published" | "archived" | null;
  visibility: "public" | "private" | null;
  isPremium: boolean | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}
