using System;
using System.Data;
using System.Windows.Forms;
using Entidade;
using Negocio;

namespace App
{
    public partial class CadaGrup : Form
    {

        public string operacao { get; set; }

        int conexao;

        public CadaGrup(int conexao)
        {
            InitializeComponent();

            this.conexao = conexao;

            voUsuario mvoUsuario = new voUsuario();
            boUsuario mboUsuario = new boUsuario(conexao);

            cbousuario.DisplayMember = "Nome";
            cbousuario.ValueMember = "Id";
            cbousuario.DataSource = mboUsuario.Consultar(mvoUsuario);

        }

        private void CadaGrup_Load(object sender, EventArgs e)
        {

            if (!operacao.Equals("INCLUIR"))
            {
                if (operacao.Equals("CONSULTAR")) btnOk.Enabled = false;
                MontaTela();
            }
            else
            {
                txtId.Text = "0";

            }

        }

        private void MontaTela()
        {

            voGrupo mvoGrupo = new voGrupo();
            boGrupo mboGrupo = new boGrupo(conexao);

            int id = int.Parse(txtId.Text);

            mvoGrupo.Id = id;
            DataTable dt = mboGrupo.Consultar(mvoGrupo);

            if (dt.Rows.Count > 0)
            {
                if (!dt.Rows[0]["usuarioId"].ToString().Equals(""))
                {
                    cbousuario.SelectedValue = dt.Rows[0]["usuarioId"];
                }
                txtNmNome.Text = dt.Rows[0]["NmNome"].ToString();
            }
        }

        private void btnOk_Click(object sender, EventArgs e)
        {

            if (txtNmNome.Text.Trim().Equals(""))
            {
                MessageBox.Show("Nome inválido !", "Validação", MessageBoxButtons.OK, MessageBoxIcon.Error);
                txtNmNome.Focus();
                return;
            }

            if (cbousuario.SelectedValue == null)
            {
                MessageBox.Show("Usuário inválido !", "Validação", MessageBoxButtons.OK, MessageBoxIcon.Error);
                cbousuario.Focus();
                return;
            }           

            voGrupo mvoGrupo = new voGrupo();
            boGrupo mboGrupo = new boGrupo(conexao);

            mvoGrupo.NmNome = txtNmNome.Text;
            mvoGrupo.usuarioId = int.Parse(cbousuario.SelectedValue.ToString());

            if (operacao.Equals("INCLUIR"))
            {
                mboGrupo.Incluir(mvoGrupo);
            }
            else
            {
                mvoGrupo.Id = int.Parse(txtId.Text);
                mboGrupo.Alterar(mvoGrupo);
            }

            //Incluir na outra base
            //mboGrupo = new boGrupo(conexao == 0 ? 1 : 0);
            //if (operacao.Equals("INCLUIR"))
            //{
            //    mboGrupo.Incluir(mvoGrupo);
            //}
            //else
            //{
            //    mvoGrupo.Id = int.Parse(txtId.Text); ;
            //    mboGrupo.Alterar(mvoGrupo);
            //}

            this.DialogResult = DialogResult.OK;
            this.Close();

        }

        private void btnCancelar_Click(object sender, EventArgs e)
        {
            this.Close();
        }
    }
}
