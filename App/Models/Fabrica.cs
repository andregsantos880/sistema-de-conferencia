namespace App.Models
{
    public class Fabrica
    {
        public Fabrica(string nome, int controle)
        {
            Nome = nome;
            Controle = controle;
        }

        public Fabrica() { }
        public int Controle { get; set; }
        public string Nome { get; set; }
        public override string ToString()
        {
            return Nome;
        }
    }
}
