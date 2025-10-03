import { Suspense } from "react";
import UploadResourcePage from "@/components/upload/upload-resource-page";

export default function UploadResourcePageWrapper() {
  return (
    <main className="font-sans mx-auto max-w-6xl p-4 md:p-6 lg:p-8">
      {/* Header + Filters + Lists */}
      <Suspense
        fallback={
          <div className="text-muted-foreground">Loading dashboard…</div>
        }
      >
        <UploadResourcePage />
      </Suspense>
    </main>
  );
}
