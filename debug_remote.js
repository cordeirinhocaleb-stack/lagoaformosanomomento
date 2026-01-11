
import * as ftp from "basic-ftp"
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

async function debugRemote() {
    const client = new ftp.Client()
    client.ftp.verbose = true
    try {
        await client.access({
            host: process.env.FTP_HOST,
            user: process.env.FTP_USER,
            password: process.env.FTP_PASSWORD,
            secure: false
        })
        console.log("=== LISTANDO RAIZ ===")
        console.log(await client.list("/"))

        console.log("=== LISTANDO public_html ===")
        try {
            console.log(await client.list("/public_html"))
        } catch (e) {
            console.log("Erro ao listar /public_html:", e.message)
        }

    } catch (err) {
        console.error("Erro no debug:", err)
    } finally {
        client.close()
    }
}

debugRemote()
