export const Skeleton = ({ className = "h-4 w-full" }: { className?: string }) => (
  <div className={`animate-pulse rounded-md bg-slate-200 dark:bg-slate-800 ${className}`} />
);
