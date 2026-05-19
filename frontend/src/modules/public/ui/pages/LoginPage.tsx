import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/shadcn/components/ui/button';
import { Input } from '@/shadcn/components/ui/input';
import { Label } from '@/shadcn/components/ui/label';
import { api } from '@/shared/services/api';
import { toast } from '@/shared/services/toast';
import { authStore } from '@/modules/auth/infrastructure/authStore';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setCarregando(true);
    try {
      const r = await api.post('/auth/login', { email, senha });
      authStore.set(r.data);
      toast.sucesso(`Bem-vindo, ${r.data?.nome ?? 'usuário'}!`);
      navigate('/app/conferencia', { replace: true });
    } catch (ex: unknown) {
      const detalhe = (ex as { response?: { data?: { erro?: string } } })?.response?.data?.erro;
      setErro(detalhe ?? 'Credenciais inválidas.');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-6">
      <div className="w-full max-w-sm">
        <Link to="/" className="block text-center text-2xl font-bold mb-8">SisConf</Link>
        <form onSubmit={entrar} className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
          <h1 className="text-xl font-semibold">Entrar</h1>
          <div>
            <Label>Email</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <Label>Senha</Label>
            <Input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} required />
          </div>
          {erro && <p className="text-red-600 text-sm">{erro}</p>}
          <Button type="submit" className="w-full" disabled={carregando}>
            {carregando ? 'Entrando…' : 'Entrar'}
          </Button>
          <p className="text-center text-sm text-slate-500">
            Não tem conta? <Link to="/cadastro" className="text-primary font-medium">Criar uma</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
