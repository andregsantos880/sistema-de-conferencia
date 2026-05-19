using System;
using System.Windows.Forms;

namespace App
{
    public partial class OpcTextoForm : Form
    {
        public OpcTextoForm()
        {
            InitializeComponent();
        }

        private void btnOk_Click(object sender, EventArgs e)
        {
            if (txtValor.Text.Trim().Equals(""))
            {
                MessageBox.Show("Valor inválido !", "Pesquisa", MessageBoxButtons.OK, MessageBoxIcon.Error);
                txtValor.Focus();
                return;
            }

              this.DialogResult = DialogResult.OK;
        }

        private void OpcTextoForm_KeyDown(object sender, KeyEventArgs e)
        {
            switch (e.KeyCode)
            {
                case Keys.Escape: this.Close();
                    break;
                default:
                    break;
            }
        }

        private void txtValor_TextChanged(object sender, EventArgs e)
        {

        }

    }
}
