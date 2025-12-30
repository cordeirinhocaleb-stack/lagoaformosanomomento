
/**
 * BIBLIOTECA DE WIDGETS LFNM - RECUPERADA (VERSÃO INTEGRAL)
 * Módulos jornalísticos pré-configurados para o jornalismo regional.
 */
export const EDITOR_WIDGETS = [
  {
    id: 'pharmacy_duty',
    name: 'Plantão Farmácia',
    category: 'Serviços',
    icon: 'fa-house-medical',
    html: `<div class="p-6 bg-white border-2 border-zinc-100 rounded-3xl flex items-center gap-6 shadow-sm"><div class="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center text-white text-3xl shadow-lg animate-pulse"><i class="fas fa-plus-medical lfnm-icon"></i></div><div class="flex-1"><p class="text-[9px] font-black uppercase tracking-widest mb-1 opacity-70">Plantão 24 Horas</p><p class="text-xl font-black uppercase italic tracking-tighter lfnm-text" data-key="Farmácia">DROGARIA CENTRAL</p><p class="text-xs font-bold lfnm-text" data-key="Contato">Rua X, nº 100 • (34) 9999-0000</p></div></div>`
  },
  {
    id: 'agro_quote',
    name: 'Cotação Agro',
    category: 'Dados',
    icon: 'fa-tractor',
    html: `<div class="grid grid-cols-1 md:grid-cols-3 gap-4"><div class="bg-zinc-50 p-6 rounded-2xl text-center border border-zinc-100"><p class="text-[8px] font-black uppercase mb-2 opacity-50 lfnm-text" data-key="Item 1">Boi Gordo</p><p class="text-2xl font-black lfnm-text" data-key="Preço 1">R$ 295,00</p></div><div class="bg-zinc-50 p-6 rounded-2xl text-center border border-zinc-100"><p class="text-[8px] font-black uppercase mb-2 opacity-50 lfnm-text" data-key="Item 2">Soja</p><p class="text-2xl font-black lfnm-text" data-key="Preço 2">R$ 135,50</p></div><div class="bg-zinc-50 p-6 rounded-2xl text-center border border-zinc-100"><p class="text-[8px] font-black uppercase mb-2 opacity-50 lfnm-text" data-key="Item 3">Milho</p><p class="text-2xl font-black lfnm-text" data-key="Preço 3">R$ 62,00</p></div></div>`
  },
  {
    id: 'br354_alert',
    name: 'Status BR-354',
    category: 'Alertas',
    icon: 'fa-road',
    html: `<div class="p-8 rounded-[2.5rem] border-l-[12px] border-zinc-900 shadow-xl relative overflow-hidden bg-white"><p class="text-[9px] font-black uppercase tracking-[0.4em] mb-4 opacity-70">TRÂNSITO REGIONAL</p><h4 class="text-2xl font-[1000] uppercase italic tracking-tighter mb-4 lfnm-text" data-key="Trecho">TRECHO BR-354 (PATOS)</h4><div class="flex items-center gap-4"><div class="w-4 h-4 rounded-full bg-emerald-500 animate-pulse"></div><p class="text-sm font-bold lfnm-text" data-key="Status">Fluxo normal, sem retenções.</p></div></div>`
  },
  {
    id: 'obituary_card',
    name: 'Obituário',
    category: 'Comunidade',
    icon: 'fa-dove',
    html: `<div class="border-x-8 border-zinc-200 bg-white p-8 rounded-xl text-center shadow-sm"><i class="fas fa-cross text-zinc-400 text-2xl mb-4"></i><h4 class="text-xs font-black uppercase tracking-[0.4em] mb-4 opacity-50">Nota de Falecimento</h4><p class="text-2xl font-black uppercase italic tracking-tighter mb-2 lfnm-text" data-key="Nome">NOME DO FALECIDO</p><p class="text-xs font-bold italic opacity-70 lfnm-text" data-key="Detalhes">Sepultamento hoje às 17h.</p></div>`
  },
  {
    id: 'fact_check',
    name: 'Selo Fato ou Fake',
    category: 'Editorial',
    icon: 'fa-check-double',
    html: `<div class="flex items-center gap-4 border-4 border-zinc-900 p-6 rounded-3xl shadow-xl bg-white"><div class="bg-zinc-900 text-white px-6 py-3 rounded-xl font-[1000] uppercase italic tracking-tighter text-xl lfnm-text" data-key="Selo">FATO</div><div class="flex-1"><p class="text-sm font-bold leading-tight lfnm-text" data-key="Explicação">Confirmamos com as autoridades que a informação é verídica.</p></div></div>`
  },
  {
    id: 'official_note',
    name: 'Nota Oficial',
    category: 'Alertas',
    icon: 'fa-file-signature',
    html: `<div class="border-2 border-zinc-900 p-10 rounded-[2rem] relative shadow-2xl bg-white"><div class="absolute -top-4 left-1/2 -translate-x-1/2 bg-zinc-900 text-white px-6 py-1.5 text-[9px] font-black uppercase tracking-[0.3em] rounded-full">COMUNICADO</div><p class="text-lg leading-relaxed font-serif text-center lfnm-text" data-key="Mensagem">Informamos o início das obras na Praça Central.</p></div>`
  },
  {
    id: 'countdown_expo',
    name: 'Contador Expô',
    category: 'Eventos',
    icon: 'fa-clock',
    html: `<div class="bg-zinc-900 p-10 rounded-[3.5rem] text-white text-center shadow-2xl"><p class="text-[10px] font-black uppercase tracking-[0.5em] opacity-60 mb-6">FALTAM POUCOS DIAS</p><h4 class="text-4xl font-[1000] uppercase italic tracking-tighter mb-8 lfnm-text" data-key="Evento">EXPÔ LAGOA 2025</h4><div class="flex justify-center gap-4 text-3xl font-black"><div><span class="lfnm-text" data-key="Dias">12</span> <span class="block text-[8px] uppercase opacity-50">Dias</span></div>:<div><span class="lfnm-text" data-key="Horas">08</span> <span class="block text-[8px] uppercase opacity-50">Hrs</span></div></div></div>`
  },
  {
    id: 'pix_support',
    name: 'Apoio PIX',
    category: 'Comunidade',
    icon: 'fa-qrcode',
    html: `<div class="p-8 rounded-[3rem] border-2 border-zinc-100 flex flex-col md:flex-row items-center gap-8 shadow-sm bg-white"><div class="w-24 h-24 bg-zinc-900 rounded-2xl flex items-center justify-center text-white text-5xl shrink-0"><i class="fas fa-qrcode lfnm-icon"></i></div><div class="flex-1 text-center md:text-left"><h4 class="text-xl font-[1000] uppercase italic tracking-tighter leading-none mb-2 lfnm-text" data-key="Título">APOIE O JORNALISMO</h4><p class="text-[10px] font-mono opacity-60 lfnm-text" data-key="Chave">PIX: pauta@lagoaformosa.com</p></div></div>`
  },
  {
    id: 'bus_schedule',
    name: 'Horário de Ônibus',
    category: 'Serviços',
    icon: 'fa-bus',
    html: `<div class="p-6 border-2 border-zinc-100 rounded-3xl"><h5 class="text-[9px] font-black uppercase mb-4 tracking-widest flex items-center gap-2"><i class="fas fa-bus lfnm-icon"></i> <span class="lfnm-text" data-key="Destino">SAÍDAS PARA PATOS</span></h5><div class="grid grid-cols-3 gap-2"><div class="bg-zinc-900 text-white p-2 rounded-lg text-center font-black text-xs lfnm-text" data-key="H1">06:00</div><div class="bg-zinc-900 text-white p-2 rounded-lg text-center font-black text-xs lfnm-text" data-key="H2">12:15</div><div class="bg-zinc-900 text-white p-2 rounded-lg text-center font-black text-xs lfnm-text" data-key="H3">17:45</div></div></div>`
  },
  {
    id: 'emergency_numbers',
    name: 'Telefones Úteis',
    category: 'Serviços',
    icon: 'fa-phone-flip',
    html: `<div class="p-6 rounded-3xl border-2 border-zinc-100 bg-white grid grid-cols-2 gap-4"><div class="flex items-center gap-3"><div class="w-8 h-8 rounded-lg bg-red-600 text-white flex items-center justify-center text-xs"><i class="fas fa-shield-halved"></i></div><div><p class="text-[8px] font-black uppercase leading-none opacity-50">PM</p><p class="text-sm font-black lfnm-text" data-key="PM">190</p></div></div><div class="flex items-center gap-3"><div class="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs"><i class="fas fa-ambulance"></i></div><div><p class="text-[8px] font-black uppercase leading-none opacity-50">SAMU</p><p class="text-sm font-black lfnm-text" data-key="SAMU">192</p></div></div></div>`
  },
  {
    id: 'lottery_box',
    name: 'Loteria',
    category: 'Serviços',
    icon: 'fa-clover',
    html: `<div class="border-2 border-zinc-100 p-8 rounded-[2.5rem] text-center bg-white"><p class="text-[9px] font-black uppercase opacity-50 mb-4 lfnm-text" data-key="Concurso">MEGA-SENA</p><div class="flex gap-2 justify-center font-black"><span class="w-10 h-10 flex items-center justify-center bg-zinc-900 text-white rounded-full lfnm-text" data-key="N1">04</span> <span class="w-10 h-10 flex items-center justify-center bg-zinc-900 text-white rounded-full lfnm-text" data-key="N2">12</span> <span class="w-10 h-10 flex items-center justify-center bg-zinc-900 text-white rounded-full lfnm-text" data-key="N3">35</span> <span class="w-10 h-10 flex items-center justify-center bg-zinc-900 text-white rounded-full lfnm-text" data-key="N4">59</span></div></div>`
  },
  {
    id: 'faith_agenda',
    name: 'Agenda de Fé',
    category: 'Comunidade',
    icon: 'fa-church',
    html: `<div class="border-2 border-zinc-100 p-8 rounded-[3rem] text-center bg-white"><h4 class="text-lg font-[1000] uppercase italic mb-6 tracking-tighter lfnm-text" data-key="Título">AGENDA RELIGIOSA</h4><div class="flex justify-between items-center bg-zinc-50 p-3 rounded-2xl"><span class="text-[10px] font-black uppercase opacity-70 lfnm-text" data-key="Local">MATRIZ</span><span class="text-xs font-black lfnm-text" data-key="Hora">19:00</span></div></div>`
  },
  {
    id: 'pet_corner',
    name: 'Espaço Pet',
    category: 'Comunidade',
    icon: 'fa-paw',
    html: `<div class="border-2 border-zinc-100 rounded-[2.5rem] p-6 shadow-sm flex items-center gap-6 bg-white"><div class="w-20 h-20 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400 text-3xl shrink-0"><i class="fas fa-dog lfnm-icon"></i></div><div class="flex-1 text-left"><span class="text-[9px] font-black uppercase tracking-widest opacity-50">ADOTE UM AMIGO</span><h4 class="text-xl font-black uppercase italic tracking-tighter lfnm-text" data-key="Chamada">PROCURA-SE UM LAR</h4></div></div>`
  },
  {
    id: 'found_box',
    name: 'Achados e Perdidos',
    category: 'Serviços',
    icon: 'fa-id-card-clip',
    html: `<div class="bg-zinc-50 p-8 rounded-[2rem] border-2 border-zinc-100"><h5 class="text-xs font-[1000] uppercase mb-4 flex items-center gap-3"><i class="fas fa-box-open lfnm-icon"></i> ACHADOS</h5><div class="p-3 bg-white border border-zinc-100 text-xs font-bold flex justify-between"><span class="lfnm-text" data-key="Item">RG: JOÃO SILVA</span><span class="font-black text-red-600 lfnm-text" data-key="Local">REDAÇÃO</span></div></div>`
  },
  {
    id: 'podcast_bar',
    name: 'Podcast Bar',
    category: 'Mídia',
    icon: 'fa-podcast',
    html: `<div class="bg-zinc-900 p-8 rounded-[2.5rem] text-white shadow-xl flex items-center gap-6 border-b-8 border-red-600"><div class="w-14 h-14 bg-red-600 rounded-full flex items-center justify-center text-xl shrink-0"><i class="fas fa-play ml-1 lfnm-icon"></i></div><div class="flex-1 text-left"><p class="text-[9px] font-black uppercase text-red-500 tracking-widest mb-1">OUÇA AGORA</p><h4 class="text-lg font-black uppercase italic tracking-tighter lfnm-text" data-key="Nome">PODCAST LFNM #42</h4></div></div>`
  },
  {
    id: 'vet_duty',
    name: 'Plantão Vet',
    category: 'Serviços',
    icon: 'fa-stethoscope',
    html: `<div class="border-2 border-zinc-100 p-8 rounded-[2.5rem] flex items-center gap-6 bg-white"><div class="w-16 h-16 bg-zinc-900 text-white rounded-2xl flex items-center justify-center text-3xl shadow-lg"><i class="fas fa-dog lfnm-icon"></i></div><div class="flex-1 text-left"><p class="text-[9px] font-black uppercase tracking-widest mb-1 opacity-50">CUIDADO ANIMAL</p><p class="text-xl font-black uppercase italic tracking-tighter lfnm-text" data-key="Clínica">CLÍNICA PET LAGOA</p></div></div>`
  },
  {
    id: 'local_hero',
    name: 'Destaque Social',
    category: 'Comunidade',
    icon: 'fa-star',
    html: `<div class="bg-zinc-900 p-10 rounded-[4rem] text-white text-center shadow-2xl relative overflow-hidden"><span class="text-[9px] font-black uppercase tracking-[0.4em] mb-6 block opacity-50 lfnm-text" data-key="Título">PERSONAGEM LOCAL</span><h4 class="text-3xl font-[1000] uppercase italic tracking-tighter mb-4 lfnm-text" data-key="Nome">NOME DO MORADOR</h4><p class="text-sm font-medium italic opacity-70 lfnm-text" data-key="Citação">"Exemplo de dedicação à nossa terra."</p></div>`
  },
  {
    id: 'legal_box',
    name: 'Edital / Aviso',
    category: 'Documentos',
    icon: 'fa-gavel',
    html: `<div class="border-4 border-double border-zinc-200 bg-white p-10 rounded-xl font-serif text-center shadow-inner"><h4 class="text-xs font-black uppercase opacity-50 mb-6 tracking-widest lfnm-text" data-key="Tipo">EDITAL DE CONVOCAÇÃO</h4><p class="text-sm leading-relaxed italic lfnm-text" data-key="Corpo">Fazemos saber que realizar-se-á a assembleia...</p></div>`
  },
  {
    id: 'food_guide',
    name: 'Guia Gastrô',
    category: 'Serviços',
    icon: 'fa-utensils',
    html: `<div class="border-2 border-zinc-100 p-8 rounded-[3rem] text-center bg-white"><h4 class="text-lg font-[1000] uppercase italic mb-6 tracking-tighter lfnm-text" data-key="Título">PRATO DO DIA</h4><div class="flex justify-between border-b border-zinc-100 pb-2"><span class="font-black text-xs uppercase opacity-70 lfnm-text" data-key="Estab">RESTAURANTE</span><span class="text-xs font-bold italic lfnm-text" data-key="Prato">FEIJOADA</span></div></div>`
  },
  {
    id: 'welix_voice',
    name: 'Citação do Welix',
    category: 'Editorial',
    icon: 'fa-microphone',
    html: `<div class="my-12 flex flex-col items-center text-center bg-white p-10 rounded-[3rem] border border-zinc-100 shadow-sm"><div class="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center text-white text-2xl shadow-xl mb-6"><i class="fas fa-microphone-lines lfnm-icon"></i></div><blockquote class="text-3xl font-[1000] uppercase italic tracking-tighter leading-[0.9] max-w-xl mx-auto mb-6 lfnm-text" data-key="Frase">"A VERDADE É O NOSSO COMPROMISSO."</blockquote><cite class="text-[10px] font-black uppercase tracking-[0.4em] opacity-50">— WELIX DUARTE</cite></div>`
  }
];
