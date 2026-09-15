import { useCallback, useEffect, useState } from 'react';
import Login from './telas/Login';
import Conferencia from './telas/Conferencia';
import Importacao from './telas/Importacao';
import Usuarios from './telas/Usuarios';
import SemEmpresa from './telas/SemEmpresa';
import { listarFabricas, obterEmpresa, type Empresa, type Fabrica, type UsuarioLogado } from './lib/api';
import { irPara, lerRota, type Rota, type Tela } from './lib/rota';
import { CHAVE_SESSAO } from './lib/config';

/**
 * Raiz do app web.
 *
 * A empresa vem da URL (/sysconf/<empresa>/<tela>) — o cadastro de empresas é
 * feito pelo banco. Depois do login a sessão guarda usuário, perfil e empresa,
 * e todas as consultas ficam restritas àquela empresa.
 */
export default function Sysconf() {
  const [rota, setRota] = useState<Rota>(() => lerRota());
  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [empresaErro, setEmpresaErro] = useState('');
  const [usuario, setUsuario] = useState<UsuarioLogado | null>(null);
  const [fabricas, setFabricas] = useState<Fabrica[]>([]);
  const [fabricaId, setFabricaId] = useState<number | null>(null);

  useEffect(() => {
    const aoNavegar = () => setRota(lerRota());
    window.addEventListener('popstate', aoNavegar);
    return () => window.removeEventListener('popstate', aoNavegar);
  }, []);

  /* resolve a empresa a partir do slug da URL */
  useEffect(() => {
    let cancelado = false;

    setEmpresa(null);
    setEmpresaErro('');
    setUsuario(null);
    setFabricas([]);
    setFabricaId(null);

    if (!rota.empresa) return;

    obterEmpresa(rota.empresa)
      .then((encontrada) => {
        if (cancelado) return;
        if (!encontrada || Number(encontrada.ativo) !== 1) {
          setEmpresaErro('Empresa não encontrada ou inativa. Confira o link recebido.');
          return;
        }
        setEmpresa(encontrada);
      })
      .catch((falha) => {
        if (!cancelado) setEmpresaErro(falha instanceof Error ? falha.message : 'Falha ao consultar a empresa.');
      });

    return () => {
      cancelado = true;
    };
  }, [rota.empresa]);

  const carregarFabricas = useCallback(async (empresaId: number) => {
    try {
      const lista = await listarFabricas(empresaId);
      setFabricas(lista);
      setFabricaId((atual) => atual ?? lista[0]?.controle ?? null);
    } catch {
      // o erro aparece na tela de conferência ao carregar os pedidos
    }
  }, []);

  useEffect(() => {
    if (usuario) void carregarFabricas(usuario.empresa_id);
  }, [usuario, carregarFabricas]);

  function navegar(tela: Tela) {
    if (!rota.empresa) return;
    irPara(rota.empresa, tela);
    setRota({ empresa: rota.empresa, tela });
  }

  function entrar(usuarioLogado: UsuarioLogado, memorizar: boolean) {
    setUsuario(usuarioLogado);
    if (memorizar) {
      localStorage.setItem(CHAVE_SESSAO, JSON.stringify({ login: usuarioLogado.login, empresa: usuarioLogado.empresa_slug }));
    } else {
      localStorage.removeItem(CHAVE_SESSAO);
    }
    navegar('conferencia');
  }

  function sair() {
    setUsuario(null);
    setFabricas([]);
    setFabricaId(null);
    if (rota.empresa) navegar('login');
  }

  /* ------------------------------------------------------------- telas ---- */
  if (!rota.empresa) return <SemEmpresa />;

  if (empresaErro) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-200 p-6">
        <div className="w-full max-w-[420px] rounded-lg border border-slate-300 bg-white p-6 text-center shadow-xl">
          <h2 className="text-sm font-semibold">Não foi possível abrir</h2>
          <p className="mt-2 text-xs text-slate-600">{empresaErro}</p>
          <p className="mt-3 text-[11px] text-slate-500">
            A empresa é identificada pelo endereço: /sysconf/&lt;empresa&gt;/login
          </p>
        </div>
      </div>
    );
  }

  if (!empresa) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-200 text-xs text-slate-600">
        Carregando empresa...
      </div>
    );
  }

  if (!usuario || rota.tela === 'login') {
    return <Login empresa={empresa} onEntrar={entrar} />;
  }

  if (rota.tela === 'importacao') {
    return (
      <Importacao
        empresa={empresa}
        fabricas={fabricas}
        fabricaId={fabricaId}
        onTrocarFabrica={setFabricaId}
        onConcluir={() => navegar('conferencia')}
        onVoltar={() => navegar('conferencia')}
      />
    );
  }

  if (rota.tela === 'usuarios') {
    return (
      <Usuarios
        empresa={empresa}
        usuarioLogado={{ id: usuario.id, login: usuario.login, perfil: usuario.perfil }}
        onVoltar={() => navegar('conferencia')}
      />
    );
  }

  return (
    <Conferencia
      empresa={empresa}
      usuario={usuario}
      fabricas={fabricas}
      fabricaId={fabricaId}
      onTrocarFabrica={setFabricaId}
      onAbrirImportacao={() => navegar('importacao')}
      onAbrirUsuarios={() => navegar('usuarios')}
      onSair={sair}
    />
  );
}
