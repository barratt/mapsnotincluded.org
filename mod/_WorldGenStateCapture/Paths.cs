using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace _WorldGenStateCapture
{
	internal class Paths
	{
		public static string GameFolder => System.IO.Path.GetDirectoryName(UnityEngine.Application.dataPath);
		public static string ModsFolder => System.IO.Directory.GetParent(System.IO.Directory.GetParent(System.IO.Path.GetDirectoryName(System.Reflection.Assembly.GetExecutingAssembly().Location)).FullName).ToString() + "\\";
		public static string ConfigFolder => System.IO.Path.Combine(ModsFolder, "config");
		public static string WorldsFolder => System.IO.Path.Combine(Paths.ConfigFolder, "OfflineWorlds");
	}
}
