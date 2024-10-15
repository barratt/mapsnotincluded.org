using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UnityEngine;

namespace _WorldGenStateCapture
{
	internal class MainMenuTimer : MonoBehaviour
	{
		[MyCmpGet] MainMenu menu;

		System.DateTime targetTime = System.DateTime.MinValue;
		System.Action OnTimerEnd = null;
		public void Update()
		{
			if (targetTime == System.DateTime.MinValue)
			{
				return;
			}
			if (System.DateTime.Now > targetTime)
			{
				if (OnTimerEnd != null)
					OnTimerEnd();
				targetTime = System.DateTime.MinValue;
			}
		}
		public void SetTimer(int seconds)
		{
			targetTime = System.DateTime.Now.AddSeconds(seconds);
		}
		public void SetAction(System.Action action)
		{
			OnTimerEnd = action;
		}

		internal void Abort()
		{
			targetTime = System.DateTime.MinValue;
		}
	}
}
