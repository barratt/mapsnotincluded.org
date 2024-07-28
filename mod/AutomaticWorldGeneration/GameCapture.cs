using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AutomaticWorldGeneration
{
    public class GameCapture
    {
        public static List<string> GetWorldTraits()
        {
            var world = ClusterManager.Instance.WorldContainers[0];
            List<String> worldTraits = world.WorldTraitIds;

            Debug.Log("World Containers " + ClusterManager.Instance.WorldContainers.Count);
            Debug.Log("AutomaticWorldGeneration - World Traits: " + worldTraits.Count);

            return worldTraits;
        }

        public static List<Models.Geyser> GetGeyserTraits()
        {
            Geyser[] geysers = UnityEngine.Object.FindObjectsOfType<Geyser>();

            Debug.Log("AutomaticWorldGeneration - Found " + geysers.Length + " geysers");

            List<Models.Geyser> geyserTraits = new List<Models.Geyser>();

            foreach (var geyser in geysers)
            {
                Debug.Log("AutomaticWorldGeneration - Geyser: " + geyser.name);
                float temp = geyser.configuration.GetTemperature(); // Kelvin
                float emitRate = geyser.configuration.GetEmitRate(); // kgs
                string element = geyser.configuration.geyserType.element.ToString();

                float avgEmission = geyser.configuration.GetAverageEmission(); // kgs/s 

                int x = (int)geyser.transform.position.x;
                int y = (int)geyser.transform.position.y;

                int yearOnDuration = (int)geyser.configuration.GetYearOnDuration();
                int yearOffDuration = (int)geyser.configuration.GetYearOffDuration(); // on duration cycles every offduration (seconds)

                int iterationLength = (int)geyser.configuration.GetIterationLength(); // seconds
                int onDuration = (int)geyser.configuration.GetOnDuration(); // seconds

                //var GetIdleDuration = Traverse.Create(geyser).Method("GetIdleDuration").GetValue();
                //var GetActiveDuration = Traverse.Create(geyser).Method("GetActiveDuration").GetValue();

                //float idleDuration = (float)GetIdleDuration;
                //float activeDuration = (float)GetActiveDuration;

                Debug.Log("AutomaticWorldGeneration - Geyser Temp: " + temp);
                Debug.Log("AutomaticWorldGeneration - Geyser EmitRate: " + emitRate);
                Debug.Log("AutomaticWorldGeneration - Geyser Element: " + element);
                Debug.Log("AutomaticWorldGeneration - Geyser X, Y " + x + ", " + y);
                Debug.Log("AutomaticWorldGeneration - Geyser yearOnDuration: " + yearOnDuration);
                Debug.Log("AutomaticWorldGeneration - Geyser yearOffDuration: " + yearOffDuration);
                Debug.Log("AutomaticWorldGeneration - Geyser iterationLength: " + iterationLength);
                Debug.Log("AutomaticWorldGeneration - Geyser onDuration: " + onDuration);

                Models.Geyser geyserTrait = new Models.Geyser
                {
                    Name = geyser.name,
                    X = x,
                    Y = y,
                    Temperature = temp,
                    EmitRate = emitRate,
                    Element = element,
                    AvgEmission = avgEmission,
                    yearOffDuration = yearOffDuration,
                    yearOnDuration = yearOnDuration,
                    iterationLength = iterationLength,
                    onDuration = onDuration
                };

                geyserTraits.Add(geyserTrait);
            }

            return geyserTraits;
        }

    }
}
