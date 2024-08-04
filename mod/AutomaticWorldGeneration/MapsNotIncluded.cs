using ProcGen;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Security.Policy;
using System.Text;
using System.Threading.Tasks;
using UnityEngine.Networking;
using UnityEngine;

namespace AutomaticWorldGeneration
{
    public class MapsNotIncluded
    {
        public static readonly string API_URL = "https://api.mapsnotincluded.org";

        public static void SendData(MonoBehaviour instance, string seed, List<string> worldTraits, List<Models.Geyser> geysers, byte[] saveFile, Action<string> callback)
        {
            // For now lets save to the saveFile path a .json with worldTraits, geysers, and seed, this can be converted to a HTTP call later.

            // Grab data
            // Send data
            Debug.Log("TODO");

            string json = Newtonsoft.Json.JsonConvert.SerializeObject(new { seed, worldTraits, geysers });
            string savePath = SaveLoader.GetActiveSaveFilePath();
            System.IO.File.WriteAllText(savePath + ".json", json);

            try
            {
                instance.StartCoroutine(postRequest(API_URL + "/ingest", json, saveFile, callback));
            } catch (Exception e)
            {
                Debug.Log("Automatic World Generation: Error uploading data: " + e.Message);
            }
        }

        public static void ReportBadSeed(string seed)
        {
            Debug.Log("TODO");
        }


        public static IEnumerator postRequest(string url, string dataPayload, byte[] save, Action<string> callback)
        {
            List<IMultipartFormSection> formData = new List<IMultipartFormSection>();
            formData.Add(new MultipartFormDataSection("data", dataPayload));
            formData.Add(new MultipartFormFileSection("save", save, "save.sav", "application/octet-stream"));

            UnityWebRequest uwr = UnityWebRequest.Post(url, formData);

            if (Environment.GetEnvironmentVariable("MNI_API_KEY") != null)
            {
                uwr.SetRequestHeader("Authorization", Environment.GetEnvironmentVariable("MNI_API_KEY"));
            }

            yield return uwr.SendWebRequest();

            if (uwr.isNetworkError)
            {
                Debug.Log("Automatic World Generation - UWR - Error While Sending: " + uwr.error);
                callback?.Invoke(null); // Pass null or an error message in case of an error
            }
            else
            {
                Debug.Log("Automatic World Generation - UWR - Received: " + uwr.downloadHandler.text);
                callback?.Invoke(uwr.downloadHandler.text);
            }
        }

    }
}
