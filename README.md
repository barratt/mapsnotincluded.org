Welcome to MapsNotIncluded.org

A fully opensource alternative to [ToolsNotIncluded.net](ToolsNotIncluded.net) by [Cairath](https://github.com/Cairath)


## Special thanks to: 
 - [RoboPhred](https://github.com/RoboPhred/oni-save-parser#readme) - Thank you for your  contributions to parsing and understanding ONI saves
 - [Stefan Oltmann](https://stefan-oltmann.de) - Thank you for the web interface to parse ONI saves that was made fully open source
 - [Cairath](https://github.com/Cairath) - Thank you for giving the community such a wonderful tool for years and years with no expectation of payment. We hope one day to collaborate directly together! Also thank you for your administration of the Discord server and for the guides written for modding ONI!
 - To [@pardeike](https://github.com/pardeike), creator of [Harmony](https://github.com/pardeike/Harmony), the library that made modding ONI possible. 

# Getting Started

This project is still in its infantsy, if you'd like to contribute please either: Raise an issue, submit a PR or join our [Discord](https://discord.gg/3vhCpp6PNq)

## Structure
There are 3 main projects ongoing here: 
 - Frontend
 - App
 - Mod

 At present none are started, but here is the general idea. This readme will be updated with time.

### Frontend
This is the web interface we all interact with, written in VueJS 3 (with Vite) and using Bootstrap as a base framework. 

### App
The app supports the frontend, it allows querying between the UI and the database. The app also supports the data storage of the saves.

### Mod
The mod is installed into the ONI game which generates new saves and uplaods them for processing. 


## Funding 
This project is completely open source and free, there is no expected payment or donations. In future donations may be accepted to support server costs but the full functionality will be unrestricted forever. 

## How will we know the service wont shut down?
It might! My plan is to be fully open and transparent, all of the services will be deployable via Docker and periodic exports of the database will be automatcally shared on the discord, and the website, we hope to share them in more places too as it becomes more valuable

## Coding Standards and Best Practices
This is a hubby project, so anything goes at this stage. Please just ensure your code is somewhat readable, please go for more lines over single lines for readability. Please use widely accepted libraries where possible to maximise those who can contribute, please try to avoid complex logic flows. This is not enterprise. 

Please ensure all code remains cross-platform for as long as possible. 

### Useful tools
- https://stefan-oltmann.de/oni-save-parser/
