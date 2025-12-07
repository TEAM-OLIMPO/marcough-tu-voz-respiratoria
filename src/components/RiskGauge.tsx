import { cn } from '@/lib/utils';

interface RiskGaugeProps {
  puntaje: number;
  nivel: 'bajo' | 'medio' | 'alto';
}

export function RiskGauge({ puntaje, nivel }: RiskGaugeProps) {
  const rotation = (puntaje / 100) * 180 - 90; // -90 to 90 degrees

  return (
    <div className="relative w-48 h-24 mx-auto">
      {/* Background arc */}
      <svg className="w-full h-full" viewBox="0 0 100 50">
        <defs>
          <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(var(--success))" />
            <stop offset="50%" stopColor="hsl(var(--warning))" />
            <stop offset="100%" stopColor="hsl(var(--destructive))" />
          </linearGradient>
        </defs>
        <path
          d="M 5 50 A 45 45 0 0 1 95 50"
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <path
          d="M 5 50 A 45 45 0 0 1 95 50"
          fill="none"
          stroke="url(#gaugeGradient)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${(puntaje / 100) * 141.37} 141.37`}
        />
      </svg>
      
      {/* Needle */}
      <div
        className="absolute bottom-0 left-1/2 origin-bottom transition-transform duration-1000 ease-out"
        style={{ transform: `translateX(-50%) rotate(${rotation}deg)` }}
      >
        <div className={cn(
          'w-1 h-16 rounded-full',
          nivel === 'bajo' && 'bg-success',
          nivel === 'medio' && 'bg-warning',
          nivel === 'alto' && 'bg-destructive'
        )} />
        <div className={cn(
          'absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full',
          nivel === 'bajo' && 'bg-success',
          nivel === 'medio' && 'bg-warning',
          nivel === 'alto' && 'bg-destructive'
        )} />
      </div>
      
      {/* Score display */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-6 text-center">
        <span className={cn(
          'text-3xl font-bold',
          nivel === 'bajo' && 'text-success',
          nivel === 'medio' && 'text-warning',
          nivel === 'alto' && 'text-destructive'
        )}>
          {puntaje}
        </span>
        <span className="text-muted-foreground text-sm">/100</span>
      </div>
    </div>
  );
}
