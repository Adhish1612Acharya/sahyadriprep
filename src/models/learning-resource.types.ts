export interface LearningResource {
  id: string;
  collectionId: string | null;
  title: string;
  description: string | null;
  type: string; // Consider using a union type if you have a fixed set of resource types
  position: number;
  createdAt: string;
  updatedAt: string;
}
