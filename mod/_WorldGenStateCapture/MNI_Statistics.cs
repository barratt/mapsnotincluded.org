using ClipperLib;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UnityEngine;

namespace _WorldGenStateCapture
{
	public class MNI_Statistics
	{
		//for measuring the time it takes to reach the main menu from the mod loading
		private static System.DateTime ModInitTime;

		public static MNI_Statistics Instance;

		//seeds collected this session
		public int SessionCounter = 0;
		//seeds collected in total
		public int TotalCounter = 0;
		//seeds collected in the last hour
		public int HourCounter = 0;
		public System.DateTime LastHourStart;

		//time the session starts generating in the main menu
		public System.DateTime SessionStart;
		public System.DateTime LastSeedGenerated;
		public double LastGenerationTimeSeconds;

		public bool RestartThresholdReached()
		{
			return SessionCounter >= Config.Instance.RestartTarget;
		}
		public bool IsMixingRun() => CheckMixing(TotalCounter+1);
		public bool LastRunMixingRun() => CheckMixing(TotalCounter);
		private bool CheckMixing(int runs)
		{
			int Divider = Mathf.RoundToInt(100f / Config.Instance.RandomMixingPercentage);
			return (runs % Divider == 0);
		}

		internal static void OnGameInitialisation()
		{
			ModInitTime = System.DateTime.Now;
		}
		private static bool initialized = false;
		internal static void Initialize()
		{
			if (initialized) return;
			initialized = true;
			Instance = ReadStatisticsFile();
			Instance.OnGameStart();
		}
		public void OnGameStart()
		{
			PrintStartStatistics();

			SessionCounter = 0;
			HourCounter = 0;
			LastHourStart = System.DateTime.Now;
			SessionStart = System.DateTime.Now;
			LastGenerationTimeSeconds = -1;
			LastSeedGenerated = default;
		}
		public void OnSeedGenerated()
		{
			if (LastSeedGenerated == default)
			{
				LastGenerationTimeSeconds = (System.DateTime.Now - SessionStart).TotalSeconds;
			}
			else
			{
				LastGenerationTimeSeconds = (System.DateTime.Now - LastSeedGenerated).TotalSeconds;
			}
			LastSeedGenerated = System.DateTime.Now;

			TotalCounter++;
			SessionCounter++;
			if (LastHourStart.AddHours(1) < System.DateTime.Now)
			{
				HourCounter = SessionCounter - HourCounter;
				LastHourStart = LastHourStart.AddHours(1);
			}
			PrintStatistics();
			WriteStatisticsFile();
		}
		public void PrintStatistics()
		{
			var totalTime = (LastSeedGenerated - SessionStart).TotalMinutes;
			var averageTime = totalTime / SessionCounter;

			Console.WriteLine($"MNI Statistics");
			TotalContributions();
			Console.WriteLine($"The last seed took {(int)LastGenerationTimeSeconds} seconds to generate.");
			if (LastRunMixingRun())
				Console.WriteLine($"The last seed was a mixed seed.");
			Console.WriteLine($"The current session has been running for {totalTime:0.0} minutes, taking on average {(int)(60*averageTime)} seconds per seed.");
			Console.WriteLine($"The current session has generated {SessionCounter} seeds so far.");
			if (HourCounter > 0)
				Console.WriteLine($"During the last hour {HourCounter} seeds were collected.");

		}
		public void PrintStartStatistics()
		{
			Console.WriteLine($"MNI Statistics - Startup");
			TotalContributions();
			Console.WriteLine($"The previous session had collected {SessionCounter} seeds.");
			var timeToBoot = (System.DateTime.Now - ModInitTime).TotalSeconds;
			Console.WriteLine($"The game took {(int)timeToBoot} seconds since mod intialisation to start collecting seeds.");				
		}
		void TotalContributions() => Console.WriteLine($"This contributor has collected a total of {TotalCounter} seeds so far.");
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
	}
}
