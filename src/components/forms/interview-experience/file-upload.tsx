"use client";

import type React from "react";
import { useState, useRef } from "react";
import { Upload, X, File, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  value?: File | File[];
  onChange: (file: File | File[] | undefined) => void;
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in MB
}

export function FileUpload({
  value,
  onChange,
  accept = "*",
  multiple = false,
  maxSize = 5,
}: FileUploadProps) {
  const [error, setError] = useState<string>("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const files: File[] = (() => {
    if (typeof File === "undefined") {
      return [];
    }
    if (multiple && Array.isArray(value)) {
      if (value.length > 0) {
        return value.flat(Infinity).filter((f): f is File => f instanceof File);
      }
      return [];
    } else if (value && !Array.isArray(value) && typeof value === "object") {
      return [value];
    } else {
      return [];
    }
  })();

  const validateFile = (file: File) => {
    if (file.size > maxSize * 1024 * 1024) {
      setError(`File size exceeds ${maxSize}MB limit`);
      return false;
    }
    return true;
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError("");
    const selectedFiles = Array.from(e.target.files || []);
    const validFiles = selectedFiles.filter(validateFile);

    if (validFiles.length > 0) {
      if (multiple) {
        onChange(
          [...(Array.isArray(files) ? files : []), ...validFiles].flat()
        );
      } else {
        onChange(validFiles[0]);
      }
    }
  };

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    if (multiple) {
      onChange(newFiles.length > 0 ? newFiles : undefined);
    } else {
      onChange(undefined);
    }
  };

  return (
    <div className="space-y-4">
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
          "border-muted-foreground/25 hover:border-muted-foreground/50"
        )}
        tabIndex={0}
        role="button"
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="w-10 h-10 mx-auto mb-2 text-muted-foreground" />
        <p className="text-sm font-semibold">
          Click here to browse and select your files
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileInput}
          className="hidden"
          id="file-input"
        />
        <p className="text-xs text-muted-foreground mt-2">
          Max file size: {maxSize}MB
        </p>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {files.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-semibold">Uploaded Files:</p>
          {files.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="flex items-center justify-between p-3 bg-muted rounded-lg"
            >
              <div className="flex items-center gap-3">
                {file.type === "application/pdf" ? (
                  <FileText className="w-5 h-5 text-red-500" />
                ) : (
                  <File className="w-5 h-5 text-blue-500" />
                )}
                <div className="text-left">
                  <p className="text-sm font-medium truncate max-w-xs">
                    {file.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeFile(index)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
