namespace App
{
    partial class frmImportWeb
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
            System.ComponentModel.ComponentResourceManager resources = new System.ComponentModel.ComponentResourceManager(typeof(frmImportWeb));
            System.Windows.Forms.DataGridViewCellStyle dataGridViewCellStyle3 = new System.Windows.Forms.DataGridViewCellStyle();
            this.dtlGeral = new System.Windows.Forms.DataGridView();
            this.statusStrip1 = new System.Windows.Forms.StatusStrip();
            this.progressImport = new System.Windows.Forms.ToolStripProgressBar();
            this.toolStripStatusLabel2 = new System.Windows.Forms.ToolStripStatusLabel();
            this.toolStripStatusLabel1 = new System.Windows.Forms.ToolStripStatusLabel();
            this.toolStrip1 = new System.Windows.Forms.ToolStrip();
            this.btnAtualizar = new System.Windows.Forms.ToolStripButton();
            this.toolStripSeparator2 = new System.Windows.Forms.ToolStripSeparator();
            this.btnBaixar = new System.Windows.Forms.ToolStripButton();
            this.btnAdiconar = new System.Windows.Forms.ToolStripButton();
            this.toolStripSeparator1 = new System.Windows.Forms.ToolStripSeparator();
            this.txtObservacao = new System.Windows.Forms.TextBox();
            this.label1 = new System.Windows.Forms.Label();
            this.controle = new System.Windows.Forms.DataGridViewTextBoxColumn();
            this.pic = new System.Windows.Forms.DataGridViewImageColumn();
            this.Processar = new System.Windows.Forms.DataGridViewCheckBoxColumn();
            this.layoutId = new System.Windows.Forms.DataGridViewTextBoxColumn();
            this.layout = new System.Windows.Forms.DataGridViewTextBoxColumn();
            this.carga = new System.Windows.Forms.DataGridViewTextBoxColumn();
            this.dataCarga = new System.Windows.Forms.DataGridViewTextBoxColumn();
            this.usuarioInclusao = new System.Windows.Forms.DataGridViewTextBoxColumn();
            this.linkBaixa = new System.Windows.Forms.DataGridViewTextBoxColumn();
            this.linkArquivo = new System.Windows.Forms.DataGridViewTextBoxColumn();
            this.Observacao = new System.Windows.Forms.DataGridViewTextBoxColumn();
            ((System.ComponentModel.ISupportInitialize)(this.dtlGeral)).BeginInit();
            this.statusStrip1.SuspendLayout();
            this.toolStrip1.SuspendLayout();
            this.SuspendLayout();
            // 
            // dtlGeral
            // 
            this.dtlGeral.AllowUserToAddRows = false;
            this.dtlGeral.AllowUserToDeleteRows = false;
            this.dtlGeral.AllowUserToResizeColumns = false;
            this.dtlGeral.AllowUserToResizeRows = false;
            dataGridViewCellStyle1.BackColor = System.Drawing.Color.LightSkyBlue;
            this.dtlGeral.AlternatingRowsDefaultCellStyle = dataGridViewCellStyle1;
            this.dtlGeral.BackgroundColor = System.Drawing.Color.White;
            this.dtlGeral.BorderStyle = System.Windows.Forms.BorderStyle.Fixed3D;
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
            this.controle,
            this.pic,
            this.Processar,
            this.layoutId,
            this.layout,
            this.carga,
            this.dataCarga,
            this.usuarioInclusao,
            this.linkBaixa,
            this.linkArquivo,
            this.Observacao});
            dataGridViewCellStyle4.Alignment = System.Windows.Forms.DataGridViewContentAlignment.MiddleLeft;
            dataGridViewCellStyle4.BackColor = System.Drawing.SystemColors.Window;
            dataGridViewCellStyle4.Font = new System.Drawing.Font("Microsoft Sans Serif", 8.25F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            dataGridViewCellStyle4.ForeColor = System.Drawing.SystemColors.ControlText;
            dataGridViewCellStyle4.SelectionBackColor = System.Drawing.SystemColors.Highlight;
            dataGridViewCellStyle4.SelectionForeColor = System.Drawing.SystemColors.HighlightText;
            dataGridViewCellStyle4.WrapMode = System.Windows.Forms.DataGridViewTriState.False;
            this.dtlGeral.DefaultCellStyle = dataGridViewCellStyle4;
            this.dtlGeral.Location = new System.Drawing.Point(12, 28);
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
            this.dtlGeral.Size = new System.Drawing.Size(487, 196);
            this.dtlGeral.TabIndex = 2;
            this.dtlGeral.SelectionChanged += new System.EventHandler(this.dtlGeral_SelectionChanged);
            // 
            // statusStrip1
            // 
            this.statusStrip1.Items.AddRange(new System.Windows.Forms.ToolStripItem[] {
            this.progressImport,
            this.toolStripStatusLabel2,
            this.toolStripStatusLabel1});
            this.statusStrip1.Location = new System.Drawing.Point(0, 304);
            this.statusStrip1.Name = "statusStrip1";
            this.statusStrip1.Size = new System.Drawing.Size(511, 22);
            this.statusStrip1.TabIndex = 32;
            this.statusStrip1.Text = "statusStrip1";
            // 
            // progressImport
            // 
            this.progressImport.Name = "progressImport";
            this.progressImport.Size = new System.Drawing.Size(100, 16);
            this.progressImport.Visible = false;
            // 
            // toolStripStatusLabel2
            // 
            this.toolStripStatusLabel2.Image = global::App.Properties.Resources.bandeira_branca;
            this.toolStripStatusLabel2.Name = "toolStripStatusLabel2";
            this.toolStripStatusLabel2.Size = new System.Drawing.Size(78, 17);
            this.toolStripStatusLabel2.Text = "Pendentes";
            // 
            // toolStripStatusLabel1
            // 
            this.toolStripStatusLabel1.Image = global::App.Properties.Resources.bandeira_verde;
            this.toolStripStatusLabel1.Name = "toolStripStatusLabel1";
            this.toolStripStatusLabel1.Size = new System.Drawing.Size(69, 17);
            this.toolStripStatusLabel1.Text = "Baixados";
            // 
            // toolStrip1
            // 
            this.toolStrip1.Items.AddRange(new System.Windows.Forms.ToolStripItem[] {
            this.btnAtualizar,
            this.toolStripSeparator2,
            this.btnBaixar,
            this.btnAdiconar,
            this.toolStripSeparator1});
            this.toolStrip1.Location = new System.Drawing.Point(0, 0);
            this.toolStrip1.Name = "toolStrip1";
            this.toolStrip1.Size = new System.Drawing.Size(511, 25);
            this.toolStrip1.TabIndex = 33;
            this.toolStrip1.Text = "toolStrip1";
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
            // toolStripSeparator2
            // 
            this.toolStripSeparator2.Name = "toolStripSeparator2";
            this.toolStripSeparator2.Size = new System.Drawing.Size(6, 25);
            // 
            // btnBaixar
            // 
            this.btnBaixar.Enabled = false;
            this.btnBaixar.Image = global::App.Properties.Resources.Download_icon;
            this.btnBaixar.ImageTransparentColor = System.Drawing.Color.Magenta;
            this.btnBaixar.Name = "btnBaixar";
            this.btnBaixar.Size = new System.Drawing.Size(58, 22);
            this.btnBaixar.Text = "Baixar";
            this.btnBaixar.Click += new System.EventHandler(this.btnBaixar_Click);
            // 
            // btnAdiconar
            // 
            this.btnAdiconar.Image = global::App.Properties.Resources.file_add;
            this.btnAdiconar.ImageTransparentColor = System.Drawing.Color.Magenta;
            this.btnAdiconar.Name = "btnAdiconar";
            this.btnAdiconar.Size = new System.Drawing.Size(87, 22);
            this.btnAdiconar.Text = "Adicionar...";
            this.btnAdiconar.Click += new System.EventHandler(this.btnAdiconar_Click);
            // 
            // toolStripSeparator1
            // 
            this.toolStripSeparator1.Name = "toolStripSeparator1";
            this.toolStripSeparator1.Size = new System.Drawing.Size(6, 25);
            // 
            // txtObservacao
            // 
            this.txtObservacao.Location = new System.Drawing.Point(12, 250);
            this.txtObservacao.Multiline = true;
            this.txtObservacao.Name = "txtObservacao";
            this.txtObservacao.ReadOnly = true;
            this.txtObservacao.ScrollBars = System.Windows.Forms.ScrollBars.Vertical;
            this.txtObservacao.Size = new System.Drawing.Size(487, 45);
            this.txtObservacao.TabIndex = 34;
            // 
            // label1
            // 
            this.label1.AutoSize = true;
            this.label1.Location = new System.Drawing.Point(12, 234);
            this.label1.Name = "label1";
            this.label1.Size = new System.Drawing.Size(73, 13);
            this.label1.TabIndex = 35;
            this.label1.Text = "Observações:";
            // 
            // controle
            // 
            this.controle.HeaderText = "controle";
            this.controle.Name = "controle";
            this.controle.ReadOnly = true;
            this.controle.Visible = false;
            // 
            // pic
            // 
            this.pic.AutoSizeMode = System.Windows.Forms.DataGridViewAutoSizeColumnMode.AllCells;
            this.pic.DataPropertyName = "pic";
            this.pic.HeaderText = "pic";
            this.pic.Name = "pic";
            this.pic.Width = 27;
            // 
            // Processar
            // 
            this.Processar.AutoSizeMode = System.Windows.Forms.DataGridViewAutoSizeColumnMode.AllCells;
            this.Processar.HeaderText = "Processar";
            this.Processar.Name = "Processar";
            this.Processar.Width = 60;
            // 
            // layoutId
            // 
            this.layoutId.HeaderText = "layoutId";
            this.layoutId.Name = "layoutId";
            this.layoutId.Visible = false;
            // 
            // layout
            // 
            this.layout.AutoSizeMode = System.Windows.Forms.DataGridViewAutoSizeColumnMode.AllCells;
            this.layout.HeaderText = "layout";
            this.layout.Name = "layout";
            this.layout.ReadOnly = true;
            this.layout.Width = 60;
            // 
            // carga
            // 
            this.carga.AutoSizeMode = System.Windows.Forms.DataGridViewAutoSizeColumnMode.AllCells;
            dataGridViewCellStyle3.Alignment = System.Windows.Forms.DataGridViewContentAlignment.MiddleRight;
            this.carga.DefaultCellStyle = dataGridViewCellStyle3;
            this.carga.HeaderText = "Carga";
            this.carga.Name = "carga";
            this.carga.ReadOnly = true;
            this.carga.Width = 60;
            // 
            // dataCarga
            // 
            this.dataCarga.AutoSizeMode = System.Windows.Forms.DataGridViewAutoSizeColumnMode.AllCells;
            this.dataCarga.HeaderText = "Data";
            this.dataCarga.Name = "dataCarga";
            this.dataCarga.ReadOnly = true;
            this.dataCarga.Width = 55;
            // 
            // usuarioInclusao
            // 
            this.usuarioInclusao.AutoSizeMode = System.Windows.Forms.DataGridViewAutoSizeColumnMode.Fill;
            this.usuarioInclusao.HeaderText = "Enviado por";
            this.usuarioInclusao.Name = "usuarioInclusao";
            this.usuarioInclusao.ReadOnly = true;
            // 
            // linkBaixa
            // 
            this.linkBaixa.HeaderText = "linkBaixa";
            this.linkBaixa.Name = "linkBaixa";
            this.linkBaixa.ReadOnly = true;
            this.linkBaixa.Visible = false;
            // 
            // linkArquivo
            // 
            this.linkArquivo.HeaderText = "linkArquivo";
            this.linkArquivo.Name = "linkArquivo";
            this.linkArquivo.ReadOnly = true;
            this.linkArquivo.Visible = false;
            // 
            // Observacao
            // 
            this.Observacao.HeaderText = "Observação";
            this.Observacao.Name = "Observacao";
            this.Observacao.Visible = false;
            // 
            // frmImportWeb
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(6F, 13F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.ClientSize = new System.Drawing.Size(511, 326);
            this.Controls.Add(this.label1);
            this.Controls.Add(this.txtObservacao);
            this.Controls.Add(this.toolStrip1);
            this.Controls.Add(this.statusStrip1);
            this.Controls.Add(this.dtlGeral);
            this.FormBorderStyle = System.Windows.Forms.FormBorderStyle.FixedDialog;
            this.MaximizeBox = false;
            this.Name = "frmImportWeb";
            this.StartPosition = System.Windows.Forms.FormStartPosition.CenterScreen;
            this.Text = "Importação";
            ((System.ComponentModel.ISupportInitialize)(this.dtlGeral)).EndInit();
            this.statusStrip1.ResumeLayout(false);
            this.statusStrip1.PerformLayout();
            this.toolStrip1.ResumeLayout(false);
            this.toolStrip1.PerformLayout();
            this.ResumeLayout(false);
            this.PerformLayout();

        }

        #endregion

        private System.Windows.Forms.DataGridView dtlGeral;
        private System.Windows.Forms.StatusStrip statusStrip1;
        private System.Windows.Forms.ToolStripProgressBar progressImport;
        private System.Windows.Forms.ToolStripStatusLabel toolStripStatusLabel2;
        private System.Windows.Forms.ToolStripStatusLabel toolStripStatusLabel1;
        private System.Windows.Forms.ToolStrip toolStrip1;
        private System.Windows.Forms.ToolStripButton btnAtualizar;
        private System.Windows.Forms.ToolStripButton btnBaixar;
        private System.Windows.Forms.ToolStripSeparator toolStripSeparator1;
        private System.Windows.Forms.ToolStripButton btnAdiconar;
        private System.Windows.Forms.ToolStripSeparator toolStripSeparator2;
        private System.Windows.Forms.DataGridViewTextBoxColumn controle;
        private System.Windows.Forms.DataGridViewImageColumn pic;
        private System.Windows.Forms.DataGridViewCheckBoxColumn Processar;
        private System.Windows.Forms.DataGridViewTextBoxColumn layoutId;
        private System.Windows.Forms.DataGridViewTextBoxColumn layout;
        private System.Windows.Forms.DataGridViewTextBoxColumn carga;
        private System.Windows.Forms.DataGridViewTextBoxColumn dataCarga;
        private System.Windows.Forms.DataGridViewTextBoxColumn usuarioInclusao;
        private System.Windows.Forms.DataGridViewTextBoxColumn linkBaixa;
        private System.Windows.Forms.DataGridViewTextBoxColumn linkArquivo;
        private System.Windows.Forms.DataGridViewTextBoxColumn Observacao;
        private System.Windows.Forms.TextBox txtObservacao;
        private System.Windows.Forms.Label label1;
    }
}