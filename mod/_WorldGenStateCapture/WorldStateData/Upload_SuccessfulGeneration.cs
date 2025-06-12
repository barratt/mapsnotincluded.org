using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static DistributionPlatform;

namespace _WorldGenStateCapture.WorldStateData
{
	internal class Upload_SuccessfulGeneration
	{
		public string userId;
		public string installationId;
		public string gameVersion;
		public Dictionary<string, string> fileHashes;
		public WorldDataInstance cluster;
		public Upload_SuccessfulGeneration()
		{
			userId = IntegrityCheck.GetUserId();
			installationId = IntegrityCheck.GetInstallationId();
			gameVersion = BuildWatermark.GetBuildText();
		}
	}
}
