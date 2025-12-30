
export const EDITOR_WIDGETS = [
  {
    id: 'pharmacy_duty',
    name: 'Farmácia de Plantão',
    category: 'Serviços',
    icon: 'fa-house-medical',
    html: `<div class="flex items-center gap-6"><div class="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center text-white text-3xl shadow-lg animate-pulse"><i class="fas fa-plus-medical"></i></div><div class="flex-1"><p class="text-[9px] font-black uppercase tracking-widest mb-1 opacity-70">Plantão 24 Horas</p><p class="text-xl font-black uppercase italic tracking-tighter" contenteditable="true">DROGARIA CENTRAL</p><p class="text-xs font-bold" contenteditable="true">Rua X, nº 100 • (34) 9999-0000</p></div></div>`
  },
  {
    id: 'agro_quote',
    name: 'Cotação Agro',
    category: 'Dados',
    icon: 'fa-tractor',
    html: `<div class="grid grid-cols-1 md:grid-cols-3 gap-4"><div class="bg-zinc-900/5 p-6 rounded-2xl text-center border border-zinc-900/10"><p class="text-[8px] font-black uppercase mb-2 opacity-50">Boi Gordo</p><p class="text-2xl font-black" contenteditable="true">R$ 295,00</p></div><div class="bg-zinc-900/5 p-6 rounded-2xl text-center border border-zinc-900/10"><p class="text-[8px] font-black uppercase mb-2 opacity-50">Soja</p><p class="text-2xl font-black" contenteditable="true">R$ 135,50</p></div><div class="bg-zinc-900/5 p-6 rounded-2xl text-center border border-zinc-900/10"><p class="text-[8px] font-black uppercase mb-2 opacity-50">Milho</p><p class="text-2xl font-black" contenteditable="true">R$ 62,00</p></div></div>`
  },
  {
    id: 'bus_schedule',
    name: 'Horário de Ônibus',
    category: 'Serviços',
    icon: 'fa-bus',
    html: `<div class="p-6 border-2 border-zinc-900/10 rounded-3xl"><h5 class="text-[9px] font-black uppercase mb-4 tracking-widest flex items-center gap-2"><i class="fas fa-bus"></i> Saídas para Patos</h5><div class="grid grid-cols-3 gap-2" contenteditable="true"><div class="bg-zinc-900 text-white p-2 rounded-lg text-center font-black text-xs shadow-sm">06:00</div><div class="bg-zinc-900 text-white p-2 rounded-lg text-center font-black text-xs shadow-sm">12:15</div><div class="bg-zinc-900 text-white p-2 rounded-lg text-center font-black text-xs shadow-sm">17:45</div></div></div>`
  },
  {
    id: 'br354_alert',
    name: 'Status BR-354',
    category: 'Alertas',
    icon: 'fa-road',
    html: `<div class="p-8 rounded-[2.5rem] border-l-[12px] border-zinc-900 shadow-xl relative overflow-hidden text-left"><p class="text-[9px] font-black uppercase tracking-[0.4em] mb-4 opacity-70">TRÂNSITO REGIONAL</p><h4 class="text-2xl font-[1000] uppercase italic tracking-tighter mb-4" contenteditable="true">TRECHO LAGOA-PATOS</h4><div class="flex items-center gap-4"><div class="w-4 h-4 rounded-full bg-emerald-500 animate-pulse"></div><p class="text-sm font-bold" contenteditable="true">Fluxo normal, sem retenções.</p></div></div>`
  },
  {
    id: 'obituary_card',
    name: 'Obituário',
    category: 'Comunidade',
    icon: 'fa-dove',
    html: `<div class="border-x-8 border-zinc-400 p-8 rounded-xl text-center"><i class="fas fa-cross text-zinc-400 text-2xl mb-4"></i><h4 class="text-xs font-black uppercase tracking-[0.4em] mb-4 opacity-50">Nota de Falecimento</h4><p class="text-2xl font-black uppercase italic tracking-tighter mb-2" contenteditable="true">NOME DO FALECIDO</p><p class="text-xs font-bold italic opacity-70" contenteditable="true">Sepultamento hoje às 17h.</p></div>`
  },
  {
    id: 'emergency_numbers',
    name: 'Telefones Úteis',
    category: 'Serviços',
    icon: 'fa-phone-flip',
    html: `<div class="p-6 rounded-3xl border-2 border-zinc-900/10 grid grid-cols-2 gap-4"><div class="flex items-center gap-3"><div class="w-8 h-8 rounded-lg bg-zinc-900 text-white flex items-center justify-center text-xs"><i class="fas fa-shield-halved"></i></div><div><p class="text-[8px] font-black uppercase leading-none opacity-50">PM</p><p class="text-sm font-black">190</p></div></div><div class="flex items-center gap-3"><div class="w-8 h-8 rounded-lg bg-zinc-900 text-white flex items-center justify-center text-xs"><i class="fas fa-ambulance"></i></div><div><p class="text-[8px] font-black uppercase leading-none opacity-50">SAMU</p><p class="text-sm font-black">192</p></div></div></div>`
  },
  {
    id: 'fact_check',
    name: 'Selo Fato ou Fake',
    category: 'Editorial',
    icon: 'fa-check-double',
    html: `<div class="flex items-center gap-4 border-4 border-zinc-900 p-6 rounded-3xl shadow-xl overflow-hidden relative text-left"><div class="bg-zinc-900 text-white px-6 py-3 rounded-xl font-[1000] uppercase italic tracking-tighter text-xl">FATO</div><div class="flex-1"><p class="text-sm font-bold leading-tight" contenteditable="true">Confirmamos com as autoridades locais que a informação é verídica.</p></div></div>`
  },
  {
    id: 'official_note',
    name: 'Nota Oficial',
    category: 'Alertas',
    icon: 'fa-file-signature',
    html: `<div class="border-2 border-zinc-900 p-10 rounded-[2rem] relative shadow-2xl"><div class="absolute -top-4 left-1/2 -translate-x-1/2 bg-zinc-900 text-white px-6 py-1.5 text-[9px] font-black uppercase tracking-[0.3em] rounded-full">COMUNICADO</div><p class="text-lg leading-relaxed font-serif text-center" contenteditable="true">A Prefeitura informa o início das obras na Praça Central.</p></div>`
  },
  {
    id: 'expo_countdown',
    name: 'Contador Expô',
    category: 'Eventos',
    icon: 'fa-clock',
    html: `<div class="bg-zinc-900 p-10 rounded-[3.5rem] text-white text-center shadow-2xl"><p class="text-[10px] font-black uppercase tracking-[0.5em] opacity-60 mb-6">Faltam poucos dias para a</p><h4 class="text-4xl font-[1000] uppercase italic tracking-tighter mb-8" contenteditable="true">EXPÔ LAGOA 2025</h4><div class="flex justify-center gap-4 text-3xl font-black" contenteditable="true"><div>12 <span class="block text-[8px] uppercase opacity-50">Dias</span></div>:<div>08 <span class="block text-[8px] uppercase opacity-50">Hrs</span></div></div></div>`
  },
  {
    id: 'pix_donation',
    name: 'Apoio PIX',
    category: 'Comunidade',
    icon: 'fa-qrcode',
    html: `<div class="p-8 rounded-[3rem] border-2 border-zinc-900/10 flex flex-col md:flex-row items-center gap-8 shadow-2xl"><div class="w-24 h-24 bg-zinc-900 rounded-2xl flex items-center justify-center text-white text-5xl shrink-0 shadow-lg"><i class="fas fa-qrcode"></i></div><div class="flex-1 text-center md:text-left"><h4 class="text-xl font-[1000] uppercase italic tracking-tighter leading-none mb-2">APOIE O JORNALISMO</h4><p class="text-[10px] font-mono opacity-60" contenteditable="true">PIX: pauta@lagoaformosa.com</p></div></div>`
  },
  {
    id: 'lottery_results',
    name: 'Resultados Loteria',
    category: 'Serviços',
    icon: 'fa-clover',
    html: `<div class="border-2 border-zinc-900/10 p-8 rounded-[2.5rem] shadow-xl text-center"><p class="text-[9px] font-black uppercase opacity-50 mb-4 tracking-widest">Mega-Sena</p><div class="flex gap-2 justify-center font-black" contenteditable="true"><span class="w-10 h-10 flex items-center justify-center bg-zinc-900 text-white rounded-full">04</span> <span class="w-10 h-10 flex items-center justify-center bg-zinc-900 text-white rounded-full">12</span> <span class="w-10 h-10 flex items-center justify-center bg-zinc-900 text-white rounded-full">35</span> <span class="w-10 h-10 flex items-center justify-center bg-zinc-900 text-white rounded-full">59</span></div></div>`
  },
  {
    id: 'religious_agenda',
    name: 'Agenda de Fé',
    category: 'Comunidade',
    icon: 'fa-church',
    html: `<div class="border-2 border-zinc-900/10 p-8 rounded-[3rem] text-center shadow-lg"><i class="fas fa-hands-praying opacity-50 text-3xl mb-4"></i><h4 class="text-lg font-[1000] uppercase italic mb-6 tracking-tighter">AGENDA DE FÉ</h4><div class="flex justify-between items-center bg-zinc-900/5 p-3 rounded-2xl" contenteditable="true"><span class="text-[10px] font-black uppercase opacity-70">Missa Matriz</span><span class="text-xs font-black">19:00</span></div></div>`
  },
  {
    id: 'pet_adoption',
    name: 'Espaço Pet LFNM',
    category: 'Social',
    icon: 'fa-paw',
    html: `<div class="border-2 border-zinc-900/10 rounded-[2.5rem] p-6 shadow-xl flex flex-col md:flex-row gap-6 items-center"><div class="w-24 h-24 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400 text-3xl shrink-0"><i class="fas fa-dog"></i></div><div class="flex-1 text-center md:text-left text-left"><span class="text-[9px] font-black uppercase tracking-widest opacity-50">Adoção Solidária</span><h4 class="text-xl font-black uppercase italic tracking-tighter" contenteditable="true">PROCURA-SE UM LAR</h4></div></div>`
  },
  {
    id: 'found_docs',
    name: 'Achados e Perdidos',
    category: 'Serviços',
    icon: 'fa-id-card-clip',
    html: `<div class="bg-zinc-900/5 p-8 rounded-[2rem] border-2 border-zinc-900/10 shadow-sm text-left"><h5 class="text-xs font-[1000] uppercase mb-4 flex items-center gap-3"><i class="fas fa-box-open"></i> ACHADOS E PERDIDOS</h5><div class="p-3 bg-white border border-zinc-100 text-xs font-bold text-zinc-600 flex justify-between" contenteditable="true"><span>RG: João Silva</span><span class="font-black">REDAÇÃO</span></div></div>`
  },
  {
    id: 'podcast_player',
    name: 'Player Podcast',
    category: 'Mídia',
    icon: 'fa-podcast',
    html: `<div class="bg-zinc-900 p-8 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden border-b-8 border-red-600 flex items-center gap-6"><div class="w-14 h-14 bg-red-600 rounded-full flex items-center justify-center text-xl shrink-0"><i class="fas fa-play ml-1"></i></div><div class="flex-1 text-left"><p class="text-[9px] font-black uppercase text-red-500 tracking-widest mb-1">Ouça Agora</p><h4 class="text-lg font-black uppercase italic tracking-tighter" contenteditable="true">PODCAST LFNM #42</h4></div></div>`
  },
  {
    id: 'vet_duty',
    name: 'Plantão Vet',
    category: 'Serviços',
    icon: 'fa-stethoscope',
    html: `<div class="border-2 border-zinc-900/10 p-8 rounded-[2.5rem] flex items-center gap-6 shadow-sm"><div class="w-16 h-16 bg-zinc-900 text-white rounded-2xl flex items-center justify-center text-3xl shadow-lg"><i class="fas fa-dog"></i></div><div class="flex-1 text-left"><p class="text-[9px] font-black uppercase tracking-widest mb-1 opacity-50">Cuidado Animal</p><p class="text-xl font-black uppercase italic tracking-tighter" contenteditable="true">CLÍNICA PET</p></div></div>`
  },
  {
    id: 'local_hero',
    name: 'Personagem Local',
    category: 'Social',
    icon: 'fa-star',
    html: `<div class="bg-zinc-900 p-10 rounded-[4rem] text-white text-center shadow-2xl relative overflow-hidden"><span class="text-[9px] font-black uppercase tracking-[0.4em] mb-6 block opacity-50">HISTÓRIAS DE LAGOA</span><h4 class="text-3xl font-[1000] uppercase italic tracking-tighter mb-4" contenteditable="true">NOME DO MORADOR</h4><p class="text-sm font-medium italic opacity-70" contenteditable="true">"Exemplo de dedicação à nossa comunidade."</p></div>`
  },
  {
    id: 'legal_notice',
    name: 'Edital / Aviso',
    category: 'Documentos',
    icon: 'fa-gavel',
    html: `<div class="border-4 border-double border-zinc-400 p-10 rounded-xl font-serif text-center shadow-inner"><h4 class="text-xs font-black uppercase opacity-50 mb-6 tracking-widest">EDITAL DE CONVOCAÇÃO</h4><p class="text-sm leading-relaxed italic" contenteditable="true">Fazemos saber que realizar-se-á a assembleia...</p></div>`
  },
  {
    id: 'weekly_menu',
    name: 'Cardápio Regional',
    category: 'Guia',
    icon: 'fa-utensils',
    html: `<div class="border-2 border-zinc-900/10 p-8 rounded-[3rem] shadow-xl text-center"><h4 class="text-lg font-[1000] uppercase italic mb-6 tracking-tighter">PRATO DO DIA</h4><div class="flex justify-between border-b border-zinc-900/10 pb-2 text-left" contenteditable="true"><span class="font-black text-xs uppercase opacity-70">RESTAURANTE</span><span class="text-xs font-bold italic">FEIJOADA</span></div></div>`
  },
  {
    id: 'expert_quote',
    name: 'Citação Welix',
    category: 'Editorial',
    icon: 'fa-microphone',
    html: `<div class="my-12 flex flex-col items-center text-center"><div class="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center text-white text-2xl shadow-xl mb-6"><i class="fas fa-microphone-lines"></i></div><blockquote class="text-3xl font-[1000] uppercase italic tracking-tighter leading-[0.9] max-w-xl mx-auto mb-6 text-center" contenteditable="true">"A VERDADE É O NOSSO COMPROMISSO."</blockquote><cite class="text-[10px] font-black uppercase tracking-[0.4em] opacity-50">— WELIX DUARTE</cite></div>`
  }
];
