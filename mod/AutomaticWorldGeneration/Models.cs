using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AutomaticWorldGeneration
{
    public class Models
    {
        public class World
        {
            public string Name { get; set; }
            public string Description { get; set; }
            public int Size { get; set; }
            public int Seed { get; set; }
            public int[,] Map { get; set; }
            public List<Region> Regions { get; set; }
        }

        public class Region
        {
            public string Name { get; set; }
            public string Description { get; set; }
            //public int[,] Map { get; set; }
            public List<Region> SubRegions { get; set; }
        }

        public class Geyser
        {
            public string Name { get; set; }
            public int X { get; set; }
            public int Y { get; set; }

            public float Temperature { get; set; }

            public float EmitRate { get; set; }
            public string Element { get; set; }

            public float AvgEmission { get; set; }

            public int yearOffDuration { get; set; }
            public int yearOnDuration { get; set; }
            public int iterationLength { get; set; }
            public int onDuration { get; set; }

        }

    }
}
