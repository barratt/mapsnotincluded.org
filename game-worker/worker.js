require('dotenv').config({ override: true })
const { spawn } = require('child_process');
const os = require('os');
const fs = require('fs');
const { kill } = require('process');
Tail = require("tail").Tail;

// This is a quick script that can handle running multiple instances of ONI, and restarting them if they crash, can be set on a timer and cron to run over-night etc.

const oniDir = process.env.ONI_DIR;

const instances = [];

let isExiting = false;

function runGame(instanceId) {
    // TODO: Support for multiple environments.
    const homeDir = `${os.homedir()}/oni${instanceId}`;

    const oniHomeDir = `${homeDir}/.config/unity3d/Klei/Oxygen Not Included`
    const savesDir = `${oniHomeDir}/save_files`;
    const RetiredColoniesDir = `${oniHomeDir}/RetiredColonies`;

    console.log(`INSTANCEHOME: ${homeDir}`);
    console.log(`ONIHOME: ${oniHomeDir}`);
    console.log(`SAVES: ${savesDir}`);
    console.log(`RETIREDCOLONIES: ${RetiredColoniesDir}`);

    // TODO: Clean up saves and RetiredColonies directories.

    const oniBin = `${oniDir}/OxygenNotIncluded`;
    const envArgs = `HOME=${homeDir} API_URL=${process.env.API_URL} MNI_API_KEY=${process.env.MNI_API_KEY} DISPLAY=${process.env.DISPLAY}`;
    // const args = `--nographics --batchmode --autostart --quit --modded --disable-debugger --disable-stdout --disable-stderr --disable-stdout-stderr --disable-stdout-stderr-logging`;
    const args = ``;

    const fullCommand = `${envArgs} nice -19 ${oniBin} ${args}`; 

    // Remove the unity.lock if it exists
    const unityLock = `${oniHomeDir}/unity.lock`;
    if (fs.existsSync(unityLock)) {
        console.log(`Removing ${unityLock}`);
        fs.unlinkSync(unityLock);
    }

    console.log(`Running: ${fullCommand}`);

    // A log file is generated at oniHomeDir/Player.log lets log it out as well.
    const playerLog = `${oniHomeDir}/Player.log`;
    let proc = spawn(fullCommand, {
        shell: true,
        detached: true,  // Start the process in a new process group
        stdio: ['pipe', 'pipe', 'pipe']
    });

    let tail;
    proc.stdout.once('data', (data) => {
        tail = new Tail(playerLog);
        tail.on("line", function(data) {
            console.log(data);
        });
    });

    proc.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
    });

    proc.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
    });


    proc.on('exit', (code) => {
        console.log(`Game exited with code ${code}`);
        cleanInstance(instanceId);

        if (!isExiting) {
            console.log(`Restarting game`);
            
            setTimeout(() => {
                runGame(homeDir);
            }, 1000);
        }
            
        instances.splice(instances.indexOf(proc), 1);
        if (tail) {
            tail.unwatch();
        }
    });

    instances.push(proc);
}

async function killAllProcesses(err) {
    if (err) {
        console.error(err);
    }
    console.log(`Stopping ${instanceCount} instances`);
    isExiting = true;
    
    instances.forEach(proc => {
        process.kill(-proc.pid, 'SIGKILL');  // Kill the process group
    });

    // Wait for all processes to exit
    let time = 10;
    while (instances.length > 0) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log(`Waiting for ${instances.length} instances to stop`);

        time--;

        if (time <= 0) {
            console.log(`Timeout waiting for instances to stop, exiting`);
            break;
        }
    }

    console.log(`All instances stopped, exiting`);

    process.exit(0);
}

process.on('SIGINT', killAllProcesses);
process.on('SIGTERM', killAllProcesses);
process.on('exit', killAllProcesses);
process.on('uncaughtException', killAllProcesses);

// if (process.argv.length < 4) {
//     console.log("Usage: node worker.js <instanceCount> <timeout>");
//     process.exit(1);
// }

const instanceCount = parseInt(process.argv[2]);
const timeout   = parseInt(process.argv[3]); // seconds to run for 
 
console.log(`Starting ${instanceCount} instances`);
if (timeout > 0) {
    console.log(`Running for ${timeout} seconds`);
    setTimeout(killAllProcesses, timeout * 1000);
}

console.log(`Running ${instanceCount} instances`);
for (let i = 1; i < (instanceCount+1); i++) {
    console.log(`Running instance ${i}`);
    runGame(i);
}

async function cleanInstance(i) {
    // Lets clean up the saves and RetiredColonies directories
    const homeDir = `${os.homedir()}/oni${i}`;
    const oniHomeDir = `${homeDir}/.config/unity3d/Klei/Oxygen Not Included`
    const savesDir = `${oniHomeDir}/save_files`;
    const RetiredColoniesDir = `${oniHomeDir}/RetiredColonies`;

    // Annoyingly we cant delete a save that is in use, so only do this on game exit
    // Clean up the saves directory
    fs.readdir(savesDir, (err, files) => {
        if (err) {
            console.error(err);
            return;
        }

        files.forEach(file => {
            console.log(`Removing save file: ${file}`);
            fs.rmSync(`${savesDir}/${file}`, { recursive: true, force: true });
        });
    });

    // Clean up the RetiredColonies directory
    fs.readdir(RetiredColoniesDir, (err, files) => {
        if (err) {
            console.error(err);
            return;
        }

        files.forEach(file => {
            fs.rmSync(`${savesDir}/${file}`, { recursive: true, force: true });
        });
    });
}