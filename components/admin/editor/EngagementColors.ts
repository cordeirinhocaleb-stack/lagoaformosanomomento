
export interface ColorTheme {
    id: string; // e.g., 'blue_lagoon'
    label: string; // e.g., 'Azul Lagoa'
    preview: string; // Tailwind class for preview circle (e.g. bg-blue-500)
    classes: {
        wrapper: string; // Main container background and border
        text: string; // Main text color
        accent: string; // Primary accent (buttons, progress bars)
        secondary: string; // Secondary accent (borders, gradients)
        button: string; // Specific button interaction style
    }
}

// Helper to create standarized themes
const createTheme = (id: string, label: string, color: string): ColorTheme => {
    // Basic mapping for standard colors
    const colors: Record<string, any> = {
        blue: { wrapper: 'bg-blue-50 border-blue-100', text: 'text-blue-900', accent: 'bg-blue-500', secondary: 'border-blue-200', btn: 'hover:bg-blue-600', preview: 'bg-blue-500' },
        red: { wrapper: 'bg-red-50 border-red-100', text: 'text-red-900', accent: 'bg-red-500', secondary: 'border-red-200', btn: 'hover:bg-red-600', preview: 'bg-red-500' },
        green: { wrapper: 'bg-green-50 border-green-100', text: 'text-green-900', accent: 'bg-green-500', secondary: 'border-green-200', btn: 'hover:bg-green-600', preview: 'bg-green-500' },
        amber: { wrapper: 'bg-amber-50 border-amber-100', text: 'text-amber-900', accent: 'bg-amber-500', secondary: 'border-amber-200', btn: 'hover:bg-amber-600', preview: 'bg-amber-500' },
        purple: { wrapper: 'bg-purple-50 border-purple-100', text: 'text-purple-900', accent: 'bg-purple-500', secondary: 'border-purple-200', btn: 'hover:bg-purple-600', preview: 'bg-purple-500' },
        zinc: { wrapper: 'bg-zinc-50 border-zinc-200', text: 'text-zinc-800', accent: 'bg-zinc-800', secondary: 'border-zinc-300', btn: 'hover:bg-zinc-700', preview: 'bg-zinc-800' },
        dark: { wrapper: 'bg-zinc-900 border-zinc-800', text: 'text-white', accent: 'bg-blue-500', secondary: 'border-zinc-700', btn: 'hover:bg-blue-600', preview: 'bg-zinc-900' },
    };

    const c = colors[color] || colors['blue'];

    return {
        id,
        label,
        preview: c.preview,
        classes: {
            wrapper: c.wrapper,
            text: c.text,
            accent: c.accent,
            secondary: c.secondary,
            button: c.btn
        }
    };
};

export const ENGAGEMENT_COLOR_THEMES: Record<string, ColorTheme[]> = {
    // Default Fallback
    default: [
        createTheme('default_blue', 'Padrão (Azul)', 'blue'),
        createTheme('urgent_red', 'Urgente (Vermelho)', 'red'),
        createTheme('nature_green', 'Natureza (Verde)', 'green'),
        createTheme('royal_purple', 'Real (Roxo)', 'purple'),
        createTheme('dark_mode', 'Dark Mode', 'dark'),
    ],
    // Poll Specific
    poll: [
        createTheme('poll_clean', 'Clean Blue', 'blue'),
        createTheme('poll_hot', 'Hot Topic', 'red'),
        createTheme('poll_eco', 'Eco Friendly', 'green'),
        createTheme('poll_dark', 'Night Vote', 'dark'),
        createTheme('poll_grey', 'Neutral', 'zinc'),
    ],
    // Quiz Specific
    quiz: [
        createTheme('quiz_academic', 'Academic', 'blue'),
        createTheme('quiz_fun', 'Playful Purple', 'purple'),
        createTheme('quiz_alert', 'Challenge Red', 'red'),
        createTheme('quiz_nature', 'Biology', 'green'),
        createTheme('quiz_dark', 'Mystery', 'dark'),
    ],
    // Countdown Specific
    countdown: [
        createTheme('cd_urgent', 'Ending Soon', 'red'),
        createTheme('cd_calm', 'Future Event', 'blue'),
        createTheme('cd_launch', 'Launch Day', 'amber'),
        createTheme('cd_dark', 'Midnight', 'dark'),
        createTheme('cd_sleek', 'Sleek', 'zinc'),
    ]
};

export const getEngagementColors = (type: string): ColorTheme[] => {
    return ENGAGEMENT_COLOR_THEMES[type] || ENGAGEMENT_COLOR_THEMES['default'];
};
