namespace App
{
    partial class frmImportacao
    {
        /// <summary>
        /// Required designer variable.
        /// </summary>
        private System.ComponentModel.IContainer components = null;

        /// <summary>
        /// Clean up any resources being used.
        /// </summary>
        /// <param name="disposing">true if managed resources should be disposed; otherwise, false.</param>
        protected override void Dispose(bool disposing)
        {
            if (disposing && (components != null))
            {
                components.Dispose();
            }
            base.Dispose(disposing);
        }

        #region Windows Form Designer generated code

        /// <summary>
        /// Required method for Designer support - do not modify
        /// the contents of this method with the code editor.
        /// </summary>
        private void InitializeComponent()
        {
            System.Windows.Forms.DataGridViewCellStyle dataGridViewCellStyle1 = new System.Windows.Forms.DataGridViewCellStyle();
            System.Windows.Forms.DataGridViewCellStyle dataGridViewCellStyle2 = new System.Windows.Forms.DataGridViewCellStyle();
            System.Windows.Forms.DataGridViewCellStyle dataGridViewCellStyle4 = new System.Windows.Forms.DataGridViewCellStyle();
            System.Windows.Forms.DataGridViewCellStyle dataGridViewCellStyle5 = new System.Windows.Forms.DataGridViewCellStyle();
            System.Windows.Forms.DataGridViewCellStyle dataGridViewCellStyle3 = new System.Windows.Forms.DataGridViewCellStyle();
            System.ComponentModel.ComponentResourceManager resources = new System.ComponentModel.ComponentResourceManager(typeof(frmImportacao));
            System.Windows.Forms.DataGridViewCellStyle dataGridViewCellStyle6 = new System.Windows.Forms.DataGridViewCellStyle();
            System.Windows.Forms.DataGridViewCellStyle dataGridViewCellStyle7 = new System.Windows.Forms.DataGridViewCellStyle();
            System.Windows.Forms.DataGridViewCellStyle dataGridViewCellStyle9 = new System.Windows.Forms.DataGridViewCellStyle();
            System.Windows.Forms.DataGridViewCellStyle dataGridViewCellStyle10 = new System.Windows.Forms.DataGridViewCellStyle();
            System.Windows.Forms.DataGridViewCellStyle dataGridViewCellStyle8 = new System.Windows.Forms.DataGridViewCellStyle();
            this.dtlGeral = new System.Windows.Forms.DataGridView();
            this.ck = new System.Windows.Forms.DataGridViewCheckBoxColumn();
            this.Arquivo = new System.Windows.Forms.DataGridViewTextBoxColumn();
            this.IdLayout = new System.Windows.Forms.DataGridViewTextBoxColumn();
            this.LAYOUT_NAME = new System.Windows.Forms.DataGridViewTextBoxColumn();
            this.Column3 = new System.Windows.Forms.DataGridViewTextBoxColumn();
            this.toolStrip1 = new System.Windows.Forms.ToolStrip();
            this.cboPesquisa = new System.Windows.Forms.ToolStripComboBox();
            this.txtPesquisa = new System.Windows.Forms.ToolStripTextBox();
            this.BtnPesquisa = new System.Windows.Forms.ToolStripButton();
            this.label1 = new System.Windows.Forms.Label();
            this.txtpedBusca = new System.Windows.Forms.TextBox();
            this.groupBox1 = new System.Windows.Forms.GroupBox();
            this.btnArquivar = new System.Windows.Forms.Button();
            this.label2 = new System.Windows.Forms.Label();
            this.cboGrupo = new System.Windows.Forms.ComboBox();
            this.btnPedBusca = new System.Windows.Forms.Button();
            this.toolStrip2 = new System.Windows.Forms.ToolStrip();
            this.btnAbrir = new System.Windows.Forms.ToolStripButton();
            this.toolStripSeparator2 = new System.Windows.Forms.ToolStripSeparator();
            this.btnAdicionar = new System.Windows.Forms.ToolStripButton();
            this.toolStripSeparator1 = new System.Windows.Forms.ToolStripSeparator();
            this.btnAtualizar = new System.Windows.Forms.ToolStripButton();
            this.statusStrip1 = new System.Windows.Forms.StatusStrip();
            this.progressImport = new System.Windows.Forms.ToolStripProgressBar();
            this.tabControl1 = new System.Windows.Forms.TabControl();
            this.tabPage1 = new System.Windows.Forms.TabPage();
            this.tabPage2 = new System.Windows.Forms.TabPage();
            this.gridArquivados = new System.Windows.Forms.DataGridView();
            this.ckArq = new System.Windows.Forms.DataGridViewCheckBoxColumn();
            this.ArquivoArq = new System.Windows.Forms.DataGridViewTextBoxColumn();
            this.IdLayoutArq = new System.Windows.Forms.DataGridViewTextBoxColumn();
            this.LAYOUT_NAMEArq = new System.Windows.Forms.DataGridViewTextBoxColumn();
            this.dataGridViewTextBoxColumn4 = new System.Windows.Forms.DataGridViewTextBoxColumn();
            this.groupBox2 = new System.Windows.Forms.GroupBox();
            this.btnPedBuscaArq = new System.Windows.Forms.Button();
            this.txtpedBuscaArq = new System.Windows.Forms.TextBox();
            this.label3 = new System.Windows.Forms.Label();
            this.btnDesarquivar = new System.Windows.Forms.Button();
            ((System.ComponentModel.ISupportInitialize)(this.dtlGeral)).BeginInit();
            this.toolStrip1.SuspendLayout();
            this.groupBox1.SuspendLayout();
            this.toolStrip2.SuspendLayout();
            this.statusStrip1.SuspendLayout();
            this.tabControl1.SuspendLayout();
            this.tabPage1.SuspendLayout();
            this.tabPage2.SuspendLayout();
            ((System.ComponentModel.ISupportInitialize)(this.gridArquivados)).BeginInit();
            this.groupBox2.SuspendLayout();
            this.SuspendLayout();
            // 
            // dtlGeral
            // 
            this.dtlGeral.AllowUserToAddRows = false;
            this.dtlGeral.AllowUserToDeleteRows = false;
            this.dtlGeral.AllowUserToResizeRows = false;
            dataGridViewCellStyle1.BackColor = System.Drawing.Color.LightGray;
            this.dtlGeral.AlternatingRowsDefaultCellStyle = dataGridViewCellStyle1;
            this.dtlGeral.BackgroundColor = System.Drawing.Color.White;
            dataGridViewCellStyle2.Alignment = System.Windows.Forms.DataGridViewContentAlignment.MiddleLeft;
            dataGridViewCellStyle2.BackColor = System.Drawing.SystemColors.Control;
            dataGridViewCellStyle2.Font = new System.Drawing.Font("Microsoft Sans Serif", 8.25F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            dataGridViewCellStyle2.ForeColor = System.Drawing.SystemColors.WindowText;
            dataGridViewCellStyle2.SelectionBackColor = System.Drawing.SystemColors.Highlight;
            dataGridViewCellStyle2.SelectionForeColor = System.Drawing.SystemColors.HighlightText;
            dataGridViewCellStyle2.WrapMode = System.Windows.Forms.DataGridViewTriState.True;
            this.dtlGeral.ColumnHeadersDefaultCellStyle = dataGridViewCellStyle2;
            this.dtlGeral.ColumnHeadersHeightSizeMode = System.Windows.Forms.DataGridViewColumnHeadersHeightSizeMode.AutoSize;
            this.dtlGeral.Columns.AddRange(new System.Windows.Forms.DataGridViewColumn[] {
            this.ck,
            this.Arquivo,
            this.IdLayout,
            this.LAYOUT_NAME,
            this.Column3});
            dataGridViewCellStyle4.Alignment = System.Windows.Forms.DataGridViewContentAlignment.MiddleLeft;
            dataGridViewCellStyle4.BackColor = System.Drawing.SystemColors.Window;
            dataGridViewCellStyle4.Font = new System.Drawing.Font("Microsoft Sans Serif", 8.25F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            dataGridViewCellStyle4.ForeColor = System.Drawing.SystemColors.ControlText;
            dataGridViewCellStyle4.SelectionBackColor = System.Drawing.SystemColors.Highlight;
            dataGridViewCellStyle4.SelectionForeColor = System.Drawing.SystemColors.HighlightText;
            dataGridViewCellStyle4.WrapMode = System.Windows.Forms.DataGridViewTriState.False;
            this.dtlGeral.DefaultCellStyle = dataGridViewCellStyle4;
            this.dtlGeral.Dock = System.Windows.Forms.DockStyle.Fill;
            this.dtlGeral.Location = new System.Drawing.Point(3, 58);
            this.dtlGeral.MultiSelect = false;
            this.dtlGeral.Name = "dtlGeral";
            dataGridViewCellStyle5.Alignment = System.Windows.Forms.DataGridViewContentAlignment.MiddleLeft;
            dataGridViewCellStyle5.BackColor = System.Drawing.SystemColors.Control;
            dataGridViewCellStyle5.Font = new System.Drawing.Font("Microsoft Sans Serif", 8.25F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            dataGridViewCellStyle5.ForeColor = System.Drawing.SystemColors.WindowText;
            dataGridViewCellStyle5.SelectionBackColor = System.Drawing.SystemColors.Highlight;
            dataGridViewCellStyle5.SelectionForeColor = System.Drawing.SystemColors.HighlightText;
            dataGridViewCellStyle5.WrapMode = System.Windows.Forms.DataGridViewTriState.True;
            this.dtlGeral.RowHeadersDefaultCellStyle = dataGridViewCellStyle5;
            this.dtlGeral.RowHeadersVisible = false;
            this.dtlGeral.SelectionMode = System.Windows.Forms.DataGridViewSelectionMode.FullRowSelect;
            this.dtlGeral.Size = new System.Drawing.Size(726, 337);
            this.dtlGeral.TabIndex = 1;
            // 
            // ck
            // 
            this.ck.AutoSizeMode = System.Windows.Forms.DataGridViewAutoSizeColumnMode.AllCells;
            this.ck.DataPropertyName = "ck";
            this.ck.FalseValue = "";
            this.ck.HeaderText = "ck";
            this.ck.Name = "ck";
            this.ck.TrueValue = "1";
            this.ck.Width = 25;
            // 
            // Arquivo
            // 
            this.Arquivo.AutoSizeMode = System.Windows.Forms.DataGridViewAutoSizeColumnMode.Fill;
            this.Arquivo.HeaderText = "Arquivo";
            this.Arquivo.Name = "Arquivo";
            this.Arquivo.ReadOnly = true;
            // 
            // IdLayout
            // 
            this.IdLayout.DataPropertyName = "IdLayout";
            this.IdLayout.HeaderText = "IdLayout";
            this.IdLayout.Name = "IdLayout";
            this.IdLayout.Visible = false;
            // 
            // LAYOUT_NAME
            // 
            this.LAYOUT_NAME.DataPropertyName = "LAYOUT_NAME";
            this.LAYOUT_NAME.HeaderText = "Layout";
            this.LAYOUT_NAME.Name = "LAYOUT_NAME";
            this.LAYOUT_NAME.ReadOnly = true;
            // 
            // Column3
            // 
            this.Column3.AutoSizeMode = System.Windows.Forms.DataGridViewAutoSizeColumnMode.AllCells;
            dataGridViewCellStyle3.Format = "d";
            dataGridViewCellStyle3.NullValue = null;
            this.Column3.DefaultCellStyle = dataGridViewCellStyle3;
            this.Column3.HeaderText = "Importação";
            this.Column3.Name = "Column3";
            this.Column3.ReadOnly = true;
            this.Column3.Width = 85;
            // 
            // toolStrip1
            // 
            this.toolStrip1.Items.AddRange(new System.Windows.Forms.ToolStripItem[] {
            this.cboPesquisa,
            this.txtPesquisa,
            this.BtnPesquisa});
            this.toolStrip1.Location = new System.Drawing.Point(0, 0);
            this.toolStrip1.Name = "toolStrip1";
            this.toolStrip1.Size = new System.Drawing.Size(764, 25);
            this.toolStrip1.TabIndex = 3;
            this.toolStrip1.Text = "toolStrip1";
            this.toolStrip1.Visible = false;
            // 
            // cboPesquisa
            // 
            this.cboPesquisa.Items.AddRange(new object[] {
            "LOTE"});
            this.cboPesquisa.Name = "cboPesquisa";
            this.cboPesquisa.Size = new System.Drawing.Size(121, 25);
            // 
            // txtPesquisa
            // 
            this.txtPesquisa.BorderStyle = System.Windows.Forms.BorderStyle.FixedSingle;
            this.txtPesquisa.Font = new System.Drawing.Font("Segoe UI", 9F);
            this.txtPesquisa.Name = "txtPesquisa";
            this.txtPesquisa.Size = new System.Drawing.Size(100, 25);
            // 
            // BtnPesquisa
            // 
            this.BtnPesquisa.DisplayStyle = System.Windows.Forms.ToolStripItemDisplayStyle.Text;
            this.BtnPesquisa.Image = ((System.Drawing.Image)(resources.GetObject("BtnPesquisa.Image")));
            this.BtnPesquisa.ImageTransparentColor = System.Drawing.Color.Magenta;
            this.BtnPesquisa.Name = "BtnPesquisa";
            this.BtnPesquisa.Size = new System.Drawing.Size(56, 22);
            this.BtnPesquisa.Text = "Procurar";
            // 
            // label1
            // 
            this.label1.AutoSize = true;
            this.label1.Location = new System.Drawing.Point(256, 22);
            this.label1.Name = "label1";
            this.label1.Size = new System.Drawing.Size(43, 13);
            this.label1.TabIndex = 28;
            this.label1.Text = "Nº ped:";
            // 
            // txtpedBusca
            // 
            this.txtpedBusca.CharacterCasing = System.Windows.Forms.CharacterCasing.Upper;
            this.txtpedBusca.Location = new System.Drawing.Point(305, 19);
            this.txtpedBusca.Name = "txtpedBusca";
            this.txtpedBusca.Size = new System.Drawing.Size(164, 20);
            this.txtpedBusca.TabIndex = 0;
            // 
            // groupBox1
            // 
            this.groupBox1.Controls.Add(this.btnArquivar);
            this.groupBox1.Controls.Add(this.label2);
            this.groupBox1.Controls.Add(this.cboGrupo);
            this.groupBox1.Controls.Add(this.btnPedBusca);
            this.groupBox1.Controls.Add(this.txtpedBusca);
            this.groupBox1.Controls.Add(this.label1);
            this.groupBox1.Dock = System.Windows.Forms.DockStyle.Top;
            this.groupBox1.Location = new System.Drawing.Point(3, 3);
            this.groupBox1.Name = "groupBox1";
            this.groupBox1.Size = new System.Drawing.Size(726, 55);
            this.groupBox1.TabIndex = 31;
            this.groupBox1.TabStop = false;
            // 
            // btnArquivar
            // 
            this.btnArquivar.Location = new System.Drawing.Point(577, 17);
            this.btnArquivar.Name = "btnArquivar";
            this.btnArquivar.Size = new System.Drawing.Size(143, 23);
            this.btnArquivar.TabIndex = 31;
            this.btnArquivar.Text = "Arquivar =>";
            this.btnArquivar.UseVisualStyleBackColor = true;
            this.btnArquivar.Click += new System.EventHandler(this.btnArquivar_Click);
            // 
            // label2
            // 
            this.label2.AutoSize = true;
            this.label2.Location = new System.Drawing.Point(8, 22);
            this.label2.Name = "label2";
            this.label2.Size = new System.Drawing.Size(39, 13);
            this.label2.TabIndex = 30;
            this.label2.Text = "Grupo:";
            // 
            // cboGrupo
            // 
            this.cboGrupo.FormattingEnabled = true;
            this.cboGrupo.Location = new System.Drawing.Point(57, 19);
            this.cboGrupo.Name = "cboGrupo";
            this.cboGrupo.Size = new System.Drawing.Size(193, 21);
            this.cboGrupo.TabIndex = 1;
            // 
            // btnPedBusca
            // 
            this.btnPedBusca.Image = global::App.Properties.Resources.find;
            this.btnPedBusca.Location = new System.Drawing.Point(479, 13);
            this.btnPedBusca.Name = "btnPedBusca";
            this.btnPedBusca.Size = new System.Drawing.Size(46, 36);
            this.btnPedBusca.TabIndex = 2;
            this.btnPedBusca.UseVisualStyleBackColor = true;
            this.btnPedBusca.Click += new System.EventHandler(this.btnPedBusca_Click);
            // 
            // toolStrip2
            // 
            this.toolStrip2.Items.AddRange(new System.Windows.Forms.ToolStripItem[] {
            this.btnAbrir,
            this.toolStripSeparator2,
            this.btnAdicionar,
            this.toolStripSeparator1,
            this.btnAtualizar});
            this.toolStrip2.Location = new System.Drawing.Point(0, 0);
            this.toolStrip2.Name = "toolStrip2";
            this.toolStrip2.Size = new System.Drawing.Size(764, 25);
            this.toolStrip2.TabIndex = 34;
            this.toolStrip2.Text = "toolStrip2";
            // 
            // btnAbrir
            // 
            this.btnAbrir.Image = global::App.Properties.Resources.Folder_open;
            this.btnAbrir.ImageTransparentColor = System.Drawing.Color.Magenta;
            this.btnAbrir.Name = "btnAbrir";
            this.btnAbrir.Size = new System.Drawing.Size(53, 22);
            this.btnAbrir.Text = "Abrir";
            this.btnAbrir.Click += new System.EventHandler(this.btnAbrir_Click);
            // 
            // toolStripSeparator2
            // 
            this.toolStripSeparator2.Name = "toolStripSeparator2";
            this.toolStripSeparator2.Size = new System.Drawing.Size(6, 25);
            // 
            // btnAdicionar
            // 
            this.btnAdicionar.Enabled = false;
            this.btnAdicionar.Image = global::App.Properties.Resources.file_add;
            this.btnAdicionar.ImageTransparentColor = System.Drawing.Color.Magenta;
            this.btnAdicionar.Name = "btnAdicionar";
            this.btnAdicionar.Size = new System.Drawing.Size(87, 22);
            this.btnAdicionar.Text = "Adicionar...";
            this.btnAdicionar.Click += new System.EventHandler(this.BtnAdiconar_Click);
            // 
            // toolStripSeparator1
            // 
            this.toolStripSeparator1.Name = "toolStripSeparator1";
            this.toolStripSeparator1.Size = new System.Drawing.Size(6, 25);
            // 
            // btnAtualizar
            // 
            this.btnAtualizar.Image = ((System.Drawing.Image)(resources.GetObject("btnAtualizar.Image")));
            this.btnAtualizar.ImageTransparentColor = System.Drawing.Color.Magenta;
            this.btnAtualizar.Name = "btnAtualizar";
            this.btnAtualizar.Size = new System.Drawing.Size(97, 22);
            this.btnAtualizar.Text = "Atualizar lista";
            this.btnAtualizar.Click += new System.EventHandler(this.btnAtualizar_Click);
            // 
            // statusStrip1
            // 
            this.statusStrip1.Items.AddRange(new System.Windows.Forms.ToolStripItem[] {
            this.progressImport});
            this.statusStrip1.Location = new System.Drawing.Point(0, 455);
            this.statusStrip1.Name = "statusStrip1";
            this.statusStrip1.Size = new System.Drawing.Size(764, 22);
            this.statusStrip1.TabIndex = 35;
            this.statusStrip1.Text = "statusStrip1";
            // 
            // progressImport
            // 
            this.progressImport.Name = "progressImport";
            this.progressImport.Size = new System.Drawing.Size(100, 16);
            this.progressImport.Visible = false;
            // 
            // tabControl1
            // 
            this.tabControl1.Controls.Add(this.tabPage1);
            this.tabControl1.Controls.Add(this.tabPage2);
            this.tabControl1.Location = new System.Drawing.Point(12, 28);
            this.tabControl1.Name = "tabControl1";
            this.tabControl1.SelectedIndex = 0;
            this.tabControl1.Size = new System.Drawing.Size(740, 424);
            this.tabControl1.TabIndex = 36;
            // 
            // tabPage1
            // 
            this.tabPage1.Controls.Add(this.dtlGeral);
            this.tabPage1.Controls.Add(this.groupBox1);
            this.tabPage1.Location = new System.Drawing.Point(4, 22);
            this.tabPage1.Name = "tabPage1";
            this.tabPage1.Padding = new System.Windows.Forms.Padding(3);
            this.tabPage1.Size = new System.Drawing.Size(732, 398);
            this.tabPage1.TabIndex = 0;
            this.tabPage1.Text = "Produção";
            this.tabPage1.UseVisualStyleBackColor = true;
            // 
            // tabPage2
            // 
            this.tabPage2.Controls.Add(this.gridArquivados);
            this.tabPage2.Controls.Add(this.groupBox2);
            this.tabPage2.Location = new System.Drawing.Point(4, 22);
            this.tabPage2.Name = "tabPage2";
            this.tabPage2.Padding = new System.Windows.Forms.Padding(3);
            this.tabPage2.Size = new System.Drawing.Size(732, 398);
            this.tabPage2.TabIndex = 1;
            this.tabPage2.Text = "Arquivados";
            this.tabPage2.UseVisualStyleBackColor = true;
            // 
            // gridArquivados
            // 
            this.gridArquivados.AllowUserToAddRows = false;
            this.gridArquivados.AllowUserToDeleteRows = false;
            this.gridArquivados.AllowUserToResizeRows = false;
            dataGridViewCellStyle6.BackColor = System.Drawing.Color.LightGray;
            this.gridArquivados.AlternatingRowsDefaultCellStyle = dataGridViewCellStyle6;
            this.gridArquivados.BackgroundColor = System.Drawing.Color.White;
            dataGridViewCellStyle7.Alignment = System.Windows.Forms.DataGridViewContentAlignment.MiddleLeft;
            dataGridViewCellStyle7.BackColor = System.Drawing.SystemColors.Control;
            dataGridViewCellStyle7.Font = new System.Drawing.Font("Microsoft Sans Serif", 8.25F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            dataGridViewCellStyle7.ForeColor = System.Drawing.SystemColors.WindowText;
            dataGridViewCellStyle7.SelectionBackColor = System.Drawing.SystemColors.Highlight;
            dataGridViewCellStyle7.SelectionForeColor = System.Drawing.SystemColors.HighlightText;
            dataGridViewCellStyle7.WrapMode = System.Windows.Forms.DataGridViewTriState.True;
            this.gridArquivados.ColumnHeadersDefaultCellStyle = dataGridViewCellStyle7;
            this.gridArquivados.ColumnHeadersHeightSizeMode = System.Windows.Forms.DataGridViewColumnHeadersHeightSizeMode.AutoSize;
            this.gridArquivados.Columns.AddRange(new System.Windows.Forms.DataGridViewColumn[] {
            this.ckArq,
            this.ArquivoArq,
            this.IdLayoutArq,
            this.LAYOUT_NAMEArq,
            this.dataGridViewTextBoxColumn4});
            dataGridViewCellStyle9.Alignment = System.Windows.Forms.DataGridViewContentAlignment.MiddleLeft;
            dataGridViewCellStyle9.BackColor = System.Drawing.SystemColors.Window;
            dataGridViewCellStyle9.Font = new System.Drawing.Font("Microsoft Sans Serif", 8.25F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            dataGridViewCellStyle9.ForeColor = System.Drawing.SystemColors.ControlText;
            dataGridViewCellStyle9.SelectionBackColor = System.Drawing.SystemColors.Highlight;
            dataGridViewCellStyle9.SelectionForeColor = System.Drawing.SystemColors.HighlightText;
            dataGridViewCellStyle9.WrapMode = System.Windows.Forms.DataGridViewTriState.False;
            this.gridArquivados.DefaultCellStyle = dataGridViewCellStyle9;
            this.gridArquivados.Dock = System.Windows.Forms.DockStyle.Fill;
            this.gridArquivados.Location = new System.Drawing.Point(3, 58);
            this.gridArquivados.MultiSelect = false;
            this.gridArquivados.Name = "gridArquivados";
            dataGridViewCellStyle10.Alignment = System.Windows.Forms.DataGridViewContentAlignment.MiddleLeft;
            dataGridViewCellStyle10.BackColor = System.Drawing.SystemColors.Control;
            dataGridViewCellStyle10.Font = new System.Drawing.Font("Microsoft Sans Serif", 8.25F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            dataGridViewCellStyle10.ForeColor = System.Drawing.SystemColors.WindowText;
            dataGridViewCellStyle10.SelectionBackColor = System.Drawing.SystemColors.Highlight;
            dataGridViewCellStyle10.SelectionForeColor = System.Drawing.SystemColors.HighlightText;
            dataGridViewCellStyle10.WrapMode = System.Windows.Forms.DataGridViewTriState.True;
            this.gridArquivados.RowHeadersDefaultCellStyle = dataGridViewCellStyle10;
            this.gridArquivados.RowHeadersVisible = false;
            this.gridArquivados.SelectionMode = System.Windows.Forms.DataGridViewSelectionMode.FullRowSelect;
            this.gridArquivados.Size = new System.Drawing.Size(726, 337);
            this.gridArquivados.TabIndex = 32;
            // 
            // ckArq
            // 
            this.ckArq.AutoSizeMode = System.Windows.Forms.DataGridViewAutoSizeColumnMode.AllCells;
            this.ckArq.DataPropertyName = "ck";
            this.ckArq.FalseValue = "";
            this.ckArq.HeaderText = "ck";
            this.ckArq.Name = "ckArq";
            this.ckArq.TrueValue = "1";
            this.ckArq.Width = 25;
            // 
            // ArquivoArq
            // 
            this.ArquivoArq.AutoSizeMode = System.Windows.Forms.DataGridViewAutoSizeColumnMode.Fill;
            this.ArquivoArq.HeaderText = "Arquivo";
            this.ArquivoArq.Name = "ArquivoArq";
            this.ArquivoArq.ReadOnly = true;
            // 
            // IdLayoutArq
            // 
            this.IdLayoutArq.DataPropertyName = "IdLayout";
            this.IdLayoutArq.HeaderText = "IdLayout";
            this.IdLayoutArq.Name = "IdLayoutArq";
            this.IdLayoutArq.Visible = false;
            // 
            // LAYOUT_NAMEArq
            // 
            this.LAYOUT_NAMEArq.DataPropertyName = "LAYOUT_NAME";
            this.LAYOUT_NAMEArq.HeaderText = "Layout";
            this.LAYOUT_NAMEArq.Name = "LAYOUT_NAMEArq";
            this.LAYOUT_NAMEArq.ReadOnly = true;
            // 
            // dataGridViewTextBoxColumn4
            // 
            this.dataGridViewTextBoxColumn4.AutoSizeMode = System.Windows.Forms.DataGridViewAutoSizeColumnMode.AllCells;
            dataGridViewCellStyle8.Format = "d";
            dataGridViewCellStyle8.NullValue = null;
            this.dataGridViewTextBoxColumn4.DefaultCellStyle = dataGridViewCellStyle8;
            this.dataGridViewTextBoxColumn4.HeaderText = "Importação";
            this.dataGridViewTextBoxColumn4.Name = "dataGridViewTextBoxColumn4";
            this.dataGridViewTextBoxColumn4.ReadOnly = true;
            this.dataGridViewTextBoxColumn4.Width = 85;
            // 
            // groupBox2
            // 
            this.groupBox2.Controls.Add(this.btnPedBuscaArq);
            this.groupBox2.Controls.Add(this.txtpedBuscaArq);
            this.groupBox2.Controls.Add(this.label3);
            this.groupBox2.Controls.Add(this.btnDesarquivar);
            this.groupBox2.Dock = System.Windows.Forms.DockStyle.Top;
            this.groupBox2.Location = new System.Drawing.Point(3, 3);
            this.groupBox2.Name = "groupBox2";
            this.groupBox2.Size = new System.Drawing.Size(726, 55);
            this.groupBox2.TabIndex = 33;
            this.groupBox2.TabStop = false;
            // 
            // btnPedBuscaArq
            // 
            this.btnPedBuscaArq.Image = global::App.Properties.Resources.find;
            this.btnPedBuscaArq.Location = new System.Drawing.Point(358, 10);
            this.btnPedBuscaArq.Name = "btnPedBuscaArq";
            this.btnPedBuscaArq.Size = new System.Drawing.Size(46, 36);
            this.btnPedBuscaArq.TabIndex = 31;
            this.btnPedBuscaArq.UseVisualStyleBackColor = true;
            this.btnPedBuscaArq.Click += new System.EventHandler(this.btnPedBuscaArq_Click);
            // 
            // txtpedBuscaArq
            // 
            this.txtpedBuscaArq.CharacterCasing = System.Windows.Forms.CharacterCasing.Upper;
            this.txtpedBuscaArq.Location = new System.Drawing.Point(57, 19);
            this.txtpedBuscaArq.Name = "txtpedBuscaArq";
            this.txtpedBuscaArq.Size = new System.Drawing.Size(295, 20);
            this.txtpedBuscaArq.TabIndex = 30;
            // 
            // label3
            // 
            this.label3.AutoSize = true;
            this.label3.Location = new System.Drawing.Point(8, 22);
            this.label3.Name = "label3";
            this.label3.Size = new System.Drawing.Size(43, 13);
            this.label3.TabIndex = 32;
            this.label3.Text = "Nº ped:";
            // 
            // btnDesarquivar
            // 
            this.btnDesarquivar.Location = new System.Drawing.Point(577, 17);
            this.btnDesarquivar.Name = "btnDesarquivar";
            this.btnDesarquivar.Size = new System.Drawing.Size(143, 23);
            this.btnDesarquivar.TabIndex = 29;
            this.btnDesarquivar.Text = "<= Desarquivar";
            this.btnDesarquivar.UseVisualStyleBackColor = true;
            this.btnDesarquivar.Click += new System.EventHandler(this.btnDesarquivar_Click);
            // 
            // frmImportacao
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(6F, 13F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.ClientSize = new System.Drawing.Size(764, 477);
            this.Controls.Add(this.tabControl1);
            this.Controls.Add(this.statusStrip1);
            this.Controls.Add(this.toolStrip2);
            this.Controls.Add(this.toolStrip1);
            this.FormBorderStyle = System.Windows.Forms.FormBorderStyle.FixedDialog;
            this.MaximizeBox = false;
            this.Name = "frmImportacao";
            this.StartPosition = System.Windows.Forms.FormStartPosition.CenterScreen;
            this.Text = "Arquivos importados";
            this.Load += new System.EventHandler(this.FormImportados_Load);
            ((System.ComponentModel.ISupportInitialize)(this.dtlGeral)).EndInit();
            this.toolStrip1.ResumeLayout(false);
            this.toolStrip1.PerformLayout();
            this.groupBox1.ResumeLayout(false);
            this.groupBox1.PerformLayout();
            this.toolStrip2.ResumeLayout(false);
            this.toolStrip2.PerformLayout();
            this.statusStrip1.ResumeLayout(false);
            this.statusStrip1.PerformLayout();
            this.tabControl1.ResumeLayout(false);
            this.tabPage1.ResumeLayout(false);
            this.tabPage2.ResumeLayout(false);
            ((System.ComponentModel.ISupportInitialize)(this.gridArquivados)).EndInit();
            this.groupBox2.ResumeLayout(false);
            this.groupBox2.PerformLayout();
            this.ResumeLayout(false);
            this.PerformLayout();

        }

        #endregion

        private System.Windows.Forms.DataGridView dtlGeral;
        private System.Windows.Forms.ToolStrip toolStrip1;
        private System.Windows.Forms.ToolStripComboBox cboPesquisa;
        private System.Windows.Forms.ToolStripTextBox txtPesquisa;
        private System.Windows.Forms.ToolStripButton BtnPesquisa;
        private System.Windows.Forms.Label label1;
        private System.Windows.Forms.TextBox txtpedBusca;
        private System.Windows.Forms.Button btnPedBusca;
        private System.Windows.Forms.GroupBox groupBox1;
        private System.Windows.Forms.ToolStrip toolStrip2;
        private System.Windows.Forms.ToolStripButton btnAbrir;
        private System.Windows.Forms.ToolStripButton btnAdicionar;
        private System.Windows.Forms.ToolStripSeparator toolStripSeparator1;
        private System.Windows.Forms.ToolStripSeparator toolStripSeparator2;
        private System.Windows.Forms.StatusStrip statusStrip1;
        private System.Windows.Forms.ToolStripProgressBar progressImport;
        private System.Windows.Forms.ToolStripButton btnAtualizar;
        private System.Windows.Forms.DataGridViewCheckBoxColumn ck;
        private System.Windows.Forms.DataGridViewTextBoxColumn Arquivo;
        private System.Windows.Forms.DataGridViewTextBoxColumn IdLayout;
        private System.Windows.Forms.DataGridViewTextBoxColumn LAYOUT_NAME;
        private System.Windows.Forms.DataGridViewTextBoxColumn Column3;
        private System.Windows.Forms.Label label2;
        private System.Windows.Forms.ComboBox cboGrupo;
        private System.Windows.Forms.TabControl tabControl1;
        private System.Windows.Forms.TabPage tabPage1;
        private System.Windows.Forms.TabPage tabPage2;
        private System.Windows.Forms.DataGridView gridArquivados;
        private System.Windows.Forms.GroupBox groupBox2;
        private System.Windows.Forms.Button btnDesarquivar;
        private System.Windows.Forms.Button btnPedBuscaArq;
        private System.Windows.Forms.TextBox txtpedBuscaArq;
        private System.Windows.Forms.Label label3;
        private System.Windows.Forms.DataGridViewCheckBoxColumn ckArq;
        private System.Windows.Forms.DataGridViewTextBoxColumn ArquivoArq;
        private System.Windows.Forms.DataGridViewTextBoxColumn IdLayoutArq;
        private System.Windows.Forms.DataGridViewTextBoxColumn LAYOUT_NAMEArq;
        private System.Windows.Forms.DataGridViewTextBoxColumn dataGridViewTextBoxColumn4;
        private System.Windows.Forms.Button btnArquivar;
    }
}