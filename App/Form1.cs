using System;
using System.Collections.Generic;
using System.Drawing;
using System.Linq;
using System.Media;
using System.Reflection;
using System.Text;
using System.Windows.Forms;
using App.Models;
using Dapper;
using Persistencia;

namespace App
{
    public partial class Form1 : Form
    {
        private const string StatusColumnName = "STATUS";
        private const string DsStatusColumnName = "DsStatus";
        private const string EtiquetaColumnName = "ETIQUETA";
        private const string ClienteColumnName = "CLIENTE";
        private const string DescricaoColumnName = "DESCRICAO1";

        private enum PedidoStatus
        {
            Normal = 0,
            Conferencia = 1,
            Saida = 2,
            Entrega = 3
        }

        private sealed class StatusVisual
        {
            public StatusVisual(Color color, string description)
            {
                Color = color;
                Description = description;
            }

            public Color Color { get; }
            public string Description { get; }
        }

        private static readonly IReadOnlyDictionary<PedidoStatus, StatusVisual> StatusVisuals =
            new Dictionary<PedidoStatus, StatusVisual>
            {
                { PedidoStatus.Normal, new StatusVisual(Color.White, "NORMAL") },
                { PedidoStatus.Conferencia, new StatusVisual(Color.LightGreen, "CONFERENCIA") },
                { PedidoStatus.Saida, new StatusVisual(Color.LightCoral, "SAIDA") },
                { PedidoStatus.Entrega, new StatusVisual(Color.Blue, "ENTREGA") }
            };

        private readonly int conexao;

        public Form1(int conexao)
        {
            InitializeComponent();
            this.conexao = conexao;
        }

        private static PedidoStatus? ParseStatus(object value)
        {
            if (value == null)
            {
                return null;
            }

            if (int.TryParse(value.ToString(), out int statusCode) && Enum.IsDefined(typeof(PedidoStatus), statusCode))
            {
                return (PedidoStatus)statusCode;
            }

            return null;
        }

        private static PedidoStatus? GetPreviousStatus(PedidoStatus status)
        {
            switch (status)
            {
                case PedidoStatus.Conferencia:
                    return PedidoStatus.Normal;
                case PedidoStatus.Saida:
                    return PedidoStatus.Conferencia;
                case PedidoStatus.Entrega:
                    return PedidoStatus.Saida;
                default:
                    return null;
            }
        }

        private IEnumerable<DataGridViewRow> GetDataRows()
        {
            return dtlGeral.Rows.Cast<DataGridViewRow>().Where(row => !row.IsNewRow);
        }

        private PedidoStatus? GetSelectedStatus()
        {
            if (Enum.IsDefined(typeof(PedidoStatus), conferenciaComboBox.SelectedIndex))
            {
                return (PedidoStatus)conferenciaComboBox.SelectedIndex;
            }

            return null;
        }

        private void MontarGrid(IEnumerable<Pedido> pedidos)
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
            int index = dtlGeral.Rows.Add(
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
                pedido.PeComputador);

            AtualizarLinhaVisual(dtlGeral.Rows[index]);
        }

        private void AtualizarGrid()
        {
            var rows = GetDataRows().ToList();

            int normal = rows.Count(row => ParseStatus(row.Cells[StatusColumnName].Value) == PedidoStatus.Normal);
            int conferido = rows.Count(row => ParseStatus(row.Cells[StatusColumnName].Value) == PedidoStatus.Conferencia);
            int saida = rows.Count(row => ParseStatus(row.Cells[StatusColumnName].Value) == PedidoStatus.Saida);
            int entrega = rows.Count(row => ParseStatus(row.Cells[StatusColumnName].Value) == PedidoStatus.Entrega);

            normalToolStripStatusLabel.Text = normal.ToString();
            conferidoToolStripStatusLabel.Text = conferido.ToString();
            saidaToolStripStatusLabel.Text = saida.ToString();
            entregaToolStripStatusLabel.Text = entrega.ToString();

            normalLabel.Text = normalToolStripStatusLabel.Text;
            conferidoLabel.Text = conferidoToolStripStatusLabel.Text;
            saidaLabel.Text = saidaToolStripStatusLabel.Text;
            entregaLabel.Text = entregaToolStripStatusLabel.Text;
        }

        private void AtualizarLinhaStatus(DataGridViewRow row, PedidoStatus status)
        {
            row.Cells[StatusColumnName].Value = ((int)status).ToString();
            AtualizarLinhaVisual(row);
        }

        private void AtualizarLinhaVisual(DataGridViewRow row)
        {
            var status = ParseStatus(row.Cells[StatusColumnName].Value);
            if (status == null)
            {
                return;
            }

            if (StatusVisuals.TryGetValue(status.Value, out StatusVisual visual))
            {
                row.DefaultCellStyle.BackColor = visual.Color;
                row.Cells[DsStatusColumnName].Value = visual.Description;
            }
        }

        private bool ValidaRestante()
        {
            var selectedStatus = GetSelectedStatus();
            if (selectedStatus == null)
            {
                lblRestatnte.Text = "Restante: 0 de 0";
                return false;
            }

            var previousStatus = GetPreviousStatus(selectedStatus.Value);
            if (previousStatus == null)
            {
                lblRestatnte.Text = "Restante: 0 de 0";
                return false;
            }

            var rows = GetDataRows().ToList();
            int pendentes = rows.Count(row => ParseStatus(row.Cells[StatusColumnName].Value) == previousStatus);
            int processados = rows.Count(row => ParseStatus(row.Cells[StatusColumnName].Value) == selectedStatus);
            int total = pendentes + processados;

            lblRestatnte.Text = $"Restante: {pendentes} de {total}";
            return pendentes == 0 && total > 0;
        }

        private void ChecarEtiqueta()
        {
            etiquetaTextBox.UseSystemPasswordChar = true;
            string etiqueta = etiquetaTextBox.Text.Trim();

            clienteLabel.Text = string.Empty;
            produtoLabel.Text = string.Empty;
            boxLabel.Text = string.Empty;

            if (string.IsNullOrWhiteSpace(etiqueta))
            {
                return;
            }

            var selectedStatus = GetSelectedStatus();
            var row = Consultar(etiqueta);

            if (row == null || selectedStatus == null)
            {
                PlaySound("Error");
                MostrarMensagemEtiquetaNaoEncontrada();
                return;
            }

            var rowStatus = ParseStatus(row.Cells[StatusColumnName].Value);
            if (rowStatus == selectedStatus)
            {
                clienteLabel.Text = "Etiqueta já lida !";
                produtoLabel.Text = row.Cells[DescricaoColumnName].Value?.ToString();
                boxLabel.Text = "BOX 1";
                PlaySound("Exclamation");
            }
            else if (rowStatus == GetPreviousStatus(selectedStatus.Value))
            {
                clienteLabel.Text = row.Cells[ClienteColumnName].Value?.ToString();
                produtoLabel.Text = row.Cells[DescricaoColumnName].Value?.ToString();
                boxLabel.Text = "BOX 1";

                AtualizarLinhaStatus(row, selectedStatus.Value);
                AtualizarGrid();

                if (ValidaRestante())
                {
                    PlaySound("Air_Horn");
                }
                else
                {
                    PlaySound("success");
                }
            }
            else
            {
                clienteLabel.Text = $"Esta etiqueta está para {row.Cells[DsStatusColumnName].Value}";
                produtoLabel.Text = row.Cells[DescricaoColumnName].Value?.ToString();
                boxLabel.Text = "BOX 1";
                PlaySound("ringout");
            }

            etiquetaTextBox.Focus();
            etiquetaTextBox.SelectAll();
        }

        private void PlaySound(string soundKey)
        {
            var soundStream = Util.GetSom(soundKey);
            var player = new SoundPlayer(soundStream);
            player.Play();
        }

        private void MostrarMensagemEtiquetaNaoEncontrada()
        {
            etiquetaTextBox.ReadOnly = true;
            while (MessageBox.Show("Etiqueta não encontrada ! \nContinuar conferindo ?", "ATENÇÃO", MessageBoxButtons.YesNo,
                       MessageBoxIcon.Error, MessageBoxDefaultButton.Button2) == DialogResult.No)
            {
            }

            etiquetaTextBox.ReadOnly = false;
            etiquetaTextBox.Focus();
            etiquetaTextBox.SelectAll();
        }

        private DataGridViewRow Consultar(string etiqueta)
        {
            return GetDataRows()
                .FirstOrDefault(x => string.Equals(x.Cells[EtiquetaColumnName].Value?.ToString().Trim(), etiqueta,
                    StringComparison.InvariantCultureIgnoreCase));
        }

        private string GetVersion()
        {
            try
            {
                return System.Deployment.Application.ApplicationDeployment.CurrentDeployment.CurrentVersion.ToString();
            }
            catch
            {
                return Assembly.GetExecutingAssembly().GetName().Version.ToString();
            }
        }

        private IEnumerable<ItemValue> BuscarFiltros(int fabricaId, string filtro)
        {
            string coluna = filtro switch
            {
                "ORD.COMPRA" => "ORDCOMPRA",
                "PEDIDO" => "PECLIENTE",
                "CARGA" => "ARQUIVO",
                _ => null
            };

            if (string.IsNullOrEmpty(coluna))
            {
                return Enumerable.Empty<ItemValue>();
            }

            var sql = new StringBuilder();
            sql.Append($"SELECT {coluna} + ' (' + CAST(COUNT({coluna}) AS VARCHAR(5)) + ')' AS Descricao, {coluna} AS Valor FROM PEDIDO WHERE Idlayout = @fabricaId ");

            var parameters = new DynamicParameters();
            parameters.Add("fabricaId", fabricaId);

            if (coluna == "ARQUIVO")
            {
                sql.Append("AND DATAINC >= @dataMin ");
                parameters.Add("dataMin", new DateTime(2023, 12, 10));
            }

            sql.Append($"GROUP BY {coluna} ORDER BY {coluna};");

            using (var connection = Conexao.CreateConnection())
            {
                return connection.Query<ItemValue>(sql.ToString(), parameters).ToList();
            }
        }

        private IEnumerable<Pedido> BuscarPedidos(int fabricaId, string filtro, IReadOnlyCollection<string> valores)
        {
            if (valores == null || valores.Count == 0)
            {
                return Enumerable.Empty<Pedido>();
            }

            string coluna = filtro switch
            {
                "ORD.COMPRA" => "ORDCOMPRA",
                "PEDIDO" => "PECLIENTE",
                "CARGA" => "ARQUIVO",
                _ => null
            };

            if (string.IsNullOrEmpty(coluna))
            {
                return Enumerable.Empty<Pedido>();
            }

            var sql = new StringBuilder();
            sql.Append("SELECT PEDIDO.*, LAYOUT.Nome AS Nmlayout FROM PEDIDO JOIN LAYOUT ON PEDIDO.Idlayout = LAYOUT.CONTROLE WHERE PEDIDO.Idlayout = @fabricaId");
            sql.Append($" AND RTRIM(LTRIM({coluna})) IN @valores;");

            using (var connection = Conexao.CreateConnection())
            {
                return connection.Query<Pedido>(sql.ToString(), new { fabricaId, valores }).ToList();
            }
        }

        private void Form1_Load(object sender, EventArgs e)
        {
            Text = $"Sistema de Conferência - Versão: {GetVersion()}";

            conferenciaComboBox.Items.Clear();
            conferenciaComboBox.Items.AddRange(new object[] { string.Empty, "CONFERENCIA", "SAIDA", "ENTREGA" });

            cboBuscaLista.SelectedIndex = 1;

            using (var connection = Conexao.CreateConnection())
            {
                var fabricas = connection.Query<Fabrica>("SELECT NOME, CONTROLE FROM LAYOUT WHERE LAYOUT.FlAtivo = 1 ORDER BY NOME;").ToList();
                foreach (var item in fabricas)
                {
                    cboFabrica.Items.Add(item);
                }
            }

            if (cboFabrica.Items.Count > 0)
            {
                cboFabrica.SelectedIndex = 0;
            }

            toolStripTextBoxUsuarioLogado.Text = $"Logado com: {Program.UsuarioLogado.ToUpper()}";
        }

        private void conferir(object sender, EventArgs e)
        {
            if (!GetDataRows().Any())
            {
                return;
            }

            FrameGroupBox.Left = (Width - FrameGroupBox.Width) / 2;
            FrameGroupBox.Top = (Height - FrameGroupBox.Height) / 2;
            FrameGroupBox.Visible = true;

            etiquetaTextBox.Text = string.Empty;
            clienteLabel.Text = string.Empty;
            produtoLabel.Text = string.Empty;
            boxLabel.Text = string.Empty;

            etiquetaTextBox.Focus();
            etiquetaTextBox.SelectAll();

            if (sender is ToolStripMenuItem menuItem)
            {
                switch (menuItem.Name)
                {
                    case "conferênciaToolStripMenuItem1":
                        conferenciaComboBox.SelectedIndex = (int)PedidoStatus.Conferencia;
                        break;
                    case "saidaToolStripMenuItem":
                        conferenciaComboBox.SelectedIndex = (int)PedidoStatus.Saida;
                        break;
                    case "entregaToolStripMenuItem":
                        conferenciaComboBox.SelectedIndex = (int)PedidoStatus.Entrega;
                        break;
                }
            }

            ValidaRestante();
        }

        private void etiquetaTextBox_KeyDown(object sender, KeyEventArgs e)
        {
            if (e.KeyCode == Keys.Enter)
            {
                ChecarEtiqueta();
            }
        }

        private void FecharButton_Click(object sender, EventArgs e)
        {
            var selectedStatus = GetSelectedStatus();
            if (selectedStatus == null)
            {
                FrameGroupBox.Visible = false;
                return;
            }

            var ids = GetDataRows()
                .Where(row => ParseStatus(row.Cells[StatusColumnName].Value) == selectedStatus)
                .Select(row => row.Cells["ID"].Value?.ToString())
                .Where(value => long.TryParse(value, out _))
                .Select(long.Parse)
                .Distinct()
                .ToList();

            if (ids.Any())
            {
                try
                {
                    using (var connection = Conexao.CreateConnection())
                    {
                        connection.Execute("UPDATE PEDIDO SET STATUS = @status WHERE ID IN @ids;", new { status = (int)selectedStatus.Value, ids });
                    }
                }
                catch (Exception ex)
                {
                    MessageBox.Show(ex.Message, "Sistema de Conferência", MessageBoxButtons.OK, MessageBoxIcon.Error);
                }
            }

            FrameGroupBox.Visible = false;
        }

        private void Form1_FormClosed(object sender, FormClosedEventArgs e)
        {
            Application.Exit();
        }

        private void AlterarStatus(int status)
        {
            if (!Enum.IsDefined(typeof(PedidoStatus), status))
            {
                return;
            }

            var novoStatus = (PedidoStatus)status;
            var etiquetas = dtlGeral.SelectedRows.Cast<DataGridViewRow>()
                .Where(row => !row.IsNewRow)
                .Select(row => row.Cells[EtiquetaColumnName].Value?.ToString())
                .Where(value => !string.IsNullOrWhiteSpace(value))
                .Select(value => value.Trim())
                .Distinct()
                .ToList();

            if (!etiquetas.Any())
            {
                return;
            }

            try
            {
                using (var connection = Conexao.CreateConnection())
                {
                    connection.Execute("UPDATE PEDIDO SET STATUS = @status WHERE ETIQUETA IN @etiquetas;", new { status, etiquetas });
                }

                foreach (DataGridViewRow row in dtlGeral.SelectedRows)
                {
                    if (!row.IsNewRow)
                    {
                        AtualizarLinhaStatus(row, novoStatus);
                    }
                }

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
            AlterarStatus((int)PedidoStatus.Normal);
        }

        private void alterarParaConferênciaToolStripMenuItem_Click(object sender, EventArgs e)
        {
            AlterarStatus((int)PedidoStatus.Conferencia);
        }

        private void alterarParaSaidaToolStripMenuItem_Click(object sender, EventArgs e)
        {
            AlterarStatus((int)PedidoStatus.Saida);
        }

        private void toolStripButtonImportar_Click(object sender, EventArgs e)
        {
            mnuImportar.PerformClick();
        }

        private void dtlGeral_CellValueChanged(object sender, DataGridViewCellEventArgs e)
        {
            if (e.RowIndex >= 0 && e.ColumnIndex == dtlGeral.Columns[StatusColumnName]?.Index)
            {
                AtualizarLinhaVisual(dtlGeral.Rows[e.RowIndex]);
            }
        }

        private void dtlGeral_RegionChanged(object sender, EventArgs e)
        {
        }

        private void dtlGeral_RowsAdded(object sender, DataGridViewRowsAddedEventArgs e)
        {
            if (e.RowIndex >= 0)
            {
                AtualizarLinhaVisual(dtlGeral.Rows[e.RowIndex]);
            }
        }

        private void mnuImportar_Click(object sender, EventArgs e)
        {
            new TabeLayo(conexao).ShowDialog();
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
            var fabrica = cboFabrica.SelectedItem as Fabrica;
            if (fabrica == null || fabrica.Controle == 0)
            {
                return;
            }

            var itens = BuscarFiltros(fabrica.Controle, cboBuscaLista.Text).ToList();

            checkedListBoxBuscar.Items.Clear();
            foreach (var item in itens)
            {
                checkedListBoxBuscar.Items.Add(item, item.Checked);
            }

            checkedListBoxBuscar.Tag = itens;
        }

        private void textBoxCampoBusca_TextChanged(object sender, EventArgs e)
        {
            if (checkedListBoxBuscar.Tag is List<ItemValue> itens)
            {
                checkedListBoxBuscar.Items.Clear();
                foreach (var item in itens.Where(x => x.Descricao?.IndexOf(textBoxCampoBusca.Text, StringComparison.InvariantCultureIgnoreCase) >= 0))
                {
                    checkedListBoxBuscar.Items.Add(item, item.Checked);
                }
            }
        }

        private void btnFecharBusca_Click(object sender, EventArgs e)
        {
            groupBoxBusca.Visible = false;
        }

        private void btnBuscar_Click(object sender, EventArgs e)
        {
            if (checkedListBoxBuscar.Tag is not List<ItemValue> itens)
            {
                return;
            }

            var selecionados = itens.Where(x => x.Checked).Select(x => x.Valor?.Trim()).Where(x => !string.IsNullOrWhiteSpace(x)).Distinct().ToList();

            txtBusca.Text = string.Join(",", selecionados);

            var fabrica = cboFabrica.SelectedItem as Fabrica;
            if (fabrica == null || fabrica.Controle == 0)
            {
                MessageBox.Show("Selecione a Fábrica.");
                cboFabrica.Focus();
                return;
            }

            if (!selecionados.Any())
            {
                return;
            }

            var pedidos = BuscarPedidos(fabrica.Controle, cboBuscaLista.Text, selecionados).ToList();
            if (!pedidos.Any())
            {
                MessageBox.Show("Nada encontrado.");
            }

            groupBoxBusca.Visible = false;
            MontarGrid(pedidos);

            labelBuscaQtde.Text = $"{selecionados.Count} Iten(s) selecionados.";
            textBoxCampoBusca.Text = string.Empty;

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
            if (checkedListBoxBuscar.Tag is not List<ItemValue> itens || e.Index < 0 || e.Index >= checkedListBoxBuscar.Items.Count)
            {
                return;
            }

            var valor = (ItemValue)checkedListBoxBuscar.Items[e.Index];
            var item = itens.FirstOrDefault(x => x.Valor == valor.Valor);
            if (item != null)
            {
                item.Checked = e.NewValue == CheckState.Checked;
            }

            int quantidade = itens.Count(x => x.Checked);
            labelBuscaQtde.Text = $"{quantidade} Iten(s) selecionados.";
        }
    }
}
