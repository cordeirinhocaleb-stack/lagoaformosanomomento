// TESTE: Arquivo temporário para validar se os temas customizados funcionam
// Se este arquivo compilar sem erros, significa que a estrutura ColorTheme está correta

import { ColorTheme } from './utils/engagementThemeHelper';

const testePolicia: ColorTheme = {
    id: 'poll_police',
    label: '🚔 Polícia',
    preview: 'bg-blue-500',
    classes: {
        wrapper: 'bg-blue-50 border-4 border-blue-900 shadow-2xl rounded',
        text: 'text-blue-900',
        accent: 'bg-blue-500',
        secondary: 'border-blue-200',
        button: 'hover:bg-blue-600',
        header: 'font-black uppercase text-3xl',
        badge: 'bg-blue-900 text-white px-4 py-2 rounded font-mono',
        option: 'border-l-8 border-blue-600 bg-white rounded shadow',
        barStyle: 'h-4 bg-blue-600 rounded-none'
    }
};

console.log('Tema Police:', testePolicia);
