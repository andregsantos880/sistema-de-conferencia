using Entidade;
using Entidade.Importar;
using Newtonsoft.Json;
using Persistencia;
using System;
using System.Collections.Generic;
using System.Data;

namespace Negocio
{
    public class boPedido
    {
        private List<item> LItem = new List<item>();

        private List<item> LSubItem = new List<item>();

        private DataTable PedidoTB = new DataTable("PedidoTB");

        private int conexao;

        public static object locks = new object();

        public boPedido(int conexao)
        {
            this.conexao = conexao;
            this.MontarPedidoTb();
        }

        public void CarregarDados(voArquivoIm arquivoIm, Action<int, int, List<PedidoImport>> callBack)
        {

            switch (arquivoIm.LayoutId)
            {
                case 1:
                    {
                        this.InserirTodeschini(arquivoIm, callBack);
                        break;
                    }
                case 2:
                    {
                        this.InserirCriare(arquivoIm, callBack);
                        break;
                    }
                case 3:
                    {
                        this.InserirItalinea(arquivoIm, callBack);
                        break;
                    }
                case 4:
                    {
                        this.InserirUnicasa(arquivoIm, callBack);
                        break;
                    }
                case 5:
                    {
                        this.InserirDalMobile(arquivoIm, callBack);
                        break;
                    }
                case 6:
                    {
                        this.InserirRomanzza(arquivoIm, callBack);
                        break;
                    }
                case 7:
                    {
                        this.InserirInusitta(arquivoIm, callBack);
                        break;
                    }
                case 8:
                    {
                        this.InserirIdelli(arquivoIm, callBack);
                        break;
                    }
                case 9:
                    {
                        this.InserirSCA(arquivoIm, callBack);
                        break;
                    }
                case 10:
                    {
                        this.InserirVitta(arquivoIm, callBack);
                        break;
                    }
                case 11:
                    {
                        this.InserirRudnick(arquivoIm, callBack);
                        break;
                    }
                case 12:
                    {
                        this.InserirSimonetto(arquivoIm, callBack);
                        break;
                    }
                case 13:
                    {
                        this.InserirMarel(arquivoIm, callBack);
                        break;
                    }
                case 14:
                    {
                        this.InserirItalineaLoja(arquivoIm, callBack);
                        break;
                    }
                case 15:
                    {
                        this.InserirKasak(arquivoIm, callBack);
                        break;
                    }
                case 16:
                    {
                        this.InserirTranspaese(arquivoIm, callBack);
                        break;
                    }
                case 17:
                    {
                        this.InserirIMOBAL(arquivoIm, callBack);
                        break;
                    }
                case 18:
                    {
                        this.InserirRIMO(arquivoIm, callBack);
                        break;
                    }
                case 19:
                    {
                        this.InserirCASTINI(arquivoIm, callBack);
                        break;
                    }
                case 20:
                    {

                        this.InserirSimonettoV2(arquivoIm, callBack);
                        break;
                    }
                case 21:
                    {

                        this.InserirBartzen(arquivoIm, callBack);
                        break;
                    }
                case 22:
                    {
                        this.InserirVivatto(arquivoIm, callBack);
                        break;
                    }
                case 23:
                    {

                        this.InserirHRM(arquivoIm, callBack);
                        break;
                    }
                case 24:
                    {

                        this.InserirMANFROI(arquivoIm, callBack);
                        break;
                    }
                case 26:
                    {
                        this.InserirJaeli(arquivoIm, callBack);
                        break;
                    }
                case 27:
                    {
                        this.InserirEvviva(arquivoIm, callBack);
                        break;
                    }
                case 28:
                    {
                        this.InserirBARTZ(arquivoIm, callBack);
                        break;
                    }
                case 29:
                    {
                        this.InserirEvvivaV2(arquivoIm, callBack);
                        break;
                    }
                case 30:
                    {
                        this.InserirMovelMar(arquivoIm, callBack);
                        break;
                    }
            }
        }

        private void InserirJaeli(voArquivoIm arquivoIm, Action<int, int, List<PedidoImport>> callBack)
        {
            daPedido _daPedido = new daPedido(this.conexao);
            List<PedidoImport> _listVoPedido = new List<PedidoImport>();

            string cliente = "";
            string pedido = "";
            string OC = "";

            for (int i = 0; i < arquivoIm.ArquivoItens.Count; i++)
            {
                callBack(arquivoIm.ArquivoItens.Count, i, null);
                var linhaArquivo = arquivoIm.ArquivoItens[i].Linha;

                if (linhaArquivo.Trim().Contains("Pedido") && linhaArquivo.Trim().Contains("Cliente"))
                {
                    cliente = linhaArquivo.Substring(29).Trim();
                    pedido = linhaArquivo.Substring(7, 15).Trim();
                }

                if (linhaArquivo.Trim().Contains("OC:"))
                {
                    OC = linhaArquivo.Substring(5).Trim();
                }

                if (linhaArquivo.Trim().Contains("Caixa Master:"))
                {
                    for (; i < arquivoIm.ArquivoItens.Count; i++)
                    {
                        if (arquivoIm.ArquivoItens[i].Linha.Contains("*"))
                        {
                            var codigoBarra = arquivoIm.ArquivoItens[i].Linha.Trim().Replace("*", "");

                            var _voPedido = new PedidoImport();

                            _voPedido.ARQUIVO = arquivoIm.FileName;
                            _voPedido.PECLIENTE = pedido;
                            _voPedido.PRODUTO = "";
                            _voPedido.VOLUME = 1;
                            _voPedido.DESCRICAO1 = linhaArquivo; //caixa master;
                            _voPedido.CLIENTE = cliente;
                            _voPedido.ORDCOMPRA = OC;
                            _voPedido.STATUS = 0;
                            _voPedido.QTDE = 1;
                            _voPedido.ETIQUETA = codigoBarra;
                            _voPedido.IdBox = 1;
                            _voPedido.IdLayout = arquivoIm.LayoutId;
                            _voPedido.DATAINC = DateTime.Now;
                            _listVoPedido.Add(_voPedido);

                            goto Found;
                        }
                    }
                }

            Found:
                continue;
            }

            callBack(arquivoIm.ArquivoItens.Count, 0, _listVoPedido);
        }

        private void InserirBartzen(voArquivoIm arquivoIm, Action<int, int, List<PedidoImport>> callBack)
        {
            daPedido _daPedido = new daPedido(this.conexao);
            List<PedidoImport> _listVoPedido = new List<PedidoImport>();

            for (int i = 0; i < arquivoIm.ArquivoItens.Count; i++)
            {
                callBack(arquivoIm.ArquivoItens.Count, i, null);

                var linhaArquivo = arquivoIm.ArquivoItens[i].Linha;
                try
                {

                    PedidoImport _voPedido = new PedidoImport();
                    string[] strArrays = linhaArquivo.Split(new char[] { '\t' });
                    if (char.IsDigit(strArrays[0].ToString(), 0))
                    {
                        _voPedido.ARQUIVO = arquivoIm.FileName;
                        _voPedido.PECLIENTE = strArrays[12].Trim();
                        _voPedido.PRODUTO = strArrays[9].Trim();
                        _voPedido.VOLUME = 1;
                        _voPedido.DESCRICAO1 = strArrays[3].Trim();
                        _voPedido.CLIENTE = strArrays[5].Trim();
                        _voPedido.ORDCOMPRA = strArrays[4].Trim();
                        _voPedido.STATUS = 0;
                        _voPedido.QTDE = 1;
                        _voPedido.ETIQUETA = strArrays[2].Trim();
                        _voPedido.IdBox = 1;
                        _voPedido.IdLayout = arquivoIm.LayoutId;
                        _voPedido.DATAINC = DateTime.Now.Date;
                        _listVoPedido.Add(_voPedido);
                    }
                }
                catch (Exception exception)
                {
                    throw exception;
                }
            }

            callBack(arquivoIm.ArquivoItens.Count, 0, _listVoPedido);
        }

        private void InserirCASTINI(voArquivoIm arquivoIm, Action<int, int, List<PedidoImport>> callBack)
        {
            daPedido _daPedido = new daPedido(this.conexao);
            List<PedidoImport> _listVoPedido = new List<PedidoImport>();

            for (int i = 0; i < arquivoIm.ArquivoItens.Count; i++)
            {
                callBack(arquivoIm.ArquivoItens.Count, i, null);

                var linhaArquivo = arquivoIm.ArquivoItens[i].Linha;

                string[] strArrays = linhaArquivo.Split(new char[] { ';' });
                double num = 0;
                if (double.TryParse(strArrays[7].ToString(), out num))
                {

                    PedidoImport _voPedido = new PedidoImport();
                    try
                    {
                        _voPedido.ARQUIVO = arquivoIm.FileName;
                        _voPedido.PRODUTO = strArrays[9];
                        _voPedido.DESCRICAO1 = strArrays[10];
                        _voPedido.CLIENTE = strArrays[12];
                        _voPedido.PECLIENTE = strArrays[3];
                        _voPedido.ORDCOMPRA = strArrays[3];
                        _voPedido.VOLUME = Convert.ToDecimal(strArrays[8]);
                        _voPedido.STATUS = 0;
                        _voPedido.ETIQUETA = strArrays[0];
                        _voPedido.SEQUENCIA = int.Parse(strArrays[7]);
                        _voPedido.QTDE = 0;
                        _voPedido.IdBox = 1;
                        _voPedido.IdLayout = arquivoIm.LayoutId;
                        _voPedido.DATAINC = DateTime.Now;
                        _listVoPedido.Add(_voPedido);
                    }
                    catch (Exception exception)
                    {
                        throw exception;
                    }
                }
            }

            callBack(arquivoIm.ArquivoItens.Count, 0, _listVoPedido);
        }

        private void InserirCriare(voArquivoIm arquivoIm, Action<int, int, List<PedidoImport>> callBack)
        {
            daPedido _daPedido = new daPedido(this.conexao);
            List<PedidoImport> _listVoPedido = new List<PedidoImport>();

            for (int i = 0; i < arquivoIm.ArquivoItens.Count; i++)
            {
                callBack(arquivoIm.ArquivoItens.Count, i, null);

                var linhaArquivo = arquivoIm.ArquivoItens[i].Linha;

                // Etiqueta pode ser numérica (layout antigo) ou alfanumérica, ex: CCGV0050000266031226757209 (peças/ferragens Criare)
                if (linhaArquivo.Length >= 219)
                {
                    PedidoImport _voPedido = new PedidoImport();
                    try
                    {
                        _voPedido.ARQUIVO = arquivoIm.FileName;
                        _voPedido.STATUS = 0;
                        if (!char.IsDigit(linhaArquivo.Substring(25, 1), 0))
                        {
                            _voPedido.ETIQUETA = linhaArquivo.Substring(0, 24);
                            _voPedido.DESCRICAO1 = linhaArquivo.Substring(24, 80).Replace("  ", " ").Trim();
                            _voPedido.PRODUTO = linhaArquivo.Substring(104, 7).Trim();
                            _voPedido.CLIENTE = linhaArquivo.Substring(111, 40);
                            _voPedido.PECLIENTE = linhaArquivo.Substring(151, 7).Trim();
                            _voPedido.ORDCOMPRA = linhaArquivo.Substring(163, 12).Trim();
                            _voPedido.VOLUME = Convert.ToDecimal(linhaArquivo.Substring(216, 3).Trim());
                        }
                        else
                        {
                            // Etiqueta de 26 posições desloca em +2 todos os campos fixos que vêm depois dela
                            _voPedido.ETIQUETA = linhaArquivo.Substring(0, 26);
                            _voPedido.DESCRICAO1 = linhaArquivo.Substring(26, 80).Replace("  ", " ").Trim();
                            _voPedido.PRODUTO = linhaArquivo.Substring(106, 7).Trim();
                            _voPedido.CLIENTE = linhaArquivo.Substring(113, 40);
                            _voPedido.PECLIENTE = linhaArquivo.Substring(153, 7).Trim();
                            _voPedido.ORDCOMPRA = linhaArquivo.Substring(165, 12).Trim();
                            _voPedido.VOLUME = Convert.ToDecimal(linhaArquivo.Substring(218, 3).Trim());
                        }
                        if (_voPedido.CLIENTE.ToString().Equals(""))
                        {
                            _voPedido.CLIENTE = "NÃO INFORMADO";
                        }
                        _voPedido.QTDE = 0;
                        _voPedido.IdBox = 1;
                        _voPedido.IdLayout = arquivoIm.LayoutId;
                        _voPedido.DATAINC = DateTime.Now;
                        _listVoPedido.Add(_voPedido);
                    }
                    catch (Exception exception)
                    {
                        throw exception;
                    }
                }
            }

            callBack(arquivoIm.ArquivoItens.Count, 0, _listVoPedido);

        }

        private void InserirDalMobile(voArquivoIm arquivoIm, Action<int, int, List<PedidoImport>> callBack)
        {
            daPedido _daPedido = new daPedido(this.conexao);
            List<PedidoImport> _listVoPedido = new List<PedidoImport>();

            for (int i = 0; i < arquivoIm.ArquivoItens.Count; i++)
            {
                callBack(arquivoIm.ArquivoItens.Count, i, null);

                var linhaArquivo = arquivoIm.ArquivoItens[i].Linha;

                string[] strArrays = linhaArquivo.Split(new char[] { ';' });

                PedidoImport _voPedido = new PedidoImport();
                try
                {
                    _voPedido.ARQUIVO = arquivoIm.FileName;
                    _voPedido.PRODUTO = strArrays[2];
                    _voPedido.VOLUME = 0;
                    _voPedido.DESCRICAO1 = strArrays[3];
                    _voPedido.CLIENTE = strArrays[7];
                    if (_voPedido.CLIENTE.Equals(""))
                    {
                        _voPedido.CLIENTE = "NÃO INFORMADO";
                    }
                    _voPedido.PECLIENTE = strArrays[1];
                    _voPedido.ORDCOMPRA = strArrays[1];
                    _voPedido.STATUS = 0;
                    _voPedido.ETIQUETA = strArrays[6];
                    _voPedido.QTDE = 0;
                    _voPedido.IdBox = 1;
                    _voPedido.IdLayout = arquivoIm.LayoutId;
                    _voPedido.DATAINC = DateTime.Now;
                    _listVoPedido.Add(_voPedido);
                }
                catch (Exception exception)
                {
                    throw exception;
                }
            }

            callBack(arquivoIm.ArquivoItens.Count, 0, _listVoPedido);
        }

        private void InserirHRM(voArquivoIm arquivoIm, Action<int, int, List<PedidoImport>> callBack)
        {
            daPedido _daPedido = new daPedido(this.conexao);
            List<PedidoImport> _listVoPedido = new List<PedidoImport>();

            for (int i = 0; i < arquivoIm.ArquivoItens.Count; i++)
            {
                callBack(arquivoIm.ArquivoItens.Count, i, null);

                var linhaArquivo = arquivoIm.ArquivoItens[i].Linha;

                try
                {

                    PedidoImport _voPedido = new PedidoImport();
                    string[] strArrays = linhaArquivo.Split(new char[] { ';' });
                    double num = 0;
                    if (double.TryParse(strArrays[5].Trim(), out num))
                    {
                        _voPedido.ARQUIVO = arquivoIm.FileName;
                        _voPedido.PECLIENTE = strArrays[1].Trim();
                        _voPedido.PRODUTO = strArrays[2].Trim();
                        _voPedido.VOLUME = Convert.ToDecimal(strArrays[6].Trim());
                        _voPedido.DESCRICAO1 = string.Concat(strArrays[3].Trim(), " - ", strArrays[4].Trim());
                        _voPedido.CLIENTE = strArrays[13].Trim();
                        _voPedido.ORDCOMPRA = strArrays[11].Trim();
                        _voPedido.STATUS = 0;
                        _voPedido.QTDE = 1;
                        _voPedido.ETIQUETA = strArrays[5].Trim();
                        _voPedido.IdBox = 1;
                        _voPedido.SEQUENCIA = Convert.ToInt64(strArrays[5].Trim());
                        _voPedido.IdLayout = arquivoIm.LayoutId;
                        _voPedido.DATAINC = DateTime.Now;
                        _listVoPedido.Add(_voPedido);
                    }
                }
                catch (Exception exception)
                {
                    throw exception;
                }
            }

            callBack(arquivoIm.ArquivoItens.Count, 0, _listVoPedido);
        }

        private void InserirIdelli(voArquivoIm arquivoIm, Action<int, int, List<PedidoImport>> callBack)
        {
            daPedido _daPedido = new daPedido(this.conexao);
            List<PedidoImport> _listVoPedido = new List<PedidoImport>();

            for (int i = 0; i < arquivoIm.ArquivoItens.Count; i++)
            {
                callBack(arquivoIm.ArquivoItens.Count, i, null);

                var linhaArquivo = arquivoIm.ArquivoItens[i].Linha;
                string[] strArrays = linhaArquivo.Split(new char[] { ';' });

                PedidoImport _voPedido = new PedidoImport();
                try
                {
                    _voPedido.ARQUIVO = arquivoIm.FileName;
                    _voPedido.PRODUTO = strArrays[4];
                    _voPedido.VOLUME = 0;
                    _voPedido.DESCRICAO1 = strArrays[5];
                    _voPedido.CLIENTE = "LOJA NAO INFORMADA";
                    _voPedido.PECLIENTE = strArrays[1];
                    _voPedido.ORDCOMPRA = strArrays[1];
                    _voPedido.STATUS = 0;
                    _voPedido.ETIQUETA = strArrays[9];
                    _voPedido.QTDE = 0;
                    _voPedido.IdBox = 1;
                    _voPedido.IdLayout = arquivoIm.LayoutId;
                    _voPedido.DATAINC = DateTime.Now;
                    _listVoPedido.Add(_voPedido);
                }
                catch (Exception exception)
                {
                    throw exception;
                }
            }

            callBack(arquivoIm.ArquivoItens.Count, 0, _listVoPedido);
        }

        private void InserirIMOBAL(voArquivoIm arquivoIm, Action<int, int, List<PedidoImport>> callBack)
        {
            daPedido _daPedido = new daPedido(this.conexao);
            List<PedidoImport> _listVoPedido = new List<PedidoImport>();

            for (int i = 0; i < arquivoIm.ArquivoItens.Count; i++)
            {
                callBack(arquivoIm.ArquivoItens.Count, i, null);

                var linhaArquivo = arquivoIm.ArquivoItens[i].Linha;

                try
                {

                    PedidoImport _voPedido = new PedidoImport();
                    string[] strArrays = linhaArquivo.Split(new char[] { ';' });
                    _voPedido.ARQUIVO = arquivoIm.FileName;
                    _voPedido.PECLIENTE = strArrays[0].Trim();
                    _voPedido.PRODUTO = strArrays[3].Trim();
                    _voPedido.VOLUME = 0;
                    _voPedido.DESCRICAO1 = strArrays[4].Trim();
                    _voPedido.CLIENTE = strArrays[2].Trim();
                    _voPedido.ORDCOMPRA = strArrays[1].Trim();
                    _voPedido.STATUS = 0;
                    double num = double.Parse(strArrays[8].Trim());
                    _voPedido.QTDE = Convert.ToDecimal(num.ToString());
                    _voPedido.ETIQUETA = strArrays[7].Trim();
                    _voPedido.IdBox = 1;
                    _voPedido.IdLayout = arquivoIm.LayoutId;
                    _voPedido.DATAINC = DateTime.Now;
                    _listVoPedido.Add(_voPedido);
                }
                catch (Exception exception)
                {
                    throw exception;
                }
            }

            callBack(arquivoIm.ArquivoItens.Count, 0, _listVoPedido);
        }

        private void InserirInusitta(voArquivoIm arquivoIm, Action<int, int, List<PedidoImport>> callBack)
        {
            daPedido _daPedido = new daPedido(this.conexao);
            List<PedidoImport> _listVoPedido = new List<PedidoImport>();

            for (int i = 0; i < arquivoIm.ArquivoItens.Count; i++)
            {
                callBack(arquivoIm.ArquivoItens.Count, i, null);

                var linhaArquivo = arquivoIm.ArquivoItens[i].Linha;

                string[] strArrays = linhaArquivo.Split(new char[] { ',' });
                if (strArrays[11].ToString().Length >= 10)
                {
                    if (char.IsDigit(strArrays[11].ToString(), 1))
                    {
                        PedidoImport _voPedido = new PedidoImport();

                        try
                        {
                            _voPedido.ARQUIVO = arquivoIm.FileName;
                            _voPedido.PRODUTO = strArrays[6];
                            _voPedido.VOLUME = Convert.ToDecimal(strArrays[14]);
                            _voPedido.DESCRICAO1 = strArrays[8];
                            _voPedido.CLIENTE = strArrays[3];
                            if (_voPedido.CLIENTE.Equals(""))
                            {
                                _voPedido.CLIENTE = "NÃO INFORMADO";
                            }
                            _voPedido.PECLIENTE = strArrays[4];
                            _voPedido.ORDCOMPRA = strArrays[4];
                            _voPedido.STATUS = 0;
                            double num = double.Parse(strArrays[11].ToString());
                            _voPedido.ETIQUETA = num.ToString("0000000000000000");
                            _voPedido.QTDE = 0;
                            _voPedido.IdBox = 1;
                            _voPedido.IdLayout = arquivoIm.LayoutId;
                            _voPedido.DATAINC = DateTime.Now;
                            _listVoPedido.Add(_voPedido);
                        }
                        catch (Exception exception)
                        {
                            throw exception;
                        }
                    }
                }
            }

            callBack(arquivoIm.ArquivoItens.Count, 0, _listVoPedido);

        }

        private void InserirItalinea(voArquivoIm arquivoIm, Action<int, int, List<PedidoImport>> callBack)
        {
            daPedido _daPedido = new daPedido(this.conexao);
            List<PedidoImport> _listVoPedido = new List<PedidoImport>();

            for (int i = 0; i < arquivoIm.ArquivoItens.Count; i++)
            {
                callBack(arquivoIm.ArquivoItens.Count, i, null);

                var linhaArquivo = arquivoIm.ArquivoItens[i].Linha;

                PedidoImport _voPedido = new PedidoImport();

                try
                {
                    _voPedido.ARQUIVO = arquivoIm.FileName;
                    _voPedido.PRODUTO = linhaArquivo.Substring(2, 9);
                    _voPedido.VOLUME = Convert.ToDecimal(linhaArquivo.Substring(11, 2));
                    _voPedido.ORDCOMPRA = linhaArquivo.Substring(163, 11);
                    _voPedido.SEQUENCIA = int.Parse(linhaArquivo.Substring(20, 3));
                    _voPedido.STATUS = 0;
                    if (!char.IsDigit(linhaArquivo.Substring(25, 1), 0))
                    {
                        _voPedido.ETIQUETA = linhaArquivo.Substring(0, 24);
                        _voPedido.DESCRICAO1 = linhaArquivo.Substring(24, 80).Replace("  ", " ").Trim();
                        _voPedido.CLIENTE = linhaArquivo.Substring(111, 40);
                        _voPedido.PECLIENTE = linhaArquivo.Substring(151, 12).Trim();
                    }
                    else
                    {
                        _voPedido.ETIQUETA = linhaArquivo.Substring(0, 26);
                        _voPedido.DESCRICAO1 = linhaArquivo.Substring(26, 80).Replace("  ", " ").Trim();
                        _voPedido.CLIENTE = linhaArquivo.Substring(113, 40);
                        _voPedido.PECLIENTE = linhaArquivo.Substring(153, 12).Trim();
                    }
                    if (_voPedido.CLIENTE.ToString().Equals(""))
                    {
                        _voPedido.CLIENTE = "NÃO INFORMADO";
                    }
                    _voPedido.QTDE = 0;
                    _voPedido.IdBox = 1;
                    _voPedido.IdLayout = arquivoIm.LayoutId;
                    _voPedido.DATAINC = DateTime.Now;
                    _listVoPedido.Add(_voPedido);
                }
                catch (Exception exception)
                {
                    throw exception;
                }
            }

            callBack(arquivoIm.ArquivoItens.Count, 0, _listVoPedido);
        }

        private void InserirItalineaLoja(voArquivoIm arquivoIm, Action<int, int, List<PedidoImport>> callBack)
        {
            daPedido _daPedido = new daPedido(this.conexao);

            List<PedidoImport> _listVoPedido = new List<PedidoImport>();

            for (int i = 0; i < arquivoIm.ArquivoItens.Count; i++)
            {
                callBack(arquivoIm.ArquivoItens.Count, i, null);

                var linhaArquivo = arquivoIm.ArquivoItens[i].Linha;

                PedidoImport _voPedido = new PedidoImport();
                try
                {
                    _voPedido.ARQUIVO = arquivoIm.FileName;
                    _voPedido.PRODUTO = "0";
                    _voPedido.VOLUME = 0;
                    _voPedido.DESCRICAO1 = linhaArquivo.Substring(26, 80).Replace("  ", " ").Trim();
                    _voPedido.CLIENTE = "NÃO INFORMADO";
                    _voPedido.PECLIENTE = linhaArquivo.Substring(104, 12).Trim();
                    _voPedido.ORDCOMPRA = linhaArquivo.Substring(116, 12).Trim();
                    _voPedido.SEQUENCIA = 0;
                    _voPedido.STATUS = 0;
                    _voPedido.ETIQUETA = linhaArquivo.Substring(0, 26).Trim();
                    _voPedido.QTDE = 0;
                    _voPedido.IdBox = 1;
                    _voPedido.IdLayout = arquivoIm.LayoutId;
                    _voPedido.DATAINC = DateTime.Now;
                    _listVoPedido.Add(_voPedido);
                }
                catch (Exception exception)
                {
                    throw exception;
                }
            }

            callBack(arquivoIm.ArquivoItens.Count, 0, _listVoPedido);
        }

        private void InserirKasak(voArquivoIm arquivoIm, Action<int, int, List<PedidoImport>> callBack)
        {
            daPedido _daPedido = new daPedido(this.conexao);
            List<PedidoImport> _listVoPedido = new List<PedidoImport>();

            for (int i = 0; i < arquivoIm.ArquivoItens.Count; i++)
            {
                callBack(arquivoIm.ArquivoItens.Count, i, null);

                var linhaArquivo = arquivoIm.ArquivoItens[i].Linha;

                string[] strArrays = linhaArquivo.Split(new char[] { ';' });

                PedidoImport _voPedido = new PedidoImport();
                try
                {
                    _voPedido.ARQUIVO = arquivoIm.FileName;
                    _voPedido.PRODUTO = strArrays[4];
                    _voPedido.DESCRICAO1 = strArrays[5];
                    _voPedido.CLIENTE = "NÃO INFORMADO";
                    _voPedido.PECLIENTE = strArrays[1];
                    _voPedido.ORDCOMPRA = strArrays[12];
                    _voPedido.STATUS = 0;
                    if (strArrays[9].Substring(0, 5) == "80060")
                    {
                        _voPedido.VOLUME = Convert.ToDecimal(strArrays[9].Substring(20, 2));
                    }
                    else if (strArrays[9].Substring(0, 3) == "010")
                    {
                        _voPedido.VOLUME = 1;
                    }
                    _voPedido.ETIQUETA = strArrays[9];
                    _voPedido.QTDE = 0;
                    _voPedido.IdBox = 1;
                    _voPedido.IdLayout = arquivoIm.LayoutId;
                    _voPedido.DATAINC = DateTime.Now;
                    _listVoPedido.Add(_voPedido);
                }
                catch (Exception exception)
                {
                    throw exception;
                }
            }

            callBack(arquivoIm.ArquivoItens.Count, 0, _listVoPedido);
        }

        private void InserirMANFROI(voArquivoIm arquivoIm, Action<int, int, List<PedidoImport>> callBack)
        {
            daPedido _daPedido = new daPedido(this.conexao);
            List<PedidoImport> _listVoPedido = new List<PedidoImport>();

            for (int i = 0; i < arquivoIm.ArquivoItens.Count; i++)
            {
                callBack(arquivoIm.ArquivoItens.Count, i, null);

                var linhaArquivo = arquivoIm.ArquivoItens[i].Linha;

                try
                {
                    PedidoImport _voPedido = new PedidoImport()
                    {
                        ARQUIVO = arquivoIm.FileName,
                        PECLIENTE = linhaArquivo.Substring(6, 6).Trim(),
                        PRODUTO = linhaArquivo.Substring(279, 70).Trim(),
                        VOLUME = 0,
                        DESCRICAO1 = linhaArquivo.Substring(279, 70).Trim(),
                        CLIENTE = linhaArquivo.Substring(279, 70).Trim(),
                        ORDCOMPRA = linhaArquivo.Substring(6, 6).Trim(),
                        STATUS = 0,
                        QTDE = 1,
                        ETIQUETA = linhaArquivo.Substring(349, 10).Trim(),
                        IdBox = 1,
                        SEQUENCIA = 0,
                        IdLayout = arquivoIm.LayoutId,
                        DATAINC = DateTime.Now
                    };
                    _listVoPedido.Add(_voPedido);
                }
                catch (Exception exception)
                {
                    throw exception;
                }
            }

            callBack(arquivoIm.ArquivoItens.Count, 0, _listVoPedido);
        }

        private void InserirMarel(voArquivoIm arquivoIm, Action<int, int, List<PedidoImport>> callBack)
        {
            daPedido _daPedido = new daPedido(this.conexao);
            List<PedidoImport> _listVoPedido = new List<PedidoImport>();

            for (int i = 0; i < arquivoIm.ArquivoItens.Count; i++)
            {
                callBack(arquivoIm.ArquivoItens.Count, i, null);

                var linhaArquivo = arquivoIm.ArquivoItens[i].Linha;

                string[] strArrays = linhaArquivo.Split(new char[] { ';' });
                if (!string.IsNullOrWhiteSpace(strArrays[0]))
                {
                    if (char.IsDigit(strArrays[0].ToString(), 0))
                    {

                        PedidoImport _voPedido = new PedidoImport();
                        try
                        {
                            _voPedido.ARQUIVO = arquivoIm.FileName;
                            _voPedido.PRODUTO = strArrays[6];
                            _voPedido.VOLUME = Convert.ToDecimal(strArrays[5]);
                            _voPedido.DESCRICAO1 = strArrays[8];
                            _voPedido.CLIENTE = "NÃO INFORMADO";
                            _voPedido.SEQUENCIA = int.Parse(strArrays[4].ToString());
                            _voPedido.PECLIENTE = strArrays[0];
                            _voPedido.ORDCOMPRA = strArrays[0];
                            _voPedido.STATUS = 0;
                            double num = double.Parse(strArrays[3]);
                            _voPedido.ETIQUETA = num.ToString("0000000000");
                            _voPedido.QTDE = 0;
                            _voPedido.IdBox = 1;
                            _voPedido.IdLayout = arquivoIm.LayoutId;
                            _voPedido.DATAINC = DateTime.Now;
                            _listVoPedido.Add(_voPedido);
                        }
                        catch (Exception exception)
                        {
                            throw exception;
                        }
                    }
                }
            }

            callBack(arquivoIm.ArquivoItens.Count, 0, _listVoPedido);
        }

        private void InserirRIMO(voArquivoIm arquivoIm, Action<int, int, List<PedidoImport>> callBack)
        {
            daPedido _daPedido = new daPedido(this.conexao);
            List<PedidoImport> _listVoPedido = new List<PedidoImport>();

            for (int i = 0; i < arquivoIm.ArquivoItens.Count; i++)
            {
                callBack(arquivoIm.ArquivoItens.Count, i, null);

                var linhaArquivo = arquivoIm.ArquivoItens[i].Linha;

                string[] strArrays = linhaArquivo.Split(new char[] { ';' });
                double num = 0;
                if (double.TryParse(strArrays[7].ToString(), out num))
                {

                    PedidoImport _voPedido = new PedidoImport();
                    try
                    {
                        _voPedido.ARQUIVO = arquivoIm.FileName;
                        _voPedido.PRODUTO = strArrays[6];
                        _voPedido.DESCRICAO1 = strArrays[9];
                        _voPedido.CLIENTE = strArrays[5];
                        _voPedido.PECLIENTE = strArrays[3];
                        _voPedido.ORDCOMPRA = strArrays[3];
                        _voPedido.VOLUME = Convert.ToDecimal(strArrays[2]);
                        _voPedido.STATUS = 0;
                        _voPedido.ETIQUETA = strArrays[7];
                        _voPedido.QTDE = 0;
                        _voPedido.IdBox = 1;
                        _voPedido.IdLayout = arquivoIm.LayoutId;
                        _voPedido.DATAINC = DateTime.Now;
                        _listVoPedido.Add(_voPedido);
                    }
                    catch (Exception exception)
                    {
                        throw exception;
                    }
                }
            }

            callBack(arquivoIm.ArquivoItens.Count, 0, _listVoPedido);
        }

        private void InserirRomanzza(voArquivoIm arquivoIm, Action<int, int, List<PedidoImport>> callBack)
        {
            daPedido _daPedido = new daPedido(this.conexao);
            List<PedidoImport> _listVoPedido = new List<PedidoImport>();

            for (int i = 0; i < arquivoIm.ArquivoItens.Count; i++)
            {
                callBack(arquivoIm.ArquivoItens.Count, i, null);

                var linhaArquivo = arquivoIm.ArquivoItens[i].Linha;

                string[] strArrays = linhaArquivo.Split(new char[] { ';' });

                PedidoImport _voPedido = new PedidoImport();
                try
                {
                    _voPedido.ARQUIVO = arquivoIm.FileName;
                    _voPedido.PRODUTO = strArrays[2];
                    _voPedido.VOLUME = Convert.ToDecimal(strArrays[5]);
                    _voPedido.DESCRICAO1 = strArrays[3];
                    _voPedido.CLIENTE = strArrays[8];
                    if (_voPedido.CLIENTE.Equals(""))
                    {
                        _voPedido.CLIENTE = "NÃO INFORMADO";
                    }
                    _voPedido.PECLIENTE = strArrays[0];
                    _voPedido.ORDCOMPRA = strArrays[1];
                    _voPedido.STATUS = 0;
                    _voPedido.ETIQUETA = strArrays[4];
                    _voPedido.QTDE = 0;
                    _voPedido.IdBox = 1;
                    _voPedido.IdLayout = arquivoIm.LayoutId;
                    _voPedido.DATAINC = DateTime.Now;
                    _listVoPedido.Add(_voPedido);
                }
                catch (Exception exception)
                {
                    throw exception;
                }
            }

            callBack(arquivoIm.ArquivoItens.Count, 0, _listVoPedido);
        }

        private void InserirRudnick(voArquivoIm arquivoIm, Action<int, int, List<PedidoImport>> callBack)
        {
            daPedido _daPedido = new daPedido(this.conexao);
            List<PedidoImport> _listVoPedido = new List<PedidoImport>();

            for (int i = 0; i < arquivoIm.ArquivoItens.Count; i++)
            {
                callBack(arquivoIm.ArquivoItens.Count, i, null);

                var linhaArquivo = arquivoIm.ArquivoItens[i].Linha;
                string[] strArrays = linhaArquivo.Split(new char[] { ';' });
                if (char.IsDigit(strArrays[6].ToString(), 0))
                {
                    PedidoImport _voPedido = new PedidoImport();
                    try
                    {
                        _voPedido.ARQUIVO = arquivoIm.FileName;
                        _voPedido.PRODUTO = strArrays[0];
                        _voPedido.VOLUME = Convert.ToDecimal(strArrays[2]);
                        _voPedido.DESCRICAO1 = strArrays[1];
                        _voPedido.CLIENTE = strArrays[4];
                        if (_voPedido.CLIENTE.Equals(""))
                        {
                            _voPedido.CLIENTE = "NÃO INFORMADO";
                        }
                        _voPedido.SEQUENCIA = int.Parse(strArrays[9].ToString());
                        _voPedido.PECLIENTE = strArrays[5];
                        _voPedido.ORDCOMPRA = strArrays[3];
                        _voPedido.STATUS = 0;
                        double num = double.Parse(strArrays[7].ToString());
                        string str = num.ToString("00");
                        num = double.Parse(strArrays[8].ToString());
                        string str1 = num.ToString("00000000");
                        num = double.Parse(strArrays[5].ToString());
                        string str2 = num.ToString("000000");
                        num = double.Parse(strArrays[9].ToString());
                        _voPedido.ETIQUETA = string.Concat(str, str1, str2, num.ToString("0000"));
                        _voPedido.QTDE = Convert.ToDecimal(strArrays[6]);
                        _voPedido.IdBox = 1;
                        _voPedido.IdLayout = arquivoIm.LayoutId;
                        _voPedido.DATAINC = DateTime.Now;
                        _listVoPedido.Add(_voPedido);
                    }
                    catch (Exception exception)
                    {
                        throw exception;
                    }
                }
            }

            callBack(arquivoIm.ArquivoItens.Count, 0, _listVoPedido);
        }

        private void InserirSCA(voArquivoIm arquivoIm, Action<int, int, List<PedidoImport>> callBack)
        {
            daPedido _daPedido = new daPedido(this.conexao);
            List<PedidoImport> _listVoPedido = new List<PedidoImport>();

            for (int i = 0; i < arquivoIm.ArquivoItens.Count; i++)
            {
                callBack(arquivoIm.ArquivoItens.Count, i, null);

                var linhaArquivo = arquivoIm.ArquivoItens[i].Linha;

                string[] strArrays = linhaArquivo.Split(new char[] { ';' });
                if (strArrays[0] == "01")
                {
                    this.LItem.Add(new item()
                    {
                        nome = strArrays[4].Trim(),
                        valor = strArrays[2].Trim()
                    });
                }
                if (strArrays[0] == "02")
                {
                    this.LSubItem.Add(new item()
                    {
                        nome = linhaArquivo
                    });
                }
                else if (strArrays[0] == "03")
                {

                    PedidoImport _voPedido = new PedidoImport();
                    foreach (item lSubItem in this.LSubItem)
                    {
                        string[] strArrays1 = lSubItem.nome.Split(new char[] { ';' });
                        if ((strArrays[2].Trim() != strArrays1[2].Trim() ? false : strArrays[3].Trim() == strArrays1[3].Trim()))
                        {
                            double num = double.Parse(strArrays[4].Trim());
                            _voPedido.ETIQUETA = num.ToString();
                            strArrays = strArrays1;
                            break;
                        }
                    }
                    if (_voPedido.ETIQUETA != "")
                    {
                        _voPedido.ARQUIVO = arquivoIm.FileName;
                        _voPedido.PRODUTO = strArrays[5].Trim();
                        _voPedido.VOLUME = Convert.ToDecimal(strArrays[10].Trim());
                        _voPedido.DESCRICAO1 = strArrays[7].Trim();
                        _voPedido.PECLIENTE = strArrays[2].Trim();
                        foreach (item lItem in this.LItem)
                        {
                            if (lItem.valor != strArrays[2].Trim())
                            {
                                continue;
                            }
                            _voPedido.CLIENTE = lItem.nome;
                        }
                        _voPedido.ORDCOMPRA = strArrays[2].Trim();
                        _voPedido.STATUS = 0;
                        _voPedido.QTDE = Convert.ToDecimal(strArrays[9].Trim());
                        _voPedido.IdBox = 1;
                        _voPedido.IdLayout = arquivoIm.LayoutId;
                        _voPedido.DATAINC = DateTime.Now;
                        _listVoPedido.Add(_voPedido);
                    }
                }
            }

            callBack(arquivoIm.ArquivoItens.Count, 0, _listVoPedido);

        }

        private void InserirSimonetto(voArquivoIm arquivoIm, Action<int, int, List<PedidoImport>> callBack)
        {
            daPedido _daPedido = new daPedido(this.conexao);
            List<PedidoImport> _listVoPedido = new List<PedidoImport>();

            for (int i = 0; i < arquivoIm.ArquivoItens.Count; i++)
            {
                callBack(arquivoIm.ArquivoItens.Count, i, null);

                var linhaArquivo = arquivoIm.ArquivoItens[i].Linha;

                try
                {

                    PedidoImport _voPedido = new PedidoImport();
                    string[] strArrays = linhaArquivo.Split(new char[] { ';' });
                    _voPedido.ARQUIVO = arquivoIm.FileName;
                    _voPedido.PECLIENTE = strArrays[0].Trim();
                    _voPedido.PRODUTO = strArrays[1].Trim();
                    _voPedido.VOLUME = Convert.ToDecimal(strArrays[4].Trim());
                    _voPedido.DESCRICAO1 = strArrays[2].Trim();
                    _voPedido.CLIENTE = "NÃO INFORMADO";
                    _voPedido.ORDCOMPRA = string.Concat("PED", strArrays[0].Trim());
                    _voPedido.STATUS = 0;
                    _voPedido.QTDE = Convert.ToDecimal(strArrays[5].Trim());
                    _voPedido.ETIQUETA = strArrays[3].Trim();
                    _voPedido.IdBox = 1;
                    _voPedido.IdLayout = arquivoIm.LayoutId;
                    _voPedido.DATAINC = DateTime.Now;
                    _listVoPedido.Add(_voPedido);
                }
                catch (Exception exception)
                {
                    throw exception;
                }
            }

            callBack(arquivoIm.ArquivoItens.Count, 0, _listVoPedido);
        }

        private void InserirSimonettoV2(voArquivoIm arquivoIm, Action<int, int, List<PedidoImport>> callBack)
        {
            daPedido _daPedido = new daPedido(this.conexao);
            List<PedidoImport> _listVoPedido = new List<PedidoImport>();

            for (int i = 0; i < arquivoIm.ArquivoItens.Count; i++)
            {
                callBack(arquivoIm.ArquivoItens.Count, i, null);

                var linhaArquivo = arquivoIm.ArquivoItens[i].Linha;

                try
                {

                    PedidoImport _voPedido = new PedidoImport();
                    string[] strArrays = linhaArquivo.Split(new char[] { ';' });
                    _voPedido.ARQUIVO = arquivoIm.FileName;
                    _voPedido.PECLIENTE = strArrays[2].Trim();
                    _voPedido.PRODUTO = strArrays[4].Trim();
                    _voPedido.VOLUME = Convert.ToDecimal(strArrays[9].Trim());
                    _voPedido.DESCRICAO1 = string.Concat(strArrays[5].Trim(), " - ", strArrays[6].Trim());
                    _voPedido.CLIENTE = strArrays[3].Trim();
                    _voPedido.ORDCOMPRA = string.Concat("PED", strArrays[2].Trim());
                    _voPedido.STATUS = 0;
                    _voPedido.QTDE = 1;
                    _voPedido.ETIQUETA = strArrays[8].Trim();
                    _voPedido.IdBox = 1;
                    _voPedido.IdLayout = arquivoIm.LayoutId;
                    _voPedido.DATAINC = DateTime.Now;
                    _listVoPedido.Add(_voPedido);
                }
                catch (Exception exception)
                {
                    throw exception;
                }
            }

            callBack(arquivoIm.ArquivoItens.Count, 0, _listVoPedido);
        }

        private void InserirTodeschini(voArquivoIm arquivoIm, Action<int, int, List<PedidoImport>> callBack)
        {
            daPedido _daPedido = new daPedido(this.conexao);
            List<PedidoImport> _listVoPedido = new List<PedidoImport>();

            for (int i = 0; i < arquivoIm.ArquivoItens.Count; i++)
            {
                var _voPedido = new PedidoImport();

                try
                {
                    callBack(arquivoIm.ArquivoItens.Count, i, null);

                    var linhaArquivo = arquivoIm.ArquivoItens[i].Linha;

                    _voPedido.ARQUIVO = $"{arquivoIm.FileName}_{arquivoIm.LayoutId}";
                    _voPedido.PRODUTO = linhaArquivo.Substring(2, 9);

                    if (decimal.TryParse(linhaArquivo.Substring(11, 2), out decimal _volume))
                        _voPedido.VOLUME = _volume;

                    _voPedido.ORDCOMPRA = linhaArquivo.Substring(163, 11);

                    if (decimal.TryParse(linhaArquivo.Substring(20, 3).ToString(), out decimal _sequencia))
                        _voPedido.SEQUENCIA = _sequencia;

                    _voPedido.STATUS = 0;
                    if (!char.IsDigit(linhaArquivo.Substring(25, 1), 0))
                    {
                        _voPedido.ETIQUETA = linhaArquivo.Substring(0, 24);
                        _voPedido.DESCRICAO1 = linhaArquivo.Substring(24, 80).Replace("  ", " ").Trim();
                        _voPedido.CLIENTE = linhaArquivo.Substring(111, 40);
                        _voPedido.PECLIENTE = linhaArquivo.Substring(151, 7).Trim();
                    }
                    else
                    {
                        _voPedido.ETIQUETA = linhaArquivo.Substring(0, 26);
                        _voPedido.DESCRICAO1 = linhaArquivo.Substring(26, 80).Replace("  ", " ").Trim();
                        _voPedido.CLIENTE = linhaArquivo.Substring(113, 40);
                        _voPedido.PECLIENTE = linhaArquivo.Substring(153, 8).Trim();
                    }
                    if (_voPedido.CLIENTE.ToString().Equals(""))
                    {
                        _voPedido.CLIENTE = "NÃO INFORMADO";
                    }
                    _voPedido.QTDE = 0;
                    _voPedido.IdBox = 1;
                    _voPedido.IdLayout = arquivoIm.LayoutId;
                    _voPedido.DATAINC = DateTime.Now.Date;

                    _listVoPedido.Add(_voPedido);

                }
                catch (Exception ex)
                {
                    throw new Exception(JsonConvert.SerializeObject(_voPedido), ex);
                }
            }

            callBack(arquivoIm.ArquivoItens.Count, 0, _listVoPedido);

        }

        private void InserirTranspaese(voArquivoIm arquivoIm, Action<int, int, List<PedidoImport>> callBack)
        {
            daPedido _daPedido = new daPedido(this.conexao);

            List<PedidoImport> _listVoPedido = new List<PedidoImport>();

            for (int i = 0; i < arquivoIm.ArquivoItens.Count; i++)
            {
                callBack(arquivoIm.ArquivoItens.Count, i, null);

                var linhaArquivo = arquivoIm.ArquivoItens[i].Linha;

                PedidoImport _voPedido = new PedidoImport();
                try
                {
                    string str = linhaArquivo.Substring(20, 26);
                    _voPedido.ARQUIVO = arquivoIm.FileName;
                    _voPedido.PRODUTO = linhaArquivo.Substring(16, 4);
                    int num = int.Parse(linhaArquivo.Substring(46, 4).ToString());
                    _voPedido.VOLUME = Convert.ToDecimal(num.ToString());
                    _voPedido.DESCRICAO1 = linhaArquivo.Substring(70, 120).Trim();
                    _voPedido.CLIENTE = "";
                    if (_voPedido.CLIENTE.Equals(""))
                    {
                        _voPedido.CLIENTE = "NÃO INFORMADO";
                    }
                    _voPedido.PECLIENTE = linhaArquivo.Substring(36, 7);
                    _voPedido.ORDCOMPRA = "--";
                    _voPedido.SEQUENCIA = int.Parse(str.Substring(str.Length - 1, 1));
                    _voPedido.STATUS = 0;
                    _voPedido.ETIQUETA = str;
                    _voPedido.QTDE = 0;
                    _voPedido.IdBox = 1;
                    _voPedido.IdLayout = arquivoIm.LayoutId;
                    _voPedido.DATAINC = DateTime.Now;
                    _listVoPedido.Add(_voPedido);
                }
                catch (Exception exception)
                {
                    throw exception;
                }
            }

            callBack(arquivoIm.ArquivoItens.Count, 0, _listVoPedido);
        }

        private void InserirUnicasa(voArquivoIm arquivoIm, Action<int, int, List<PedidoImport>> callBack)
        {
            daPedido _daPedido = new daPedido(this.conexao);
            List<PedidoImport> _listVoPedido = new List<PedidoImport>();

            for (int i = 0; i < arquivoIm.ArquivoItens.Count; i++)
            {
                callBack(arquivoIm.ArquivoItens.Count, i, null);

                var linhaArquivo = arquivoIm.ArquivoItens[i].Linha;

                double num = 0;
                if (double.TryParse(linhaArquivo.Substring(1, 1), out num))
                {
                    PedidoImport _voPedido = new PedidoImport()
                    {
                        ARQUIVO = arquivoIm.FileName,
                        PRODUTO = linhaArquivo.Substring(124, 5),
                        VOLUME = Convert.ToDecimal(linhaArquivo.Substring(149, 3)),
                        DESCRICAO1 = linhaArquivo.Substring(73, 50),
                        CLIENTE = linhaArquivo.Substring(14, 50)
                    };
                    if (_voPedido.CLIENTE.Equals(""))
                    {
                        _voPedido.CLIENTE = "NÃO INFORMADO";
                    }
                    _voPedido.PECLIENTE = linhaArquivo.Substring(141, 7);
                    _voPedido.ORDCOMPRA = linhaArquivo.Substring(173, 12);
                    _voPedido.STATUS = 0;
                    _voPedido.ETIQUETA = linhaArquivo.Substring(129, 23);
                    _voPedido.QTDE = 0;
                    _voPedido.IdBox = 1;
                    _voPedido.IdLayout = arquivoIm.LayoutId;
                    _voPedido.DATAINC = DateTime.Now;
                    _listVoPedido.Add(_voPedido);
                }
            }

            callBack(arquivoIm.ArquivoItens.Count, 0, _listVoPedido);
        }

        private void InserirVitta(voArquivoIm arquivoIm, Action<int, int, List<PedidoImport>> callBack)
        {
            daPedido _daPedido = new daPedido(this.conexao);
            List<PedidoImport> _listVoPedido = new List<PedidoImport>();

            for (int i = 0; i < arquivoIm.ArquivoItens.Count; i++)
            {
                callBack(arquivoIm.ArquivoItens.Count, i, null);

                var linhaArquivo = arquivoIm.ArquivoItens[i].Linha;

                string[] strArrays = linhaArquivo.Split(new char[] { ';' });
                if (strArrays[8].ToString().Length >= 8)
                {
                    if (char.IsDigit(strArrays[8].ToString(), 1))
                    {
                        PedidoImport _voPedido = new PedidoImport();

                        try
                        {
                            _voPedido.ARQUIVO = arquivoIm.FileName;
                            _voPedido.PRODUTO = strArrays[5];
                            _voPedido.VOLUME = 0;
                            _voPedido.DESCRICAO1 = strArrays[6];
                            _voPedido.CLIENTE = strArrays[0];
                            if (_voPedido.CLIENTE.Equals(""))
                            {
                                _voPedido.CLIENTE = "NÃO INFORMADO";
                            }
                            _voPedido.PECLIENTE = strArrays[2];
                            _voPedido.ORDCOMPRA = strArrays[2];
                            _voPedido.STATUS = 0;
                            double num = double.Parse(strArrays[8].ToString());
                            _voPedido.ETIQUETA = num.ToString("0000000000");
                            _voPedido.QTDE = 0;
                            _voPedido.IdBox = 1;
                            _voPedido.IdLayout = arquivoIm.LayoutId;
                            _voPedido.DATAINC = DateTime.Now;
                            _listVoPedido.Add(_voPedido);
                        }
                        catch (Exception exception)
                        {
                            throw exception;
                        }
                    }
                }
            }

            callBack(arquivoIm.ArquivoItens.Count, 0, _listVoPedido);
        }

        private void InserirVivatto(voArquivoIm arquivoIm, Action<int, int, List<PedidoImport>> callBack)
        {
            daPedido _daPedido = new daPedido(this.conexao);

            List<PedidoImport> _listVoPedido = new List<PedidoImport>();

            for (int i = 0; i < arquivoIm.ArquivoItens.Count; i++)
            {
                callBack(arquivoIm.ArquivoItens.Count, i, null);

                var linhaArquivo = arquivoIm.ArquivoItens[i].Linha;

                PedidoImport _voPedido = new PedidoImport();
                string[] strArrays = linhaArquivo.Split(new char[] { ';' });
                if (strArrays.Length >= 9)
                {
                    _voPedido.ARQUIVO = arquivoIm.FileName;
                    _voPedido.PECLIENTE = strArrays[1].Trim();
                    _voPedido.PRODUTO = strArrays[2].Trim();
                    _voPedido.VOLUME = Convert.ToDecimal(strArrays[5].Trim());
                    _voPedido.DESCRICAO1 = string.Concat(strArrays[3].Trim(), " - ", strArrays[4].Trim());
                    _voPedido.CLIENTE = strArrays[7].Trim();
                    _voPedido.ORDCOMPRA = strArrays[9].Trim();
                    _voPedido.STATUS = 0;
                    _voPedido.QTDE = 1;
                    _voPedido.ETIQUETA = strArrays[8].Trim();
                    _voPedido.IdBox = 1;
                    _voPedido.SEQUENCIA = Convert.ToInt32(strArrays[5].Trim());
                    _voPedido.IdLayout = arquivoIm.LayoutId;
                    _voPedido.DATAINC = DateTime.Now;
                    _listVoPedido.Add(_voPedido);
                }
            }

            callBack(arquivoIm.ArquivoItens.Count, 0, _listVoPedido);
        }

        private void InserirBARTZ(voArquivoIm arquivoIm, Action<int, int, List<PedidoImport>> callBack)
        {
            List<PedidoImport> _listVoPedido = new List<PedidoImport>();
            daPedido _daPedido = new daPedido(this.conexao);
            PedidoImport _voPedido = new PedidoImport();

            for (int i = 0; i < arquivoIm.ArquivoItens.Count; i++)
            {
                callBack(arquivoIm.ArquivoItens.Count, i, null);

                string[] strArrays = arquivoIm.ArquivoItens[i].Linha.Split(new char[] { ';' });
                if (strArrays.Length >= 20)
                {
                    _voPedido.ARQUIVO = arquivoIm.FileName;
                    _voPedido.PECLIENTE = "";
                    _voPedido.PRODUTO = "";
                    _voPedido.VOLUME = Convert.ToDecimal(i.ToString());
                    _voPedido.DESCRICAO1 = $"Volume: {i}";
                    _voPedido.CLIENTE = strArrays[12].Trim();
                    _voPedido.ORDCOMPRA = strArrays[10].Trim();
                    _voPedido.STATUS = 0;
                    _voPedido.QTDE = 1;
                    _voPedido.ETIQUETA = strArrays[0].Trim();
                    _voPedido.IdBox = 1;
                    _voPedido.SEQUENCIA = i;
                    _voPedido.IdLayout = arquivoIm.LayoutId;
                    _voPedido.DATAINC = DateTime.Now;

                    _listVoPedido.Add(_voPedido);
                }
            }

            callBack(arquivoIm.ArquivoItens.Count, 0, _listVoPedido);
        }

        private void InserirMovelMar(voArquivoIm arquivoIm, Action<int, int, List<PedidoImport>> callBack)
        {
            List<PedidoImport> _listVoPedido = new List<PedidoImport>();
            daPedido _daPedido = new daPedido(this.conexao);

            for (int i = 0; i < arquivoIm.ArquivoItens.Count; i++)
            {
                callBack(arquivoIm.ArquivoItens.Count, i, null);

                PedidoImport _voPedido = new PedidoImport();

                if (!string.IsNullOrEmpty(arquivoIm.ArquivoItens[i].Linha))
                {
                    string[] strArrays = arquivoIm.ArquivoItens[i].Linha.Split(new char[] { ';' });

                    _voPedido.ARQUIVO = arquivoIm.FileName;
                    _voPedido.PECLIENTE = strArrays[13].Trim();
                    _voPedido.PRODUTO = strArrays[13].Trim();
                    _voPedido.VOLUME = 0;
                    _voPedido.DESCRICAO1 = strArrays[10].Trim(); ;
                    _voPedido.CLIENTE = strArrays[2].Trim();
                    _voPedido.ORDCOMPRA = strArrays[12].Trim();
                    _voPedido.STATUS = 0;
                    _voPedido.QTDE = Convert.ToDecimal(strArrays[14]);
                    _voPedido.ETIQUETA = strArrays[0].Trim();
                    _voPedido.IdBox = 1;
                    _voPedido.SEQUENCIA = 0;
                    _voPedido.IdLayout = arquivoIm.LayoutId;
                    _voPedido.DATAINC = DateTime.Now;

                    _listVoPedido.Add(_voPedido);
                }
            };

            callBack(arquivoIm.ArquivoItens.Count, 0, _listVoPedido);
        }

        public List<voPedido> montaLista(DataTable dt)
        {
            List<voPedido> voPedidos = new List<voPedido>();
            foreach (DataRow row in dt.Rows)
            {
                voPedido _voPedido = new voPedido()
                {
                    ID = int.Parse(row["ID"].ToString()),
                    ARQUIVO = row["ARQUIVO"].ToString(),
                    PRODUTO = row["PRODUTO"].ToString(),
                    VOLUME = row["VOLUME"].ToString(),
                    SEQUENCIA = long.Parse(row["SEQUENCIA"].ToString()),
                    DESCRICAO1 = row["DESCRICAO1"].ToString(),
                    CLIENTE = row["CLIENTE"].ToString(),
                    PECLIENTE = row["PECLIENTE"].ToString(),
                    ORDCOMPRA = row["ORDCOMPRA"].ToString(),
                    STATUS = row["STATUS"].ToString(),
                    DATAINC = DateTime.Parse(row["DATAINC"].ToString()),
                    ETIQUETA = row["ETIQUETA"].ToString(),
                    QTDE = row["QTDE"].ToString(),
                    PECOMPUTADOR = row["PECOMPUTADOR"].ToString(),
                    IdLayout = int.Parse(row["IdLayout"].ToString()),
                    IdBox = int.Parse(row["IdBox"].ToString()),
                    FlBloqueio = bool.Parse(row["FlBloqueio"].ToString())
                };
                voPedidos.Add(_voPedido);
            }
            return voPedidos;
        }

        private void MontarPedidoTb()
        {
            this.PedidoTB.Columns.Add("ARQUIVO", typeof(string));
            this.PedidoTB.Columns.Add("PRODUTO", typeof(string));
            this.PedidoTB.Columns.Add("VOLUME", typeof(string));
            this.PedidoTB.Columns.Add("DESCRICAO1", typeof(string));
            this.PedidoTB.Columns.Add("CLIENTE", typeof(string));
            this.PedidoTB.Columns.Add("PECLIENTE", typeof(string));
            this.PedidoTB.Columns.Add("ORDCOMPRA", typeof(string));
            this.PedidoTB.Columns.Add("STATUS", typeof(int));
            this.PedidoTB.Columns.Add("ETIQUETA", typeof(string));
            this.PedidoTB.Columns.Add("QTDE", typeof(int));
            this.PedidoTB.Columns.Add("IdBox", typeof(int));
            this.PedidoTB.Columns.Add("IdLayout", typeof(int));
            this.PedidoTB.Columns.Add("DATAINC", typeof(DateTime));
        }

        private void InserirEvviva(voArquivoIm arquivoIm, Action<int, int, List<PedidoImport>> callBack)
        {
            string cliente = "";
            List<PedidoImport> _voPedidoList = new List<PedidoImport>();
            List<PedidoImport> _listVoPedido = new List<PedidoImport>();

            for (int i = 0; i < arquivoIm.ArquivoItens.Count; i++)
            {
                callBack(arquivoIm.ArquivoItens.Count, i, null);

                var linhaArquivo = arquivoIm.ArquivoItens[i].Linha;

                if (linhaArquivo.Length < 3)
                    continue;

                if (linhaArquivo.Substring(0, 3) == "515")
                {
                    cliente = linhaArquivo.Substring(3, 50).Trim();
                }

                if (linhaArquivo.Substring(0, 3) == "512")
                {
                    var _voPedido = new PedidoImport();

                    _voPedido.ARQUIVO = arquivoIm.FileName;
                    _voPedido.PRODUTO = linhaArquivo.Substring(124, 5);
                    _voPedido.VOLUME = Convert.ToDecimal(linhaArquivo.Substring(4, 4));
                    _voPedido.DESCRICAO1 = $"Volume {linhaArquivo.Substring(3, 4)}";
                    _voPedido.CLIENTE = cliente;
                    _voPedido.PECLIENTE = linhaArquivo.Substring(17, 6);
                    _voPedido.ORDCOMPRA = "--";
                    _voPedido.ETIQUETA = linhaArquivo.Substring(11, 36).Trim();

                    _voPedido.STATUS = 0;
                    _voPedido.QTDE = 0;
                    _voPedido.IdBox = 1;
                    _voPedido.IdLayout = arquivoIm.LayoutId;
                    _voPedido.DATAINC = DateTime.Now;

                    _voPedidoList.Add(_voPedido);
                }
            }

            daPedido _daPedido = new daPedido(this.conexao);
            foreach (var item in _voPedidoList)
            {
                item.CLIENTE = cliente;
                _listVoPedido.Add(item);
            }

            callBack(arquivoIm.ArquivoItens.Count, 0, _listVoPedido);
        }

        private void InserirEvvivaV2(voArquivoIm arquivoIm, Action<int, int, List<PedidoImport>> callBack)
        {
            string cliente = "";
            List<PedidoImport> _listVoPedido = new List<PedidoImport>();
            List<PedidoImport> _voPedidoList = new List<PedidoImport>();
            for (int i = 0; i < arquivoIm.ArquivoItens.Count; i++)
            {
                callBack(arquivoIm.ArquivoItens.Count, i, null);

                var linhaArquivo = arquivoIm.ArquivoItens[i].Linha;

                if (linhaArquivo.Length < 3)
                    continue;

                if (linhaArquivo.Substring(0, 3) == "515")
                {
                    cliente = linhaArquivo.Substring(3, 50).Trim();
                }

                if (linhaArquivo.Substring(0, 3) == "512")
                {
                    PedidoImport _voPedido = new PedidoImport();

                    _voPedido.ARQUIVO = arquivoIm.FileName;
                    _voPedido.PRODUTO = linhaArquivo.Substring(125, 5);
                    _voPedido.VOLUME = Convert.ToDecimal(linhaArquivo.Substring(4, 3));
                    _voPedido.DESCRICAO1 = $"Volume {linhaArquivo.Substring(4, 3)}";
                    _voPedido.CLIENTE = cliente;
                    _voPedido.PECLIENTE = linhaArquivo.Substring(17, 6);
                    _voPedido.ORDCOMPRA = "--";
                    _voPedido.ETIQUETA = linhaArquivo.Substring(11, 36).Trim();

                    _voPedido.STATUS = 0;
                    _voPedido.QTDE = 0;
                    _voPedido.IdBox = 1;
                    _voPedido.IdLayout = arquivoIm.LayoutId;
                    _voPedido.DATAINC = DateTime.Now;

                    _voPedidoList.Add(_voPedido);
                }
            }

            daPedido _daPedido = new daPedido(this.conexao);
            foreach (var item in _voPedidoList)
            {
                item.CLIENTE = cliente;
                _listVoPedido.Add(item);
            }

            callBack(arquivoIm.ArquivoItens.Count, 0, _listVoPedido);
        }
    }
}