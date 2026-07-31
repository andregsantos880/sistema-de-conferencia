using System;
using System.Collections.Generic;
using System.Drawing.Printing;
using System.Windows.Forms;
using System.Drawing;
using System.Data;
using Negocio;
using Entidade;

namespace Relatorio
{
    public class RelResumido
    {
        private int nPag = 1;
        int POSY = 40;
        int nPosicao = 0;
        List<string> ids;
        int cUsuarioId;

        private List<voPedido> LvoPedido = new List<voPedido>();

        private DataTable dtPedido;

        List<string> pedidos = new List<string>();

        int[] st = new int[5] { 0, 0, 0, 0, 0 };

        PrintDocument pd = new PrintDocument();
        PrintPreviewDialog pv = new PrintPreviewDialog();

        private int conexao = 0;

        public RelResumido(int conexao)
        {
            this.conexao = conexao;
        }

        public void show(List<string> valor, int usuario)
        {

            if (valor.Count == 0)
            {
                MessageBox.Show("Não há registros para imprimir !");
                return;
            }

            this.ids = valor;
            this.cUsuarioId = usuario;

            nPosicao = 0;
            nPag = 1;

            pd.PrinterSettings.PrintToFile = true;
            pd.PrinterSettings.PrinterName = "PDF";

            pd.PrintPage += new PrintPageEventHandler(listagem_PrintPage);
            pd.QueryPageSettings += new QueryPageSettingsEventHandler(Listagem_QueryPageSettings);
            pd.EndPrint += new PrintEventHandler(pd_EndPrint);
            pv.Document = pd;
            pv.PrintPreviewControl.Zoom = 1;

            voPedido mvoPedido = new voPedido();
            boPedido mboPedido = new boPedido(conexao);

            dtPedido = mboPedido.ConsultarResumo(string.Join(",", ids));

            pv.ShowDialog();

        }

        void pd_EndPrint(object sender, PrintEventArgs e)
        {
            nPosicao = 0;
            nPag = 1;
        }

        void Listagem_QueryPageSettings(object sender, QueryPageSettingsEventArgs e)
        {
            e.PageSettings.Landscape = true;
        }

        void listagem_cabecalho(object sender, ref PrintPageEventArgs e)
        {
            int POSY = 10;

            Font cFonte = new System.Drawing.Font("courier new", 10);
            Font cFonteB = new System.Drawing.Font("courier new", 10, FontStyle.Bold);

            Brush cor = Brushes.Black;

            e.PageSettings.Landscape = true;
            e.Graphics.DrawRectangle(new Pen(cor, 0.1f), 5, 5, 265, 25);

            e.Graphics.DrawString("Relatório de Resumido", cFonteB, cor, 10, POSY);
            POSY += 5;
            e.Graphics.DrawString("Usuário:", cFonte, cor, 10, POSY);
            voUsuario mvoUsuario = new voUsuario();
            boUsuario mboUsuario = new boUsuario(conexao);

            mvoUsuario.ID = cUsuarioId;
            DataTable dt = mboUsuario.Consultar(mvoUsuario);
            if (dt.Rows.Count > 0)
                e.Graphics.DrawString(dt.Rows[0]["LOGIN"].ToString(), cFonte, cor, 30, POSY);

            voPedido mvoPedido = new voPedido();
            boPedido mboPedido = new boPedido(conexao);

            int id = int.Parse(ids[0]);

            mvoPedido.ID = id;
            IDataReader dr = mboPedido.ConsultarDr(mvoPedido);
            if (dr.Read())
            {
                string[] arq = dr["arquivo"].ToString().Split('.');
                e.Graphics.DrawString("Referência:", cFonte, cor, 155, POSY);
                e.Graphics.DrawString(arq[0], cFonte, cor, 180, POSY);
            }
            dr.Close();

            POSY += 5;

            e.Graphics.DrawString("Data:", cFonte, cor, 10, POSY);
            e.Graphics.DrawString(DateTime.Now.ToString(), cFonte, cor, 30, POSY);

            e.Graphics.DrawString("Pagina:", cFonte, cor, 155, POSY);
            e.Graphics.DrawString(nPag.ToString(), cFonte, cor, 180, POSY);

            POSY += 12;

            e.Graphics.DrawString("OC", cFonteB, cor, 5, POSY);
            e.Graphics.DrawString("Loja", cFonteB, cor, 30, POSY);
            e.Graphics.DrawString("Pedido", cFonteB, cor, 110, POSY);
            e.Graphics.DrawString("Total", cFonteB, cor, 195, POSY);
            e.Graphics.DrawString("Local", cFonteB, cor, 210, POSY);

        }

        void listagem_PrintPage(object sender, PrintPageEventArgs e)
        {

            Font cFonte = new System.Drawing.Font("courier new", 8);
            Font cFonteB = new System.Drawing.Font("courier new", 8, FontStyle.Bold);

            Brush cor = Brushes.Black;

            e.Graphics.PageUnit = GraphicsUnit.Millimeter;

            POSY = 40;

            listagem_cabecalho(sender, ref e);

            for (int i = nPosicao; i < dtPedido.Rows.Count; i++)
            {

                e.Graphics.DrawString(dtPedido.Rows[i]["ORDCOMPRA"].ToString(), cFonte, cor, 5, POSY);
                if (dtPedido.Rows[i]["CLIENTE"].ToString().Length >= 34)
                    e.Graphics.DrawString(dtPedido.Rows[i]["CLIENTE"].ToString().Substring(0, 34), cFonte, cor, 30, POSY);
                else
                    e.Graphics.DrawString(dtPedido.Rows[i]["CLIENTE"].ToString(), cFonte, cor, 30, POSY);

                e.Graphics.DrawString(dtPedido.Rows[i]["PECLIENTE"].ToString(), cFonte, cor, 110, POSY);
                e.Graphics.DrawString(dtPedido.Rows[i]["QTDE"].ToString(), cFonte, cor, 195, POSY);
                e.Graphics.DrawString(dtPedido.Rows[i]["Box"].ToString(), cFonte, cor, 210, POSY);

                nPosicao += 1;
                POSY += 4;

                if (POSY >= 160)
                {

                    POSY += 4;
                    e.Graphics.DrawLine(new Pen(cor, 0.1f), 5, POSY, 270, POSY);

                    nPag += 1;
                    POSY = 40;
                    e.HasMorePages = true;
                }
            }

        }
    }
}
