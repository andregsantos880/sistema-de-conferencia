using System;
using System.Windows.Forms;
using Entidade;
using Negocio;

namespace App
{
    public partial class TabeGrup : Form
    {
        int conexao;

        public TabeGrup(int conexao)
        {
            InitializeComponent();

            this.conexao = conexao;
        }

        private void MontarView()
        {

            voGrupo mvoGrupo = new voGrupo();
            boGrupo mboGrupo = new boGrupo(conexao);

            dtlGeral.AutoGenerateColumns = false;
            dtlGeral.DataSource = mboGrupo.Consultar(mvoGrupo);

        }

        private void MnuConcultar_Click(object sender, EventArgs e)
        {

            if (dtlGeral.CurrentRow == null) return;

            CadaGrup f = new CadaGrup(conexao)
            {
                operacao = "CONSULTAR",
            };

            f.txtId.Text = dtlGeral.CurrentRow.Cells[0].Value.ToString();
            f.ShowDialog();
        }

        private void MnuAlterar_Click(object sender, EventArgs e)
        {

            if (dtlGeral.CurrentRow == null) return;

            CadaGrup f = new CadaGrup(conexao)
            {
                operacao = "ALTERAR",
            };
            f.txtId.Text = dtlGeral.CurrentRow.Cells[0].Value.ToString();
            f.ShowDialog();

            if (f.DialogResult == DialogResult.OK)
                MnuAtualizar.PerformClick();
        }

        private void MnuIncluir_Click(object sender, EventArgs e)
        {
            CadaGrup f = new CadaGrup(conexao)
            {
                operacao = "INCLUIR",
            };

            f.ShowDialog();
            if (f.DialogResult == DialogResult.OK)
                MnuAtualizar.PerformClick();

        }

        private void MnuAtualizar_Click(object sender, EventArgs e)
        {
            MontarView();
        }

        private void Tabe_KeyDown(object sender, KeyEventArgs e)
        {
            switch (e.KeyCode)
            {
                case Keys.F5: mnuIncluir.PerformClick();
                    break;
                case Keys.F6: MnuAlterar.PerformClick();
                    break;
                case Keys.F8: MnuConsultar.PerformClick();
                    break;
                case Keys.F11: MnuAtualizar.PerformClick();
                    break;
                //case Keys.F1: infoToolStripButton.PerformClick();
                // break;
                case Keys.Escape: this.Close();
                    break;
                default:
                    break;
            }
        }

        private void TabeGrup_Load(object sender, EventArgs e)
        {
            MontarView();
        }

        private void mnuExcluir_Click(object sender, EventArgs e)
        {

            if (dtlGeral.CurrentRow == null) return;

            if (MessageBox.Show("Excluir Grupo ?", "SisConf", MessageBoxButtons.YesNo, MessageBoxIcon.Question, MessageBoxDefaultButton.Button2) == DialogResult.No) return;

            voGrupo mvoGrupo = new voGrupo();
            mvoGrupo.Id = Convert.ToInt16(dtlGeral.CurrentRow.Cells["Id"].Value);

            boGrupo mboGrupo = new boGrupo(0);
            mboGrupo.Excluir(mvoGrupo);

            //mboGrupo = new boGrupo(1);
            //mboGrupo.Excluir(mvoGrupo);

            MnuAtualizar.PerformClick();

        }

        private void mnuEnviarMobile_Click(object sender, EventArgs e)
        {






        }
    }
}
