using HarmonyLib;
using KMod;
using PeterHan.PLib.Core;
using PeterHan.PLib.Options;
using System.Collections.Generic;

namespace _WorldGenStateCapture
{
	public class Mod : UserMod2
	{
		public override void OnLoad(Harmony harmony)
		{
			PUtil.InitLibrary(false);
			new POptions().RegisterOptions(this, typeof(Config));
			base.OnLoad(harmony);
			harmonyInstance = harmony;
			Debug.Log($"{mod.staticID} - Mod Version: {mod.packagedModInfo.version} ");

			Debug.Log("Initializing MNI statistics..");
			MNI_Statistics.OnGameInitialisation();
			Debug.Log("MNI statistics initialized.");
		}
		public static Harmony harmonyInstance;

		public override void OnAllModsLoaded(Harmony harmony, IReadOnlyList<KMod.Mod> mods)
		{
			base.OnAllModsLoaded(harmony, mods);
			IntegrityCheck.CheckModVersion();
			foreach (var mod in mods)
			{
				if (mod.IsEnabledForActiveDlc() && mod != this.mod 
					&& mod.staticID != "PeterHan.ModUpdateDate" //mod updater
					&& mod.staticID != "SaveGameModLoader") //mod profile manager
				{
					//another mod than this is active, abort all actions
					ModAssets.ModDilution = true;
					break;
				}
			}
		}
	}
}
