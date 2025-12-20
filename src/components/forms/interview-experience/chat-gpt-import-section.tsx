import { useFormContext } from "react-hook-form";
import { interviewExperienceSchema } from "@/lib/zod/schema/interview-experience.schema";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

export function ChatGPTImportSection() {
  const { setValue } = useFormContext();
  const [jsonInput, setJsonInput] = useState("");
  const [parsing, setParsing] = useState(false);

  const handleImport = () => {
    setParsing(true);
    try {
      // Remove triple backticks and optional "json" label
      let cleaned = jsonInput.trim();
      if (cleaned.startsWith("```")) {
        cleaned = cleaned
          .replace(/^```(json)?/i, "")
          .replace(/```$/, "")
          .trim();
      }

      const parsed = JSON.parse(cleaned);
      parsed.resume = null;

      const result = interviewExperienceSchema.safeParse(parsed);
      console.log("Parsed result:", result);
      if (result.success) {
        Object.entries(result.data).forEach(([key, value]) => {
          setValue(key as string, value);
        });
        toast.success("Form filled from ChatGPT JSON!");
      } else {
        toast.error("Validation failed. Please check the JSON format.");
      }
    } catch {
      toast.error("Invalid JSON. Please check your input.");
    } finally {
      setParsing(false);
    }
  };

  return (
    <div className="space-y-2">
      <Textarea
        value={jsonInput}
        onChange={(e) => setJsonInput(e.target.value)}
        placeholder="Paste the final JSON from ChatGPT here"
        rows={6}
        className="font-mono"
        aria-label="Paste ChatGPT JSON"
      />
      <Button type="button" onClick={handleImport} disabled={parsing}>
        Import & Autofill
      </Button>
    </div>
  );
}
