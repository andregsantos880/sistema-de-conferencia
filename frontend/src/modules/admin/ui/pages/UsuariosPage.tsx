import { useEffect, useState } from 'react';
import { api } from '@/shared/services/api';
import { Button } from '@/shadcn/components/ui/button';
import { Input } from '@/shadcn/components/ui/input';
import { Label } from '@/shadcn/components/ui/label';

type Usuario = {
  id: string; email: string; nome: string; ativo: boolean; ehOwner: boolean;
  ultimoLoginEm?: string | null; criadoEm: string; roleIds: string[];
};
type Role = { id: string; nome: string };

export default function UsuariosPage() {
  const [lista, setLista] = useState<Usuario[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ email: '', nome: '', senha: '', ativo: true, roleIds: [] as string[] });
  const [erro, setErro] = useState<string | null>(null);

  function carregar() {
    api.get<Usuario[]>('/usuarios').then((r) => setLista(r.data));
    api.get<Role[]>('/roles').then((r) => setRoles(r.data));
  }
  useEffect(carregar, []);

  function novo() { setEditId(null); setForm({ email: '', nome: '', senha: '', ativo: true, roleIds: [] }); setErro(null); }
  function editar(u: Usuario) {
    setEditId(u.id);
    setForm({ email: u.email, nome: u.nome, senha: '', ativo: u.ativo, roleIds: u.roleIds });
    setErro(null);
  }

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    try {
      if (editId) {
        await api.put(`/usuarios/${editId}`, { nome: form.nome, ativo: form.ativo });
        await api.post(`/usuarios/${editId}/atribuir-roles`, { roleIds: form.roleIds });
        if (form.senha) await api.post(`/usuarios/${editId}/redefinir-senha`, { novaSenha: form.senha });
      } else {
        await api.post('/usuarios', { email: form.email, nome: form.nome, senha: form.senha, roleIds: form.roleIds });
      }
      novo();
      carregar();
    } catch (ex: unknown) {
      setErro((ex as { response?: { data?: { erro?: string } } })?.response?.data?.erro ?? 'Erro ao salvar.');
    }
  }

  async function excluir(u: Usuario) {
    if (u.ehOwner) { alert('O owner não pode ser excluído.'); return; }
    if (!confirm(`Desativar usuário ${u.email}?`)) return;
    await api.delete(`/usuarios/${u.id}`).catch((ex) => alert(ex?.response?.data?.erro ?? 'Falha.'));
    carregar();
  }

  function toggleRole(roleId: string) {
    setForm((s) => ({
      ...s,
      roleIds: s.roleIds.includes(roleId) ? s.roleIds.filter((r) => r !== roleId) : [...s.roleIds, roleId],
    }));
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Usuários</h1>
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-left">
              <tr>
                <th className="px-4 py-3 font-semibold">Nome</th>
                <th className="px-4 py-3 font-semibold">Email</th>
                <th className="px-4 py-3 font-semibold">Roles</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {lista.map((u) => (
                <tr key={u.id} className="border-t border-slate-200 dark:border-slate-800">
                  <td className="px-4 py-2.5">{u.nome} {u.ehOwner && <span className="ml-1 text-xs text-amber-600">★ owner</span>}</td>
                  <td className="px-4 py-2.5 text-xs text-slate-500">{u.email}</td>
                  <td className="px-4 py-2.5 text-xs">
                    {u.roleIds.map((rid) => roles.find((r) => r.id === rid)?.nome).filter(Boolean).join(', ')}
                  </td>
                  <td className="px-4 py-2.5">{u.ativo ? '✓ ativo' : '— inativo'}</td>
                  <td className="px-4 py-2.5 text-right space-x-2">
                    <Button size="sm" variant="outline" onClick={() => editar(u)}>Editar</Button>
                    {!u.ehOwner && <Button size="sm" variant="ghost" onClick={() => excluir(u)}>Desativar</Button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <aside className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4">
          <h2 className="text-sm font-semibold mb-3">{editId ? 'Editar usuário' : 'Novo usuário'}</h2>
          <form onSubmit={salvar} className="space-y-3">
            <div><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required disabled={!!editId} /></div>
            <div><Label>Nome</Label><Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} required /></div>
            <div>
              <Label>Senha {editId && <span className="text-xs text-slate-500">(deixe vazio para manter)</span>}</Label>
              <Input type="password" value={form.senha} onChange={(e) => setForm({ ...form, senha: e.target.value })}
                required={!editId} minLength={editId ? 0 : 8} />
            </div>
            <div>
              <Label>Roles</Label>
              <div className="space-y-1 mt-1">
                {roles.map((r) => (
                  <label key={r.id} className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={form.roleIds.includes(r.id)} onChange={() => toggleRole(r.id)} />
                    {r.nome}
                  </label>
                ))}
              </div>
            </div>
            {editId && (
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.ativo} onChange={(e) => setForm({ ...form, ativo: e.target.checked })} /> Ativo
              </label>
            )}
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
