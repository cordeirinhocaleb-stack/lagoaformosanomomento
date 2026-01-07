
import fs from 'fs';
import path from 'path';

const envLocalPath = path.resolve('.env.local');

if (fs.existsSync(envLocalPath)) {
    console.log('--- .env.local Content ---');
    const content = fs.readFileSync(envLocalPath, 'utf-8');
    console.log(content);
    console.log('--- End of Content ---');
} else {
    console.log('.env.local not found');
}
