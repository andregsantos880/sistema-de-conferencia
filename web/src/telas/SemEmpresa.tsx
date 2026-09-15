import { useEffect, useState } from 'react';
import { listarEmpresas, type EmpresaPublica } from '../lib/api';
import { linkDaEmpresa } from '../lib/rota';

/**
 * Tela exibida quando a URL não identifica a empresa.
 * O cadastro de empresas é feito diretamente no banco de dados.
 */
export default function SemEmpresa() {
  const [empresas, setEmpresas] = useState<EmpresaPublica[]>([]);

  useEffect(() => {
    listarEmpresas()
      .then(setEmpresas)
      .catch(() => setEmpresas([]));
  }, []);

  return (
    <div className="flex min-h-full items-center justify-center bg-slate-200 p-6">
      <div className="w-full max-w-[560px] overflow-hidden rounded-lg border border-slate-300 bg-white shadow-xl">
        <div className="bg-slate-900 px-6 py-4 text-white">
          <h1 className="text-lg font-semibold">SysConf</h1>
          <p className="text-xs text-slate-300">Acesse pelo link da sua empresa</p>
        </div>

        <div className="space-y-3 p-6 text-sm">
          <p className="text-slate-700">
            O endereço precisa identificar a empresa:
          </p>
          <code className="block rounded bg-slate-100 px-3 py-2 text-xs break-all">
            {window.location.origin}/sysconf/&lt;empresa&gt;/login
          </code>

          {empresas.length > 0 && (
            <div>
              <p className="mt-3 mb-1 text-xs font-semibold text-slate-600">Empresas cadastradas:</p>
              <ul className="space-y-1">
                {empresas.map((empresa) => (
                  <li key={empresa.slug}>
                    <a
                      href={linkDaEmpresa(empresa.slug)}
                      className="text-blue-600 underline hover:text-blue-800"
                    >
                      {empresa.nome} — /sysconf/{empresa.slug}/login
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <p className="pt-2 text-xs text-slate-500">
            O cadastro de empresas é feito apenas pelo banco de dados.
          </p>
        </div>
      </div>
    </div>
  );
}
