using System;
using System.Windows.Forms;

namespace App
{
    public static class Program
    {
        public static string UsuarioLogado { get; set; }
        /// <summary>
        /// The main entry point for the application.
        /// </summary>
        [STAThread]
        static void Main()
        {
           // Application.RenderWithVisualStyles = false;
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);
            Application.Run(new FormLogin());
        }
    }
}
