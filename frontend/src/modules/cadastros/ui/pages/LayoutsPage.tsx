import { useEffect, useState } from 'react';
import { api } from '@/shared/services/api';
import { Button } from '@/shadcn/components/ui/button';

type Layout = { id: string; nome: string; parserKey: string; descricao?: string | null; ativadoParaTenant: boolean };

export default function LayoutsPage() {
  const [lista, setLista] = useState<Layout[]>([]);

  function carregar() { api.get<Layout[]>('/layouts').then((r) => setLista(r.data)); }
  useEffect(carregar, []);

  async function toggle(l: Layout) {
    if (l.ativadoParaTenant) await api.post(`/layouts/${l.id}/desativar`);
    else await api.post(`/layouts/${l.id}/ativar`);
    carregar();
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">Layouts</h1>
      <p className="text-sm text-slate-500 mb-6">Ative os layouts que sua empresa usa. Apenas layouts ativos aparecem na tela de importação.</p>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800/50 text-left">
            <tr>
              <th className="px-4 py-3 font-semibold">Nome</th>
              <th className="px-4 py-3 font-semibold">Parser</th>
              <th className="px-4 py-3 font-semibold">Descrição</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {lista.map((l) => (
              <tr key={l.id} className="border-t border-slate-200 dark:border-slate-800">
                <td className="px-4 py-2.5 font-medium">{l.nome}</td>
                <td className="px-4 py-2.5 text-xs font-mono text-slate-500">{l.parserKey}</td>
                <td className="px-4 py-2.5 text-slate-600 dark:text-slate-400 max-w-md">{l.descricao}</td>
                <td className="px-4 py-2.5 text-right">
                  <Button
                    size="sm"
                    variant={l.ativadoParaTenant ? 'default' : 'outline'}
                    onClick={() => toggle(l)}
                  >
                    {l.ativadoParaTenant ? '✓ Ativo' : 'Ativar'}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
