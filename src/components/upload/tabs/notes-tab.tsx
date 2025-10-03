"use client"

import { useEffect, useMemo, useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { MediaUploader } from "../media-uploader"
import { CardItem } from "../card-item"
import type { Media} from "@/models/media"
import type {  Note } from "@/models/note"

type NotesTabProps = {
  resourceId: string
  createdBy: string
  visibility: "public" | "private"
  onVisibilityChange: (v: "public" | "private") => void
}

export function NotesTab({ resourceId, createdBy, visibility, onVisibilityChange }: NotesTabProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [files, setFiles] = useState<Media[]>([])

  const isValid = title.trim().length > 0 && files.length > 0

  useEffect(() => {
    const payload = { title, description, files, visibility }
    try {
      localStorage.setItem("draft_notes", JSON.stringify(payload))
    } catch {}
  }, [title, description, files, visibility])

  const notesPayload: Note[] = useMemo(() => {
    if (!isValid) return []
    return files.map((f) => ({
      id: `${resourceId}-${f.id}`,
      resource_id: resourceId,
      title,
      description,
      media_id: f.id,
      created_by: createdBy,
      created_at: new Date().toISOString(),
    }))
  }, [createdBy, files, description, resourceId, title, isValid])

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
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Unit 1 Summary"
              aria-invalid={title.trim().length === 0}
            />
          </div>

          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="note-desc">Description</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="text-xs text-muted-foreground underline underline-offset-2 cursor-help">
                      optional
                    </span>
                  </TooltipTrigger>
                  <TooltipContent className="bg-popover text-popover-foreground border-border">
                    Short context to help students decide relevance.
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Textarea
              id="note-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What does this cover?"
              className="min-h-24"
            />
          </div>

          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label>Visibility</Label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Private</span>
                <Switch
                  checked={visibility === "public"}
                  onCheckedChange={(v) => onVisibilityChange(v ? "public" : "private")}
                  aria-label="Toggle public visibility"
                />
                <span className="text-xs text-muted-foreground">Public</span>
              </div>
            </div>
          </div>

          <MediaUploader value={files} onChange={setFiles} maxFiles={2} />
        </div>
      </CardItem>

      <CardItem title="Preview" description="This shows how your notes would be stored.">
        <pre className="text-xs md:text-sm overflow-auto rounded-md border border-border p-3 bg-muted/50">
          {JSON.stringify(notesPayload, null, 2)}
        </pre>
      </CardItem>

      <div className="flex justify-end">
        <button
          disabled={!isValid}
          className="px-4 py-2 rounded-md bg-primary text-primary-foreground disabled:opacity-50"
          aria-disabled={!isValid}
        >
          Save Resource
        </button>
      </div>
    </div>
  )
}
