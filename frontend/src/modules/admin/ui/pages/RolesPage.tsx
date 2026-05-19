import { useEffect, useMemo, useState } from 'react';
import { api } from '@/shared/services/api';
import { Button } from '@/shadcn/components/ui/button';
import { Input } from '@/shadcn/components/ui/input';
import { Label } from '@/shadcn/components/ui/label';

type Permissao = { codigo: string; modulo: string; acao: string; descricao: string };
type Role = { id: string; nome: string; descricao?: string | null; ehSistema: boolean; permissoes: string[] };

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissoes, setPermissoes] = useState<Permissao[]>([]);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ nome: '', descricao: '', permissoes: [] as string[] });
  const [erro, setErro] = useState<string | null>(null);

  const porModulo = useMemo(() => {
    const m: Record<string, Permissao[]> = {};
    permissoes.forEach((p) => { (m[p.modulo] ??= []).push(p); });
    return Object.entries(m).sort(([a], [b]) => a.localeCompare(b));
  }, [permissoes]);

  function carregar() {
    api.get<Role[]>('/roles').then((r) => setRoles(r.data));
    api.get<Permissao[]>('/permissoes').then((r) => setPermissoes(r.data));
  }
  useEffect(carregar, []);

  function novo() { setEditId(null); setForm({ nome: '', descricao: '', permissoes: [] }); setErro(null); }
  function duplicar(r: Role) { setEditId(null); setForm({ nome: r.nome + ' (cópia)', descricao: r.descricao ?? '', permissoes: r.permissoes }); setErro(null); }
  function editar(r: Role) { setEditId(r.id); setForm({ nome: r.nome, descricao: r.descricao ?? '', permissoes: r.permissoes }); setErro(null); }

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    try {
      if (editId) await api.put(`/roles/${editId}`, { nome: form.nome, descricao: form.descricao || null, permissoes: form.permissoes });
      else await api.post('/roles', { nome: form.nome, descricao: form.descricao || null, permissoes: form.permissoes });
      novo();
      carregar();
    } catch (ex: unknown) {
      setErro((ex as { response?: { data?: { erro?: string } } })?.response?.data?.erro ?? 'Falha ao salvar.');
    }
  }

  async function excluir(r: Role) {
    if (r.ehSistema) { alert('Roles de sistema não podem ser excluídas.'); return; }
    if (!confirm(`Excluir role "${r.nome}"?`)) return;
    try {
      await api.delete(`/roles/${r.id}`);
      carregar();
    } catch (ex: unknown) {
      alert((ex as { response?: { data?: { erro?: string } } })?.response?.data?.erro ?? 'Falha.');
    }
  }

  function togglePermissao(codigo: string) {
    setForm((s) => ({
      ...s,
      permissoes: s.permissoes.includes(codigo) ? s.permissoes.filter((p) => p !== codigo) : [...s.permissoes, codigo],
    }));
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Roles</h1>
      <div className="grid md:grid-cols-5 gap-6">
        <div className="md:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-left">
              <tr>
                <th className="px-4 py-3 font-semibold">Nome</th>
                <th className="px-4 py-3 font-semibold">Perms</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {roles.map((r) => (
                <tr key={r.id} className="border-t border-slate-200 dark:border-slate-800">
                  <td className="px-4 py-2.5">
                    {r.nome}
                    {r.ehSistema && <span className="ml-1 text-xs text-amber-600">★ sistema</span>}
                  </td>
                  <td className="px-4 py-2.5 text-xs text-slate-500">{r.permissoes.length}</td>
                  <td className="px-4 py-2.5 text-right space-x-1">
                    <Button size="sm" variant="outline" onClick={() => editar(r)} disabled={r.ehSistema}>Editar</Button>
                    <Button size="sm" variant="ghost" onClick={() => duplicar(r)}>Duplicar</Button>
                    {!r.ehSistema && <Button size="sm" variant="ghost" onClick={() => excluir(r)}>Excluir</Button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <aside className="md:col-span-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4">
          <h2 className="text-sm font-semibold mb-3">{editId ? 'Editar role' : 'Nova role'}</h2>
          <form onSubmit={salvar} className="space-y-3">
            <div><Label>Nome</Label><Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} required /></div>
            <div><Label>Descrição</Label><Input value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} /></div>
            <div>
              <Label>Permissões</Label>
              <div className="space-y-3 mt-2 max-h-96 overflow-y-auto pr-2">
                {porModulo.map(([modulo, perms]) => (
                  <div key={modulo}>
                    <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">{modulo}</div>
                    <div className="space-y-1 pl-2">
                      {perms.map((p) => (
                        <label key={p.codigo} className="flex items-start gap-2 text-sm">
                          <input type="checkbox" className="mt-0.5"
                            checked={form.permissoes.includes(p.codigo)}
                            onChange={() => togglePermissao(p.codigo)} />
                          <span><span className="font-mono text-xs">{p.acao}</span> — <span className="text-slate-600">{p.descricao}</span></span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {erro && <p className="text-red-600 text-xs">{erro}</p>}
            <div className="flex gap-2 pt-1">
              <Button type="submit" size="sm" className="flex-1">{editId ? 'Salvar' : 'Criar'}</Button>
              {editId && <Button type="button" size="sm" variant="outline" onClick={novo}>Cancelar</Button>}
            </div>
          </form>
        </aside>
      </div>
    </div>
  );
}
