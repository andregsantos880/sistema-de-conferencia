using Entidade;
using Persistencia;

namespace Negocio
{
    public class boArquivo
    {
        int conexao;

        public boArquivo(int conexao)
        {
            this.conexao = conexao;
        }
        public void CarregarArquivo(voArquivo mvo)
        {
            daArquivo da = new daArquivo(conexao);
            da.CarregarArquivo(mvo);
        }

    }
}
