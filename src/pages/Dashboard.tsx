import { useQuery } from '@tanstack/react-query';
import { profileApi, healthApi, emergencyContactApi, addressApi } from '@/lib/api';
import { Link } from 'react-router-dom';
import { HeartPulse, AlertTriangle, Pill, Phone, MapPin, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';

interface SummaryCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  to: string;
  colorClass: string;
  bgClass: string;
}

interface SummaryCardSkeletonProps {}

function SummaryCardSkeleton(_: SummaryCardSkeletonProps) {
  return (
    <div className="bg-card rounded-2xl p-4 card-shadow space-y-3">
      <Skeleton className="w-10 h-10 rounded-xl" />
      <div className="space-y-1.5">
        <Skeleton className="h-7 w-12" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value, to, colorClass, bgClass }: SummaryCardProps) {
  return (
    <Link to={to} className="block">
      <motion.div
        whileTap={{ scale: 0.97 }}
        className="bg-card rounded-2xl p-4 card-shadow space-y-3"
      >
        <div className={`w-10 h-10 rounded-xl ${bgClass} flex items-center justify-center`}>
          <Icon className={`h-5 w-5 ${colorClass}`} />
        </div>
        <div>
          <p className="text-2xl font-bold tracking-tight">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </motion.div>
    </Link>
  );
}

interface QuickLinkProps {
  icon: React.ElementType;
  label: string;
  to: string;
}

function QuickLink({ icon: Icon, label, to }: QuickLinkProps) {
  return (
    <Link to={to} className="flex items-center gap-3 bg-card rounded-2xl p-4 card-shadow">
      <Icon className="h-5 w-5 text-muted-foreground" />
      <span className="flex-1 text-sm font-medium">{label}</span>
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </Link>
  );
}

export default function Dashboard() {
  const { data: profile, isLoading: profileLoading } = useQuery({ queryKey: ['profile'], queryFn: () => profileApi.get() });
  const { data: health, isLoading: healthLoading } = useQuery({ queryKey: ['health'], queryFn: () => healthApi.get() });
  const { data: contacts, isLoading: contactsLoading } = useQuery({ queryKey: ['emergency-contacts'], queryFn: () => emergencyContactApi.list() });
  const { data: addresses } = useQuery({ queryKey: ['addresses'], queryFn: () => addressApi.list() });

  const firstName = profile?.fullName?.split(' ')[0] || 'Usuário';
  const isLoading = profileLoading || healthLoading || contactsLoading;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 pb-8"
    >
      <div>
        {profileLoading ? (
          <>
            <Skeleton className="h-8 w-48 mb-1" />
            <Skeleton className="h-4 w-36" />
          </>
        ) : (
          <>
            <h1 className="text-[28px] font-bold tracking-tight">Olá, {firstName}</h1>
            <p className="text-muted-foreground text-sm">Seu resumo de saúde</p>
          </>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {isLoading ? (
          <>
            <SummaryCardSkeleton />
            <SummaryCardSkeleton />
            <SummaryCardSkeleton />
            <SummaryCardSkeleton />
          </>
        ) : (
          <>
            <SummaryCard
              icon={HeartPulse}
              label="Tipo Sanguíneo"
              value={health?.bloodType || '—'}
              to="/health"
              colorClass="text-health-blood"
              bgClass="bg-health-blood/10"
            />
            <SummaryCard
              icon={AlertTriangle}
              label="Alergias"
              value={String(health?.allergyCount ?? '—')}
              to="/health"
              colorClass="text-health-allergy"
              bgClass="bg-health-allergy/10"
            />
            <SummaryCard
              icon={Pill}
              label="Medicamentos"
              value={String(health?.medicationCount ?? '—')}
              to="/health"
              colorClass="text-health-medication"
              bgClass="bg-health-medication/10"
            />
            <SummaryCard
              icon={Phone}
              label="Emergência"
              value={String(contacts?.length ?? '—')}
              to="/contacts"
              colorClass="text-health-contact"
              bgClass="bg-health-contact/10"
            />
          </>
        )}
      </div>

      <div className="space-y-2">
        <h2 className="text-lg font-semibold px-1">Acesso rápido</h2>
        <div className="space-y-2">
          <QuickLink icon={MapPin} label="Meus endereços" to="/contacts" />
          <QuickLink icon={HeartPulse} label="Informações de saúde" to="/health" />
        </div>
      </div>
    </motion.div>
  );
}
