import { useFormContext, Controller } from "react-hook-form";
import {
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { FileText } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { FileUpload } from "../file-upload";

export const Step5ResumeUpload: React.FC = () => {
  const { control, watch, setValue } = useFormContext();
  const resumeFile = watch("resume");
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const prevUrlRef = useRef<string | null>(null);

  useEffect(() => {
    // Revoke previous URL if exists
    if (prevUrlRef.current) {
      URL.revokeObjectURL(prevUrlRef.current);
      prevUrlRef.current = null;
    }
    if (resumeFile instanceof File && resumeFile.type === "application/pdf") {
      const url = URL.createObjectURL(resumeFile);
      setPdfUrl(url);
      prevUrlRef.current = url;
    } else {
      setPdfUrl(null);
    }
    // Cleanup on unmount
    return () => {
      if (prevUrlRef.current) {
        URL.revokeObjectURL(prevUrlRef.current);
        prevUrlRef.current = null;
      }
    };
  }, [resumeFile]);

  return (
    <FormItem>
      <FormLabel>Resume (PDF, optional)</FormLabel>
      <FormControl>
        <Controller
          name="resume"
          control={control}
          render={({ field }) => (
            <div className="flex flex-col items-center gap-4 w-full">
              <FileUpload
                value={field.value}
                onChange={(file) => setValue("resume", file)}
                accept="application/pdf"
                multiple={false}
                maxSize={5}
              />
              <div className="w-full flex flex-col items-center">
                {pdfUrl && (
                  <button
                    type="button"
                    className="flex cursor-pointer items-center gap-2 mt-2 px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition"
                    onClick={() => {
                      if (pdfUrl)
                        window.open(pdfUrl, "_blank", "noopener,noreferrer");
                    }}
                  >
                    <FileText className="h-5 w-5" />
                    <span>Open PDF in New Tab</span>
                  </button>
                )}
              </div>
            </div>
          )}
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  );
};
