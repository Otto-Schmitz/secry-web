import { jsPDF } from 'jspdf';

const PAGE_HEIGHT = 297;
const BOTTOM_MARGIN = 30;

function maybeNewPage(doc: jsPDF, y: number): number {
  if (y > PAGE_HEIGHT - BOTTOM_MARGIN) {
    doc.addPage();
    return 20;
  }
  return y;
}

const LABELS = {
  HOME: 'Casa',
  WORK: 'Trabalho',
  OTHER: 'Outro',
} as const;

function label(value: string) {
  return (LABELS as Record<string, string>)[value] || value;
}

function section(doc: jsPDF, title: string, y: number): number {
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 20, y);
  doc.setDrawColor(200);
  doc.line(20, y + 2, 190, y + 2);
  return y + 10;
}

function textLine(doc: jsPDF, label: string, value: string | null | undefined, y: number): number {
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  const text = `${label}: ${value ?? '—'}`;
  doc.text(text, 25, y);
  return y + 6;
}

export function generateExportPdf(data: Record<string, unknown>): jsPDF {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  let y = 20;

  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('EU — Carteira de Informações Pessoais', 20, y);
  y += 10;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100);
  doc.text(`Exportado em ${new Date().toLocaleString('pt-BR')}`, 20, y);
  doc.setTextColor(0);
  y += 15;

  const wrap = () => { y = maybeNewPage(doc, y); };

  // Perfil
  const profile = data.profile as Record<string, unknown> | undefined;
  if (profile) {
    wrap(); y = section(doc, 'Perfil', y);
    y = textLine(doc, 'Nome', profile.fullName as string, y);
    y = textLine(doc, 'Data de nascimento', profile.birthDate as string, y);
    y = textLine(doc, 'Telefone', profile.phone as string, y);
    y = textLine(doc, 'Local de trabalho', profile.workplace as string, y);
    y += 5;
  }

  // Saúde
  const health = data.health as Record<string, unknown> | undefined;
  if (health) {
    wrap(); y = section(doc, 'Informações de Saúde', y);
    y = textLine(doc, 'Tipo sanguíneo', health.bloodType as string, y);
    if (health.medicalNotes) {
      const notes = String(health.medicalNotes);
      const lines = doc.splitTextToSize(notes, 165);
      doc.text(lines, 25, y);
      y += lines.length * 5 + 4;
    } else {
      y += 4;
    }
    y += 5;
  }

  // Alergias
  const allergies = data.allergies as Array<Record<string, unknown>> | undefined;
  if (allergies?.length) {
    wrap(); y = section(doc, 'Alergias', y);
    for (const a of allergies) {
      doc.setFont('helvetica', 'bold');
      doc.text(`${a.name}${a.severity ? ` (${a.severity})` : ''}`, 25, y);
      doc.setFont('helvetica', 'normal');
      y += 5;
    }
    y += 5;
  }

  // Medicamentos
  const medications = data.medications as Array<Record<string, unknown>> | undefined;
  if (medications?.length) {
    wrap(); y = section(doc, 'Medicamentos', y);
    for (const m of medications) {
      const status = m.active === false ? ' [Descontinuado]' : '';
      doc.setFont('helvetica', 'bold');
      doc.text(String(m.name) + status, 25, y);
      doc.setFont('helvetica', 'normal');
      y += 4;
      const detail = [m.dosage, m.frequency].filter(Boolean).join(' · ');
      if (detail) doc.text(detail, 28, y);
      y += 6;
    }
    y += 5;
  }

  // Contatos de emergência
  const contacts = data.emergencyContacts as Array<Record<string, unknown>> | undefined;
  if (contacts?.length) {
    wrap(); y = section(doc, 'Contatos de Emergência', y);
    for (const c of contacts) {
      doc.text(`${c.name} — ${c.phone}${c.relationship ? ` (${c.relationship})` : ''}`, 25, y);
      y += 6;
    }
    y += 5;
  }

  // Endereços
  const addresses = data.addresses as Array<Record<string, unknown>> | undefined;
  if (addresses?.length) {
    wrap(); y = section(doc, 'Endereços', y);
    for (const a of addresses) {
      doc.text(`${label(String(a.label))}: ${[a.street, a.number, a.city, a.state].filter(Boolean).join(', ') || '—'}`, 25, y);
      y += 6;
    }
  }

  return doc;
}
