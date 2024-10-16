using ProcGen;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
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
		public static string GetModHash() => GetFileHash(System.Reflection.Assembly.GetExecutingAssembly().Location);
		
		public static string GetFileHash(string filename)
		{
			using var hasher = SHA256.Create();
			using var stream = System.IO.File.OpenRead(filename);
			Console.WriteLine("Hashing: " + filename);
			return BitConverter.ToString(hasher.ComputeHash(stream));
		}
	}
}
