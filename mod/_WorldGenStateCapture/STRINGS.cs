namespace _WorldGenStateCapture
{
	internal class STRINGS
	{
		public static LocString STARTPARSING = "Start Collecting Worlds";
		public static LocString FLOWDISABLED_TOOLTIP = "Regular world loading is disabled while the mod is running.\nUse the website form to request seeds.";
		public class MNI_STATISTICS
		{
			public static LocString TITLE = "MNI Statistics";

			public static LocString TOTAL_SHORT = "Seeds total: {0}";
			public static LocString DAILY_SHORT = "Seeds today: {0}";
			public static LocString MIXED_SHORT = "Remixed seeds: {0}";
			public static LocString SESSION_SHORT = "Seeds this session: {0}";
			public static LocString SESSION_TIME_SHORT = "Session runtime: {0} m";
			public static LocString LASTTIME_SHORT = "Last generation time: {0} s";
			public static LocString REQUESTED_SHORT = "Website seeds: {0}";
			public static LocString OPTED_OUT = "(Opted out)";

		}
		public class WORLDPARSERMODCONFIG
		{
			public class RANDOMIZEDGEN
			{
				public static LocString NAME = "Generate random Clusters";
				public static LocString DESC = "Selects the cluster to generate at random.";
			}
			public class TARGETCLUSTERBASE
			{
				public static LocString NAME = "Target World (Basegame)";
				public static LocString DESC = "Coordinate prefix of the world to parse seeds from.";
			}
			public class TARGETCLUSTERDLC
			{
				public static LocString NAME = "Target Cluster (DLC)";
				public static LocString DESC = "Coordinate prefix of the cluster to parse seeds from.";
			}
			public class TARGETCLUSTERBASE2
			{
				public static LocString NAME = "Secondary Target World (Basegame)";
				public static LocString DESC = "Add a second asteroid to collect seeds from.\nOnly has an effect when \"Target World\" is set";
			}
			public class TARGETCLUSTERDLC2
			{
				public static LocString NAME = "Secondary Target Cluster (DLC)";
				public static LocString DESC = "Add a second cluster to collect seeds from.\nOnly has an effect when \"Target Cluster\" is set";
			}
			public class TARGETCLUSTERBASE3
			{
				public static LocString NAME = "Tertiary Target World (Basegame)";
				public static LocString DESC = "Add a third asteroid to collect seeds from.\nOnly has an effect when \"Secondary Target World\" is set";
			}
			public class TARGETCLUSTERDLC3
			{
				public static LocString NAME = "Tertiary Target Cluster (DLC)";
				public static LocString DESC = "Add a third cluster to collect seeds from.\nOnly has an effect when \"Secondary Target Cluster\" is set";
			}
			public class TARGETNUMBER
			{
				public static LocString NAME = "Seeds per Session";
				public static LocString DESC = "Total number of seeds the mod collects before doing a restart.";
			}
			public class RANDOMMIXING
			{
				public static LocString NAME = "Mixing Percentage";
				public static LocString DESC = "Percentage of worlds that will be generated with DLC Remixing enabled";
			}
			public class ACCEPTREQUESTED
			{
				public static LocString NAME = "Allow Parsing Requested";
				public static LocString DESC = "Fetch and parse seeds that were requested from users on the website. Disable to opt out of this.";
			}
			public class MODSTARTDELAY
			{
				public static LocString NAME = "Mod Start Delay";
				public static LocString DESC = "Time in seconds the mod will wait before starting the world parsing.";
			}
			public class ASKBETWEENRUNSDIALOG
			{
				public static LocString NAME = "Show abort popup between runs";
				public static LocString DESC = "Show the first start popup after each run, allowing to abort it.";
			}
			public class WORLDSTATISTICSEXPORT
			{
				public static LocString NAME = "Export Local World Statistics";
				public static LocString DESC = "Exports a number of statistics of each world generated to a local folder (/mods/export)";
			}
			public class STEAMTOKEN
			{
				public static LocString NAME = "Steam Authentication Token";
				public static LocString DESC = "Optional!\nAdd your steam authentication token here to give seeds sent by you an extra level of verification.\nDO NOT SHARE THIS TOKEN WITH ANYONE ELSE!";
			}
			public class GETSTEAMTOKEN
			{
				public static LocString NAME = "Get Authentication Token";
				public static LocString DESC = "Opens the webbrowser for you to grab your authentication token.";
			}
		}
		public class AUTOPARSING
		{
			public class INPROGRESSDIALOG
			{
				public static LocString TITLE = "World collecting in progress";
				public static LocString DESC = "World parsing is in progress and will start in {0} seconds.\nClick below to cancel (ALT+F4, SHIFT+CMD+W, or close the game to force stop).";
				public static LocString STARTNOW = "Skip timer and start generating now";
			}
			public class MODSDETECTED
			{
				public static LocString TITLE = "Warning: active mods detected";
				public static LocString DESC = "There are currently other mods enabled that might invalidate the integrity of the collected world data.\nMap collection will proceed after you have disabled them.";
			}
			public class VERSIONOUTDATED
			{
				public static LocString TITLE = "Warning: mod version outdated";
				public static LocString DESC = "Your version of the MNI Parser mod is outdated and might not work correctly with the current game version.\nPlease update the mod.";
			}
			public class CONNECTIONERROR
			{
				public static LocString TITLE = "Failed at Uploading";
				public static LocString DESC = "The last seed upload did not upload due to the mod failing at establishing a connection to the server.\nThe mod will sleep for a minute, then try again.";
			}
		}
	}
}
