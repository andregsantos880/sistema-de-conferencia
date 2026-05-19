using System;
using System.Windows.Forms;
using Entidade;
using Negocio;

namespace App
{
    public partial class TabeUsua : Form
    {
        int conexao;

        public TabeUsua(int conexao)
        {
            InitializeComponent();

            this.conexao = conexao;
        }

        private void MontarView()
        {

            voUsuario mvoUsuario = new voUsuario();
            boUsuario mboUsuario = new boUsuario(conexao);

            dtlGeral.AutoGenerateColumns = false;
            dtlGeral.DataSource = mboUsuario.Consultar(mvoUsuario);

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

        private void TabeMidi_Load(object sender, EventArgs e)
        {
            MontarView();
        }

        private void mnuIncluir_Click(object sender, EventArgs e)
        {
            CadaUsua f = new CadaUsua(conexao)
            {
                operacao = "INCLUIR",
            };

            f.ShowDialog();

            if (f.DialogResult == DialogResult.OK)
                MnuAtualizar.PerformClick();
        }

        private void MnuAlterar_Click(object sender, EventArgs e)
        {
            if (dtlGeral.CurrentRow == null) return;

            CadaUsua f = new CadaUsua(conexao)
            {
                operacao = "ALTERAR",
            };
            f.txtcodigo.Text = dtlGeral.CurrentRow.Cells[0].Value.ToString();
            f.ShowDialog();

            if (f.DialogResult == DialogResult.OK)
                MnuAtualizar.PerformClick();

        }

        private void MnuConsultar_Click(object sender, EventArgs e)
        {
            if (dtlGeral.CurrentRow == null) return;

            CadaUsua f = new CadaUsua(conexao)
            {
                operacao = "CONSULTAR",
            };

            f.txtcodigo.Text = dtlGeral.CurrentRow.Cells[0].Value.ToString();
            f.ShowDialog();
        }

        private void mnuExcluir_Click(object sender, EventArgs e)
        {
            if (dtlGeral.CurrentRow == null) return;

            if (MessageBox.Show("Excluir usuário ?", "SisConf", MessageBoxButtons.YesNo, MessageBoxIcon.Question, MessageBoxDefaultButton.Button2) == DialogResult.No) return;

            voUsuario mvoUsuario = new voUsuario();
            mvoUsuario.ID = Convert.ToInt16(dtlGeral.CurrentRow.Cells["ID"].Value); 

            boUsuario mboUsuario = new boUsuario(0);
            mboUsuario.Excluir(mvoUsuario);

            //mboUsuario = new boUsuario(1);
            //mboUsuario.Excluir(mvoUsuario);

            MnuAtualizar.PerformClick();
        }

        private void MnuAtualizar_Click(object sender, EventArgs e)
        {
            MontarView();
        }
    }
}
