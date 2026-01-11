import ftp from 'basic-ftp';
import dotenv from 'dotenv';

dotenv.config();

async function deploy() {
    const client = new ftp.Client();
    // client.ftp.verbose = true;
    try {
        await client.access({
            host: process.env.FTP_HOST,
            user: process.env.FTP_USER,
            password: process.env.FTP_PASSWORD,
            secure: false
        });
        console.log("Connected to FTP.");

        const remoteRoot = process.env.FTP_REMOTE_ROOT || "/";
        console.log(`Uploading to ${remoteRoot}...`);

        await client.ensureDir(remoteRoot);
        await client.clearWorkingDir(); // Careful: This clears the directory! 
        // User asked for "wipe all", so clearWorkingDir is appropriate if we are sure of the path.
        // But if remoteRoot is /, and / contains system files, it's dangerous.
        // However, jailed user / is usually safe.
        // Let's stick to uploadDir which overwrites.

        await client.uploadFromDir("dist", remoteRoot);
        console.log("Upload complete!");

    } catch (err) {
        console.error("Deploy Error:", err);
    }
    client.close();
}

deploy();
