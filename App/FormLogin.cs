using System;
using System.Windows.Forms;
using Entidade;
using Negocio;
using System.Deployment.Application;
using Persistencia;
using Dapper;

namespace App
{
    public partial class FormLogin : Form
    {
        public FormLogin()
        {
            InitializeComponent();
            InstallUpdateSyncWithInfo();

        }
        private void InstallUpdateSyncWithInfo()
        {
            //if (!isNewUpdateMessageShown)
            {
                try
                {
                    if (ApplicationDeployment.IsNetworkDeployed)
                    {
                        ApplicationDeployment ad = ApplicationDeployment.CurrentDeployment;
                        ad.UpdateCompleted += Ad_UpdateCompleted;
                        ad.UpdateProgressChanged += Ad_UpdateProgressChanged;
                        //ad_UpdateCompleted is a private method which handles what happens after the update is done
                        UpdateCheckInfo info = ad.CheckForDetailedUpdate();
                        if (info.UpdateAvailable)
                        {
                            //You can create a dialog or message that prompts the user that there's an update. Make sure the user knows that your are updating the application.
                            ad.UpdateAsync();//Updates the application asynchronously
                        }
                    }

                }
                catch (Exception ex)
                {
                    throw ex;
                }
            }

        }

        private void Ad_UpdateProgressChanged(object sender, DeploymentProgressChangedEventArgs e)
        {
            this.Text = $"::Atualizando o sistema: {e.ProgressPercentage}%";
            confirmarButton.Enabled = false;
            cancelarButton.Enabled = false;
        }

        private void Ad_UpdateCompleted(object sender, System.ComponentModel.AsyncCompletedEventArgs e)
        {
            MessageBox.Show("O sistema foi atualizado com sucesso. Clique em OK para reiniciar.", "Atualização", MessageBoxButtons.OK);
            Application.Restart();
        }

        private void SetaBanco()
        {
            voSistema mvoSistema = new voSistema();
            boSistema mboSistema = new boSistema();

            try
            {

                Properties.Settings.Default.CdDestino = 0;

                if (usuarioTextBox.Text.Contains("GVS"))
                {
                    mvoSistema.servidor = "SQL8005.site4now.net";
                    mvoSistema.senha = "Setembro@344550";
                    mvoSistema.banco = "db_a932ec_novorumo";
                    mvoSistema.usuario = "db_a932ec_novorumo_admin";
                }
                else if (usuarioTextBox.Text.Contains("ADMIN") || usuarioTextBox.Text.Contains("EQJ") || usuarioTextBox.Text.Contains("ETZ"))
                {
                    mvoSistema.servidor = "SQL8002.site4now.net";
                    mvoSistema.senha = "Setembro@344550";
                    mvoSistema.banco = "db_a932ec_novomundo";
                    mvoSistema.usuario = "db_a932ec_novomundo_admin";
                }
                else if (usuarioTextBox.Text.Contains("RAFAEL") || usuarioTextBox.Text.Contains("6868"))
                {
                    mvoSistema.servidor = "SQL8006.site4now.net";
                    mvoSistema.senha = "Setembro@344550";
                    mvoSistema.banco = "db_a932ec_italiplan";
                    mvoSistema.usuario = "db_a932ec_italiplan_admin";
                }
                else
                {
                    MessageBox.Show("Usuário ou senha inválido");
                    return;
                }

                mboSistema.AlterarConexao(mvoSistema);

                Properties.Settings.Default.Save();

            }
            catch (Exception ex)
            {
                MessageBox.Show(ex.Message, "SisConf", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }

        private void confirmarButton_Click(object sender, EventArgs e)
        {
            SetaBanco();

            var usuarios = Conexao.RetornaConexao().ExecuteScalar<int>($"SELECT COUNT(*) FROM USUARIO WHERE LOGIN='{usuarioTextBox.Text}' AND SENHA='{senhaTextBox.Text}';");
            if (usuarios == 0)
            {
                MessageBox.Show("Usuário ou senha estão inválidos", "Autenticação", MessageBoxButtons.OK,MessageBoxIcon.Exclamation);
                return;
            }

            Program.UsuarioLogado = usuarioTextBox.Text;

            new Form1(0).Show();
            this.Hide();

            if (chkMemorizarSenha.Checked == true)
            {
                Properties.Settings.Default.login = usuarioTextBox.Text;
                Properties.Settings.Default.senha = senhaTextBox.Text;
                Properties.Settings.Default.conexao = 0;
            }
            else
            {
                Properties.Settings.Default.login = "";
                Properties.Settings.Default.senha = "";
                Properties.Settings.Default.conexao = 0;
            }

            Properties.Settings.Default.Save();

        }
        private void cancelarButton_Click(object sender, EventArgs e)
        {
            Application.Exit();
        }

        private void FormLogin_Load(object sender, EventArgs e)
        {
            usuarioTextBox.Text = Properties.Settings.Default.login;
            senhaTextBox.Text = Properties.Settings.Default.senha;
            chkMemorizarSenha.Checked = (usuarioTextBox.Text != "" && senhaTextBox.Text != "");
        }

      }
}
