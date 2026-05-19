using System;
using System.Windows.Forms;
using Entidade;
using Negocio;

namespace App
{
    public partial class frmConfig : Form
    {
        public frmConfig()
        {
            InitializeComponent();
        }

        private void frmConfig_Load(object sender, EventArgs e)
        {
            voSistema mvoSistema = new voSistema();
            boSistema mboSistema = new boSistema();

            mvoSistema = mboSistema.ConsultarConexao();

            txtservidor.Text = mvoSistema.servidor;
            txtBanco.Text = mvoSistema.banco;
            txtusuario.Text = mvoSistema.usuario;
            txtsenha.Text = mvoSistema.senha;

            txtCodDestino.Text = Properties.Settings.Default.CdDestino.ToString();

        }

        private void btnSalvar_Click(object sender, EventArgs e)
        {
            voSistema mvoSistema = new voSistema();
            boSistema mboSistema = new boSistema();

            try
            {
                mvoSistema.servidor = txtservidor.Text;
                mvoSistema.banco = txtBanco.Text;
                mvoSistema.usuario = txtusuario.Text;
                mvoSistema.senha = txtsenha.Text;
                Properties.Settings.Default.CdDestino = Convert.ToInt16(txtCodDestino.Text);
                mboSistema.AlterarConexao(mvoSistema);

                Properties.Settings.Default.Save();

                this.Close();

            }
            catch (Exception ex)
            {
                MessageBox.Show(ex.Message, "SisConf", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }
    }
}
