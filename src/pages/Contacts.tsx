import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { emergencyContactApi, addressApi } from '@/lib/api';
import type { EmergencyContactResponse, AddressResponse, AddressLabel } from '@/types/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Phone, MapPin, Plus, Trash2, User } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const ADDRESS_LABELS: { value: AddressLabel; label: string }[] = [
  { value: 'HOME', label: 'Casa' },
  { value: 'WORK', label: 'Trabalho' },
  { value: 'OTHER', label: 'Outro' },
];

export default function Contacts() {
  const qc = useQueryClient();
  const { data: contacts = [] } = useQuery({ queryKey: ['emergency-contacts'], queryFn: () => emergencyContactApi.list() });
  const { data: addresses = [] } = useQuery({ queryKey: ['addresses'], queryFn: () => addressApi.list() });

  // Contact sheet
  const [contactOpen, setContactOpen] = useState(false);
  const [contactForm, setContactForm] = useState({ name: '', phone: '', relationship: '', priority: '' });

  const contactCreate = useMutation({
    mutationFn: () => emergencyContactApi.create({
      name: contactForm.name, phone: contactForm.phone,
      relationship: contactForm.relationship || undefined,
      priority: contactForm.priority ? parseInt(contactForm.priority) : undefined,
    }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['emergency-contacts'] }); setContactOpen(false); toast.success('Contato adicionado'); },
    onError: (e: any) => toast.error(e.message),
  });

  const contactDelete = useMutation({
    mutationFn: (id: string) => emergencyContactApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['emergency-contacts'] }); toast.success('Removido'); },
    onError: (e: any) => toast.error(e.message),
  });

  // Address sheet
  const [addressOpen, setAddressOpen] = useState(false);
  const [addrForm, setAddrForm] = useState({ label: 'HOME' as AddressLabel, street: '', number: '', city: '', state: '', zip: '', country: '' });

  const addressCreate = useMutation({
    mutationFn: () => addressApi.create({
      label: addrForm.label,
      street: addrForm.street || undefined,
      number: addrForm.number || undefined,
      city: addrForm.city || undefined,
      state: addrForm.state || undefined,
      zip: addrForm.zip || undefined,
      country: addrForm.country || undefined,
    }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['addresses'] }); setAddressOpen(false); toast.success('Endereço adicionado'); },
    onError: (e: any) => toast.error(e.message),
  });

  const addressDelete = useMutation({
    mutationFn: (id: string) => addressApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['addresses'] }); toast.success('Removido'); },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 pb-8">
      <h1 className="text-[28px] font-bold tracking-tight">Contatos</h1>

      {/* Emergency Contacts */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Phone className="h-5 w-5 text-health-contact" />
            Emergência
            {contacts.length > 0 && <Badge variant="secondary" className="text-xs">{contacts.length}</Badge>}
          </h2>
          <Button size="sm" variant="ghost" onClick={() => { setContactForm({ name: '', phone: '', relationship: '', priority: '' }); setContactOpen(true); }}>
            <Plus className="h-4 w-4 mr-1" /> Adicionar
          </Button>
        </div>
        {contacts.length === 0 ? (
          <p className="text-sm text-muted-foreground bg-card rounded-2xl p-4 card-shadow text-center">Nenhum contato cadastrado</p>
        ) : (
          <div className="space-y-2">
            {contacts.map((c: EmergencyContactResponse) => (
              <div key={c.id} className="bg-card rounded-2xl p-4 card-shadow flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-health-contact/10 flex items-center justify-center shrink-0">
                  <User className="h-5 w-5 text-health-contact" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium">{c.name}</p>
                  <p className="text-xs text-muted-foreground">{[c.relationship, c.phone].filter(Boolean).join(' · ')}</p>
                </div>
                <button onClick={() => contactDelete.mutate(c.id)} className="text-muted-foreground hover:text-destructive transition-colors p-1">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Addresses */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <MapPin className="h-5 w-5 text-health-address" />
            Endereços
            {addresses.length > 0 && <Badge variant="secondary" className="text-xs">{addresses.length}</Badge>}
          </h2>
          <Button size="sm" variant="ghost" onClick={() => { setAddrForm({ label: 'HOME', street: '', number: '', city: '', state: '', zip: '', country: '' }); setAddressOpen(true); }}>
            <Plus className="h-4 w-4 mr-1" /> Adicionar
          </Button>
        </div>
        {addresses.length === 0 ? (
          <p className="text-sm text-muted-foreground bg-card rounded-2xl p-4 card-shadow text-center">Nenhum endereço cadastrado</p>
        ) : (
          <div className="space-y-2">
            {addresses.map((a: AddressResponse) => (
              <div key={a.id} className="bg-card rounded-2xl p-4 card-shadow flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{ADDRESS_LABELS.find(l => l.value === a.label)?.label || a.label}</p>
                    {a.isPrimary && <Badge variant="secondary" className="text-[10px]">Principal</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {[a.street, a.number, a.city, a.state].filter(Boolean).join(', ') || 'Sem detalhes'}
                  </p>
                  {a.zip && <p className="text-xs text-muted-foreground">CEP: {a.zip}</p>}
                </div>
                <button onClick={() => addressDelete.mutate(a.id)} className="text-muted-foreground hover:text-destructive transition-colors p-1">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Add Contact Sheet */}
      <Sheet open={contactOpen} onOpenChange={setContactOpen}>
        <SheetContent side="bottom" className="rounded-t-3xl">
          <SheetHeader><SheetTitle>Novo contato de emergência</SheetTitle></SheetHeader>
          <form onSubmit={(e) => { e.preventDefault(); contactCreate.mutate(); }} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Nome *</Label>
              <Input value={contactForm.name} onChange={(e) => setContactForm(f => ({ ...f, name: e.target.value }))} placeholder="Nome do contato" required className="rounded-xl h-12" />
            </div>
            <div className="space-y-2">
              <Label>Telefone *</Label>
              <Input value={contactForm.phone} onChange={(e) => setContactForm(f => ({ ...f, phone: e.target.value }))} placeholder="(11) 99999-9999" required className="rounded-xl h-12" />
            </div>
            <div className="space-y-2">
              <Label>Relação</Label>
              <Input value={contactForm.relationship} onChange={(e) => setContactForm(f => ({ ...f, relationship: e.target.value }))} placeholder="Ex: Cônjuge, Pai, Mãe" className="rounded-xl h-12" />
            </div>
            <Button type="submit" className="w-full rounded-xl h-12" disabled={contactCreate.isPending}>Adicionar</Button>
          </form>
        </SheetContent>
      </Sheet>

      {/* Add Address Sheet */}
      <Sheet open={addressOpen} onOpenChange={setAddressOpen}>
        <SheetContent side="bottom" className="rounded-t-3xl max-h-[85vh] overflow-y-auto">
          <SheetHeader><SheetTitle>Novo endereço</SheetTitle></SheetHeader>
          <form onSubmit={(e) => { e.preventDefault(); addressCreate.mutate(); }} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Tipo *</Label>
              <Select value={addrForm.label} onValueChange={(v) => setAddrForm(f => ({ ...f, label: v as AddressLabel }))}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ADDRESS_LABELS.map((l) => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2 space-y-2">
                <Label>Rua</Label>
                <Input value={addrForm.street} onChange={(e) => setAddrForm(f => ({ ...f, street: e.target.value }))} className="rounded-xl h-12" />
              </div>
              <div className="space-y-2">
                <Label>Nº</Label>
                <Input value={addrForm.number} onChange={(e) => setAddrForm(f => ({ ...f, number: e.target.value }))} className="rounded-xl h-12" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Cidade</Label>
                <Input value={addrForm.city} onChange={(e) => setAddrForm(f => ({ ...f, city: e.target.value }))} className="rounded-xl h-12" />
              </div>
              <div className="space-y-2">
                <Label>Estado</Label>
                <Input value={addrForm.state} onChange={(e) => setAddrForm(f => ({ ...f, state: e.target.value }))} className="rounded-xl h-12" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>CEP</Label>
                <Input value={addrForm.zip} onChange={(e) => setAddrForm(f => ({ ...f, zip: e.target.value }))} className="rounded-xl h-12" />
              </div>
              <div className="space-y-2">
                <Label>País</Label>
                <Input value={addrForm.country} onChange={(e) => setAddrForm(f => ({ ...f, country: e.target.value }))} placeholder="Brasil" className="rounded-xl h-12" />
              </div>
            </div>
            <Button type="submit" className="w-full rounded-xl h-12" disabled={addressCreate.isPending}>Adicionar</Button>
          </form>
        </SheetContent>
      </Sheet>
    </motion.div>
  );
}
