using System;

namespace Entidade
{
    public class voHistorico
    {
        public Nullable<int> ID { get; set; }
        public int?  PEDIDOID { get; set; }
        public DateTime DATA { get; set; }
        public int STATUS { get; set; }
        public int USUARIO { get; set; }
    }
}
