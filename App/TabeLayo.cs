using System;
using System.Linq;
using System.Text;
using System.IO;
using System.Windows.Forms;
using Negocio;
using Entidade;
using Entidade.Importar;

namespace App
{
    public partial class TabeLayo : Form
    {
        int conexao;

        public TabeLayo(int conexao)
        {
            InitializeComponent();

            this.conexao = conexao;

        }

        private void TabeLayo_Load(object sender, EventArgs e)
        {

            voLayout mvoLayout = new voLayout();
            boLayout mboLayout = new boLayout(conexao);

            cboLayout.DataSource = mboLayout.Consultar(mvoLayout);
            cboLayout.DisplayMember = "Nome";
            cboLayout.ValueMember = "Controle";
        }

        private void Importar(int IdLayout, string fileName, string cFile)
        {
            try
            {
                boPedido mboPedido = new boPedido(conexao);
                voPedido mvoPedido = new voPedido();
                voArquivoIm arquivoIm = new voArquivoIm()
                {
                    FileName = fileName,
                    LayoutId = IdLayout
                };

                StreamReader sr = new StreamReader(cFile, Encoding.ASCII);
                while (sr.Peek() != -1)
                    arquivoIm.ArquivoItens.Add(new voArquivoImItens()
                    {
                        Linha = sr.ReadLine()
                    });
                sr.Close();

                mboPedido.Inserir(arquivoIm);
                mvoPedido.ARQUIVO = fileName;
                mboPedido.Atualizar(mvoPedido);

            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        private void btnInportar_Click(object sender, EventArgs e)
        {

            string fileName = "";
            string cFile = "";

            System.Windows.Forms.OpenFileDialog dg = new System.Windows.Forms.OpenFileDialog();
            StreamReader sd;

            try
            {

                StringBuilder cQuery = new StringBuilder();

                dg.Filter = "(*.txt, csv, .not)|*.txt;*.csv;*.not";
                dg.Multiselect = true;
                dg.ShowDialog();

                if (dg.FileName == "")
                    return;

                cFile = dg.FileName;

                if (dg.FileNames.Length > 1)
                {
                    if (MessageBox.Show("Existe mais de um arquivo selecionado." + Environment.NewLine + "Agrupar todos arquivos em uma carga ?", "Importar", MessageBoxButtons.YesNo, MessageBoxIcon.Question, MessageBoxDefaultButton.Button2) == DialogResult.No)
                        return;

                    cFile = Path.Combine(Directory.GetCurrentDirectory(), "Layouts");
                    cFile = Path.Combine(cFile, "tmp.txt");
                    StreamWriter sw = new StreamWriter(cFile);
                    foreach (var item in dg.FileNames)
                    {
                        StringBuilder sb = new StringBuilder();
                        sd = new StreamReader(item.ToString(), Encoding.ASCII);
                        while (sd.Peek() != -1)
                            sw.WriteLine(sd.ReadLine());
                        sd.Close();

                    }
                    sw.Close();
                }

                OpcTextoForm f = new OpcTextoForm();
                foreach (var item in dg.FileNames.Take(1))
                {
                    FileInfo fi = new FileInfo(item.ToString());
                    f.txtValor.Text = fi.Name;
                }

                f.ShowDialog();
                if (f.DialogResult != DialogResult.OK)
                    return;

                FileInfo fe = new FileInfo(cFile);
                fileName = fe.Name.Replace(fe.Name, f.txtValor.Text);

                int IdLayout = int.Parse(cboLayout.SelectedValue.ToString());

                Importar(IdLayout, fileName, cFile);

                MessageBox.Show("Concluido !", "SisConf", MessageBoxButtons.OK, MessageBoxIcon.Information);

            }
            catch (Exception ex)
            {
                MessageBox.Show(ex.Message.ToString(), "SisConf", MessageBoxButtons.OK, MessageBoxIcon.Exclamation);
            }

        }

    }
}
