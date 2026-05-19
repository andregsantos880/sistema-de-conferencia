namespace App.Models
{
    public class Pedido
    {
        internal object volume;
        internal object box;

        public string PeCliente { get; set; }
        public string OrdCompra { get; set; }
        public long Id { get; internal set; }
        public string Arquivo { get; internal set; }
        public string Nmlayout { get; internal set; }
        public object IdLayout { get; internal set; }
        public string Cliente { get; internal set; }
        public string Produto { get; internal set; }
        public string Descricao1 { get; internal set; }
        public int Qtde { get; internal set; }
        public string Etiqueta { get; internal set; }
        public int Sequencia { get; internal set; }
        public string DsStatus { get; internal set; }
        public string Status { get; internal set; }
        public int IdBox { get; internal set; }
        public string PeComputador { get; internal set; }
        public object Volume { get; internal set; }
        public object Box { get; internal set; }
    }
}
