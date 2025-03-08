using System;
using System.Collections.Generic;
using System.IO;
using System.Text;
using System.Threading.Tasks;

namespace _WorldGenStateCapture
{
	internal class Paths
	{
		public static string GameFolder => Path.GetDirectoryName(UnityEngine.Application.dataPath);
		public static string ModsFolder => KMod.Manager.GetDirectory();
		public static string ConfigFolder => Path.Combine(ModsFolder, "config");
        public static string WorldsFolder => Path.Combine(Paths.ConfigFolder, "OfflineWorlds");
		public static string ExportFolder => Path.Combine(ModsFolder, "export");
	}
}
