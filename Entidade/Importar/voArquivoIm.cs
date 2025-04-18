using System.Collections.Generic;

namespace Entidade.Importar
{
    public class voArquivoIm
    {
        public voArquivoIm()
        {
            ArquivoItens = new List<voArquivoImItens>();
        }

        public int LayoutId { get; set; }
        public string FileName { get; set; }
        public List<voArquivoImItens> ArquivoItens { get; set; }
    }
}
