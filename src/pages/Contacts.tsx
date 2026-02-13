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
import { Phone, MapPin, Plus, Trash2, User, Pencil } from 'lucide-react';
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

  // Contact sheet (create + edit)
  const [contactOpen, setContactOpen] = useState(false);
  const [editingContactId, setEditingContactId] = useState<string | null>(null);
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

  const contactUpdate = useMutation({
    mutationFn: (id: string) => emergencyContactApi.update(id, {
      name: contactForm.name, phone: contactForm.phone,
      relationship: contactForm.relationship || undefined,
      priority: contactForm.priority ? parseInt(contactForm.priority) : undefined,
    }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['emergency-contacts'] }); setContactOpen(false); toast.success('Contato atualizado'); },
    onError: (e: any) => toast.error(e.message),
  });

  const contactDelete = useMutation({
    mutationFn: (id: string) => emergencyContactApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['emergency-contacts'] }); toast.success('Removido'); },
    onError: (e: any) => toast.error(e.message),
  });

  const openContactCreate = () => {
    setEditingContactId(null);
    setContactForm({ name: '', phone: '', relationship: '', priority: '' });
    setContactOpen(true);
  };

  const openContactEdit = (c: EmergencyContactResponse) => {
    setEditingContactId(c.id);
    setContactForm({
      name: c.name,
      phone: c.phone,
      relationship: c.relationship || '',
      priority: c.priority != null ? String(c.priority) : '',
    });
    setContactOpen(true);
  };

  const handleContactSubmit = () => {
    if (editingContactId) {
      contactUpdate.mutate(editingContactId);
    } else {
      contactCreate.mutate();
    }
  };

  // Address sheet (create + edit)
  const [addressOpen, setAddressOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
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

  const addressUpdate = useMutation({
    mutationFn: (id: string) => addressApi.update(id, {
      label: addrForm.label,
      street: addrForm.street || undefined,
      number: addrForm.number || undefined,
      city: addrForm.city || undefined,
      state: addrForm.state || undefined,
      zip: addrForm.zip || undefined,
      country: addrForm.country || undefined,
    }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['addresses'] }); setAddressOpen(false); toast.success('Endereço atualizado'); },
    onError: (e: any) => toast.error(e.message),
  });

  const addressDelete = useMutation({
    mutationFn: (id: string) => addressApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['addresses'] }); toast.success('Removido'); },
    onError: (e: any) => toast.error(e.message),
  });

  const openAddressCreate = () => {
    setEditingAddressId(null);
    setAddrForm({ label: 'HOME', street: '', number: '', city: '', state: '', zip: '', country: '' });
    setAddressOpen(true);
  };

  const openAddressEdit = (a: AddressResponse) => {
    setEditingAddressId(a.id);
    setAddrForm({
      label: (a.label || 'HOME') as AddressLabel,
      street: a.street || '',
      number: a.number || '',
      city: a.city || '',
      state: a.state || '',
      zip: a.zip || '',
      country: a.country || '',
    });
    setAddressOpen(true);
  };

  const handleAddressSubmit = () => {
    if (editingAddressId) {
      addressUpdate.mutate(editingAddressId);
    } else {
      addressCreate.mutate();
    }
  };

  const isContactPending = contactCreate.isPending || contactUpdate.isPending;
  const isAddressPending = addressCreate.isPending || addressUpdate.isPending;

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
          <Button size="sm" variant="ghost" onClick={openContactCreate}>
            <Plus className="h-4 w-4 mr-1" /> Adicionar
          </Button>
        </div>
        {contacts.length === 0 ? (
          <p className="text-sm text-muted-foreground bg-card rounded-2xl p-4 card-shadow text-center">Nenhum contato cadastrado</p>
        ) : (
          <div className="space-y-2">
            {contacts.map((c: EmergencyContactResponse) => (
              <button
                key={c.id}
                onClick={() => openContactEdit(c)}
                className="w-full text-left bg-card rounded-2xl p-4 card-shadow flex items-center gap-3 hover:bg-accent/50 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-health-contact/10 flex items-center justify-center shrink-0">
                  <User className="h-5 w-5 text-health-contact" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium">{c.name}</p>
                  <p className="text-xs text-muted-foreground">{[c.relationship, c.phone].filter(Boolean).join(' · ')}</p>
                </div>
                <Pencil className="h-4 w-4 text-muted-foreground shrink-0" />
              </button>
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
          <Button size="sm" variant="ghost" onClick={openAddressCreate}>
            <Plus className="h-4 w-4 mr-1" /> Adicionar
          </Button>
        </div>
        {addresses.length === 0 ? (
          <p className="text-sm text-muted-foreground bg-card rounded-2xl p-4 card-shadow text-center">Nenhum endereço cadastrado</p>
        ) : (
          <div className="space-y-2">
            {addresses.map((a: AddressResponse) => (
              <button
                key={a.id}
                onClick={() => openAddressEdit(a)}
                className="w-full text-left bg-card rounded-2xl p-4 card-shadow flex items-start gap-3 hover:bg-accent/50 transition-colors"
              >
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
                <Pencil className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Contact Sheet (Create + Edit) */}
      <Sheet open={contactOpen} onOpenChange={setContactOpen}>
        <SheetContent side="bottom" className="rounded-t-3xl">
          <SheetHeader><SheetTitle>{editingContactId ? 'Editar contato' : 'Novo contato de emergência'}</SheetTitle></SheetHeader>
          <form onSubmit={(e) => { e.preventDefault(); handleContactSubmit(); }} className="space-y-4 mt-4">
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
            <div className="flex gap-3">
              {editingContactId && (
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-xl h-12 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
                  onClick={() => { contactDelete.mutate(editingContactId); setContactOpen(false); }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
              <Button type="submit" className="w-full rounded-xl h-12" disabled={isContactPending}>
                {editingContactId ? 'Salvar' : 'Adicionar'}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>

      {/* Address Sheet (Create + Edit) */}
      <Sheet open={addressOpen} onOpenChange={setAddressOpen}>
        <SheetContent side="bottom" className="rounded-t-3xl max-h-[85vh] overflow-y-auto">
          <SheetHeader><SheetTitle>{editingAddressId ? 'Editar endereço' : 'Novo endereço'}</SheetTitle></SheetHeader>
          <form onSubmit={(e) => { e.preventDefault(); handleAddressSubmit(); }} className="space-y-4 mt-4">
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
            <div className="flex gap-3">
              {editingAddressId && (
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-xl h-12 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
                  onClick={() => { addressDelete.mutate(editingAddressId); setAddressOpen(false); }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
              <Button type="submit" className="w-full rounded-xl h-12" disabled={isAddressPending}>
                {editingAddressId ? 'Salvar' : 'Adicionar'}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </motion.div>
  );
}
