import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { emergencyTokenApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { QrCode, RefreshCw, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

export default function EmergencyQRCode() {
  const qc = useQueryClient();
  const [copied, setCopied] = useState(false);

  const { data: tokenData, isLoading } = useQuery({
    queryKey: ['emergency-token'],
    queryFn: () => emergencyTokenApi.get(),
  });

  const regenerate = useMutation({
    mutationFn: () => emergencyTokenApi.regenerate(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['emergency-token'] });
      toast.success('QR Code regenerado');
    },
    onError: (e: any) => toast.error(e.message),
  });

  const emergencyUrl = tokenData
    ? `${window.location.origin}/emergency/${tokenData.token}`
    : '';

  const qrImageUrl = tokenData
    ? `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(emergencyUrl)}&color=dc2626&bgcolor=fff5f5`
    : '';

  const handleCopy = async () => {
    if (!emergencyUrl) return;
    await navigator.clipboard.writeText(emergencyUrl);
    setCopied(true);
    toast.success('Link copiado!');
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="bg-card rounded-2xl p-5 card-shadow space-y-4">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-[280px] w-[280px] mx-auto rounded-xl" />
        <Skeleton className="h-10 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl p-5 card-shadow space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
          <QrCode className="h-5 w-5 text-red-600" />
        </div>
        <div>
          <p className="font-semibold">QR Code de Emergência</p>
          <p className="text-xs text-muted-foreground">Escaneável por qualquer socorrista</p>
        </div>
      </div>

      {tokenData && (
        <>
          <div className="flex justify-center">
            <div className="bg-red-50 p-3 rounded-2xl border border-red-100">
              <img
                src={qrImageUrl}
                alt="QR Code de Emergência"
                width={280}
                height={280}
                className="rounded-xl"
              />
            </div>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            Ao escanear, exibe seu tipo sanguíneo, alergias, medicamentos e contatos de emergência.
          </p>

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1 rounded-xl h-10"
              onClick={handleCopy}
            >
              {copied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
              {copied ? 'Copiado' : 'Copiar link'}
            </Button>
            <Button
              variant="outline"
              className="rounded-xl h-10"
              onClick={() => regenerate.mutate()}
              disabled={regenerate.isPending}
            >
              <RefreshCw className={`h-4 w-4 ${regenerate.isPending ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
