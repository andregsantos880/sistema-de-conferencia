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
                case "1": return Properties.Resources._1;
                case "2": return Properties.Resources._2;
                case "3": return Properties.Resources._3;
                case "4": return Properties.Resources._4;
                case "5": return Properties.Resources._5;
                case "6": return Properties.Resources._6;
                case "7": return Properties.Resources._7;
                case "8": return Properties.Resources._8;
                case "9": return Properties.Resources._9;
                case "10": return Properties.Resources._10;

                case "11": return Properties.Resources._11;
                case "12": return Properties.Resources._12;
                case "13": return Properties.Resources._13;
                case "14": return Properties.Resources._14;
                case "15": return Properties.Resources._15;
                case "16": return Properties.Resources._16;
                case "17": return Properties.Resources._17;
                case "18": return Properties.Resources._18;
                case "19": return Properties.Resources._19;
                case "20": return Properties.Resources._20;

                case "21": return Properties.Resources._21;
                case "22": return Properties.Resources._22;
                case "23": return Properties.Resources._23;
                case "24": return Properties.Resources._24;
                case "25": return Properties.Resources._25;
                case "26": return Properties.Resources._26;
                case "27": return Properties.Resources._27;
                case "28": return Properties.Resources._28;
                case "29": return Properties.Resources._29;
                case "30": return Properties.Resources._30;

                case "31": return Properties.Resources._31;
                case "32": return Properties.Resources._32;
                case "33": return Properties.Resources._33;
                case "34": return Properties.Resources._34;
                case "35": return Properties.Resources._35;
                case "36": return Properties.Resources._36;
                case "37": return Properties.Resources._37;
                case "38": return Properties.Resources._38;
                case "39": return Properties.Resources._39;
                case "40": return Properties.Resources._40;

                case "41": return Properties.Resources._41;
                case "42": return Properties.Resources._42;
                case "43": return Properties.Resources._43;
                case "44": return Properties.Resources._44;
                case "45": return Properties.Resources._45;
                case "46": return Properties.Resources._46;
                case "47": return Properties.Resources._47;
                case "48": return Properties.Resources._48;
                case "49": return Properties.Resources._49;
                case "50": return Properties.Resources._50;

                case "51": return Properties.Resources._51;
                case "52": return Properties.Resources._52;
                case "53": return Properties.Resources._53;
                case "54": return Properties.Resources._54;
                case "55": return Properties.Resources._55;
                case "56": return Properties.Resources._56;
                case "57": return Properties.Resources._57;
                case "58": return Properties.Resources._58;
                case "59": return Properties.Resources._59;
                case "60": return Properties.Resources._60;

                case "61": return Properties.Resources._61;
                case "62": return Properties.Resources._62;
                case "63": return Properties.Resources._63;
                case "64": return Properties.Resources._64;
                case "65": return Properties.Resources._65;
                case "66": return Properties.Resources._66;
                case "67": return Properties.Resources._67;
                case "68": return Properties.Resources._68;
                case "69": return Properties.Resources._69;
                case "70": return Properties.Resources._70;

                case "71": return Properties.Resources._71;
                case "72": return Properties.Resources._72;
                case "73": return Properties.Resources._73;
                case "74": return Properties.Resources._74;
                case "75": return Properties.Resources._75;
                case "76": return Properties.Resources._76;
                case "77": return Properties.Resources._77;
                case "78": return Properties.Resources._78;
                case "79": return Properties.Resources._79;
                case "80": return Properties.Resources._80;

                case "Error": return Properties.Resources.SOM_ERRO_EFEITO_SONORO;
                case "Exclamation": return Properties.Resources.SOM_ERRO_EFEITO_SONORO;
                case "Information": return Properties.Resources.Information;
                case "success": return Properties.Resources.success;
                case "Air_Horn": return Properties.Resources.Air_Horn;
                                        
                case "BOX": return Properties.Resources.BOX;

                default:
                    break;

            }

            return Properties.Resources.Error;

        }
    }
}
