import { useEffect, useState } from 'react';
import { api } from '@/shared/services/api';
import { Button } from '@/shadcn/components/ui/button';
import { Input } from '@/shadcn/components/ui/input';
import { Label } from '@/shadcn/components/ui/label';

type Status = {
  id: string; codigo: string; nome: string; corHex: string; ordem: number;
  ehInicial: boolean; ehTerminal: boolean; ehBloqueio: boolean; ttsTexto?: string | null;
};

const VAZIO: Omit<Status, 'id'> = {
  codigo: '', nome: '', corHex: '#94A3B8', ordem: 0,
  ehInicial: false, ehTerminal: false, ehBloqueio: false, ttsTexto: '',
};

export default function StatusPage() {
  const [lista, setLista] = useState<Status[]>([]);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Status, 'id'>>(VAZIO);
  const [erro, setErro] = useState<string | null>(null);

  function carregar() {
    api.get<Status[]>('/status').then((r) => setLista(r.data));
  }
  useEffect(carregar, []);

  function iniciarNovo() {
    setEditId(null);
    setForm({ ...VAZIO, ordem: lista.length });
    setErro(null);
  }
  function iniciarEdicao(s: Status) {
    setEditId(s.id);
    setForm({ ...s, ttsTexto: s.ttsTexto ?? '' });
    setErro(null);
  }

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    const payload = { ...form, ttsTexto: form.ttsTexto || null };
    try {
      if (editId) await api.put(`/status/${editId}`, payload);
      else await api.post('/status', payload);
      iniciarNovo();
      carregar();
    } catch (ex: unknown) {
      setErro((ex as { response?: { data?: { erro?: string } } })?.response?.data?.erro ?? 'Erro ao salvar.');
    }
  }

  async function excluir(s: Status) {
    if (!confirm(`Excluir status "${s.nome}"?`)) return;
    await api.delete(`/status/${s.id}`).catch(() => alert('Falha ao excluir.'));
    carregar();
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Status</h1>
      </header>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-left">
              <tr>
                <th className="px-4 py-3 font-semibold">#</th>
                <th className="px-4 py-3 font-semibold">Nome</th>
                <th className="px-4 py-3 font-semibold">Flags</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {lista.sort((a, b) => a.ordem - b.ordem).map((s) => (
                <tr key={s.id} className="border-t border-slate-200 dark:border-slate-800">
                  <td className="px-4 py-2.5 text-slate-500">{s.ordem}</td>
                  <td className="px-4 py-2.5">
                    <span className="inline-block px-2 py-0.5 rounded text-white text-xs font-medium mr-2"
                      style={{ backgroundColor: s.corHex }}>{s.nome}</span>
                    <span className="text-xs text-slate-500 font-mono">{s.codigo}</span>
                  </td>
                  <td className="px-4 py-2.5 text-xs text-slate-500">
                    {s.ehInicial && <span className="mr-2">⭐ inicial</span>}
                    {s.ehTerminal && <span className="mr-2">🏁 terminal</span>}
                    {s.ehBloqueio && <span>🔒 bloqueia</span>}
                  </td>
                  <td className="px-4 py-2.5 text-right space-x-2">
                    <Button size="sm" variant="outline" onClick={() => iniciarEdicao(s)}>Editar</Button>
                    <Button size="sm" variant="ghost" onClick={() => excluir(s)}>Excluir</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <aside className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4">
          <h2 className="text-sm font-semibold mb-3">{editId ? 'Editar status' : 'Novo status'}</h2>
          <form onSubmit={salvar} className="space-y-3">
            <div><Label>Código</Label><Input value={form.codigo} onChange={(e) => setForm({ ...form, codigo: e.target.value })} required disabled={!!editId} /></div>
            <div><Label>Nome</Label><Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} required /></div>
            <div><Label>Cor</Label><input type="color" value={form.corHex} onChange={(e) => setForm({ ...form, corHex: e.target.value })} className="w-full h-10 rounded-md border" /></div>
            <div><Label>Ordem</Label><Input type="number" value={form.ordem} onChange={(e) => setForm({ ...form, ordem: parseInt(e.target.value, 10) || 0 })} /></div>
            <div><Label>TTS (texto a falar)</Label><Input value={form.ttsTexto ?? ''} onChange={(e) => setForm({ ...form, ttsTexto: e.target.value })} /></div>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.ehInicial} onChange={(e) => setForm({ ...form, ehInicial: e.target.checked })} /> Inicial</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.ehTerminal} onChange={(e) => setForm({ ...form, ehTerminal: e.target.checked })} /> Terminal</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.ehBloqueio} onChange={(e) => setForm({ ...form, ehBloqueio: e.target.checked })} /> Bloqueia conferência</label>
            {erro && <p className="text-red-600 text-xs">{erro}</p>}
            <div className="flex gap-2 pt-1">
              <Button type="submit" size="sm" className="flex-1">{editId ? 'Salvar' : 'Criar'}</Button>
              {editId && <Button type="button" size="sm" variant="outline" onClick={iniciarNovo}>Cancelar</Button>}
            </div>
          </form>
        </aside>
      </div>
    </div>
  );
}
