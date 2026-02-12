import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { healthApi, allergyApi, medicationApi } from '@/lib/api';
import type {
  BloodType, AllergySeverity,
  AllergyListItemResponse, MedicationListItemResponse,
} from '@/types/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { AlertTriangle, Pill, Plus, Trash2, Pencil, HeartPulse } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const BLOOD_TYPES: BloodType[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'UNKNOWN'];
const SEVERITIES: { value: AllergySeverity; label: string }[] = [
  { value: 'LOW', label: 'Baixa' },
  { value: 'MEDIUM', label: 'Média' },
  { value: 'HIGH', label: 'Alta' },
];

function severityColor(s: string) {
  if (s === 'HIGH') return 'bg-destructive/10 text-destructive';
  if (s === 'MEDIUM') return 'bg-health-allergy/10 text-health-allergy';
  return 'bg-muted text-muted-foreground';
}

export default function Health() {
  const qc = useQueryClient();
  const { data: health } = useQuery({ queryKey: ['health'], queryFn: () => healthApi.get(true) });
  const { data: allergies = [] } = useQuery({ queryKey: ['allergies'], queryFn: () => allergyApi.list(true) });
  const { data: medications = [] } = useQuery({ queryKey: ['medications'], queryFn: () => medicationApi.list(true) });

  // Health edit
  const [healthOpen, setHealthOpen] = useState(false);
  const [bloodType, setBloodType] = useState<BloodType>('UNKNOWN');
  const [notes, setNotes] = useState('');

  const healthMut = useMutation({
    mutationFn: () => healthApi.update({ bloodType, medicalNotes: notes }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['health'] }); setHealthOpen(false); toast.success('Atualizado'); },
    onError: (e: any) => toast.error(e.message),
  });

  const openHealthEdit = () => {
    setBloodType(health?.bloodType || 'UNKNOWN');
    setNotes(health?.medicalNotes || '');
    setHealthOpen(true);
  };

  // Allergy sheet
  const [allergyOpen, setAllergyOpen] = useState(false);
  const [allergyForm, setAllergyForm] = useState({ name: '', severity: '' as string, notes: '' });

  const allergyCreate = useMutation({
    mutationFn: () => allergyApi.create({ name: allergyForm.name, severity: (allergyForm.severity || undefined) as AllergySeverity | undefined, notes: allergyForm.notes || undefined }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['allergies'] }); qc.invalidateQueries({ queryKey: ['health'] }); setAllergyOpen(false); toast.success('Alergia adicionada'); },
    onError: (e: any) => toast.error(e.message),
  });

  const allergyDelete = useMutation({
    mutationFn: (id: string) => allergyApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['allergies'] }); qc.invalidateQueries({ queryKey: ['health'] }); toast.success('Removida'); },
    onError: (e: any) => toast.error(e.message),
  });

  // Medication sheet
  const [medOpen, setMedOpen] = useState(false);
  const [medForm, setMedForm] = useState({ name: '', dosage: '', frequency: '', notes: '' });

  const medCreate = useMutation({
    mutationFn: () => medicationApi.create({ name: medForm.name, dosage: medForm.dosage || undefined, frequency: medForm.frequency || undefined, notes: medForm.notes || undefined }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['medications'] }); qc.invalidateQueries({ queryKey: ['health'] }); setMedOpen(false); toast.success('Medicamento adicionado'); },
    onError: (e: any) => toast.error(e.message),
  });

  const medDelete = useMutation({
    mutationFn: (id: string) => medicationApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['medications'] }); qc.invalidateQueries({ queryKey: ['health'] }); toast.success('Removido'); },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 pb-8">
      <h1 className="text-[28px] font-bold tracking-tight">Saúde</h1>

      {/* Health Info Card */}
      <button onClick={openHealthEdit} className="w-full text-left bg-card rounded-2xl p-5 card-shadow space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-health-blood/10 flex items-center justify-center">
            <HeartPulse className="h-5 w-5 text-health-blood" />
          </div>
          <div className="flex-1">
            <p className="font-semibold">Informações gerais</p>
            <p className="text-xs text-muted-foreground">Tipo sanguíneo: {health?.bloodType || '—'}</p>
          </div>
          <Pencil className="h-4 w-4 text-muted-foreground" />
        </div>
        {health?.medicalNotes && (
          <p className="text-sm text-muted-foreground line-clamp-2">{health.medicalNotes}</p>
        )}
      </button>

      {/* Allergies */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-health-allergy" />
            Alergias
            {allergies.length > 0 && <Badge variant="secondary" className="text-xs">{allergies.length}</Badge>}
          </h2>
          <Button size="sm" variant="ghost" onClick={() => { setAllergyForm({ name: '', severity: '', notes: '' }); setAllergyOpen(true); }}>
            <Plus className="h-4 w-4 mr-1" /> Adicionar
          </Button>
        </div>
        {allergies.length === 0 ? (
          <p className="text-sm text-muted-foreground bg-card rounded-2xl p-4 card-shadow text-center">Nenhuma alergia cadastrada</p>
        ) : (
          <div className="space-y-2">
            {allergies.map((a: AllergyListItemResponse) => (
              <div key={a.id} className="bg-card rounded-2xl p-4 card-shadow flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-medium">{a.name}</p>
                  {a.severity && <Badge className={`mt-1 text-[10px] ${severityColor(a.severity)}`}>{SEVERITIES.find(s => s.value === a.severity)?.label || a.severity}</Badge>}
                  {a.notes && <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{a.notes}</p>}
                </div>
                <button onClick={() => allergyDelete.mutate(a.id)} className="text-muted-foreground hover:text-destructive transition-colors p-1">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Medications */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Pill className="h-5 w-5 text-health-medication" />
            Medicamentos
            {medications.length > 0 && <Badge variant="secondary" className="text-xs">{medications.length}</Badge>}
          </h2>
          <Button size="sm" variant="ghost" onClick={() => { setMedForm({ name: '', dosage: '', frequency: '', notes: '' }); setMedOpen(true); }}>
            <Plus className="h-4 w-4 mr-1" /> Adicionar
          </Button>
        </div>
        {medications.length === 0 ? (
          <p className="text-sm text-muted-foreground bg-card rounded-2xl p-4 card-shadow text-center">Nenhum medicamento cadastrado</p>
        ) : (
          <div className="space-y-2">
            {medications.map((m: MedicationListItemResponse) => (
              <div key={m.id} className="bg-card rounded-2xl p-4 card-shadow flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-medium">{m.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {[m.dosage, m.frequency].filter(Boolean).join(' · ') || 'Sem detalhes'}
                  </p>
                </div>
                <button onClick={() => medDelete.mutate(m.id)} className="text-muted-foreground hover:text-destructive transition-colors p-1">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Health Edit Sheet */}
      <Sheet open={healthOpen} onOpenChange={setHealthOpen}>
        <SheetContent side="bottom" className="rounded-t-3xl">
          <SheetHeader><SheetTitle>Informações de saúde</SheetTitle></SheetHeader>
          <form onSubmit={(e) => { e.preventDefault(); healthMut.mutate(); }} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Tipo sanguíneo</Label>
              <Select value={bloodType} onValueChange={(v) => setBloodType(v as BloodType)}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {BLOOD_TYPES.map((bt) => <SelectItem key={bt} value={bt}>{bt === 'UNKNOWN' ? 'Desconhecido' : bt}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Notas médicas</Label>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Observações gerais..." className="rounded-xl min-h-[100px]" />
            </div>
            <Button type="submit" className="w-full rounded-xl h-12" disabled={healthMut.isPending}>Salvar</Button>
          </form>
        </SheetContent>
      </Sheet>

      {/* Add Allergy Sheet */}
      <Sheet open={allergyOpen} onOpenChange={setAllergyOpen}>
        <SheetContent side="bottom" className="rounded-t-3xl">
          <SheetHeader><SheetTitle>Nova alergia</SheetTitle></SheetHeader>
          <form onSubmit={(e) => { e.preventDefault(); allergyCreate.mutate(); }} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Nome *</Label>
              <Input value={allergyForm.name} onChange={(e) => setAllergyForm(f => ({ ...f, name: e.target.value }))} placeholder="Ex: Amendoim" required className="rounded-xl h-12" />
            </div>
            <div className="space-y-2">
              <Label>Gravidade</Label>
              <Select value={allergyForm.severity} onValueChange={(v) => setAllergyForm(f => ({ ...f, severity: v }))}>
                <SelectTrigger className="rounded-xl"><SelectValue placeholder="Selecionar" /></SelectTrigger>
                <SelectContent>
                  {SEVERITIES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Notas</Label>
              <Textarea value={allergyForm.notes} onChange={(e) => setAllergyForm(f => ({ ...f, notes: e.target.value }))} placeholder="Detalhes adicionais..." className="rounded-xl" />
            </div>
            <Button type="submit" className="w-full rounded-xl h-12" disabled={allergyCreate.isPending}>Adicionar</Button>
          </form>
        </SheetContent>
      </Sheet>

      {/* Add Medication Sheet */}
      <Sheet open={medOpen} onOpenChange={setMedOpen}>
        <SheetContent side="bottom" className="rounded-t-3xl">
          <SheetHeader><SheetTitle>Novo medicamento</SheetTitle></SheetHeader>
          <form onSubmit={(e) => { e.preventDefault(); medCreate.mutate(); }} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Nome *</Label>
              <Input value={medForm.name} onChange={(e) => setMedForm(f => ({ ...f, name: e.target.value }))} placeholder="Ex: Paracetamol" required className="rounded-xl h-12" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Dosagem</Label>
                <Input value={medForm.dosage} onChange={(e) => setMedForm(f => ({ ...f, dosage: e.target.value }))} placeholder="500mg" className="rounded-xl h-12" />
              </div>
              <div className="space-y-2">
                <Label>Frequência</Label>
                <Input value={medForm.frequency} onChange={(e) => setMedForm(f => ({ ...f, frequency: e.target.value }))} placeholder="2x ao dia" className="rounded-xl h-12" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Notas</Label>
              <Textarea value={medForm.notes} onChange={(e) => setMedForm(f => ({ ...f, notes: e.target.value }))} placeholder="Observações..." className="rounded-xl" />
            </div>
            <Button type="submit" className="w-full rounded-xl h-12" disabled={medCreate.isPending}>Adicionar</Button>
          </form>
        </SheetContent>
      </Sheet>
    </motion.div>
  );
}
