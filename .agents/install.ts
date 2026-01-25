import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Script de Instalação de Agentes
 * 
 * Copia arquivos de configuração (.cursorrules, .clinerules, .agent/)
 * do pacote node_modules para a raiz do projeto do usuário.
 */

async function install() {
    const projectRoot = process.cwd();
    const packageDir = path.join(__dirname, '..'); // .agents is in the package root

    console.log('\n📦 Instalando componentes do sistema de agentes...');

    const itemsToCopy = [
        { src: '.cursorrules', dest: '.cursorrules' },
        { src: '.clinerules', dest: '.clinerules' },
        { src: '.agent', dest: '.agent' },
        { src: 'skills', dest: 'skills' },
        { src: 'docs', dest: 'docs' }
    ];

    for (const item of itemsToCopy) {
        const srcPath = path.join(packageDir, item.src);
        const destPath = path.join(projectRoot, item.dest);

        if (fs.existsSync(srcPath)) {
            if (fs.statSync(srcPath).isDirectory()) {
                copyRecursive(srcPath, destPath);
            } else {
                // Se o arquivo de destino já existe, não sobrescreve sem permissão
                if (!fs.existsSync(destPath)) {
                    fs.copyFileSync(srcPath, destPath);
                    console.log(`  ✅ Criado: ${item.dest}`);
                } else {
                    console.log(`  ℹ️  Mantido: ${item.dest} (já existe)`);
                }
            }
        }
    }

    // 2. Adicionar scripts ao package.json
    const packageJsonPath = path.join(projectRoot, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
        try {
            const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
            if (!packageJson.scripts) packageJson.scripts = {};

            let modified = false;

            if (!packageJson.scripts['agent']) {
                packageJson.scripts['agent'] = 'npx tsx node_modules/wegho-agentes/.agents/cli.ts';
                console.log('  ✅ Script adicionado: npm run agent');
                modified = true;
            }

            if (!packageJson.scripts['task']) {
                packageJson.scripts['task'] = 'npm run agent --';
                console.log('  ✅ Script adicionado: npm run task');
                modified = true;
            }

            if (modified) {
                fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2), 'utf-8');
            }
        } catch (error) {
            console.error('  ⚠️  Não foi possível atualizar o package.json automaticamente:', (error as Error).message);
        }
    }

    console.log('\n✅ Componentes instalados com sucesso!');
}

function copyRecursive(src: string, dest: string) {
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
    }

    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        if (entry.isDirectory()) {
            copyRecursive(srcPath, destPath);
        } else {
            if (!fs.existsSync(destPath)) {
                fs.copyFileSync(srcPath, destPath);
                // console.log(`    - ${entry.name}`);
            }
        }
    }
}

if (process.argv[1] === __filename) {
    install().catch(console.error);
}

export { install };
