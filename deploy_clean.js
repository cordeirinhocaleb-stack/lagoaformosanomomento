import FtpDeploy from 'ftp-deploy';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env') });

const ftpDeploy = new FtpDeploy();

const config = {
    user: process.env.FTP_USER,
    password: process.env.FTP_PASSWORD,
    host: process.env.FTP_HOST,
    port: 21,
    localRoot: path.join(__dirname, 'out'),
    remoteRoot: process.env.FTP_REMOTE_ROOT || '/public_html/',
    include: ['*', '**/*'],
    exclude: ['**/*.map', 'node_modules/**', '.git/**'],
    deleteRemote: true, // LIMPAR ARQUIVOS ANTIGOS DO VITE
    forcePasv: true,
    sftp: false
};

console.log('🧹 Limpando arquivos antigos e fazendo deploy limpo...');
console.log(`📡 Host: ${config.host}`);
console.log(`📂 Remote Root: ${config.remoteRoot}`);
console.log('⚠️  ATENÇÃO: deleteRemote está ATIVADO - isso vai remover arquivos antigos!');

ftpDeploy
    .deploy(config)
    .then((res) => {
        console.log('✅ Deploy limpo finalizado com sucesso!');
        console.log('📦 Arquivos enviados:', res.length);
    })
    .catch((err) => {
        console.error('❌ Erro no deploy:', err);
        process.exit(1);
    });
