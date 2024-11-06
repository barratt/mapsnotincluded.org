using MapsNotIncluded_WorldParser;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading.Tasks;
using UnityEngine.Networking;

namespace _WorldGenStateCapture
{
    internal class RequestHelper
    {
        public static string API_TOKEN => Credentials.API_Key;

        private static string ServerRequestedCoordinate = string.Empty;
        private static bool _hasServerRequestedCoordinate = false;
        private static bool _isGeneratingServerRequestedCoordinate = false;


        /// <summary>
        /// gets a requested coordinate from the server
        /// </summary>
		public static void FetchNewRequestedCoordinate()
        {
            //opt out of requested seeds in config
            if (!Config.Instance.AcceptRequestedSeeds || _hasServerRequestedCoordinate)
                return;

            var serverMappedDlcIds = BlackBoxInACornerBuriedDeepInMoria.GiveWeirdRemappedDlcIds(DlcManager.GetActiveDLCIds());
            string jsonifiedDlcIds = Newtonsoft.Json.JsonConvert.SerializeObject(serverMappedDlcIds);
            App.instance.StartCoroutine(PostRequestNewServerSeed(Credentials.API_URL_REQUEST_SEED, jsonifiedDlcIds, HandleRequestedCoordinateResponse));
        }
        public static void HandleRequestedCoordinateResponse(string coordinateResponse)
        {
            Debug.Log("Requested Coordinate received: "+coordinateResponse);

            if (string.IsNullOrEmpty(coordinateResponse))
            {
                _hasServerRequestedCoordinate = false;
                ServerRequestedCoordinate = string.Empty;
            }
            else
            {
                _hasServerRequestedCoordinate = true;
                ServerRequestedCoordinate = coordinateResponse;
            }
        }
        /// <summary>
        /// Called when a requested coordinate generation was started
        /// </summary>
        internal static void OnRequestedCoordinateRunStarted()
        {
            _isGeneratingServerRequestedCoordinate = true;
        }

        /// <summary>
        /// is there currently a coordinate requested?
        /// </summary>
        /// <param name="coordinate"></param>
        /// <returns></returns>
		public static bool HasServerRequestedCoordinate(out string coordinate)
        {
            coordinate = ServerRequestedCoordinate;
            return _hasServerRequestedCoordinate;            
        }

        /// <summary>
        /// called when a map was submitted.
        /// </summary>
        internal static void OnMapGenerated()
        {
            if (_isGeneratingServerRequestedCoordinate)
            {
                MNI_Statistics.Instance.ServerRequestedSeedGenerated(ServerRequestedCoordinate);
                _isGeneratingServerRequestedCoordinate = false;
                _hasServerRequestedCoordinate = false;
                ServerRequestedCoordinate = string.Empty;
            }
            FetchNewRequestedCoordinate();
        }

        public static IEnumerator TryGetRequest(string url, System.Action<string> OnComplete, System.Action<string> OnFail)
        {
            //Debug.Log("Calling MNI API: " + url);
            using (UnityWebRequest request = new UnityWebRequest(url, "GET"))
            {
                request.downloadHandler = new DownloadHandlerBuffer();
                // Send the API key
                request.SetRequestHeader("MNI_API_KEY", API_TOKEN);
                Debug.Log("Trying to send GET Request ...");

                yield return request.SendWebRequest();

                if (request.result != UnityWebRequest.Result.Success)
                {
                    Debug.LogWarning(request.error);
                    //ModAssets.ConnectionError();
                    OnFail(request.downloadHandler.text);
                }
                else
                {
                    Debug.Log("GET Request complete!");
                    //ModAssets.ConnectionSuccessful();
                    OnComplete(request.downloadHandler.text);
                }
            }
        }


        public static IEnumerator PostRequestNewServerSeed(string url, string data, System.Action<string> handleResponse)
        {
            //Debug.Log("Calling MNI API: " + url);
            using (UnityWebRequest request = new UnityWebRequest(url, "POST"))
            {
                var bodyRaw = Encoding.UTF8.GetBytes(data);

                // Set the request body to the JSON byte array
                request.uploadHandler = new UploadHandlerRaw(bodyRaw);
                request.downloadHandler = new DownloadHandlerBuffer();

                // Set the content type to JSON
                request.SetRequestHeader("Content-Type", "application/json");
                // Send the API key
                request.SetRequestHeader("MNI_API_KEY", API_TOKEN);

                Debug.Log("Trying to POST-Request a new server coordinate...");

                yield return request.SendWebRequest();

                if (request.result != UnityWebRequest.Result.Success)
                {
                    Debug.LogWarning("POST request was not successful!");
                    Debug.LogWarning(request.error);
                }
                else
                {
                    Debug.Log("POST request successful complete!");
                }
                handleResponse(request.downloadHandler.text);
            }
        }

        public static IEnumerator TryPostRequest(string url, string data, System.Action OnComplete, System.Action<byte[]> OnFail) => TryPostRequest(url, Encoding.UTF8.GetBytes(data), OnComplete, OnFail);

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

                Debug.Log("Trying to send POST Request ...");

                yield return request.SendWebRequest();

                if (request.result != UnityWebRequest.Result.Success)
                {
                    Debug.LogWarning(request.error);
                    ModAssets.ConnectionError();
                    OnFail(bodyRaw);
                }
                else
                {
                    Debug.Log("POST request successful complete!");
                    ModAssets.ConnectionSuccessful();
                    ModAssets.TrySendingCollected();
                    OnComplete();
                }
            }
        }       
    }
}
