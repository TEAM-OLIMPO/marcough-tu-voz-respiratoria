import { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, Square, RotateCcw, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface AudioRecorderProps {
  onRecordingComplete: (audioBlob: Blob) => void;
  onCancel: () => void;
}

const MIN_DURATION = 2000; // 2 seconds
const MAX_DURATION = 5000; // 5 seconds

export function AudioRecorder({ onRecordingComplete, onCancel }: AudioRecorderProps) {
  const [status, setStatus] = useState<'idle' | 'recording' | 'recorded'>('idle');
  const [duration, setDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const { toast } = useToast();

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      stopRecording();
    };
  }, [stopRecording]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mediaRecorder.mimeType });
        setAudioBlob(blob);
        setStatus('recorded');
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start(100);
      setStatus('recording');
      setDuration(0);

      const startTime = Date.now();
      timerRef.current = window.setInterval(() => {
        const elapsed = Date.now() - startTime;
        setDuration(elapsed);
        
        if (elapsed >= MAX_DURATION) {
          stopRecording();
        }
      }, 100);

    } catch (error) {
      toast({
        title: 'Error de micrófono',
        description: 'No se pudo acceder al micrófono. Por favor, permite el acceso.',
        variant: 'destructive',
      });
    }
  };

  const handleStop = () => {
    if (duration < MIN_DURATION) {
      toast({
        title: 'Grabación muy corta',
        description: 'La grabación debe durar al menos 2 segundos.',
        variant: 'destructive',
      });
      return;
    }
    stopRecording();
  };

  const handleReset = () => {
    setAudioBlob(null);
    setDuration(0);
    setStatus('idle');
  };

  const handleConfirm = () => {
    if (audioBlob) {
      onRecordingComplete(audioBlob);
    }
  };

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const decimals = Math.floor((ms % 1000) / 100);
    return `${seconds}.${decimals}s`;
  };

  const progress = Math.min((duration / MAX_DURATION) * 100, 100);
  const isValidDuration = duration >= MIN_DURATION;

  return (
    <div className="flex flex-col items-center gap-8 py-8">
      {/* Instructions */}
      <div className="text-center space-y-2">
        <p className="text-foreground font-medium">
          Graba una tos corta de 2 a 5 segundos
        </p>
        <p className="text-muted-foreground text-sm">
          Tose una o dos veces durante la grabación
        </p>
      </div>

      {/* Waveform visualization */}
      <div className="relative w-full max-w-xs h-24 flex items-center justify-center">
        <div className="flex items-center gap-1">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className={cn(
                'w-1.5 rounded-full transition-all duration-150',
                status === 'recording' 
                  ? 'bg-primary animate-wave' 
                  : status === 'recorded'
                    ? 'bg-success'
                    : 'bg-muted',
              )}
              style={{
                height: status === 'recording' 
                  ? `${Math.random() * 60 + 20}px`
                  : status === 'recorded'
                    ? '40px'
                    : '20px',
                animationDelay: `${i * 0.05}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Timer and progress */}
      <div className="w-full max-w-xs space-y-2">
        <div className="flex justify-between text-sm">
          <span className={cn(
            'font-mono',
            isValidDuration ? 'text-success' : 'text-foreground'
          )}>
            {formatDuration(duration)}
          </span>
          <span className="text-muted-foreground">
            {formatDuration(MAX_DURATION)}
          </span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-100',
              isValidDuration ? 'bg-success' : 'bg-primary'
            )}
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-center text-muted-foreground">
          {duration < MIN_DURATION 
            ? `Mínimo ${MIN_DURATION / 1000}s` 
            : 'Duración válida ✓'}
        </p>
      </div>

      {/* Controls */}
      <div className="flex gap-4">
        {status === 'idle' && (
          <>
            <Button variant="muted" onClick={onCancel}>
              Cancelar
            </Button>
            <Button variant="hero" size="lg" onClick={startRecording}>
              <Mic className="h-5 w-5 mr-2" />
              Grabar
            </Button>
          </>
        )}

        {status === 'recording' && (
          <Button 
            variant="destructive" 
            size="lg" 
            onClick={handleStop}
            disabled={duration < MIN_DURATION}
          >
            <Square className="h-5 w-5 mr-2" />
            Detener
          </Button>
        )}

        {status === 'recorded' && (
          <>
            <Button variant="outline" onClick={handleReset}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Repetir
            </Button>
            <Button variant="hero" size="lg" onClick={handleConfirm}>
              <Check className="h-5 w-5 mr-2" />
              Analizar
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
