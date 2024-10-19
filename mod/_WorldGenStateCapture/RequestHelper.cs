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
		public static string API_TOKEN => Credentials.API_Key;



		public static bool HasServerRequestedSeed(out string coordinate)
		{
			//TODO
			coordinate = string.Empty;
			return false;
		}

		public static IEnumerator TryPostRequest(string url, byte[] bodyRaw, System.Action OnComplete, System.Action<byte[]> OnFail)
		{
			//Debug.Log("Calling MNI API: " + url);
			using (UnityWebRequest request = new UnityWebRequest(url, "POST"))
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

		public static IEnumerator TryPostRequest(string url, string data, System.Action OnComplete, System.Action<byte[]> OnFail) => TryPostRequest(url,Encoding.UTF8.GetBytes(data), OnComplete, OnFail);

	}
}
