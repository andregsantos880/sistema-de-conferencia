using System;
using System.Data;
using System.Windows.Forms;
using Entidade;
using Negocio;

namespace App
{
    public partial class CadaLayouts : Form
    {
        int conexao;
        int id;

        public CadaLayouts(int conexao, int id)
        {
            InitializeComponent();

            this.conexao = conexao;

            this.id = id;

            MontaTela();
        }

        private void MontaTela()
        {

            voLayout mvoLayout = new voLayout();
            boLayout mboLayout = new boLayout(conexao);

           mvoLayout.ID = id;
            DataTable dt = mboLayout.Consultar(mvoLayout);
            if (dt.Rows.Count > 0)
            {
                txtId.Text = id.ToString();
                txtNmNome.Text = dt.Rows[0]["Nome"].ToString();
                txtConfOrder.Text = dt.Rows[0]["ConfOrder"].ToString();
            }

        }

        private void btnOk_Click(object sender, EventArgs e)
        {

            voLayout mvoLayout = new voLayout();
            boLayout mboLayout = new boLayout(conexao);

            mvoLayout.Nome = txtNmNome.Text;
            mvoLayout.ID = int.Parse(txtId.Text);
            mvoLayout.ConfOrder = int.Parse(txtConfOrder.Text);
            mboLayout.Alterar(mvoLayout);

            this.DialogResult = DialogResult.OK;
            this.Close();

        }

        private void btnCancelar_Click(object sender, EventArgs e)
        {
            this.Close();
        }

    }
}
