using Newtonsoft.Json;
using PeterHan.PLib.Options;
using System;
using System.Collections.Generic;
using UnityEngine;

namespace _WorldGenStateCapture
{
	[Serializable]
	[RestartRequired]
	[ConfigFile(SharedConfigLocation: true)]
	[ModInfo("World Parser")]
	public class Config : SingletonOptions<Config>
	{
		[Option("STRINGS.WORLDPARSERMODCONFIG.GETSTEAMTOKEN.NAME", "STRINGS.WORLDPARSERMODCONFIG.GETSTEAMTOKEN.DESC")]
		[JsonIgnore]
		public System.Action<object> Button_OpenAuthGetter => (_) => Application.OpenURL("https://steam.auth.stefanoltmann.de/login");

		[Option("STRINGS.WORLDPARSERMODCONFIG.STEAMTOKEN.NAME", "STRINGS.WORLDPARSERMODCONFIG.STEAMTOKEN.DESC")]
		[JsonProperty]
		[Limit(256, 1024)]
		public string MNI_AuthToken { get; set; } = string.Empty;

		[RequireDLC(DlcManager.VANILLA_ID, true)]
		[RequireDLC(DlcManager.EXPANSION1_ID, false)]
		[Option("STRINGS.WORLDPARSERMODCONFIG.TARGETCLUSTERBASE.NAME", "STRINGS.WORLDPARSERMODCONFIG.TARGETCLUSTERBASE.DESC")]
		[JsonProperty]
		public ClusterSelection_Base ClusterSelection_BaseGame { get; set; } = ClusterSelection_Base.Random;

		[RequireDLC(DlcManager.VANILLA_ID, true)]
		[RequireDLC(DlcManager.EXPANSION1_ID, false)]
		[Option("STRINGS.WORLDPARSERMODCONFIG.TARGETCLUSTERBASE2.NAME", "STRINGS.WORLDPARSERMODCONFIG.TARGETCLUSTERBASE2.DESC")]
		[JsonProperty]
		public ClusterSelection_Base ClusterSelection_BaseGame2 { get; set; } = ClusterSelection_Base.Random;

		[RequireDLC(DlcManager.VANILLA_ID, true)]
		[RequireDLC(DlcManager.EXPANSION1_ID, false)]
		[Option("STRINGS.WORLDPARSERMODCONFIG.TARGETCLUSTERBASE3.NAME", "STRINGS.WORLDPARSERMODCONFIG.TARGETCLUSTERBASE3.DESC")]
		[JsonProperty]
		public ClusterSelection_Base ClusterSelection_BaseGame3 { get; set; } = ClusterSelection_Base.Random;


		[RequireDLC(DlcManager.EXPANSION1_ID, true)]
		[Option("STRINGS.WORLDPARSERMODCONFIG.TARGETCLUSTERDLC.NAME", "STRINGS.WORLDPARSERMODCONFIG.TARGETCLUSTERDLC.DESC")]
		[JsonProperty]
		public ClusterSelection_SO ClusterSelection_SpacedOut { get; set; } = ClusterSelection_SO.Random;

		[RequireDLC(DlcManager.EXPANSION1_ID, true)]
		[Option("STRINGS.WORLDPARSERMODCONFIG.TARGETCLUSTERDLC2.NAME", "STRINGS.WORLDPARSERMODCONFIG.TARGETCLUSTERDLC2.DESC")]
		[JsonProperty]
		public ClusterSelection_SO ClusterSelection_SpacedOut2 { get; set; } = ClusterSelection_SO.Random;

		[RequireDLC(DlcManager.EXPANSION1_ID, true)]
		[Option("STRINGS.WORLDPARSERMODCONFIG.TARGETCLUSTERDLC3.NAME", "STRINGS.WORLDPARSERMODCONFIG.TARGETCLUSTERDLC3.DESC")]
		[JsonProperty]
		public ClusterSelection_SO ClusterSelection_SpacedOut3 { get; set; } = ClusterSelection_SO.Random;

		[Option("STRINGS.WORLDPARSERMODCONFIG.TARGETNUMBER.NAME", "STRINGS.WORLDPARSERMODCONFIG.TARGETNUMBER.DESC")]
		[JsonProperty]
		public int RestartTarget { get; set; } = 100;

		[Option("STRINGS.WORLDPARSERMODCONFIG.RANDOMMIXING.NAME", "STRINGS.WORLDPARSERMODCONFIG.RANDOMMIXING.DESC")]
		[JsonProperty]
		[Limit(0, 100)]
		public int RandomMixingPercentage { get; set; } = 50;

		[Option("STRINGS.WORLDPARSERMODCONFIG.ACCEPTREQUESTED.NAME", "STRINGS.WORLDPARSERMODCONFIG.ACCEPTREQUESTED.DESC")]
		[JsonProperty]
		public bool AcceptRequestedSeeds { get; set; } = true;

		[Option("STRINGS.WORLDPARSERMODCONFIG.MODSTARTDELAY.NAME", "STRINGS.WORLDPARSERMODCONFIG.MODSTARTDELAY.DESC")]
		[JsonProperty]
		[Limit(5, 100)] // Allow up to 100 seconds of delay, with a minimum of 5 to prevent soft-locking (but configurable in JSON directly to entirely skip the delay for power users)
		public int ModStartDelay { get; set; } = 10;

		[Option("STRINGS.WORLDPARSERMODCONFIG.ASKBETWEENRUNSDIALOG.NAME", "STRINGS.WORLDPARSERMODCONFIG.ASKBETWEENRUNSDIALOG.DESC")]
		[JsonProperty]
		public bool AskBetweenRunsDialog { get; set; } = false;

		[Option("STRINGS.WORLDPARSERMODCONFIG.WORLDSTATISTICSEXPORT.NAME", "STRINGS.WORLDPARSERMODCONFIG.WORLDSTATISTICSEXPORT.DESC")]
		[JsonProperty]
		public bool WorldStatisticsExport { get; set; } = false;

		public enum ClusterSelection_Base
		{
			[Option("STRINGS.WORLDPARSERMODCONFIG.RANDOMIZEDGEN.NAME", "STRINGS.WORLDPARSERMODCONFIG.RANDOMIZEDGEN.DESC")]
			Random = -1,

			[Option("STRINGS.WORLDS.BADLANDS.NAME")]
			The_Badlands,

			[Option("STRINGS.WORLDS.FOREST_DEFAULT.NAME")]
			Arboria,
			[Option("STRINGS.WORLDS.FOREST_HOT.NAME")]
			Aridio,
			[Option("STRINGS.WORLDS.FOREST_LUSH.NAME")]
			Verdante,
			//Skewed_Asteroid, //only 1 seed available

			[Option("STRINGS.WORLDS.OASIS.NAME")]
			Oasisse,

			[Option("STRINGS.WORLDS.OCEANIA.NAME")]
			Oceania,

			[Option("STRINGS.WORLDS.SANDSTONE_DEFAULT.NAME")]
			Terra,
			[Option("STRINGS.WORLDS.SANDSTONE_FROZEN.NAME")]
			Rime,
			[Option("STRINGS.WORLDS.VOLCANIC.NAME")]
			Volcanea,
			[Option("STRINGS.WORLDS.CERESBASEGAME.NAME")]
			Ceres,
			[Option("STRINGS.WORLDS.CERESBASEGAMESHATTERED.NAME")]
			Blasted_Ceres,
			[Option("STRINGS.CLUSTER_NAMES.PREHISTORIC_BASE_CLUSTER.NAME")]
			Relica,
			[Option("STRINGS.WORLDS.PREHISTORICSHATTERED.NAME")]
			Blasted_Relica,
		}
		public enum ClusterSelection_SO
		{
			[Option("STRINGS.WORLDPARSERMODCONFIG.RANDOMIZEDGEN.NAME", "STRINGS.WORLDPARSERMODCONFIG.RANDOMIZEDGEN.DESC")]
			Random = -1,
			[Option("STRINGS.CLUSTER_NAMES.FOREST_START_CLUSTER.NAME")]
			Folia_Cluster,
			//Skewed_Asteroid, //only 1 seed available
			[Option("STRINGS.CLUSTER_NAMES.MINICLUSTER_BADLANDSSTART.NAME")]
			Moonlet_Cluster_The_Desolands,
			[Option("STRINGS.CLUSTER_NAMES.MINICLUSTER_FLIPPEDSTART.NAME")]
			Moonlet_Cluster_Flipped,
			[Option("STRINGS.CLUSTER_NAMES.MINICLUSTER_FORESTFROZENSTART.NAME")]
			Moonlet_Cluster_Frozen_Forest,
			[Option("STRINGS.CLUSTER_NAMES.MINICLUSTER_METALLICSWAMPYSTART.NAME")]
			Moonlet_Cluster_Metallic_Swampy,
			[Option("STRINGS.CLUSTER_NAMES.MINICLUSTER_RADIOACTIVEOCEANSTART.NAME")]
			Moonlet_Cluster_Radioactive_Ocean,
			[Option("STRINGS.CLUSTER_NAMES.SANDSTONE_START_CLUSTER.NAME")]
			Terrania_Cluster,
			[Option("STRINGS.CLUSTER_NAMES.SWAMP_START_CLUSTER.NAME")]
			Quagmiris_Cluster,
			[Option("STRINGS.CLUSTER_NAMES.FOREST_START_CLUSTER.NAME")]
			Arboria_Cluster,
			[Option("STRINGS.CLUSTER_NAMES.VANILLA_ARIDIO_CLUSTER.NAME")]
			Aridio_Cluster,
			[Option("STRINGS.CLUSTER_NAMES.VANILLA_BADLANDS_CLUSTER.NAME")]
			The_Badlands_Cluster,
			[Option("STRINGS.CLUSTER_NAMES.VANILLA_FOREST_CLUSTER.NAME")]
			Verdante_Cluster,
			[Option("STRINGS.CLUSTER_NAMES.VANILLA_OASIS_CLUSTER.NAME")]
			Oasisse_Cluster,
			[Option("STRINGS.CLUSTER_NAMES.VANILLA_OCEANIA_CLUSTER.NAME")]
			Oceania_Cluster,
			[Option("STRINGS.CLUSTER_NAMES.VANILLA_SANDSTONE_CLUSTER.NAME")]
			Terra_Cluster,
			[Option("STRINGS.CLUSTER_NAMES.VANILLA_SANDSTONE_FROZEN_CLUSTER.NAME")]
			Rime_Cluster,
			[Option("STRINGS.CLUSTER_NAMES.VANILLA_SWAMP_CLUSTER.NAME")]
			Squelchy_Cluster,
			[Option("STRINGS.CLUSTER_NAMES.VANILLA_VOLCANIC_CLUSTER.NAME")]
			Volcanea_Cluster,
			[Option("STRINGS.CLUSTER_NAMES.CERES_CLASSIC_CLUSTER.NAME")]
			Ceres_Cluster,
			[Option("STRINGS.CLUSTER_NAMES.CERES_CLASSIC_SHATTERED_CLUSTER.NAME")]
			Blasted_Ceres_Cluster,
			[Option("STRINGS.CLUSTER_NAMES.CERES_SPACEDOUT_CLUSTER.NAME")]
			Ceres_Minor_Cluster,
			[Option("STRINGS.CLUSTER_NAMES.CERES_SPACEDOUT_SHATTERED_CLUSTER.NAME")]
			Ceres_Shattered_Cluster,
			[Option("STRINGS.CLUSTER_NAMES.PREHISTORIC_CLASSIC_CLUSTER.NAME")]
			Relica,
			[Option("STRINGS.CLUSTER_NAMES.PREHISTORIC_SPACEDOUT_CLUSTER.NAME")]
			Relica_Minor,
			[Option("STRINGS.CLUSTER_NAMES.PREHISTORIC_SHATTERED_CLUSTER.NAME")]
			Blasted_Relica,
		}

		public static Dictionary<ClusterSelection_Base, string> ClusterCoordinates_Base = new()
		{
			{ClusterSelection_Base.The_Badlands, "BAD-A"},
			{ClusterSelection_Base.Arboria, "FRST-A"},
			{ClusterSelection_Base.Aridio, "HTFST-A"},
			{ClusterSelection_Base.Verdante, "LUSH-A"},
			//{ClusterSelection_Base.Skewed_Asteroid, "KF23-A"}, //only 1 seed available
			{ClusterSelection_Base.Oasisse, "OASIS-A"},
			{ClusterSelection_Base.Oceania, "OCAN-A"},
			{ClusterSelection_Base.Terra, "SNDST-A"},
			{ClusterSelection_Base.Rime, "S-FRZ"},
			{ClusterSelection_Base.Volcanea, "VOLCA"},
			{ClusterSelection_Base.Ceres, "CER-A"},
			{ClusterSelection_Base.Blasted_Ceres, "CERS-A"},
			{ClusterSelection_Base.Relica, "PRE-A"},
			{ClusterSelection_Base.Blasted_Relica, "PRES-A"},
		};
		public static Dictionary<ClusterSelection_SO, string> ClusterCoordinates_SO = new()
		{
			{ClusterSelection_SO.Folia_Cluster, "FRST-C"},
			//{ClusterSelection_SO.Skewed_Asteroid, "KF23-C"}, //only 1 seed available
			{ClusterSelection_SO.Moonlet_Cluster_The_Desolands, "M-BAD-C"},
			{ClusterSelection_SO.Moonlet_Cluster_Flipped, "M-FLIP-C"},
			{ClusterSelection_SO.Moonlet_Cluster_Frozen_Forest, "M-FRZ-C"},
			{ClusterSelection_SO.Moonlet_Cluster_Metallic_Swampy, "M-SWMP-C"},
			{ClusterSelection_SO.Moonlet_Cluster_Radioactive_Ocean, "M-RAD-C"},
			{ClusterSelection_SO.Terrania_Cluster, "SNDST-C"},
			{ClusterSelection_SO.Quagmiris_Cluster, "SWMP-C"},
			{ClusterSelection_SO.Arboria_Cluster, "V-FRST-C"},
			{ClusterSelection_SO.Aridio_Cluster, "V-HTFST-C"},
			{ClusterSelection_SO.The_Badlands_Cluster, "V-BAD-C"},
			{ClusterSelection_SO.Verdante_Cluster, "V-LUSH-C"},
			{ClusterSelection_SO.Oasisse_Cluster, "V-OASIS-C"},
			{ClusterSelection_SO.Oceania_Cluster, "V-OCAN-C"},
			{ClusterSelection_SO.Terra_Cluster, "V-SNDST-C"},
			{ClusterSelection_SO.Rime_Cluster, "V-SFRZ-C"},
			{ClusterSelection_SO.Squelchy_Cluster, "V-SWMP-C"},
			{ClusterSelection_SO.Volcanea_Cluster, "V-VOLCA-C"},
			{ClusterSelection_SO.Ceres_Cluster, "V-CER-C"},
			{ClusterSelection_SO.Blasted_Ceres_Cluster, "V-CERS-C"},
			{ClusterSelection_SO.Ceres_Minor_Cluster, "CER-C"},
			{ClusterSelection_SO.Ceres_Shattered_Cluster, "M-CERS-C"},
			{ClusterSelection_SO.Relica, "V-PRE-C"},
			{ClusterSelection_SO.Relica_Minor, "PRE-C"},
			{ClusterSelection_SO.Blasted_Relica, "V-PRES-C"},

		};

		internal static bool TryGetTargetClusterPrefix(out string targetPrefix)
		{
			if (DlcManager.IsExpansion1Active())
			{
				bool fixedCluster = ClusterCoordinates_SO.TryGetValue(Instance.ClusterSelection_SpacedOut, out targetPrefix);
				bool secondary = ClusterCoordinates_SO.TryGetValue(Instance.ClusterSelection_SpacedOut2, out var targetPrefix2);
				bool tertiary = ClusterCoordinates_SO.TryGetValue(Instance.ClusterSelection_SpacedOut3, out var targetPrefix3);

				if (fixedCluster)
				{
					List<string> possiblePrefixes = [targetPrefix];
					if (secondary)
						possiblePrefixes.Add(targetPrefix2);
					if (secondary && tertiary)
						possiblePrefixes.Add(targetPrefix3);

					targetPrefix = possiblePrefixes.GetRandom();
					return true;
				}
				return false;
			}
			else
			{

				bool fixedCluster = ClusterCoordinates_Base.TryGetValue(Instance.ClusterSelection_BaseGame, out targetPrefix);
				bool secondary = ClusterCoordinates_Base.TryGetValue(Instance.ClusterSelection_BaseGame2, out var targetPrefix2);
				bool tertiary = ClusterCoordinates_Base.TryGetValue(Instance.ClusterSelection_BaseGame3, out var targetPrefix3);

				if (fixedCluster)
				{
					List<string> possiblePrefixes = [targetPrefix];
					if (secondary)
						possiblePrefixes.Add(targetPrefix2);
					if (secondary && tertiary)
						possiblePrefixes.Add(targetPrefix3);

					targetPrefix = possiblePrefixes.GetRandom();
					return true;
				}
				return false;
			}
		}
	}
}
