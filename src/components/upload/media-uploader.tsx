"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import type { Media } from "@/models/media.types";

type MediaUploaderProps = {
  value: Media[];
  onChange: (files: Media[]) => void;
  max_files?: number;
  accept?: string;
  helper?: string;
  file_type?: "pdf" | "video" | "image" | "audio" | "all";
};

const ACCEPT_DEFAULT = "image/*,video/*,application/pdf,audio/*";

function gen_id() {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function MediaUploader({
  value,
  onChange,
  max_files = 2,
  accept = ACCEPT_DEFAULT,
  helper = "PDF, images, videos, or audio. Max 2 files.",
  file_type = "all",
}: MediaUploaderProps) {
  const [progress, set_progress] = useState(0);
  const [is_uploading, set_is_uploading] = useState(false);
  const input_ref = useRef<HTMLInputElement | null>(null);

  // Get specific accept string based on file_type
  const get_accept_string = (type: string) => {
    switch (type) {
      case "pdf":
        return "application/pdf";
      case "video":
        return "video/*";
      case "image":
        return "image/*";
      case "audio":
        return "audio/*";
      default:
        return accept;
    }
  };

  const accept_string = get_accept_string(file_type);

  // simulate upload progress for demo
  useEffect(() => {
    if (!is_uploading) return;
    set_progress(0);
    const timer = setInterval(() => {
      set_progress((prev_progress) => {
        const next_progress = Math.min(prev_progress + 12, 100);
        if (next_progress === 100) {
          clearInterval(timer);
          setTimeout(() => set_is_uploading(false), 300);
        }
        return next_progress;
      });
    }, 120);
    return () => clearInterval(timer);
  }, [is_uploading]);

  function handle_pick() {
    input_ref.current?.click();
  }

  function handle_files(files: FileList | null) {
    if (!files) return;
    const selected_files = Array.from(files).slice(
      0,
      Math.max(0, max_files - value.length)
    );
    if (selected_files.length === 0) return;
    set_is_uploading(true);

    const mapped_media: Media[] = selected_files.map((file) => {
      const file_url = URL.createObjectURL(file);
      return {
        id: gen_id(),
        url: file_url,
        public_id: "", // placeholder until cloud upload returns a public id
        file_name: file.name,
        file_type: file.type,
        file_size: file.size,
        uploaded_at: new Date().toISOString(),
        file: file, // Add the actual File object for later use
      };
    });
    onChange([...value, ...mapped_media]);
  }

  function remove_at(index: number) {
    const updated_files = value.slice();
    const removed_file = updated_files.splice(index, 1);
    // Revoke object URL to avoid memory leaks
    if (removed_file[0]?.url?.startsWith("blob:")) {
      URL.revokeObjectURL(removed_file[0].url);
    }
    onChange(updated_files);
  }

  const can_add_more = value.length < max_files;

  function is_image(type?: string) {
    return type?.startsWith("image/");
  }

  function is_video(type?: string) {
    return type?.startsWith("video/");
  }

  function is_audio(type?: string) {
    return type?.startsWith("audio/");
  }

  function is_pdf(type?: string, name?: string) {
    return (
      type === "application/pdf" ||
      (name?.toLowerCase()?.endsWith(".pdf") ?? false)
    );
  }

  // Get helper text based on file_type
  const get_helper_text = (type: string, max: number) => {
    switch (type) {
      case "pdf":
        return `PDF files only. Max ${max} file${max > 1 ? "s" : ""}.`;
      case "video":
        return `Video files only. Max ${max} file${max > 1 ? "s" : ""}.`;
      case "image":
        return `Image files only. Max ${max} file${max > 1 ? "s" : ""}.`;
      case "audio":
        return `Audio files only. Max ${max} file${max > 1 ? "s" : ""}.`;
      default:
        return helper;
    }
  };

  const helper_text = get_helper_text(file_type, max_files);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="secondary"
          onClick={handle_pick}
          disabled={!can_add_more}
        >
          {can_add_more ? "Add files" : "Max files reached"}
        </Button>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className="cursor-help">
                {`${value.length}/${max_files}`}
              </Badge>
            </TooltipTrigger>
            <TooltipContent className="bg-popover text-popover-foreground border-border">
              {helper_text}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <Input
          ref={input_ref}
          type="file"
          accept={accept_string}
          multiple={max_files > 1}
          className="hidden"
          onChange={(e) => handle_files(e.target.files)}
        />
      </div>

      {is_uploading ? (
        <div className="space-y-2">
          <Label className="text-sm text-muted-foreground">Uploading…</Label>
          <Progress value={progress} aria-label="Upload progress" />
        </div>
      ) : null}

      {value.length > 0 ? (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {value.map((media_item, index) => (
            <li
              key={media_item.id}
              className="border border-border rounded-md p-3 space-y-2 bg-card text-card-foreground"
            >
              <div className="text-sm font-medium break-words">
                {media_item.file_name ?? "Untitled"}
              </div>
              <div className="aspect-video rounded-sm overflow-hidden bg-muted flex items-center justify-center">
                {is_image(media_item.file_type) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={media_item.url || "/placeholder.svg"}
                    alt={media_item.file_name ?? "uploaded image"}
                    className="h-full w-full object-cover"
                  />
                ) : is_video(media_item.file_type) ? (
                  <video
                    src={media_item.url}
                    controls
                    className="h-full w-full"
                    crossOrigin="anonymous"
                  />
                ) : is_audio(media_item.file_type) ? (
                  <audio src={media_item.url} controls className="w-full" />
                ) : is_pdf(media_item.file_type, media_item.file_name) ? (
                  <div className="p-4 text-sm text-muted-foreground">
                    PDF ready • Use Download to open
                  </div>
                ) : (
                  <div className="p-4 text-sm text-muted-foreground">
                    Unsupported preview
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between gap-2">
                <a
                  href={media_item.url}
                  download={media_item.file_name ?? "download"}
                  className="text-sm underline underline-offset-4 hover:opacity-80"
                >
                  Download
                </a>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => remove_at(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  Remove
                </Button>
              </div>

              {/* File size and type info */}
              <div className="text-xs text-muted-foreground">
                {media_item.file_type} •{" "}
                {(media_item.file_size / 1024 / 1024).toFixed(2)} MB
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      {/* Validation message */}
      {value.length === 0 && file_type !== "all" && (
        <div className="text-xs text-muted-foreground">
          No {file_type} files selected
        </div>
      )}

      {/* Cloudinary integration note
        Replace the simulated upload with your Cloudinary flow.
        - Get a signature from your server route
        - POST to Cloudinary unsigned/signed upload
        - Use resulting public_id and secure_url to populate Media[]
      */}
    </div>
  );
}
