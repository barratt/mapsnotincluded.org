using _WorldGenStateCapture.WorldStateData.Starmap.SpacemapItems;
using System;
using System.Collections.Generic;
using System.Reflection;

namespace _WorldGenStateCapture.WorldStateData
{
	internal class WorldDataInstance
	{
		public string coordinate;
		public string cluster;
		public uint gameVersion;
		public List<string> dlcs;
		public List<AsteroidData> asteroids = new List<AsteroidData>();
		public List<VanillaMap_Entry> starMapEntriesVanilla = null;
		public List<HexMap_Entry> starMapEntriesSpacedOut = null;
		//public List<string> mixingIds;

		public WorldDataInstance()
		{
			gameVersion = (uint)typeof(KleiVersion).GetField("ChangeList", BindingFlags.Public | BindingFlags.NonPublic | BindingFlags.Static).GetValue(null);
		}
	}
}
