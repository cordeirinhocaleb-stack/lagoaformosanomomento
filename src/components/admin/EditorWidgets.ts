
export interface EditorWidget {
    id: string;
    name: string;
    category: 'layout' | 'editorial' | 'midia' | 'social';
    icon: string;
    description: string;
    html: string;
    color?: string;
}

export const EDITOR_WIDGETS: EditorWidget[] = [
    // --- LAYOUTS DE TEXTO ---
    {
        id: 'nota_oficial',
        name: 'Nota Oficial',
        category: 'editorial',
        icon: 'fa-file-signature',
        color: 'text-slate-600',
        description: 'Comunicado formal com título e corpo de texto.',
        html: `<div class="widget-root p-8 bg-zinc-50 border-l-4 border-zinc-900">
            <h4 class="text-xs font-black uppercase tracking-widest text-zinc-400 mb-4 lfnm-text" data-key="Chapeu">COMUNICADO OFICIAL</h4>
            <h2 class="text-2xl font-bold text-zinc-900 mb-4 lfnm-text" data-key="Titulo">Título do Comunicado</h2>
            <div class="prose prose-zinc prose-sm text-zinc-600 lfnm-text" data-key="Conteudo">
                <p>Insira o texto do comunicado aqui. Este bloco é ideal para notas de esclarecimento, comunicados da prefeitura ou avisos importantes.</p>
            </div>
            <div class="mt-6 pt-6 border-t border-zinc-200 flex items-center gap-3">
                <img src="https://via.placeholder.com/150" class="w-8 h-8 rounded-full border border-zinc-200 object-cover lfnm-img" data-img-key="AutorImg" />
                <div>
                    <p class="text-xs font-bold text-zinc-900 lfnm-text" data-key="Autor">Assessoria de Imprensa</p>
                    <p class="text-[10px] text-zinc-500 uppercase lfnm-text" data-key="Cargo">Prefeitura Municipal</p>
                </div>
            </div>
        </div>`
    },
    {
        id: 'plantao_urgente',
        name: 'Plantão Urgente',
        category: 'editorial',
        icon: 'fa-triangle-exclamation',
        color: 'text-red-600',
        description: 'Alerta de última hora com destaque visual.',
        html: `<div class="widget-root bg-red-600 text-white p-6 rounded-xl shadow-lg animate-pulse">
            <div class="flex items-center gap-3 mb-4">
                <span class="bg-white text-red-600 text-[10px] font-black uppercase px-2 py-1 rounded">URGENTE</span>
                <span class="text-xs font-medium opacity-80 lfnm-text" data-key="Hora">Agora mesmo</span>
            </div>
            <h2 class="text-xl font-bold mb-2 lfnm-text" data-key="Manchete">Aconteceu agora em Lagoa Formosa</h2>
            <p class="text-sm opacity-90 lfnm-text" data-key="Subtitulo">Breve descrição do ocorrido para chamar a atenção do leitor imediatamente.</p>
        </div>`
    },
    {
        id: 'destaque_citacao',
        name: 'Citação com Foto',
        category: 'editorial',
        icon: 'fa-quote-right',
        color: 'text-indigo-500',
        description: 'Destaque para fala de autoridade ou entrevistado.',
        html: `<div class="widget-root flex flex-col md:flex-row items-center gap-6 bg-zinc-50 p-8 rounded-2xl">
            <img src="https://via.placeholder.com/150" class="w-24 h-24 rounded-full border-4 border-white shadow-lg object-cover lfnm-img flex-shrink-0" data-img-key="Avatar" />
            <div class="flex-1 text-center md:text-left">
                <i class="fas fa-quote-left text-zinc-300 text-xl mb-2"></i>
                <blockquote class="text-lg font-serif italic text-zinc-800 mb-4 lfnm-text" data-key="Citacao">
                    "Esta é uma frase de destaque que resume o pensamento do entrevistado ou o ponto central da matéria."
                </blockquote>
                <cite class="not-italic">
                    <span class="block text-sm font-bold text-zinc-900 lfnm-text" data-key="Autor">Nome da Pessoa</span>
                    <span class="block text-xs text-zinc-500 lfnm-text" data-key="Cargo">Cargo ou Função</span>
                </cite>
            </div>
        </div>`
    },

    // --- NOVOS WIDGETS ---

    {
        id: 'fato_fake',
        name: 'Fato ou Fake',
        category: 'editorial',
        icon: 'fa-check-double',
        color: 'text-orange-500',
        description: 'Verificação de veracidade de informações.',
        html: `<div class="widget-root flex items-stretch border-2 border-zinc-100 rounded-xl overflow-hidden">
            <div class="bg-red-500 text-white w-24 flex flex-col items-center justify-center p-4">
               <i class="fas fa-exclamation-circle text-3xl mb-1"></i>
               <span class="text-[10px] font-black uppercase tracking-wider lfnm-text" data-key="Status">FAKE</span>
            </div>
            <div class="flex-1 p-4 bg-white">
               <h4 class="text-xs font-bold text-zinc-400 uppercase mb-1 lfnm-text" data-key="Label">Checagem de Fato</h4>
               <p class="text-sm font-medium text-zinc-800 leading-snug lfnm-text" data-key="Texto">A informação circulando nas redes sociais sobre o cancelamento do evento não procede. A organização confirmou a data.</p>
            </div>
        </div>`
    },

    {
        id: 'numeros_destaque',
        name: 'Número em Destaque',
        category: 'editorial',
        icon: 'fa-7',
        color: 'text-blue-600',
        description: 'Estatística ou dado numérico impactante.',
        html: `<div class="widget-root text-center p-8 bg-blue-50 rounded-3xl">
            <span class="block text-6xl font-black text-blue-600 mb-2 tracking-tighter lfnm-text" data-key="Numero">85%</span>
            <h3 class="text-lg font-bold text-blue-900 mb-1 lfnm-text" data-key="Titulo">Aprovação Popular</h3>
            <p class="text-xs text-blue-700 max-w-[200px] mx-auto lfnm-text" data-key="Descricao">Dados coletados na última pesquisa realizada no município.</p>
        </div>`
    },

    {
        id: 'cronologia_vertical',
        name: 'Linha do Tempo',
        category: 'editorial',
        icon: 'fa-stream',
        color: 'text-teal-500',
        description: 'Lista cronológica de eventos.',
        html: `<div class="widget-root relative pl-4 border-l-2 border-zinc-200 py-2 space-y-6">
            <div class="relative">
                <div class="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-zinc-400 ring-4 ring-white"></div>
                <span class="text-xs font-mono text-zinc-400 lfnm-text" data-key="Data1">08:00</span>
                <p class="text-sm font-medium text-zinc-800 lfnm-text" data-key="Evento1">Início da cerimônia na praça principal.</p>
            </div>
             <div class="relative">
                <div class="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-zinc-400 ring-4 ring-white"></div>
                <span class="text-xs font-mono text-zinc-400 lfnm-text" data-key="Data2">10:30</span>
                <p class="text-sm font-medium text-zinc-800 lfnm-text" data-key="Evento2">Pronunciamento das autoridades locais.</p>
            </div>
            <div class="relative">
                <div class="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-blue-500 ring-4 ring-white"></div>
                <span class="text-xs font-mono text-blue-500 font-bold lfnm-text" data-key="Data3">14:00</span>
                <p class="text-base font-bold text-zinc-900 lfnm-text" data-key="Evento3">Encerramento com show ao vivo.</p>
            </div>
        </div>`
    },

    {
        id: 'pros_contras',
        name: 'Prós e Contras',
        category: 'editorial',
        icon: 'fa-balance-scale',
        color: 'text-emerald-600',
        description: 'Comparativo lado a lado.',
        html: `<div class="widget-root grid grid-cols-2 gap-4">
            <div class="bg-green-50 p-4 rounded-xl">
                <h4 class="flex items-center gap-2 text-green-700 font-bold text-xs uppercase mb-3"><i class="fas fa-plus-circle"></i> Vantagens</h4>
                <ul class="text-xs text-green-800 space-y-2 list-disc list-inside lfnm-text" data-key="Pros">
                    <li>Maior agilidade no atendimento</li>
                    <li>Redução de custos operacionais</li>
                    <li>Facilidade de acesso</li>
                </ul>
            </div>
            <div class="bg-red-50 p-4 rounded-xl">
                <h4 class="flex items-center gap-2 text-red-700 font-bold text-xs uppercase mb-3"><i class="fas fa-minus-circle"></i> Desvantagens</h4>
                <ul class="text-xs text-red-800 space-y-2 list-disc list-inside lfnm-text" data-key="Contras">
                    <li>Necessidade de adaptação</li>
                    <li>Investimento inicial alto</li>
                </ul>
            </div>
        </div>`
    },

    {
        id: 'definicao_glossario',
        name: 'Definição',
        category: 'editorial',
        icon: 'fa-book',
        color: 'text-yellow-500',
        description: 'Explicação de termo ou conceito.',
        html: `<div class="widget-root bg-yellow-50 p-6 rounded-none border-l-4 border-yellow-400">
            <div class="flex items-baseline gap-2 mb-2">
                <h3 class="text-xl font-bold text-zinc-900 font-serif lfnm-text" data-key="Termo">Impeachment</h3>
                <span class="text-xs italic text-zinc-500 font-serif lfnm-text" data-key="ClasseGramatical">substantivo masculino</span>
            </div>
            <p class="text-sm text-zinc-700 leading-relaxed font-serif lfnm-text" data-key="Definicao">Processo de impugnação de mandato de funcionário governamental ou do Presidente da República por crime de responsabilidade.</p>
        </div>`
    },

    {
        id: 'cartao_servico',
        name: 'Cartão de Serviço',
        category: 'social',
        icon: 'fa-id-card',
        color: 'text-cyan-500',
        description: 'Link útil ou contato de serviço.',
        html: `<div class="widget-root bg-white border-2 border-zinc-100 rounded-2xl p-6 flex items-center justify-between hover:border-blue-200 transition-colors group cursor-pointer">
            <div>
                <h4 class="font-bold text-zinc-900 mb-1 group-hover:text-blue-600 transition-colors lfnm-text" data-key="Nome">Farmácia de Plantão</h4>
                <p class="text-xs text-zinc-500 lfnm-text" data-key="Descricao">Aberta até as 22h - Rua Principal, 100</p>
            </div>
            <img src="https://via.placeholder.com/100" class="w-10 h-10 rounded-full bg-white object-cover border border-zinc-100 shadow-sm lfnm-img" data-img-key="IconeImg" />
        </div>`
    }
];
