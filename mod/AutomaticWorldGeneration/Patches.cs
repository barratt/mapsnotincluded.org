using ClipperLib;
using HarmonyLib;
using Klei.CustomSettings;
using KMod;
using ProcGen;
using ProcGenGame;
using STRINGS;
using System.Collections.Generic;
using System.Reflection;
using static ProcGen.ClusterLayout;

namespace AutomaticWorldGeneration
{
    public class Patches
    {
        [HarmonyPatch(typeof(Db), "Initialize")]
        public class Db_Initialize_Patch
        {
            public static void Prefix()
            {
                Debug.Log("Init Mod!");
                // Lets see if we can generate a new world by clicking new game?
                //SaveManager.
                //var mainMenu = MainMenu.Instance;

                //var children = mainMenu.GetComponentsInChildren<KButton>();

                //foreach (var child in children)
                //{
                //    if (child.name == "NewGameButton")
                //    {
                //        Debug.Log("Found NewGameButton!");
                //        child.onClick += () =>
                //        {
                //            Debug.Log("NewGameButton Clicked!");
                //            //ClusterManager.Instance.GenerateWorld();
                //        };
                //    }
                //}

            }

            public static void Postfix()
            {
                Debug.Log("I execute after Db.Initialize!");
            }
        }


        [HarmonyPatch(typeof(Cluster))]
        [HarmonyPatch("Generate")]
        public class Generate_Patch
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

        [HarmonyPatch(typeof(MainMenu))]
        [HarmonyPatch("OnSpawn")]
        public class MainMenu_OnSpawn_Patch
        {
            public static void Prefix()
            {
                Debug.Log("MainMenu - OnSpawn!");
            }

            public static void Postfix(MainMenu __instance)
            {
                Debug.Log("MainMenu - OnSpawn! Ran");
                var mainMenu = MainMenu.Instance;

                WorldGen.WaitForPendingLoadSettings(); // World gen has a lot of what we need, but we need to find the instance of it.
                CustomGameSettings.Instance.LoadClusters();

                // Lets dump all the clusters and their targetPath
                SettingsCache.GetClusterNames().ForEach((cluster) =>
                {
                    Debug.Log("Cluster: " + cluster);
                    var data = SettingsCache.clusterLayouts.GetClusterData(cluster);
                    Debug.Log("TargetPath: " + data.filePath);
                });

                var flow = mainMenu.GetComponent<NewGameFlow>();
                flow.BeginFlow();
            }
        }


        [HarmonyPatch(typeof(ClusterCategorySelectionScreen), "OnSpawn")]
        public static class SelectClusterType
        {
            public static void Postfix(ClusterCategorySelectionScreen __instance)
            {
                MethodInfo methodInfo = typeof(ClusterCategorySelectionScreen).GetMethod("OnClickOption", BindingFlags.NonPublic | BindingFlags.Instance);
                var parameters = new object[] { ClusterCategory.Vanilla };
                methodInfo.Invoke(__instance, parameters);
            }
        }

        [HarmonyPatch(typeof(ModeSelectScreen), "OnSpawn")]
        public static class SelectSurvivalSettings
        {
            public static void Postfix(ModeSelectScreen __instance)
            {
                //OnClickSurvival
                MethodInfo methodInfo = typeof(ModeSelectScreen).GetMethod("OnClickSurvival", BindingFlags.NonPublic | BindingFlags.Instance);
                var parameters = new object[] { };
                methodInfo.Invoke(__instance, parameters);
            }
        }


        //ColonyDestinationSelectScreen
        [HarmonyPatch(typeof(ColonyDestinationSelectScreen), "OnSpawn")]
        public static class SelectColonyDestination
        {
            public static void Postfix(ColonyDestinationSelectScreen __instance)
            {

                var newGameSettingsPanel = Traverse.Create(__instance).Field<NewGameSettingsPanel>("newGameSettingsPanel").Value;
                MethodInfo setGameSettings = typeof(NewGameSettingsPanel).GetMethod("SetSetting", BindingFlags.NonPublic | BindingFlags.Instance);

                //newGameSettingsPanel.SetSetting(CustomGameSettingConfigs.WorldgenSeed, "SNDST-A-650071158-0-D3-0");
                CustomGameSettings.Instance.SetQualitySetting(CustomGameSettingConfigs.SaveToCloud, "Disabled");
                //CustomGameSettings.Instance.SetQualitySetting(CustomGameSettingConfigs.WorldgenSeed, "SNDST-A-650071158-0-D3-0"); // A future worker mod perhaps?
                CustomGameSettings.Instance.SetQualitySetting(CustomGameSettingConfigs.ClusterLayout, "clusters/Badlands"); // TODO: Select at random

                MethodInfo methodInfo = typeof(ColonyDestinationSelectScreen).GetMethod("ShuffleClicked", BindingFlags.NonPublic | BindingFlags.Instance);
                var parameters = new object[] { };
                methodInfo.Invoke(__instance, parameters);

                // see if we can read the full 'seed'
                CustomGameSettings.Instance.GetSettingsCoordinate();
                Debug.Log("Got the seed: " + CustomGameSettings.Instance.GetSettingsCoordinate()); // Confirmed SNDST-A-650071158-0-D3-0

                // Lets click start.
                MethodInfo LaunchClicked = typeof(ColonyDestinationSelectScreen).GetMethod("LaunchClicked", BindingFlags.NonPublic | BindingFlags.Instance);
                LaunchClicked.Invoke(__instance, new object[] { });

            }
        }

        // Click away the starter message
        //[HarmonyPatch(typeof(WattsonMessage), "OnActivate")]
        //public static class ClickAwayWattsonMessage
        //{
        //    public static void Postfix(WattsonMessage __instance)
        //    {
        //        //private KButton button;
        //        //__instance.button.SignalClick(KKeyCode.Mouse2);

        //        var button = Traverse.Create(__instance).Field<KButton>("button").Value;
        //        button.SignalClick(KKeyCode.Mouse2);
        //    }
        //}


        // Here we quit the game after forcing spawnables to spawn, not sure if this is actually needed thanks to the save-parser? Will have to generate the same seed twice to see if it contains the same data.
        //[HarmonyPatch(typeof(WattsonMessage), "OnDeactivate")]
        //public static class QuitGamePt2
        //{
        //    public static void Postfix()
        //    {

        //        foreach (var world in ClusterManager.Instance.m_worldContainers)
        //        {
        //            world.isDiscovered = true;
        //        }


        //        for (int i = 0; i < SaveGame.Instance.worldGenSpawner.spawnables.Count; i++)
        //        {
        //            SaveGame.Instance.worldGenSpawner.spawnables[i].TrySpawn();
        //        }


        //        GameScheduler.Instance.ScheduleNextFrame("collect data", (_) =>
        //        {
        //            ModAssets.AccumulateSeedData();

        //            GameScheduler.Instance.ScheduleNextFrame("restart game", (_) =>
        //            App.instance.Restart());
        //        });
        //    }

        //}

        //Skip duplicant selection, probably a better way to skip even loading the prefabs, but this works for now.

       //[HarmonyPatch(typeof(CharacterSelectionController), "InitializeContainers")]
       // public static class SkipMinionScreen
       // {
       //     public static void Postfix(CharacterSelectionController __instance)
       //     {
       //         // Before we click start, lets check all 3 dupe containers are loaded
       //         //Debug.Log("Checking if all 3 dupe containers are loaded"); 
       //         ////__instance.containers; 
       //         //var containers = Traverse.Create(__instance).Field<List<ITelepadDeliverableContainer>>("containers").Value;
       //         //Debug.Log("Containers: " + containers.Count); // 3

       //         //Debug.Log("Container 1: " + containers[0].GetType()); // ColonyDestinationSelectScreen
       //         //Debug.Log("Container 2: " + containers[1].GetType()); // ColonyDestinationSelectScreen
       //         //Debug.Log("Container 3: " + containers[2].GetType()); // ColonyDestinationSelectScreen



       //         // Lets click start.
       //         MethodInfo methodInfo = typeof(CharacterSelectionController).GetMethod("OnProceed", BindingFlags.NonPublic | BindingFlags.Instance);
       //         var parameters = new object[] { };
       //         methodInfo.Invoke(__instance, parameters);
       //     }
       // }
    }
}
