import { useCallback, useEffect, useState } from 'react';
import Login from './telas/Login';
import Conferencia from './telas/Conferencia';
import Importacao from './telas/Importacao';
import Usuarios from './telas/Usuarios';
import Fabricas from './telas/Fabricas';
import Importacoes from './telas/Importacoes';
import SemEmpresa from './telas/SemEmpresa';
import Landing from './telas/Landing';
import Entrar from './telas/Entrar';
import Registrar from './telas/Registrar';
import Juridico from './telas/Juridico';
import { listarFabricas, obterEmpresa, restaurarSessao, sair as sairSessao, type Empresa, type Fabrica, type UsuarioLogado } from './lib/api';
import { irPara, lerRota, type Rota, type Tela } from './lib/rota';
import { CHAVE_SESSAO } from './lib/config';

/**
 * Raiz do app web.
 *
 * Páginas públicas (site): / (landing), /entrar e /registrar.
 * App da empresa: /sysconf/<empresa>/<tela> — a empresa vem da URL.
 * Depois do login a sessão guarda usuário, perfil e empresa, e todas as
 * consultas ficam restritas àquela empresa.
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

  /*
   * SEO: só a landing e as páginas públicas entram no índice. As telas de
   * empresa (/sysconf/<empresa>/...) são iguais entre si e ficam atrás de login,
   * então recebem noindex quando a rota é de empresa.
   */
  useEffect(() => {
    const meta = document.querySelector('meta[name="robots"]');
    if (meta) meta.setAttribute('content', rota.empresa ? 'noindex,follow' : 'index,follow');
  }, [rota.empresa]);

  /* resolve a empresa a partir do slug da URL */
  useEffect(() => {
    let cancelado = false;

    setEmpresa(null);
    setEmpresaErro('');
    /* Trocar de empresa encerra a sessão; voltar para a MESMA empresa mantém —
       é o que permite entrar pela landing (/entrar, /registrar) e cair no
       /sysconf/<empresa>/conferencia sem perder o login. */
    setUsuario((atual) =>
      atual && rota.empresa && atual.empresa_slug === rota.empresa ? atual : null,
    );
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

  const carregarFabricas = useCallback(async () => {
    try {
      const lista = await listarFabricas();
      setFabricas(lista);
      setFabricaId((atual) => atual ?? lista[0]?.controle ?? null);
    } catch {
      // o erro aparece na tela de conferência ao carregar os pedidos
    }
  }, []);

  useEffect(() => {
    if (usuario) void carregarFabricas();
  }, [usuario, carregarFabricas]);

  /*
   * Retoma a sessão guardada (token em sessionStorage): o F5 não desloga mais.
   * O token só vale para a empresa dele, então a rota é conferida antes.
   */
  useEffect(() => {
    let cancelado = false;

    void restaurarSessao().then((sessao) => {
      if (cancelado || !sessao) return;

      if (rota.empresa) {
        if (sessao.empresa_slug === rota.empresa) setUsuario(sessao);
        return;
      }

      /* entrou direto em /entrar já estando logado: vai para o painel */
      if (rota.pagina === 'entrar') {
        irPara(sessao.empresa_slug, 'conferencia');
        setUsuario(sessao);
        setRota({ empresa: sessao.empresa_slug, tela: 'conferencia', pagina: null });
      }
    });

    return () => {
      cancelado = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function navegar(tela: Tela) {
    if (!rota.empresa) return;
    irPara(rota.empresa, tela);
    setRota({ empresa: rota.empresa, tela, pagina: null });
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
    void sairSessao(); /* encerra a sessão no servidor e esquece o token */
    if (rota.empresa) navegar('login');
  }

  /**
   * Entrada pelas telas públicas (/entrar e /registrar): o usuário já sai
   * logado e segue para o painel da própria empresa.
   */
  function entrarPelaLanding(usuarioLogado: UsuarioLogado, memorizar: boolean) {
    setUsuario(usuarioLogado);
    if (memorizar) {
      localStorage.setItem(
        CHAVE_SESSAO,
        JSON.stringify({ login: usuarioLogado.login, empresa: usuarioLogado.empresa_slug }),
      );
    } else {
      localStorage.removeItem(CHAVE_SESSAO);
    }
    irPara(usuarioLogado.empresa_slug, 'conferencia');
    setRota({ empresa: usuarioLogado.empresa_slug, tela: 'conferencia', pagina: null });
  }

  /* ------------------------------------------------------------- telas ---- */
  /* páginas públicas do site (antes de qualquer coisa de empresa) */
  if (rota.pagina === 'landing') return <Landing />;

  if (rota.pagina === 'entrar') return <Entrar onEntrar={entrarPelaLanding} />;

  if (rota.pagina === 'registrar') return <Registrar onEntrar={entrarPelaLanding} />;

  if (rota.pagina === 'termos' || rota.pagina === 'privacidade') {
    return <Juridico documento={rota.pagina} />;
  }

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

  if (rota.tela === 'fabricas') {
    return (
      <Fabricas
        empresa={empresa}
        usuarioLogado={{ id: usuario.id, login: usuario.login, perfil: usuario.perfil }}
        onVoltar={() => navegar('conferencia')}
      />
    );
  }

  if (rota.tela === 'importacoes') {
    return (
      <Importacoes
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
      onAbrirFabricas={() => navegar('fabricas')}
      onAbrirImportacoes={() => navegar('importacoes')}
      onSair={sair}
    />
  );
}
