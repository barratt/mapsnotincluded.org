This project is designed to be used in other projects 

If your in nodejs just do a simple require('oniworldgen')
Users of vuejs/react etc should be able to use import oniworldgen

Please note, to use this library, we need the YAML files from ONI. We're not sure if we're allowed to generate these as it comes directly from the game assets. 

To make the process simpler, we have made a script that will automatically search for the YAML files and produce a single JSON document which can be used by the library, either via web requests or file loading.

Simply run scripts/generateTraitData.js and it should generate a wordlgen.json which you can use.


This library currently implements a replica KRandom and a few other helper files to generate worldTraits for ONI.