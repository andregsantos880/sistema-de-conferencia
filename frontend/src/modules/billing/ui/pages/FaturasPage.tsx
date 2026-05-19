import { useEffect, useState } from 'react';
import { api } from '@/shared/services/api';
import { Button } from '@/shadcn/components/ui/button';

type Fatura = {
  id: string; numero?: string | null;
  valorCentavos: number; vencimento: string; status: string;
  pagoEm?: string | null; paymentMethod?: string | null;
  linkPagamento?: string | null; linkPdf?: string | null;
  criadoEm: string;
};

function brl(c: number) { return (c / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }); }

const STATUS_COR: Record<string, string> = {
  aberta: 'bg-blue-100 text-blue-800',
  paga: 'bg-green-100 text-green-800',
  vencida: 'bg-red-100 text-red-800',
  cancelada: 'bg-slate-200 text-slate-800',
  falhou: 'bg-red-100 text-red-800',
};

export default function FaturasPage() {
  const [faturas, setFaturas] = useState<Fatura[]>([]);

  useEffect(() => {
    api.get<Fatura[]>('/faturas').then((r) => setFaturas(r.data)).catch(() => setFaturas([]));
  }, []);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Faturas</h1>

      {faturas.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-center text-slate-500">
          Nenhuma fatura emitida ainda.
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-left">
              <tr>
                <th className="px-4 py-3 font-semibold">Número</th>
                <th className="px-4 py-3 font-semibold">Vencimento</th>
                <th className="px-4 py-3 font-semibold text-right">Valor</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Método</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {faturas.map((f) => (
                <tr key={f.id} className="border-t border-slate-200 dark:border-slate-800">
                  <td className="px-4 py-2.5 font-mono">{f.numero ?? '—'}</td>
                  <td className="px-4 py-2.5">{new Date(f.vencimento).toLocaleDateString('pt-BR')}</td>
                  <td className="px-4 py-2.5 text-right">{brl(f.valorCentavos)}</td>
                  <td className="px-4 py-2.5">
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${STATUS_COR[f.status] ?? ''}`}>
                      {f.status}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-xs text-slate-500">{f.paymentMethod ?? '—'}</td>
                  <td className="px-4 py-2.5 text-right space-x-2">
                    {f.linkPagamento && <a href={f.linkPagamento} target="_blank" rel="noopener noreferrer"><Button size="sm" variant="outline">Pagar</Button></a>}
                    {f.linkPdf && <a href={f.linkPdf} target="_blank" rel="noopener noreferrer"><Button size="sm" variant="ghost">PDF</Button></a>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
