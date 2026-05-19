using System;

namespace Entidade
{
    public class voPedido
    {

        public Nullable<int> ID { get; set; }
        public string ORDCOMPRA { get; set; }
        public string CLIENTE { get; set; }
        public string PECLIENTE { get; set; }
        public string PRODUTO { get; set; }
        public string DESCRICAO1 { get; set; }
        public string QTDE { get; set; }
        public string ETIQUETA { get; set; }
        public string VOLUME { get; set; }
        public long SEQUENCIA { get; set; }
        public string NmBox { get; set; }
        public int IdBox { get; set; }
        public string STATUS { get; set; }
        public string dsSTATUS { get; set; }
        public string ARQUIVO { get; set; }
        public string NmLayout { get; set; }
        public int IdLayout { get; set; }
        public string PECOMPUTADOR { get; set; }
        public DateTime? DATAINC { get; set; }
        public bool FlBloqueio { get; set; }
        public Nullable<int> IdGrupo { get; set; }
 
    }
}
