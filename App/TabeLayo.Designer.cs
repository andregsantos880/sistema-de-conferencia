namespace App
{
    partial class TabeLayo
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
            System.ComponentModel.ComponentResourceManager resources = new System.ComponentModel.ComponentResourceManager(typeof(TabeLayo));
            this.btnImportar = new System.Windows.Forms.Button();
            this.cboLayout = new System.Windows.Forms.ComboBox();
            this.label1 = new System.Windows.Forms.Label();
            this.progressBarImportacao = new System.Windows.Forms.ProgressBar();
            this.lblProgressImportacao = new System.Windows.Forms.Label();
            this.checkedListBoxLojas = new System.Windows.Forms.CheckedListBox();
            this.buttonIncluirLojasSelecionadas = new System.Windows.Forms.Button();
            this.label2 = new System.Windows.Forms.Label();
            this.SuspendLayout();
            // 
            // btnImportar
            // 
            this.btnImportar.Enabled = false;
            this.btnImportar.Image = ((System.Drawing.Image)(resources.GetObject("btnImportar.Image")));
            this.btnImportar.ImageAlign = System.Drawing.ContentAlignment.MiddleLeft;
            this.btnImportar.Location = new System.Drawing.Point(319, 20);
            this.btnImportar.Name = "btnImportar";
            this.btnImportar.Size = new System.Drawing.Size(79, 24);
            this.btnImportar.TabIndex = 1;
            this.btnImportar.Text = "Arquivo...";
            this.btnImportar.TextAlign = System.Drawing.ContentAlignment.MiddleRight;
            this.btnImportar.UseVisualStyleBackColor = true;
            this.btnImportar.Click += new System.EventHandler(this.btnInportar_Click);
            // 
            // cboLayout
            // 
            this.cboLayout.DropDownStyle = System.Windows.Forms.ComboBoxStyle.DropDownList;
            this.cboLayout.FormattingEnabled = true;
            this.cboLayout.Location = new System.Drawing.Point(12, 23);
            this.cboLayout.Name = "cboLayout";
            this.cboLayout.Size = new System.Drawing.Size(301, 21);
            this.cboLayout.TabIndex = 2;
            this.cboLayout.SelectedIndexChanged += new System.EventHandler(this.cboLayout_SelectedIndexChanged);
            // 
            // label1
            // 
            this.label1.AutoSize = true;
            this.label1.Location = new System.Drawing.Point(9, 7);
            this.label1.Name = "label1";
            this.label1.Size = new System.Drawing.Size(42, 13);
            this.label1.TabIndex = 3;
            this.label1.Text = "Fábrica";
            // 
            // progressBarImportacao
            // 
            this.progressBarImportacao.Location = new System.Drawing.Point(12, 72);
            this.progressBarImportacao.Name = "progressBarImportacao";
            this.progressBarImportacao.Size = new System.Drawing.Size(386, 23);
            this.progressBarImportacao.Style = System.Windows.Forms.ProgressBarStyle.Continuous;
            this.progressBarImportacao.TabIndex = 7;
            // 
            // lblProgressImportacao
            // 
            this.lblProgressImportacao.AutoSize = true;
            this.lblProgressImportacao.Location = new System.Drawing.Point(9, 55);
            this.lblProgressImportacao.Name = "lblProgressImportacao";
            this.lblProgressImportacao.Size = new System.Drawing.Size(127, 13);
            this.lblProgressImportacao.TabIndex = 8;
            this.lblProgressImportacao.Text = "50% Importando dados ...";
            // 
            // checkedListBoxLojas
            // 
            this.checkedListBoxLojas.FormattingEnabled = true;
            this.checkedListBoxLojas.Location = new System.Drawing.Point(12, 119);
            this.checkedListBoxLojas.Name = "checkedListBoxLojas";
            this.checkedListBoxLojas.Size = new System.Drawing.Size(385, 109);
            this.checkedListBoxLojas.TabIndex = 10;
            // 
            // buttonIncluirLojasSelecionadas
            // 
            this.buttonIncluirLojasSelecionadas.Image = ((System.Drawing.Image)(resources.GetObject("buttonIncluirLojasSelecionadas.Image")));
            this.buttonIncluirLojasSelecionadas.ImageAlign = System.Drawing.ContentAlignment.MiddleLeft;
            this.buttonIncluirLojasSelecionadas.Location = new System.Drawing.Point(247, 243);
            this.buttonIncluirLojasSelecionadas.Name = "buttonIncluirLojasSelecionadas";
            this.buttonIncluirLojasSelecionadas.Size = new System.Drawing.Size(151, 24);
            this.buttonIncluirLojasSelecionadas.TabIndex = 11;
            this.buttonIncluirLojasSelecionadas.Text = "Incluir lojas selecionadas.";
            this.buttonIncluirLojasSelecionadas.TextAlign = System.Drawing.ContentAlignment.MiddleRight;
            this.buttonIncluirLojasSelecionadas.UseVisualStyleBackColor = true;
            this.buttonIncluirLojasSelecionadas.Click += new System.EventHandler(this.buttonIncluirLojasSelecionadas_Click);
            // 
            // label2
            // 
            this.label2.AutoSize = true;
            this.label2.Location = new System.Drawing.Point(13, 103);
            this.label2.Name = "label2";
            this.label2.Size = new System.Drawing.Size(98, 13);
            this.label2.TabIndex = 12;
            this.label2.Text = "Selecionar as lojas:";
            // 
            // TabeLayo
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(6F, 13F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.ClientSize = new System.Drawing.Size(409, 54);
            this.Controls.Add(this.label2);
            this.Controls.Add(this.buttonIncluirLojasSelecionadas);
            this.Controls.Add(this.checkedListBoxLojas);
            this.Controls.Add(this.lblProgressImportacao);
            this.Controls.Add(this.progressBarImportacao);
            this.Controls.Add(this.label1);
            this.Controls.Add(this.cboLayout);
            this.Controls.Add(this.btnImportar);
            this.FormBorderStyle = System.Windows.Forms.FormBorderStyle.FixedDialog;
            this.MaximizeBox = false;
            this.Name = "TabeLayo";
            this.StartPosition = System.Windows.Forms.FormStartPosition.CenterScreen;
            this.Text = "Importação de Arquivos ";
            this.Load += new System.EventHandler(this.TabeLayo_Load);
            this.ResumeLayout(false);
            this.PerformLayout();

        }

        #endregion

        private System.Windows.Forms.Button btnImportar;
        private System.Windows.Forms.ComboBox cboLayout;
        private System.Windows.Forms.Label label1;
        private System.Windows.Forms.ProgressBar progressBarImportacao;
        private System.Windows.Forms.Label lblProgressImportacao;
        private System.Windows.Forms.CheckedListBox checkedListBoxLojas;
        private System.Windows.Forms.Button buttonIncluirLojasSelecionadas;
        private System.Windows.Forms.Label label2;
    }
}