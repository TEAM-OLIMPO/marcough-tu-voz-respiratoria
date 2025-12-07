import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { AudioRecorder } from '@/components/AudioRecorder';
import { Sintomas, AnalysisResult, HistoryEntry } from '@/types/marcough';
import { getSelectedProfile, addHistoryEntry } from '@/lib/storage';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export default function Grabacion() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const sintomas = location.state?.sintomas as Sintomas;
  const profile = getSelectedProfile();

  if (!sintomas || !profile) {
    navigate('/');
    return null;
  }

  const handleRecordingComplete = async (audioBlob: Blob) => {
    setIsAnalyzing(true);

    try {
      // Convert audio to base64
      const reader = new FileReader();
      const audioBase64 = await new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const result = reader.result as string;
          // Remove data URL prefix
          const base64 = result.split(',')[1];
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(audioBlob);
      });

      // Call the analyze edge function
      const { data, error } = await supabase.functions.invoke('analyze', {
        body: {
          audio: audioBase64,
          audioType: audioBlob.type,
          sintomas,
          perfil: {
            grupoEdad: profile.grupoEdad,
            condicionesPrevias: profile.condicionesPrevias,
          },
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      const resultado = data as AnalysisResult;

      // Save to history
      const historyEntry: HistoryEntry = {
        id: crypto.randomUUID(),
        fecha: new Date().toISOString(),
        perfilId: profile.id,
        perfilNombre: profile.nombre,
        sintomas,
        resultado,
      };
      addHistoryEntry(historyEntry);

      // Navigate to results
      navigate('/resultado', { state: { resultado } });

    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: 'Error en el análisis',
        description: 'No se pudo procesar la grabación. Por favor, intenta de nuevo.',
        variant: 'destructive',
      });
      setIsAnalyzing(false);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  if (isAnalyzing) {
    return (
      <MobileLayout title="Analizando..." showBack={false}>
        <div className="flex-1 flex flex-col items-center justify-center gap-6">
          <div className="w-20 h-20 gradient-primary rounded-full flex items-center justify-center shadow-glow animate-pulse-soft">
            <Loader2 className="w-10 h-10 text-primary-foreground animate-spin" />
          </div>
          <div className="text-center space-y-2">
            <p className="text-lg font-medium text-foreground">
              Procesando tu grabación...
            </p>
            <p className="text-sm text-muted-foreground">
              Esto puede tomar unos segundos
            </p>
          </div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout 
      title="Grabación de tos" 
      subtitle={`Perfil: ${profile.nombre}`}
      showBack
    >
      <div className="flex-1 flex flex-col">
        <AudioRecorder
          onRecordingComplete={handleRecordingComplete}
          onCancel={handleCancel}
        />
      </div>
    </MobileLayout>
  );
}
