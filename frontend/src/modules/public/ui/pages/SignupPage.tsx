import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/shadcn/components/ui/button';
import { Input } from '@/shadcn/components/ui/input';
import { Label } from '@/shadcn/components/ui/label';
import { api } from '@/shared/services/api';
import { authStore } from '@/modules/auth/infrastructure/authStore';

export default function SignupPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [form, setForm] = useState({
    razaoSocial: '',
    documento: '',
    telefone: '',
    planoCodigo: params.get('plano') ?? 'pro',
    nomeAdmin: '',
    emailAdmin: '',
    senhaAdmin: '',
  });

  function set<K extends keyof typeof form>(k: K, v: string) {
    setForm((s) => ({ ...s, [k]: v }));
  }

  async function submeter(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setCarregando(true);
    try {
      const r = await api.post('/public/signup', form);
      authStore.set(r.data);
      navigate('/app/conferencia', { replace: true });
    } catch (ex: unknown) {
      const detalhe = (ex as { response?: { data?: { erro?: string } } })?.response?.data?.erro;
      setErro(detalhe ?? 'Falha no cadastro. Verifique os dados.');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-6">
      <div className="w-full max-w-md">
        <Link to="/" className="block text-center text-2xl font-bold mb-2">SisConf</Link>
        <p className="text-center text-sm text-slate-500 mb-8">Trial de 14 dias — sem cartão de crédito.</p>

        <form onSubmit={submeter} className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
          <h1 className="text-xl font-semibold mb-2">Criar conta</h1>

          <div>
            <Label>Razão social</Label>
            <Input value={form.razaoSocial} onChange={(e) => set('razaoSocial', e.target.value)} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>CNPJ / CPF</Label>
              <Input value={form.documento} onChange={(e) => set('documento', e.target.value)} required />
            </div>
            <div>
              <Label>Telefone</Label>
              <Input value={form.telefone} onChange={(e) => set('telefone', e.target.value)} />
            </div>
          </div>

          <div className="border-t pt-4 mt-4">
            <Label>Plano</Label>
            <select className="w-full mt-1 h-10 rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-3 text-sm"
              value={form.planoCodigo} onChange={(e) => set('planoCodigo', e.target.value)}>
              <option value="basic">Basic</option>
              <option value="pro">Pro</option>
              <option value="enterprise">Enterprise</option>
            </select>
          </div>

          <div className="border-t pt-4">
            <h2 className="text-sm font-semibold mb-3">Seu usuário (admin do tenant)</h2>
            <div className="space-y-3">
              <div>
                <Label>Nome</Label>
                <Input value={form.nomeAdmin} onChange={(e) => set('nomeAdmin', e.target.value)} required />
              </div>
              <div>
                <Label>Email</Label>
                <Input type="email" value={form.emailAdmin} onChange={(e) => set('emailAdmin', e.target.value)} required />
              </div>
              <div>
                <Label>Senha (mín. 8 caracteres)</Label>
                <Input type="password" value={form.senhaAdmin} onChange={(e) => set('senhaAdmin', e.target.value)} minLength={8} required />
              </div>
            </div>
          </div>

          {erro && <p className="text-red-600 text-sm">{erro}</p>}

          <Button type="submit" className="w-full" disabled={carregando}>
            {carregando ? 'Criando…' : 'Criar conta e entrar'}
          </Button>

          <p className="text-center text-sm text-slate-500">
            Já tem conta? <Link to="/login" className="text-primary font-medium">Entrar</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
