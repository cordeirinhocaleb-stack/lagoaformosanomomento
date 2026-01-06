
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.join(__dirname, '..');
const packageJsonPath = path.join(rootDir, 'package.json');
const versionMdPath = path.join(rootDir, 'VERSION.md');

// Ler argumentos
const args = process.argv.slice(2);
const description = args[0] || 'Atualização de desenvolvimento';
const category = args[1] || 'Modificado';

console.log(`📦 Lendo package.json...`);
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Regra #3: Incrementar exatamente +0.001
const currentVersion = parseFloat(packageJson.version);
const newVersionValue = currentVersion + 0.001;
// Usamos toFixed para evitar erros de precisão float
const newVersion = newVersionValue.toFixed(3);

console.log(`🔄 Atualizando de ${packageJson.version} para ${newVersion}...`);

// 1. Atualizar package.json
packageJson.version = newVersion;
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');

// 2. Atualizar VERSION.md
console.log(`📝 Atualizando VERSION.md...`);
let versionContent = fs.readFileSync(versionMdPath, 'utf8');

const now = new Date();
const dateStr = now.toLocaleDateString('pt-BR');
const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
const ref = dateStr.replace(/\//g, '') + timeStr.replace(':', '');

const newEntry = `
## ${newVersion} - ${dateStr} ${timeStr} (Ref: ${ref})
- **${category}:** ${description}
`;

// Inserir antes da primeira ocorrência de "## " (que não seja o título)
// Ou logo após o cabeçalho.
const headerEndIndex = versionContent.indexOf('## ');
if (headerEndIndex !== -1) {
    versionContent = versionContent.slice(0, headerEndIndex) + newEntry + versionContent.slice(headerEndIndex);
} else {
    versionContent += newEntry;
}

// Sincronizar campo "Versão Atual" no final do arquivo se existir
if (versionContent.includes('## Versão Atual')) {
    versionContent = versionContent.replace(/## Versão Atual\n\*\*[0-9.]+\*\*/, `## Versão Atual\n**${newVersion}**`);
}

fs.writeFileSync(versionMdPath, versionContent);

// 3. Gerar JSON estruturado para o Frontend (ChangelogModal)
console.log(`📊 Gerando config/changelog.json...`);
const lines = versionContent.split('\n');
const changelog = [];
let currentVer = null;

const categoryMap = {
    'Adicionado': 'feature', 'Modificado': 'improvement', 'Retirado': 'fix', 'Bugfix': 'fix', 'Security': 'fix'
};

lines.forEach(line => {
    const versionMatch = line.match(/^##\s+([0-9.]+)\s+-\s+(\d{2}\/\d{2}\/\d{4})/);
    if (versionMatch) {
        currentVer = {
            version: versionMatch[1],
            date: versionMatch[2],
            items: []
        };
        changelog.push(currentVer);
        return;
    }

    if (currentVer && line.trim().startsWith('-')) {
        const itemMatch = line.match(/-\s*\*\*(.+?):\*\*\s*(.+)/);
        if (itemMatch) {
            const rawCat = itemMatch[1].trim();
            const desc = itemMatch[2].trim();

            let catType = 'improvement';
            for (const key in categoryMap) {
                if (rawCat.includes(key)) catType = categoryMap[key];
            }

            currentVer.items.push({
                category: catType,
                title: rawCat,
                description: desc
            });
        }
    }
});

const configDir = path.join(rootDir, 'config');
if (!fs.existsSync(configDir)) fs.mkdirSync(configDir);

fs.writeFileSync(
    path.join(configDir, 'changelog.json'),
    JSON.stringify(changelog, null, 2)
);

console.log(`✅ Sucesso! Versão: ${newVersion}`);
console.log(`   Para automatizar o processo, use: npm run bump "Sua descrição" "Categoria"`);
