using HarmonyLib;
using ProcGenGame;

namespace AutomaticWorldGeneration
{
    public class Patches
    {
        [HarmonyPatch(typeof(Cluster))]
        [HarmonyPatch("Generate")]
        public class Db_Initialize_Patch
        {
            public static void Prefix()
            {
                Debug.Log("Automatic World Generation - Starting generation of new World!");

            }

            public static void Postfix()
            {
                Debug.Log("I execute after Db.Initialize!");
            }
        }

        
    }
}
