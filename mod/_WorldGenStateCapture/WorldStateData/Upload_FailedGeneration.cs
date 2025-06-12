using _WorldGenStateCapture.WorldStateData;
using _WorldGenStateCapture;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MapsNotIncluded_WorldParser.WorldStateData
{
	internal class Upload_FailedGeneration
	{
		public string userId;
		public string installationId;
		public string gameVersion;
		public Dictionary<string, string> fileHashes;
		public string coordinate;
		//public List<string> mixingIds;
		public Upload_FailedGeneration()
		{
			userId = IntegrityCheck.GetUserId();
			installationId = IntegrityCheck.GetInstallationId();
			gameVersion = BuildWatermark.GetBuildText();
		}
	}
}
