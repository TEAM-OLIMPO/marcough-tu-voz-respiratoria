import { useState, useEffect } from 'react';
import { Plus, Check, Trash2, Edit2 } from 'lucide-react';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Profile } from '@/types/marcough';
import { getProfiles, saveProfile, deleteProfile, getSelectedProfileId, setSelectedProfileId } from '@/lib/storage';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const gruposEdad = [
  { value: 'nino', label: 'Niño (0-12 años)' },
  { value: 'adulto', label: 'Adulto (13-64 años)' },
  { value: 'adulto_mayor', label: 'Adulto mayor (65+ años)' },
] as const;

const condiciones = [
  { value: 'asma', label: 'Asma' },
  { value: 'epoc', label: 'EPOC' },
  { value: 'fibrosis_pulmonar', label: 'Fibrosis pulmonar' },
  { value: 'apnea_sueno', label: 'Apnea del sueño' },
  { value: 'ninguna', label: 'Ninguna' },
] as const;

export default function Perfiles() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
  const { toast } = useToast();

  // Form state
  const [nombre, setNombre] = useState('');
  const [grupoEdad, setGrupoEdad] = useState<Profile['grupoEdad']>('adulto');
  const [condicionesPrevias, setCondicionesPrevias] = useState<Profile['condicionesPrevias']>([]);

  useEffect(() => {
    setProfiles(getProfiles());
    setSelectedId(getSelectedProfileId());
  }, []);

  const resetForm = () => {
    setNombre('');
    setGrupoEdad('adulto');
    setCondicionesPrevias([]);
    setEditingProfile(null);
  };

  const openEditDialog = (profile: Profile) => {
    setEditingProfile(profile);
    setNombre(profile.nombre);
    setGrupoEdad(profile.grupoEdad);
    setCondicionesPrevias([...profile.condicionesPrevias]);
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!nombre.trim()) {
      toast({
        title: 'Nombre requerido',
        description: 'Por favor ingresa un nombre para el perfil.',
        variant: 'destructive',
      });
      return;
    }

    const profile: Profile = {
      id: editingProfile?.id || crypto.randomUUID(),
      nombre: nombre.trim(),
      grupoEdad,
      condicionesPrevias: condicionesPrevias.length > 0 ? condicionesPrevias : ['ninguna'],
    };

    saveProfile(profile);
    setProfiles(getProfiles());
    
    if (!selectedId) {
      setSelectedProfileId(profile.id);
      setSelectedId(profile.id);
    }

    setIsDialogOpen(false);
    resetForm();

    toast({
      title: editingProfile ? 'Perfil actualizado' : 'Perfil creado',
      description: `El perfil "${profile.nombre}" ha sido guardado.`,
    });
  };

  const handleDelete = (id: string) => {
    deleteProfile(id);
    setProfiles(getProfiles());
    if (selectedId === id) {
      setSelectedId(null);
    }
    toast({
      title: 'Perfil eliminado',
      description: 'El perfil ha sido eliminado correctamente.',
    });
  };

  const handleSelect = (id: string) => {
    setSelectedProfileId(id);
    setSelectedId(id);
    toast({
      title: 'Perfil seleccionado',
      description: 'Este perfil se usará para los próximos chequeos.',
    });
  };

  const handleCondicionChange = (value: Profile['condicionesPrevias'][number], checked: boolean) => {
    if (value === 'ninguna') {
      setCondicionesPrevias(checked ? ['ninguna'] : []);
    } else {
      setCondicionesPrevias(prev => {
        const filtered = prev.filter(c => c !== 'ninguna');
        if (checked) {
          return [...filtered, value];
        }
        return filtered.filter(c => c !== value);
      });
    }
  };

  return (
    <MobileLayout title="Perfiles" subtitle="Gestiona los perfiles de usuario" showBack>
      <div className="space-y-4">
        {profiles.length === 0 ? (
          <Card className="p-8 text-center shadow-card">
            <p className="text-muted-foreground mb-4">
              No hay perfiles creados. Crea uno para comenzar.
            </p>
          </Card>
        ) : (
          profiles.map((profile, index) => (
            <Card
              key={profile.id}
              className={cn(
                'p-4 shadow-soft transition-all cursor-pointer animate-fade-in',
                selectedId === profile.id && 'ring-2 ring-primary shadow-glow'
              )}
              style={{ animationDelay: `${index * 0.05}s` }}
              onClick={() => handleSelect(profile.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-foreground">{profile.nombre}</h3>
                    {selectedId === profile.id && (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                        Activo
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {gruposEdad.find(g => g.value === profile.grupoEdad)?.label}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {profile.condicionesPrevias.map(c => 
                      condiciones.find(cond => cond.value === c)?.label
                    ).join(', ')}
                  </p>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditDialog(profile);
                    }}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(profile.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}

        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button variant="hero" size="lg" className="w-full mt-4">
              <Plus className="h-5 w-5 mr-2" />
              Nuevo perfil
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-sm mx-4">
            <DialogHeader>
              <DialogTitle>
                {editingProfile ? 'Editar perfil' : 'Nuevo perfil'}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre</Label>
                <Input
                  id="nombre"
                  placeholder="Ej: Juan, Mamá, Abuelo..."
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                />
              </div>

              <div className="space-y-3">
                <Label>Grupo de edad</Label>
                <RadioGroup value={grupoEdad} onValueChange={(v) => setGrupoEdad(v as Profile['grupoEdad'])}>
                  {gruposEdad.map(grupo => (
                    <div key={grupo.value} className="flex items-center space-x-2">
                      <RadioGroupItem value={grupo.value} id={grupo.value} />
                      <Label htmlFor={grupo.value} className="font-normal cursor-pointer">
                        {grupo.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div className="space-y-3">
                <Label>Condiciones previas (opcional)</Label>
                {condiciones.map(condicion => (
                  <div key={condicion.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={condicion.value}
                      checked={condicionesPrevias.includes(condicion.value)}
                      onCheckedChange={(checked) => 
                        handleCondicionChange(condicion.value, checked as boolean)
                      }
                    />
                    <Label htmlFor={condicion.value} className="font-normal cursor-pointer">
                      {condicion.label}
                    </Label>
                  </div>
                ))}
              </div>

              <Button variant="hero" className="w-full" onClick={handleSave}>
                <Check className="h-4 w-4 mr-2" />
                Guardar perfil
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </MobileLayout>
  );
}
