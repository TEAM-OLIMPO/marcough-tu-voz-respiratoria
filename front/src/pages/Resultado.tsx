import { useLocation, useNavigate } from 'react-router-dom';
import { Home, AlertTriangle, Shield, Lightbulb, Activity } from 'lucide-react';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { RiskBadge } from '@/components/RiskBadge';
import { RiskGauge } from '@/components/RiskGauge';
import { AnalysisResult } from '@/types/marcough';
import { cn } from '@/lib/utils';

const patronLabels: Record<AnalysisResult['patron_tos'], string> = {
  tos_explosiva: 'Tos explosiva',
  tos_frecuente: 'Tos frecuente',
  tos_con_silbido: 'Tos con silbido',
  tos_suave: 'Tos suave',
  indefinida: 'Patrón indefinido',
};

const categoriaLabels: Record<AnalysisResult['categoria_clinica'], string> = {
  ira_leve: 'IRA Leve',
  ira_moderada_grave: 'IRA Moderada-Grave',
  asma_posible: 'Asma Posible',
  epoc_cronica_posible: 'EPOC Crónica Posible',
  bajo_riesgo: 'Bajo Riesgo',
};

export default function Resultado() {
  const location = useLocation();
  const navigate = useNavigate();

  const resultado = location.state?.resultado as AnalysisResult;

  if (!resultado) {
    navigate('/');
    return null;
  }

  return (
    <MobileLayout title="Resultado del análisis" showBack>
      <div className="space-y-6 pb-24">
        {/* Risk Score */}
        <Card className={cn(
          'p-6 shadow-card animate-fade-in',
          resultado.nivel_riesgo === 'alto' && 'border-destructive/50'
        )}>
          <div className="text-center mb-6">
            <RiskBadge nivel={resultado.nivel_riesgo} size="lg" />
          </div>
          
          <RiskGauge 
            puntaje={resultado.puntaje_riesgo} 
            nivel={resultado.nivel_riesgo}
          />

          <p className="text-center text-muted-foreground mt-8 text-sm">
            {resultado.mensaje_riesgo}
          </p>
        </Card>

        {/* Pattern & Category */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="p-4 shadow-soft animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center gap-2 mb-2">
              <Activity className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground">Patrón de tos</span>
            </div>
            <p className="font-semibold text-foreground">
              {patronLabels[resultado.patron_tos]}
            </p>
          </Card>

          <Card className="p-4 shadow-soft animate-fade-in" style={{ animationDelay: '0.15s' }}>
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground">Categoría</span>
            </div>
            <p className="font-semibold text-foreground">
              {categoriaLabels[resultado.categoria_clinica]}
            </p>
          </Card>
        </div>

        {/* Category Description */}
        <Card className="p-4 shadow-soft animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <p className="text-sm text-muted-foreground">
            {resultado.descripcion_categoria}
          </p>
        </Card>

        {/* Recommendations */}
        <Card className="p-4 shadow-soft animate-fade-in" style={{ animationDelay: '0.25s' }}>
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="h-5 w-5 text-success" />
            <h3 className="font-semibold text-foreground">Recomendaciones preventivas</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            {resultado.recomendaciones_preventivas}
          </p>
        </Card>

        {/* Warning Signs */}
        {resultado.signos_alarma.length > 0 && (
          <Card className="p-4 shadow-soft border-warning/50 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="h-5 w-5 text-warning" />
              <h3 className="font-semibold text-foreground">Signos de alarma</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              Consulta a un profesional de salud si presentas:
            </p>
            <ul className="space-y-2">
              {resultado.signos_alarma.map((signo, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-foreground">
                  <span className="text-warning">•</span>
                  {signo}
                </li>
              ))}
            </ul>
          </Card>
        )}

        {/* Disclaimer */}
        <p className="text-xs text-center text-muted-foreground px-4 animate-fade-in" style={{ animationDelay: '0.35s' }}>
          Marcough NO diagnostica enfermedades. Es una herramienta de tamizaje y prevención. 
          Consulta siempre a un profesional de la salud.
        </p>
      </div>

      {/* Fixed bottom button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent">
        <div className="max-w-md mx-auto">
          <Button variant="hero" size="xl" className="w-full" onClick={() => navigate('/')}>
            <Home className="h-5 w-5 mr-2" />
            Volver al inicio
          </Button>
        </div>
      </div>
    </MobileLayout>
  );
}
