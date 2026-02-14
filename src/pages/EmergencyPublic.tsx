import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { emergencyPublicApi } from '@/lib/api';
import type { EmergencyPublicResponse } from '@/types/api';
import { HeartPulse, AlertTriangle, Pill, Phone, User } from 'lucide-react';

function severityLabel(s: string) {
  if (s === 'HIGH') return 'Alta';
  if (s === 'MEDIUM') return 'Média';
  if (s === 'LOW') return 'Baixa';
  return s;
}

function severityClass(s: string) {
  if (s === 'HIGH') return 'bg-red-100 text-red-700 border-red-200';
  if (s === 'MEDIUM') return 'bg-orange-100 text-orange-700 border-orange-200';
  return 'bg-yellow-100 text-yellow-700 border-yellow-200';
}

export default function EmergencyPublic() {
  const { token } = useParams<{ token: string }>();
  const [data, setData] = useState<EmergencyPublicResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) { setError('Token não fornecido'); setLoading(false); return; }
    emergencyPublicApi.get(token)
      .then(setData)
      .catch((e) => setError(e.message || 'Erro ao carregar'))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-red-500 border-t-transparent" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center px-4">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
          <h1 className="text-xl font-bold text-red-900">Dados indisponíveis</h1>
          <p className="text-red-700 text-sm">{error || 'Token de emergência inválido ou expirado.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-red-50">
      {/* Header */}
      <div className="bg-red-600 text-white px-4 py-5 text-center">
        <div className="flex items-center justify-center gap-2 mb-1">
          <HeartPulse className="h-6 w-6" />
          <span className="text-lg font-bold tracking-wide uppercase">Emergência Médica</span>
        </div>
        {data.name && <p className="text-red-100 text-2xl font-bold">{data.name}</p>}
        {data.phone && <p className="text-red-200 text-sm mt-1">Tel: {data.phone}</p>}
      </div>

      <div className="max-w-lg mx-auto px-4 py-5 space-y-4">
        {/* Blood Type - highlighted */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-red-100 text-center">
          <p className="text-sm text-red-600 font-medium uppercase tracking-wide">Tipo Sanguíneo</p>
          <p className="text-5xl font-black text-red-700 mt-1">
            {data.bloodType === 'UNKNOWN' ? '?' : data.bloodType}
          </p>
        </div>

        {/* Allergies */}
        {data.allergies.length > 0 && (
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-red-100">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              <h2 className="font-bold text-lg">Alergias</h2>
            </div>
            <div className="space-y-2">
              {data.allergies.map((a, i) => (
                <div key={i} className={`flex items-center justify-between rounded-xl px-3 py-2 border ${severityClass(a.severity)}`}>
                  <span className="font-semibold">{a.name}</span>
                  {a.severity && <span className="text-xs font-medium uppercase">{severityLabel(a.severity)}</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Medications */}
        {data.medications.length > 0 && (
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-red-100">
            <div className="flex items-center gap-2 mb-3">
              <Pill className="h-5 w-5 text-blue-500" />
              <h2 className="font-bold text-lg">Medicamentos em uso</h2>
            </div>
            <div className="space-y-2">
              {data.medications.map((m, i) => (
                <div key={i} className="bg-blue-50 rounded-xl px-3 py-2 border border-blue-100">
                  <p className="font-semibold text-blue-900">{m.name}</p>
                  <p className="text-xs text-blue-700">
                    {[m.dosage, m.frequency].filter(Boolean).join(' · ')}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Emergency Contacts */}
        {data.emergencyContacts.length > 0 && (
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-red-100">
            <div className="flex items-center gap-2 mb-3">
              <Phone className="h-5 w-5 text-green-600" />
              <h2 className="font-bold text-lg">Contatos de Emergência</h2>
            </div>
            <div className="space-y-2">
              {data.emergencyContacts.map((c, i) => (
                <a
                  key={i}
                  href={`tel:${c.phone.replace(/\D/g, '')}`}
                  className="flex items-center gap-3 bg-green-50 rounded-xl px-3 py-3 border border-green-100 active:bg-green-100 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-green-200 flex items-center justify-center shrink-0">
                    <User className="h-5 w-5 text-green-700" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-green-900">{c.name}</p>
                    <p className="text-xs text-green-700">{c.relationship}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-green-700">{c.phone}</p>
                    <p className="text-[10px] text-green-600 uppercase">Ligar</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <p className="text-center text-xs text-red-400 pt-2 pb-6">
          Dados fornecidos pelo app EU — Carteira de Informações Pessoais
        </p>
      </div>
    </div>
  );
}
