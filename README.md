Welcome to MapsNotIncluded.org

A fully opensource alternative to [ToolsNotIncluded.net](https://ToolsNotIncluded.net) by [Cairath](https://github.com/Cairath)

Feel free to join us on [Discord](https://discord.gg/3vhCpp6PNq).

## Special thanks to: 

 - [RoboPhred](https://github.com/RoboPhred/oni-save-parser#readme) - Thank you for your  contributions to parsing and understanding ONI saves
 - [Stefan Oltmann](https://stefan-oltmann.de) - Thank you for the web interface to parse ONI saves that was made fully open source, and directly contributing to this project in support and development. 
 - [Sgt_lmalas](https://github.com/Sgt-Imalas/) - Thank you for building an awesome world generation mod, which largely inspired our first version, until you made changes specifically for us, hope we can keep annoying you for more for a long time!
 - [Cairath](https://github.com/Cairath) - Thank you for giving the community such a wonderful tool for years and years with no expectation of payment. We hope one day to collaborate directly together! Also thank you for your administration of the Discord server and for the guides written for modding ONI!
 - To [@pardeike](https://github.com/pardeike), creator of [Harmony](https://github.com/pardeike/Harmony), the library that made modding ONI possible.

## Mod download

You can collect & contribute seeds to the database by downloading and running the mod.

The latest release can be downloaded [here](https://github.com/barratt/mapsnotincluded.org/releases/latest/download/MapsNotIncludedMod.zip).

## Data exports

The database is exported every day at midnight UTC and is available for download [here](https://github.com/StefanOltmann/oni-seed-browser-data/releases).

## Funding

This project is fully open source and free to use, with no restrictions on functionality — now or in the future.

While there's no expectation of payment or donations, we’d love it if you’d consider [contributing](https://mapsnotincluded.org/contribute).

## Structure

The main parts ongoing here are: 
 - Frontend
 - App
 - Mod
 - Ingest Service
 - Hash Service

The 'Frontend' is the 'main' user interface that currently acts as parent to Steps' and Sgt's work - these are currently iframed in. I would recommend implmenting UI changes here if possible, but if not you are welcome to create a project in your own framework flavour which if opensource, we can iframe in as a separate 'module'.

The 'App' is a general NodeJS api, and is for day-to-day api calls such as requesting a seed.

The 'Mod' is what you run on your PC, on Discord we have a few dedicated contributors that run this mod 24/7, it is responsible for automating the Oxygen Not Included worldgen and submitting the resuts to the Ingest Server.

The 'Ingest Service' is again hosted over on Steps' Github, but it is the URL endpoint the Mod will call to submit seeds. This service also currently hosts some APIs for Steps' own user interface. You may find reminants of ingest in the app code that hasn't been removed just yet. 

The 'Hash Service' is used to automate the process of getting Oxygen Not Included hash files, we use this to verify the integrity of the worldgen files with the latest game updates. 

## How will we know the service won't shut down?

While we do not anticipate the service shutting down anytime soon, and we are committed to its continued operation, there is always a small possibility of unforeseen circumstances. My plan is to be fully open and transparent, all of the services will be deployable via Docker and periodic exports of the database will be automatically shared on the Discord and the website. The AGPL license ensures that any modifications or improvements made by anyone in the community are also released publicly. We hope to share them in more places too as it becomes more valuable.

## Coding Standards and Best Practices

This is a hobby project, so anything goes at this stage. Please just ensure your code is somewhat readable, please go for more lines over single lines for readability. Please use widely accepted libraries where possible to maximise those who can contribute, and please try to avoid complex logic flows. This is not enterprise. 

Please ensure all code remains cross-platform for as long as possible. 

### Useful tools

- https://stefan-oltmann.de/oni-save-parser/
- https://stefan-oltmann.de/oni-seed-browser/
