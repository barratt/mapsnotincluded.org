using Newtonsoft.Json;
using PeterHan.PLib.Options;
using System;
using System.Collections.Generic;

namespace _WorldGenStateCapture
{
	[Serializable]
	[RestartRequired]
	[ConfigFile(SharedConfigLocation: true)]
	[ModInfo("World Parser")]
	public class Config : SingletonOptions<Config>
	{
		[Option("STRINGS.WORLDPARSERMODCONFIG.RANDOMIZEDGEN.NAME", "STRINGS.WORLDPARSERMODCONFIG.RANDOMIZEDGEN.DESC")]
		[JsonProperty]
		public bool RandomizedClusterGen { get; set; } = true;

		[Option("STRINGS.WORLDPARSERMODCONFIG.TARGETCLUSTERBASE.NAME", "STRINGS.WORLDPARSERMODCONFIG.TARGETCLUSTERBASE.DESC")]
		[JsonProperty]
		public ClusterSelection_Base TargetCoordinateBase { get; set; } = ClusterSelection_Base.Terra;

		[Option("STRINGS.WORLDPARSERMODCONFIG.TARGETCLUSTERDLC.NAME", "STRINGS.WORLDPARSERMODCONFIG.TARGETCLUSTERDLC.DESC")]
		[JsonProperty]
		public ClusterSelection_SO TargetCoordinateDLC { get; set; } = ClusterSelection_SO.Terrania_Cluster;

		[Option("STRINGS.WORLDPARSERMODCONFIG.TARGETNUMBER.NAME", "STRINGS.WORLDPARSERMODCONFIG.TARGETNUMBER.DESC")]
		[JsonProperty]
		public int RestartTarget { get; set; } = 100;

		[Option("STRINGS.WORLDPARSERMODCONFIG.RANDOMMIXING.NAME", "STRINGS.WORLDPARSERMODCONFIG.RANDOMMIXING.DESC")]
		[JsonProperty]
		[Limit(0, 100)]
		public int RandomMixingPercentage { get; set; } = 5;

		public enum ClusterSelection_Base
		{
			The_Badlands,
			Arboria,
			Aridio,
			Verdante,
			//Skewed_Asteroid, //only 1 seed available
			Oasisse,
			Oceania,
			Terra,
			Rime,
			Volcanea,
			Ceres,
			Blasted_Ceres,
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
		};
		public enum ClusterSelection_SO
		{
			Folia_Cluster,
			//Skewed_Asteroid, //only 1 seed available
			Moonlet_Cluster_The_Desolands,
			Moonlet_Cluster_Flipped,
			Moonlet_Cluster_Frozen_Forest,
			Moonlet_Cluster_Metallic_Swampy,
			Moonlet_Cluster_Radioactive_Ocean,
			Terrania_Cluster,
			Quagmiris_Cluster,
			Arboria_Cluster,
			Aridio_Cluster,
			The_Badlands_Cluster,
			Verdante_Cluster,
			Oasisse_Cluster,
			Oceania_Cluster,
			Terra_Cluster,
			Rime_Cluster,
			Squelchy_Cluster,
			Volcanea_Cluster,
			Ceres_Cluster,
			Blasted_Ceres_Cluster,
			Ceres_Minor_Cluster,
		}
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
		};

		internal static string TargetClusterPrefix()
		{
			if (DlcManager.IsExpansion1Active())
			{
				if (!ClusterCoordinates_SO.TryGetValue(Instance.TargetCoordinateDLC, out var prefix))
					prefix = "SNDST-C";
				return prefix;
			}
			else
			{
				if (!ClusterCoordinates_Base.TryGetValue(Instance.TargetCoordinateBase, out var prefix))
					prefix = "SNDST-A";
				return prefix;
			}
		}
	}
}
