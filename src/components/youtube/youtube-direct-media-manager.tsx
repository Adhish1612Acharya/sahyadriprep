"use client";

import { useState } from "react";
import { useYouTubeResources } from "@/hooks/useYouTubeResources.hook";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Plus, 
  FileText, 
  Trash2, 
  Download, 
  Loader2, 
  Paperclip,
  CheckCircle2
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface YouTubeDirectMediaManagerProps {
  youtubeResourceId: string;
  directMedia: any[]; // Linked media records
}

export function YouTubeDirectMediaManager({
  youtubeResourceId,
  directMedia = [],
}: YouTubeDirectMediaManagerProps) {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [label, setLabel] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { uploadYoutubeDirectMediaMutation } = useYouTubeResources(youtubeResourceId);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !label) return;

    try {
      await uploadYoutubeDirectMediaMutation.mutateAsync({
        youtubeResourceId,
        label,
        file: selectedFile,
      });
      setIsUploadOpen(false);
      setLabel("");
      setSelectedFile(null);
    } catch (error) {
      // Handled by toast
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Video-Wide Resources</h3>
          <p className="text-sm text-muted-foreground">
            Attach documents or images that apply to the entire lecture.
          </p>
        </div>

        <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Media
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload Direct Media</DialogTitle>
              <DialogDescription>
                Files uploaded here will be available to students for the duration of the entire video.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpload} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="label">Display Label</Label>
                <Input 
                  id="label"
                  placeholder="e.g., Complete Lecture Notes (PDF)" 
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="file">File</Label>
                <Input 
                  id="file"
                  type="file"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  required
                  accept=".pdf,.png,.jpg,.jpeg,.webp"
                />
                <p className="text-xs text-muted-foreground">
                  Supported formats: PDF, PNG, JPG, WEBP. Max 10MB.
                </p>
              </div>
              <Button 
                type="submit" 
                className="w-full" 
                disabled={uploadYoutubeDirectMediaMutation.isPending}
              >
                {uploadYoutubeDirectMediaMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading to Drive...
                  </>
                ) : (
                  "Start Upload"
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {directMedia.length === 0 ? (
        <Card className="bg-muted/30 border-dashed py-8 text-center">
          <CardContent className="flex flex-col items-center">
            <Paperclip className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">No video-wide resources attached.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {directMedia.map((item) => (
            <Card key={item.id} className="group hover:border-primary transition-all">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded bg-blue-50 text-blue-600">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">{item.label}</h4>
                    <p className="text-xs text-muted-foreground">
                      Added on {new Date(item.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
