using ProcGen;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Security.Policy;
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

            try
            {
                //StartCoroutine(UploadFileAndText(url, filePath, textContent, authToken));

                Debug.Log("Automatic World Generation: "); // + uplaod.Result);
            } catch (Exception e)
            {
                Debug.Log("Automatic World Generation: Error uploading data: " + e.Message);
            }
        }

        public static void ReportBadSeed(string seed)
        {
            Debug.Log("TODO");
        }

        //public static async Task<string> UploadFileAndText(string url, byte[] saveFile, string data)
        //{
        //using (var content = new MultipartFormDataContent())
        //{
        //    // Add file content
        //    var fileContent = new ByteArrayContent(saveFile);
        //    fileContent.Headers.ContentType = MediaTypeHeaderValue.Parse("multipart/form-data");
        //    content.Add(fileContent, "save", "save.sav");


        //    // Add text content
        //    content.Add(new StringContent(data), "data");

        //    if (string.IsNullOrEmpty(url))
        //    {
        //        Debug.Log("URL is not set.");
        //        return "";
        //    }

        //    string authToken = Environment.GetEnvironmentVariable("MNI_SECRET");

        //    if (!string.IsNullOrEmpty(authToken))
        //    {
        //        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", authToken);
        //        Debug.Log("Automatic World Generation: Using auth token " + authToken);
        //    } else
        //    {
        //        Debug.Log("Automatic World Generation: No auth token found.");
        //    }


        //    // Send the request
        //    var response = await client.PostAsync(url, content);
        //    response.EnsureSuccessStatusCode();

        //    // Read and return the response content
        //    return await response.Content.ReadAsStringAsync();
        //}
        //}
        IEnumerator UploadFileAndText(string url, string filePath, string textContent, string authToken)
        {
            // Read file bytes
            byte[] fileBytes = File.ReadAllBytes(filePath);

            // Create form data
            WWWForm form = new WWWForm();
            form.AddBinaryData("file", fileBytes, Path.GetFileName(filePath), "multipart/form-data");
            form.AddField("textField", textContent);

            // Create UnityWebRequest
            UnityWebRequest www = UnityWebRequest.Post(url, form);
            www.SetRequestHeader("Authorization", "Bearer " + authToken);

            // Send request and wait for response
            yield return www.SendWebRequest();

            if (www.result == UnityWebRequest.Result.ConnectionError || www.result == UnityWebRequest.Result.ProtocolError)
            {
                Debug.LogError("Error: " + www.error);
            }
            else
            {
                Debug.Log("Response: " + www.downloadHandler.text);
            }
        }
    }
}
