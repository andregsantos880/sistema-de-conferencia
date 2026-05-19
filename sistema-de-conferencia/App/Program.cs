using Entidade;
using System;
using System.Windows.Forms;

namespace App
{
    public static class Program
    {

        public static voPedido mvoPedido;

        /// <summary>
        /// The main entry point for the application.
        /// </summary>
        [STAThread]
        static void Main()
        {
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);
            Application.Run(new FormLogin());
        }
    }
}
