using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Windows.Forms;
using System.Drawing;
using System.Threading.Tasks;
using System.Reflection;
using Persistencia;
using Dapper;
using App.Models;
using Microsoft.ServiceBus.Messaging;
using System.Net;
using System.IO;
using Newtonsoft.Json;

namespace App
{
    public partial class Form1 : Form
    {

        #region "Variáveis"

        int conexao;

        #endregion

        #region "Métodos"

        private void MontarGrid(List<Pedido> pedidos)
        {
            dtlGeral.Rows.Clear();
            foreach (var pedido in pedidos)
            {
                AdicionarPedidoNaGrid(pedido);
            }
            AtualizarGrid();
        }

        private void AdicionarPedidoNaGrid(Pedido pedido)
        {
            dtlGeral.Rows.Add(
                pedido.Id,
                pedido.Arquivo,
                pedido.Nmlayout,
                pedido.IdLayout,
                pedido.OrdCompra,
                pedido.Cliente,
                pedido.PeCliente,
                pedido.Produto,
                pedido.Descricao1,
                pedido.Qtde,
                pedido.Etiqueta,
                pedido.Sequencia,
                pedido.Volume,
                pedido.DsStatus,
                pedido.Status,
                pedido.IdBox,
                pedido.Box,
                false,
                pedido.PeComputador
            );
        }

        private void AtualizarGrid()
        {
            int normal = dtlGeral.Rows.OfType<DataGridViewRow>().Count(x => x.Cells["status"].Value.ToString() == "0");
            int conferido = dtlGeral.Rows.OfType<DataGridViewRow>().Count(x => x.Cells["status"].Value.ToString() == "1");
            int saida = dtlGeral.Rows.OfType<DataGridViewRow>().Count(x => x.Cells["status"].Value.ToString() == "2");
            int entrega = dtlGeral.Rows.OfType<DataGridViewRow>().Count(x => x.Cells["status"].Value.ToString() == "3");

            normalToolStripStatusLabel.Text = normal.ToString();
            conferidoToolStripStatusLabel.Text = conferido.ToString();
            saidaToolStripStatusLabel.Text = saida.ToString();
            entregaToolStripStatusLabel.Text = entrega.ToString();

            normalLabel.Text = normal.ToString();
            conferidoLabel.Text = conferido.ToString();
            saidaLabel.Text = saida.ToString();
            entregaLabel.Text = entrega.ToString();
        }

        private bool ValidaRestante()
        {
            int status = conferenciaComboBox.SelectedIndex;
            var statusAtual = dtlGeral.Rows.OfType<DataGridViewRow>().Count(x => x.Cells["status"].Value.ToString() != status.ToString());
            var statusSeguinte = dtlGeral.Rows.OfType<DataGridViewRow>().Count(x => x.Cells["status"].Value.ToString() == (status + 1).ToString());

            lblRestatnte.Text = "Restante: " + statusSeguinte + " de " + (statusAtual + statusSeguinte);

            return (statusSeguinte == (statusAtual + statusSeguinte));
        }

        private void ChecarEtiqueta()
        {
            string cSom = "";

            clienteLabel.Text = "";
            produtoLabel.Text = "";
            boxLabel.Text = "";

            etiquetaTextBox.UseSystemPasswordChar = true;

            if (etiquetaTextBox.Text.Length == 0) return;

            var linhaEncontrada = Consultar(etiquetaTextBox.Text);
            if (linhaEncontrada != null)
            {
                if (linhaEncontrada.Cells["status"].Value.ToString().Equals(conferenciaComboBox.SelectedIndex.ToString()))
                {
                    clienteLabel.Text = "Etiqueta já lida !";
                    produtoLabel.Text = linhaEncontrada.Cells["DESCRICAO1"].Value.ToString();
                    boxLabel.Text = "BOX 1";
                    cSom = "Exclamation";
                }
                else if (linhaEncontrada.Cells["status"].Value.ToString().Equals((conferenciaComboBox.SelectedIndex - 1).ToString()))
                {

                    clienteLabel.Text = linhaEncontrada.Cells["CLIENTE"].Value.ToString();
                    produtoLabel.Text = linhaEncontrada.Cells["DESCRICAO1"].Value.ToString();
                    boxLabel.Text = "BOX 1";

                    linhaEncontrada.Cells["status"].Value = conferenciaComboBox.SelectedIndex.ToString();

                    var pedidoSend = new PedidoSB()
                    {
                        Etiqueta = etiquetaTextBox.Text.Trim(),
                        FabricaId = ((Fabrica)cboFabrica.SelectedItem).Controle,
                        StatusId = linhaEncontrada.Cells["status"].Value.ToString()
                    };

                    //SendMessagesAsync(Properties.Settings.Default.connectionString, Properties.Settings.Default.queueName, pedidoSend)
                    //    .GetAwaiter();

                    if (linhaEncontrada.Cells["status"].Value.ToString() == "1")
                    {
                        linhaEncontrada.DefaultCellStyle.BackColor = Color.LightGreen;
                        linhaEncontrada.Cells["DsStatus"].Value = "CONFERENCIA";
                    }
                    if (linhaEncontrada.Cells["status"].Value.ToString() == "2")
                    {
                        linhaEncontrada.DefaultCellStyle.BackColor = Color.LightCoral;
                        linhaEncontrada.Cells["DsStatus"].Value = "SAIDA";
                    }
                    if (linhaEncontrada.Cells["status"].Value.ToString() == "3")
                    {
                        linhaEncontrada.DefaultCellStyle.BackColor = Color.Blue;
                        linhaEncontrada.Cells["DsStatus"].Value = "ENTREGA";
                    }

                    cSom = "success";

                    AtualizarGrid();
                    if (ValidaRestante())
                    {
                        cSom = "Air_Horn";
                    }
                }
                else
                {
                    clienteLabel.Text = "Esta etiqueta está para " + linhaEncontrada.Cells["DsStatus"].Value.ToString();
                    produtoLabel.Text = linhaEncontrada.Cells["DESCRICAO1"].Value.ToString();
                    boxLabel.Text = "BOX 1";
                    cSom = "ringout";
                }
            }
            else
            {
                clienteLabel.Text = "Etiqueta não encontrada !";
                cSom = "Error";
            }

            System.Media.SoundPlayer mySom = new System.Media.SoundPlayer(Util.GetSom(cSom));
            mySom.Play();

            if (cSom == "Error")
            {
                etiquetaTextBox.ReadOnly = true;
            inicio:
                if (MessageBox.Show("Etiqueta não encontrada ! \nContinuar conferindo ?", "ATENÇÃO", MessageBoxButtons.YesNo, MessageBoxIcon.Error, MessageBoxDefaultButton.Button2) == DialogResult.No) goto inicio;
                etiquetaTextBox.ReadOnly = false;
            }

            etiquetaTextBox.Focus();
            etiquetaTextBox.SelectAll();

        }
        private DataGridViewRow Consultar(string etiqueta)
        {
            return dtlGeral.Rows.OfType<DataGridViewRow>().Where(x => x.Cells["Etiqueta"].Value.ToString().Trim() == etiqueta).FirstOrDefault();
        }

        #endregion

        #region "Eventos"

        public Form1(int conexao)
        {

            InitializeComponent();

            this.conexao = conexao;

        }

        string GetVersion()
        {
            try
            {
                return System.Deployment.Application.ApplicationDeployment.CurrentDeployment.CurrentVersion.ToString();
            }
            catch (Exception ex)
            {
                return Assembly.GetExecutingAssembly().GetName().Version.ToString();
            }
        }

        private void Form1_Load(object sender, EventArgs e)
        {
            this.Text = @"Sistema de Conferência - Versão: " + GetVersion();

            conferenciaComboBox.Items.Add("");
            conferenciaComboBox.Items.Add("CONFERENCIA");
            conferenciaComboBox.Items.Add("SAIDA");
            conferenciaComboBox.Items.Add("ENTREGA");

            cboBuscaLista.SelectedIndex = 1;

            var fabricas = Conexao.RetornaConexao().Query<Fabrica>("SELECT NOME, CONTROLE FROM LAYOUT WHERE LAYOUT.FlAtivo = 1 ORDER BY NOME;");
            foreach (var item in fabricas)
            {
                cboFabrica.Items.Add(item);
            }
            cboFabrica.SelectedIndex = 0;

            toolStripTextBoxUsuarioLogado.Text = $"Logado com: {Program.UsuarioLogado.ToUpper()}";

            // ReceiveMessagesAsync(Properties.Settings.Default.connectionString, Properties.Settings.Default.queueName)
            //         .GetAwaiter();
        }

        private void conferir(object sender, EventArgs e)
        {

            if (dtlGeral.Rows.Count == 0) return;

            FrameGroupBox.Left = (this.Width - FrameGroupBox.Width) / 2;
            FrameGroupBox.Top = (this.Height - FrameGroupBox.Height) / 2;

            FrameGroupBox.Visible = true;

            etiquetaTextBox.Text = "";
            clienteLabel.Text = "";
            produtoLabel.Text = "";
            boxLabel.Text = "";

            etiquetaTextBox.Focus();
            etiquetaTextBox.SelectAll();

            ToolStripMenuItem ctl = (ToolStripMenuItem)sender;

            switch (ctl.Name)
            {
                case "conferênciaToolStripMenuItem1":
                    conferenciaComboBox.SelectedIndex = 1;
                    break;
                case "saidaToolStripMenuItem":
                    conferenciaComboBox.SelectedIndex = 2;
                    break;
                case "entregaToolStripMenuItem":
                    conferenciaComboBox.SelectedIndex = 3;
                    break;
                default:
                    break;
            }

            ValidaRestante();

        }

        private void etiquetaTextBox_KeyDown(object sender, KeyEventArgs e)
        {
            if (e.KeyValue == 13)
            {
                ChecarEtiqueta();
            }
        }
        private void FecharButton_Click(object sender, EventArgs e)
        {
            try
            {
                List<int> ids = new List<int>();
                foreach (DataGridViewRow item in dtlGeral.Rows)
                {
                    if (Convert.ToInt32(item.Cells["STATUS"].Value) == conferenciaComboBox.SelectedIndex)
                        ids.Add(Convert.ToInt32(item.Cells["ID"].Value));
                }

                if (ids.Any())
                    Conexao.RetornaConexao().Execute($"UPDATE PEDIDO SET STATUS={conferenciaComboBox.SelectedIndex} where ID IN({string.Join(",", ids)})");

                FrameGroupBox.Visible = false;
            }
            catch (Exception)
            {
                throw;
            }
        }

        private void Form1_FormClosed(object sender, FormClosedEventArgs e)
        {
            Application.Exit();
        }

        #endregion

        private void AlterarStatus(int status)
        {

            if (dtlGeral.Rows.Count == 0) return;

            try
            {
                List<string> listBarcode = new List<string>();
                foreach (DataGridViewRow item in dtlGeral.SelectedRows)
                {
                    listBarcode.Add(item.Cells["ETIQUETA"].Value.ToString());
                    item.Cells["STATUS"].Value = status.ToString();
                }

                Conexao.RetornaConexao().Execute($"UPDATE PEDIDO SET STATUS={status} where ETIQUETA IN('{string.Join("','", listBarcode)}')");

                AtualizarGrid();
            }
            catch (Exception ex)
            {
                MessageBox.Show(ex.Message, "Sistema de Conferência", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }

        private void conferênciaToolStripMenuItem1_Click(object sender, EventArgs e)
        {
            conferir(sender, e);
        }

        private void saidaToolStripMenuItem_Click(object sender, EventArgs e)
        {
            conferir(sender, e);
        }

        private void alterarParaNormalToolStripMenuItem_Click(object sender, EventArgs e)
        {
            AlterarStatus(0);
        }

        private void alterarParaConferênciaToolStripMenuItem_Click(object sender, EventArgs e)
        {
            AlterarStatus(1);
        }

        private void alterarParaSaidaToolStripMenuItem_Click(object sender, EventArgs e)
        {
            AlterarStatus(2);
        }

        private void toolStripButtonImportar_Click(object sender, EventArgs e)
        {
            mnuImportar.PerformClick();
        }

        private void dtlGeral_CellValueChanged(object sender, DataGridViewCellEventArgs e)
        {
            if (e.ColumnIndex == dtlGeral.Columns["status"]?.Index)
            {
                var row = dtlGeral[e.ColumnIndex, e.RowIndex];
                var grid_status = int.Parse(row.Value.ToString());

                if (grid_status == 0)
                {
                    dtlGeral.Rows[e.RowIndex].DefaultCellStyle.BackColor = Color.White;
                    dtlGeral.Rows[e.RowIndex].Cells["DsStatus"].Value = "NORMAL";
                }
                else if (grid_status == 1)
                {
                    dtlGeral.Rows[e.RowIndex].DefaultCellStyle.BackColor = Color.LightGreen;
                    dtlGeral.Rows[e.RowIndex].Cells["DsStatus"].Value = "CONFERENCIA";
                }
                else if (grid_status == 2)
                {
                    dtlGeral.Rows[e.RowIndex].DefaultCellStyle.BackColor = Color.LightCoral;
                    dtlGeral.Rows[e.RowIndex].Cells["DsStatus"].Value = "SAIDA";
                }
                else if (grid_status == 3)
                {
                    dtlGeral.Rows[e.RowIndex].DefaultCellStyle.BackColor = Color.Blue;
                    dtlGeral.Rows[e.RowIndex].Cells["DsStatus"].Value = "ENTREGA";
                }
            }
        }

        private void dtlGeral_RegionChanged(object sender, EventArgs e)
        {

        }

        private void dtlGeral_RowsAdded(object sender, DataGridViewRowsAddedEventArgs e)
        {
            dtlGeral_CellValueChanged(sender, new DataGridViewCellEventArgs(dtlGeral.Columns["status"].Index, e.RowIndex));
        }

        private void mnuImportar_Click(object sender, EventArgs e)
        {
            new TabeLayo(0).ShowDialog();
        }

        private void txtBusca_Enter(object sender, EventArgs e)
        {
            groupBoxBusca.Left = txtBusca.Bounds.Left + 5;
            groupBoxBusca.Top = txtBusca.Bounds.Top + txtBusca.Bounds.Height - 8;
            groupBoxBusca.Visible = true;
            textBoxCampoBusca.Focus();
        }

        private void cboBuscaLista_SelectedIndexChanged(object sender, EventArgs e)
        {
            var fabricaId = ((Fabrica)cboFabrica.SelectedItem)?.Controle ?? 0;
            if (fabricaId == 0)
                return;

            string _queryParam = "";

            switch (cboBuscaLista.Text)
            {
                case "ORD.COMPRA":
                    _queryParam = $"SELECT ORDCOMPRA + ' (' + CAST(COUNT(ORDCOMPRA) AS VARCHAR(5)) + ')' AS Descricao, ORDCOMPRA AS Valor FROM PEDIDO WHERE Idlayout = {fabricaId} GROUP BY ORDCOMPRA ORDER BY ORDCOMPRA";
                    break;
                case "PEDIDO":
                    _queryParam = $"SELECT PECLIENTE + ' (' + CAST(COUNT(PECLIENTE) AS VARCHAR(5)) + ')' AS Descricao, PECLIENTE AS Valor FROM PEDIDO WHERE Idlayout = {fabricaId} GROUP BY PECLIENTE ORDER BY PECLIENTE";
                    break;
                case "CARGA":
                    _queryParam = $"SELECT ARQUIVO + ' (' + CAST(COUNT(ARQUIVO) AS VARCHAR(5)) + ')' AS Descricao, ARQUIVO AS Valor FROM PEDIDO WHERE Idlayout = {fabricaId} AND DATAINC >= '2023-12-10 00:00:00.000' GROUP BY ARQUIVO ORDER BY ARQUIVO";
                    break;
                default:
                    break;
            }

            var pedidos = Conexao.RetornaConexao().Query<ItemValue>(_queryParam).ToList();
            checkedListBoxBuscar.Items.Clear();
            foreach (var item in pedidos)
            {
                checkedListBoxBuscar.Items.Add(item);
            }
            checkedListBoxBuscar.Tag = pedidos;
        }

        private void textBoxCampoBusca_TextChanged(object sender, EventArgs e)
        {
            checkedListBoxBuscar.Items.Clear();

            var result = ((List<ItemValue>)checkedListBoxBuscar.Tag).Where(x => x.Descricao.Contains(textBoxCampoBusca.Text)).ToList();
            foreach (var item in result)
            {
                checkedListBoxBuscar.Items.Add(item, item.Checked);
            }

        }

        private void btnFecharBusca_Click(object sender, EventArgs e)
        {
            groupBoxBusca.Visible = false;
        }

        private void btnBuscar_Click(object sender, EventArgs e)
        {
            List<string> selectedItems = new List<string>();
            foreach (var item in ((List<ItemValue>)checkedListBoxBuscar.Tag).Where(x => x.Checked))
            {
                selectedItems.Add(((ItemValue)item).Valor.Trim());
            }
            txtBusca.Text = string.Join(",", selectedItems);

            var fabricaId = ((Fabrica)cboFabrica.SelectedItem)?.Controle ?? 0;
            if (fabricaId == 0)
            {
                MessageBox.Show("Selecione a Fábrica.");
                cboFabrica.Focus();
                return;
            }

            if (string.IsNullOrEmpty(txtBusca.Text))
                return;

            string[] _arrQuery = txtBusca.Text.Split(',');
            for (int i = 0; i < _arrQuery.Length; i++)
                _arrQuery[i] = _arrQuery[i].Trim();

            if (!_arrQuery.Any())
                return;

            StringBuilder sqlBuilder = new StringBuilder("SELECT PEDIDO.*, LAYOUT.Nome AS Nmlayout FROM PEDIDO JOIN LAYOUT ON PEDIDO.Idlayout=LAYOUT.CONTROLE WHERE Idlayout = ")
                .Append(fabricaId);

            string _queryParam = $"'{string.Join("','", _arrQuery)}'";

            switch (cboBuscaLista.Text)
            {
                case "ORD.COMPRA":
                    sqlBuilder.Append($" AND TRIM(ORDCOMPRA) IN({_queryParam})");
                    break;
                case "PEDIDO":
                    sqlBuilder.Append($" AND TRIM(PECLIENTE) IN({_queryParam})");
                    break;
                case "CARGA":
                    sqlBuilder.Append($" AND TRIM(ARQUIVO) IN({_queryParam})");
                    break;
                default:
                    break;
            }

            var pedidos = Conexao.RetornaConexao().Query<Pedido>(sqlBuilder.ToString()).ToList();
            if (!pedidos.Any())
                MessageBox.Show("Nada encontrado.");

            groupBoxBusca.Visible = false;

            MontarGrid(pedidos);

            labelBuscaQtde.Text = $"{0} Iten(s) selecionados.";
            textBoxCampoBusca.Text = "";

            cboFabrica_SelectedIndexChanged(null, null);
        }

        private void cboFabrica_SelectedIndexChanged(object sender, EventArgs e)
        {
            cboBuscaLista_SelectedIndexChanged(null, null);
        }

        private void toolStripButtonConferencia_Click(object sender, EventArgs e)
        {
            conferênciaToolStripMenuItem1.PerformClick();
        }

        private void toolStripButtonSaida_Click(object sender, EventArgs e)
        {
            saidaToolStripMenuItem.PerformClick();
        }

        private void checkedListBoxBuscar_ItemCheck(object sender, ItemCheckEventArgs e)
        {
            var valor = (ItemValue)checkedListBoxBuscar.Items[e.Index];

            ((List<ItemValue>)checkedListBoxBuscar.Tag).Where(x => x.Valor == valor.Valor).FirstOrDefault().Checked = (e.NewValue == CheckState.Checked);

            int qtde = ((List<ItemValue>)checkedListBoxBuscar.Tag).Where(x => x.Checked).Count();

            labelBuscaQtde.Text = $"{qtde} Iten(s) selecionados.";
        }

        //async Task SendMessagesAsync(string connectionString, string queueName, PedidoSB data)
        //{
        //    var conexao = Conexao.RetornaConexao();

        //    var senderFactory = MessagingFactory.CreateFromConnectionString(connectionString);

        //    var sender = await senderFactory.CreateMessageSenderAsync(queueName);

        //    var message = new BrokeredMessage(new MemoryStream(Encoding.UTF8.GetBytes(JsonConvert.SerializeObject(data))))
        //    {
        //        ContentType = "application/json",
        //        Label = conexao.DataSource,
        //        //MessageId = i.ToString(),
        //        TimeToLive = TimeSpan.FromMinutes(2)
        //    };

        //    await sender.SendAsync(message);
        //}

        //async Task ReceiveMessagesAsync(string connectionString, string queueName)
        //{
        //    while (true)
        //    {
        //        var receiverFactory = MessagingFactory.CreateFromConnectionString(connectionString);
        //        var receiver = await receiverFactory.CreateMessageReceiverAsync(queueName, ReceiveMode.PeekLock);

        //        try
        //        {
        //            var message = await receiver.ReceiveAsync(TimeSpan.FromMinutes(2));
        //            if (message != null)
        //            {
        //                var conexao = Conexao.RetornaConexao();
        //                var getBody = message.GetBody<Stream>();
        //                var pedidoSB = JsonConvert.DeserializeObject<PedidoSB>(new StreamReader(getBody, true).ReadToEnd());

        //                string data = $"UPDATE PEDIDO SET STATUS={pedidoSB.StatusId} where TRIM(ETIQUETA) = '{pedidoSB.Etiqueta}' AND IdLayout = {pedidoSB.FabricaId}";
        //                if (message.Label.Equals(conexao.DataSource, StringComparison.InvariantCultureIgnoreCase))
        //                {
        //                    int result = conexao.Execute(data);
        //                    if (result > 0)
        //                        await message.CompleteAsync();
        //                }
        //                else
        //                {
        //                    int result = conexao.Execute(data);
        //                    if (result > 0)
        //                        await message.CompleteAsync();
        //                }
        //            }
        //        }
        //        catch (MessagingException e)
        //        {
        //            if (!e.IsTransient)
        //            {
        //                Console.WriteLine(e.Message);
        //            }
        //        }
        //    }
        //}

    }
}

