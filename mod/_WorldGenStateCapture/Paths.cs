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
		public static string ModsFolder => Path.GetFullPath(Directory.GetParent(Directory.GetParent(Path.GetDirectoryName(System.Reflection.Assembly.GetExecutingAssembly().Location)).FullName).ToString());
		public static string ConfigFolder => Path.Combine(ModsFolder, "config");
		public static string WorldsFolder => Path.Combine(Paths.ConfigFolder, "OfflineWorlds");
	}
}
