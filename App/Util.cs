using System.IO;

namespace App
{
    class Util
    {
        public static int nivel = 0;

        public static Stream GetSom(string cSom)
        {
            switch (cSom)
            {
                case "Error": return Properties.Resources.Error;
                case "Exclamation": return Properties.Resources.Exclamation;
                case "Information": return Properties.Resources.Information;
                case "success": return Properties.Resources.success;
                case "Air_Horn": return Properties.Resources.Air_Horn;
                case "BOX": return Properties.Resources.BOX;
                case "ringout": return Properties.Resources.ringout;

                default:
                    break;

            }

            return Properties.Resources.Error;

        }
    }
}
