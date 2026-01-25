import * as fs from 'fs';
import * as path from 'path';

export interface SkillMetadata {
    name: string;
    description: string;
    path: string;
}

export interface Skill {
    metadata: SkillMetadata;
    instructions: string;
}

export class SkillManager {
    private skillsPath: string;

    constructor(skillsPath: string = 'skills') {
        this.skillsPath = path.resolve(process.cwd(), skillsPath);
    }

    /**
     * Scans the skills directory for available skills
     */
    async listAvailableSkills(): Promise<SkillMetadata[]> {
        if (!fs.existsSync(this.skillsPath)) return [];

        const skills: SkillMetadata[] = [];
        const directories = fs.readdirSync(this.skillsPath, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory());

        for (const dir of directories) {
            const skillMdPath = path.join(this.skillsPath, dir.name, 'SKILL.md');
            if (fs.existsSync(skillMdPath)) {
                const content = fs.readFileSync(skillMdPath, 'utf-8');
                const metadata = this.parseMetadata(content, path.join(this.skillsPath, dir.name));
                if (metadata) {
                    skills.push(metadata);
                }
            }
        }

        return skills;
    }

    /**
     * Finds skills relevant to a task description
     */
    async getRelevantSkills(taskDescription: string): Promise<Skill[]> {
        const availableSkills = await this.listAvailableSkills();
        const relevantSkills: Skill[] = [];
        const taskLower = taskDescription.toLowerCase();

        for (const meta of availableSkills) {
            // Simple keyword matching for now
            // Future improvement: use embeddings/LLM for matching
            const keywords = meta.description.toLowerCase().split(/\W+/);
            const matches = keywords.some(kw => kw.length > 3 && taskLower.includes(kw));

            if (matches) {
                relevantSkills.push(this.loadSkill(meta));
            }
        }

        return relevantSkills;
    }

    private loadSkill(metadata: SkillMetadata): Skill {
        const skillMdPath = path.join(metadata.path, 'SKILL.md');
        const content = fs.readFileSync(skillMdPath, 'utf-8');

        // Remove yaml frontmatter
        const instructions = content.replace(/^---[\s\S]*?---/, '').trim();

        return {
            metadata,
            instructions
        };
    }

    private parseMetadata(content: string, fullPath: string): SkillMetadata | null {
        const match = content.match(/^---([\s\S]*?)---/);
        if (!match) return null;

        const yaml = match[1];
        const name = yaml.match(/name:\s*(.+)/)?.[1]?.trim();
        const description = yaml.match(/description:\s*(.+)/)?.[1]?.trim();

        if (name && description) {
            return { name, description, path: fullPath };
        }

        return null;
    }
}
