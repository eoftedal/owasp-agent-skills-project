
import { fileURLToPath } from 'url';
import * as path from 'path';
import { promises as fs } from "fs";
import * as crypto from "crypto";
import { cos_sim } from "@huggingface/transformers";
import { Tensor } from '@huggingface/transformers';
import { embed, loadTensor, saveTensor } from './embedding.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const cardFolder = process.env.CARDFOLDER ?? path.join(__dirname, "references");

type CardInfo = {
    id: string;
    title: string;
    tensor: Tensor;
    markdown: string;
}

const cards: CardInfo[] = [];

export async function loadDirectory(folder: string) {
    console.error("Loading " + folder);
    const files = await fs.readdir(folder, { withFileTypes: true } );
    for(const file of files) {
        const filePath = path.join(file.parentPath, file.name);
        if (file.isDirectory()) {
            await loadDirectory(filePath);
        }
        if (!(file.name.endsWith(".md"))) continue;
        const markdown = await fs.readFile(filePath, "utf-8");
        const id = file.name.replace(/\.md/, "");
 
        const cacheKey = crypto.createHash('sha256').update(markdown).digest('hex');
        await fs.mkdir(path.join(__dirname, "_cache"), { recursive: true });
        const cacheFilePath = path.join(__dirname, "_cache", cacheKey + ".json");
        let tensor: Tensor;
        try {
            tensor = await loadTensor(cacheFilePath);
        } catch(e) {
            console.error("Creating embedding for: " + filePath);
            tensor = await embed(markdown);
            await saveTensor(tensor, cacheFilePath);
        }
        const frontmatterMatch = markdown.match(/^---\n[\s\S]*?^title:\s*"(.+)"/m);
        const title = frontmatterMatch ? frontmatterMatch[1] : id;
        cards.push({id, markdown, tensor, title })
    }
}

const ready = loadDirectory(cardFolder);

export async function getCards() {
    await ready;
    return cards.map(c => ({ id: c.id, title: c.title }));
}

export async function queryCards(query: string): Promise<Array<{id: string, title: string, score: number }>> {
    await ready;
    const prompt = "Instruct: Given a search query, retrieve relevant guidance cards for secure development.\nQuery:" + query;
    const tensor = await embed(prompt);
    const result = cards
        .map((c) => {
            return {
                id: c.id,
                score: cosine(tensor, c.tensor),
                title: c.title,
            }
        }).sort((a,b) => b.score - a.score);
    console.error("prompt", prompt);
    return result;
}

export function cosine(a: Tensor, b: Tensor): number {
  const ad = Array.from(a.flatten().data);
  const bd = Array.from(b.flatten().data);
  return cos_sim(ad, bd);
}

export async function getCard(id: string): Promise<CardInfo | undefined> {
    await ready;
    return cards.find(c => c.id == id);
}


