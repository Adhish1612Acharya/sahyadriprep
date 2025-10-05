"use client";

import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { MediaUploader } from "../media-uploader";
import { CardItem } from "../card-item";
import type { Media } from "@/models/media";
import type { Note } from "@/models/note";

type NoteData = {
  title: string;
  description: string;
  file: File;
};

type NotesTabProps = {
  resource_id: string;
  created_by: string;
  visibility: "public" | "private";
  on_visibility_change: (v: "public" | "private") => void;
  on_notes_change?: (notes: NoteData[]) => void;
};

export function NotesTab({
  resource_id,
  created_by,
  visibility,
  on_visibility_change,
  on_notes_change,
}: NotesTabProps) {
  const [title, set_title] = useState("");
  const [description, set_description] = useState("");
  const [files, set_files] = useState<Media[]>([]);

  const is_valid = title.trim().length > 0 && files.length > 0;

  // Convert to NoteData format for parent component
  const notes_data: NoteData[] = useMemo(() => {
    if (!is_valid || !title.trim()) return [];

    return files.map((media) => ({
      title: title.trim(),
      description: description.trim(),
      file: media.file || new File([], media.url, { type: media.type }),
    }));
  }, [title, description, files, is_valid]);

  // Notify parent component when notes data changes
  useEffect(() => {
    if (on_notes_change) {
      on_notes_change(notes_data);
    }
  }, [notes_data, on_notes_change]);

  useEffect(() => {
    const payload = { title, description, files, visibility };
    try {
      localStorage.setItem("draft_notes", JSON.stringify(payload));
    } catch {}
  }, [title, description, files, visibility]);

  const notes_payload: Note[] = useMemo(() => {
    if (!is_valid) return [];
    return files.map((f) => ({
      id: `${resource_id}-${f.id}`,
      resource_id,
      title,
      description,
      media_id: f.id,
      created_by: created_by,
      created_at: new Date().toISOString(),
    }));
  }, [created_by, files, description, resource_id, title, is_valid]);

  return (
    <div className="space-y-4">
      <CardItem
        title="Notes & Resources"
        description="Upload up to 2 files. Provide a clear title and short description."
      >
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="note-title">Title</Label>
            <Input
              id="note-title"
              value={title}
              onChange={(e) => set_title(e.target.value)}
              placeholder="e.g., Unit 1 Summary"
              aria-invalid={title.trim().length === 0}
            />
            {title.trim().length === 0 && (
              <span className="text-xs text-red-500">Title is required</span>
            )}
          </div>

          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="note-desc">Description</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="text-xs text-muted-foreground underline underline-offset-2 cursor-help">
                      required
                    </span>
                  </TooltipTrigger>
                  <TooltipContent className="bg-popover text-popover-foreground border-border">
                    Description is required for notes.
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Textarea
              id="note-desc"
              value={description}
              onChange={(e) => set_description(e.target.value)}
              placeholder="What does this cover?"
              className="min-h-24"
            />
            {description.trim().length === 0 && (
              <span className="text-xs text-red-500">
                Description is required
              </span>
            )}
          </div>

          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label>Visibility</Label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Private</span>
                <Switch
                  checked={visibility === "public"}
                  onCheckedChange={(v) =>
                    on_visibility_change(v ? "public" : "private")
                  }
                  aria-label="Toggle public visibility"
                />
                <span className="text-xs text-muted-foreground">Public</span>
              </div>
            </div>
          </div>

          <MediaUploader
            value={files}
            onChange={set_files}
            max_files={2}
            accept="application/pdf"
            file_type="pdf"
          />
          {files.length === 0 && (
            <span className="text-xs text-red-500">
              At least one PDF file is required
            </span>
          )}
          {files.length > 2 && (
            <span className="text-xs text-red-500">
              Maximum 2 files allowed
            </span>
          )}
        </div>
      </CardItem>

      <CardItem
        title="Preview"
        description="This shows how your notes would be stored."
      >
        <pre className="text-xs md:text-sm overflow-auto rounded-md border border-border p-3 bg-muted/50">
          {JSON.stringify(notes_payload, null, 2)}
        </pre>
      </CardItem>

      <div className="flex justify-end">
        <div className="text-xs text-muted-foreground mb-2">
          {is_valid ? "✓ Ready to submit" : "Please fill required fields"}
        </div>
      </div>
    </div>
  );
}
