
namespace Entidade
{
    using System;

    public class PedidoImport
    {
        public string ARQUIVO { get; set; }
        public string PRODUTO { get; set; }
        public decimal VOLUME { get; set; }
        public string PECOLETOR { get; set; }
        public decimal SEQUENCIA { get; set; }
        public string DESCRICAO1 { get; set; }
        public string CODCLIENTE { get; set; }
        public string CLIENTE { get; set; }
        public string PECLIENTE { get; set; }
        public string ORDCOMPRA { get; set; }
        public int STATUS { get; set; }
        public DateTime DATAINC { get; set; }
        public string ETIQUETA { get; set; }
        public decimal QTDE { get; set; }
        public string PECOMPUTADOR { get; set; }
        public decimal VOLUME2 { get; set; }
        public int IdLayout { get; set; }
        public int IdBox { get; set; }
        public bool FlBloqueio { get; set; }
    }
}
