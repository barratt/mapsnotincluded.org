﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace _WorldGenStateCapture
{
	internal class Credentials
	{
		public static readonly string RELEASE_VERSION_ID = "REPLACE_SHORT_COMMIT";
					   
		public static readonly string API_Key = "7FE9SFM9jdv7CcL"; 
		public static readonly string API_URL_UPLOAD = "https://ingest.mapsnotincluded.org/upload";
		public static readonly string API_URL_REPORT_FAILED = "https://ingest.mapsnotincluded.org/report-worldgen-failure";
					   
		public static readonly string API_URL_REQUEST_SEED = "https://ingest.mapsnotincluded.org/requested-coordinate";
		public static readonly string API_URL_GET_VERSION = "https://barratt.github.io/mapsnotincluded.org/commit.txt";
		public static readonly string API_URL_GET_GAME_VERSION = "https://ingest.mapsnotincluded.org/current-game-version ";
					   
		public static readonly string API_URL_CHECK_MAP_EXISTS = "https://ingest.mapsnotincluded.org/exists/{0}";
		public static readonly string API_URL_GET_EXISTING_DATA = "https://ingest.mapsnotincluded.org/coordinate/{0}";

		public static readonly string API_GET_AUTH = "https://steam.auth.stefanoltmann.de/login";

		public static readonly string UPDATE_URL = "https://github.com/barratt/mapsnotincluded.org/releases/download/MNI_Mod_Automatic_Release/MapsNotIncluded_WorldParser.zip";
	}
}
 