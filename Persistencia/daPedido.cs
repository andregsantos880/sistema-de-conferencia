using System.Data;
using Entidade;
using System.Data.SqlClient;

namespace Persistencia
{
    public class daPedido
    {
        int conexao;

        public daPedido(int conexao)
        {
            this.conexao = conexao;
        }

        public IDataReader ConsultarDr(voPedido mvo)
        {
            SqlCommand cmd = new SqlCommand();

            cmd.CommandTimeout = 0;
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.CommandText = "sps_pedido";
            cmd.Connection = Conexao.RetornaConexao(conexao);

            cmd.Parameters.Add("@id", SqlDbType.Int).Value = mvo.ID;
            cmd.Parameters.Add("@ETIQUETA", SqlDbType.VarChar, 50).Value = mvo.ETIQUETA;
            cmd.Parameters.Add("@ARQUIVO", SqlDbType.VarChar, 8000).Value = mvo.ARQUIVO;

            cmd.Parameters.Add("@STATUS", SqlDbType.VarChar, 8000).Value = mvo.STATUS;
            cmd.Parameters.Add("@CLIENTE", SqlDbType.VarChar, 8000).Value = mvo.CLIENTE;
            cmd.Parameters.Add("@DESCRICAO1", SqlDbType.VarChar, 8000).Value = mvo.DESCRICAO1;
            cmd.Parameters.Add("@PECLIENTE", SqlDbType.VarChar, 8000).Value = mvo.PECLIENTE;
            cmd.Parameters.Add("@PECOMPUTADOR", SqlDbType.VarChar, 8000).Value = mvo.PECOMPUTADOR;
            cmd.Parameters.Add("@idGrupo", SqlDbType.Int).Value = mvo.IdGrupo;

            return cmd.ExecuteReader();

        }

        public void Inserir(voPedido mvo)
        {

            SqlCommand cmd = new SqlCommand();

            cmd.CommandTimeout = 0;
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.CommandText = "spi_pedido";
            cmd.Connection = Conexao.RetornaConexao(conexao);

            cmd.Parameters.Add("@ARQUIVO", SqlDbType.VarChar, 100).Value = mvo.ARQUIVO;
            cmd.Parameters.Add("@PRODUTO", SqlDbType.VarChar, 20).Value = mvo.PRODUTO;
            cmd.Parameters.Add("@VOLUME", SqlDbType.Int).Value = mvo.VOLUME;
            cmd.Parameters.Add("@DESCRICAO1", SqlDbType.VarChar, 100).Value = mvo.DESCRICAO1;
            cmd.Parameters.Add("@CLIENTE", SqlDbType.VarChar, 100).Value = mvo.CLIENTE;
            cmd.Parameters.Add("@PECLIENTE", SqlDbType.VarChar, 12).Value = mvo.PECLIENTE;
            cmd.Parameters.Add("@ORDCOMPRA", SqlDbType.VarChar, 50).Value = mvo.ORDCOMPRA;
            cmd.Parameters.Add("@STATUS", SqlDbType.Int).Value = mvo.STATUS;
            cmd.Parameters.Add("@IdBox", SqlDbType.Int).Value = mvo.IdBox;
            cmd.Parameters.Add("@ETIQUETA", SqlDbType.VarChar, 50).Value = mvo.ETIQUETA;
            cmd.Parameters.Add("@QTDE", SqlDbType.Int).Value = mvo.QTDE;
            cmd.Parameters.Add("@IdLayout", SqlDbType.Int).Value = mvo.IdLayout;
            cmd.Parameters.Add("@DATAINC", SqlDbType.DateTime).Value = mvo.DATAINC;
            cmd.Parameters.Add("@SEQUENCIA", SqlDbType.BigInt).Value = mvo.SEQUENCIA;
            var reg = cmd.ExecuteNonQuery();
        }

        public DataTable Consultar(voPedido mvo)
        {
            DataSet ds = new DataSet();
            SqlCommand cmd = new SqlCommand();
            SqlDataAdapter da = new SqlDataAdapter(cmd);

            cmd.CommandTimeout = 0;
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.CommandText = "sps_pedido";
            cmd.Connection = Conexao.RetornaConexao(conexao);

            cmd.Parameters.Add("@id", SqlDbType.Int).Value = mvo.ID;
            cmd.Parameters.Add("@ETIQUETA", SqlDbType.VarChar, 50).Value = mvo.ETIQUETA;
            cmd.Parameters.Add("@ARQUIVO", SqlDbType.VarChar, 8000).Value = mvo.ARQUIVO;

            cmd.Parameters.Add("@STATUS", SqlDbType.VarChar, 8000).Value = mvo.STATUS;
            cmd.Parameters.Add("@CLIENTE", SqlDbType.VarChar, 8000).Value = mvo.CLIENTE;
            cmd.Parameters.Add("@DESCRICAO1", SqlDbType.VarChar, 8000).Value = mvo.DESCRICAO1;
            cmd.Parameters.Add("@ORDCOMPRA", SqlDbType.VarChar, 8000).Value = mvo.ORDCOMPRA;
            cmd.Parameters.Add("@PECLIENTE", SqlDbType.VarChar, 8000).Value = mvo.PECLIENTE;
            cmd.Parameters.Add("@PECOMPUTADOR", SqlDbType.VarChar, 8000).Value = mvo.PECOMPUTADOR;
            cmd.Parameters.Add("@idGrupo", SqlDbType.Int).Value = mvo.IdGrupo;

            cmd.ExecuteNonQuery();

            da.Fill(ds);

            return ds.Tables[0];
        }

        public DataTable ConsultarResumo(string ids)
        {

            DataSet ds = new DataSet();
            SqlCommand cmd = new SqlCommand();
            SqlDataAdapter da = new SqlDataAdapter(cmd);

            cmd.CommandTimeout = 0;
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.CommandText = "sps_pedidoConsultarResumo";
            cmd.Connection = Conexao.RetornaConexao(conexao);

            cmd.Parameters.Add("@IDS", SqlDbType.VarChar, 8000).Value = ids;

            cmd.ExecuteNonQuery();

            da.Fill(ds);

            return ds.Tables[0];
        }

        public DataTable ConsultarFabrica(string ids)
        {

            DataSet ds = new DataSet();
            SqlCommand cmd = new SqlCommand();
            SqlDataAdapter da = new SqlDataAdapter(cmd);

            cmd.CommandTimeout = 0;
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.CommandText = "sps_pedidoConsultarFabrica";
            cmd.Connection = Conexao.RetornaConexao(conexao);

            cmd.Parameters.Add("@IDS", SqlDbType.VarChar, 8000).Value = ids;

            cmd.ExecuteNonQuery();

            da.Fill(ds);

            return ds.Tables[0];
        }

        public DataTable ConsultarImportacaoArq(voPedido mvo)
        {
            DataSet ds = new DataSet();
            SqlCommand cmd = new SqlCommand();
            SqlDataAdapter da = new SqlDataAdapter(cmd);

            cmd.CommandTimeout = 0;
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.CommandText = "sps_pedidoImportacaoArq";
            cmd.Connection = Conexao.RetornaConexao(conexao);

            cmd.Parameters.Add("@id", SqlDbType.Int).Value = mvo.ID;
            cmd.Parameters.Add("@ETIQUETA", SqlDbType.VarChar, 50).Value = mvo.ETIQUETA;
            cmd.Parameters.Add("@ARQUIVO", SqlDbType.VarChar, 100).Value = mvo.ARQUIVO;

            cmd.Parameters.Add("@STATUS", SqlDbType.VarChar, 8000).Value = mvo.STATUS;
            cmd.Parameters.Add("@CLIENTE", SqlDbType.VarChar, 8000).Value = mvo.CLIENTE;
            cmd.Parameters.Add("@DESCRICAO1", SqlDbType.VarChar, 8000).Value = mvo.DESCRICAO1;
            cmd.Parameters.Add("@PECLIENTE", SqlDbType.VarChar, 8000).Value = mvo.PECLIENTE;
            cmd.Parameters.Add("@PECOMPUTADOR", SqlDbType.VarChar, 8000).Value = mvo.PECOMPUTADOR;
            cmd.Parameters.Add("@idGrupo", SqlDbType.Int).Value = mvo.IdGrupo;

            cmd.ExecuteNonQuery();

            da.Fill(ds);

            return ds.Tables[0];
        }

        public DataTable ConsultarImportacao(voPedido mvo)
        {
            DataSet ds = new DataSet();
            SqlCommand cmd = new SqlCommand();
            SqlDataAdapter da = new SqlDataAdapter(cmd);

            cmd.CommandTimeout = 0;
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.CommandText = "sps_pedidoImportacao";
            cmd.Connection = Conexao.RetornaConexao(conexao); 

            cmd.Parameters.Add("@id", SqlDbType.Int).Value = mvo.ID;
            cmd.Parameters.Add("@ETIQUETA", SqlDbType.VarChar, 50).Value = mvo.ETIQUETA;
            cmd.Parameters.Add("@ARQUIVO", SqlDbType.VarChar, 100).Value = mvo.ARQUIVO;

            cmd.Parameters.Add("@STATUS", SqlDbType.VarChar, 8000).Value = mvo.STATUS;
            cmd.Parameters.Add("@CLIENTE", SqlDbType.VarChar, 8000).Value = mvo.CLIENTE;
            cmd.Parameters.Add("@DESCRICAO1", SqlDbType.VarChar, 8000).Value = mvo.DESCRICAO1;
            cmd.Parameters.Add("@PECLIENTE", SqlDbType.VarChar, 8000).Value = mvo.PECLIENTE;
            cmd.Parameters.Add("@PECOMPUTADOR", SqlDbType.VarChar, 8000).Value = mvo.PECOMPUTADOR;
            cmd.Parameters.Add("@idGrupo", SqlDbType.Int).Value = mvo.IdGrupo;

            cmd.ExecuteNonQuery();

            da.Fill(ds);

            return ds.Tables[0];
        }

        public void AlterarBox(voPedido mvo)
        {

            SqlCommand cmd = new SqlCommand();

            cmd.CommandTimeout = 0;
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.CommandText = "spu_pedido_alterar_Box";
            cmd.Connection = Conexao.RetornaConexao(conexao);

            cmd.Parameters.Add("@id", SqlDbType.Int).Value = mvo.ID;
            cmd.Parameters.Add("@IdBox", SqlDbType.Int).Value = mvo.IdBox;

            cmd.ExecuteNonQuery();
        }

        public void MoveLidos(voPedido mvo)
        {

            SqlCommand cmd = new SqlCommand();

            cmd.CommandTimeout = 0;
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.CommandText = "spi_move_lidos";
            cmd.Connection = Conexao.RetornaConexao(conexao);

            cmd.Parameters.Add("@arquivo", SqlDbType.VarChar, 100).Value = mvo.ARQUIVO;

            cmd.ExecuteNonQuery();
        }

        public void Arquivar(voPedido mvo)
        {

            SqlCommand cmd = new SqlCommand();

            cmd.CommandTimeout = 0;
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.CommandText = "spi_pedido_arquivar";
            cmd.Connection = Conexao.RetornaConexao(conexao);

            cmd.Parameters.Add("@arquivo", SqlDbType.VarChar, 100).Value = mvo.ARQUIVO;

            cmd.ExecuteNonQuery();
        }

        public void Desarquivar(voPedido mvo)
        {

            SqlCommand cmd = new SqlCommand();

            cmd.CommandTimeout = 0;
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.CommandText = "spi_pedido_desarquivar";
            cmd.Connection = Conexao.RetornaConexao(conexao);

            cmd.Parameters.Add("@arquivo", SqlDbType.VarChar, 100).Value = mvo.ARQUIVO;

            cmd.ExecuteNonQuery();
        }

        public void CarregaDadosServidorParaLocal(voPedido mvo)
        {

            SqlCommand cmd = new SqlCommand();

            cmd.CommandTimeout = 0;
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.CommandText = "CARREGA_DADOS_SERVIDOR_PARA_LOCAL";
            cmd.Connection = Conexao.RetornaConexao(conexao);

            cmd.Parameters.Add("@STATUS", SqlDbType.VarChar, 8000).Value = mvo.STATUS;
            cmd.Parameters.Add("@CLIENTE", SqlDbType.VarChar, 8000).Value = mvo.CLIENTE;
            cmd.Parameters.Add("@DESCRICAO1", SqlDbType.VarChar, 8000).Value = mvo.DESCRICAO1;
            cmd.Parameters.Add("@PECLIENTE", SqlDbType.VarChar, 8000).Value = mvo.PECLIENTE;
            cmd.Parameters.Add("@PECOMPUTADOR", SqlDbType.VarChar, 8000).Value = mvo.PECOMPUTADOR;

            cmd.ExecuteNonQuery();
        }

        public void Conferir(voPedido mvo)
        {

            SqlCommand cmd = new SqlCommand();

            cmd.CommandTimeout = 0;
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.CommandText = "spu_pedido_conferir";
            cmd.Connection = Conexao.RetornaConexao(conexao);

            cmd.Parameters.Add("@PECOMPUTADOR", SqlDbType.VarChar, 50).Value = mvo.PECOMPUTADOR;
            cmd.Parameters.Add("@ETIQUETA", SqlDbType.VarChar, 50).Value = mvo.ETIQUETA;
            cmd.Parameters.Add("@ARQUIVO", SqlDbType.VarChar, 8000).Value = mvo.ARQUIVO;

            cmd.ExecuteNonQuery();

        }
        public void Excluir(voPedido mvo)
        {
            SqlCommand cmd = new SqlCommand();

            cmd.CommandTimeout = 0;
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.CommandText = "spd_pedido_excluir";
            cmd.Connection = Conexao.RetornaConexao(conexao);
            
            cmd.Parameters.Add("@arquivo", SqlDbType.VarChar, 100).Value = mvo.ARQUIVO;
            cmd.Parameters.Add("@etiqueta", SqlDbType.VarChar, 50).Value = mvo.ETIQUETA;

            cmd.ExecuteNonQuery();

        }
        public bool AlterarStatus(voPedido mvo)
        {

            SqlCommand cmd = new SqlCommand();

            cmd.CommandTimeout = 0;
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.CommandText = "spu_pedido_alterar_status";
            cmd.Connection = Conexao.RetornaConexao(conexao);

            cmd.Parameters.Add("@arquivo", SqlDbType.VarChar, 100).Value = mvo.ARQUIVO;
            cmd.Parameters.Add("@etiqueta", SqlDbType.VarChar, 50).Value = mvo.ETIQUETA;
            cmd.Parameters.Add("@status", SqlDbType.VarChar, 30).Value = mvo.STATUS;

            int ret = cmd.ExecuteNonQuery();
            return (ret > 0);

        }
        public bool AlterarBloqueio(voPedido mvo)
        {

            SqlCommand cmd = new SqlCommand();

            cmd.CommandTimeout = 0;
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.CommandText = "spu_pedido_alterar_bloqueio";
            cmd.Connection = Conexao.RetornaConexao(conexao);

            cmd.Parameters.Add("@arquivo", SqlDbType.VarChar, 100).Value = mvo.ARQUIVO;
            cmd.Parameters.Add("@etiqueta", SqlDbType.VarChar, 50).Value = mvo.ETIQUETA;
            cmd.Parameters.Add("@status", SqlDbType.VarChar, 30).Value = mvo.STATUS;
            cmd.Parameters.Add("@PECOMPUTADOR", SqlDbType.VarChar, 50).Value = mvo.PECOMPUTADOR;
            cmd.Parameters.Add("@FlBloqueio", SqlDbType.Bit).Value = mvo.FlBloqueio;

            int ret = cmd.ExecuteNonQuery();
            return (ret > 0);

        }
        public bool Atualizar(voPedido mvo)
        {

            SqlCommand cmd = new SqlCommand();

            cmd.CommandTimeout = 0;
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.CommandText = "spu_pedido_atualizar";
            cmd.Connection = Conexao.RetornaConexao(conexao);

            cmd.Parameters.Add("@arquivo", SqlDbType.VarChar, 8000).Value = mvo.ARQUIVO;

            int ret = cmd.ExecuteNonQuery();
            return (ret > 0);

        }

    }
}
