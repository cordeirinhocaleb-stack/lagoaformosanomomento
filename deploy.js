import FtpDeploy from 'ftp-deploy';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carregar variáveis de ambiente baseadas no argumento --env
const args = process.argv.slice(2);
const envArg = args.find(arg => arg.startsWith('--env='));
const env = envArg ? envArg.split('=')[1] : 'prod';
const envFile = env === 'dev' ? '.env.dev' : '.env';

console.log(`🌍 Carregando configurações de: ${envFile}`);
dotenv.config({ path: path.resolve(__dirname, envFile) });

const ftpDeploy = new FtpDeploy();

const config = {
    user: process.env.FTP_USER,
    // Password optional, prompted if none given
    password: process.env.FTP_PASSWORD,
    host: process.env.FTP_HOST,
    port: 21,
    localRoot: path.join(__dirname, 'dist'),
    remoteRoot: process.env.FTP_REMOTE_ROOT || '/public_html/',
    include: ['*', '**/*'], // Enviar tudo
    exclude: ['dist/**/*.map', 'node_modules/**', '.git/**'], // Excluir arquivos desnecessários
    deleteRemote: true, // DELETAR arquivos remotos antes de enviar (deploy limpo)
    forcePasv: true, // Modo Passivo (Geralmente necessário para HostGator)
    sftp: false // HostGator padrão usa FTP, mude para true se tiver SFTP ativado
};

console.log('🚀 Iniciando deploy para HostGator...');
console.log(`📡 Host: ${config.host}`);
import fs from 'fs';

ftpDeploy
    .deploy(config)
    .then((res) => {
        console.log('✅ Deploy finalizado com sucesso!');
        console.log('📦 Detalhes do deploy:', res);
    })
    .catch((err) => {
        console.error('❌ Erro no deploy:', err);
        fs.writeFileSync('deploy.log', JSON.stringify(err, null, 2));
        process.exit(1);
    });
