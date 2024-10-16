using ProcGen;
using System;
using System.Collections.Generic;
using System.IO;
using System.Security.Cryptography;

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

		internal static Dictionary<string, string> HarvestClusterHashes(ClusterLayout targetLayout)
		{
			Dictionary<string, string> AccumulatedHashes = new Dictionary<string, string>();
			AccumulatedHashes["modHash"] = GetModHash();

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
			if(notWorldgen.Length> 0)
			{
				fullFilePath = fullFilePath.Replace("worldgen", notWorldgen);
			}
			//normalize
			fullFilePath = System.IO.Path.GetFullPath(fullFilePath); 
			string gameFolderPath = System.IO.Path.GetFullPath(GameFolder);
			string pathKey = fullFilePath
				.Replace(gameFolderPath, string.Empty)
				.Replace("\\OxygenNotIncluded_Data\\StreamingAssets\\", string.Empty)
				.Replace("\\","/");


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
			return BitConverter.ToString(hasher.ComputeHash(stream)).Replace("-",string.Empty).ToLowerInvariant();
		}

		public static string GetUserId()
		{
			Directory.CreateDirectory(ConfigFolder);
			var idFileName = "MNI_GUID";
			var filepath = System.IO.Path.Combine(ConfigFolder, idFileName);

			string GUID = Guid.NewGuid().ToString();
			if (!File.Exists(filepath))
				File.WriteAllText(filepath, GUID);
			else
				GUID = File.ReadAllText(filepath);
			return GUID;
		}
		public static string GameFolder => System.IO.Path.GetDirectoryName(UnityEngine.Application.dataPath);
		public static string ModsFolder => System.IO.Directory.GetParent(System.IO.Directory.GetParent(System.IO.Path.GetDirectoryName(System.Reflection.Assembly.GetExecutingAssembly().Location)).FullName).ToString() + "\\";
		public static string ConfigFolder => System.IO.Path.Combine(ModsFolder, "config");
	}
}
