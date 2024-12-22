using ProcGen;
using ProcGenGame;
using System;
using System.Collections.Generic;
using System.IO;
using System.Security.Cryptography;
using System.Threading.Tasks;

namespace _WorldGenStateCapture
{
	internal class IntegrityCheck
	{
		public static Dictionary<string, string> GetWorlds()
		{
			var values = new Dictionary<string, string>();
			foreach (var world in SettingsCache.worlds.worldCache.Values)
			{
				string fullFilePath = SettingsCache.RewriteWorldgenPathYaml(world.filePath);
				values.Add(System.IO.Path.GetFileName(world.filePath), GetFileHash(fullFilePath));
			}
			return values;
		}

		internal static Dictionary<string, string> HarvestClusterHashes(ClusterLayout targetLayoutOriginal, int seed)
		{
			Dictionary<string, string> AccumulatedHashes = new Dictionary<string, string>();
			AccumulatedHashes["modHash"] = GetModHash();

			//if the current settngs have replaced an asteroid, it only shows up in the list if mixing is reapplied to the cluster data
			var mutatedTargetLayout = WorldgenMixing.DoWorldMixing(targetLayoutOriginal, seed, false, false);
			var targetLayout = mutatedTargetLayout.layout;

			AddFileToDic(targetLayout.filePath, ref AccumulatedHashes);

			foreach (var worldPlacement in targetLayout.worldPlacements)
			{
				var world = SettingsCache.worlds.GetWorldData(worldPlacement.world);

				AddFileToDic(world.filePath, ref AccumulatedHashes);

				foreach (var subworld in world.subworldFiles)
				{
					var subworldFilePath = subworld.name;
					AddFileToDic(subworldFilePath, ref AccumulatedHashes);
				}
				foreach (var rule in world.worldTemplateRules)
				{
					var paths = rule.names;
					foreach (var path in paths)
						AddFileToDic(path, ref AccumulatedHashes, "templates");
				}
			}
			return AccumulatedHashes;
		}
		public static void AddTraits(List<string> traits, ref Dictionary<string, string> dict)
		{
			foreach (var trait in traits)
			{
				AddFileToDic(trait, ref dict);
			}
		}

		public static void AddFileToDic(string kleiPath, ref Dictionary<string, string> dict, string notWorldgen = "")
		{
			string fullFilePath = SettingsCache.RewriteWorldgenPathYaml(kleiPath);
			if (notWorldgen.Length > 0)
			{
				fullFilePath = fullFilePath.Replace("worldgen", notWorldgen);
			}
			//normalize
			fullFilePath = System.IO.Path.GetFullPath(fullFilePath);
			string gameFolderPath = System.IO.Path.GetFullPath(Paths.GameFolder);
			string pathKey = fullFilePath
				.Replace(gameFolderPath, string.Empty)
				.Replace("\\OxygenNotIncluded_Data\\StreamingAssets\\", string.Empty)
				.Replace("\\", "/");


			if (!dict.ContainsKey(pathKey))
				dict.Add(pathKey, GetFileHash(fullFilePath));


			//if (!dict.ContainsKey(kleiPath))
			//	dict.Add(kleiPath, GetFileHash(fullFilePath));
		}


		public static string GetModHash() => GetFileHash(System.Reflection.Assembly.GetExecutingAssembly().Location);

		public static string GetFileHash(string filename)
		{
			using var hasher = SHA256.Create();
			using var stream = System.IO.File.OpenRead(filename);
			//Console.WriteLine("Hashing: " + filename);
			return BitConverter.ToString(hasher.ComputeHash(stream)).Replace("-", string.Empty).ToLowerInvariant();
		}
		public static string GetUserId()
		{
			if (DistributionPlatform.Initialized) //this should usually always be initialized
			{
				return DistributionPlatform.Inst.Name + "-" + DistributionPlatform.Inst.LocalUser.Id;
			}
			return "LocalUser-" + Environment.UserName;
		}
		public static string GetInstallationId()
		{
			Directory.CreateDirectory(Paths.ConfigFolder);
			var idFileName = "MNI_GUID";
			var filepath = System.IO.Path.Combine(Paths.ConfigFolder, idFileName);

			string GUID = Guid.NewGuid().ToString();
			if (!File.Exists(filepath))
				File.WriteAllText(filepath, GUID);
			else
				GUID = File.ReadAllText(filepath);
			return GUID;
		}

		internal static void CheckModVersion()
		{
			Debug.Log("MNI: Checking mod version..");
			Global.Instance.StartCoroutine(RequestHelper.TryGetRequest(Credentials.API_URL_GET_VERSION, HandleVersionCheck, HandleVersionCheck));
		}
		static void HandleVersionCheck(string serverVersion)
		{
			Debug.Log("MNI: Mod version received");
			Debug.Log("Version string received from server: " + serverVersion);
			Debug.Log("Internal Version: " + Credentials.RELEASE_VERSION_ID);
			if (serverVersion != Credentials.RELEASE_VERSION_ID)
			{
				ModAssets.VersionOutdated = true;
				Debug.LogWarning("MNI: Mod version mismatch detected. Please update your mod.");
			}
			else
			{
				Debug.Log("MNI: Mod version is up to date.");
			}
		}
	}
}
