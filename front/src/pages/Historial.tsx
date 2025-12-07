import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, ChevronRight, Calendar } from 'lucide-react';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { RiskBadge } from '@/components/RiskBadge';
import { HistoryEntry } from '@/types/marcough';
import { getHistory, clearHistory } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('es-CO', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

export default function Historial() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    setHistory(getHistory());
  }, []);

  const handleClear = () => {
    clearHistory();
    setHistory([]);
    toast({
      title: 'Historial borrado',
      description: 'Todos los registros han sido eliminados.',
    });
  };

  const handleViewResult = (entry: HistoryEntry) => {
    navigate('/resultado', { state: { resultado: entry.resultado } });
  };

  return (
    <MobileLayout 
      title="Historial" 
      subtitle={`${history.length} chequeos registrados`}
      showBack
    >
      <div className="space-y-4">
        {history.length === 0 ? (
          <Card className="p-8 text-center shadow-card">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              No hay chequeos registrados aún.
            </p>
          </Card>
        ) : (
          <>
            {history.map((entry, index) => (
              <Card
                key={entry.id}
                className="p-4 shadow-soft cursor-pointer hover:shadow-card transition-all animate-fade-in"
                style={{ animationDelay: `${index * 0.05}s` }}
                onClick={() => handleViewResult(entry)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <RiskBadge nivel={entry.resultado.nivel_riesgo} size="sm" />
                      <span className="text-sm font-medium text-foreground">
                        {entry.resultado.puntaje_riesgo}/100
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">
                      {entry.perfilNombre}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(entry.fecha)}
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </Card>
            ))}

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="w-full mt-4 text-destructive border-destructive/30">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Borrar historial
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="max-w-sm mx-4">
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Borrar historial?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción eliminará todos los chequeos registrados. No se puede deshacer.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleClear} className="bg-destructive text-destructive-foreground">
                    Borrar todo
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        )}
      </div>
    </MobileLayout>
  );
}
