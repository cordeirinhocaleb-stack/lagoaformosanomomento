import { Client } from "basic-ftp";
import dotenv from "dotenv";
dotenv.config();

async function listFiles(path) {
    const client = new Client();
    try {
        await client.access({
            host: process.env.FTP_HOST,
            user: process.env.FTP_USER,
            password: process.env.FTP_PASSWORD,
            secure: false
        });
        console.log(`\n### Listing: ${path} ###`);
        const list = await client.list(path);
        list.forEach(f => {
            const type = f.type === 1 ? 'FILE' : f.type === 2 ? 'DIR ' : 'UNK ';
            console.log(`[${type}] ${f.name.padEnd(30)} ${f.size}`);
        });
    } catch (err) {
        console.log("Error listing " + path + ":", err);
    }
    client.close();
}

async function run() {
    await listFiles("/");
    await listFiles("/public_html");
}

run();
