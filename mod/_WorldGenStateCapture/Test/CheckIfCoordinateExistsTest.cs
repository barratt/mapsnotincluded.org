using _WorldGenStateCapture;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MapsNotIncluded_WorldParser.Test
{
	class CheckIfCoordinateExistsTest
	{
		internal static void RunTest()
		{
			ModAssets.ModDilution = false;
			ModAssets.VersionOutdated = false;

			Debug.Log("Testing: Endpoint ServerHasCoordinate, "+ Credentials.API_URL_CHECK_MAP_EXISTS);
			RequestHelper.CheckIfCoordinateExists("V-CER-C-2014835410-0-0-0", () => Debug.Log("Test successful, server has coordinate"), () => Debug.LogWarning("Test failed, server should have coordinate!"));
			RequestHelper.CheckIfCoordinateExists("V-CER-C-123-0-0-0", () => Debug.LogWarning("Test failed, server should not have coordinate!"), () => Debug.Log("Test successful, server did not have coordinate"));
		}
	}
}
