import { Button } from "@/components/ui/button";
import { CHATGPT_INTERVIEW_PROMPT } from "@/constants/chatgpt-interview-experience-prompt";
import { toast } from "sonner";
import { ClipboardCopy } from "lucide-react";

export function ChatGPTFillButton() {
  const handleClick = async () => {
    try {
      await navigator.clipboard.writeText(CHATGPT_INTERVIEW_PROMPT);
      window.open("https://chatgpt.com/", "_blank");
      toast.success("Prompt copied! Paste it in ChatGPT.");
    } catch {
      toast.error("Failed to copy prompt. Please try again.");
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <Button
        type="button"
        variant="secondary"
        onClick={handleClick}
        aria-label="Fill using AI (ChatGPT Assisted)"
        className="gap-2 cursor-pointer"
      >
        <ClipboardCopy className="w-4 h-4" />
        Click to Fill using AI (ChatGPT Assisted)
      </Button>
      <p className="text-xs text-muted-foreground mt-1 text-center max-w-xs">
        ChatGPT will interview you step-by-step and generate a final JSON. Paste
        it here.
      </p>
    </div>
  );
}
