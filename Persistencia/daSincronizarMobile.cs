using System;
using System.Collections.Generic;
using System.Data;
using MySql.Data.MySqlClient;
using System.Data.SqlClient;
using System.Configuration;
using Entidade;
using System.Windows.Forms;

namespace Persistencia
{
    public class daSincronizarMobile
    {
        MySqlConnection mysqlCnn;
        SqlConnection sqlserverCnn;

        SqlCommand cmd = new SqlCommand();
        MySqlCommand mySqlCommand = new MySqlCommand();
        Form form = new Form();
        ProgressBar progresso = new ProgressBar();

        public daSincronizarMobile()
        {

            form.Text = "Sincronizando...";
            form.FormBorderStyle = FormBorderStyle.FixedDialog;
            form.Height = 70;
            form.Width = 400;

            progresso.Dock = DockStyle.Fill;
            form.Controls.Add(progresso);
            form.Visible = true;
        }

        public void Executar(bool sincronizarStatusApenas = false)
        {

            string SqlServerConnectionString = Conexao.RetornaConexao(0).ConnectionString;
            sqlserverCnn = new SqlConnection(SqlServerConnectionString);
            sqlserverCnn.Open();

            string MySqlConnectionString = ConfigurationManager.ConnectionStrings["MySqlConnectionString"].ConnectionString;
            mysqlCnn = new MySqlConnection(MySqlConnectionString);
            mysqlCnn.Open();

            string empresa = ObterEmpresa().Rows[0]["Nome"].ToString();

            mySqlCommand.Connection = mysqlCnn;

            if (!sincronizarStatusApenas)
            {
                DataTable local = ObterDadosLocal();
                progresso.Maximum = local.Rows.Count;
                form.Text = "Atualizando servidor remoto...";
                if (local.Rows.Count > 0)
                {
                    foreach (DataRow item in local.Rows)
                    {
                        mySqlCommand.CommandText = "DELETE FROM TB_INTEGRACAO WHERE EMPRESA = '" + empresa + "' AND GRUPOID = " + item["GRUPOID"];
                        mySqlCommand.ExecuteNonQuery();
                    }

                    foreach (DataRow item in local.Rows)
                    {
                        mySqlCommand.CommandText = String.Format("INSERT INTO TB_INTEGRACAO(ID,DESCRICAO1,ETIQUETA,USUARIOID,GRUPOID,GRUPO,EMPRESA) VALUES({0},'{1}','{2}',{3},{4},'{5}','{6}')",
                            item["ID"], item["DESCRICAO1"], item["ETIQUETA"], item["USUARIOID"], item["GRUPOID"], item["GRUPO"], item["EMPRESA"]);
                        mySqlCommand.ExecuteNonQuery();

                        AtualizaStatusEnvio(int.Parse(item["ID"].ToString()), 4);
                    }
                    Application.DoEvents();
                    progresso.Increment(1);
                }

                DataTable usuarios = ObterUsuarios();
                progresso.Maximum = usuarios.Rows.Count;
                form.Text = "Atualizando usuários...";
                if (usuarios.Rows.Count > 0)
                {
                    mySqlCommand.CommandText = String.Format("DELETE FROM LOGIN WHERE EMPRESA = '{0}'", empresa);
                    mySqlCommand.ExecuteNonQuery();

                    foreach (DataRow item in usuarios.Rows)
                    {
                        mySqlCommand.CommandText = String.Format("INSERT INTO LOGIN(LOGIN,SENHA,EMPRESA,USUARIOID) VALUES('{0}','{1}','{2}',{3})",
                            item["LOGIN"], item["SENHA"], empresa, item["ID"]);
                        mySqlCommand.ExecuteNonQuery();
                        Application.DoEvents();
                        progresso.Increment(1);
                    }
                }

            }

            //Atualiza peças que foram conferidas no mobile 
            mySqlCommand.CommandText = String.Format("SELECT * FROM TB_INTEGRACAO_CONFERENCIA WHERE EMPRESA = '{0}'", empresa);
            form.Text = "Atualizando servidor local...";
            MySqlDataReader dr = mySqlCommand.ExecuteReader();
            while (dr.Read())
            {
                int id = int.Parse(dr["IDPECA"].ToString());
                AtualizaStatusEnvio(id, 5);

                //Histórico
                voHistorico mvoHistorico = new voHistorico();
                daHistorico mboHistorico = new daHistorico(0);

                mvoHistorico.PEDIDOID = id;
                mvoHistorico.STATUS = 5;
                mvoHistorico.USUARIO = Convert.ToInt32(dr["USUARIOID"].ToString());
                mvoHistorico.DATA = DateTime.Now;
                mboHistorico.Inserir(mvoHistorico);
                Application.DoEvents();

            }
            dr.Close();

            if (!sincronizarStatusApenas)
            {
                mySqlCommand.CommandText = "DELETE FROM TB_INTEGRACAO_CONFERENCIA WHERE EMPRESA = '" + empresa + "'";
                mySqlCommand.ExecuteNonQuery();
            }

            mysqlCnn.Close();
            sqlserverCnn.Close();

            MessageBox.Show("Sincronizado com sucesso", "Sincronizar", MessageBoxButtons.OK, MessageBoxIcon.Information);

        }

        private void AtualizaStatusEnvio(int id, int status)
        {
            try
            {
                cmd.CommandTimeout = 0;
                cmd.CommandType = CommandType.Text;
                cmd.CommandText = "UPDATE PEDIDO SET STATUS = " + status + ", FlBloqueio = 1 WHERE ID = " + id;
                cmd.Connection = sqlserverCnn;

                cmd.ExecuteNonQuery();
            }

            catch (Exception ex) { }
        }

        private DataTable ObterEmpresa()
        {

            DataSet ds = new DataSet();
            SqlDataAdapter da = new SqlDataAdapter(cmd);

            try
            {
                cmd.CommandTimeout = 0;
                cmd.CommandType = CommandType.Text;
                cmd.CommandText = "SELECT TOP 1 * FROM EMPRESA";
                cmd.Connection = sqlserverCnn;

                cmd.ExecuteNonQuery();

                da.Fill(ds);

                return ds.Tables[0];
            }

            catch (Exception ex)
            {
                throw ex;
            }
        }

        private DataTable ObterUsuarios()
        {

            DataSet ds = new DataSet();
            SqlDataAdapter da = new SqlDataAdapter(cmd);

            try
            {

                cmd.CommandTimeout = 0;
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.CommandText = "sps_usuario";
                cmd.Connection = sqlserverCnn;

                cmd.ExecuteNonQuery();

                da.Fill(ds);

                return ds.Tables[0];
            }

            catch (Exception ex)
            {
                throw ex;
            }
        }

        private DataTable ObterDadosLocal()
        {

            DataSet ds = new DataSet();
            SqlDataAdapter da = new SqlDataAdapter(cmd);

            try
            {

                cmd.CommandTimeout = 0;
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.CommandText = "sps_pedidos_mobile";
                cmd.Connection = sqlserverCnn;

                cmd.ExecuteNonQuery();

                da.Fill(ds);

                return ds.Tables[0];
            }

            catch (Exception ex)
            {
                throw ex;
            }
        }
    }
}
