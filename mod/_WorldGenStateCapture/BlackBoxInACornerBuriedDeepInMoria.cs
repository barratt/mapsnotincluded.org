using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MapsNotIncluded_WorldParser
{
    /// <summary>
    /// May the dwarves never dig too deep to uncover this...
    /// </summary>
    internal class BlackBoxInACornerBuriedDeepInMoria
    {
        /// <summary>
        /// these have to be remapped for the server "because they look weird" 
        /// whatever.
        /// method is not required for the server to function if you dont remap the Ids severside
        /// </summary>
        /// <param name="semiConsistentKleiDlcIds"></param>
        /// <returns></returns>
        public static List<string> GiveWeirdRemappedDlcIds(List<string> semiConsistentKleiDlcIds)
        {

            List<string> weirdIdNameThings = new List<string>(semiConsistentKleiDlcIds.Count);
            foreach (var semiConsistentKleiDlcId in semiConsistentKleiDlcIds)
            {
                switch (semiConsistentKleiDlcId)
                {
                    case DlcManager.VANILLA_ID:
                        weirdIdNameThings.Add("BaseGame");
                        break;
                    case DlcManager.EXPANSION1_ID:
                        weirdIdNameThings.Add("SpacedOut");
                        break;
                    case DlcManager.DLC2_ID:
                        weirdIdNameThings.Add("FrostyPlanet");
                        break;
					case DlcManager.DLC3_ID: //bionic booster pack doesnt have any form of woldgen manipulation and isnt part of the backend
						weirdIdNameThings.Add("BionicBooster");
						break;
					case DlcManager.DLC4_ID:
						weirdIdNameThings.Add("PrehistoricPlanet");
						break;
					default:
                        weirdIdNameThings.Add(semiConsistentKleiDlcId); // If it's not a known ID, keep it as is
                        break;
                }
            }
            return weirdIdNameThings;
        }
    }
}
