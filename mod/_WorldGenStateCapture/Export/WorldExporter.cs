using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using _WorldGenStateCapture;
using Newtonsoft.Json;
using static MapsNotIncluded_WorldParser.Export.ImageSave;
using static Rendering.BlockTileRenderer;

namespace MapsNotIncluded_WorldParser.Export
{
    class WorldExporter
    {
        public static void ExportAll()
        {
            string world_save_path = Path.Combine(Paths.ExportFolder, CustomGameSettings.Instance.GetSettingsCoordinate());

            Debug.Log("Trying to save to " + world_save_path);
            if (!Directory.Exists(world_save_path))
            {
                Debug.Log("Creating config path folder...");
                Directory.CreateDirectory(world_save_path);
                Debug.Log("Folder " + world_save_path + " initialized");
            }
            SaveElementIdxAsPNG8(Path.Combine(world_save_path, "elementIdx8.png"));
            SaveTemperatureAsPNG8(Path.Combine(world_save_path, "temperature8.png"));
            SaveMassAsPNG8(Path.Combine(world_save_path, "mass8.png"));
            SaveTemperatureAsPNG32(Path.Combine(world_save_path, "temperature32.png"));
            SaveMassAsPNG32(Path.Combine(world_save_path, "mass32.png"));
            //WorldExporter.SaveGridAsJSON(Path.Combine(world_save_path, "world_data.json"));
        }
        public static unsafe void SaveElementIdxAsPNG8(string filePath)
        {
            Save2dUint8ArrayAsPNG(filePath, Grid.WidthInCells, Grid.HeightInCells, Grid.elementIdx);
        }

        public static unsafe void SaveTemperatureAsPNG8(string filePath)
        {
            List<System.Tuple<double, double, double>> bins = new List<System.Tuple<double, double, double>>
            {
                Tuple.Create(-273.5, -272.5, 1.0),
                Tuple.Create(-272.5, -100.5, 20.0),
                Tuple.Create(-100.5, -20.5, 5.0),
                Tuple.Create(-20.5, 10.5, 2.0),
                Tuple.Create(10.5, 40.5, 1.0),
                Tuple.Create(40.5, 120.5, 2.0),
                Tuple.Create(120.5, 200.5, 5.0),
                Tuple.Create(200.5, 1400.5, 20.0),
                Tuple.Create(1400.5, 2000.5, 10.0)
            };

            Save2dFloat32ArrayAsPNG8(filePath, Grid.WidthInCells, Grid.HeightInCells, Grid.temperature, bins, -273.15);
        }

        public static unsafe void SaveTemperatureAsPNG32(string filePath)
        {
            Save2dFloat32ArrayAsPNG32(filePath, Grid.WidthInCells, Grid.HeightInCells, Grid.temperature);
        }

        public static unsafe void SaveMassAsPNG8(string filePath)
        {
            List<System.Tuple<double, double, double>> bins = new List<System.Tuple<double, double, double>>
            {
                Tuple.Create(-0.05, 5.05, 0.1),
                Tuple.Create(5.05, 25.5, 1.0),
                Tuple.Create(25.5, 105.5, 10.0),
                Tuple.Create(105.5, 2005.5, 20.0),
                Tuple.Create(2005.5, 20005.5, 100.0)
            };
            Save2dFloat32ArrayAsPNG8(filePath, Grid.WidthInCells, Grid.HeightInCells, Grid.mass, bins, 0);
        }

        public static unsafe void SaveMassAsPNG32(string filePath)
        {
            Save2dFloat32ArrayAsPNG32(filePath, Grid.WidthInCells, Grid.HeightInCells, Grid.mass);
        }

        public static void SaveGridAsJSON(string filePath)
        {
            string json = SerializeGridData(Grid.CellCount);
            File.WriteAllText(filePath, json);
        }

        public class GridData
        {
            public ushort ElementIdx { get; set; }
            public float Temperature { get; set; }
            public float Mass { get; set; }
        }

        public class ElementData
        {
            public ushort idx { get; set; }
            public Tag tag { get; set; }
            public SimHashes id { get; set; }
            public string name { get; set; }
        }


        public static unsafe string SerializeGridData(int gridSize)
        {
            List<GridData> gridDataList = new List<GridData>(gridSize);
            HashSet<ushort> uniqueElementIdx = new HashSet<ushort>();

            for (int i = 0; i < gridSize; i++)
            {
                ushort elementIndex = Grid.elementIdx[i];
                uniqueElementIdx.Add(elementIndex);

                gridDataList.Add(new GridData
                {
                    ElementIdx = elementIndex,
                    Temperature = Grid.temperature[i],
                    Mass = Grid.mass[i]
                });
            }

            // Serialize Grid Data
            string gridDataJson = JsonConvert.SerializeObject(gridDataList, Formatting.Indented);

            // Generate dictionary of unique ElementIdx found in the parsed data
            Dictionary<ushort, Element> uniqueElementsDict = new Dictionary<ushort, Element>();

            foreach (ushort idx in uniqueElementIdx)
            {
                if (ElementLoader.elementTable.TryGetValue(idx, out Element element))
                {
                    uniqueElementsDict[idx] = element;
                }
            }

            string uniqueElementsJson = JsonConvert.SerializeObject(uniqueElementsDict
                .ToDictionary(kv => kv.Key, kv => new ElementData
                {
                    idx = kv.Value.idx,
                    tag = kv.Value.tag,
                    id = kv.Value.id,
                    name = kv.Value.name
                }), Formatting.Indented);

            // Serialize ALL Elements from ElementLoader
            string allElementsJson = JsonConvert.SerializeObject(ElementLoader.elements
                .Select(e => new ElementData
                {
                    idx = e.idx,
                    tag = e.tag,
                    id = e.id,
                    name = e.name
                }), Formatting.Indented);

            return $"{{ \"gridData\": {gridDataJson}, \"uniqueElements\": {uniqueElementsJson}, \"allElements\": {allElementsJson} }}";
        }
    }
}
