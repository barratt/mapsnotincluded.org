using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AutomaticWorldGeneration
{
    public class Utils
    {
           
        public static async Task DoWithDelay(System.Action task, int ms)
        {
            await Task.Delay(ms);
            task.Invoke();
        }
    }
}
