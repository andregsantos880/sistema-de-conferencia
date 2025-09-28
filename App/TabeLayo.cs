using System;
using System.Linq;
using System.Text;
using System.IO;
using System.Windows.Forms;
using Negocio;
using Entidade;
using Entidade.Importar;
using Persistencia;
using App.Models;
using Dapper;
using System.Collections.Generic;

namespace App
{
    public partial class TabeLayo : Form
    {
        int conexao;
        List<PedidoImport> pedidoImports = new List<PedidoImport>();

        public TabeLayo(int conexao)
        {
            InitializeComponent();

            this.conexao = conexao;

        }

        private void TabeLayo_Load(object sender, EventArgs e)
        {
            using (var connection = Conexao.CreateConnection())
            {
                var fabricas = connection.Query<Fabrica>("SELECT NOME, CONTROLE FROM LAYOUT WHERE LAYOUT.FlAtivo = 1;").ToList();
                cboLayout.Items.Add(new Fabrica("SELECIONE A FABRICA", 0));
                foreach (var item in fabricas)
                {
                    cboLayout.Items.Add(item);
                }
            }
            cboLayout.SelectedIndex = 0;

            this.Height = 95;
        }

        private void Importar(int IdLayout, string fileName, string cFile)
        {
            this.Height = 143;

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
                progressBarImportacao.Maximum = Convert.ToInt32(sr.BaseStream.Length);

                while (sr.Peek() != -1)
                {
                    Application.DoEvents();
                    string linha = sr.ReadLine();
                    arquivoIm.ArquivoItens.Add(new voArquivoImItens()
                    {
                        Linha = linha
                    });
                    progressBarImportacao.Value += linha.Length;
                    lblProgressImportacao.Text = $"{Math.Round(Convert.ToDecimal(progressBarImportacao.Value) / Convert.ToDecimal(progressBarImportacao.Maximum) * 100, 2)}% Iniciando a leitura do arquivo 1/2...";
                    lblProgressImportacao.Refresh();
                    Application.DoEvents();
                }
                sr.Close();

                mboPedido.CarregarDados(arquivoIm, (max, value, pedidoImport) =>
                {
                    if (pedidoImport == null)
                    {
                        Application.DoEvents();
                        progressBarImportacao.Maximum = max;
                        progressBarImportacao.Value = value;
                        lblProgressImportacao.Text = $"{Math.Round(Convert.ToDecimal(progressBarImportacao.Value) / Convert.ToDecimal(progressBarImportacao.Maximum) * 100, 2)}% Iniciando a leitura do arquivo 2/2...";
                        lblProgressImportacao.Refresh();
                        Application.DoEvents();
                    }
                    else
                    {
                        var clientes = pedidoImport.OrderBy(o => o.CLIENTE).Select(s => s.CLIENTE).Distinct();
                        foreach (var item in clientes)
                            checkedListBoxLojas.Items.Add(item, false);

                        pedidoImports = pedidoImport;
                    }
                });

                lblProgressImportacao.Text = "100% Leitura concluída com sucesso.";

                this.Height = 316;

            }
            catch (IOException ex)
            {
                lblProgressImportacao.Text = $"Erro de IO: {ex.Message}";
            }
            catch (Exception ex)
            {
                lblProgressImportacao.Text = $"Erro de IO: {ex.Message}";
            }
        }

        private void btnInportar_Click(object sender, EventArgs e)
        {

            OpenFileDialog dg = new OpenFileDialog();
            StreamReader sd;

            try
            {

                StringBuilder cQuery = new StringBuilder();

                dg.Filter = "(*.txt, csv, .not)|*.txt;*.csv;*.not";
                dg.Multiselect = true;
                dg.ShowDialog();

                if (dg.FileName == "")
                    return;

                var cFile = dg.FileName;

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

                FileInfo fe = new FileInfo(cFile);
                var fileName = $"{fe.Name} - {Guid.NewGuid()}";

                int IdLayout = ((Fabrica)cboLayout.SelectedItem).Controle;

                Importar(IdLayout, fileName, cFile);

            }
            catch (Exception ex)
            {
                MessageBox.Show(ex.Message.ToString(), "SisConf", MessageBoxButtons.OK, MessageBoxIcon.Exclamation);
            }

        }

        private void cboLayout_SelectedIndexChanged(object sender, EventArgs e)
        {
            int IdLayout = ((Fabrica)cboLayout.SelectedItem).Controle;
            btnImportar.Enabled = (IdLayout > 0);
        }

        private void buttonIncluirLojasSelecionadas_Click(object sender, EventArgs e)
        {

            if (checkedListBoxLojas.CheckedItems.Count == 0)
            {
                MessageBox.Show("É necessário selecionar as lojas que deseja importar.", "Sistema de conferência", MessageBoxButtons.OK, MessageBoxIcon.Exclamation);
                return;
            }

            var daPedido = new daPedido(0);
            List<string> lojasSelecionadas = new List<string>();
            try
            {
                foreach (var item in checkedListBoxLojas.CheckedItems)
                {
                    lojasSelecionadas.Add(item.ToString());
                }

                daPedido.InserirBulk<PedidoImport>(pedidoImports.Where(x=> lojasSelecionadas.Contains(x.CLIENTE)).ToList());

                MessageBox.Show("Importação concluída com sucesso", "Sistema de conferência", MessageBoxButtons.OK, MessageBoxIcon.Information);

                Close();

            }
            catch (Exception ex)
            {
                MessageBox.Show(ex.Message.ToString(), "SisConf", MessageBoxButtons.OK, MessageBoxIcon.Exclamation);
            }
        }
    }
}
