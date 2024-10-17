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
		public static string API_URL => Credentials.API_URL;
		public static string API_TOKEN => Credentials.API_Key;

		public static IEnumerator TryPostRequest(byte[] bodyRaw, System.Action OnComplete, System.Action<byte[]> OnFail)
		{
			using (UnityWebRequest request = new UnityWebRequest(API_URL, "POST"))
			{

				// Set the request body to the JSON byte array
				request.uploadHandler = new UploadHandlerRaw(bodyRaw);
				request.downloadHandler = new DownloadHandlerBuffer();

				// Set the content type to JSON
				request.SetRequestHeader("Content-Type", "application/json");
				// Send the API key
				request.SetRequestHeader("MNI_API_KEY", API_TOKEN);

				Debug.Log("request.SendWebRequest() ...");

				yield return request.SendWebRequest();

				if (request.result != UnityWebRequest.Result.Success)
				{
					Debug.LogWarning(request.error);
					OnFail(bodyRaw);
				}
				else
				{
					Debug.Log("Form upload complete!");
					ModAssets.TrySendingCollected();
					OnComplete();
				}
			}
		}
		public static IEnumerator TryPostRequest(string data, System.Action OnComplete, System.Action<byte[]> OnFail) => TryPostRequest(Encoding.UTF8.GetBytes(data), OnComplete, OnFail);

	}
}
