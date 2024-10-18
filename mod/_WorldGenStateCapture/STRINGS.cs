namespace _WorldGenStateCapture
{
	internal class STRINGS
	{
		public static LocString STARTPARSING = "Start Collecting Worlds";
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
		}
	}
}
