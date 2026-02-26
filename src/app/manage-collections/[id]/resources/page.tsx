"use client";

import { useParams, useRouter } from "next/navigation";
import { useLearningCollections } from "@/hooks/useLearningCollections.hook";
import { useLearningResources } from "@/hooks/useLearningResources.hook";
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
  ArrowLeft,
  Plus,
  Video,
  FileText,
  Image as ImageIcon,
  ChevronRight,
  ExternalLink,
  Settings2,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { LearningResourceForm } from "@/components/forms/learning-resource-form";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

export default function ResourceManagementPage() {
  const { id: collectionId } = useParams() as { id: string };
  const router = useRouter();
  const [isAddOpen, setIsAddOpen] = useState(false);

  const { 
    useCollectionQuery, 
    publishCollectionMutation 
  } = useLearningCollections();
  const { data: collection, isLoading: isCollectionLoading } = useCollectionQuery(collectionId);

  const { useResourcesQuery, createResourceMutation } = useLearningResources(collectionId);
  const { data: resources, isLoading: isResourcesLoading } = useResourcesQuery();

  const handleAddResource = async (data: any) => {
    try {
      await createResourceMutation.mutateAsync(data);
      setIsAddOpen(false);
    } catch (error) {
      // Handled by toast
    }
  };

  const handlePublish = async () => {
    try {
      await publishCollectionMutation.mutateAsync(collectionId);
    } catch (error) {
      // Handled by toast
    }
  };


  if (isCollectionLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">Loading collection details...</p>
      </div>
    );
  }

  // A collection is publishable if it has >= 2 resources AND all resources are publishable.
  const readyResourcesCount = resources?.filter(r => r.isPublishable).length || 0;
  const isCollectionPublishable = (resources?.length || 0) >= 2 && readyResourcesCount === (resources?.length || 0);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8 flex items-center gap-4">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => router.push("/manage-collections")}
          className="rounded-full"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight">{collection?.title}</h1>
            <Badge variant="outline" className="ml-2">
              {resources?.length || 0} Resources
            </Badge>
          </div>
          <div className="flex items-center gap-3 mt-2">
            <Badge 
              variant="secondary" 
              className={collection?.status === 'published' ? "bg-green-50 text-green-700 border-green-200" : "bg-amber-50 text-amber-700 border-amber-200"}
            >
              {collection?.status === 'published' ? "Public / Published" : "Draft / Private"}
            </Badge>
            <p className="text-muted-foreground text-sm">
              {readyResourcesCount} / {resources?.length || 0} resources ready
            </p>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2">
          {collection?.status !== 'published' && (
            <Button 
              variant="default" 
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={handlePublish}
              disabled={!isCollectionPublishable || publishCollectionMutation.isPending}
            >
              {publishCollectionMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="mr-2 h-4 w-4" />
              )}
              Go Live
            </Button>
          )}
        </div>
      </div>


      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Content Registry</h2>
        
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Resource
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Register New Resource</DialogTitle>
              <DialogDescription>
                Select a resource type and enter basic metadata to add it to this collection.
              </DialogDescription>
            </DialogHeader>
            <LearningResourceForm 
              collectionId={collectionId}
              onSubmit={handleAddResource}
              isLoading={createResourceMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      {isResourcesLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 w-full bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      ) : !resources || resources.length === 0 ? (
        <Card className="bg-muted/20 border-dashed border-2 flex flex-col items-center justify-center py-12 text-center">
          <CardHeader>
            <div className="mx-auto p-4 rounded-full bg-muted mb-4">
              <Plus className="h-10 w-10 text-muted-foreground" />
            </div>
            <CardTitle>Empty Collection</CardTitle>
            <CardDescription className="max-w-[400px]">
              This collection doesn't have any resources yet. Register your first resource (Image, Document, or YouTube) to get started.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setIsAddOpen(true)} variant="outline">
              Register First Resource
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {resources.map((resource) => (
            <Card 
              key={resource.id} 
              className="group hover:border-primary/50 transition-all overflow-hidden"
            >
              <div className="flex flex-col md:flex-row md:items-center">
                <div className="p-6 flex-1 flex items-start gap-4">
                  <div className={`p-3 rounded-lg ${
                    resource.type === 'youtube' ? 'bg-red-50 text-red-600' :
                    resource.type === 'document' ? 'bg-green-50 text-green-600' :
                    'bg-blue-50 text-blue-600'
                  }`}>
                    {resource.type === 'youtube' && <Video className="h-6 w-6" />}
                    {resource.type === 'document' && <FileText className="h-6 w-6" />}
                    {resource.type === 'image' && <ImageIcon className="h-6 w-6" />}
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg">{resource.title}</h3>
                      {resource.isPublishable ? (
                        <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
                          <CheckCircle2 className="mr-1 h-3 w-3" />
                          Ready
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-amber-50 text-amber-700 border-amber-200">
                          <Clock className="mr-1 h-3 w-3" />
                          Draft
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {resource.description || "No description provided."}
                    </p>
                  </div>
                </div>

                <div className="px-6 pb-6 md:pb-0 md:border-l flex md:flex-col items-center justify-center gap-2 min-w-[200px]">
                  {resource.type === 'youtube' ? (
                    <Button 
                      className="w-full" 
                      onClick={() => router.push(`/manage-collections/${collectionId}/resources/${resource.id}/youtube-studio`)}
                    >
                      <Settings2 className="mr-2 h-4 w-4" />
                      YouTube Studio
                    </Button>
                  ) : (
                    <Button className="w-full" variant="outline">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      {resource.isPublishable ? 'Update File' : 'Attach File'}
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {!isResourcesLoading && resources && resources.length > 0 && (
        <Card className="mt-12 bg-primary/5 border-primary/20">
          <CardHeader className="flex flex-row items-center gap-4">
            <AlertCircle className="h-6 w-6 text-primary" />
            <div>
              <CardTitle className="text-base">Collection Publishing Requirements</CardTitle>
              <CardDescription>
                A collection is only visible to students when it has at least <strong>2 resources</strong> and all of them are marked as <strong>'Ready'</strong>.
              </CardDescription>
            </div>
          </CardHeader>
        </Card>
      )}
    </div>
  );
}
