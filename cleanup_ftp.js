import { Client } from "basic-ftp";
import dotenv from "dotenv";
dotenv.config();

async function cleanup() {
    const client = new Client();
    try {
        await client.access({
            host: process.env.FTP_HOST,
            user: process.env.FTP_USER,
            password: process.env.FTP_PASSWORD,
            secure: false
        });

        console.log("Starting cleanup of misplaced files in root...");

        const filesToRemove = ["index.html", "vite.svg"];
        for (const file of filesToRemove) {
            try {
                await client.remove(file);
                console.log(`Removed file: ${file}`);
            } catch (e) {
                console.warn(`Could not remove ${file}: ${e.message}`);
            }
        }

        try {
            await client.removeDir("assets");
            console.log("Removed misplaced assets directory");
        } catch (e) {
            console.warn(`Could not remove assets dir: ${e.message}`);
        }

        console.log("Cleanup complete.");
    } catch (err) {
        console.error("Cleanup error:", err);
    }
    client.close();
}

cleanup();
