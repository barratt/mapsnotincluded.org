const { spawn }     = require('child_process');
const express       = require('express');
const compression   = require('compression');
const cors          = require('cors');
const readdir       = require('recursive-readdir');
const sha256File    = require('sha256-file');
const fs            = require('fs');

const app = express();
const port = process.env.PORT || 3000;

app.use(compression());
app.use(cors());

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.json({
        message: 'MNI Hash service'
    })
});

const installPath       = process.env.INSTALL_PATH || '/oni';
const appId             = process.env.APP_ID || '457140';

const steamUsername     = process.env.STEAM_USERNAME;
const steamPassword     = process.env.STEAM_PASSWORD;
const steamGuardCode    = process.env.STEAM_GUARD_CODE;

// Function to run SteamCMD with +help and +quit
async function runSteamCMD(args) {
    // We have it like this using spawn so that we can easily adjust it later to use streams and whatnot for progress updates.
    return new Promise((res, rej) => {
        const steamcmd = spawn('steamcmd', args);
        console.log(`Running SteamCMD with args: ${args.join(' ')}`);
        // When it gets to Logging in user '<username>' [U:1:0] to Steam Public... it prompts your phone

        let stdout = "";
        let stderr = "";

        steamcmd.stdout.on('data', (data) => {
            let line = data.toString();
            console.log(line);
            
            if (line.indexOf("Enter the current code") > -1) {
                if (steamGuardCode) {
                    console.log(`Sending Steam Guard Code: ${steamGuardCode}`);
                    steamcmd.stdin.write(steamGuardCode + "\n");
                } else {
                    console.log("Steam Guard Code required but not provided. Exiting.");
                    steamcmd.kill();
                }
            }
        });

        // Capture and print the standard error output from steamcmd
        steamcmd.stderr.on('data', (data) => {
            stderr += data.toString() + "\n";
            console.error(data.toString());
        });

        // Handle the process exit event
        steamcmd.on('close', (code) => {
            return res({ stderr, stdout, code });
        });

        // Handle the process error event
        steamcmd.on('error', (err) => {
            return rej(err);
        });
    });
}

async function generateHashes() {
    // Walk the /oni directory, generating SHA256 for each file.
    // Dump to a json file in __dirname/public

    const files = await readdir(installPath);
    console.log(`Found ${files.length} files in ${installPath}`);

    const hashes = {};
    for (let file of files) {
        const hash = await sha256File(file);
        hashes[file.replace(installPath, '')] = hash;
    }

    return hashes;
}

// Call the function to run SteamCMD
// Call again for windows using +@sSteamCmdForcePlatformType windows 
// Call again for linux using +@sSteamCmdForcePlatformType linux
// Call again for mac using +@sSteamCmdForcePlatformType osx

// Call again for each of the DLCs installed

console.log(`Running SteamCMD as ${process.env.STEAM_USERNAME}`);
let args = [];
args.push("+force_install_dir", installPath)

if (steamPassword) {
    console.log("Using provided credentials");
    console.log(steamPassword)
    args.push("+login", steamUsername, steamPassword);
} else {
    console.log("Using cached credentials");
    args.push("+login", steamUsername);
}

// args.push("+@sSteamCmdForcePlatformType", "windows");
args.push("+app_update", appId);
args.push("+quit")


async function update() {
    const platform = process.platform; 

    console.log(`Installing ONI, default OS (${platform}), vanilla`);
    await runSteamCMD(args);
    console.log(`ONI Should be installed. Unless steam failed (we do not check, yet)`);
    console.log(`Generating hashes`);
    const hashes = await generateHashes();
    fs.writeFileSync(`${__dirname}/public/${platform}-hashes.json`, JSON.stringify(hashes, null, 2));
    console.log(`Hashes generated`);

}

// TODO: Add an endpoint to login to steam and enter a steamcode 
// These endpoints are mostly for debugging and testing purposes

app.get('/update', async (req, res) => {
    update();
});

app.get('/hash', async (req, res) => {
    let hashes = await generateHashes();
    res.json({ message: 'Hashes generated', platform: process.platform, hashes });
});

app.get('/steamupdate', async (req, res) => {
    await runSteamCMD(args);
    res.json({ message: 'Steam update complete' });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});