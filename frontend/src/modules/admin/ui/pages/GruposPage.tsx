import { useEffect, useState } from 'react';
import { api } from '@/shared/services/api';
import { Button } from '@/shadcn/components/ui/button';
import { Input } from '@/shadcn/components/ui/input';

type Grupo = { id: string; nome: string; criadoEm: string };

export default function GruposPage() {
  const [lista, setLista] = useState<Grupo[]>([]);
  const [editId, setEditId] = useState<string | null>(null);
  const [nome, setNome] = useState('');

  function carregar() { api.get<Grupo[]>('/grupos').then((r) => setLista(r.data)); }
  useEffect(carregar, []);

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    if (editId) await api.put(`/grupos/${editId}`, { nome });
    else await api.post('/grupos', { nome });
    setEditId(null);
    setNome('');
    carregar();
  }

  async function excluir(g: Grupo) {
    if (!confirm(`Excluir grupo "${g.nome}"?`)) return;
    await api.delete(`/grupos/${g.id}`);
    carregar();
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Grupos</h1>

      <form onSubmit={salvar} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 mb-4 flex gap-3">
        <Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome do grupo…" required className="flex-1" />
        <Button type="submit">{editId ? 'Salvar' : 'Criar'}</Button>
        {editId && <Button type="button" variant="outline" onClick={() => { setEditId(null); setNome(''); }}>Cancelar</Button>}
      </form>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800/50 text-left">
            <tr>
              <th className="px-4 py-3 font-semibold">Nome</th>
              <th className="px-4 py-3 font-semibold">Criado</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {lista.length === 0 && <tr><td colSpan={3} className="text-center py-8 text-slate-500">Nenhum grupo cadastrado.</td></tr>}
            {lista.map((g) => (
              <tr key={g.id} className="border-t border-slate-200 dark:border-slate-800">
                <td className="px-4 py-2.5">{g.nome}</td>
                <td className="px-4 py-2.5 text-xs text-slate-500">{new Date(g.criadoEm).toLocaleDateString('pt-BR')}</td>
                <td className="px-4 py-2.5 text-right space-x-2">
                  <Button size="sm" variant="outline" onClick={() => { setEditId(g.id); setNome(g.nome); }}>Editar</Button>
                  <Button size="sm" variant="ghost" onClick={() => excluir(g)}>Excluir</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
