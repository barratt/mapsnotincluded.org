using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace _WorldGenStateCapture
{
	internal class Credentials
	{
		public static string RELEASE_VERSION_ID = "REPLACE_SHORT_COMMIT";

		public static string API_Key = "7FE9SFM9jdv7CcL"; 
		public static string API_URL_UPLOAD = "https://ingest.mapsnotincluded.org/upload";
		public static string API_URL_REPORT_FAILED = "https://ingest.mapsnotincluded.org/report-worldgen-failure";

		public static string API_URL_REQUEST_SEED = "https://ingest.mapsnotincluded.org/requested-coordinate";
		public static string API_URL_GET_VERSION = "https://ingest.mapsnotincluded.org/current-mod-version";

		public static string API_URL_CHECK_MAP_EXISTS = "https://ingest.mapsnotincluded.org/exists/{0}";
		public static string API_URL_GET_EXISTING_DATA = "https://ingest.mapsnotincluded.org/coordinate/{0}";

		public static readonly string API_GET_AUTH = "https://steam.auth.stefanoltmann.de/login";
	}
}
 