"use client";

import { useState } from "react";
import { useLearningCollections } from "@/hooks/useLearningCollections.hook";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Plus, Trash2, Edit, ExternalLink, Loader2, BookOpen } from "lucide-react";
import { LearningCollectionForm } from "@/components/forms/learning-collection-form";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function ManageCollectionsPage() {
  const router = useRouter();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { 
    useCollectionsQuery, 
    createCollectionMutation, 
    deleteCollectionMutation 
  } = useLearningCollections();

  const { data: collections, isLoading: isFetching } = useCollectionsQuery();

  const handleCreate = async (data: any) => {
    try {
      await createCollectionMutation.mutateAsync(data);
      setIsCreateOpen(false);
    } catch (error) {
      // Error handled by mutation toast
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCollectionMutation.mutateAsync(id);
    } catch (error) {
      // Error handled by mutation toast
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Learning Collections</h1>
          <p className="text-muted-foreground mt-1">
            Create and organize structured learning paths for your students
          </p>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="w-full md:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              New Collection
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New Collection</DialogTitle>
              <DialogDescription>
                Fill in the details below to create a new learning collection.
              </DialogDescription>
            </DialogHeader>
            <LearningCollectionForm 
              onSubmit={handleCreate} 
              isLoading={createCollectionMutation.isPending} 
            />
          </DialogContent>
        </Dialog>
      </div>

      {isFetching ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground animate-pulse">Loading collections...</p>
        </div>
      ) : collections?.length === 0 ? (
        <Card className="flex flex-col items-center justify-center min-h-[400px] bg-muted/20 border-dashed border-2">
          <CardContent className="flex flex-col items-center py-12">
            <div className="p-4 rounded-full bg-muted mb-4">
              <BookOpen className="h-12 w-12 text-muted-foreground" />
            </div>
            <CardTitle className="mb-2">No collections yet</CardTitle>
            <CardDescription className="mb-6 text-center max-w-[300px]">
              You haven't created any learning collections yet. Start by creating your first one.
            </CardDescription>
            <Button onClick={() => setIsCreateOpen(true)} variant="outline">
              Create My First Collection
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {collections?.map((collection) => (
            <Card key={collection.id} className="group hover:shadow-md transition-all border-2 hover:border-primary/50 overflow-hidden">
              <div className="aspect-video w-full relative bg-muted overflow-hidden">
                {collection.thumbnailUrl ? (
                  <img 
                    src={collection.thumbnailUrl} 
                    alt={collection.title}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-primary/5">
                    <BookOpen className="h-12 w-12 text-primary/20" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button 
                    size="sm" 
                    className="bg-white text-black hover:bg-white/90"
                    onClick={() => router.push(`/manage-collections/${collection.id}/resources`)}
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Manage Resources
                  </Button>
                </div>
              </div>
              
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="line-clamp-1">{collection.title}</CardTitle>
                </div>
                <CardDescription className="line-clamp-2 min-h-[40px]">
                  {collection.description || "No description provided."}
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="flex items-center justify-between pt-2 border-t mt-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <BookOpen className="h-4 w-4" />
                    <span>8 Resources</span>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-blue-600">
                      <Edit className="h-4 w-4" />
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete the collection "<strong>{collection.title}</strong>" and all associated resources. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleDelete(collection.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            {deleteCollectionMutation.isPending ? "Deleting..." : "Delete Permanently"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
