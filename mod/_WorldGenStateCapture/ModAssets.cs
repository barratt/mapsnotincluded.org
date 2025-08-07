using _WorldGenStateCapture.WorldStateData;
using _WorldGenStateCapture.WorldStateData.Starmap.SpacemapItems;
using _WorldGenStateCapture.WorldStateData.WorldPOIs;
using Klei.CustomSettings;
using ProcGen;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text;
using UnityEngine;
using static ProcGen.SubWorld;
using System.IO;
using System.Threading.Tasks;
using System.Threading;
using MapsNotIncluded_WorldParser.WorldStateData;
using MapsNotIncluded_WorldParser;
using Newtonsoft.Json;
using System.Text.RegularExpressions;
using static MapsNotIncluded_WorldParser.Export.WorldExporter;
using MapsNotIncluded_WorldParser.Export;
using MapsNotIncluded_WorldParser.Test;

namespace _WorldGenStateCapture
{


    internal class ModAssets
	{
		//if any other mods are installed
		public static bool ModDilution = false;
		//when the mod is outdated
		public static bool VersionOutdated = false;
		//upload data to the server; disable for tests
		public static bool UploadData = true;
		public static string ModPath => System.IO.Path.GetDirectoryName(Assembly.GetExecutingAssembly().Location);
		public static Dictionary<WorldContainer, List<MapGeyser>> currentGeysers = new();
		public static Dictionary<WorldContainer, List<MapPOI>> currentPOIs = new();
		public static List<HexMap_Entry> dlcStarmapItems = new List<HexMap_Entry>();
		public static List<VanillaMap_Entry> baseStarmapItems = new List<VanillaMap_Entry>();


		internal static void AccumulateFailedSeedData(OfflineWorldGen instance)
		{
			if (ModAssets.ModDilution)
			{
				Debug.LogWarning("Other active mods detected, aborting world parsing.");
				return;
			}
			if (ModAssets.VersionOutdated)
			{
				Debug.LogWarning("Mod is outdated, aborting world parsing.");
				return;
			}
			bool dlcActive = DlcManager.IsExpansion1Active();
			Upload_FailedGeneration data = new Upload_FailedGeneration();
			SettingLevel layoutQualitySetting = CustomGameSettings.Instance.GetCurrentQualitySetting(CustomGameSettingConfigs.ClusterLayout);
			ClusterLayout clusterData = SettingsCache.clusterLayouts.GetClusterData(layoutQualitySetting.id);

			SettingLevel seedQualitySetting = CustomGameSettings.Instance.GetCurrentQualitySetting(CustomGameSettingConfigs.WorldgenSeed);
			//string otherSettingsCode = CustomGameSettings.Instance.GetOtherSettingsCode();
			MNI_Statistics.Instance.SetMixingRunActive(CustomGameSettings.Instance.GetMixingSettingsCode() != "0");

			int.TryParse(seedQualitySetting.id, out int seed);

			// DataItem.seed = seed;

			data.coordinate = CustomGameSettings.Instance.GetSettingsCoordinate();
			data.fileHashes = IntegrityCheck.HarvestClusterHashes(clusterData, seed);
			//data.mixingIds = GetActiveMixingSettingIds();

			string json = Newtonsoft.Json.JsonConvert.SerializeObject(data);

			MNI_Statistics.Instance.OnFailedSeedGenerated();

			App.instance.StartCoroutine(RequestHelper.TryPostRequest(Credentials.API_URL_REPORT_FAILED, json,
			() =>
			{
				ClearData();
				App.LoadScene(instance.frontendGameLevel);
			}, (_) =>
			{
				ClearData();
				App.LoadScene(instance.frontendGameLevel);
			}));
		}

		public static List<string> GetActiveMixingSettingIds()
		{
			var entries = new List<string>();
			foreach (var setting in CustomGameSettings.Instance.MixingSettings.Values)
			{
				if(CustomGameSettings.Instance.GetCurrentMixingSettingLevel(setting.id).id != "Disabled")
				{
					entries.Add(setting.id);
				}
			}
			return BlackBoxInACornerBuriedDeepInMoria.GiveWeirdRemappedDlcIds(entries);
		}

		public static bool LastConnectionSuccessful = true;
		public static void ConnectionSuccessful()
		{
			LastConnectionSuccessful = true;
		}
		public static void ConnectionError()
		{
			Debug.LogWarning("MNI failed to upload to the server!");
			LastConnectionSuccessful = false;
		}

		internal static void AccumulateSeedData()
		{

			if (ModAssets.ModDilution)
			{
				Debug.LogWarning("Other active mods detected, aborting world parsing.");
				return;
			}
			if (ModAssets.VersionOutdated)
			{
				Debug.LogWarning("Mod is outdated, aborting world parsing.");
				return;
			}
			bool dlcActive = DlcManager.IsExpansion1Active();

			Upload_SuccessfulGeneration data = new Upload_SuccessfulGeneration();
			WorldDataInstance worldDataItem = new WorldDataInstance();

			SettingLevel layoutQualitySetting = CustomGameSettings.Instance.GetCurrentQualitySetting(CustomGameSettingConfigs.ClusterLayout);
			if (layoutQualitySetting == null)
			{
				Debug.LogWarning("Clusterlayout was null");
				return;
			}

			ClusterLayout clusterData = SettingsCache.clusterLayouts.GetClusterData(layoutQualitySetting.id);
			SettingLevel seedQualitySetting = CustomGameSettings.Instance.GetCurrentQualitySetting(CustomGameSettingConfigs.WorldgenSeed);

			if (!int.TryParse(seedQualitySetting.id, out int seed))
			{
				Debug.LogError("Seed Quality Setting was not a valid integer?!?!?");
			}

			MNI_Statistics.Instance.SetMixingRunActive(CustomGameSettings.Instance.GetMixingSettingsCode() != "0");


			// DataItem.seed = seed;

			worldDataItem.cluster = clusterData.GetCoordinatePrefix();
			worldDataItem.coordinate = CustomGameSettings.Instance.GetSettingsCoordinate();

			var remappedDlcIdNameThings = BlackBoxInACornerBuriedDeepInMoria.GiveWeirdRemappedDlcIds(SaveLoader.Instance.GameInfo.dlcIds);

			data.fileHashes = IntegrityCheck.HarvestClusterHashes(clusterData, seed);

			worldDataItem.dlcs = remappedDlcIdNameThings;
			//worldDataItem.mixingIds = GetActiveMixingSettingIds();

			Debug.Log("accumulating asteroid data...");
			foreach (var asteroid in ClusterManager.Instance.WorldContainers)
			{
				IntegrityCheck.AddTraits(asteroid.WorldTraitIds, ref data.fileHashes);
				Debug.Log("collecting " + System.IO.Path.GetFileName(asteroid.worldName));
				// Clean worldTraits by removing parts before "/"
				var cleanWorldTraits = asteroid.WorldTraitIds.Select(trait => System.IO.Path.GetFileNameWithoutExtension(trait)).ToList();

				var asteroidData = new AsteroidData()
				{
					id = System.IO.Path.GetFileName(asteroid.worldName),
					offsetX = asteroid.WorldOffset.X,
					offsetY = asteroid.WorldOffset.Y,
					sizeX = asteroid.WorldSize.X,
					sizeY = asteroid.WorldSize.Y,
					worldTraits = cleanWorldTraits,
					biomePaths = ConvertBiomePathData(AccumulateBiomePathData(asteroid)), // AccumulateBiomeData(asteroid),
																						  //biomes = AccumulateBiomePathData(asteroid)
				};


				if (currentPOIs.ContainsKey(asteroid))
					asteroidData.pointsOfInterest = new(currentPOIs[asteroid]);

				if (currentGeysers.ContainsKey(asteroid))
					asteroidData.geysers = new(currentGeysers[asteroid]);

				CleanPOICoordinates(asteroidData);

				if (asteroid.IsStartWorld)
					worldDataItem.asteroids.Insert(0, asteroidData);
				else
					worldDataItem.asteroids.Add(asteroidData);

				//Debug.Log("SVG:");
				//Console.WriteLine(asteroidData.biomesSVG);

				//Debug.Log("json:");
				//Console.WriteLine(Newtonsoft.Json.JsonConvert.SerializeObject(asteroidData.biomes));

				//Debug.Log("CustomRepresentation:");
				//Console.WriteLine(ConvertBiomePathData(asteroidData.biomes));
			}

			if (dlcActive)
			{
				worldDataItem.starMapEntriesSpacedOut = new(dlcStarmapItems);
			}
			else
			{
				worldDataItem.starMapEntriesVanilla = new(baseStarmapItems);
			}
			data.cluster = worldDataItem;

			if (Config.Instance.WorldStatisticsExport)
			{
				WorldExporter.ExportAll();
			}

			MNI_Statistics.Instance.OnSeedGenerated();

			Debug.Log("Serializing data...");
			string json = Newtonsoft.Json.JsonConvert.SerializeObject(data);


			Debug.Log("Send data to webservice...");

			if (WorldgenCheck.IsTestMode)
			{
				WorldgenCheck.CompareWithServerData(data);
			}


			//Console.WriteLine(json);
			//attach the coroutine to the main game object
			Global.Instance.StartCoroutine(RequestHelper.TryPostRequest(Credentials.API_URL_UPLOAD, json, ClearAndRestart, (data) =>
			{
				//StoreForLater(data, worldDataItem.coordinate);
				ConnectionError();
				ClearAndRestart();
			}));
		}

		/// <summary>
		/// The game uses bottom left origin grid coordinates.
		/// SVG uses top left, so we have to invert them.
		/// We also have to subtract the world offsets from each poi coordinate
		/// </summary>
		/// <param name="asteroid"></param>
		internal static void CleanPOICoordinates(AsteroidData asteroid)
		{
			foreach (var poi in asteroid.pointsOfInterest)
			{
				poi.y = asteroid.sizeY - (poi.y - asteroid.offsetY);
				poi.x -= asteroid.offsetX;
			}
			foreach (var geyser in asteroid.geysers)
			{
				geyser.y = asteroid.sizeY - (geyser.y - asteroid.offsetY);
				geyser.x -= asteroid.offsetX;
			}
		}

		internal static string ConvertBiomePathData(Dictionary<ProcGen.SubWorld.ZoneType, List<biomePolygon>> data)
		{
			StringBuilder sb = new StringBuilder();
			foreach (var biome in data)
			{
				sb.Append($"{biome.Key}:");
				foreach (var polygon in biome.Value)
				{
					foreach (var point in polygon.points)
					{
						sb.AppendFormat("{0:0},{1:0} ", point.x, point.y);
					}
					sb.Remove(sb.Length - 1, 1); // remove last space
					sb.Append(";");
				}
				sb.Remove(sb.Length - 1, 1);  //remove last semicolon
				sb.Append('\n'); //newline as separator
			}
			sb.Remove(sb.Length - 1, 1);  //remove last newline
			return sb.ToString();
		}

		/// <summary>
		/// generates an SVG image of all biome polygons of the given asteroid
		/// </summary>
		/// <param name="targetAsteroid"></param>
		/// <returns>svg biomes image as string</returns>
		internal static string AccumulateBiomeData(WorldContainer targetAsteroid)
		{

			//connects the individual vertices to a path for each biome blob for polygon generation
			StringBuilder PathBuilder = new StringBuilder();
			//collects the polygons
			StringBuilder PolyBuilder = new StringBuilder();
			//stylesheet generation dynamically based on existing zonetype colors
			StringBuilder styleSheetBuilder = new StringBuilder();

			//only add zoneType styles on demand
			HashSet<SubWorld.ZoneType> addedZoneType = new HashSet<SubWorld.ZoneType>();

			//grid size
			int height = Grid.HeightInCells;
			int width = Grid.WidthInCells;

			//asteroid size
			int asteroidHeight = targetAsteroid.Height;
			int asteroidWidth = targetAsteroid.Width;

			//bottom left corner of the asteroid
			int worldOffsetX = targetAsteroid.worldOffset.X;
			int worldOffsetY = targetAsteroid.worldOffset.Y;

			//bounding box of asteroid on the world grid
			int minX = worldOffsetX;
			int maxX = asteroidWidth + worldOffsetX;
			int minY = worldOffsetY;
			int maxY = asteroidHeight + worldOffsetY;

			//start building stylesheet
			styleSheetBuilder.Append("<style>");
			styleSheetBuilder.Append("polygon{stroke-width:0.5}");

			//iterate all zone tile blobs
			foreach (Klei.WorldDetailSave.OverworldCell biomeBlob in SaveLoader.Instance.clusterDetailSave.overworldCells)
			{
				PathBuilder.Clear();

				bool partOfAsteroid = true;
				var currentZoneType = biomeBlob.zoneType;
				string ZoneTypeCssClass = $"zone{(int)currentZoneType}";

				if (currentZoneType == ZoneType.Space)
					continue;

				foreach (var vert in biomeBlob.poly.Vertices)
				{
					//if the vertex is outside the asteroids bounding box, the polygon isnt part of the asteroid, skip it
					if (vert.x < minX || vert.x > maxX || vert.y < minY || vert.y > maxY)
					{
						partOfAsteroid = false;
						break;
					}
					PathBuilder.AppendFormat("{0:0},{1:0} ", vert.x - worldOffsetX, asteroidHeight - (vert.y - worldOffsetY));
				}
				if (!partOfAsteroid)
					continue;

				//add biomecolor to stylesheet if not added yet
				if (!addedZoneType.Contains(currentZoneType))
				{
					var biomeColor = GetBiomeColor(currentZoneType);
					string colorHex = Util.ToHexString(biomeColor).Substring(0, 6);

					addedZoneType.Add(currentZoneType);
					styleSheetBuilder.Append($".{ZoneTypeCssClass}{{fill:#{colorHex};stroke:#{colorHex};}}");
				}

				//add polygon for this biomeBlob to polygons-stringbuilder
				PolyBuilder.Append($"<path class=\"{ZoneTypeCssClass}\" d=\"M{PathBuilder.ToString().TrimEnd()}z\"/>");
			}
			//close stylesheet stringbuilder
			styleSheetBuilder.Append("</style>");
			string styleSheet = styleSheetBuilder.ToString();

			string poly_string = PolyBuilder.ToString();

			string svg = $"<svg height=\"{asteroidHeight * 2}\" width=\"{asteroidWidth * 2}\" viewBox=\"0 0 {asteroidWidth} {asteroidHeight}\" xmlns=\"http://www.w3.org/2000/svg\">\r\n    {styleSheet}\r\n    <g>\r\n    {poly_string}\r\n    </g>\r\n</svg>";
			//Console.WriteLine(svg);
			return svg;
		}
		/// <summary>
		/// generates an SVG image of all biome polygons of the given asteroid
		/// </summary>
		/// <param name="targetAsteroid"></param>
		/// <returns>svg biomes image as string</returns>
		internal static Dictionary<ProcGen.SubWorld.ZoneType, List<biomePolygon>> AccumulateBiomePathData(WorldContainer targetAsteroid, bool includeSpaceBiome = false)
		{
			//grid size
			int height = Grid.HeightInCells;
			int width = Grid.WidthInCells;

			//asteroid size
			int asteroidHeight = targetAsteroid.Height;
			int asteroidWidth = targetAsteroid.Width;

			//bottom left corner of the asteroid
			int worldOffsetX = targetAsteroid.worldOffset.X;
			int worldOffsetY = targetAsteroid.worldOffset.Y;

			//bounding box of asteroid on the world grid
			int minX = worldOffsetX;
			int maxX = asteroidWidth + worldOffsetX;
			int minY = worldOffsetY;
			int maxY = asteroidHeight + worldOffsetY;

			var data = new Dictionary<ZoneType, List<biomePolygon>>();

			//iterate all zone tile blobs
			foreach (Klei.WorldDetailSave.OverworldCell biomeBlob in SaveLoader.Instance.clusterDetailSave.overworldCells)
			{

				bool partOfAsteroid = true;
				var currentZoneType = biomeBlob.zoneType;
				string ZoneTypeCssClass = $"zone{(int)currentZoneType}";

				if (currentZoneType == ZoneType.Space && !includeSpaceBiome)
					continue;

				var polygon = new biomePolygon();

				foreach (var vert in biomeBlob.poly.Vertices)
				{
					//if the vertex is outside the asteroids bounding box, the polygon isnt part of the asteroid, skip it
					if (vert.x < minX || vert.x > maxX || vert.y < minY || vert.y > maxY)
					{
						partOfAsteroid = false;
						break;
					}
					polygon.points.Add(new(vert.x - worldOffsetX, asteroidHeight - (vert.y - worldOffsetY)));
				}
				if (!partOfAsteroid)
					continue;

				//add biomecolor to stylesheet if not added yet
				if (!data.ContainsKey(currentZoneType))
				{
					data.Add(currentZoneType, new());
				}
				data[currentZoneType].Add(polygon);
			}
			return data;
		}
		static SubworldZoneRenderData cachedRenderData = null;
		static void DumpBiomeColors()
		{
			Console.WriteLine("Biome Color Mapping:");
			foreach (SubWorld.ZoneType zoneType in Enum.GetValues(typeof(SubWorld.ZoneType)))
			{
				string hex = Util.ToHexString(cachedRenderData.zoneColours[(int)zoneType]).Substring(0, 6);
				Console.WriteLine(zoneType.ToString() + " (" + (int)zoneType + ", Color(0xFF" + hex + ")),");
			}
		}

		static Color GetBiomeColor(SubWorld.ZoneType type)
		{
			if (cachedRenderData == null)
			{
				cachedRenderData = World.Instance.GetComponent<SubworldZoneRenderData>();
			}

			// Biomes: Get the original color for the biome
			Color color = cachedRenderData.zoneColours[(int)type];

			// Reset the alpha value so it can be shown nicely both in the map and the legend
			color.a = 1f;
			return color;
		}

		public static void ClearAndRestart()
		{
			ClearData();
			RestartGeneration();
		}
		public static void ClearData()
		{
			currentGeysers.Clear();
			currentPOIs.Clear();
			dlcStarmapItems.Clear();
			baseStarmapItems.Clear();

			RequestHelper.OnMapGenerated();
		}

		public static bool lowMemRestartInitialized = false, RestartAfterGeneration = false;

		public static void RestartGeneration()
		{
			if (!lowMemRestartInitialized)
			{
				lowMemRestartInitialized = true;
				Application.lowMemory += () => RestartAfterGeneration = true;
			}
			if (MNI_Statistics.Instance.RestartThresholdReached())
				RestartAfterGeneration = true;

			if (RestartAfterGeneration)
				ModAssets.RestartAndKillThreads();
			else
			{
				StartBackupRestart();
				if (PauseScreen.instance != null)
				{
					PauseScreen.instance.OnQuitConfirm(false);
				}
				else
					RestartAndKillThreads(); //fallback
			}
		}

		public static void StartBackupRestart()
		{
			if (cancelTokenSource != null) //cancel previous timer
				cancelTokenSource.Cancel();

			cancelTokenSource = new CancellationTokenSource();

			var ct = cancelTokenSource.Token;
			Task.Factory.StartNew(() =>
			{
				for (int i = 0; i < 60; ++i)
				{
					if (ct.IsCancellationRequested)
					{
						MNI_Statistics.Instance.OnBackendUnloaded(true, i);
						break;
					}
					Thread.Sleep(1000);

				}
				//if this thread wasnt canceled after 60 seconds, restart app (sth has crashed in the bg)
				if (!ct.IsCancellationRequested)
				{
					MNI_Statistics.Instance.OnBackendUnloaded(false, 60);

					RestartAndKillThreads();
				}

			}, ct);

		}
		public static void OnMainMenuLoaded()
		{
			if (cancelTokenSource != null) //cancel previous timer
			{
				//Console.WriteLine("main menu reached, canceling backup timer");
				cancelTokenSource.Cancel();
			}
		}

		static CancellationTokenSource cancelTokenSource = null;

		internal static void StoreForLater(byte[] data, string offlineFileName)
		{
			if (offlineFileName == string.Empty)
				return;
			Debug.Log("Could not send seed data to the api, storing " + offlineFileName + " for later...");
			Directory.CreateDirectory(Paths.WorldsFolder);

			string file = System.IO.Path.Combine(Paths.WorldsFolder, offlineFileName);
			ByteArrayToFile(file, data);
		}
		internal static void UnstoreLater(string offlineFileName)
		{
			System.IO.File.Delete(offlineFileName);
		}

		public static void RestartAndKillThreads()
		{
			if (cancelTokenSource != null && !cancelTokenSource.IsCancellationRequested)
				cancelTokenSource?.Cancel();
			App.instance.Restart();
		}

		public static void TrySendingCollected()
		{
			return;
			Directory.CreateDirectory(Paths.WorldsFolder);
			var files = Directory.GetFiles(Paths.WorldsFolder);
			if (files == null || files.Length == 0)
				return;

			Debug.Log("Connection reestablished, uploading stored " + files.Length + " datasets");
			foreach (var file in files)
			{
				if (FileToByteArray(file, out var data))
				{
					App.instance.StartCoroutine(RequestHelper.TryPostRequest(Credentials.API_URL_UPLOAD, data, () => UnstoreLater(file), (_) => { }));
				}
			}
		}
		public static bool ByteArrayToFile(string fileName, byte[] byteArray)
		{
			try
			{
				File.WriteAllBytes(fileName, byteArray);
				return true;
			}
			catch (Exception ex)
			{
				Console.WriteLine("Exception caught in process: {0}", ex);
				return false;
			}
		}
		public static bool FileToByteArray(string fileName, out byte[] byteArray)
		{
			try
			{
				using var fs = new FileStream(fileName, FileMode.Open, FileAccess.Read);
				byteArray = File.ReadAllBytes(fileName);
				return true;
			}
			catch (Exception ex)
			{
				byteArray = null;
				Console.WriteLine("Exception caught in process: {0}", ex);
				return false;
			}
		}
	}
}
