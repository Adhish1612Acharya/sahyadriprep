import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { format } from "date-fns"; // <-- Add this import

export function StudentCard({ student }: { student: any }) {
  const {
    fullName,
    usn,
    branch,
    batch,
    createdAt: profileCompletedAt,
  } = student.studentProfile || {};
  const {
    email,
    createdAt: registeredAt,
    profileCompleted,
  } = student.authProfile || {};

  // Helper to format date
  const formatDate = (date: any) => {
    if (!date) return "-";
    const d =
      typeof date === "string" || typeof date === "number"
        ? new Date(date)
        : date;
    if (isNaN(d.getTime())) return "-";
    return format(d, "dd MMM yyyy");
  };

  return (
    <Card className="flex flex-col h-full shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-bold truncate">
          {fullName || "No Name"}
        </CardTitle>
        <Badge
          variant={profileCompleted ? "default" : "secondary"}
          className={cn(
            "ml-2 px-2 py-1 rounded text-xs font-medium",
            profileCompleted
              ? "bg-green-100 text-green-700"
              : "bg-yellow-100 text-yellow-700",
          )}
        >
          {profileCompleted ? "Profile Complete" : "Incomplete"}
        </Badge>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-1 text-sm">
        <div className="text-muted-foreground break-all">
          <span className="font-medium">Email:</span> {email}
        </div>
        <div>
          <span className="font-medium">USN:</span> {usn}
        </div>
        <div>
          <span className="font-medium">Branch:</span> {branch}
        </div>
        <div>
          <span className="font-medium">Batch:</span> {batch}
        </div>
        <div className="text-xs text-gray-500 mt-2">
          <span className="font-medium">Registered:</span>{" "}
          {formatDate(registeredAt)}
        </div>
        {profileCompleted && (
          <div className="text-xs text-green-700">
            <span className="font-medium">Profile completed on:</span>{" "}
            {formatDate(profileCompletedAt)}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
