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


        //seeds collected in total that had world mixing enabled
        public int MixedCounter = 0;
        //seeds parsed that were requested by users on the website
        public int ServerRequestedParsedCounter = 0;

        //time the session starts generating in the main menu
        public System.DateTime SessionStart;
		public System.DateTime LastSeedGenerated;
		public double LastGenerationTimeSeconds;

		
		public System.DateTime CurrentDay;
		public int DailyCounter = 0;

		public System.DateTime PastDay;
		public int PastDayCount = 0;

		public System.DateTime HighScoreDay;
		public int HighscoreCount = 0;

		public bool RestartThresholdReached()
		{
			return SessionCounter >= Config.Instance.RestartTarget;
		}
		public bool IsMixingRun() => CheckMixing(TotalCounter+1);

		private bool MixingActive = false;
		public bool LastRunMixingRun() => MixingActive;
        internal void SetMixingRunActive(bool anyMixingApplied)
        {
			Console.WriteLine("MNI-Statistics-Mixing Run active: " + anyMixingApplied);
            MixingActive = anyMixingApplied;
        }
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
		internal static void MainMenuInitialize()
		{
			if (initialized) 
				return;
			Console.WriteLine("Initializing MNI Statistics");
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
			CheckDailyStatistic();
		}
		public void CheckDailyStatistic()
		{
			//a new day has begun
			if (CurrentDay.Date != System.DateTime.Now.Date)
			{
				PastDayCount = DailyCounter;
				PastDay = CurrentDay;

				if (PastDayCount > HighscoreCount)
				{
					HighscoreCount = PastDayCount;
					HighScoreDay = PastDay;
				}


				CurrentDay = System.DateTime.Now;
				DailyCounter = 0;
			}
		}

		public void OnFailedSeedGenerated()
		{
			OnSeedGenerated();
			Console.WriteLine($"This seed failed to germinate!");
		}

		public void OnSeedGenerated()
		{
			CheckDailyStatistic();
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
			DailyCounter++;

			if(LastRunMixingRun())
				MixedCounter++;

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
			Console.WriteLine(HeaderString());
			Console.WriteLine(TotalContributionsString());
			Console.WriteLine(DailyContributionsString());
			Console.WriteLine(LastSeedTimeString());
			if (LastRunMixingRun())
				Console.WriteLine(MixedSeedString());
			Console.WriteLine(SessionTimeString());
			Console.WriteLine(SessionCounterString());
			if (HourCounter > 0)
				Console.WriteLine(HourlyCounterString());
		}

		public string LastSeedTimeString() => $"The last seed took {LastGenerationTimeSeconds} seconds to generate.";
        public string TotalContributionsString() => $"This contributor has collected a total of {TotalCounter} seeds so far.";
        public string DailyContributionsString() => $"Today you have collected a total of {DailyCounter} seeds so far.";
		public string MixedSeedString() => LastRunMixingRun() ? $"The last seed was a mixed seed." : string.Empty;
		public string SessionTimeString()
        {
            var totalTime = (LastSeedGenerated - SessionStart).TotalMinutes;
            var averageTime = totalTime / SessionCounter;
			return $"The current session has been running for {totalTime:0.0} minutes, taking on average {(int)(60 * averageTime)} seconds per seed.";
        }
		public string SessionCounterString() => $"The current session has generated {SessionCounter} seeds so far.";
		public string HourlyCounterString() => HourCounter > 0 ? $"During the last hour {HourCounter} seeds were collected.":string.Empty;
		public string HeaderString(string attendum = "") => "MNI Statistics" +attendum;
		public string HighscoreString() => HighscoreCount > 0 ? $"The most contributions were on {HighScoreDay.Date:d} with a total of {HighscoreCount} seeds." : string.Empty;
        public string PrevDayCounterString() => PastDayCount > 0 ? $"The last time the mod collected seed on {PastDay.Date:d} with a total of {PastDayCount} seeds." : string.Empty;
        public string PrevSessionCounterString() => SessionCounter > 0 ? $"The previous session had collected {SessionCounter} seeds.": string.Empty;
		public string TimeToBootString(int timeToBoot) => $"The game took {timeToBoot} seconds since mod intialisation to start collecting seeds.";

        public void PrintStartStatistics()
		{
			Console.WriteLine(HeaderString(" - Startup"));
			Console.WriteLine(TotalContributionsString());
			if (PastDayCount > 0)
			{
				Console.WriteLine(PrevDayCounterString());
			}
			if (HighscoreCount> 0)
			{
				Console.WriteLine(HighscoreString());
			}

			Console.WriteLine(DailyContributionsString());
			Console.WriteLine(PrevSessionCounterString());
			var timeToBoot = (System.DateTime.Now - ModInitTime).TotalSeconds;
			Console.WriteLine(TimeToBootString((int)timeToBoot));
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

			if (!Directory.Exists(Paths.ConfigFolder))
			{
				Debug.Log("Creating config path folder...");
                Directory.CreateDirectory(Paths.ConfigFolder);
				Debug.Log("Folder " + Paths.ConfigFolder + " initialized");
            }
			var idFileName = "MNI_Statistics";

            var statisticsFile = Path.Combine(Paths.ConfigFolder, idFileName);
			Debug.Log("Trying to read statistics file: "+statisticsFile);

			var filePath = new FileInfo(statisticsFile);

			if (filePath.Exists)
            {
                Debug.Log("File found, trying to parse it.. ");
                try
				{
					FileStream filestream = filePath.OpenRead();
					using (var sr = new StreamReader(filestream))
					{
						string jsonString = sr.ReadToEnd();


                        var config = JsonConvert.DeserializeObject<MNI_Statistics>(jsonString);

						if (config != null)
                        {
                            Debug.Log("MNI config successfully parsed");
							return config;
                        }
                        Debug.LogWarning("Could not successfully parse existing statistics file, object was null!");
                        return new MNI_Statistics();
                    }
				}
				catch (Exception ex)
				{
					Debug.LogWarning("Could not read existing statistics file!");
					Debug.LogWarning(ex);
                    return new MNI_Statistics();
                }
			}
			else
            {
                Debug.Log("No statistics file existing, creating a new one");
            }
			return new MNI_Statistics();
		}

        internal string GetMenuText()
        {
            var totalTime = (LastSeedGenerated - SessionStart).TotalMinutes;
            var averageTime = totalTime / SessionCounter;


            var sb = new StringBuilder();
			sb.AppendLine(string.Format(STRINGS.MNI_STATISTICS.TOTAL_SHORT, TotalCounter));
			sb.AppendLine(string.Format(STRINGS.MNI_STATISTICS.MIXED_SHORT, MixedCounter));
            sb.AppendLine(string.Format(STRINGS.MNI_STATISTICS.DAILY_SHORT, DailyCounter));
			sb.AppendLine(string.Format(STRINGS.MNI_STATISTICS.SESSION_SHORT, SessionCounter));

			if(totalTime>0)
				sb.AppendLine(string.Format(STRINGS.MNI_STATISTICS.SESSION_TIME_SHORT, totalTime.ToString("0.0"), (int)(60 * averageTime)));

            if (LastGenerationTimeSeconds > 0)
                sb.AppendLine(string.Format(STRINGS.MNI_STATISTICS.LASTTIME_SHORT, (int)LastGenerationTimeSeconds));
            if(Config.Instance.AcceptRequestedSeeds)
				sb.AppendLine(string.Format(STRINGS.MNI_STATISTICS.REQUESTED_SHORT, ServerRequestedParsedCounter));
			else
                sb.AppendLine(string.Format(STRINGS.MNI_STATISTICS.REQUESTED_SHORT, ServerRequestedParsedCounter > 0 ? ServerRequestedParsedCounter + " "+ STRINGS.MNI_STATISTICS.OPTED_OUT : STRINGS.MNI_STATISTICS.OPTED_OUT));            
            return sb.ToString();
        }

        internal void ServerRequestedSeedGenerated(string serverRequestedCoordinate)
        {
			ServerRequestedParsedCounter++;
			Console.WriteLine(HeaderString(" - ServerRequests"));
            Console.WriteLine($"Last generation was a server requested seed: {serverRequestedCoordinate}");

        }

        internal void OnBackendUnloaded(bool unloadSuccessful, int time)
        {
			if (unloadSuccessful)
            {
                Console.WriteLine(HeaderString(" - UnloadBackend"));
                Console.WriteLine($"Time to load to the main menu after seed committment: {time} seconds");
            }
            else
			{
                Console.WriteLine($"The Backend wasn't unloaded in less than 60 seconds, the application will now restart.");
            }

        }
    }
}
