interface EmptyStateProps {
  message: string;
  description?: string;
}

export function EmptyState({ message, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <p className="text-sm text-on-surface">{message}</p>
      {description && (
        <p className="mt-1 text-xs text-on-surface-variant">{description}</p>
      )}
    </div>
  );
}
