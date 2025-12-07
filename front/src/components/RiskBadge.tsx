import { cn } from '@/lib/utils';

interface RiskBadgeProps {
  nivel: 'bajo' | 'medio' | 'alto';
  size?: 'sm' | 'md' | 'lg';
}

const labels = {
  bajo: 'Bajo',
  medio: 'Medio',
  alto: 'Alto',
};

export function RiskBadge({ nivel, size = 'md' }: RiskBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center font-semibold rounded-full uppercase tracking-wide',
        size === 'sm' && 'px-2 py-0.5 text-xs',
        size === 'md' && 'px-3 py-1 text-sm',
        size === 'lg' && 'px-4 py-1.5 text-base',
        nivel === 'bajo' && 'bg-success/15 text-success',
        nivel === 'medio' && 'bg-warning/15 text-warning',
        nivel === 'alto' && 'bg-destructive/15 text-destructive'
      )}
    >
      {labels[nivel]}
    </span>
  );
}
