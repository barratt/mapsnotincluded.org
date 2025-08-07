using _WorldGenStateCapture;
using _WorldGenStateCapture.WorldStateData;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Xml.Serialization;

namespace MapsNotIncluded_WorldParser.Test
{
    class WorldgenCheck
    {
		public static bool IsTestMode = false;
		public static bool HasTestMaps() 
		{
			bool hasMapsRemaining = TestCoordinates.Any();
			if(hasMapsRemaining)
				return true;
			Console.WriteLine("Worldgen Test has finished. the following "+ FailCounter+ " worlds failed comparison with server data.");
			if (sb.Length == 0)
				Console.WriteLine("none");
			Console.WriteLine(sb.ToString());
			return false;

		}


		public static HashSet<string> TestCoordinates = new HashSet<string>();
		static readonly string TestSettings = "-1000-0-0-0";

		public static Upload_SuccessfulGeneration FetchedServerData = null;

		public static bool CurrentWorldFailedFetching => FetchedServerData != null;

		static StringBuilder sb = new();

		static int FailCounter = 0;

		public static void RunTest()
        {
			FailCounter = 0;
			sb.Clear();
			ModAssets.ModDilution = false;
			ModAssets.VersionOutdated = false;
			ModAssets.UploadData = false; //don't upload any data during tests

			if (DlcManager.IsPureVanilla())
			{
				InitTestVanilla();
			}
			else
			{
				InitTestSpacedOut();
			}

		}
        public static void InitTestSpacedOut()
        {
			Console.WriteLine("Running spaced out worldgen test...");

			foreach(var world in Config.ClusterCoordinates_SO)
			{
				TestCoordinates.Add(world.Value+TestSettings);
			}
		}
        public static void InitTestVanilla()
		{
			Console.WriteLine("Running vanilla worldgen test...");
			foreach (var world in Config.ClusterCoordinates_Base)
			{
				TestCoordinates.Add(world.Value + TestSettings);
			}
		}

		internal static string GetNextCoordinate()
		{
			FetchedServerData = null;
			var nextCoordinate = TestCoordinates.FirstOrDefault();
			if (string.IsNullOrEmpty(nextCoordinate))
			{
				Console.WriteLine("No more test coordinates available.");
				return string.Empty;
			}
			TestCoordinates.Remove(nextCoordinate);
			Console.WriteLine("Next test coordinate: " + nextCoordinate);
			Global.Instance.StartCoroutine(RequestHelper.TryGetRequest(Credentials.API_URL_GET_EXISTING_DATA, HandleServerSavedWorldData, HandleServerSavedWorldData));
			return nextCoordinate;
		}
		static void HandleServerSavedWorldData(string WorldDataJson)
		{
			try
			{
				if (string.IsNullOrEmpty(WorldDataJson))
				{
					Console.WriteLine("No data received from server.");
					FetchedServerData = null;
					return;
				}
				var data = Newtonsoft.Json.JsonConvert.DeserializeObject<Upload_SuccessfulGeneration>(WorldDataJson);
				FetchedServerData = data;
			}
			catch (Exception ex)
			{
				Console.WriteLine("Error handling server saved world data: " + ex.Message);
				FetchedServerData = null;
			}
		}

		internal static void CompareWithServerData(Upload_SuccessfulGeneration data)
		{
			if (CurrentWorldFailedFetching)
			{
				Console.WriteLine("Current world data fetching failed, cannot compare.");
				return;
			}
			var servercluster = FetchedServerData.cluster;
			var clusterCurrent = data.cluster;
			Console.WriteLine($"Comparing {clusterCurrent.coordinate} with server. GameVersionServer: {FetchedServerData.gameVersion} GameVersionCurrent: {data.gameVersion}");
			bool changeFound = false;
			for ( var i = 0; i< clusterCurrent.asteroids.Count; i++)
			{
				var asteroidCurrent = clusterCurrent.asteroids[i];
				if(i >= servercluster.asteroids.Count)
				{
					Console.WriteLine($"Asteroid Missmatch; {i + 1}/{clusterCurrent.asteroids.Count} ({asteroidCurrent.id}) does not exist on server!");
					changeFound = true;
					continue;
				}

				var asteroidServer = servercluster.asteroids[i];
				Console.WriteLine($"Comparing asteroid {i + 1}/{clusterCurrent.asteroids.Count} - {asteroidCurrent.id} with server asteroid {asteroidServer.id}");

				for(int t = 0; t < asteroidCurrent.worldTraits.Count; t++)
				{
					var traitCurrent = asteroidCurrent.worldTraits[t];
					if (asteroidServer.worldTraits.Count <= t || asteroidServer.worldTraits.Count != asteroidCurrent.worldTraits.Count)
					{
						Console.WriteLine($"Trait mismatch in asteroid {asteroidCurrent.id}: Current: {traitCurrent}");
						changeFound = true;
						continue;
					}
					var traitServer = asteroidServer.worldTraits[t];

					if (traitCurrent != traitServer)
					{
						Console.WriteLine($"Trait mismatch in asteroid {asteroidCurrent.id}: Current: {traitCurrent}, Server: {traitServer}");
						changeFound = true;
					}
				}

				for (int j = 0; j < asteroidCurrent.geysers.Count; j++)
				{
					var currentGeyser = asteroidCurrent.geysers[j];
					if (asteroidServer.geysers.Count <= j || asteroidServer.geysers.Count != asteroidCurrent.geysers.Count)
					{
						Console.WriteLine($"Geyser mismatch in asteroid {asteroidCurrent.id}: Current: {currentGeyser} does not exist on server!");
						changeFound = true;
						continue;
					}
					var serverGeyser = asteroidServer.geysers[j];
					if(currentGeyser.y != serverGeyser.y || currentGeyser.x != serverGeyser.x || currentGeyser.id != serverGeyser.id)
					{
						Console.WriteLine($"Geyser mismatch in asteroid {asteroidCurrent.id}: Current: {currentGeyser.id}->({currentGeyser.x},{currentGeyser.y}), Server: {serverGeyser}->({serverGeyser.x},{serverGeyser.y})");
						changeFound = true;
					}
				}

			}
			if(changeFound)
				sb.AppendLine($"!!! Changes found in {clusterCurrent.coordinate} compared to server data !!!");
			else
				sb.AppendLine($"No changes found in {clusterCurrent.coordinate} compared to server data.");

		}
	}
}
