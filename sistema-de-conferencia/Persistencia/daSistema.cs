using System;
using System.Text;
using Entidade;
using System.IO;
using System.Data;
using System.Data.SqlClient;

namespace Persistencia
{
    public class daSistema
    {

        public void FecharConexao(int conexao)
        {
            if (Conexao.RetornaConexao(conexao).State == ConnectionState.Open)
                Conexao.RetornaConexao(conexao).Close();
        }

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

        public void AtualizarBase(voSistema mvo)
        {

            //Atualiza somente se estiver conectado com a base central
            //if (mvo.conexao == 1) return;

            StringBuilder sb = new StringBuilder();
            StreamReader sr;

            try
            {
                string cScript = Path.Combine(Path.GetDirectoryName(System.Reflection.Assembly.GetExecutingAssembly().Location), "updates");

                for (int conexao = 0; conexao <= 1; conexao++)
                {
                    foreach (var item in Directory.GetFiles(cScript))
                    {

                        sb = new StringBuilder();
                        sr = new StreamReader(item.ToString(), Encoding.ASCII);
                        while (sr.Peek() != -1)
                        {
                            sb.AppendLine(sr.ReadLine());
                        }
                        sr.Close();

                        string[] aCmd = sb.ToString().Split(';');

                        foreach (string s in aCmd)
                        {

                            SqlCommand cmd = new SqlCommand();
                            cmd.CommandTimeout = 0;
                            cmd.CommandType = CommandType.Text;
                            cmd.Connection = Conexao.RetornaConexao(conexao);
                            cmd.CommandText = s;

                            try
                            {
                                cmd.ExecuteNonQuery();
                            }
                            catch (Exception)
                            {
                                continue;

                            }
                        }

                    }
                }

                foreach (var item in Directory.GetFiles(cScript))
                    File.Delete(item.ToString());


            }
            catch (Exception ex)
            {

            }
        }

    }
}
