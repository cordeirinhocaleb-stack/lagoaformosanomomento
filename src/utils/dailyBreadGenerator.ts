import { DailyBreadData } from '../types';

// Helper para data local YYYY-MM-DD sem shift de UTC
const getLocalDateString = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const VERSES = [
    { verse: "O Senhor é o meu pastor, nada me faltará.", reference: "Salmos 23:1", wordOfDay: "CUIDADO", theme: "Fé", reflection: "Deus cuida de cada detalhe da sua vida em nossa querida Lagoa Formosa." },
    { verse: "Tudo posso naquele que me fortalece.", reference: "Filipenses 4:13", wordOfDay: "FORÇA", theme: "Superação", reflection: "Diante dos desafios, lembre-se que sua força vem do alto." },
    { verse: "Entregue o seu caminho ao Senhor; confie nele, e ele o fará.", reference: "Salmos 37:5", wordOfDay: "CONFIANÇA", theme: "Entrega", reflection: "Solte o controle e deixe Deus guiar seus passos hoje." },
    { verse: "Porque sou eu que conheço os planos que tenho para vocês, diz o Senhor.", reference: "Jeremias 29:11", wordOfDay: "ESPERANÇA", theme: "Futuro", reflection: "O amanhã pertence a Deus e Ele tem pensamentos de paz para você." },
    { verse: "Sejam fortes e corajosos. Não tenham medo nem fiquem desanimados.", reference: "Josué 1:9", wordOfDay: "CORAGEM", theme: "Coragem", reflection: "A coragem não é ausência de medo, mas a certeza de que Deus está contigo." },
    { verse: "O amor é paciente, o amor é bondoso.", reference: "1 Coríntios 13:4", wordOfDay: "AMOR", theme: "Relacionamentos", reflection: "Pratique a paciência e a bondade com todos ao seu redor hoje." },
    { verse: "Lâmpada para os meus pés é a tua palavra e luz para o meu caminho.", reference: "Salmos 119:105", wordOfDay: "DIREÇÃO", theme: "Sabedoria", reflection: "Busque na palavra a orientação para as decisões deste dia." },
    { verse: "Venham a mim, todos os que estão cansados e sobrecarregados, e eu lhes darei descanso.", reference: "Mateus 11:28", wordOfDay: "DESCANSO", theme: "Paz", reflection: "Encontre alívio e renovo na presença de Jesus." },
    { verse: "Mas os que esperam no Senhor renovarão as suas forças.", reference: "Isaías 40:31", wordOfDay: "RENOVO", theme: "Paciência", reflection: "Saber esperar é uma virtude que traz recompensas divinas." },
    { verse: "O Senhor é a minha luz e a minha salvação; de quem terei medo?", reference: "Salmos 27:1", wordOfDay: "LUZ", theme: "Segurança", reflection: "Quando Deus ilumina nosso caminho, as sombras do medo desaparecem." },
    { verse: "Ensina-nos a contar os nossos dias para que alcancemos coração sábio.", reference: "Salmos 90:12", wordOfDay: "SABEDORIA", theme: "Tempo", reflection: "Cada dia é um presente único de Deus. Valorize cada momento." },
    { verse: "Deus é o nosso refúgio e fortaleza, socorro bem presente na angústia.", reference: "Salmos 46:1", wordOfDay: "REFÚGIO", theme: "Proteção", reflection: "Nos momentos difíceis, corra para os braços do Pai, seu lugar seguro." },
    { verse: "Porque a seus anjos ele dará ordens a seu respeito, para que o protejam em todos os seus caminhos.", reference: "Salmos 91:11", wordOfDay: "PROTEÇÃO", theme: "Cuidado", reflection: "Caminhe com confiança, pois o céu trabalha a seu favor." },
    { verse: "Agrada-te do Senhor, e ele satisfará os desejos do teu coração.", reference: "Salmos 37:4", wordOfDay: "ALEGRIA", theme: "Felicidade", reflection: "Quando sua alegria está em Deus, seus sonhos se alinham aos D'ele." },
    { verse: "Mil cairão ao teu lado, e dez mil à tua direita, mas tu não serás atingido.", reference: "Salmos 91:7", wordOfDay: "LIVRAMENTO", theme: "Fé", reflection: "A proteção divina é um escudo invisível, mas real, sobre sua vida." }
];

export const getGeneratedDailyBread = (date: Date): DailyBreadData => {
    const dateStr = getLocalDateString(date);

    // Hash determinístico baseado na data local
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = date.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay); // dayOfYear: 0 - 365

    // Calcula um índice único pseudo-aleatório usando a data
    // dayOfYear: 366
    // date.getDate(): 1-31
    // (dayOfYear * magic + date) ensures rotation is not just sequential 1,2,3...
    // But sequential logic is fine if we have enough length.
    // The previous issue was probably short cycle.
    // Now len=15.
    // (dayOfYear + year) % 15 -> repeats every 15 days.
    // That's acceptable.

    const index = (dayOfYear + date.getFullYear()) % VERSES.length;
    const selected = VERSES[index];

    return {
        date: dateStr,
        verse: selected.verse,
        reference: selected.reference,
        reflection: selected.reflection,
        wordOfDay: selected.wordOfDay,
        theme: selected.theme
    };
};

export const getWeekDailyBreads = (): DailyBreadData[] => {
    const today = new Date();
    // Garante que estamos usando hora local correta e remove hora para evitar shift na lógica
    today.setHours(12, 0, 0, 0);

    const currentDay = today.getDay(); // 0 (Dom) - 6 (Sab)

    // Calcula diff para Segunda-feira da semana ATUAL
    // Dom (0) -> -6 dias (Segunda Passada)
    // Seg (1) -> 0 dias
    // Sab (6) -> -5 dias (Segunda Passada)
    const diffToMonday = currentDay === 0 ? -6 : 1 - currentDay;

    const monday = new Date(today);
    monday.setDate(today.getDate() + diffToMonday);

    const weekData: DailyBreadData[] = [];

    // Gera 7 dias (Segunda a Domingo)
    for (let i = 0; i < 7; i++) {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        // Garante que a data está "limpa" (meio dia) para evitar UTC shifts na string
        d.setHours(12, 0, 0, 0);
        weekData.push(getGeneratedDailyBread(d));
    }

    return weekData;
};
