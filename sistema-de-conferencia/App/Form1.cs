using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Windows.Forms;
using System.Drawing;
using Negocio;
using Entidade;
using Relatorio;
using System.Threading;

namespace App
{
    public partial class Form1 : Form
    {

        #region "Variáveis"

        int conexao;

        #endregion

        #region "Métodos"

        private void AbrirFiltro()
        {

            FormFiltro cForm = new FormFiltro(conexao);

            if (cForm.ShowDialog() == DialogResult.OK)
            {
                Montar();
                cForm.Dispose();
            }

        }


        private bool VerificaStatusSaida()
        {
            foreach (DataGridViewRow item in dtlGeral.Rows)
            {
                int status = int.Parse(item.Cells["STATUS"].Value.ToString());
                if (status != 3)
                {
                    return false;
                }
            }

            return true;

        }
        private bool VerificaStatusBlock()
        {
            foreach (DataGridViewRow item in dtlGeral.Rows)
            {
                int status = int.Parse(item.Cells["STATUS"].Value.ToString());
                if (status == 4 || status == 5)
                {
                    MessageBox.Show("Operação cancelada. \nUma ou mais peça está para entrega ou finalizada", "Peça bloqueada", MessageBoxButtons.OK, MessageBoxIcon.Error);
                    return false;
                }
            }

            return true;

        }

        private void Montar()
        {

            int normal = 0;
            int entrada = 0;
            int conferido = 0;
            int saida = 0;
            int entrega = 0;
            int finalizado = 0;
            bool tranfereLocal = false;

            boPedido mboPedido = new boPedido(conexao);
            Thread.CurrentThread.Priority = ThreadPriority.Highest;

            dtlGeral.AutoGenerateColumns = false;
            IDataReader dr = mboPedido.ConsultarDr(Program.mvoPedido);
            dtlGeral.Rows.Clear();
            while (dr.Read())
            {

                dtlGeral.Rows.Add(dr["ID"].ToString(), dr["ARQUIVO"].ToString(), dr["Nmlayout"].ToString(), dr["IdLayout"].ToString(), dr["ORDCOMPRA"].ToString(), dr["CLIENTE"].ToString(), dr["PECLIENTE"].ToString(), dr["PRODUTO"].ToString(), dr["DESCRICAO1"].ToString(), dr["QTDE"].ToString(), dr["ETIQUETA"].ToString(), long.Parse(dr["SEQUENCIA"].ToString()), dr["VOLUME"].ToString(), dr["DsStatus"].ToString(), dr["STATUS"].ToString(), dr["IdBox"].ToString(), dr["BOX"].ToString(), Convert.ToBoolean(dr["FlBloqueio"].ToString()), dr["PECOMPUTADOR"].ToString());

                if (dtlGeral.Rows[dtlGeral.Rows.Count - 1].Cells["STATUS"].Value.ToString() == "0")
                {
                    normal++;
                }
                if (dtlGeral.Rows[dtlGeral.Rows.Count - 1].Cells["STATUS"].Value.ToString() == "1")
                {
                    dtlGeral.Rows[dtlGeral.Rows.Count - 1].DefaultCellStyle.BackColor = Color.LightGreen;
                    conferido++;
                }
                if (dtlGeral.Rows[dtlGeral.Rows.Count - 1].Cells["STATUS"].Value.ToString() == "2")
                {
                    dtlGeral.Rows[dtlGeral.Rows.Count - 1].DefaultCellStyle.BackColor = Color.LightCoral;
                    saida++;
                }
                if (dtlGeral.Rows[dtlGeral.Rows.Count - 1].Cells["STATUS"].Value.ToString() == "3")
                {
                    dtlGeral.Rows[dtlGeral.Rows.Count - 1].DefaultCellStyle.BackColor = Color.Blue;
                    entrega++;
                }

                if (Convert.ToBoolean(dtlGeral.Rows[dtlGeral.Rows.Count - 1].Cells["FlBloqueio"].Value.ToString()) == false)
                    tranfereLocal = true;

            }
            dr.Close();

            MnuEnviarParaLocal.Enabled = tranfereLocal;

            Thread.CurrentThread.Priority = ThreadPriority.Normal;

            //monta box
            voBox mvoBox = new voBox();
            boBox mboBox = new boBox(conexao);
            DataTable dtBox = mboBox.ConsultarDisponivel(mvoBox);
            cboBoxes.Items.Clear();
            foreach (DataRow item in dtBox.Rows)
                cboBoxes.Items.Add(string.Concat(item["ID"].ToString(), "-", item["BOX"].ToString()));

            //cboBoxes.SelectedIndex = 0;

            //MontaGrupos();

            normalToolStripStatusLabel.Text = normal.ToString();
           // entradaToolStripStatusLabel.Text = entrada.ToString();
            conferidoToolStripStatusLabel.Text = conferido.ToString();
            saidaToolStripStatusLabel.Text = saida.ToString();
            entregaToolStripStatusLabel.Text = entrega.ToString();

            normalLabel.Text = normal.ToString();
            conferidoLabel.Text = conferido.ToString();
            saidaLabel.Text = saida.ToString();
            entregaLabel.Text = entrega.ToString();

        }

        private void MontaGrupos()
        {
            //monta grupos
            voGrupo mvoGrupo = new voGrupo();
            boGrupo mboGrupo = new boGrupo(conexao);
            DataTable dtGrupo = mboGrupo.Consultar(mvoGrupo);
            cboGrupo.Items.Clear();
            foreach (DataRow item in dtGrupo.Rows)
                cboGrupo.Items.Add(string.Format("{0} |{1}", item["NmNome"].ToString(), item["Id"].ToString()));
        }

        private void CalcularRestante(out int restante, out int total)
        {

            total = 0;
            restante = 0;
            for (int i = 0; i < dtlGeral.RowCount; i++)
            {
                int grid_status = int.Parse(dtlGeral.Rows[i].Cells["STATUS"].Value.ToString());
                if (conferenciaComboBox.SelectedIndex == grid_status || (conferenciaComboBox.SelectedIndex - 1) == grid_status)
                    total += 1;
            }

            switch (conferenciaComboBox.SelectedIndex)
            {
                case 1:
                    restante = int.Parse(conferidoLabel.Text) + 1;
                    break;
                case 2:
                    restante = int.Parse(saidaLabel.Text) + 1;
                    break;
                case 3:
                    restante = int.Parse(entregaLabel.Text) + 1;
                    break;
                default:
                    break;
            }

            restante -= 1;
            lblRestatnte.Text = "Restante: " + restante + " de " + total;

        }

        private void ChecarEtiqueta()
        {

            boPedido mboPedido = new boPedido(conexao);
            voPedido mvoPedido1 = new voPedido();

            DataTable dtPedido;

            string cSom = "";

            clienteLabel.Text = "";
            produtoLabel.Text = "";
            boxLabel.Text = "";

            etiquetaTextBox.UseSystemPasswordChar = true;

            if (etiquetaTextBox.Text.Length == 0) return;

            mvoPedido1 = Program.mvoPedido;
            mvoPedido1.ETIQUETA = etiquetaTextBox.Text;

            dtPedido = mboPedido.Consultar(mvoPedido1);
            if (dtPedido.Rows.Count > 0)
            {
                if (Convert.ToBoolean(dtPedido.Rows[0]["FlBloqueio"].ToString()))
                {
                    clienteLabel.Text = "Item em uso em maquina local !";
                    produtoLabel.Text = dtPedido.Rows[0]["DESCRICAO1"].ToString();
                    boxLabel.Text = dtPedido.Rows[0]["BOX"].ToString();
                    cSom = "Information";
                }
                else if (dtPedido.Rows[0]["status"].ToString().Equals(conferenciaComboBox.SelectedIndex.ToString()))
                {
                    clienteLabel.Text = "Etiqueta já lida !";
                    produtoLabel.Text = dtPedido.Rows[0]["DESCRICAO1"].ToString();
                    boxLabel.Text = dtPedido.Rows[0]["BOX"].ToString();
                    cSom = "Information";
                }
                else if (dtPedido.Rows[0]["IdBox"].ToString().Equals("0"))
                {
                    clienteLabel.Text = "Favor definir o Box da peça !";
                    produtoLabel.Text = dtPedido.Rows[0]["DESCRICAO1"].ToString();
                    boxLabel.Text = dtPedido.Rows[0]["BOX"].ToString();
                    cSom = "Exclamation";
                }
                else if (dtPedido.Rows[0]["status"].ToString().Equals((conferenciaComboBox.SelectedIndex - 1).ToString()))
                {
                    clienteLabel.Text = dtPedido.Rows[0]["CLIENTE"].ToString();
                    produtoLabel.Text = dtPedido.Rows[0]["DESCRICAO1"].ToString();
                    boxLabel.Text = dtPedido.Rows[0]["BOX"].ToString();

                    mvoPedido1.PECOMPUTADOR = System.Security.Principal.WindowsIdentity.GetCurrent().Name;

                    if (mvoPedido1.ARQUIVO != null)
                    {
                        if (mvoPedido1.ARQUIVO.Substring(mvoPedido1.ARQUIVO.Length - 1, 1) == ",")
                            mvoPedido1.ARQUIVO = mvoPedido1.ARQUIVO.Substring(0, mvoPedido1.ARQUIVO.Length - 1);
                    }

                    mboPedido.Conferir(mvoPedido1);
                    //Histórico
                    voHistorico mvoHistorico = new voHistorico();
                    boHistorico mboHistorico = new boHistorico(conexao);

                    mvoHistorico.PEDIDOID = Convert.ToInt32(dtPedido.Rows[0]["ID"].ToString());
                    mvoHistorico.STATUS = conferenciaComboBox.SelectedIndex;
                    mvoHistorico.USUARIO = Properties.Settings.Default.usuarioId;
                    mvoHistorico.DATA = DateTime.Now;
                    mboHistorico.Inserir(mvoHistorico);

                    int cont = 0;
                    switch (conferenciaComboBox.SelectedIndex)
                    {
                        case 1:
                            cont = int.Parse(conferidoLabel.Text) + 1;
                            conferidoLabel.Text = cont.ToString();
                            cont = int.Parse(normalLabel.Text) - 1;
                            normalLabel.Text = cont.ToString();
                            break;
                        case 2:
                            cont = int.Parse(saidaLabel.Text) + 1;
                            saidaLabel.Text = cont.ToString();
                            cont = int.Parse(conferidoLabel.Text) - 1;
                            conferidoLabel.Text = cont.ToString();
                            break;
                        case 3:
                            cont = int.Parse(entregaLabel.Text) + 1;
                            entregaLabel.Text = cont.ToString();
                            cont = int.Parse(saidaLabel.Text) - 1;
                            saidaLabel.Text = cont.ToString();
                            break;
                        default:
                            break;
                    }
                    cSom = dtPedido.Rows[0]["BOX"].ToString().Replace("BOX ", "").Trim();

                    int restante, total;
                    CalcularRestante(out restante, out total);
                    if (restante == total)
                    {
                        cSom = "Air_Horn";
                    }

                }
                else
                {
                    clienteLabel.Text = "Esta etiqueta está para " + dtPedido.Rows[0]["DsStatus"].ToString();
                    produtoLabel.Text = dtPedido.Rows[0]["DESCRICAO1"].ToString();
                    boxLabel.Text = dtPedido.Rows[0]["BOX"].ToString();
                    cSom = "Exclamation";
                }
            }
            else
            {
                clienteLabel.Text = "Etiqueta não encontrada !";
                cSom = "Error";
            }

            System.Media.SoundPlayer mySom = new System.Media.SoundPlayer(Util.GetSom(cSom));
            mySom.Play();

            if (cSom == "Error")
            {
                etiquetaTextBox.ReadOnly = true;
                inicio:
                if (MessageBox.Show("Etiqueta não encontrada ! \nContinuar conferindo ?", "ATENÇÃO", MessageBoxButtons.YesNo, MessageBoxIcon.Error, MessageBoxDefaultButton.Button2) == DialogResult.No) goto inicio;
                etiquetaTextBox.ReadOnly = false;
            }

            mboPedido = null;

            mvoPedido1.ETIQUETA = null;
            mvoPedido1.PECOMPUTADOR = null;

            etiquetaTextBox.Focus();
            etiquetaTextBox.SelectAll();

        }

        #endregion

        #region "Eventos"

        public Form1(int conexao)
        {

            InitializeComponent();

            lblModo.Text = conexao == 0 ? "USO COM SERVIDOR" : "USO SEM SERVIDOR";
            this.conexao = conexao;

        }
        private void Form1_Load(object sender, EventArgs e)
        {

            boPedido mboPedido = new boPedido(conexao);

            boSistema mboSistema = new boSistema();
            voSistema mvoSistema = new voSistema();

            this.Text = @"Sistema de Gerênciamento - Server: " + mboSistema.ConsultarConexao().servidor + " - Versão: " + System.Reflection.Assembly.GetExecutingAssembly().ImageRuntimeVersion.ToString();// + "              - Ambiente: " + (mboSistema.ConsultarConexao().banco.Equals("sisconf") ? "Produção" : "");

            if (conexao == 1)
            {//se local
                mnuImportar.Enabled = false;
                mnuCadUsuarios.Enabled = false;
                cboGrupo.Enabled = false;
                btnAbrirGrupo.Enabled = false;
                btnAdicionarAoGrupo.Enabled = false;
                MnuLayouts.Enabled = false;
                MnuPedidoGrupo.Enabled = false;

                dtlGeral.Columns["PECOMPUTADOR"].Visible = false;
                dtlGeral.Columns["FlBloqueio"].Visible = false;
            }
            else
            {
                MnuEnviarParaServidor.Enabled = false;
            }

            MnuEnviarParaLocal.Enabled = false;

            conferenciaComboBox.Items.Add("");
            //conferenciaComboBox.Items.Add("ENTRADA");
            conferenciaComboBox.Items.Add("CONFERÊNCIA");
            conferenciaComboBox.Items.Add("SAIDA");
            conferenciaComboBox.Items.Add("ENTREGA");

            cboStatus.Items.Add("NORMAL");
            //cboStatus.Items.Add("ENTRADA");
            cboStatus.Items.Add("CONFERÊNCIA");
            cboStatus.Items.Add("SAIDA");
            cboStatus.Items.Add("ENTREGA");
            cboStatus.SelectedIndex = 0;

            if (Util.nivel == 0)
            {
                BtnAlterarStatus.Enabled = false;
                BtnAlterarBox.Enabled = false;
                cboBoxes.Enabled = false;
                cboStatus.Enabled = false;
                mnuCadUsuarios.Enabled = false;
                //mnuImportar.Enabled = false;
                dtlGeral.Columns["Etiqueta"].Visible = false;
            }

            cboBuscaLista.SelectedIndex = 1;

            MontaGrupos();

        }

        private void importadosToolStripMenuItem_Click(object sender, EventArgs e)
        {
            frmImportacao cForm = new frmImportacao(conexao);
            cForm.ShowDialog();
        }
        private void filtroF9ToolStripMenuItem_Click(object sender, EventArgs e)
        {
            if (dtlGeral.Rows.Count == 0) return;
            string arquivo = Program.mvoPedido.ARQUIVO;
            //string pedido = mvoPedido.PECLIENTE;

            Program.mvoPedido = new voPedido() { ARQUIVO = arquivo };
            AbrirFiltro();
        }
        private void conferir(object sender, EventArgs e)
        {

            if (dtlGeral.Rows.Count == 0) return;

            if (VerificaStatusBlock() == false) return;

            FrameGroupBox.Left = (this.Width - FrameGroupBox.Width) / 2;
            FrameGroupBox.Top = (this.Height - FrameGroupBox.Height) / 2;

            FrameGroupBox.Visible = true;

            etiquetaTextBox.Text = "";
            clienteLabel.Text = "";
            produtoLabel.Text = "";
            boxLabel.Text = "";

            etiquetaTextBox.Focus();
            etiquetaTextBox.SelectAll();

            ToolStripMenuItem ctl = (ToolStripMenuItem)sender;

            switch (ctl.Name)
            {
                case "conferênciaToolStripMenuItem1":
                    conferenciaComboBox.SelectedIndex = 1;
                    break;
                case "saidaToolStripMenuItem":
                    conferenciaComboBox.SelectedIndex = 2;
                    break;
                case "entregaToolStripMenuItem":
                    conferenciaComboBox.SelectedIndex = 3;
                    break;
                default:
                    break;
            }

            int total, restante;
            CalcularRestante(out restante, out total);

        }
        private void btnAtualizar_Click(object sender, EventArgs e)
        {
            AtualizarLista();
        }
        private void AtualizarLista()
        {
            if (dtlGeral.Rows.Count == 0) return;
            Montar();
        }
        private void etiquetaTextBox_KeyDown(object sender, KeyEventArgs e)
        {
            if (e.KeyValue == 13)
            {
                ChecarEtiqueta();
            }
        }
        private void FecharButton_Click(object sender, EventArgs e)
        {
            FrameGroupBox.Visible = false;
            btnAtualizar.PerformClick();
        }

        private void BtnAlterarBox_Click(object sender, EventArgs e)
        {

            if (cboBoxes.Text == "") return;

            if (VerificaStatusBlock() == false) return;

            try
            {
                ProgressBar1.Visible = true;
                ProgressBar1.Maximum = dtlGeral.Rows.Count - 1;

                boPedido mboPedido = new boPedido(conexao);

                if (dtlGeral.SelectedRows.Count > 1)
                    foreach (DataGridViewRow item in dtlGeral.SelectedRows)
                    {
                        mboPedido.AlterarBox(new voPedido()
                        {
                            ID = int.Parse(item.Cells["ID"].Value.ToString()),
                            IdBox = int.Parse(cboBoxes.Text.Split('-')[0].ToString())
                        });

                        item.Cells["BOX"].Value = cboBoxes.Text.Split('-')[1].ToString();
                        item.Cells["IdBox"].Value = int.Parse(cboBoxes.Text.Split('-')[0].ToString());

                        ProgressBar1.Increment(1);
                        Application.DoEvents();
                    }
                else
                    foreach (DataGridViewRow item in dtlGeral.Rows)
                    {
                        mboPedido.AlterarBox(new voPedido()
                        {
                            ID = int.Parse(item.Cells["ID"].Value.ToString()),
                            IdBox = int.Parse(cboBoxes.Text.Split('-')[0].ToString())
                        });

                        item.Cells["BOX"].Value = cboBoxes.Text.Split('-')[1].ToString();
                        item.Cells["IdBox"].Value = int.Parse(cboBoxes.Text.Split('-')[0].ToString());

                        ProgressBar1.Increment(1);
                        Application.DoEvents();
                    }

                ProgressBar1.Value = 0;
                ProgressBar1.Visible = false;

                btnAtualizar.PerformClick();

                MessageBox.Show("Concluído", "SisConf", MessageBoxButtons.OK, MessageBoxIcon.Information);

            }
            catch (Exception ex)
            {
                MessageBox.Show(ex.Message, "SisConf", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }
        private void usuáriosToolStripMenuItem_Click(object sender, EventArgs e)
        {
            TabeUsua f = new TabeUsua(conexao);
            f.ShowDialog();
        }

        private void enviarParaServidorToolStripMenuItem_Click(object sender, EventArgs e)
        {

            if (dtlGeral.Rows.Count == 0) return;

            try
            {

                arquivoToolStripMenuItem.Enabled = false;
                mnuFiltro.Enabled = false;
                conferênciaToolStripMenuItem.Enabled = false;
                sistemaToolStripMenuItem.Enabled = false;
                btnAtualizar.Enabled = false;
                BtnAlterarBox.Enabled = false;
                BtnAlterarStatus.Enabled = false;

                ProgressBar1.Visible = true;
                ProgressBar1.Maximum = dtlGeral.Rows.Count - 1;
                boPedido mboPedido;
                voPedido mvoPedido1 = new voPedido();
                foreach (DataGridViewRow item in dtlGeral.Rows)
                {
                    mboPedido = new boPedido(0);
                    mvoPedido1.ETIQUETA = item.Cells["ETIQUETA"].Value.ToString();
                    mvoPedido1.ARQUIVO = item.Cells["Arquivo"].Value.ToString();
                    mvoPedido1.STATUS = item.Cells["STATUS"].Value.ToString();
                    if (mboPedido.AlterarStatus(mvoPedido1) == true)
                    {
                        mvoPedido1.FlBloqueio = false;
                        mvoPedido1.PECOMPUTADOR = "";
                        mboPedido.AlterarBloqueio(mvoPedido1);

                        mboPedido = new boPedido(1);
                        mboPedido.Excluir(mvoPedido1);
                    }

                    ProgressBar1.Increment(1);
                    Application.DoEvents();
                }
                ProgressBar1.Value = 0;
                ProgressBar1.Visible = false;

                dtlGeral.Rows.Clear();

                MessageBox.Show("Concluído", "SisConf", MessageBoxButtons.OK, MessageBoxIcon.Information);
            }
            catch (Exception ex)
            {
                MessageBox.Show(ex.Message, "SisConf", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
            finally
            {
                arquivoToolStripMenuItem.Enabled = true;
                mnuFiltro.Enabled = true;
                conferênciaToolStripMenuItem.Enabled = true;
                sistemaToolStripMenuItem.Enabled = true;
                btnAtualizar.Enabled = true;
                BtnAlterarBox.Enabled = true;
                BtnAlterarStatus.Enabled = true;
            }

        }
        private void enviarParaLocalToolStripMenuItem_Click(object sender, EventArgs e)
        {
            if (dtlGeral.Rows.Count == 0) return;

            try
            {

                arquivoToolStripMenuItem.Enabled = false;
                mnuFiltro.Enabled = false;
                conferênciaToolStripMenuItem.Enabled = false;
                sistemaToolStripMenuItem.Enabled = false;
                btnAtualizar.Enabled = false;
                BtnAlterarBox.Enabled = false;
                BtnAlterarStatus.Enabled = false;

                ProgressBar1.Visible = true;
                ProgressBar1.Maximum = dtlGeral.Rows.Count - 1;

                boPedido mboPedido = new boPedido(1);
                boPedido mboPedido0 = new boPedido(0);

                voPedido mvoPedido1 = new voPedido();
                mvoPedido1.DATAINC = DateTime.Now;
                foreach (DataGridViewRow item in dtlGeral.Rows)
                {

                    mvoPedido1.ARQUIVO = item.Cells["Arquivo"].Value.ToString();
                    mvoPedido1.PRODUTO = item.Cells["PRODUTO"].Value.ToString();
                    mvoPedido1.VOLUME = item.Cells["VOLUME"].Value.ToString();
                    mvoPedido1.DESCRICAO1 = item.Cells["DESCRICAO1"].Value.ToString();
                    mvoPedido1.CLIENTE = item.Cells["CLIENTE"].Value.ToString();
                    mvoPedido1.PECLIENTE = item.Cells["PECLIENTE"].Value.ToString();
                    mvoPedido1.ORDCOMPRA = item.Cells["ORDCOMPRA"].Value.ToString();
                    mvoPedido1.STATUS = item.Cells["STATUS"].Value.ToString();
                    mvoPedido1.IdBox = int.Parse(item.Cells["IdBox"].Value.ToString());
                    mvoPedido1.ETIQUETA = item.Cells["ETIQUETA"].Value.ToString();
                    mvoPedido1.QTDE = item.Cells["QTDE"].Value.ToString();
                    mvoPedido1.SEQUENCIA = string.IsNullOrWhiteSpace(item.Cells["SEQUENCIA"].Value.ToString()) ? 0 : int.Parse(item.Cells["SEQUENCIA"].Value.ToString());
                    mvoPedido1.IdLayout = int.Parse(item.Cells["IdLayout"].Value.ToString());
                    mboPedido.Inserir(mvoPedido1);

                    mvoPedido1.FlBloqueio = true;
                    mvoPedido1.PECOMPUTADOR = Environment.MachineName;
                    mboPedido0.AlterarBloqueio(mvoPedido1);

                    ProgressBar1.Increment(1);
                    Application.DoEvents();
                }
                ProgressBar1.Value = 0;
                ProgressBar1.Visible = false;

                //atualiza usuários na base local
                voUsuario mvoUsuario;
                boUsuario mboUsuario1 = new boUsuario(1);
                boUsuario mboUsuario0 = new boUsuario(0);
                DataTable dt = mboUsuario1.Consultar(new voUsuario());
                foreach (DataRow item in dt.Rows)
                {
                    mvoUsuario = new voUsuario();
                    mvoUsuario.ID = int.Parse(item["ID"].ToString());
                    mboUsuario1.Excluir(mvoUsuario);
                }

                dt = mboUsuario0.Consultar(new voUsuario());
                foreach (DataRow item in dt.Rows)
                {
                    mvoUsuario = new voUsuario();
                    mvoUsuario.LOGIN = item["LOGIN"].ToString();
                    mvoUsuario.NIVEL = item["NIVEL"].ToString();
                    mvoUsuario.NOME = item["NOME"].ToString();
                    mvoUsuario.SENHA = item["SENHA"].ToString();
                    mboUsuario1.Incluir(mvoUsuario);
                }

                AtualizarLista();

                MessageBox.Show("Concluído", "SisConf", MessageBoxButtons.OK, MessageBoxIcon.Information);

            }
            catch (Exception ex)
            {
                MessageBox.Show(ex.Message, "SisConf", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
            finally
            {
                arquivoToolStripMenuItem.Enabled = true;
                mnuFiltro.Enabled = true;
                conferênciaToolStripMenuItem.Enabled = true;
                sistemaToolStripMenuItem.Enabled = true;
                btnAtualizar.Enabled = true;
                BtnAlterarBox.Enabled = true;
                BtnAlterarStatus.Enabled = true;
            }

        }
        private void Form1_FormClosed(object sender, FormClosedEventArgs e)
        {
            Application.Exit();
        }

        #endregion

        private void BtnAlterarStatus_Click(object sender, EventArgs e)
        {

            if (dtlGeral.Rows.Count == 0) return;

            if (VerificaStatusBlock() == false) return;

            if (MessageBox.Show("Alterar status ?", "SisConf", MessageBoxButtons.YesNo, MessageBoxIcon.Question, MessageBoxDefaultButton.Button2) == DialogResult.No)
                return;

            try
            {

                BtnAlterarStatus.Enabled = false;
                cboStatus.Enabled = false;

                ProgressBar1.Visible = true;
                ProgressBar1.Maximum = dtlGeral.Rows.Count - 1;
                boPedido mboPedido = new boPedido(conexao);

                if (dtlGeral.SelectedRows.Count > 1)
                    foreach (DataGridViewRow item in dtlGeral.SelectedRows)
                    {
                        mboPedido = new boPedido(conexao);
                        mboPedido.AlterarStatus(new voPedido()
                        {
                            ETIQUETA = item.Cells["ETIQUETA"].Value.ToString(),
                            ARQUIVO = item.Cells["Arquivo"].Value.ToString(),
                            STATUS = cboStatus.SelectedIndex.ToString()
                        });

                        ProgressBar1.Increment(1);
                        Application.DoEvents();
                    }
                else
                    foreach (DataGridViewRow item in dtlGeral.Rows)
                    {
                        mboPedido = new boPedido(conexao);
                        mboPedido.AlterarStatus(new voPedido()
                        {
                            ETIQUETA = item.Cells["ETIQUETA"].Value.ToString(),
                            ARQUIVO = item.Cells["Arquivo"].Value.ToString(),
                            STATUS = cboStatus.SelectedIndex.ToString()
                        });

                        ProgressBar1.Increment(1);
                        Application.DoEvents();
                    }


                ProgressBar1.Value = 0;
                ProgressBar1.Visible = false;

                BtnAlterarStatus.Enabled = true;
                cboStatus.Enabled = true;

                //Program.mvoPedido.STATUS = cboStatus.SelectedIndex.ToString();
                btnAtualizar.PerformClick();

                // MessageBox.Show("Concluído", "SisConf", MessageBoxButtons.OK, MessageBoxIcon.Information);

            }
            catch (Exception ex)
            {
                MessageBox.Show(ex.Message, "SisConf", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }

        }

        private void toolStripMenuItem2_Click(object sender, EventArgs e)
        {
            TabeLayo cForm = new TabeLayo(conexao);
            cForm.Show();
        }

        private void mnuImportados_Click(object sender, EventArgs e)
        {
            frmImportacao cForm = new frmImportacao(conexao);
            cForm.ShowDialog();
            if (cForm.DialogResult == DialogResult.OK)
                AbrirFiltro();

        }

        private void resumidoToolStripMenuItem_Click(object sender, EventArgs e)
        {

            string arquivo = "";
            SaveFileDialog dg = new SaveFileDialog();
            dg.FileName = dtlGeral.Rows[0].Cells["Arquivo"].Value.ToString();
            dg.Filter = "Excel Files|*.xls";
            if (dg.ShowDialog() == DialogResult.Cancel) return; ;
            arquivo = dg.FileName;

            try
            {

                Microsoft.Office.Interop.Excel.Application excelApp = new Microsoft.Office.Interop.Excel.Application();
                excelApp.Workbooks.Add(Type.Missing);
                excelApp.Visible = false;

                ProgressBar1.Visible = true;
                ProgressBar1.Maximum = dtlGeral.Rows.Count - 1;

                excelApp.Cells[1, 1] = dtlGeral.Columns["ID"].HeaderText;
                excelApp.Cells[1, 2] = dtlGeral.Columns["ORDCOMPRA"].HeaderText;
                excelApp.Cells[1, 3] = dtlGeral.Columns["CLIENTE"].HeaderText;
                excelApp.Cells[1, 4] = dtlGeral.Columns["PECLIENTE"].HeaderText;
                excelApp.Cells[1, 5] = dtlGeral.Columns["PRODUTO"].HeaderText;
                excelApp.Cells[1, 6] = dtlGeral.Columns["DESCRICAO1"].HeaderText;
                excelApp.Cells[1, 7] = dtlGeral.Columns["QTDE"].HeaderText;
                if (dtlGeral.Columns["ETIQUETA"].Visible == true)
                {
                    excelApp.Cells[1, 8] = dtlGeral.Columns["ETIQUETA"].HeaderText;
                    excelApp.Cells[1, 9] = dtlGeral.Columns["VOLUME"].HeaderText;
                    excelApp.Cells[1, 10] = dtlGeral.Columns["DsStatus"].HeaderText;
                    excelApp.Cells[1, 11] = dtlGeral.Columns["BOX"].HeaderText;
                }
                else
                {
                    excelApp.Cells[1, 8] = dtlGeral.Columns["VOLUME"].HeaderText;
                    excelApp.Cells[1, 9] = dtlGeral.Columns["DsStatus"].HeaderText;
                    excelApp.Cells[1, 10] = dtlGeral.Columns["BOX"].HeaderText;
                }


                for (int i = 0; i < dtlGeral.RowCount; i++)
                {
                    excelApp.Cells[i + 2, 1] = dtlGeral.Rows[i].Cells["ID"].Value;
                    excelApp.Cells[i + 2, 2] = dtlGeral.Rows[i].Cells["ORDCOMPRA"].Value;
                    excelApp.Cells[i + 2, 3] = dtlGeral.Rows[i].Cells["CLIENTE"].Value;
                    excelApp.Cells[i + 2, 4] = dtlGeral.Rows[i].Cells["PECLIENTE"].Value;
                    excelApp.Cells[i + 2, 5] = dtlGeral.Rows[i].Cells["PRODUTO"].Value;
                    excelApp.Cells[i + 2, 6] = dtlGeral.Rows[i].Cells["DESCRICAO1"].Value;
                    excelApp.Cells[i + 2, 7] = dtlGeral.Rows[i].Cells["QTDE"].Value;

                    if (dtlGeral.Columns["ETIQUETA"].Visible == true)
                    {
                        excelApp.Cells[i + 2, 8] = dtlGeral.Rows[i].Cells["ETIQUETA"].Value;
                        excelApp.Cells[i + 2, 9] = dtlGeral.Rows[i].Cells["VOLUME"].Value;
                        excelApp.Cells[i + 2, 10] = dtlGeral.Rows[i].Cells["DsStatus"].Value;
                        excelApp.Cells[i + 2, 11] = dtlGeral.Rows[i].Cells["BOX"].Value;
                    }
                    else
                    {
                        excelApp.Cells[i + 2, 8] = dtlGeral.Rows[i].Cells["VOLUME"].Value;
                        excelApp.Cells[i + 2, 9] = dtlGeral.Rows[i].Cells["DsStatus"].Value;
                        excelApp.Cells[i + 2, 10] = dtlGeral.Rows[i].Cells["BOX"].Value;
                    }

                    ProgressBar1.Increment(1);

                }
                ProgressBar1.Value = 0;
                ProgressBar1.Visible = false;

                excelApp.Columns.AutoFit();
                excelApp.ActiveWorkbook.SaveCopyAs(arquivo);
                excelApp.ActiveWorkbook.Saved = true;
                excelApp.Quit();

                System.Diagnostics.Process.Start(arquivo);

            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        private void MnuPedidoGrupo_Click(object sender, EventArgs e)
        {
            TabeGrup f = new TabeGrup(conexao);
            f.ShowDialog();
            MontaGrupos();

        }

        private void btnAdicionarAoGrupo_Click(object sender, EventArgs e)
        {
            if (dtlGeral.Rows.Count == 0) return;

            if (cboGrupo.SelectedIndex == -1) return;

            if (VerificaStatusBlock() == false) return;

            try
            {

                btnAdicionarAoGrupo.Enabled = false;
                cboGrupo.Enabled = false;

                ProgressBar1.Visible = true;
                ProgressBar1.Maximum = dtlGeral.Rows.Count - 1;
                boPedidoGrupo mboPedidoGrupo = new boPedidoGrupo(conexao);

                mboPedidoGrupo.Excluir(new voPedidoGrupo()
                {
                    IdGrupo = Convert.ToInt32(cboGrupo.Text.Split('|')[1].ToString())
                });

                if (dtlGeral.SelectedRows.Count > 1)
                    foreach (DataGridViewRow item in dtlGeral.SelectedRows)
                    {
                        mboPedidoGrupo = new boPedidoGrupo(conexao);
                        mboPedidoGrupo.Incluir(new voPedidoGrupo()
                        {
                            IdPedido = Convert.ToInt32(item.Cells["ID"].Value.ToString()),
                            IdGrupo = Convert.ToInt32(cboGrupo.Text.Split('|')[1].ToString())
                        });

                        ProgressBar1.Increment(1);
                        Application.DoEvents();
                    }
                else
                    foreach (DataGridViewRow item in dtlGeral.Rows)
                    {
                        mboPedidoGrupo = new boPedidoGrupo(conexao);
                        mboPedidoGrupo.Incluir(new voPedidoGrupo()
                        {
                            IdPedido = Convert.ToInt32(item.Cells["ID"].Value.ToString()),
                            IdGrupo = Convert.ToInt32(cboGrupo.Text.Split('|')[1].ToString())
                        });

                        ProgressBar1.Increment(1);
                        Application.DoEvents();
                    }


                ProgressBar1.Value = 0;
                ProgressBar1.Visible = false;

                btnAdicionarAoGrupo.Enabled = true;
                cboGrupo.Enabled = true;

                btnAtualizar.PerformClick();

                MessageBox.Show("Itens adicionados !", "SisConf", MessageBoxButtons.OK, MessageBoxIcon.Information);

            }
            catch (Exception ex)
            {
                MessageBox.Show(ex.Message, "SisConf", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }

        private void MnuLayouts_Click(object sender, EventArgs e)
        {
            TabeLayouts f = new TabeLayouts(conexao);
            f.ShowDialog();
        }

        #region "Relatórios"

        private void mnuRelDetalhado_Click(object sender, EventArgs e)
        {

            if (dtlGeral.Rows.Count == 0) return;

            try
            {
                RelDetalhado mRelDetalhado = new RelDetalhado(conexao);
                List<string> ids = new List<string>();

                foreach (DataGridViewRow item in dtlGeral.Rows)
                    ids.Add(item.Cells["id"].Value.ToString());

                mRelDetalhado.show(ids, Properties.Settings.Default.usuarioId);

            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        private void mnuRelResumido_Click(object sender, EventArgs e)
        {

            if (dtlGeral.Rows.Count == 0) return;

            try
            {
                RelResumido mRelResumido = new RelResumido(conexao);
                List<string> ids = new List<string>();

                foreach (DataGridViewRow item in dtlGeral.Rows)
                    ids.Add(item.Cells["id"].Value.ToString());

                mRelResumido.show(ids, Properties.Settings.Default.usuarioId);

            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        private void mnuRelFabrica_Click(object sender, EventArgs e)
        {
            if (dtlGeral.Rows.Count == 0) return;

            try
            {
                RelFabrica mRelFabrica = new RelFabrica(conexao);
                List<string> ids = new List<string>();

                foreach (DataGridViewRow item in dtlGeral.Rows)
                    ids.Add(item.Cells["id"].Value.ToString());

                mRelFabrica.show(ids, Properties.Settings.Default.usuarioId);

            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        private void mnuRelLoja_Click(object sender, EventArgs e)
        {

            if (dtlGeral.Rows.Count == 0) return;

            try
            {
                RelLoja mRelLoja = new RelLoja(conexao);
                List<string> ids = new List<string>();

                foreach (DataGridViewRow item in dtlGeral.Rows)
                    ids.Add(item.Cells["id"].Value.ToString());

                mRelLoja.show(ids, Properties.Settings.Default.usuarioId);

            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        #endregion

        private void toolStripButton1_Click(object sender, EventArgs e)
        {

            boPedido mboPedido = new boPedido(conexao);

            //limpa o filtro e mantem apenas arquivo e loja
            string arquivo = "";
            if (Program.mvoPedido != null)
            {
                arquivo = Program.mvoPedido.ARQUIVO;
            }

            // string loja = Program.mvoPedido.CLIENTE;
            Program.mvoPedido = new voPedido()
            {
                ARQUIVO = arquivo,
                // CLIENTE = loja
            };

            Program.mvoPedido = new voPedido();

            DataTable dt = mboPedido.Consultar(Program.mvoPedido);

            List<voPedido> LvoPedido = mboPedido.montaLista(dt);
            List<voPedido> result = new List<voPedido>();

            if (cboBuscaLista.SelectedIndex == 0) //Ordem de compra
            {
                result = LvoPedido.Where(x => x.ORDCOMPRA.ToUpper().Contains(txtBuscaLuista.Text.ToUpper())).ToList();
            }
            else if (cboBuscaLista.SelectedIndex == 1) //Pedido
            {
                result = LvoPedido.Where(x => x.PECLIENTE.Contains(txtBuscaLuista.Text)).ToList();
            }

            if (result.Count > 0)
            {

                //Program.mvoPedido.ARQUIVO = result.FirstOrDefault().ARQUIVO;

                StringBuilder cStr = new StringBuilder();
                StringBuilder cStrArquivo = new StringBuilder();

                for (int i = 0; i <= result.Count - 1; i++)
                {
                    if (!cStr.ToString().Contains(result[i].PECLIENTE.Trim()))
                        cStr.AppendFormat("{0},", result[i].PECLIENTE.Trim());

                    if (!cStrArquivo.ToString().Contains(result[i].ARQUIVO.Trim()))
                        cStrArquivo.AppendFormat("{0},", result[i].ARQUIVO.Trim());
                }

                if (cStr.Length > 0) Program.mvoPedido.PECLIENTE = cStr.ToString().Substring(0, cStr.Length - 1);
                if (cStrArquivo.Length > 0) Program.mvoPedido.ARQUIVO = cStrArquivo.ToString().Substring(0, cStrArquivo.Length - 1);

                Montar();
            }

            txtBuscaLuista.SelectAll();
        }

        private void btnAbrirGrupo_Click(object sender, EventArgs e)
        {

            if (cboGrupo.SelectedIndex == -1) return;

            //limpa o filtro e mantem apenas arquivo e loja
            //string arquivo = "";
            //if (Program.mvoPedido != null)
            //{
            //    arquivo = Program.mvoPedido.ARQUIVO;
            //}

            //Program.mvoPedido = new voPedido()
            //{
            //    // ARQUIVO = arquivo
            //};
            if (Program.mvoPedido == null) Program.mvoPedido = new voPedido();

            Program.mvoPedido.IdGrupo = Convert.ToInt32(cboGrupo.Text.Split('|')[1]);
            Program.mvoPedido.STATUS = null;
            Montar();

        }

        private void entradaToolStripMenuItem_Click(object sender, EventArgs e)
        {
            conferir(sender, e);
        }

        private void conferênciaToolStripMenuItem1_Click(object sender, EventArgs e)
        {
            conferir(sender, e);
        }

        private void saidaToolStripMenuItem_Click(object sender, EventArgs e)
        {
            conferir(sender, e);
        }

        private void entregaToolStripMenuItem_Click(object sender, EventArgs e)
        {
            conferir(sender, e);
        }

        private void txtBuscaLuista_KeyDown(object sender, KeyEventArgs e)
        {
            if (e.KeyCode == Keys.Return)
            {
                toolStripButton1.PerformClick();
            }
        }

        private void enviarParaMobileToolStripMenuItem_Click(object sender, EventArgs e)
        {
            bool verificaStatusSaida = VerificaStatusSaida();
            if (!verificaStatusSaida)
            {
                if (MessageBox.Show("Todas as peças estão como saida.\nAtualizar a lista de entrega ?", "Sincronizar", MessageBoxButtons.YesNo, MessageBoxIcon.Question, MessageBoxDefaultButton.Button1) == DialogResult.No)
                    return;
            }

            Thread backgroundThread = new Thread(
                new ThreadStart(() =>
                {
                    boSincronizarMobile sincronizar = new boSincronizarMobile();
                    sincronizar.Executar(!verificaStatusSaida);
                }
            ));
            backgroundThread.Start();

        }

        private void atualizarSistemaToolStripMenuItem_Click(object sender, EventArgs e)
        {
            //Atualiza base de dados
            voSistema mvoSistema = new voSistema();
            boSistema mboSistema = new boSistema();

            mvoSistema.conexao = conexao;
            mboSistema.AtualizarBase(mvoSistema);

            MessageBox.Show("Atualizado!", "Atualização", MessageBoxButtons.OK, MessageBoxIcon.Information);

        }

        private void boxLabel_Click(object sender, EventArgs e)
        {

        }

        private void etiquetaTextBox_TextChanged(object sender, EventArgs e)
        {

        }

        private void conferidoLabel_Click(object sender, EventArgs e)
        {

        }
    }
}

