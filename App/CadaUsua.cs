using System;
using System.Data;
using System.Windows.Forms;
using Entidade;
using Negocio;

namespace App
{
    public partial class CadaUsua : Form
    {

        public string operacao { get; set; }

        int conexao;

        public CadaUsua(int conexao)
        {
            InitializeComponent();

            this.conexao = conexao;

        }

        private void CadaMidiForm_Load(object sender, EventArgs e)
        {
            MontaCombos();

            if (!operacao.Equals("INCLUIR"))
            {
                if (operacao.Equals("CONSULTAR")) btnOk.Enabled = false;
                MontaTela();
            }
            else
            {
                txtcodigo.Text = "0";

            }

        }

        private void MontaCombos()
        {
            cbonivel.Items.Add("ADMINISTRATIVO");
            cbonivel.Items.Add("OPERAÇÃO");
        }

        private void MontaTela()
        {

            voUsuario mvoUsuario = new voUsuario();
            boUsuario mboUsuario = new boUsuario(conexao);

            int id = int.Parse(txtcodigo.Text);

            mvoUsuario.ID = id;
            DataTable dt = mboUsuario.Consultar(mvoUsuario);

            if (dt.Rows.Count > 0)
            {
                txtnome.Text = dt.Rows[0]["NOME"].ToString();
                txtlogin.Text = dt.Rows[0]["LOGIN"].ToString();
                cbonivel.Text = dt.Rows[0]["NIVEL"].ToString();
                txtsenha.Text = dt.Rows[0]["SENHA"].ToString();

            }

        }

        private void btnOk_Click(object sender, EventArgs e)
        {

            if (txtnome.Text.Trim().Equals(""))
            {
                MessageBox.Show("Nome inválido !", "Validação", MessageBoxButtons.OK, MessageBoxIcon.Error);
                txtnome.Focus();
                return;
            }

            if (txtlogin.Text.Trim().Equals(""))
            {
                MessageBox.Show("Login inválido !", "Validação", MessageBoxButtons.OK, MessageBoxIcon.Error);
                txtlogin.Focus();
                return;
            }

            if (cbonivel.Text.Trim().Equals(""))
            {
                MessageBox.Show("Nível inválido !", "Validação", MessageBoxButtons.OK, MessageBoxIcon.Error);
                cbonivel.Focus();
                return;
            }

            voUsuario mvoUsuario = new voUsuario();
            boUsuario mboUsuario = new boUsuario(conexao);

            mvoUsuario.NOME = txtnome.Text;
            mvoUsuario.LOGIN = txtlogin.Text;
            mvoUsuario.NIVEL = cbonivel.Text;
            mvoUsuario.SENHA = txtsenha.Text;

            if (operacao.Equals("INCLUIR"))
            {
                mboUsuario.Incluir(mvoUsuario);
            }
            else
            {
                mvoUsuario.ID = int.Parse(txtcodigo.Text); ;
                mboUsuario.Alterar(mvoUsuario);
            }

            //Incluir na outra base
            /*
            mboUsuario = new boUsuario(conexao == 0 ? 1 : 0);
            if (operacao.Equals("INCLUIR"))
            {
                mboUsuario.Incluir(mvoUsuario);
            }
            else
            {
                mvoUsuario.ID = int.Parse(txtcodigo.Text); ;
                mboUsuario.Alterar(mvoUsuario);
            }
            */

            this.DialogResult = DialogResult.OK;
            this.Close();

        }

        private void btnCancelar_Click(object sender, EventArgs e)
        {
            this.Close();
        }
    }
}
