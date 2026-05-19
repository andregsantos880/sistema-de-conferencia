namespace App
{
    partial class FormFiltro
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
            this.normalCheckBox = new System.Windows.Forms.CheckBox();
            this.conferidoCheckBox = new System.Windows.Forms.CheckBox();
            this.saidaCheckBox = new System.Windows.Forms.CheckBox();
            this.entregaCheckBox = new System.Windows.Forms.CheckBox();
            this.clienteCheckedListBox = new System.Windows.Forms.CheckedListBox();
            this.produtoCheckedListBox = new System.Windows.Forms.CheckedListBox();
            this.confirmarButton = new System.Windows.Forms.Button();
            this.tabControl1 = new System.Windows.Forms.TabControl();
            this.tabPage1 = new System.Windows.Forms.TabPage();
            this.tabPage2 = new System.Windows.Forms.TabPage();
            this.tabPage3 = new System.Windows.Forms.TabPage();
            this.label1 = new System.Windows.Forms.Label();
            this.txtpedBusca = new System.Windows.Forms.TextBox();
            this.btnPedBusca = new System.Windows.Forms.Button();
            this.pedidoCheckedListBox = new System.Windows.Forms.CheckedListBox();
            this.tabPage4 = new System.Windows.Forms.TabPage();
            this.ComputadorCheckedListBox = new System.Windows.Forms.CheckedListBox();
            this.tabPage5 = new System.Windows.Forms.TabPage();
            this.label2 = new System.Windows.Forms.Label();
            this.txtOrdemCompra = new System.Windows.Forms.TextBox();
            this.btnPesquisaOrdem = new System.Windows.Forms.Button();
            this.ordemCompraCheckedListBox = new System.Windows.Forms.CheckedListBox();
            this.tabControl1.SuspendLayout();
            this.tabPage1.SuspendLayout();
            this.tabPage2.SuspendLayout();
            this.tabPage3.SuspendLayout();
            this.tabPage4.SuspendLayout();
            this.tabPage5.SuspendLayout();
            this.SuspendLayout();
            // 
            // normalCheckBox
            // 
            this.normalCheckBox.AutoSize = true;
            this.normalCheckBox.Checked = true;
            this.normalCheckBox.CheckState = System.Windows.Forms.CheckState.Checked;
            this.normalCheckBox.Location = new System.Drawing.Point(11, 280);
            this.normalCheckBox.Name = "normalCheckBox";
            this.normalCheckBox.Size = new System.Drawing.Size(59, 17);
            this.normalCheckBox.TabIndex = 15;
            this.normalCheckBox.Text = "Normal";
            this.normalCheckBox.UseVisualStyleBackColor = true;
            // 
            // conferidoCheckBox
            // 
            this.conferidoCheckBox.AutoSize = true;
            this.conferidoCheckBox.Checked = true;
            this.conferidoCheckBox.CheckState = System.Windows.Forms.CheckState.Checked;
            this.conferidoCheckBox.Location = new System.Drawing.Point(76, 280);
            this.conferidoCheckBox.Name = "conferidoCheckBox";
            this.conferidoCheckBox.Size = new System.Drawing.Size(71, 17);
            this.conferidoCheckBox.TabIndex = 17;
            this.conferidoCheckBox.Text = "Conferido";
            this.conferidoCheckBox.UseVisualStyleBackColor = true;
            // 
            // saidaCheckBox
            // 
            this.saidaCheckBox.AutoSize = true;
            this.saidaCheckBox.Checked = true;
            this.saidaCheckBox.CheckState = System.Windows.Forms.CheckState.Checked;
            this.saidaCheckBox.Location = new System.Drawing.Point(153, 280);
            this.saidaCheckBox.Name = "saidaCheckBox";
            this.saidaCheckBox.Size = new System.Drawing.Size(53, 17);
            this.saidaCheckBox.TabIndex = 18;
            this.saidaCheckBox.Text = "Saida";
            this.saidaCheckBox.UseVisualStyleBackColor = true;
            // 
            // entregaCheckBox
            // 
            this.entregaCheckBox.AutoSize = true;
            this.entregaCheckBox.Checked = true;
            this.entregaCheckBox.CheckState = System.Windows.Forms.CheckState.Checked;
            this.entregaCheckBox.Location = new System.Drawing.Point(212, 280);
            this.entregaCheckBox.Name = "entregaCheckBox";
            this.entregaCheckBox.Size = new System.Drawing.Size(63, 17);
            this.entregaCheckBox.TabIndex = 19;
            this.entregaCheckBox.Text = "Entrega";
            this.entregaCheckBox.UseVisualStyleBackColor = true;
            // 
            // clienteCheckedListBox
            // 
            this.clienteCheckedListBox.Dock = System.Windows.Forms.DockStyle.Fill;
            this.clienteCheckedListBox.FormattingEnabled = true;
            this.clienteCheckedListBox.Location = new System.Drawing.Point(3, 3);
            this.clienteCheckedListBox.Name = "clienteCheckedListBox";
            this.clienteCheckedListBox.Size = new System.Drawing.Size(705, 230);
            this.clienteCheckedListBox.TabIndex = 21;
            // 
            // produtoCheckedListBox
            // 
            this.produtoCheckedListBox.Dock = System.Windows.Forms.DockStyle.Fill;
            this.produtoCheckedListBox.FormattingEnabled = true;
            this.produtoCheckedListBox.Location = new System.Drawing.Point(3, 3);
            this.produtoCheckedListBox.Name = "produtoCheckedListBox";
            this.produtoCheckedListBox.Size = new System.Drawing.Size(705, 230);
            this.produtoCheckedListBox.TabIndex = 23;
            // 
            // confirmarButton
            // 
            this.confirmarButton.Location = new System.Drawing.Point(607, 280);
            this.confirmarButton.Name = "confirmarButton";
            this.confirmarButton.Size = new System.Drawing.Size(115, 41);
            this.confirmarButton.TabIndex = 25;
            this.confirmarButton.Text = "Confirmar";
            this.confirmarButton.UseVisualStyleBackColor = true;
            this.confirmarButton.Click += new System.EventHandler(this.confirmarButton_Click);
            // 
            // tabControl1
            // 
            this.tabControl1.Controls.Add(this.tabPage1);
            this.tabControl1.Controls.Add(this.tabPage2);
            this.tabControl1.Controls.Add(this.tabPage3);
            this.tabControl1.Controls.Add(this.tabPage4);
            this.tabControl1.Controls.Add(this.tabPage5);
            this.tabControl1.Location = new System.Drawing.Point(7, 12);
            this.tabControl1.Name = "tabControl1";
            this.tabControl1.SelectedIndex = 0;
            this.tabControl1.Size = new System.Drawing.Size(719, 262);
            this.tabControl1.TabIndex = 26;
            // 
            // tabPage1
            // 
            this.tabPage1.Controls.Add(this.clienteCheckedListBox);
            this.tabPage1.Location = new System.Drawing.Point(4, 22);
            this.tabPage1.Name = "tabPage1";
            this.tabPage1.Padding = new System.Windows.Forms.Padding(3);
            this.tabPage1.Size = new System.Drawing.Size(711, 236);
            this.tabPage1.TabIndex = 0;
            this.tabPage1.Text = "Localizar por cliente";
            this.tabPage1.UseVisualStyleBackColor = true;
            // 
            // tabPage2
            // 
            this.tabPage2.Controls.Add(this.produtoCheckedListBox);
            this.tabPage2.Location = new System.Drawing.Point(4, 22);
            this.tabPage2.Name = "tabPage2";
            this.tabPage2.Padding = new System.Windows.Forms.Padding(3);
            this.tabPage2.Size = new System.Drawing.Size(711, 236);
            this.tabPage2.TabIndex = 1;
            this.tabPage2.Text = "Localizar por produto";
            this.tabPage2.UseVisualStyleBackColor = true;
            // 
            // tabPage3
            // 
            this.tabPage3.Controls.Add(this.label1);
            this.tabPage3.Controls.Add(this.txtpedBusca);
            this.tabPage3.Controls.Add(this.btnPedBusca);
            this.tabPage3.Controls.Add(this.pedidoCheckedListBox);
            this.tabPage3.Location = new System.Drawing.Point(4, 22);
            this.tabPage3.Name = "tabPage3";
            this.tabPage3.Size = new System.Drawing.Size(711, 236);
            this.tabPage3.TabIndex = 2;
            this.tabPage3.Text = "Localizar por pedido";
            this.tabPage3.UseVisualStyleBackColor = true;
            // 
            // label1
            // 
            this.label1.AutoSize = true;
            this.label1.Location = new System.Drawing.Point(4, 16);
            this.label1.Name = "label1";
            this.label1.Size = new System.Drawing.Size(134, 13);
            this.label1.TabIndex = 25;
            this.label1.Text = "Digite o número do pedido:";
            // 
            // txtpedBusca
            // 
            this.txtpedBusca.CharacterCasing = System.Windows.Forms.CharacterCasing.Upper;
            this.txtpedBusca.Location = new System.Drawing.Point(142, 13);
            this.txtpedBusca.Name = "txtpedBusca";
            this.txtpedBusca.Size = new System.Drawing.Size(473, 20);
            this.txtpedBusca.TabIndex = 24;
            this.txtpedBusca.KeyDown += new System.Windows.Forms.KeyEventHandler(this.txtpedBusca_KeyDown);
            // 
            // btnPedBusca
            // 
            this.btnPedBusca.Location = new System.Drawing.Point(621, 11);
            this.btnPedBusca.Name = "btnPedBusca";
            this.btnPedBusca.Size = new System.Drawing.Size(75, 23);
            this.btnPedBusca.TabIndex = 25;
            this.btnPedBusca.Text = "Localizar";
            this.btnPedBusca.UseVisualStyleBackColor = true;
            this.btnPedBusca.Click += new System.EventHandler(this.btnPedBusca_Click);
            // 
            // pedidoCheckedListBox
            // 
            this.pedidoCheckedListBox.FormattingEnabled = true;
            this.pedidoCheckedListBox.Location = new System.Drawing.Point(0, 45);
            this.pedidoCheckedListBox.Name = "pedidoCheckedListBox";
            this.pedidoCheckedListBox.Size = new System.Drawing.Size(708, 184);
            this.pedidoCheckedListBox.TabIndex = 22;
            // 
            // tabPage4
            // 
            this.tabPage4.Controls.Add(this.ComputadorCheckedListBox);
            this.tabPage4.Location = new System.Drawing.Point(4, 22);
            this.tabPage4.Name = "tabPage4";
            this.tabPage4.Padding = new System.Windows.Forms.Padding(3);
            this.tabPage4.Size = new System.Drawing.Size(711, 236);
            this.tabPage4.TabIndex = 3;
            this.tabPage4.Text = "Localizar por computador";
            this.tabPage4.UseVisualStyleBackColor = true;
            // 
            // ComputadorCheckedListBox
            // 
            this.ComputadorCheckedListBox.Dock = System.Windows.Forms.DockStyle.Fill;
            this.ComputadorCheckedListBox.FormattingEnabled = true;
            this.ComputadorCheckedListBox.Location = new System.Drawing.Point(3, 3);
            this.ComputadorCheckedListBox.Name = "ComputadorCheckedListBox";
            this.ComputadorCheckedListBox.Size = new System.Drawing.Size(705, 230);
            this.ComputadorCheckedListBox.TabIndex = 23;
            // 
            // tabPage5
            // 
            this.tabPage5.Controls.Add(this.label2);
            this.tabPage5.Controls.Add(this.txtOrdemCompra);
            this.tabPage5.Controls.Add(this.btnPesquisaOrdem);
            this.tabPage5.Controls.Add(this.ordemCompraCheckedListBox);
            this.tabPage5.Location = new System.Drawing.Point(4, 22);
            this.tabPage5.Name = "tabPage5";
            this.tabPage5.Padding = new System.Windows.Forms.Padding(3);
            this.tabPage5.Size = new System.Drawing.Size(711, 236);
            this.tabPage5.TabIndex = 4;
            this.tabPage5.Text = "Localizar por ordem de compra";
            this.tabPage5.UseVisualStyleBackColor = true;
            // 
            // label2
            // 
            this.label2.AutoSize = true;
            this.label2.Location = new System.Drawing.Point(6, 17);
            this.label2.Name = "label2";
            this.label2.Size = new System.Drawing.Size(131, 13);
            this.label2.TabIndex = 31;
            this.label2.Text = "Digite o numero de ordem:";
            // 
            // txtOrdemCompra
            // 
            this.txtOrdemCompra.CharacterCasing = System.Windows.Forms.CharacterCasing.Upper;
            this.txtOrdemCompra.Location = new System.Drawing.Point(143, 14);
            this.txtOrdemCompra.Name = "txtOrdemCompra";
            this.txtOrdemCompra.Size = new System.Drawing.Size(258, 20);
            this.txtOrdemCompra.TabIndex = 31;
            this.txtOrdemCompra.KeyDown += new System.Windows.Forms.KeyEventHandler(this.txtOrdemCompra_KeyDown);
            // 
            // btnPesquisaOrdem
            // 
            this.btnPesquisaOrdem.Location = new System.Drawing.Point(407, 12);
            this.btnPesquisaOrdem.Name = "btnPesquisaOrdem";
            this.btnPesquisaOrdem.Size = new System.Drawing.Size(75, 23);
            this.btnPesquisaOrdem.TabIndex = 32;
            this.btnPesquisaOrdem.Text = "Localizar";
            this.btnPesquisaOrdem.UseVisualStyleBackColor = true;
            this.btnPesquisaOrdem.Click += new System.EventHandler(this.btnPesquisaOrdem_Click);
            // 
            // ordemCompraCheckedListBox
            // 
            this.ordemCompraCheckedListBox.FormattingEnabled = true;
            this.ordemCompraCheckedListBox.Location = new System.Drawing.Point(0, 47);
            this.ordemCompraCheckedListBox.Name = "ordemCompraCheckedListBox";
            this.ordemCompraCheckedListBox.Size = new System.Drawing.Size(705, 184);
            this.ordemCompraCheckedListBox.TabIndex = 26;
            // 
            // FormFiltro
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(6F, 13F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.BackColor = System.Drawing.Color.White;
            this.ClientSize = new System.Drawing.Size(738, 336);
            this.Controls.Add(this.tabControl1);
            this.Controls.Add(this.confirmarButton);
            this.Controls.Add(this.entregaCheckBox);
            this.Controls.Add(this.saidaCheckBox);
            this.Controls.Add(this.conferidoCheckBox);
            this.Controls.Add(this.normalCheckBox);
            this.FormBorderStyle = System.Windows.Forms.FormBorderStyle.FixedDialog;
            this.MaximizeBox = false;
            this.Name = "FormFiltro";
            this.StartPosition = System.Windows.Forms.FormStartPosition.CenterScreen;
            this.Text = "Filtro";
            this.tabControl1.ResumeLayout(false);
            this.tabPage1.ResumeLayout(false);
            this.tabPage2.ResumeLayout(false);
            this.tabPage3.ResumeLayout(false);
            this.tabPage3.PerformLayout();
            this.tabPage4.ResumeLayout(false);
            this.tabPage5.ResumeLayout(false);
            this.tabPage5.PerformLayout();
            this.ResumeLayout(false);
            this.PerformLayout();

        }

        #endregion

        private System.Windows.Forms.CheckBox normalCheckBox;
        private System.Windows.Forms.CheckBox conferidoCheckBox;
        private System.Windows.Forms.CheckBox saidaCheckBox;
        private System.Windows.Forms.CheckBox entregaCheckBox;
        private System.Windows.Forms.CheckedListBox clienteCheckedListBox;
        private System.Windows.Forms.CheckedListBox produtoCheckedListBox;
        private System.Windows.Forms.Button confirmarButton;
        private System.Windows.Forms.TabControl tabControl1;
        private System.Windows.Forms.TabPage tabPage1;
        private System.Windows.Forms.TabPage tabPage2;
        private System.Windows.Forms.TabPage tabPage3;
        private System.Windows.Forms.CheckedListBox pedidoCheckedListBox;
        private System.Windows.Forms.TabPage tabPage4;
        private System.Windows.Forms.CheckedListBox ComputadorCheckedListBox;
        private System.Windows.Forms.TextBox txtpedBusca;
        private System.Windows.Forms.Button btnPedBusca;
        private System.Windows.Forms.Label label1;
        private System.Windows.Forms.TabPage tabPage5;
        private System.Windows.Forms.TextBox txtOrdemCompra;
        private System.Windows.Forms.Button btnPesquisaOrdem;
        private System.Windows.Forms.CheckedListBox ordemCompraCheckedListBox;
        private System.Windows.Forms.Label label2;
    }
}