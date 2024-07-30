To build, run is vs studio (or equivalent), copy missing deps from ONI managed data, run build as release, copy created dll, and both yaml files to Oni/mods/Dev/AutomaticWorldGeneration


I'm not planning on fixing the crash errors for this project at present.

There are currently two methods:
 - Restart the entire game
 - Get back to the main menu somehow.

For now I am using the second approach as it is much, much faster (skips the game loading part) however it is prone to crashing. I'm not sure I'll ever be able to get it to work 100% of the time, at present I am using ignorecrashreporter.txt and an external auto-restart script, as its just me. If we do distribute this on the steam workshop, we will either need to fix this or use the restart method.

This works if on Vanilla however there is a bug when enabling DLCs