import { useEffect, useState } from 'react';
import { api } from '@/shared/services/api';
import { Button } from '@/shadcn/components/ui/button';
import { Input } from '@/shadcn/components/ui/input';
import { Label } from '@/shadcn/components/ui/label';

type Box = { id: string; codigo: string; nome: string; ttsTexto?: string | null; ativo: boolean };

export default function BoxesPage() {
  const [lista, setLista] = useState<Box[]>([]);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ codigo: '', nome: '', ttsTexto: '', ativo: true });

  function carregar() { api.get<Box[]>('/boxes', { params: { incluirInativos: true } }).then((r) => setLista(r.data)); }
  useEffect(carregar, []);

  function novo() { setEditId(null); setForm({ codigo: '', nome: '', ttsTexto: '', ativo: true }); }
  function editar(b: Box) { setEditId(b.id); setForm({ codigo: b.codigo, nome: b.nome, ttsTexto: b.ttsTexto ?? '', ativo: b.ativo }); }

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    const payload = { ...form, ttsTexto: form.ttsTexto || null };
    if (editId) await api.put(`/boxes/${editId}`, { nome: form.nome, ttsTexto: payload.ttsTexto, ativo: form.ativo });
    else await api.post('/boxes', { codigo: form.codigo, nome: form.nome, ttsTexto: payload.ttsTexto });
    novo();
    carregar();
  }

  async function excluir(b: Box) {
    if (!confirm(`Excluir box ${b.codigo}?`)) return;
    await api.delete(`/boxes/${b.id}`); carregar();
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Boxes</h1>
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-left">
              <tr>
                <th className="px-4 py-3 font-semibold">Código</th>
                <th className="px-4 py-3 font-semibold">Nome</th>
                <th className="px-4 py-3 font-semibold">TTS</th>
                <th className="px-4 py-3 font-semibold">Ativo</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {lista.map((b) => (
                <tr key={b.id} className="border-t border-slate-200 dark:border-slate-800">
                  <td className="px-4 py-2.5 font-mono">{b.codigo}</td>
                  <td className="px-4 py-2.5">{b.nome}</td>
                  <td className="px-4 py-2.5 text-slate-500">{b.ttsTexto ?? '—'}</td>
                  <td className="px-4 py-2.5">{b.ativo ? '✓' : '—'}</td>
                  <td className="px-4 py-2.5 text-right space-x-2">
                    <Button size="sm" variant="outline" onClick={() => editar(b)}>Editar</Button>
                    <Button size="sm" variant="ghost" onClick={() => excluir(b)}>Excluir</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <aside className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4">
          <h2 className="text-sm font-semibold mb-3">{editId ? 'Editar box' : 'Novo box'}</h2>
          <form onSubmit={salvar} className="space-y-3">
            <div><Label>Código</Label><Input value={form.codigo} onChange={(e) => setForm({ ...form, codigo: e.target.value })} required disabled={!!editId} /></div>
            <div><Label>Nome</Label><Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} required /></div>
            <div><Label>Texto TTS</Label><Input value={form.ttsTexto} onChange={(e) => setForm({ ...form, ttsTexto: e.target.value })} placeholder="ex: Box três" /></div>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.ativo} onChange={(e) => setForm({ ...form, ativo: e.target.checked })} /> Ativo</label>
            <div className="flex gap-2">
              <Button type="submit" size="sm" className="flex-1">{editId ? 'Salvar' : 'Criar'}</Button>
              {editId && <Button type="button" size="sm" variant="outline" onClick={novo}>Cancelar</Button>}
            </div>
          </form>
        </aside>
      </div>
    </div>
  );
}
