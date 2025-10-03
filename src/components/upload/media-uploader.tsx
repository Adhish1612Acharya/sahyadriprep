"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import type { Media } from "@/models/"

type MediaUploaderProps = {
  value: Media[]
  onChange: (files: Media[]) => void
  maxFiles?: number
  accept?: string
  helper?: string
}

const ACCEPT_DEFAULT = "image/*,video/*,application/pdf,audio/*"

function genId() {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

export function MediaUploader({
  value,
  onChange,
  maxFiles = 2,
  accept = ACCEPT_DEFAULT,
  helper = "PDF, images, videos, or audio. Max 2 files.",
}: MediaUploaderProps) {
  const [progress, setProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement | null>(null)

  // simulate upload progress for demo
  useEffect(() => {
    if (!isUploading) return
    setProgress(0)
    const t = setInterval(() => {
      setProgress((p) => {
        const next = Math.min(p + 12, 100)
        if (next === 100) {
          clearInterval(t)
          setTimeout(() => setIsUploading(false), 300)
        }
        return next
      })
    }, 120)
    return () => clearInterval(t)
  }, [isUploading])

  function handlePick() {
    inputRef.current?.click()
  }

  function handleFiles(files: FileList | null) {
    if (!files) return
    const selected = Array.from(files).slice(0, Math.max(0, maxFiles - value.length))
    if (selected.length === 0) return
    setIsUploading(true)

    const mapped: Media[] = selected.map((file) => {
      const url = URL.createObjectURL(file)
      return {
        id: genId(),
        url,
        public_id: "", // placeholder until cloud upload returns a public id
        file_name: file.name,
        file_type: file.type,
        file_size: file.size,
        uploaded_at: new Date().toISOString(),
      }
    })
    onChange([...value, ...mapped])
  }

  function removeAt(idx: number) {
    const next = value.slice()
    const removed = next.splice(idx, 1)
    // Revoke object URL to avoid memory leaks
    if (removed[0]?.url?.startsWith("blob:")) {
      URL.revokeObjectURL(removed[0].url)
    }
    onChange(next)
  }

  const canAddMore = value.length < maxFiles

  function isImage(type?: string) {
    return type?.startsWith("image/")
  }
  function isVideo(type?: string) {
    return type?.startsWith("video/")
  }
  function isAudio(type?: string) {
    return type?.startsWith("audio/")
  }
  function isPdf(type?: string, name?: string) {
    return type === "application/pdf" || (name?.toLowerCase()?.endsWith(".pdf") ?? false)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <Button type="button" variant="secondary" onClick={handlePick} disabled={!canAddMore}>
          {canAddMore ? "Add files" : "Max files reached"}
        </Button>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className="cursor-help">{`${value.length}/${maxFiles}`}</Badge>
            </TooltipTrigger>
            <TooltipContent className="bg-popover text-popover-foreground border-border">{helper}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <Input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {isUploading ? (
        <div className="space-y-2">
          <Label className="text-sm text-muted-foreground">Uploading…</Label>
          <Progress value={progress} aria-label="Upload progress" />
        </div>
      ) : null}

      {value.length > 0 ? (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {value.map((m, idx) => (
            <li key={m.id} className="border border-border rounded-md p-3 space-y-2 bg-card text-card-foreground">
              <div className="text-sm font-medium break-words">{m.file_name ?? "Untitled"}</div>
              <div className="aspect-video rounded-sm overflow-hidden bg-muted flex items-center justify-center">
                {isImage(m.file_type) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={m.url || "/placeholder.svg"}
                    alt={m.file_name ?? "uploaded image"}
                    className="h-full w-full object-cover"
                  />
                ) : isVideo(m.file_type) ? (
                  <video src={m.url} controls className="h-full w-full" crossOrigin="anonymous" />
                ) : isAudio(m.file_type) ? (
                  <audio src={m.url} controls className="w-full" />
                ) : isPdf(m.file_type, m.file_name) ? (
                  <div className="p-4 text-sm text-muted-foreground">PDF ready • Use Download to open</div>
                ) : (
                  <div className="p-4 text-sm text-muted-foreground">Unsupported preview</div>
                )}
              </div>
              <div className="flex items-center justify-between gap-2">
                <a
                  href={m.url}
                  download={m.file_name ?? "download"}
                  className="text-sm underline underline-offset-4 hover:opacity-80"
                >
                  Download
                </a>
                <Button variant="ghost" size="sm" onClick={() => removeAt(idx)}>
                  Remove
                </Button>
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      {/* Cloudinary integration note
        Replace the simulated upload with your Cloudinary flow.
        - Get a signature from your server route
        - POST to Cloudinary unsigned/signed upload
        - Use resulting public_id and secure_url to populate Media[]
      */}
    </div>
  )
}
