using System;
using System.Windows.Forms;
using Entidade;
using Negocio;

namespace App
{
    public partial class TabeLayouts : Form
    {
        int conexao;

        public TabeLayouts(int conexao)
        {
            InitializeComponent();

            this.conexao = conexao;
        }

        private void MontarView()
        {

            voLayout mvoLayout = new voLayout();
            boLayout mboLayout = new boLayout(conexao);

            dtlGeral.AutoGenerateColumns = false;
            dtlGeral.DataSource = mboLayout.Consultar(mvoLayout);

        }

        private void MnuAlterar_Click(object sender, EventArgs e)
        {

            if (dtlGeral.CurrentRow == null) return;

            CadaLayouts f = new CadaLayouts(conexao, int.Parse(dtlGeral.CurrentRow.Cells[0].Value.ToString()));
            f.ShowDialog();

            MontarView();

        }

        private void TabeLayouts_Load(object sender, EventArgs e)
        {
            MontarView();
        }
   }
}
