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
    public class RelDetalhado
    {
        private int nPag = 1;
        int POSY = 40;
        int nPosicao = 0;
        List<string> ids;
        int cUsuarioId;
        int id;
        DateTime dataHeader;

        List<string> pedidos = new List<string>();

        int[] st = new int[6] { 0, 0, 0, 0, 0, 0 };

        PrintDocument pd = new PrintDocument();
        PrintPreviewDialog pv = new PrintPreviewDialog();

        private int conexao = 0;

        public RelDetalhado(int conexao)
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
            dataHeader = DateTime.Now;

            pd.PrinterSettings.PrintToFile = true;
            pd.PrinterSettings.PrinterName = "PDF";

            pd.PrintPage += new PrintPageEventHandler(listagem_PrintPage);
            pd.QueryPageSettings += new QueryPageSettingsEventHandler(Listagem_QueryPageSettings);
            pd.EndPrint += new PrintEventHandler(pd_EndPrint);
            pv.Document = pd;
            pv.PrintPreviewControl.Zoom = 1;

            pv.ShowDialog();

        }

        void pd_EndPrint(object sender, PrintEventArgs e)
        {
            nPosicao = 0;
            nPag = 1;

            //limpa contadores dos status
            st[0] = 0;
            st[1] = 0;
            st[2] = 0;
            st[3] = 0;
            st[4] = 0;
            st[5] = 0;
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

            e.Graphics.DrawString("Relatório de Detalhado", cFonteB, cor, 10, POSY);
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
            e.Graphics.DrawString(dataHeader.ToString(), cFonte, cor, 30, POSY);

            e.Graphics.DrawString("Pagina:", cFonte, cor, 155, POSY);
            e.Graphics.DrawString(nPag.ToString(), cFonte, cor, 180, POSY);

            POSY += 12;

            e.Graphics.DrawString("OC", cFonteB, cor, 5, POSY);
            e.Graphics.DrawString("Loja", cFonteB, cor, 30, POSY);
            e.Graphics.DrawString("Pedido", cFonteB, cor, 94, POSY);
            e.Graphics.DrawString("Referência", cFonteB, cor, 110, POSY);
            e.Graphics.DrawString("Item", cFonteB, cor, 135, POSY);
            e.Graphics.DrawString("Qtde", cFonteB, cor, 195, POSY);
            e.Graphics.DrawString("Etiqueta", cFonteB, cor, 210, POSY);
            //e.Graphics.DrawString("Local", cFonteB, cor, 255, POSY);

        }

        void listagem_PrintPage(object sender, PrintPageEventArgs e)
        {

            voPedido mvoPedido = new voPedido();
            boPedido mboPedido = new boPedido(conexao);

            voHistorico mvoHistorico = new voHistorico();
            boHistorico mboHistorico = new boHistorico(conexao);

            Font cFonte = new System.Drawing.Font("courier new", 8);
            Font cFonteB = new System.Drawing.Font("courier new", 8, FontStyle.Bold);

            Brush cor = Brushes.Black;

            e.Graphics.PageUnit = GraphicsUnit.Millimeter;

            POSY = 40;

            listagem_cabecalho(sender, ref e);

            for (int i = nPosicao; i < ids.Count; i++)
            {

                #region Imprime Itens
                id = int.Parse(ids[i]);
                mvoPedido.ID = id;
                DataTable dtPedido = mboPedido.Consultar(mvoPedido);
                foreach (DataRow item in dtPedido.Rows)
                {
                    e.Graphics.DrawString(item["ORDCOMPRA"].ToString(), cFonte, cor, 5, POSY);
                    if (item["CLIENTE"].ToString().Length >= 34)
                        e.Graphics.DrawString(item["CLIENTE"].ToString().Substring(0, 34), cFonte, cor, 30, POSY);
                    else
                        e.Graphics.DrawString(item["CLIENTE"].ToString(), cFonte, cor, 30, POSY);

                    e.Graphics.DrawString(item["PECLIENTE"].ToString(), cFonte, cor, 94, POSY);
                    e.Graphics.DrawString(item["PRODUTO"].ToString(), cFonte, cor, 110, POSY);
                    if (item["DESCRICAO1"].ToString().Length >= 33)
                        e.Graphics.DrawString(item["DESCRICAO1"].ToString().Substring(0, 33), cFonte, cor, 135, POSY);
                    else
                        e.Graphics.DrawString(item["DESCRICAO1"].ToString(), cFonte, cor, 135, POSY);
                    e.Graphics.DrawString(item["QTDE"].ToString(), cFonte, cor, 195, POSY);
                    e.Graphics.DrawString(item["ETIQUETA"].ToString(), cFonte, cor, 210, POSY);
                    //e.Graphics.DrawString(item["BOX"].ToString(), cFonte, cor, 255, POSY);

                    bool existe = false;
                    foreach (var ped in pedidos)
                        if (ped.Equals(item["PECLIENTE"].ToString())) { existe = true; break; }

                    if (!existe) pedidos.Add(item["PECLIENTE"].ToString());

                    if (int.Parse(item["STATUS"].ToString()) > 4)
                    {
                        st[0] += 1;
                        st[1] += 1;
                        st[2] += 1;
                        st[3] += 1;
                        st[4] += 1;
                        st[5] += 1;
                    }

                    if (int.Parse(item["STATUS"].ToString()) > 3)
                    {
                        st[0] += 1;
                        st[1] += 1;
                        st[2] += 1;
                        st[3] += 1;
                        st[4] += 1;
                    }
                    else if (int.Parse(item["STATUS"].ToString()) > 2)
                    {
                        st[0] += 1;
                        st[1] += 1;
                        st[2] += 1;
                        st[3] += 1;
                    }
                    else if (int.Parse(item["STATUS"].ToString()) > 1)
                    {
                        st[0] += 1;
                        st[1] += 1;
                        st[2] += 1;

                    }
                    else if (int.Parse(item["STATUS"].ToString()) > 0)
                    {
                        st[0] += 1;
                        st[1] += 1;

                    }

                    nPosicao += 1;
                    POSY += 4;

                    #region imprime hitórico 
                    id = int.Parse(item["ID"].ToString());

                    mvoHistorico.PEDIDOID = id;
                    DataTable dtHistorico = mboHistorico.Consultar(mvoHistorico);
                    if (dtHistorico.Rows.Count > 0)
                    {

                        //logs
                        e.Graphics.DrawString("Data", cFonteB, cor, 10, POSY);
                        e.Graphics.DrawString("Login", cFonteB, cor, 40, POSY);
                        e.Graphics.DrawString("Estágio", cFonteB, cor, 60, POSY);

                        //nPosicao += 1;
                        POSY += 4;

                        foreach (DataRow it in dtHistorico.Rows)
                        {
                            e.Graphics.DrawString(string.Format("{0:dd/MM/yy HH:mm}", DateTime.Parse(it["DATA"].ToString())), cFonte, cor, 10, POSY);
                            e.Graphics.DrawString(it["LOGIN"].ToString(), cFonte, cor, 40, POSY);
                            switch (it["STATUS"].ToString())
                            {
                                case "1": e.Graphics.DrawString("ENTRADA", cFonte, cor, 60, POSY);
                                    break;
                                case "2": e.Graphics.DrawString("CONFERÊNCIA", cFonte, cor, 60, POSY);
                                    break;
                                case "3": e.Graphics.DrawString("SAIDA", cFonte, cor, 60, POSY);
                                    break;
                                case "4": e.Graphics.DrawString("PARA ENTREGA", cFonte, cor, 60, POSY);
                                    break;
                                case "5":
                                    e.Graphics.DrawString("ENTREGA NO CLIENTE", cFonte, cor, 60, POSY);
                                    break;
                            }

                            //nPosicao += 1;
                            POSY += 4;

                            /*
                            #region muda pagina s1
                            if (POSY >= 160)
                            {

                                POSY += 4;
                                e.Graphics.DrawLine(new Pen(cor, 0.1f), 5, POSY, 270, POSY);

                                nPag += 1;
                                POSY = 40;
                                e.HasMorePages = true;
                                return;
                               // break;
                            }
                            #endregion
                            */
                        }

                        //nPosicao += 1;
                        POSY += 4;

                        #region muda pagina s2
                        if (POSY >= 160)
                        {

                            POSY += 4;
                            e.Graphics.DrawLine(new Pen(cor, 0.1f), 5, POSY, 270, POSY);

                            nPag += 1;
                            POSY = 40;
                            e.HasMorePages = true;
                            return;
                            //break;
                        }
                        #endregion

                    }
                    #endregion
                }
                #endregion

                #region Imrime ultima pagina
                //se for ultima pagina
                if (i == ids.Count - 1)
                {
                    POSY += 4;
                    e.Graphics.DrawLine(new Pen(cor, 0.1f), 5, POSY, 270, POSY);
                    POSY += 4;

                    int posInicial = POSY;

                    e.Graphics.DrawString("Total de peças: ", cFonteB, cor, 5, POSY);
                    e.Graphics.DrawString(ids.Count.ToString(), cFonteB, cor, 40, POSY);

                    POSY += 8;

                    e.Graphics.DrawString("Entrada: ", cFonteB, cor, 5, POSY);
                    e.Graphics.DrawString(st[1].ToString(), cFonteB, cor, 40, POSY);

                    e.Graphics.DrawString("Pendente: ", cFonteB, cor, 50, POSY);
                    e.Graphics.DrawString((ids.Count - st[1]).ToString(), cFonteB, cor, 70, POSY);

                    POSY += 4;
                    e.Graphics.DrawString("Conferidas: ", cFonteB, cor, 5, POSY);
                    e.Graphics.DrawString(st[2].ToString(), cFonteB, cor, 40, POSY);

                    e.Graphics.DrawString("Pendente: ", cFonteB, cor, 50, POSY);
                    e.Graphics.DrawString((ids.Count - st[2]).ToString(), cFonteB, cor, 70, POSY);

                    POSY += 4;
                    e.Graphics.DrawString("Saida: ", cFonteB, cor, 5, POSY);
                    e.Graphics.DrawString(st[3].ToString(), cFonteB, cor, 40, POSY);

                    e.Graphics.DrawString("Pendente: ", cFonteB, cor, 50, POSY);
                    e.Graphics.DrawString((ids.Count - st[3]).ToString(), cFonteB, cor, 70, POSY);

                    POSY += 4;
                    e.Graphics.DrawString("Para entrega: ", cFonteB, cor, 5, POSY);
                    e.Graphics.DrawString(st[4].ToString(), cFonteB, cor, 40, POSY);

                    e.Graphics.DrawString("Pendente: ", cFonteB, cor, 50, POSY);
                    e.Graphics.DrawString((ids.Count - st[4]).ToString(), cFonteB, cor, 70, POSY);

                    POSY += 4;
                    e.Graphics.DrawString("Finalizado: ", cFonteB, cor, 5, POSY);
                    e.Graphics.DrawString(st[5].ToString(), cFonteB, cor, 40, POSY);

                    e.Graphics.DrawString("Pendente: ", cFonteB, cor, 50, POSY);
                    e.Graphics.DrawString((ids.Count - st[5]).ToString(), cFonteB, cor, 70, POSY);

                    POSY += 4;

                    e.Graphics.DrawString("Pedidos: ", cFonteB, cor, 90, posInicial);
                    posInicial += 4;

                    int margem = 70;
                    foreach (var ped2 in pedidos)
                    {
                        e.Graphics.DrawString(ped2, cFonteB, cor, margem += 20, posInicial);
                        if (margem > 200)
                        {
                            posInicial += 4;
                            margem = 70;
                        }
                    }

                }
                #endregion

                #region muda pagina s3
                if (POSY >= 160)
                {
                    POSY += 4;
                    e.Graphics.DrawLine(new Pen(cor, 0.1f), 5, POSY, 270, POSY);

                    nPag += 1;
                    POSY = 40;
                    e.HasMorePages = true;
                    break;
                }
                #endregion

            }
        }
    }
}
