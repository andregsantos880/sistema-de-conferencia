using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Windows.Forms;
using Entidade;
using Negocio;

namespace App
{
    public partial class FormFiltro : Form
    {

        int conexao;

        public FormFiltro(int conexao)
        {
            InitializeComponent();

            this.conexao = conexao;

            montarLista();
        }

        private void confirmarButton_Click(object sender, EventArgs e)
        {

            StringBuilder cQuery = new StringBuilder();
            StringBuilder cStr = new StringBuilder();

            if (normalCheckBox.Checked) cStr.Append("0,");
            if (conferidoCheckBox.Checked) cStr.Append("1,");
            if (saidaCheckBox.Checked) cStr.Append("2,");
            if (entregaCheckBox.Checked) cStr.Append("3,");

            if (cStr.Length > 0) Program.mvoPedido.STATUS = cStr.ToString().Substring(0, cStr.Length - 1);

            cStr = new StringBuilder();
            for (int i = 0; i <= clienteCheckedListBox.Items.Count - 1; i++)
            {
                if (clienteCheckedListBox.GetItemCheckState(i) != CheckState.Checked) continue;
                cStr.AppendFormat("{0},", clienteCheckedListBox.Items[i]);
            }
            if (cStr.Length > 0) Program.mvoPedido.CLIENTE = cStr.ToString().Substring(0, cStr.Length - 1);

            cStr = new StringBuilder();
            for (int i = 0; i <= produtoCheckedListBox.Items.Count - 1; i++)
            {
                if (produtoCheckedListBox.GetItemCheckState(i) != CheckState.Checked) continue;
                cStr.AppendFormat("{0},", produtoCheckedListBox.Items[i]);
            }
            if (cStr.Length > 0) Program.mvoPedido.DESCRICAO1 = cStr.ToString().Substring(0, cStr.Length - 1);

            cStr = new StringBuilder();
            for (int i = 0; i <= pedidoCheckedListBox.Items.Count - 1; i++)
            {
                if (pedidoCheckedListBox.GetItemCheckState(i) != CheckState.Checked) continue;
                cStr.AppendFormat("{0},", pedidoCheckedListBox.Items[i].ToString().Split('|')[0]);
            }
            if (cStr.Length > 0) Program.mvoPedido.PECLIENTE = cStr.ToString().Substring(0, cStr.Length - 1);

            cStr = new StringBuilder();
            for (int i = 0; i <= ordemCompraCheckedListBox.Items.Count - 1; i++)
            {
                if (ordemCompraCheckedListBox.GetItemCheckState(i) != CheckState.Checked) continue;
                cStr.AppendFormat("{0},", ordemCompraCheckedListBox.Items[i].ToString().Trim().Split('|')[0]);
            }
            if (cStr.Length > 0) Program.mvoPedido.ORDCOMPRA = cStr.ToString().Substring(0, cStr.Length - 1);

            cStr = new StringBuilder();
            for (int i = 0; i <= ComputadorCheckedListBox.Items.Count - 1; i++)
            {
                if (ComputadorCheckedListBox.GetItemCheckState(i) != CheckState.Checked) continue;
                cStr.AppendFormat("{0},", ComputadorCheckedListBox.Items[i]);
            }
            if (cStr.Length > 0) Program.mvoPedido.PECOMPUTADOR = cStr.ToString().Substring(0, cStr.Length - 1);

            this.DialogResult = DialogResult.OK;
            this.Close();

        }

        private void montarLista()
        {

            boPedido mboPedido = new boPedido(conexao);
            DataTable dt = mboPedido.Consultar(Program.mvoPedido);

            List<voPedido> LvoPedido = mboPedido.montaLista(dt);

            clienteCheckedListBox.Items.Clear();
            var cliente = LvoPedido.Select(x => x.CLIENTE).Distinct();
            foreach (var item in cliente)
                clienteCheckedListBox.Items.Add(item);

            produtoCheckedListBox.Items.Clear();
            var produto = LvoPedido.Select(x => x.DESCRICAO1).Distinct();
            foreach (var item in produto)
                produtoCheckedListBox.Items.Add(item);

            pedidoCheckedListBox.Items.Clear();
            var pedido = LvoPedido.Select(x => new { x.PECLIENTE, x.ORDCOMPRA }).Distinct();
            foreach (var item in pedido)
                pedidoCheckedListBox.Items.Add(item.PECLIENTE.Trim() + " | ( " + item.ORDCOMPRA.Trim() + " )");

            ordemCompraCheckedListBox.Items.Clear();
            var ordem = LvoPedido.Select(x => new { x.ORDCOMPRA }).Distinct();
            foreach (var item in ordem)
                ordemCompraCheckedListBox.Items.Add(item.ORDCOMPRA);

            ComputadorCheckedListBox.Items.Clear();
            var computador = LvoPedido.Select(x => new { x.PECOMPUTADOR }).Distinct();
            foreach (var item in computador)
                ComputadorCheckedListBox.Items.Add(item.PECOMPUTADOR);

        }
        private void btnPedBusca_Click(object sender, EventArgs e)
        {
            Program.mvoPedido.PECLIENTE = txtpedBusca.Text;
            montarLista();
        }

        private void btnPesquisaOrdem_Click(object sender, EventArgs e)
        {

            boPedido mboPedido = new boPedido(conexao);
            DataTable dt = mboPedido.Consultar(Program.mvoPedido);

            List<voPedido> LvoPedido = mboPedido.montaLista(dt);
            List<voPedido> result = new List<voPedido>();

            result = LvoPedido.Where(x => x.ORDCOMPRA.ToUpper().Contains(txtOrdemCompra.Text.ToUpper())).ToList();

            StringBuilder cStr = new StringBuilder();
            for (int i = 0; i <= result.Count - 1; i++)
            {
                cStr.AppendFormat("{0},", result[i].PECLIENTE);
            }
            if (cStr.Length > 0) Program.mvoPedido.PECLIENTE = cStr.ToString().Substring(0, cStr.Length - 1);

            montarLista();
        }

        private void txtOrdemCompra_KeyDown(object sender, KeyEventArgs e)
        {
            if (e.KeyCode== Keys.Return)
            {
                btnPesquisaOrdem.PerformClick();
            }
        }

        private void txtpedBusca_KeyDown(object sender, KeyEventArgs e)
        {
            if (e.KeyCode == Keys.Return)
            {
                btnPedBusca.PerformClick();
            }
        }
    }
}
