export function StudentListSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="border rounded-lg p-5 bg-gray-50 animate-pulse h-32"
        />
      ))}
    </div>
  );
}
