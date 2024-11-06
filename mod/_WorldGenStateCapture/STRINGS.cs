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
        }
		public class AUTOPARSING
		{
			public class INPROGRESSDIALOG
			{
				public static LocString TITLE = "World collecting in progress";
				public static LocString DESC = "World parsing is in progress and will start in 10 seconds.\nclick below to cancel";
				public static LocString STARTNOW = "Skip timer";
			}
			public class MODSDETECTED
			{
				public static LocString TITLE = "Warning: active mods detected";
				public static LocString DESC = "There are currently other mods enabled that might invalidate the integrity of the collected world data.\nMap collection will proceed after you have disabled them.";
            }
            public class CONNECTIONERROR
            {
                public static LocString TITLE = "Failed at Uploading";
                public static LocString DESC = "The last seed upload did not upload due to the mod failing at establishing a connection to the server.\nThe mod will sleep for a minute, then try again.";
            }
        }
	}
}
