namespace Entidade
{
    public class voSistema
    {
        public string servidor { get; set; }
        public string banco { get; set; }
        public string usuario { get; set; }
        public string senha { get; set; }
        public bool usarBaseLocal { get; set; }

        public int conexao { get; set; }
    }
}
