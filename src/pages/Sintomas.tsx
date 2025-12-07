import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card } from '@/components/ui/card';
import { Sintomas } from '@/types/marcough';
import { getSelectedProfile } from '@/lib/storage';

const duracionOptions = [
  { value: 'menos_24h', label: 'Menos de 24 horas' },
  { value: '1_3_dias', label: '1 a 3 días' },
  { value: 'mas_3_dias', label: 'Más de 3 días' },
] as const;

const dificultadOptions = [
  { value: 'no', label: 'No' },
  { value: 'leve', label: 'Leve' },
  { value: 'moderada', label: 'Moderada' },
  { value: 'severa', label: 'Severa' },
] as const;

const energiaOptions = [
  { value: 'normal', label: 'Normal' },
  { value: 'bajo', label: 'Bajo' },
  { value: 'muy_bajo', label: 'Muy bajo' },
] as const;

const booleanOptions = [
  { value: 'true', label: 'Sí' },
  { value: 'false', label: 'No' },
] as const;

export default function SintomasPage() {
  const navigate = useNavigate();
  const profile = getSelectedProfile();

  const [sintomas, setSintomas] = useState<Sintomas>({
    duracionTos: 'menos_24h',
    fiebre: false,
    dificultadRespirar: 'no',
    dolorPecho: false,
    sibilancias: false,
    nivelEnergia: 'normal',
  });

  const handleContinue = () => {
    navigate('/grabacion', { state: { sintomas } });
  };

  if (!profile) {
    navigate('/perfiles');
    return null;
  }

  return (
    <MobileLayout 
      title="Síntomas" 
      subtitle={`Perfil: ${profile.nombre}`}
      showBack
    >
      <div className="space-y-6 pb-24">
        {/* Duración de la tos */}
        <Card className="p-4 shadow-soft animate-fade-in">
          <Label className="text-base font-medium mb-3 block">
            ¿Hace cuánto tiempo tienes tos?
          </Label>
          <RadioGroup
            value={sintomas.duracionTos}
            onValueChange={(v) => setSintomas({ ...sintomas, duracionTos: v as Sintomas['duracionTos'] })}
            className="space-y-2"
          >
            {duracionOptions.map(opt => (
              <div key={opt.value} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <RadioGroupItem value={opt.value} id={`duracion-${opt.value}`} />
                <Label htmlFor={`duracion-${opt.value}`} className="font-normal cursor-pointer flex-1">
                  {opt.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </Card>

        {/* Fiebre */}
        <Card className="p-4 shadow-soft animate-fade-in" style={{ animationDelay: '0.05s' }}>
          <Label className="text-base font-medium mb-3 block">
            ¿Tienes fiebre?
          </Label>
          <RadioGroup
            value={sintomas.fiebre.toString()}
            onValueChange={(v) => setSintomas({ ...sintomas, fiebre: v === 'true' })}
            className="flex gap-4"
          >
            {booleanOptions.map(opt => (
              <div key={opt.value} className="flex items-center space-x-2">
                <RadioGroupItem value={opt.value} id={`fiebre-${opt.value}`} />
                <Label htmlFor={`fiebre-${opt.value}`} className="font-normal cursor-pointer">
                  {opt.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </Card>

        {/* Dificultad para respirar */}
        <Card className="p-4 shadow-soft animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <Label className="text-base font-medium mb-3 block">
            ¿Tienes dificultad para respirar?
          </Label>
          <RadioGroup
            value={sintomas.dificultadRespirar}
            onValueChange={(v) => setSintomas({ ...sintomas, dificultadRespirar: v as Sintomas['dificultadRespirar'] })}
            className="space-y-2"
          >
            {dificultadOptions.map(opt => (
              <div key={opt.value} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <RadioGroupItem value={opt.value} id={`dificultad-${opt.value}`} />
                <Label htmlFor={`dificultad-${opt.value}`} className="font-normal cursor-pointer flex-1">
                  {opt.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </Card>

        {/* Dolor en el pecho */}
        <Card className="p-4 shadow-soft animate-fade-in" style={{ animationDelay: '0.15s' }}>
          <Label className="text-base font-medium mb-3 block">
            ¿Sientes dolor en el pecho?
          </Label>
          <RadioGroup
            value={sintomas.dolorPecho.toString()}
            onValueChange={(v) => setSintomas({ ...sintomas, dolorPecho: v === 'true' })}
            className="flex gap-4"
          >
            {booleanOptions.map(opt => (
              <div key={opt.value} className="flex items-center space-x-2">
                <RadioGroupItem value={opt.value} id={`dolor-${opt.value}`} />
                <Label htmlFor={`dolor-${opt.value}`} className="font-normal cursor-pointer">
                  {opt.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </Card>

        {/* Sibilancias */}
        <Card className="p-4 shadow-soft animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <Label className="text-base font-medium mb-3 block">
            ¿Escuchas silbidos al respirar?
          </Label>
          <RadioGroup
            value={sintomas.sibilancias.toString()}
            onValueChange={(v) => setSintomas({ ...sintomas, sibilancias: v === 'true' })}
            className="flex gap-4"
          >
            {booleanOptions.map(opt => (
              <div key={opt.value} className="flex items-center space-x-2">
                <RadioGroupItem value={opt.value} id={`sibilancias-${opt.value}`} />
                <Label htmlFor={`sibilancias-${opt.value}`} className="font-normal cursor-pointer">
                  {opt.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </Card>

        {/* Nivel de energía */}
        <Card className="p-4 shadow-soft animate-fade-in" style={{ animationDelay: '0.25s' }}>
          <Label className="text-base font-medium mb-3 block">
            ¿Cómo está tu nivel de energía?
          </Label>
          <RadioGroup
            value={sintomas.nivelEnergia}
            onValueChange={(v) => setSintomas({ ...sintomas, nivelEnergia: v as Sintomas['nivelEnergia'] })}
            className="space-y-2"
          >
            {energiaOptions.map(opt => (
              <div key={opt.value} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <RadioGroupItem value={opt.value} id={`energia-${opt.value}`} />
                <Label htmlFor={`energia-${opt.value}`} className="font-normal cursor-pointer flex-1">
                  {opt.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </Card>
      </div>

      {/* Fixed bottom button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent">
        <div className="max-w-md mx-auto">
          <Button variant="hero" size="xl" className="w-full" onClick={handleContinue}>
            Continuar a grabación
            <ArrowRight className="h-5 w-5 ml-2" />
          </Button>
        </div>
      </div>
    </MobileLayout>
  );
}
