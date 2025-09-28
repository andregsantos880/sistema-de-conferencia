using Entidade;
using System.Data;

namespace Persistencia
{
    public class daSistema
    {

        public voSistema ConsultarConexao()
        {

            voSistema mvo = new voSistema();

            mvo.servidor = Properties.Settings.Default.servidor;
            mvo.banco = Properties.Settings.Default.banco;
            mvo.usuario = Properties.Settings.Default.usuario;
            mvo.senha = Properties.Settings.Default.senha;
            return mvo;

        }

        public void AlterarConexao(voSistema mvo)
        {
            Properties.Settings.Default.servidor = mvo.servidor;
            Properties.Settings.Default.banco = mvo.banco;
            Properties.Settings.Default.usuario = mvo.usuario;
            Properties.Settings.Default.senha = mvo.senha;
            Properties.Settings.Default.Save();

        }
    }
}
