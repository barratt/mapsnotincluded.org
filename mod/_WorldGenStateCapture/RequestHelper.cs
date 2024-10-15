using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UnityEngine.Networking;

namespace _WorldGenStateCapture
{
	internal class RequestHelper
	{
		public static string API_URL => "https://oni-seed-uploader-stefan-oltmann.koyeb.app/upload";
		public static string API_TOKEN_PUBLIC => "InsertPublicAPIKey";
		public static string API_TOKEN_DEV = "";

		public static IEnumerator TryPostRequest(string data, System.Action OnComplete)
		{
			// Convert JSON string to bytes
			byte[] bodyRaw = Encoding.UTF8.GetBytes(data);

			using (UnityWebRequest request = new UnityWebRequest(API_URL, "POST"))
			{

				// Set the request body to the JSON byte array
				request.uploadHandler = new UploadHandlerRaw(bodyRaw);
				request.downloadHandler = new DownloadHandlerBuffer();

				// Set the content type to JSON
				request.SetRequestHeader("Content-Type", "application/json");
				// Send the API key
				request.SetRequestHeader("MNI_API_KEY", API_TOKEN_DEV == string.Empty? API_TOKEN_PUBLIC: API_TOKEN_DEV);

				Debug.Log("request.SendWebRequest() ...");

				yield return request.SendWebRequest();

				if (request.result != UnityWebRequest.Result.Success)
				{
					Debug.LogWarning(request.error);
					ModAssets.ClearAndRestart();
				}
				else
				{
					Debug.Log("Form upload complete!");
					OnComplete();
				}
			}
		}
	}
}
