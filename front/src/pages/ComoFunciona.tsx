import { Mic, FileText, Brain, Shield, AlertTriangle } from 'lucide-react';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { Card } from '@/components/ui/card';

const steps = [
  {
    icon: FileText,
    title: 'Registra tus síntomas',
    description: 'Responde preguntas simples sobre cómo te sientes: duración de la tos, fiebre, dificultad para respirar y más.',
  },
  {
    icon: Mic,
    title: 'Graba tu tos',
    description: 'Realiza una grabación corta de 2 a 5 segundos mientras toses. Nuestro sistema analiza el patrón de sonido.',
  },
  {
    icon: Brain,
    title: 'Análisis inteligente',
    description: 'Combinamos los síntomas y el patrón de tos para identificar categorías clínicas compatibles y nivel de riesgo.',
  },
  {
    icon: Shield,
    title: 'Resultados y recomendaciones',
    description: 'Recibes un puntaje de riesgo, recomendaciones preventivas y signos de alarma para consultar un profesional.',
  },
];

export default function ComoFunciona() {
  return (
    <MobileLayout title="Cómo funciona" subtitle="Conoce el proceso de Marcough" showBack>
      <div className="space-y-6">
        {/* Steps */}
        <div className="space-y-4">
          {steps.map((step, index) => (
            <Card 
              key={index} 
              className="p-4 shadow-soft animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex gap-4">
                <div className="shrink-0 w-10 h-10 gradient-primary rounded-lg flex items-center justify-center">
                  <step.icon className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-primary font-medium">Paso {index + 1}</span>
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Important Notice */}
        <Card className="p-4 shadow-soft border-warning/50 animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-foreground mb-2">Importante</h3>
              <p className="text-sm text-muted-foreground">
                Marcough es una herramienta de <strong>tamizaje y prevención</strong>. 
                No proporciona diagnósticos médicos. Siempre consulta a un profesional 
                de la salud para evaluaciones clínicas completas.
              </p>
            </div>
          </div>
        </Card>

        {/* Clinical Categories */}
        <Card className="p-4 shadow-soft animate-fade-in" style={{ animationDelay: '0.5s' }}>
          <h3 className="font-semibold text-foreground mb-3">Categorías clínicas que evaluamos</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span><strong>IRA Leve:</strong> Infección respiratoria aguda de bajo impacto</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span><strong>IRA Moderada-Grave:</strong> Requiere atención médica oportuna</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span><strong>Asma posible:</strong> Patrón compatible con asma bronquial</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span><strong>EPOC crónica posible:</strong> Compatible con enfermedad pulmonar obstructiva</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span><strong>Bajo riesgo:</strong> Sin indicadores preocupantes detectados</span>
            </li>
          </ul>
        </Card>

        {/* Disclaimer */}
        <p className="text-xs text-center text-muted-foreground px-4 pb-4 animate-fade-in" style={{ animationDelay: '0.6s' }}>
          Marcough NO diagnostica enfermedades. Es una herramienta de tamizaje y prevención 
          diseñada para el contexto colombiano.
        </p>
      </div>
    </MobileLayout>
  );
}
