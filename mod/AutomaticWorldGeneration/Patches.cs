using ClipperLib;
using HarmonyLib;
using Klei.CustomSettings;
using KMod;
using ProcGen;
using ProcGenGame;
using STRINGS;
using System;
using System.Collections.Generic;
using System.IO;
using System.Reflection;
using System.Runtime.CompilerServices;
using System.Threading.Tasks;
using UnityEngine;
using YamlDotNet.Core;
using static ProcGen.ClusterLayout;
using static STRINGS.UI;

// Please, experienced ONI mod makers, help me!
namespace AutomaticWorldGeneration
{
    public class Patches
    {
        public static MinionSelectScreen minionSelectScreen;

        public static WorldGen.OfflineCallbackFunction offlineCB;
        public static bool OfflineCB(StringKey stringKeyRoot, float completePercent, WorldGenProgressStages.Stages stage)
        {
            Debug.Log("AutomaticWorldGeneration - OfflineCB");
            return true;
        }
        
        [HarmonyPatch(typeof(Db), "Initialize")]
        public class Db_Initialize_Patch
        {
            public static void Prefix()
            {
                Debug.Log("AutomaticWorldGeneration - Init Mod!");
                //PlayerSettings.forceSingleInstance = false;

                // This was a bit of a test to see if we could generate a world without messing with the UI.
                //List<string> storyTraits = new List<string>();
                //int seed = 1;

                //var cluster = new Cluster("Test", seed, storyTraits, false, false, false);

                //cluster.Generate(new WorldGen.OfflineCallbackFunction(offlineCB, (err) =>
                //{
                //    Debug.Log("AutomaticWorldGeneration - Error: " + err);
                //}, seed, seed, seed, seed);
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

                // TODO: If this is a mod distributed to users, we should wait to let them turn the mod off for maybe 30 seconds? Or let them do x worlds then stop

                WorldGen.WaitForPendingLoadSettings(); // World gen has a lot of what we need, but we need to find the instance of it.
                CustomGameSettings.Instance.LoadClusters();

                // Lets dump all the clusters and their targetPath
                SettingsCache.GetClusterNames().ForEach((cluster) =>
                {
                    Debug.Log("AutomaticWorldGeneration - Cluster: " + cluster);
                    var data = SettingsCache.clusterLayouts.GetClusterData(cluster);
                    Debug.Log("AutomaticWorldGeneration - TargetPath: " + data.filePath);
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


        // This gives me an idea, what if we can use customgamesettings and just immediately gen a world :)
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
        [HarmonyPatch(typeof(KCrashReporter), "ReportError")]
        public static class KCrashReporter_ReportError
        {
            public static void Postfix(KCrashReporter __instance, string msg, string stack_trace, ConfirmDialogScreen confirm_prefab, GameObject confirm_parent, string userMessage = "", bool includeSaveFile = true, string[] extraCategories = null, string[] extraFiles = null)
            {
                
                Debug.Log("AutomaticWorldGeneration - KCrashReporter Error: " + msg);
                App.Quit();
            }
        }

        //OfflineWorldGen DisplayErrors - This is a bit of a hack, but it works for now.
        //WorldGen ReportWorldGenError
        [HarmonyPatch(typeof(WorldGen), "ReportWorldGenError")]
        public static class DisplayErrors
        {
            public static void Postfix(WorldGen __instance, Exception e, string errorMessage = null)
            {
                Debug.Log("AutomaticWorldGeneration - WorldGen Error: " + errorMessage);
                Debug.Log("AutomaticWorldGeneration - WorldGen Exception: " + e.Message);

                // This generally happens when a seed is bad and can never be used, (we get a popup that says not all seeds germinate...)

                // TODO: Report the seed as bad
                string seed = CustomGameSettings.Instance.GetSettingsCoordinate();
                MapsNotIncluded.ReportBadSeed(seed);

                // Lets restart the game.
                App.Quit();
            }
        }

        // Click away the starter message
        [HarmonyPatch(typeof(WattsonMessage), "OnActivate")]
        public static class ClickAwayWattsonMessage
        {
            public static void Postfix(WattsonMessage __instance)
            {
                Debug.Log("AutomaticWorldGeneration - WattsonMessage OnActivate");
                var button = Traverse.Create(__instance).Field<KButton>("button").Value;
                button.SignalClick(KKeyCode.Mouse2);
            }
        }


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

                // Remove all fog
                foreach (var world in ClusterManager.Instance.WorldContainers)
                {
                    world.SetDiscovered(true);
                }

                var cells = Grid.CellCount;
                for (int i = 0; i < cells; i++)
                {
                    Grid.Reveal(i);
                }

                SaveLoader.Instance.InitialSave(); // Without this, the world gets saved later on. By using this the save exists immeiately.
                string filename = SaveLoader.GetActiveSaveFilePath(); // is full path
                bool exists = File.Exists(filename);
                Debug.Log("AutomaticWorldGeneration - Save file " + filename + " exists: " + exists);

                var saveData = File.ReadAllBytes(filename);

                GameScheduler.Instance.ScheduleNextFrame("Collect Seed Data", (_) =>
                {
                    string seed = CustomGameSettings.Instance.GetSettingsCoordinate();
                    List<string> worldTraits = GameCapture.GetWorldTraits();
                    List<Models.Geyser> geysers = GameCapture.GetGeyserTraits();
         
                    Debug.Log("Found " + geysers.Count + " geysers");


                    MapsNotIncluded.SendData(CustomGameSettings.Instance.GetSettingsCoordinate(), worldTraits, geysers, saveData);

                    GameScheduler.Instance.ScheduleNextFrame("Restart", (__) =>
                    {
                        Debug.Log("AutomaticWorldGeneration - Restarting Game");
                        //App.Quit();

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
                        Utils.DoWithDelay(() =>
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
                Utils.DoWithDelay(() =>
                {
                    Debug.Log("AutomaticWorldGeneration - Clicking Embark");
                    MethodInfo methodInfo = typeof(MinionSelectScreen).GetMethod("OnProceed", BindingFlags.NonPublic | BindingFlags.Instance);
                    var parameters = new object[] { };
                    methodInfo.Invoke(__instance, parameters);
                }, 1000);
            }
        }


        // Here we attempted to skip some scenes
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

        // Sometimes the game crashes when spawning duplicants, whether this is due to where the HQ is or the 'ANewHope' delay, I'm not sure, but maybe if we skip the duplicants spawning it will go away? It's not like we need them...
        [HarmonyPatch(typeof(NewBaseScreen), "SpawnMinions")]
        public static class SpawnMinionsSkip
        {
            public static bool Prefix(int headquartersCell)
            {
                return true;
            }
        }
    }
}
