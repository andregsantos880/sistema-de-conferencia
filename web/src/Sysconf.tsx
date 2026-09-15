import { useCallback, useEffect, useState } from 'react';
import Login from './telas/Login';
import Conferencia from './telas/Conferencia';
import Importacao from './telas/Importacao';
import { listarFabricas, type Fabrica, type UsuarioLogado } from './lib/api';
import { CHAVE_SESSAO } from './lib/config';

type Tela = 'login' | 'conferencia' | 'importacao';

/**
 * Raiz do app web do SysConf.
 * Fluxo idêntico ao do WinForms:
 *   FormLogin -> Form1 (conferência) -> TabeLayo (importação).
 */
export default function Sysconf() {
  const [tela, setTela] = useState<Tela>('login');
  const [usuario, setUsuario] = useState<UsuarioLogado | null>(null);
  const [fabricas, setFabricas] = useState<Fabrica[]>([]);
  const [fabricaId, setFabricaId] = useState<number | null>(null);

  // As fábricas são necessárias nas duas telas; carregadas uma vez após o login.
  const carregarFabricas = useCallback(async () => {
    try {
      const lista = await listarFabricas();
      setFabricas(lista);
      setFabricaId((atual) => atual ?? lista[0]?.controle ?? null);
    } catch {
      // o erro real aparece na tela de conferência ao consultar os pedidos
    }
  }, []);

  useEffect(() => {
    if (usuario) void carregarFabricas();
  }, [usuario, carregarFabricas]);

  function entrar(usuarioLogado: UsuarioLogado, memorizar: boolean) {
    setUsuario(usuarioLogado);
    if (memorizar) {
      localStorage.setItem(CHAVE_SESSAO, JSON.stringify({ login: usuarioLogado.login }));
    } else {
      localStorage.removeItem(CHAVE_SESSAO);
    }
    setTela('conferencia');
  }

  function sair() {
    setUsuario(null);
    setFabricas([]);
    setFabricaId(null);
    setTela('login');
  }

  if (!usuario || tela === 'login') {
    return <Login onEntrar={entrar} />;
  }

  if (tela === 'importacao') {
    return (
      <Importacao
        fabricas={fabricas}
        fabricaId={fabricaId}
        onTrocarFabrica={setFabricaId}
        onConcluir={() => setTela('conferencia')}
        onVoltar={() => setTela('conferencia')}
      />
    );
  }

  return (
    <Conferencia
      usuario={usuario.login}
      fabricas={fabricas}
      fabricaId={fabricaId}
      onTrocarFabrica={setFabricaId}
      onAbrirImportacao={() => setTela('importacao')}
      onSair={sair}
    />
  );
}
