namespace Entidade.Models
{
    public class ItemValue
    {
        public ItemValue(string descricao, string valor)
        {
            Valor = valor;
            Descricao = descricao;
        }

        public ItemValue() { }
        public string Valor { get; set; }
        public string Descricao { get; set; }
        public bool Checked { get; set; }
        public override string ToString()
        {
            return Descricao;
        }
    }
}
