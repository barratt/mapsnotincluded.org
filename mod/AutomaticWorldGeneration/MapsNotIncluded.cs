using ProcGen;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AutomaticWorldGeneration
{
    public class MapsNotIncluded
    {
        public static void SendData(string seed, List<string> worldTraits, List<Models.Geyser> geysers, byte[] saveFile)
        {
            // For now lets save to the saveFile path a .json with worldTraits, geysers, and seed, this can be converted to a HTTP call later.

            // Grab data
            // Send data
            Debug.Log("TODO");

            string json = Newtonsoft.Json.JsonConvert.SerializeObject(new { seed, worldTraits, geysers });
            string savePath = SaveLoader.GetActiveSaveFilePath();
            System.IO.File.WriteAllText(savePath + ".json", json);
        }

        public static void ReportBadSeed(string seed)
        {
            Debug.Log("TODO");
        }
    }
}
