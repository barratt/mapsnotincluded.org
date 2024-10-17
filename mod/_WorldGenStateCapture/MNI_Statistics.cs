using ClipperLib;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace _WorldGenStateCapture
{
	public class MNI_Statistics
	{
		public static MNI_Statistics Instance;


		public int SessionCounter = 0;
		public int TotalCounter = 0;
		public int HourCounter = 0;
		public System.DateTime LastHourStart;

		public bool RestartThresholdReached()
		{
			return SessionCounter >= 100;
		}

		public void OnGameStart()
		{
			PrintStartStatistics();

			SessionCounter = 0;
			HourCounter = 0;
			LastHourStart = System.DateTime.Now;
		}
		public void OnSeedGenerated()
		{
			TotalCounter++;
			SessionCounter++;
			if(LastHourStart.AddHours(1) < System.DateTime.Now)
			{
				HourCounter = SessionCounter - HourCounter;
				LastHourStart = LastHourStart.AddHours(1);
			}
			PrintStatistics();
			WriteStatisticsFile();
		}
		public void PrintStatistics()
		{
			Console.WriteLine($"MNI Statistics");
			Console.WriteLine($"This instance has collected a total of {TotalCounter} seeds so far.");
			Console.WriteLine($"The current session has generated {SessionCounter} seeds so far.");
			if (HourCounter > 0)
				Console.WriteLine($"During the last hour the mod collected {HourCounter} seeds.");
		}
		public void PrintStartStatistics()
		{
			Console.WriteLine($"MNI Statistics - Startup");
			Console.WriteLine($"This instance has collected a total of {TotalCounter} seeds so far.");
			Console.WriteLine($"The previous session had collected {SessionCounter} seeds.");
		}
		public void WriteStatisticsFile()
		{
			Directory.CreateDirectory(Paths.ConfigFolder);
			var idFileName = "MNI_Statistics";
			var statisticsFile = System.IO.Path.Combine(Paths.ConfigFolder, idFileName);
			try
			{
				var fileInfo = new FileInfo(statisticsFile);
				FileStream fcreate = fileInfo.Open(FileMode.Create);

				var JsonString = JsonConvert.SerializeObject(this);
				using (var streamWriter = new StreamWriter(fcreate))
				{
					streamWriter.Write(JsonString);
				}
			}
			catch (Exception e)
			{
				Debug.LogWarning("Could not write file, Exception: " + e);
			}
		}
		public static MNI_Statistics ReadStatisticsFile()
		{
			Directory.CreateDirectory(Paths.ConfigFolder);
			var idFileName = "MNI_Statistics";
			var statisticsFile = Path.Combine(Paths.ConfigFolder, idFileName);

			var filePath = new FileInfo(statisticsFile);

			if (filePath.Exists)
			{
				try
				{
					FileStream filestream = filePath.OpenRead();
					using (var sr = new StreamReader(filestream))
					{
						string jsonString = sr.ReadToEnd();
						return JsonConvert.DeserializeObject<MNI_Statistics>(jsonString);
					}
				}
				catch (Exception ex)
				{
					Debug.LogWarning("Could not read existing statistics file!");
					Debug.LogWarning(ex);
				}
			}
			return new MNI_Statistics();
		}

		internal static void Initialize()
		{
			Instance = ReadStatisticsFile();
			Instance.OnGameStart();
		}
	}
}
