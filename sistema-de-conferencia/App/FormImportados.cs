using System;
using System.Data;
using System.Text;
using System.Windows.Forms;
using System.Net;
using Entidade;
using Negocio;
using System.IO;

namespace App
{
    public partial class frmImportacao : Form
    {

        int conexao;

        public voPedido mvoPedido = new voPedido();

        public frmImportacao(int conexao)
        {
            InitializeComponent();
            this.conexao = conexao;
            if (conexao == 1)
            {
                btnAdicionar.Enabled = false;
                cboGrupo.Enabled = false;
                btnArquivar.Enabled = false;
                tabPage2.Enabled = false;
            }
        }

        private void FormImportados_Load(object sender, EventArgs e)
        {

            /*
            voPedido mvoPedido = new voPedido();
            listarImportacao(mvoPedido);
            */

            //monta grupos
            voGrupo mvoGrupo = new voGrupo();
            boGrupo mboGrupo = new boGrupo(conexao);
            cboGrupo.DataSource = mboGrupo.Consultar(mvoGrupo);
            cboGrupo.DisplayMember = "NmNome";
            cboGrupo.ValueMember = "Id";
            cboGrupo.SelectedIndex = -1;
        }

        private void listarImportacao(voPedido mvoPedido)
        {

            boPedido mboPedido = new boPedido(conexao);

            DataTable dt = mboPedido.ConsultarImportacao(mvoPedido);
            dtlGeral.Rows.Clear();
            foreach (DataRow item in dt.Rows)
            {
                dtlGeral.Rows.Add(false, item["ARQUIVO"], item["IdLayout"], item["NmLayout"], item["DATAINC"]);
            }

        }

        private void listarImportacaoArq(voPedido mvoPedido)
        {

            boPedido mboPedido = new boPedido(conexao);

            DataTable dt = mboPedido.ConsultarImportacaoArq(mvoPedido);
            gridArquivados.Rows.Clear();
            foreach (DataRow item in dt.Rows)
            {
                gridArquivados.Rows.Add(false, item["ARQUIVO"], item["IdLayout"], item["NmLayout"], item["DATAINC"]);
            }

        }

        private void btnPedBusca_Click(object sender, EventArgs e)
        {

            mvoPedido = new voPedido();

            if (txtpedBusca.Text != "")
                mvoPedido.PECLIENTE = txtpedBusca.Text;

            if (cboGrupo.SelectedItem != null)
                mvoPedido.IdGrupo = Convert.ToInt32(cboGrupo.SelectedValue.ToString());

            listarImportacao(mvoPedido);

        }

        private void BtnAdiconar_Click(object sender, EventArgs e)
        {
            frmImportWeb cForm = new frmImportWeb(conexao);
            cForm.ShowDialog();


            listarImportacao(mvoPedido);
        }

        private void btnAbrir_Click(object sender, EventArgs e)
        {

            if (dtlGeral.RowCount == 0) return;
            dtlGeral.EndEdit();

            mvoPedido.ARQUIVO = "";
            foreach (DataGridViewRow item in dtlGeral.Rows)
                if (item.Cells["ck"].Value != null && item.Cells["ck"].Value.ToString() == "1")
                    mvoPedido.ARQUIVO += item.Cells["Arquivo"].Value + ",";

            if (mvoPedido.ARQUIVO == "")
            {
                MessageBox.Show("Selecione o item da lista !", "SisConf", MessageBoxButtons.OK, MessageBoxIcon.Exclamation);
                return;
            }

            // Envia criterios de busca para area de conferencia
            Program.mvoPedido = mvoPedido;

            this.DialogResult = DialogResult.OK;
            this.Close();

        }

        private void mnuArquivar_Click(object sender, EventArgs e)
        {


 
        }

        private void btnAtualizar_Click(object sender, EventArgs e)
        {
            btnAtualizar.Enabled = false;

            listarImportacao(new voPedido());

            btnAtualizar.Enabled = true;

        }

        private void btnDesarquivar_Click(object sender, EventArgs e)
        {
            if (gridArquivados.CurrentRow == null) return;

            if (MessageBox.Show("Desarquivar seleção ?", "SisConf", MessageBoxButtons.YesNo, MessageBoxIcon.Question, MessageBoxDefaultButton.Button2) == DialogResult.No) return;

            voPedido mvoPedido = new voPedido();
            boPedido mboPedido = new boPedido(conexao);

            gridArquivados.EndEdit();

            foreach (DataGridViewRow item in gridArquivados.Rows)
            {
                if (item.Cells["ckArq"].Value != null && item.Cells["ckArq"].Value.ToString() == "1")
                {
                    mvoPedido.ARQUIVO = item.Cells["ArquivoArq"].Value.ToString();
                    mboPedido.Desarquivar(mvoPedido);
                }
            }

            foreach (DataGridViewRow item in gridArquivados.Rows)
                if (item.Cells["ckArq"].Value != null && item.Cells["ckArq"].Value.ToString() == "1")
                    gridArquivados.Rows.Remove(item);

            btnPedBuscaArq.PerformClick();
                                    
        }

        private void btnPedBuscaArq_Click(object sender, EventArgs e)
        {

            mvoPedido = new voPedido();

            if (txtpedBuscaArq.Text != "")
                mvoPedido.PECLIENTE = txtpedBuscaArq.Text;

             listarImportacaoArq(mvoPedido);
        }

        private void btnArquivar_Click(object sender, EventArgs e)
        {

            if (dtlGeral.CurrentRow == null) return;

            if (MessageBox.Show("Arquivar seleção ?", "SisConf", MessageBoxButtons.YesNo, MessageBoxIcon.Question, MessageBoxDefaultButton.Button2) == DialogResult.No) return;

            voPedido mvoPedido = new voPedido();
            boPedido mboPedido = new boPedido(conexao);

            dtlGeral.EndEdit();

            foreach (DataGridViewRow item in dtlGeral.Rows)
            {
                if (item.Cells["ck"].Value != null && item.Cells["ck"].Value.ToString() == "1")
                {
                    mvoPedido.ARQUIVO = item.Cells["Arquivo"].Value.ToString();
                    mboPedido.Arquivar(mvoPedido);
                }
            }

            foreach (DataGridViewRow item in dtlGeral.Rows)
                if (item.Cells["ck"].Value != null && item.Cells["ck"].Value.ToString() == "1")
                    dtlGeral.Rows.Remove(item);

            btnPedBusca.PerformClick();

        }

    }
}
