using System;
using System.Data;
using System.Windows.Forms;
using System.Net;
using Negocio;
using Entidade;

namespace App
{
    public partial class frmImportWeb : Form
    {
        int conexao;

        public frmImportWeb(int conexao)
        {
            InitializeComponent();
            this.conexao = conexao;
        }

        private void btnAtualizar_Click(object sender, EventArgs e)
        {

            voPedido mvoPedido = new voPedido();
            boPedido mboPedido = new boPedido(conexao);

            WebClient wc = new WebClient();

            string web = wc.DownloadString("http://request.cyrax.com.br/getCarga.php?CdDestino=" + Properties.Settings.Default.CdDestino);
            string[] linha = web.Split('|');
            string[] col = null;

            dtlGeral.Rows.Clear();
            foreach (var item in linha)
            {
                col = item.Split(';');
                if (col.Length > 5)
                {
                    mvoPedido.ARQUIVO = col[0];
                    DataTable dt = mboPedido.Consultar(mvoPedido);
                    if (dt.Rows.Count > 0)
                        dtlGeral.Rows.Add(col[0], Properties.Resources.bandeira_verde, false, col[1], col[2], col[3], col[4], col[5], col[6], col[7], col[8]);
                    else
                        dtlGeral.Rows.Add(col[0], Properties.Resources.bandeira_branca, false, col[1], col[2], col[3], col[4], col[5], col[6], col[7], col[8]);
                }
            }

            btnBaixar.Enabled = (dtlGeral.Rows.Count > 0);
        }
        
        private void btnBaixar_Click(object sender, EventArgs e)
        {

            voArquivo mvoArquivo = new voArquivo();
            boArquivo mboArquivo = new boArquivo(conexao);

            WebClient wc = new WebClient();

            bool processado = false;

            progressImport.Visible = true;
            progressImport.Maximum = dtlGeral.RowCount;

            try
            {
                dtlGeral.CommitEdit(DataGridViewDataErrorContexts.Commit );
                foreach (DataGridViewRow item in dtlGeral.Rows)
                {
                    if (Convert.ToBoolean(item.Cells["Processar"].Value) == false) continue;
                    //String arquivo = System.IO.Path.Combine(Properties.Settings.Default.SharedFolder, string.Format("{0}_{1}_{2:ddMMyy}", item.Cells["layout"].Value.ToString(), item.Cells["carga"].Value.ToString(), DateTime.Parse(item.Cells["dataCarga"].Value.ToString())));

                   // wc.DownloadFile(item.Cells["linkBaixa"].Value.ToString(), arquivo);

                    mvoArquivo.layout = int.Parse(item.Cells["layoutId"].Value.ToString());
                    //mvoArquivo.caminho = arquivo;
                    mboArquivo.CarregarArquivo(mvoArquivo);

                    wc.DownloadString(item.Cells["linkArquivo"].Value.ToString());

                    progressImport.Increment(1);

                    item.Cells["pic"].Value = Properties.Resources.bandeira_verde;
                    processado = true;
                    Application.DoEvents();

                }

                btnBaixar.Enabled = (dtlGeral.Rows.Count > 0);

                if (processado) MessageBox.Show("Operação concluída com exito !", "SisConf");

            }
            catch (Exception ex)
            {
                MessageBox.Show("Falha ao processar os arquivos /n" + ex.Message, "SisConf");

            }

            progressImport.Visible = false;
        }

        private void btnAdiconar_Click(object sender, EventArgs e)
        {

            System.Diagnostics.Process p = new System.Diagnostics.Process();
            System.Diagnostics.Process.Start("http://request.cyrax.com.br");
         
        }

        private void dtlGeral_SelectionChanged(object sender, EventArgs e)
        {
            txtObservacao.Text = dtlGeral.CurrentRow.Cells["observacao"].Value.ToString();
        }

    }
}
