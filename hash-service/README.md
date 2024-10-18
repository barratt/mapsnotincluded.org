This service installs the ONI game from Steam, to use this, first run the container, making sure to setup volume mounts as seen in docker-compose.yml. These persist game data and steam login info.

Start the container manually and connect using /bin/bash, run steamcmd manually and log in providing steamguard authorisation. (If you do not have steamguard, you can skip this and just set the env variables.)

Once you have a successful steam connection, you can now run the container as normal and it will continually pull new versions and generate hashes.