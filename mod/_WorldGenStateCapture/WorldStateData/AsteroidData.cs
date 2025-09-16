using _WorldGenStateCapture.WorldStateData.WorldPOIs;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using UnityEngine;

namespace _WorldGenStateCapture.WorldStateData
{
	internal class AsteroidData
	{
		public string id;

		//bottom left corner of the asteroid 
		[JsonIgnore] //not used anymore in tool
		public int offsetX;
		[JsonIgnore]//not used anymore in tool
		public int offsetY; 

		public int sizeX, sizeY;


		public List<string> worldTraits;
		public List<MapPOI> pointsOfInterest = new List<MapPOI>();
		public List<MapGeyser> geysers = new List<MapGeyser>();

		public string biomePaths;

		//public Dictionary<ProcGen.SubWorld.ZoneType, List<biomePolygon>> biomes;
	}
}
