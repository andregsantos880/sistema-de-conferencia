namespace App
{
    partial class TabeUsua
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
            System.ComponentModel.ComponentResourceManager resources = new System.ComponentModel.ComponentResourceManager(typeof(TabeUsua));
            System.Windows.Forms.DataGridViewCellStyle dataGridViewCellStyle1 = new System.Windows.Forms.DataGridViewCellStyle();
            System.Windows.Forms.DataGridViewCellStyle dataGridViewCellStyle2 = new System.Windows.Forms.DataGridViewCellStyle();
            System.Windows.Forms.DataGridViewCellStyle dataGridViewCellStyle3 = new System.Windows.Forms.DataGridViewCellStyle();
            System.Windows.Forms.DataGridViewCellStyle dataGridViewCellStyle4 = new System.Windows.Forms.DataGridViewCellStyle();
            this.toolStrip1 = new System.Windows.Forms.ToolStrip();
            this.mnuIncluir = new System.Windows.Forms.ToolStripButton();
            this.MnuAlterar = new System.Windows.Forms.ToolStripButton();
            this.mnuExcluir = new System.Windows.Forms.ToolStripButton();
            this.MnuConsultar = new System.Windows.Forms.ToolStripButton();
            this.MnuAtualizar = new System.Windows.Forms.ToolStripButton();
            this.statusStrip1 = new System.Windows.Forms.StatusStrip();
            this.dtlGeral = new System.Windows.Forms.DataGridView();
            this.ID = new System.Windows.Forms.DataGridViewTextBoxColumn();
            this.NOME = new System.Windows.Forms.DataGridViewTextBoxColumn();
            this.NIVEL = new System.Windows.Forms.DataGridViewTextBoxColumn();
            this.LOGIN = new System.Windows.Forms.DataGridViewTextBoxColumn();
            this.toolStrip1.SuspendLayout();
            ((System.ComponentModel.ISupportInitialize)(this.dtlGeral)).BeginInit();
            this.SuspendLayout();
            // 
            // toolStrip1
            // 
            this.toolStrip1.AutoSize = false;
            this.toolStrip1.Items.AddRange(new System.Windows.Forms.ToolStripItem[] {
            this.mnuIncluir,
            this.MnuAlterar,
            this.mnuExcluir,
            this.MnuConsultar,
            this.MnuAtualizar});
            this.toolStrip1.Location = new System.Drawing.Point(0, 0);
            this.toolStrip1.Name = "toolStrip1";
            this.toolStrip1.Size = new System.Drawing.Size(609, 42);
            this.toolStrip1.TabIndex = 7;
            this.toolStrip1.Text = "toolStrip1";
            // 
            // mnuIncluir
            // 
            this.mnuIncluir.Image = global::App.Properties.Resources.add;
            this.mnuIncluir.ImageScaling = System.Windows.Forms.ToolStripItemImageScaling.None;
            this.mnuIncluir.ImageTransparentColor = System.Drawing.Color.Magenta;
            this.mnuIncluir.Name = "mnuIncluir";
            this.mnuIncluir.Size = new System.Drawing.Size(99, 39);
            this.mnuIncluir.Text = "F5 - Incluir";
            this.mnuIncluir.Click += new System.EventHandler(this.mnuIncluir_Click);
            // 
            // MnuAlterar
            // 
            this.MnuAlterar.Image = global::App.Properties.Resources.petition_icon;
            this.MnuAlterar.ImageScaling = System.Windows.Forms.ToolStripItemImageScaling.None;
            this.MnuAlterar.ImageTransparentColor = System.Drawing.Color.Magenta;
            this.MnuAlterar.Name = "MnuAlterar";
            this.MnuAlterar.Size = new System.Drawing.Size(96, 39);
            this.MnuAlterar.Text = "F6 - Editar";
            this.MnuAlterar.Click += new System.EventHandler(this.MnuAlterar_Click);
            // 
            // mnuExcluir
            // 
            this.mnuExcluir.Image = global::App.Properties.Resources.delete_01;
            this.mnuExcluir.ImageScaling = System.Windows.Forms.ToolStripItemImageScaling.None;
            this.mnuExcluir.ImageTransparentColor = System.Drawing.Color.Magenta;
            this.mnuExcluir.Name = "mnuExcluir";
            this.mnuExcluir.Size = new System.Drawing.Size(100, 39);
            this.mnuExcluir.Text = "F7 - Excluir";
            this.mnuExcluir.Click += new System.EventHandler(this.mnuExcluir_Click);
            // 
            // MnuConsultar
            // 
            this.MnuConsultar.Image = global::App.Properties.Resources.consultar;
            this.MnuConsultar.ImageScaling = System.Windows.Forms.ToolStripItemImageScaling.None;
            this.MnuConsultar.ImageTransparentColor = System.Drawing.Color.Magenta;
            this.MnuConsultar.Name = "MnuConsultar";
            this.MnuConsultar.Size = new System.Drawing.Size(117, 39);
            this.MnuConsultar.Text = "F8 - Consultar";
            this.MnuConsultar.Click += new System.EventHandler(this.MnuConsultar_Click);
            // 
            // MnuAtualizar
            // 
            this.MnuAtualizar.Image = ((System.Drawing.Image)(resources.GetObject("MnuAtualizar.Image")));
            this.MnuAtualizar.ImageScaling = System.Windows.Forms.ToolStripItemImageScaling.None;
            this.MnuAtualizar.ImageTransparentColor = System.Drawing.Color.Magenta;
            this.MnuAtualizar.Name = "MnuAtualizar";
            this.MnuAtualizar.Size = new System.Drawing.Size(110, 39);
            this.MnuAtualizar.Text = "F11 - Atualizar";
            this.MnuAtualizar.Click += new System.EventHandler(this.MnuAtualizar_Click);
            // 
            // statusStrip1
            // 
            this.statusStrip1.Location = new System.Drawing.Point(0, 315);
            this.statusStrip1.Name = "statusStrip1";
            this.statusStrip1.Size = new System.Drawing.Size(609, 22);
            this.statusStrip1.TabIndex = 8;
            this.statusStrip1.Text = "statusStrip1";
            // 
            // dtlGeral
            // 
            this.dtlGeral.AllowUserToAddRows = false;
            this.dtlGeral.AllowUserToDeleteRows = false;
            this.dtlGeral.AllowUserToResizeRows = false;
            dataGridViewCellStyle1.BackColor = System.Drawing.Color.LightBlue;
            this.dtlGeral.AlternatingRowsDefaultCellStyle = dataGridViewCellStyle1;
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
            this.ID,
            this.NOME,
            this.NIVEL,
            this.LOGIN});
            dataGridViewCellStyle3.Alignment = System.Windows.Forms.DataGridViewContentAlignment.MiddleLeft;
            dataGridViewCellStyle3.BackColor = System.Drawing.SystemColors.Window;
            dataGridViewCellStyle3.Font = new System.Drawing.Font("Microsoft Sans Serif", 8.25F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            dataGridViewCellStyle3.ForeColor = System.Drawing.SystemColors.ControlText;
            dataGridViewCellStyle3.SelectionBackColor = System.Drawing.SystemColors.Highlight;
            dataGridViewCellStyle3.SelectionForeColor = System.Drawing.SystemColors.HighlightText;
            dataGridViewCellStyle3.WrapMode = System.Windows.Forms.DataGridViewTriState.False;
            this.dtlGeral.DefaultCellStyle = dataGridViewCellStyle3;
            this.dtlGeral.Dock = System.Windows.Forms.DockStyle.Fill;
            this.dtlGeral.Location = new System.Drawing.Point(0, 42);
            this.dtlGeral.MultiSelect = false;
            this.dtlGeral.Name = "dtlGeral";
            this.dtlGeral.ReadOnly = true;
            dataGridViewCellStyle4.Alignment = System.Windows.Forms.DataGridViewContentAlignment.MiddleLeft;
            dataGridViewCellStyle4.BackColor = System.Drawing.SystemColors.Control;
            dataGridViewCellStyle4.Font = new System.Drawing.Font("Microsoft Sans Serif", 8.25F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            dataGridViewCellStyle4.ForeColor = System.Drawing.SystemColors.WindowText;
            dataGridViewCellStyle4.SelectionBackColor = System.Drawing.SystemColors.Highlight;
            dataGridViewCellStyle4.SelectionForeColor = System.Drawing.SystemColors.HighlightText;
            dataGridViewCellStyle4.WrapMode = System.Windows.Forms.DataGridViewTriState.True;
            this.dtlGeral.RowHeadersDefaultCellStyle = dataGridViewCellStyle4;
            this.dtlGeral.RowHeadersVisible = false;
            this.dtlGeral.SelectionMode = System.Windows.Forms.DataGridViewSelectionMode.FullRowSelect;
            this.dtlGeral.Size = new System.Drawing.Size(609, 273);
            this.dtlGeral.TabIndex = 9;
            // 
            // ID
            // 
            this.ID.AutoSizeMode = System.Windows.Forms.DataGridViewAutoSizeColumnMode.AllCells;
            this.ID.DataPropertyName = "ID";
            this.ID.HeaderText = "ID";
            this.ID.Name = "ID";
            this.ID.ReadOnly = true;
            this.ID.Visible = false;
            // 
            // NOME
            // 
            this.NOME.AutoSizeMode = System.Windows.Forms.DataGridViewAutoSizeColumnMode.Fill;
            this.NOME.DataPropertyName = "NOME";
            this.NOME.HeaderText = "Nome";
            this.NOME.Name = "NOME";
            this.NOME.ReadOnly = true;
            // 
            // NIVEL
            // 
            this.NIVEL.AutoSizeMode = System.Windows.Forms.DataGridViewAutoSizeColumnMode.AllCells;
            this.NIVEL.DataPropertyName = "NIVEL";
            this.NIVEL.HeaderText = "Nível";
            this.NIVEL.Name = "NIVEL";
            this.NIVEL.ReadOnly = true;
            this.NIVEL.Width = 58;
            // 
            // LOGIN
            // 
            this.LOGIN.AutoSizeMode = System.Windows.Forms.DataGridViewAutoSizeColumnMode.AllCells;
            this.LOGIN.DataPropertyName = "LOGIN";
            this.LOGIN.HeaderText = "Login";
            this.LOGIN.Name = "LOGIN";
            this.LOGIN.ReadOnly = true;
            this.LOGIN.Width = 58;
            // 
            // TabeUsua
            // 
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Inherit;
            this.ClientSize = new System.Drawing.Size(609, 337);
            this.Controls.Add(this.dtlGeral);
            this.Controls.Add(this.toolStrip1);
            this.Controls.Add(this.statusStrip1);
            this.FormBorderStyle = System.Windows.Forms.FormBorderStyle.FixedDialog;
            this.KeyPreview = true;
            this.MaximizeBox = false;
            this.Name = "TabeUsua";
            this.StartPosition = System.Windows.Forms.FormStartPosition.CenterScreen;
            this.Text = "Tabela de usuários";
            this.Load += new System.EventHandler(this.TabeMidi_Load);
            this.KeyDown += new System.Windows.Forms.KeyEventHandler(this.Tabe_KeyDown);
            this.toolStrip1.ResumeLayout(false);
            this.toolStrip1.PerformLayout();
            ((System.ComponentModel.ISupportInitialize)(this.dtlGeral)).EndInit();
            this.ResumeLayout(false);
            this.PerformLayout();

        }

        #endregion

        private System.Windows.Forms.ToolStrip toolStrip1;
        private System.Windows.Forms.StatusStrip statusStrip1;
        private System.Windows.Forms.DataGridView dtlGeral;
        private System.Windows.Forms.DataGridViewTextBoxColumn ID;
        private System.Windows.Forms.DataGridViewTextBoxColumn NOME;
        private System.Windows.Forms.DataGridViewTextBoxColumn NIVEL;
        private System.Windows.Forms.DataGridViewTextBoxColumn LOGIN;
        private System.Windows.Forms.ToolStripButton mnuIncluir;
        private System.Windows.Forms.ToolStripButton MnuAlterar;
        private System.Windows.Forms.ToolStripButton mnuExcluir;
        private System.Windows.Forms.ToolStripButton MnuConsultar;
        private System.Windows.Forms.ToolStripButton MnuAtualizar;
    }
}