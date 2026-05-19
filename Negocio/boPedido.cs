using Entidade;
using Entidade.Importar;
using Persistencia;
using System;
using System.Collections;
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

        public boPedido(int conexao)
        {
            this.conexao = conexao;
            this.MontarPedidoTb();
        }

        public bool AlterarBloqueio(voPedido mvo)
        {
            return (new daPedido(this.conexao)).AlterarBloqueio(mvo);
        }

        public void AlterarBox(voPedido mvo)
        {
            (new daPedido(this.conexao)).AlterarBox(mvo);
        }

        public bool AlterarStatus(voPedido mvo)
        {
            return (new daPedido(this.conexao)).AlterarStatus(mvo);
        }

        public void Arquivar(voPedido mvo)
        {
            (new daPedido(this.conexao)).Arquivar(mvo);
        }

        public void Atualizar(voPedido mvo)
        {
            (new daPedido(this.conexao)).Atualizar(mvo);
        }

        public void CarregaDadosServidorParaLocal(voPedido mvo)
        {
            (new daPedido(this.conexao)).CarregaDadosServidorParaLocal(mvo);
        }

        public void Conferir(voPedido mvo)
        {
            (new daPedido(this.conexao)).Conferir(mvo);
        }

        public DataTable Consultar(voPedido mvo)
        {
            return (new daPedido(this.conexao)).Consultar(mvo);
        }

        public IDataReader ConsultarDr(voPedido mvo)
        {
            return (new daPedido(this.conexao)).ConsultarDr(mvo);
        }

        public DataTable ConsultarFabrica(string ids)
        {
            return (new daPedido(this.conexao)).ConsultarFabrica(ids);
        }

        public DataTable ConsultarImportacao(voPedido mvo)
        {
            return (new daPedido(this.conexao)).ConsultarImportacao(mvo);
        }

        public DataTable ConsultarImportacaoArq(voPedido mvo)
        {
            return (new daPedido(this.conexao)).ConsultarImportacaoArq(mvo);
        }

        public DataTable ConsultarResumo(string ids)
        {
            return (new daPedido(this.conexao)).ConsultarResumo(ids);
        }

        public void Desarquivar(voPedido mvo)
        {
            (new daPedido(this.conexao)).Desarquivar(mvo);
        }

        public void Excluir(voPedido mvo)
        {
            (new daPedido(this.conexao)).Excluir(mvo);
        }

        public void Inserir(voArquivoIm arquivoIm)
        {

            switch (arquivoIm.LayoutId)
            {
                case 1:
                    {
                        foreach (var item in arquivoIm.ArquivoItens)
                            this.InserirTodeschini(arquivoIm.LayoutId, arquivoIm.FileName, item.Linha);
                        break;
                    }
                case 2:
                    {
                        foreach (var item in arquivoIm.ArquivoItens)
                            this.InserirCriare(arquivoIm.LayoutId, arquivoIm.FileName, item.Linha);
                        break;
                    }
                case 3:
                    {
                        foreach (var item in arquivoIm.ArquivoItens)
                            this.InserirItalinea(arquivoIm.LayoutId, arquivoIm.FileName, item.Linha);
                        break;
                    }
                case 4:
                    {
                        foreach (var item in arquivoIm.ArquivoItens)
                            this.InserirUnicasa(arquivoIm.LayoutId, arquivoIm.FileName, item.Linha);
                        break;
                    }
                case 5:
                    {
                        foreach (var item in arquivoIm.ArquivoItens)
                            this.InserirDalMobile(arquivoIm.LayoutId, arquivoIm.FileName, item.Linha);
                        break;
                    }
                case 6:
                    {
                        foreach (var item in arquivoIm.ArquivoItens)
                            this.InserirRomanzza(arquivoIm.LayoutId, arquivoIm.FileName, item.Linha);
                        break;
                    }
                case 7:
                    {
                        foreach (var item in arquivoIm.ArquivoItens)
                            this.InserirInusitta(arquivoIm.LayoutId, arquivoIm.FileName, item.Linha);
                        break;
                    }
                case 8:
                    {
                        foreach (var item in arquivoIm.ArquivoItens)
                            this.InserirIdelli(arquivoIm.LayoutId, arquivoIm.FileName, item.Linha);
                        break;
                    }
                case 9:
                    {
                        foreach (var item in arquivoIm.ArquivoItens)
                            this.InserirSCA(arquivoIm.LayoutId, arquivoIm.FileName, item.Linha);
                        break;
                    }
                case 10:
                    {
                        foreach (var item in arquivoIm.ArquivoItens)
                            this.InserirVitta(arquivoIm.LayoutId, arquivoIm.FileName, item.Linha);
                        break;
                    }
                case 11:
                    {
                        foreach (var item in arquivoIm.ArquivoItens)
                            this.InserirRudnick(arquivoIm.LayoutId, arquivoIm.FileName, item.Linha);
                        break;
                    }
                case 12:
                    {
                        foreach (var item in arquivoIm.ArquivoItens)
                            this.InserirSimonetto(arquivoIm.LayoutId, arquivoIm.FileName, item.Linha);
                        break;
                    }
                case 13:
                    {
                        foreach (var item in arquivoIm.ArquivoItens)
                            this.InserirMarel(arquivoIm.LayoutId, arquivoIm.FileName, item.Linha);
                        break;
                    }
                case 14:
                    {
                        foreach (var item in arquivoIm.ArquivoItens)
                            this.InserirItalineaLoja(arquivoIm.LayoutId, arquivoIm.FileName, item.Linha);
                        break;
                    }
                case 15:
                    {
                        foreach (var item in arquivoIm.ArquivoItens)
                            this.InserirKasak(arquivoIm.LayoutId, arquivoIm.FileName, item.Linha);
                        break;
                    }
                case 16:
                    {
                        foreach (var item in arquivoIm.ArquivoItens)
                            this.InserirTranspaese(arquivoIm.LayoutId, arquivoIm.FileName, item.Linha);
                        break;
                    }
                case 17:
                    {
                        foreach (var item in arquivoIm.ArquivoItens)
                            this.InserirIMOBAL(arquivoIm.LayoutId, arquivoIm.FileName, item.Linha);
                        break;
                    }
                case 18:
                    {
                        foreach (var item in arquivoIm.ArquivoItens)
                            this.InserirRIMO(arquivoIm.LayoutId, arquivoIm.FileName, item.Linha);
                        break;
                    }
                case 19:
                    {
                        foreach (var item in arquivoIm.ArquivoItens)
                            this.InserirCASTINI(arquivoIm.LayoutId, arquivoIm.FileName, item.Linha);
                        break;
                    }
                case 20:
                    {
                        foreach (var item in arquivoIm.ArquivoItens)
                            this.InserirSimonettoV2(arquivoIm.LayoutId, arquivoIm.FileName, item.Linha);
                        break;
                    }
                case 21:
                    {
                        foreach (var item in arquivoIm.ArquivoItens)
                            this.InserirBartzen(arquivoIm.LayoutId, arquivoIm.FileName, item.Linha);
                        break;
                    }
                case 22:
                    {
                        foreach (var item in arquivoIm.ArquivoItens)
                            this.InserirVivatto(arquivoIm.LayoutId, arquivoIm.FileName, item.Linha);
                        break;
                    }
                case 23:
                    {
                        foreach (var item in arquivoIm.ArquivoItens)
                            this.InserirHRM(arquivoIm.LayoutId, arquivoIm.FileName, item.Linha);
                        break;
                    }
                case 24:
                    {
                        foreach (var item in arquivoIm.ArquivoItens)
                            this.InserirMANFROI(arquivoIm.LayoutId, arquivoIm.FileName, item.Linha);
                        break;
                    }
                case 26:
                    {
                        this.InserirJaeli(arquivoIm);
                        break;
                    }
                case 27:
                    {
                        this.InserirEvviva(arquivoIm);
                        break;
                    }
            }
        }

        private void InserirJaeli(voArquivoIm arquivoIm)
        {
            bool iniciar = false;

            string cliente = "";
            string pedido = "";
            string OC = "";

            for (int i = 0; i < arquivoIm.ArquivoItens.Count; i++)
            {
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

                            daPedido _daPedido = new daPedido(this.conexao);
                            voPedido _voPedido = new voPedido();

                            _voPedido.ARQUIVO = arquivoIm.FileName;
                            _voPedido.PECLIENTE = pedido;
                            _voPedido.PRODUTO = "";
                            _voPedido.VOLUME = "1";
                            _voPedido.DESCRICAO1 = linhaArquivo; //caixa master;
                            _voPedido.CLIENTE = cliente;
                            _voPedido.ORDCOMPRA = OC;
                            _voPedido.STATUS = "0";
                            _voPedido.QTDE = "1";
                            _voPedido.ETIQUETA = codigoBarra;
                            _voPedido.IdBox = 1;
                            _voPedido.IdLayout = arquivoIm.LayoutId;
                            _voPedido.DATAINC = new DateTime?(DateTime.Now.Date);
                            _daPedido.Inserir(_voPedido);

                            goto Found;
                        }
                    }
                }

                Found:
                continue;
            }
        }

        public void Inserir(voPedido mvo)
        {
            (new daPedido(this.conexao)).Inserir(mvo);
        }

        private void InserirBartzen(int IdLayout, string nomeArquivo, string linhaArquivo)
        {
            try
            {
                daPedido _daPedido = new daPedido(this.conexao);
                voPedido _voPedido = new voPedido();
                string[] strArrays = linhaArquivo.Split(new char[] { '\t' });
                if (char.IsDigit(strArrays[0].ToString(), 0))
                {
                    _voPedido.ARQUIVO = nomeArquivo;
                    _voPedido.PECLIENTE = strArrays[12].Trim();
                    _voPedido.PRODUTO = strArrays[9].Trim();
                    _voPedido.VOLUME = "1";
                    _voPedido.DESCRICAO1 = strArrays[3].Trim();
                    _voPedido.CLIENTE = strArrays[5].Trim();
                    _voPedido.ORDCOMPRA = strArrays[4].Trim();
                    _voPedido.STATUS = "0";
                    _voPedido.QTDE = "1";
                    _voPedido.ETIQUETA = strArrays[2].Trim();
                    _voPedido.IdBox = 1;
                    _voPedido.IdLayout = IdLayout;
                    _voPedido.DATAINC = new DateTime?(DateTime.Now.Date);
                    _daPedido.Inserir(_voPedido);
                }
            }
            catch (Exception exception)
            {
                throw exception;
            }
        }

        private void InserirCASTINI(int IdLayout, string nomeArquivo, string linhaArquivo)
        {
            string[] strArrays = linhaArquivo.Split(new char[] { ';' });
            double num = 0;
            if (double.TryParse(strArrays[7].ToString(), out num))
            {
                daPedido _daPedido = new daPedido(this.conexao);
                voPedido _voPedido = new voPedido();
                try
                {
                    _voPedido.ARQUIVO = nomeArquivo;
                    _voPedido.PRODUTO = strArrays[9];
                    _voPedido.DESCRICAO1 = strArrays[10];
                    _voPedido.CLIENTE = strArrays[12];
                    _voPedido.PECLIENTE = strArrays[3];
                    _voPedido.ORDCOMPRA = strArrays[3];
                    _voPedido.VOLUME = strArrays[8];
                    _voPedido.STATUS = "0";
                    _voPedido.ETIQUETA = strArrays[0];
                    _voPedido.SEQUENCIA = int.Parse(strArrays[7]);
                    _voPedido.QTDE = "0";
                    _voPedido.IdBox = 1;
                    _voPedido.IdLayout = IdLayout;
                    _voPedido.DATAINC = new DateTime?(DateTime.Now.Date);
                    _daPedido.Inserir(_voPedido);
                }
                catch (Exception exception)
                {
                    throw exception;
                }
            }
        }

        private void InserirCriare(int IdLayout, string nomeArquivo, string linhaArquivo)
        {
            double num = 0;
            if (double.TryParse(linhaArquivo.Substring(0, 24), out num))
            {
                daPedido _daPedido = new daPedido(this.conexao);
                voPedido _voPedido = new voPedido();
                try
                {
                    _voPedido.ARQUIVO = nomeArquivo;
                    _voPedido.PRODUTO = linhaArquivo.Substring(104, 7).Trim();
                    _voPedido.VOLUME = linhaArquivo.Substring(216, 3).Trim();
                    _voPedido.ORDCOMPRA = linhaArquivo.Substring(163, 12).Trim();
                    _voPedido.STATUS = "0";
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
                        _voPedido.PECLIENTE = linhaArquivo.Substring(153, 7).Trim();
                    }
                    if (_voPedido.CLIENTE.ToString().Equals(""))
                    {
                        _voPedido.CLIENTE = "NÃO INFORMADO";
                    }
                    _voPedido.QTDE = "0";
                    _voPedido.IdBox = 1;
                    _voPedido.IdLayout = IdLayout;
                    _voPedido.DATAINC = new DateTime?(DateTime.Now.Date);
                    _daPedido.Inserir(_voPedido);
                }
                catch (Exception exception)
                {
                    throw exception;
                }
            }
        }

        private void InserirDalMobile(int IdLayout, string nomeArquivo, string linhaArquivo)
        {
            string[] strArrays = linhaArquivo.Split(new char[] { ';' });
            daPedido _daPedido = new daPedido(this.conexao);
            voPedido _voPedido = new voPedido();
            try
            {
                _voPedido.ARQUIVO = nomeArquivo;
                _voPedido.PRODUTO = strArrays[2];
                _voPedido.VOLUME = "0";
                _voPedido.DESCRICAO1 = strArrays[3];
                _voPedido.CLIENTE = strArrays[7];
                if (_voPedido.CLIENTE.Equals(""))
                {
                    _voPedido.CLIENTE = "NÃO INFORMADO";
                }
                _voPedido.PECLIENTE = strArrays[1];
                _voPedido.ORDCOMPRA = strArrays[1];
                _voPedido.STATUS = "0";
                _voPedido.ETIQUETA = strArrays[6];
                _voPedido.QTDE = "0";
                _voPedido.IdBox = 1;
                _voPedido.IdLayout = IdLayout;
                _voPedido.DATAINC = new DateTime?(DateTime.Now.Date);
                _daPedido.Inserir(_voPedido);
            }
            catch (Exception exception)
            {
                throw exception;
            }
        }

        private void InserirHRM(int IdLayout, string nomeArquivo, string linhaArquivo)
        {
            try
            {
                daPedido _daPedido = new daPedido(this.conexao);
                voPedido _voPedido = new voPedido();
                string[] strArrays = linhaArquivo.Split(new char[] { ';' });
                double num = 0;
                if (double.TryParse(strArrays[5].Trim(), out num))
                {
                    _voPedido.ARQUIVO = nomeArquivo;
                    _voPedido.PECLIENTE = strArrays[1].Trim();
                    _voPedido.PRODUTO = strArrays[2].Trim();
                    _voPedido.VOLUME = strArrays[6].Trim();
                    _voPedido.DESCRICAO1 = string.Concat(strArrays[3].Trim(), " - ", strArrays[4].Trim());
                    _voPedido.CLIENTE = strArrays[13].Trim();
                    _voPedido.ORDCOMPRA = strArrays[11].Trim();
                    _voPedido.STATUS = "0";
                    _voPedido.QTDE = "1";
                    _voPedido.ETIQUETA = strArrays[5].Trim();
                    _voPedido.IdBox = 1;
                    _voPedido.SEQUENCIA = Convert.ToInt64(strArrays[5].Trim());
                    _voPedido.IdLayout = IdLayout;
                    _voPedido.DATAINC = new DateTime?(DateTime.Now.Date);
                    _daPedido.Inserir(_voPedido);
                }
            }
            catch (Exception exception)
            {
                throw exception;
            }
        }

        private void InserirIdelli(int IdLayout, string nomeArquivo, string linhaArquivo)
        {
            string[] strArrays = linhaArquivo.Split(new char[] { ';' });
            daPedido _daPedido = new daPedido(this.conexao);
            voPedido _voPedido = new voPedido();
            try
            {
                _voPedido.ARQUIVO = nomeArquivo;
                _voPedido.PRODUTO = strArrays[4];
                _voPedido.VOLUME = "0";
                _voPedido.DESCRICAO1 = strArrays[5];
                _voPedido.CLIENTE = "LOJA NAO INFORMADA";
                _voPedido.PECLIENTE = strArrays[1];
                _voPedido.ORDCOMPRA = strArrays[1];
                _voPedido.STATUS = "0";
                _voPedido.ETIQUETA = strArrays[9];
                _voPedido.QTDE = "0";
                _voPedido.IdBox = 1;
                _voPedido.IdLayout = IdLayout;
                _voPedido.DATAINC = new DateTime?(DateTime.Now.Date);
                _daPedido.Inserir(_voPedido);
            }
            catch (Exception exception)
            {
                throw exception;
            }
        }

        private void InserirIMOBAL(int IdLayout, string nomeArquivo, string linhaArquivo)
        {
            try
            {
                daPedido _daPedido = new daPedido(this.conexao);
                voPedido _voPedido = new voPedido();
                string[] strArrays = linhaArquivo.Split(new char[] { ';' });
                _voPedido.ARQUIVO = nomeArquivo;
                _voPedido.PECLIENTE = strArrays[0].Trim();
                _voPedido.PRODUTO = strArrays[3].Trim();
                _voPedido.VOLUME = "0";
                _voPedido.DESCRICAO1 = strArrays[4].Trim();
                _voPedido.CLIENTE = strArrays[2].Trim();
                _voPedido.ORDCOMPRA = strArrays[1].Trim();
                _voPedido.STATUS = "0";
                double num = double.Parse(strArrays[8].Trim());
                _voPedido.QTDE = num.ToString();
                _voPedido.ETIQUETA = strArrays[7].Trim();
                _voPedido.IdBox = 1;
                _voPedido.IdLayout = IdLayout;
                _voPedido.DATAINC = new DateTime?(DateTime.Now.Date);
                _daPedido.Inserir(_voPedido);
            }
            catch (Exception exception)
            {
                throw exception;
            }
        }

        private void InserirInusitta(int IdLayout, string nomeArquivo, string linhaArquivo)
        {
            string[] strArrays = linhaArquivo.Split(new char[] { ',' });
            if (strArrays[11].ToString().Length >= 10)
            {
                if (char.IsDigit(strArrays[11].ToString(), 1))
                {
                    daPedido _daPedido = new daPedido(this.conexao);
                    voPedido _voPedido = new voPedido();
                    try
                    {
                        _voPedido.ARQUIVO = nomeArquivo;
                        _voPedido.PRODUTO = strArrays[6];
                        _voPedido.VOLUME = strArrays[14];
                        _voPedido.DESCRICAO1 = strArrays[8];
                        _voPedido.CLIENTE = strArrays[3];
                        if (_voPedido.CLIENTE.Equals(""))
                        {
                            _voPedido.CLIENTE = "NÃO INFORMADO";
                        }
                        _voPedido.PECLIENTE = strArrays[4];
                        _voPedido.ORDCOMPRA = strArrays[4];
                        _voPedido.STATUS = "0";
                        double num = double.Parse(strArrays[11].ToString());
                        _voPedido.ETIQUETA = num.ToString("0000000000000000");
                        _voPedido.QTDE = "0";
                        _voPedido.IdBox = 1;
                        _voPedido.IdLayout = IdLayout;
                        _voPedido.DATAINC = new DateTime?(DateTime.Now.Date);
                        _daPedido.Inserir(_voPedido);
                    }
                    catch (Exception exception)
                    {
                        throw exception;
                    }
                }
            }
        }

        private void InserirItalinea(int IdLayout, string nomeArquivo, string linhaArquivo)
        {
            daPedido _daPedido = new daPedido(this.conexao);
            voPedido _voPedido = new voPedido();
            try
            {
                _voPedido.ARQUIVO = nomeArquivo;
                _voPedido.PRODUTO = linhaArquivo.Substring(2, 9);
                _voPedido.VOLUME = linhaArquivo.Substring(11, 2);
                _voPedido.ORDCOMPRA = linhaArquivo.Substring(163, 11);
                _voPedido.SEQUENCIA = int.Parse(linhaArquivo.Substring(20, 3));
                _voPedido.STATUS = "0";
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
                _voPedido.QTDE = "0";
                _voPedido.IdBox = 1;
                _voPedido.IdLayout = IdLayout;
                _voPedido.DATAINC = new DateTime?(DateTime.Now.Date);
                _daPedido.Inserir(_voPedido);
            }
            catch (Exception exception)
            {
                throw exception;
            }
        }

        private void InserirItalineaLoja(int IdLayout, string nomeArquivo, string linhaArquivo)
        {
            daPedido _daPedido = new daPedido(this.conexao);
            voPedido _voPedido = new voPedido();
            try
            {
                _voPedido.ARQUIVO = nomeArquivo;
                _voPedido.PRODUTO = "0";
                _voPedido.VOLUME = "0";
                _voPedido.DESCRICAO1 = linhaArquivo.Substring(26, 80).Replace("  ", " ").Trim();
                _voPedido.CLIENTE = "NÃO INFORMADO";
                _voPedido.PECLIENTE = linhaArquivo.Substring(104, 12).Trim();
                _voPedido.ORDCOMPRA = linhaArquivo.Substring(116, 12).Trim();
                _voPedido.SEQUENCIA = 0;
                _voPedido.STATUS = "0";
                _voPedido.ETIQUETA = linhaArquivo.Substring(0, 26).Trim();
                _voPedido.QTDE = "0";
                _voPedido.IdBox = 1;
                _voPedido.IdLayout = IdLayout;
                _voPedido.DATAINC = new DateTime?(DateTime.Now.Date);
                _daPedido.Inserir(_voPedido);
            }
            catch (Exception exception)
            {
                throw exception;
            }
        }

        private void InserirKasak(int IdLayout, string nomeArquivo, string linhaArquivo)
        {
            string[] strArrays = linhaArquivo.Split(new char[] { ';' });
            daPedido _daPedido = new daPedido(this.conexao);
            voPedido _voPedido = new voPedido();
            try
            {
                _voPedido.ARQUIVO = nomeArquivo;
                _voPedido.PRODUTO = strArrays[4];
                _voPedido.DESCRICAO1 = strArrays[5];
                _voPedido.CLIENTE = "NÃO INFORMADO";
                _voPedido.PECLIENTE = strArrays[1];
                _voPedido.ORDCOMPRA = strArrays[12];
                _voPedido.STATUS = "0";
                if (strArrays[9].Substring(0, 5) == "80060")
                {
                    _voPedido.VOLUME = strArrays[9].Substring(20, 2);
                }
                else if (strArrays[9].Substring(0, 3) == "010")
                {
                    _voPedido.VOLUME = "1";
                }
                _voPedido.ETIQUETA = strArrays[9];
                _voPedido.QTDE = "0";
                _voPedido.IdBox = 1;
                _voPedido.IdLayout = IdLayout;
                _voPedido.DATAINC = new DateTime?(DateTime.Now.Date);
                _daPedido.Inserir(_voPedido);
            }
            catch (Exception exception)
            {
                throw exception;
            }
        }

        private void InserirMANFROI(int IdLayout, string nomeArquivo, string linhaArquivo)
        {
            try
            {
                daPedido _daPedido = new daPedido(this.conexao);
                voPedido _voPedido = new voPedido()
                {
                    ARQUIVO = nomeArquivo,
                    PECLIENTE = linhaArquivo.Substring(6, 6).Trim(),
                    PRODUTO = linhaArquivo.Substring(279, 70).Trim(),
                    VOLUME = "0",
                    DESCRICAO1 = linhaArquivo.Substring(279, 70).Trim(),
                    CLIENTE = linhaArquivo.Substring(279, 70).Trim(),
                    ORDCOMPRA = linhaArquivo.Substring(6, 6).Trim(),
                    STATUS = "0",
                    QTDE = "1",
                    ETIQUETA = linhaArquivo.Substring(349, 10).Trim(),
                    IdBox = 1,
                    SEQUENCIA = 0,
                    IdLayout = IdLayout,
                    DATAINC = new DateTime?(DateTime.Now.Date)
                };
                _daPedido.Inserir(_voPedido);
            }
            catch (Exception exception)
            {
                throw exception;
            }
        }

        private void InserirMarel(int IdLayout, string nomeArquivo, string linhaArquivo)
        {
            string[] strArrays = linhaArquivo.Split(new char[] { ';' });
            if (!string.IsNullOrWhiteSpace(strArrays[0]))
            {
                if (char.IsDigit(strArrays[0].ToString(), 0))
                {
                    daPedido _daPedido = new daPedido(this.conexao);
                    voPedido _voPedido = new voPedido();
                    try
                    {
                        _voPedido.ARQUIVO = nomeArquivo;
                        _voPedido.PRODUTO = strArrays[6];
                        _voPedido.VOLUME = strArrays[5];
                        _voPedido.DESCRICAO1 = strArrays[8];
                        _voPedido.CLIENTE = "NÃO INFORMADO";
                        _voPedido.SEQUENCIA = int.Parse(strArrays[4].ToString());
                        _voPedido.PECLIENTE = strArrays[0];
                        _voPedido.ORDCOMPRA = strArrays[0];
                        _voPedido.STATUS = "0";
                        double num = double.Parse(strArrays[3]);
                        _voPedido.ETIQUETA = num.ToString("0000000000");
                        _voPedido.QTDE = "0";
                        _voPedido.IdBox = 1;
                        _voPedido.IdLayout = IdLayout;
                        _voPedido.DATAINC = new DateTime?(DateTime.Now.Date);
                        _daPedido.Inserir(_voPedido);
                    }
                    catch (Exception exception)
                    {
                        throw exception;
                    }
                }
            }
        }

        private void InserirRIMO(int IdLayout, string nomeArquivo, string linhaArquivo)
        {
            string[] strArrays = linhaArquivo.Split(new char[] { ';' });
            double num = 0;
            if (double.TryParse(strArrays[7].ToString(), out num))
            {
                daPedido _daPedido = new daPedido(this.conexao);
                voPedido _voPedido = new voPedido();
                try
                {
                    _voPedido.ARQUIVO = nomeArquivo;
                    _voPedido.PRODUTO = strArrays[6];
                    _voPedido.DESCRICAO1 = strArrays[9];
                    _voPedido.CLIENTE = strArrays[5];
                    _voPedido.PECLIENTE = strArrays[3];
                    _voPedido.ORDCOMPRA = strArrays[3];
                    _voPedido.VOLUME = strArrays[2];
                    _voPedido.STATUS = "0";
                    _voPedido.ETIQUETA = strArrays[7];
                    _voPedido.QTDE = "0";
                    _voPedido.IdBox = 1;
                    _voPedido.IdLayout = IdLayout;
                    _voPedido.DATAINC = new DateTime?(DateTime.Now.Date);
                    _daPedido.Inserir(_voPedido);
                }
                catch (Exception exception)
                {
                    throw exception;
                }
            }
        }

        private void InserirRomanzza(int IdLayout, string nomeArquivo, string linhaArquivo)
        {
            string[] strArrays = linhaArquivo.Split(new char[] { ';' });
            daPedido _daPedido = new daPedido(this.conexao);
            voPedido _voPedido = new voPedido();
            try
            {
                _voPedido.ARQUIVO = nomeArquivo;
                _voPedido.PRODUTO = strArrays[2];
                _voPedido.VOLUME = strArrays[5];
                _voPedido.DESCRICAO1 = strArrays[3];
                _voPedido.CLIENTE = strArrays[8];
                if (_voPedido.CLIENTE.Equals(""))
                {
                    _voPedido.CLIENTE = "NÃO INFORMADO";
                }
                _voPedido.PECLIENTE = strArrays[0];
                _voPedido.ORDCOMPRA = strArrays[1];
                _voPedido.STATUS = "0";
                _voPedido.ETIQUETA = strArrays[4];
                _voPedido.QTDE = "0";
                _voPedido.IdBox = 1;
                _voPedido.IdLayout = IdLayout;
                _voPedido.DATAINC = new DateTime?(DateTime.Now.Date);
                _daPedido.Inserir(_voPedido);
            }
            catch (Exception exception)
            {
                throw exception;
            }
        }

        private void InserirRudnick(int IdLayout, string nomeArquivo, string linhaArquivo)
        {
            string[] strArrays = linhaArquivo.Split(new char[] { ';' });
            if (char.IsDigit(strArrays[6].ToString(), 0))
            {
                daPedido _daPedido = new daPedido(this.conexao);
                voPedido _voPedido = new voPedido();
                try
                {
                    _voPedido.ARQUIVO = nomeArquivo;
                    _voPedido.PRODUTO = strArrays[0];
                    _voPedido.VOLUME = strArrays[2];
                    _voPedido.DESCRICAO1 = strArrays[1];
                    _voPedido.CLIENTE = strArrays[4];
                    if (_voPedido.CLIENTE.Equals(""))
                    {
                        _voPedido.CLIENTE = "NÃO INFORMADO";
                    }
                    _voPedido.SEQUENCIA = int.Parse(strArrays[9].ToString());
                    _voPedido.PECLIENTE = strArrays[5];
                    _voPedido.ORDCOMPRA = strArrays[3];
                    _voPedido.STATUS = "0";
                    double num = double.Parse(strArrays[7].ToString());
                    string str = num.ToString("00");
                    num = double.Parse(strArrays[8].ToString());
                    string str1 = num.ToString("00000000");
                    num = double.Parse(strArrays[5].ToString());
                    string str2 = num.ToString("000000");
                    num = double.Parse(strArrays[9].ToString());
                    _voPedido.ETIQUETA = string.Concat(str, str1, str2, num.ToString("0000"));
                    _voPedido.QTDE = strArrays[6];
                    _voPedido.IdBox = 1;
                    _voPedido.IdLayout = IdLayout;
                    _voPedido.DATAINC = new DateTime?(DateTime.Now.Date);
                    _daPedido.Inserir(_voPedido);
                }
                catch (Exception exception)
                {
                    throw exception;
                }
            }
        }

        private void InserirSCA(int IdLayout, string nomeArquivo, string linhaArquivo)
        {
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
                daPedido _daPedido = new daPedido(this.conexao);
                voPedido _voPedido = new voPedido();
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
                    _voPedido.ARQUIVO = nomeArquivo;
                    _voPedido.PRODUTO = strArrays[5].Trim();
                    _voPedido.VOLUME = strArrays[10].Trim();
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
                    _voPedido.STATUS = "0";
                    _voPedido.QTDE = strArrays[9].Trim();
                    _voPedido.IdBox = 1;
                    _voPedido.IdLayout = IdLayout;
                    _voPedido.DATAINC = new DateTime?(DateTime.Now.Date);
                    _daPedido.Inserir(_voPedido);
                }
            }
        }

        private void InserirSimonetto(int IdLayout, string nomeArquivo, string linhaArquivo)
        {
            try
            {
                daPedido _daPedido = new daPedido(this.conexao);
                voPedido _voPedido = new voPedido();
                string[] strArrays = linhaArquivo.Split(new char[] { ';' });
                _voPedido.ARQUIVO = nomeArquivo;
                _voPedido.PECLIENTE = strArrays[0].Trim();
                _voPedido.PRODUTO = strArrays[1].Trim();
                _voPedido.VOLUME = strArrays[4].Trim();
                _voPedido.DESCRICAO1 = strArrays[2].Trim();
                _voPedido.CLIENTE = "NÃO INFORMADO";
                _voPedido.ORDCOMPRA = string.Concat("PED", strArrays[0].Trim());
                _voPedido.STATUS = "0";
                _voPedido.QTDE = strArrays[5].Trim();
                _voPedido.ETIQUETA = strArrays[3].Trim();
                _voPedido.IdBox = 1;
                _voPedido.IdLayout = IdLayout;
                _voPedido.DATAINC = new DateTime?(DateTime.Now.Date);
                _daPedido.Inserir(_voPedido);
            }
            catch (Exception exception)
            {
                throw exception;
            }
        }

        private void InserirSimonettoV2(int IdLayout, string nomeArquivo, string linhaArquivo)
        {
            try
            {
                daPedido _daPedido = new daPedido(this.conexao);
                voPedido _voPedido = new voPedido();
                string[] strArrays = linhaArquivo.Split(new char[] { ';' });
                _voPedido.ARQUIVO = nomeArquivo;
                _voPedido.PECLIENTE = strArrays[2].Trim();
                _voPedido.PRODUTO = strArrays[4].Trim();
                _voPedido.VOLUME = strArrays[9].Trim();
                _voPedido.DESCRICAO1 = string.Concat(strArrays[5].Trim(), " - ", strArrays[6].Trim());
                _voPedido.CLIENTE = strArrays[3].Trim();
                _voPedido.ORDCOMPRA = string.Concat("PED", strArrays[2].Trim());
                _voPedido.STATUS = "0";
                _voPedido.QTDE = "1";
                _voPedido.ETIQUETA = strArrays[8].Trim();
                _voPedido.IdBox = 1;
                _voPedido.IdLayout = IdLayout;
                _voPedido.DATAINC = new DateTime?(DateTime.Now.Date);
                _daPedido.Inserir(_voPedido);
            }
            catch (Exception exception)
            {
                throw exception;
            }
        }

        private void InserirTodeschini(int IdLayout, string nomeArquivo, string linhaArquivo)
        {
            daPedido _daPedido = new daPedido(this.conexao);
            voPedido _voPedido = new voPedido();
            try
            {
                _voPedido.ARQUIVO = nomeArquivo;
                _voPedido.PRODUTO = linhaArquivo.Substring(2, 9);
                _voPedido.VOLUME = linhaArquivo.Substring(11, 2);
                _voPedido.ORDCOMPRA = linhaArquivo.Substring(163, 11);
                _voPedido.SEQUENCIA = int.Parse(linhaArquivo.Substring(20, 3));
                _voPedido.STATUS = "0";
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
                    _voPedido.PECLIENTE = linhaArquivo.Substring(153, 7).Trim();
                }
                if (_voPedido.CLIENTE.ToString().Equals(""))
                {
                    _voPedido.CLIENTE = "NÃO INFORMADO";
                }
                _voPedido.QTDE = "0";
                _voPedido.IdBox = 1;
                _voPedido.IdLayout = IdLayout;
                _voPedido.DATAINC = new DateTime?(DateTime.Now.Date);
                _daPedido.Inserir(_voPedido);
            }
            catch (Exception exception)
            {
                throw exception;
            }
        }

        private void InserirTranspaese(int IdLayout, string nomeArquivo, string linhaArquivo)
        {
            daPedido _daPedido = new daPedido(this.conexao);
            voPedido _voPedido = new voPedido();
            try
            {
                string str = linhaArquivo.Substring(20, 26);
                _voPedido.ARQUIVO = nomeArquivo;
                _voPedido.PRODUTO = linhaArquivo.Substring(16, 4);
                int num = int.Parse(linhaArquivo.Substring(46, 4).ToString());
                _voPedido.VOLUME = num.ToString();
                _voPedido.DESCRICAO1 = linhaArquivo.Substring(70, 120).Trim();
                _voPedido.CLIENTE = "";
                if (_voPedido.CLIENTE.Equals(""))
                {
                    _voPedido.CLIENTE = "NÃO INFORMADO";
                }
                _voPedido.PECLIENTE = linhaArquivo.Substring(36, 7);
                _voPedido.ORDCOMPRA = "--";
                _voPedido.SEQUENCIA = int.Parse(str.Substring(str.Length - 1, 1));
                _voPedido.STATUS = "0";
                _voPedido.ETIQUETA = str;
                _voPedido.QTDE = "0";
                _voPedido.IdBox = 1;
                _voPedido.IdLayout = IdLayout;
                _voPedido.DATAINC = new DateTime?(DateTime.Now.Date);
                _daPedido.Inserir(_voPedido);
            }
            catch (Exception exception)
            {
                throw exception;
            }
        }

        private void InserirUnicasa(int IdLayout, string nomeArquivo, string linhaArquivo)
        {
            double num = 0;
            if (double.TryParse(linhaArquivo.Substring(1, 1), out num))
            {
                daPedido _daPedido = new daPedido(this.conexao);
                voPedido _voPedido = new voPedido()
                {
                    ARQUIVO = nomeArquivo,
                    PRODUTO = linhaArquivo.Substring(124, 5),
                    VOLUME = linhaArquivo.Substring(149, 3),
                    DESCRICAO1 = linhaArquivo.Substring(73, 50),
                    CLIENTE = linhaArquivo.Substring(14, 50)
                };
                if (_voPedido.CLIENTE.Equals(""))
                {
                    _voPedido.CLIENTE = "NÃO INFORMADO";
                }
                _voPedido.PECLIENTE = linhaArquivo.Substring(141, 7);
                _voPedido.ORDCOMPRA = linhaArquivo.Substring(173, 12);
                _voPedido.STATUS = "0";
                _voPedido.ETIQUETA = linhaArquivo.Substring(129, 23);
                _voPedido.QTDE = "0";
                _voPedido.IdBox = 1;
                _voPedido.IdLayout = IdLayout;
                _voPedido.DATAINC = new DateTime?(DateTime.Now.Date);
                _daPedido.Inserir(_voPedido);
            }
        }

        private void InserirVitta(int IdLayout, string nomeArquivo, string linhaArquivo)
        {
            string[] strArrays = linhaArquivo.Split(new char[] { ';' });
            if (strArrays[8].ToString().Length >= 8)
            {
                if (char.IsDigit(strArrays[8].ToString(), 1))
                {
                    daPedido _daPedido = new daPedido(this.conexao);
                    voPedido _voPedido = new voPedido();
                    try
                    {
                        _voPedido.ARQUIVO = nomeArquivo;
                        _voPedido.PRODUTO = strArrays[5];
                        _voPedido.VOLUME = "0";
                        _voPedido.DESCRICAO1 = strArrays[6];
                        _voPedido.CLIENTE = strArrays[0];
                        if (_voPedido.CLIENTE.Equals(""))
                        {
                            _voPedido.CLIENTE = "NÃO INFORMADO";
                        }
                        _voPedido.PECLIENTE = strArrays[2];
                        _voPedido.ORDCOMPRA = strArrays[2];
                        _voPedido.STATUS = "0";
                        double num = double.Parse(strArrays[8].ToString());
                        _voPedido.ETIQUETA = num.ToString("0000000000");
                        _voPedido.QTDE = "0";
                        _voPedido.IdBox = 1;
                        _voPedido.IdLayout = IdLayout;
                        _voPedido.DATAINC = new DateTime?(DateTime.Now.Date);
                        _daPedido.Inserir(_voPedido);
                    }
                    catch (Exception exception)
                    {
                        throw exception;
                    }
                }
            }
        }

        private void InserirVivatto(int IdLayout, string nomeArquivo, string linhaArquivo)
        {
            daPedido _daPedido = new daPedido(this.conexao);
            voPedido _voPedido = new voPedido();
            string[] strArrays = linhaArquivo.Split(new char[] { ';' });
            if ((int)strArrays.Length >= 9)
            {
                _voPedido.ARQUIVO = nomeArquivo;
                _voPedido.PECLIENTE = strArrays[1].Trim();
                _voPedido.PRODUTO = strArrays[2].Trim();
                _voPedido.VOLUME = strArrays[5].Trim();
                _voPedido.DESCRICAO1 = string.Concat(strArrays[3].Trim(), " - ", strArrays[4].Trim());
                _voPedido.CLIENTE = strArrays[7].Trim();
                _voPedido.ORDCOMPRA = strArrays[9].Trim();
                _voPedido.STATUS = "0";
                _voPedido.QTDE = "1";
                _voPedido.ETIQUETA = strArrays[8].Trim();
                _voPedido.IdBox = 1;
                _voPedido.SEQUENCIA = Convert.ToInt32(strArrays[5].Trim());
                _voPedido.IdLayout = IdLayout;
                _voPedido.DATAINC = new DateTime?(DateTime.Now.Date);
                _daPedido.Inserir(_voPedido);
            }
        }

        public List<voPedido> montaLista(DataTable dt)
        {
            List<voPedido> voPedidos = new List<voPedido>();
            foreach (DataRow row in dt.Rows)
            {
                voPedido _voPedido = new voPedido()
                {
                    ID = new int?(int.Parse(row["ID"].ToString())),
                    ARQUIVO = row["ARQUIVO"].ToString(),
                    PRODUTO = row["PRODUTO"].ToString(),
                    VOLUME = row["VOLUME"].ToString(),
                    SEQUENCIA = long.Parse(row["SEQUENCIA"].ToString()),
                    DESCRICAO1 = row["DESCRICAO1"].ToString(),
                    CLIENTE = row["CLIENTE"].ToString(),
                    PECLIENTE = row["PECLIENTE"].ToString(),
                    ORDCOMPRA = row["ORDCOMPRA"].ToString(),
                    STATUS = row["STATUS"].ToString(),
                    DATAINC = new DateTime?(DateTime.Parse(row["DATAINC"].ToString())),
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

        public void MoveLidos(voPedido mvo)
        {
            (new daPedido(this.conexao)).MoveLidos(mvo);
        }

        private void InserirEvviva(voArquivoIm arquivoIm)
        {
            string cliente = "";
            List<voPedido> _voPedidoList = new List<voPedido>();
            for (int i = 0; i < arquivoIm.ArquivoItens.Count; i++)
            {
                var linhaArquivo = arquivoIm.ArquivoItens[i].Linha;

                if (linhaArquivo.Length < 3)
                    continue;

                if (linhaArquivo.Substring(0, 3) == "515")
                {
                    cliente = linhaArquivo.Substring(3,50).Trim();
                }

                if (linhaArquivo.Substring(0, 3) == "512")
                {
                    voPedido _voPedido = new voPedido();

                    _voPedido.ARQUIVO = arquivoIm.FileName;
                    _voPedido.PRODUTO = linhaArquivo.Substring(124, 5);
                    _voPedido.VOLUME = linhaArquivo.Substring(4, 4);
                    _voPedido.DESCRICAO1 = $"Volume {linhaArquivo.Substring(3, 4)}";
                    _voPedido.CLIENTE = cliente;
                    _voPedido.PECLIENTE = linhaArquivo.Substring(17, 6);
                    _voPedido.ORDCOMPRA = "--";
                    _voPedido.ETIQUETA = linhaArquivo.Substring(11, 36).Trim();

                    _voPedido.STATUS = "0";
                    _voPedido.QTDE = "0";
                    _voPedido.IdBox = 1;
                    _voPedido.IdLayout = arquivoIm.LayoutId;
                    _voPedido.DATAINC = new DateTime?(DateTime.Now.Date);

                    _voPedidoList.Add(_voPedido);
                }
            }

            daPedido _daPedido = new daPedido(this.conexao);
            foreach (var item in _voPedidoList)
            {
                item.CLIENTE = cliente;
                _daPedido.Inserir(item);
            }
        }
    }
}