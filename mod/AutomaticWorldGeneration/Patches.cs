using ClipperLib;
using HarmonyLib;
using Klei.CustomSettings;
using KMod;
using ProcGen;
using ProcGenGame;
using STRINGS;
using System;
using System.Collections.Generic;
using System.Reflection;
using System.Runtime.CompilerServices;
using System.Threading.Tasks;
using YamlDotNet.Core;
using static ProcGen.ClusterLayout;

namespace AutomaticWorldGeneration
{
    public class Patches
    {
        static async Task DoWithDelay(System.Action task, int ms)
        {
            await Task.Delay(ms);
            task.Invoke();
        }

        public static MinionSelectScreen minionSelectScreen;
        
        [HarmonyPatch(typeof(Db), "Initialize")]
        public class Db_Initialize_Patch
        {


            public static void Prefix()
            {
                Debug.Log("AutomaticWorldGeneration - Init Mod!");
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
                Debug.Log("AutomaticWorldGeneration - I execute after Db.Initialize!");
            }
        }


        [HarmonyPatch(typeof(Cluster))]
        [HarmonyPatch("Generate")]
        public class Generate_Patch
        {
            public static void Prefix()
            {
                Debug.Log("AutomaticWorldGenerationn - Starting generation of new World!");

            }

            public static void Postfix()
            {
                Debug.Log("AutomaticWorldGeneration - I execute after Db.Initialize!");
            }
        }

        [HarmonyPatch(typeof(MainMenu))]
        [HarmonyPatch("OnSpawn")]
        public class MainMenu_OnSpawn_Patch
        {
            public static void Prefix()
            {
                Debug.Log("AutomaticWorldGeneration - MainMenu - OnSpawn!");
            }

            public static void Postfix(MainMenu __instance)
            {
                Debug.Log("AutomaticWorldGeneration - MainMenu - OnSpawn! Ran");
                var mainMenu = MainMenu.Instance;

                WorldGen.WaitForPendingLoadSettings(); // World gen has a lot of what we need, but we need to find the instance of it.
                CustomGameSettings.Instance.LoadClusters();

                // Lets dump all the clusters and their targetPath
                SettingsCache.GetClusterNames().ForEach((cluster) =>
                {
                    Debug.Log("AutomaticWorldGeneration - Cluster: " + cluster);
                    var data = SettingsCache.clusterLayouts.GetClusterData(cluster);
                    Debug.Log("AutomaticWorldGeneration - TargetPath: " + data.filePath);
                });

                // This is getting silly, give the mainmeu some time to load
                //DoWithDelay(() =>
                //{
                    var flow = mainMenu.GetComponent<NewGameFlow>();
                    flow.BeginFlow();
                //}, 1000);
            }
        }


        [HarmonyPatch(typeof(ClusterCategorySelectionScreen), "OnSpawn")]
        public static class SelectClusterType
        {
            public static void Postfix(ClusterCategorySelectionScreen __instance)
            {
                Debug.Log("AutomaticWorldGeneration - Selecting Cluster Type");
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
                Debug.Log("AutomaticWorldGeneration - Selecting Survival Settings");
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
                Debug.Log("AutomaticWorldGeneration - Selecting Colony Destination");

                var clusters = SettingsCache.GetClusterNames();
                var randomCluster = clusters[UnityEngine.Random.Range(0, clusters.Count)];



                var newGameSettingsPanel = Traverse.Create(__instance).Field<NewGameSettingsPanel>("newGameSettingsPanel").Value;
                MethodInfo setGameSettings = typeof(NewGameSettingsPanel).GetMethod("SetSetting", BindingFlags.NonPublic | BindingFlags.Instance);

                //newGameSettingsPanel.SetSetting(CustomGameSettingConfigs.WorldgenSeed, "SNDST-A-650071158-0-D3-0");
                CustomGameSettings.Instance.SetQualitySetting(CustomGameSettingConfigs.SaveToCloud, "Disabled");
                //CustomGameSettings.Instance.SetQualitySetting(CustomGameSettingConfigs.WorldgenSeed, "SNDST-A-650071158-0-D3-0"); // A future worker mod perhaps?
                CustomGameSettings.Instance.SetQualitySetting(CustomGameSettingConfigs.ClusterLayout, randomCluster); // TODO: Select at random
               

                MethodInfo methodInfo = typeof(ColonyDestinationSelectScreen).GetMethod("ShuffleClicked", BindingFlags.NonPublic | BindingFlags.Instance);
                var parameters = new object[] { };
                methodInfo.Invoke(__instance, parameters);

                // see if we can read the full 'seed'
                CustomGameSettings.Instance.GetSettingsCoordinate();
                Debug.Log("AutomaticWorldGeneration - Got the seed: " + CustomGameSettings.Instance.GetSettingsCoordinate()); // Confirmed SNDST-A-650071158-0-D3-0

                // Lets click start.
                MethodInfo LaunchClicked = typeof(ColonyDestinationSelectScreen).GetMethod("LaunchClicked", BindingFlags.NonPublic | BindingFlags.Instance);
                LaunchClicked.Invoke(__instance, new object[] { });

                Debug.Log("AutomaticWorldGeneration - Colony Destination Selected");
            }
        }

         //KCrashReporter - ReportError
         // TODO: Hook into the crash reporter class, so if there is a major crash, we can restart the game.
        //[HarmonyPatch(typeof(KCrashReporter), "ReportError")]
        //public static class KCrashReporter_ReportError
        //{
        //    public static void Postfix(KCrashReporter __instance, string error)
        //    {
        //        Debug.Log("AutomaticWorldGeneration - KCrashReporter Error: " + error);
        //        App.instance.Restart();
        //    }
        //}

        //OfflineWorldGen DisplayErrors - This is a bit of a hack, but it works for now.
        //WorldGen ReportWorldGenError
        [HarmonyPatch(typeof(WorldGen), "ReportWorldGenError")]
        public static class DisplayErrors
        {
            public static void Postfix(WorldGen __instance, Exception e, string errorMessage = null)
            {
                Debug.Log("AutomaticWorldGeneration - WorldGen Error: " + errorMessage);
                Debug.Log("AutomaticWorldGeneration - WorldGen Exception: " + e.Message);
                // Lets click the ok button.
                //var okButton = Traverse.Create(__instance).Field<KButton>("okButton").Value;
                //okButton.SignalClick(KKeyCode.Mouse0);

                // TODO: Report the seed as bad

                // Lets restart the game.
                App.instance.Restart();
            }
        }

        // Click away the starter message
        [HarmonyPatch(typeof(WattsonMessage), "OnActivate")]
        public static class ClickAwayWattsonMessage
        {
            public static void Postfix(WattsonMessage __instance)
            {
                //private KButton button;
                //__instance.button.SignalClick(KKeyCode.Mouse2);
                Debug.Log("AutomaticWorldGeneration - WattsonMessage OnActivate");
                var button = Traverse.Create(__instance).Field<KButton>("button").Value;
                button.SignalClick(KKeyCode.Mouse2);
            }
        }


        //Here we quit the game after forcing spawnables to spawn, noDoWithDelayt sure if this is actually needed thanks to the save-parser? Will have to generate the same seed twice to see if it contains the same data.

        // Wonder if there is a better thing to attach to that represents the end of the world gen process and minions spawned.
        [HarmonyPatch(typeof(WattsonMessage), "OnDeactivate")]
        public static class QuitGamePt2
        {

            public static void Postfix()
            {
                Debug.Log("AutomaticWorldGeneration - WattsonMessage OnDeactivate");

                foreach (var world in ClusterManager.Instance.WorldContainers)
                {
                    world.SetDiscovered(true);
                }

                var spawnables = SaveGame.Instance.worldGenSpawner.GetSpawnables();
                foreach (var spawnable in spawnables)
                {
                    spawnable.TrySpawn();
                }


                GameScheduler.Instance.ScheduleNextFrame("Collect Seed Data", (_) =>
                {
                    // TODO: Send data to server.

                    GameScheduler.Instance.ScheduleNextFrame("Restart", (__) =>
                    {
                        Debug.Log("AutomaticWorldGeneration - Restarting Game");

                        //App.instance.Restart();
                        //LoadScreen.ForceStopGame();

                        // Not sure if the loadscene causes this but now we're getting the following after about 5 word gens - seems to be random.
                        //AutomaticWorldGeneration - Clicking Embark
                        //[ERROR] NewBaseScreen ~~~!System.NullReferenceException: Object reference not set to an instance of an object
                        //at NewBaseScreen.SpawnMinions(System.Int32 headquartersCell)[0x000c7] in < 043309e6f0914d9f9e207a782760f195 >:0
                        //at NewBaseScreen.Final()[0x0002f] in < 043309e6f0914d9f9e207a782760f195 >:0
                        //at NewBaseScreen.OnActivate()[0x0004e] in < 043309e6f0914d9f9e207a782760f195 >:0

                        // I think this is due to the minions not 'initializing' properly, so we need to wait for them to be ready.
                        // However, this doesn't happen when fully restarting the game, so maybe not?

                        // instead of restarting, lets get back to the main menu
                        //PauseScreen.TriggerQuitGame();
                        // Not sure how to do this yet, bring up pause menu by sending escape key?
                           

                        // Wait for a little bit of initiization time.
                        DoWithDelay(() =>
                        {
                            Debug.Log("AutomaticWorldGeneration - LoadScreen ");
                            LoadScreen.ForceStopGame();
                            Debug.Log("AutomaticWorldGeneration - AppLoadScene");
                            App.LoadScene("frontend");
                            Debug.Log("AutomaticWorldGeneration - AppLoadScene Done");
                        }, 1000);
                    });
                });
            }
        }

        [HarmonyPatch(typeof(BaseNaming), "GenerateBaseNameString")]
        public static class SkipBaseNaming
        {
            public static bool Prefix(ref string __result)
            {
                Debug.Log("AutomaticWorldGeneration - BaseNaming GenerateBaseNameString");
                var seed = CustomGameSettings.Instance.GetSettingsCoordinate();
                __result = seed;
                return false;
            }
        }

        //Skip duplicant selection, probably a better way to skip even loading the prefabs, but this works for now.
        [HarmonyPatch(typeof(MinionSelectScreen), "OnSpawn")]
        public static class SkipMinionScreen
        {


            public static void Postfix(MinionSelectScreen __instance)
            {
                Debug.Log("AutomaticWorldGeneration - MinionSelectScreen OnSpawn");

                minionSelectScreen = __instance; // This lets us capture an instance of the screen to click the embark button later.

                // Before we click start, lets check all 3 dupe containers are loaded
                //Debug.Log("Checking if all 3 dupe containers are loaded"); 
                ////__instance.containers; 
                //var containers = Traverse.Create(__instance).Field<List<ITelepadDeliverableContainer>>("containers").Value;
                //Debug.Log("Containers: " + containers.Count); // 3

                //Debug.Log("Container 1: " + containers[0].GetType()); // ColonyDestinationSelectScreen
                //Debug.Log("Container 2: " + containers[1].GetType()); // ColonyDestinationSelectScreen
                //Debug.Log("Container 3: " + containers[2].GetType()); // ColonyDestinationSelectScreen


                // we use a time here, but really we need to figure out the correct way to wait for all the minions to initialize.
                // Schedule doesnt seem to work actually

                //GameScheduler.Instance.ScheduleNextFrame("__", (__) =>
                //GameScheduler.Instance.ScheduleNextFrame("Click Embark", (_) =>
                //{
                //    Debug.Log("AutomaticWorldGeneration - Clicking Embark");
                //    // On this screen is where we can set the world name, I'd like to set it to the seed.

                //    //var worldNameInput = Traverse.Create(__instance).Field<KInputField>("worldNameInput").Value;
                //    //worldNameInput.SetDisplayValue(CustomGameSettings.Instance.GetSettingsCoordinate());
                //    //CustomGameSettg

                //    // Lets click embark - this is now erroring?
                //    MethodInfo methodInfo = typeof(MinionSelectScreen).GetMethod("OnProceed", BindingFlags.NonPublic | BindingFlags.Instance);
                //    var parameters = new object[] { };
                //    methodInfo.Invoke(__instance, parameters);
                //}));

                DoWithDelay(() =>
                {
                    Debug.Log("AutomaticWorldGeneration - Clicking Embark");
                    MethodInfo methodInfo = typeof(MinionSelectScreen).GetMethod("OnProceed", BindingFlags.NonPublic | BindingFlags.Instance);
                    var parameters = new object[] { };
                    methodInfo.Invoke(__instance, parameters);
                }, 1000);
            }
        }

        [HarmonyPatch(typeof(CharacterSelectionController), "EnableProceedButton")]
        public static class SkipCharacterSelection
        {
            public static void Postfix(CharacterSelectionController __instance)
            {
                Debug.Log("AutomaticWorldGeneration - CharacterSelectionController EnableProceedButton");

                // minonSelectScreen is null here? would have expected enable to be called after.

                //MethodInfo methodInfo = typeof(MinionSelectScreen).GetMethod("OnProceed", BindingFlags.NonPublic | BindingFlags.Instance);
                //var parameters = new object[] { };
                //methodInfo.Invoke(minionSelectScreen, parameters);

            }
        }


        //[HarmonyPatch(typeof(GameUtil), "GenerateRandomWorldName")]
        //public static class GenerateRandomWorldName
        //{
        //    public static bool Prefix(ref string __result, String[] nameTables)
        //    {
        //        Debug.Log("AutomaticWorldGeneration - GenerateRandomWorldName");
        //        __result = CustomGameSettings.Instance.GetSettingsCoordinate();

        //        return true;
        //    }
        //}
    }
}
