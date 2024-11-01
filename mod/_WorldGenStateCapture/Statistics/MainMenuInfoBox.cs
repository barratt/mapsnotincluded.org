using PeterHan.PLib.Core;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;
using UnityEngine.UI;
using UnityEngine;
using TMPro;

namespace _WorldGenStateCapture.Statistics
{
    internal class MainMenuInfoBox:KMonoBehaviour
    {
        public LocText header;
        public LocText description;

        public void UpdateDescription()
        {
            var text = MNI_Statistics.Instance?.GetMenuText();

            description?.SetText(text);
        }

        public static void InitMainMenuBox(MainMenu __instance)
        {
            var existing = __instance.transform.GetComponentInChildren<MainMenuInfoBox>();
            if (existing != null)
            {
                existing.UpdateDescription();
                return;
            }

            //UIUtils.ListAllChildrenPath(__instance.transform);
            var options = Util.KInstantiateUI<OptionsMenuScreen>(ScreenPrefabs.Instance.OptionsScreen.gameObject);
            Debug.Assert(options);
            if (options == null)
                return;

            var feedbackClone = Util.KInstantiateUI<FeedbackScreen>(options.feedbackScreenPrefab.gameObject);
            Debug.Assert( feedbackClone);
            if (feedbackClone == null)
                return;
            //UIUtils.ListAllChildrenPath(feedbackClone.transform);
            var _infoBox = Util.KInstantiateUI(feedbackClone.transform.Find("Content/GameObject/InfoBox").gameObject);
            Debug.Assert(_infoBox);
            UnityEngine.Object.Destroy(options.gameObject);
            UnityEngine.Object.Destroy(feedbackClone.gameObject);
            if (_infoBox == null)
                return;


            GameObject parent = null; GameObject info = null;
            int height = 298;
            int width = 298;

            RectTransform.Edge verticalEdge = RectTransform.Edge.Top, horizontalEdge = RectTransform.Edge.Left;
            int verticalInset = 250, horizontalInset = 25;


            if (__instance.transform.Find("MainMenuMenubar/BottomRow") != null) ///BASE GAME
            {
                parent = __instance
                    //.transform.Find("MainMenuMenubar/BottomRow"
                    //+"/BottomRow/RightAnchor/MOTD"
                    //)
                    .gameObject;
                info = Util.KInstantiateUI(_infoBox, parent, true);
                //var rect = info.rectTransform();
                //rect.SetInsetAndSizeFromParentEdge(RectTransform.Edge.Bottom, 250, height);
                //rect.SetInsetAndSizeFromParentEdge(RectTransform.Edge.Right, 25, 295);
                verticalEdge = RectTransform.Edge.Bottom;
                horizontalEdge = RectTransform.Edge.Right;
                verticalInset = 245;
                horizontalInset = 25;
            }
            else if (__instance.transform.Find("UI Group") != null) ///SPACED OUT
            {
                parent = __instance.transform.Find("UI Group").gameObject;
                info = Util.KInstantiateUI(_infoBox, parent, true);
                verticalEdge = RectTransform.Edge.Top;
                horizontalEdge = RectTransform.Edge.Left;
                //rect.SetInsetAndSizeFromParentEdge(RectTransform.Edge.Top, 25, height);
                //rect.SetInsetAndSizeFromParentEdge(RectTransform.Edge.Left, 325, 295);
                verticalInset = 25;
                horizontalInset = 325;
            }
            if (info != null)
            {
                info.name = "MNI_Statistics";
                var infobox = info.AddOrGet<MainMenuInfoBox>();
                if (info.transform.Find("Header").gameObject.TryGetComponent<LocText>(out var header))
                {
                    header.text = ColorText(STRINGS.MNI_STATISTICS.TITLE, "ffb300");
                    header.alignment = TMPro.TextAlignmentOptions.Center;
                    infobox.header = header;
                    header.FindOrAddComponent<Outline>().effectDistance = new(2,2);
                }
                var text = info.transform.Find("Description");
                if (text.gameObject.TryGetComponent<LocText>(out var desc))
                {
                    infobox.description = desc;
                    desc.fontSize = 20;


                    infobox.UpdateDescription();
                }
                if (info.transform.Find("BG"))
                {
                    info.transform.Find("BG").FindOrAddComponent<Outline>().effectDistance = new(1.1f, 1.1f);
                }
                RectTransform rect = info.rectTransform();

                rect.SetInsetAndSizeFromParentEdge(horizontalEdge, horizontalInset, width);
                rect.SetInsetAndSizeFromParentEdge(verticalEdge, verticalInset, height);
            }
        }
        public static string ColorText(string text, string hex)
        {
            hex = hex.Replace("#", string.Empty);
            return "<color=#" + hex + ">" + text + "</color>";
        }
        public static string ColorText(string text, Color color)
        {
            return ColorText(text, Util.ToHexString(color));
        }
    }
}
