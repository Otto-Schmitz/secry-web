import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profileApi, exportApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LogOut, Save, Download } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import EmergencyQRCode from '@/components/EmergencyQRCode';

export default function Profile() {
  const { logout } = useAuth();
  const qc = useQueryClient();
  const { data: profile, isLoading } = useQuery({ queryKey: ['profile'], queryFn: () => profileApi.get() });

  const [form, setForm] = useState({ fullName: '', birthDate: '', phone: '', workplace: '' });
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (profile) {
      setForm({
        fullName: profile.fullName || '',
        birthDate: profile.birthDate || '',
        phone: profile.phone || '',
        workplace: profile.workplace || '',
      });
    }
  }, [profile]);

  const update = useMutation({
    mutationFn: () => profileApi.update({
      fullName: form.fullName || undefined,
      birthDate: form.birthDate || undefined,
      phone: form.phone || undefined,
      workplace: form.workplace || undefined,
    }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['profile'] }); setDirty(false); toast.success('Perfil atualizado'); },
    onError: (e: any) => toast.error(e.message),
  });

  const handleChange = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setDirty(true);
  };

  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      const data = await exportApi.getAll();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `eu-dados-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Dados exportados com sucesso');
    } catch (e: any) {
      toast.error(e.message || 'Erro ao exportar');
    } finally {
      setExporting(false);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 pb-8">
      <h1 className="text-[28px] font-bold tracking-tight">Perfil</h1>

      <div className="bg-card rounded-2xl p-5 card-shadow space-y-5">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xl font-bold">
            {form.fullName ? form.fullName.charAt(0).toUpperCase() : '?'}
          </div>
          <div>
            <p className="font-semibold text-lg">{form.fullName || 'Sem nome'}</p>
            <p className="text-sm text-muted-foreground">{form.workplace || 'Sem local de trabalho'}</p>
          </div>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); update.mutate(); }} className="space-y-4">
          <div className="space-y-2">
            <Label>Nome completo</Label>
            <Input value={form.fullName} onChange={handleChange('fullName')} className="rounded-xl h-12" />
          </div>
          <div className="space-y-2">
            <Label>Data de nascimento</Label>
            <Input type="date" value={form.birthDate} onChange={handleChange('birthDate')} className="rounded-xl h-12" />
          </div>
          <div className="space-y-2">
            <Label>Telefone</Label>
            <Input value={form.phone} onChange={handleChange('phone')} placeholder="(11) 99999-9999" className="rounded-xl h-12" />
          </div>
          <div className="space-y-2">
            <Label>Local de trabalho</Label>
            <Input value={form.workplace} onChange={handleChange('workplace')} placeholder="Empresa / Instituição" className="rounded-xl h-12" />
          </div>
          {dirty && (
            <Button type="submit" className="w-full rounded-xl h-12" disabled={update.isPending}>
              <Save className="h-4 w-4 mr-2" />
              Salvar alterações
            </Button>
          )}
        </form>
      </div>

      <EmergencyQRCode />

      <Button
        variant="outline"
        onClick={handleExport}
        disabled={exporting}
        className="w-full rounded-xl h-12"
      >
        <Download className="h-4 w-4 mr-2" />
        {exporting ? 'Exportando...' : 'Exportar meus dados (JSON)'}
      </Button>

      <Button variant="ghost" onClick={handleLogout} className="w-full text-destructive hover:text-destructive hover:bg-destructive/10 rounded-xl h-12">
        <LogOut className="h-4 w-4 mr-2" />
        Sair da conta
      </Button>
    </motion.div>
  );
}
