import { useNavigate } from 'react-router-dom';
import { Stethoscope, Plus, HelpCircle, History, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getSelectedProfile } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const selectedProfile = getSelectedProfile();

  const handleNuevoChequeo = () => {
    if (!selectedProfile) {
      toast({
        title: 'Selecciona un perfil',
        description: 'Debes crear o seleccionar un perfil antes de iniciar un chequeo.',
        variant: 'destructive',
      });
      navigate('/perfiles');
      return;
    }
    navigate('/sintomas');
  };

  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center text-center mb-8">
        <div className="w-20 h-20 gradient-primary rounded-2xl flex items-center justify-center shadow-glow mb-6 animate-fade-in">
          <Stethoscope className="w-10 h-10 text-primary-foreground" />
        </div>
        
        <h1 className="text-3xl font-bold text-foreground mb-2 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          Marcough
        </h1>
        <p className="text-lg text-primary font-medium mb-3 animate-fade-in" style={{ animationDelay: '0.15s' }}>
          Asistente de Riesgo Respiratorio
        </p>
        <p className="text-muted-foreground text-sm max-w-xs animate-fade-in" style={{ animationDelay: '0.2s' }}>
          Prevención que se escucha. No es un diagnóstico.
        </p>

        {selectedProfile && (
          <div className="mt-6 px-4 py-2 bg-accent rounded-lg animate-fade-in" style={{ animationDelay: '0.25s' }}>
            <p className="text-sm text-accent-foreground">
              Perfil activo: <span className="font-semibold">{selectedProfile.nombre}</span>
            </p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="space-y-3 animate-slide-up" style={{ animationDelay: '0.3s' }}>
        <Button
          variant="hero"
          size="xl"
          className="w-full"
          onClick={handleNuevoChequeo}
        >
          <Plus className="h-5 w-5 mr-2" />
          Nuevo chequeo
        </Button>

        <Button
          variant="secondary"
          size="lg"
          className="w-full"
          onClick={() => navigate('/como-funciona')}
        >
          <HelpCircle className="h-5 w-5 mr-2" />
          Cómo funciona Marcough
        </Button>

        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            size="lg"
            className="w-full"
            onClick={() => navigate('/historial')}
          >
            <History className="h-5 w-5 mr-2" />
            Historial
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="w-full"
            onClick={() => navigate('/perfiles')}
          >
            <Users className="h-5 w-5 mr-2" />
            Perfiles
          </Button>
        </div>
      </div>

      {/* Disclaimer */}
      <p className="text-xs text-center text-muted-foreground mt-8 animate-fade-in" style={{ animationDelay: '0.4s' }}>
        Marcough NO diagnostica enfermedades. Es una herramienta de tamizaje y prevención.
      </p>
    </div>
  );
};

export default Index;
