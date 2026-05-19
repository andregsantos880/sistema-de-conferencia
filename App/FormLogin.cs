using System;
using System.Data;
using System.Windows.Forms;
using System.Data.SqlClient;
using Entidade;
using Negocio;

namespace App
{
    public partial class FormLogin : Form
    {
        public FormLogin()
        {
            InitializeComponent();
                        
        }

        private void confirmarButton_Click(object sender, EventArgs e)
        {
            int conexao = cboModo.SelectedIndex;

            voUsuario mvoUsuario = new voUsuario();
            boUsuario mboUsuario = new boUsuario(conexao);
            Form1 cFom;

            try
            {
                mvoUsuario.LOGIN = usuarioTextBox.Text;
                mvoUsuario.SENHA = senhaTextBox.Text;
                DataTable dt = mboUsuario.Consultar(mvoUsuario);
                if (dt.Rows.Count > 0)
                {

                    Util.nivel = dt.Rows[0]["NIVEL"].ToString().Equals("ADMINISTRATIVO") ? 1 : 0;

                    cFom = new Form1(conexao);
                    cFom.Show();
                    this.Hide();

                    if (chkMemorizarSenha.Checked == true)
                    {
                        Properties.Settings.Default.login = usuarioTextBox.Text;
                        Properties.Settings.Default.senha = senhaTextBox.Text;
                        Properties.Settings.Default.conexao = cboModo.SelectedIndex;

                    }
                    else
                    {
                        Properties.Settings.Default.login = "";
                        Properties.Settings.Default.senha = "";
                        Properties.Settings.Default.conexao = 0;
                    }

                    Properties.Settings.Default.usuarioId = int.Parse(dt.Rows[0]["ID"].ToString());
                    Properties.Settings.Default.Save();

                    
                    try
                    {
                        /*
                        //Atualiza base de dados
                        voSistema mvoSistema = new voSistema();
                        boSistema mboSistema = new boSistema();

                        mvoSistema.conexao = conexao;
                        mboSistema.AtualizarBase(mvoSistema);
                        */
                    }
                    catch (Exception) { }

                }
                else
                {
                    MessageBox.Show("Usuário ou senha inválido !", "SisConf", MessageBoxButtons.OK, MessageBoxIcon.Error);
                }

            }
            catch (SqlException ex)
            {
                MessageBox.Show(ex.Message, "SisConf");
            }

        }
        private void cancelarButton_Click(object sender, EventArgs e)
        {
            Application.Exit();
        }

        private void FormLogin_Load(object sender, EventArgs e)
        {

            cboModo.Items.Add("Logar no servidor");
            cboModo.Items.Add("Logar local");

            usuarioTextBox.Text = Properties.Settings.Default.login;
            senhaTextBox.Text = Properties.Settings.Default.senha;
            cboModo.SelectedIndex =  0;

            chkMemorizarSenha.Checked = (usuarioTextBox.Text != "" && senhaTextBox.Text != "");

        }

        private void btnConfig_Click(object sender, EventArgs e)
        {
            frmConfig cForm = new frmConfig();
            cForm.ShowDialog();
        }

        private void label1_Click(object sender, EventArgs e)
        {

        }
    }
}
