
export type UserRole =
  | 'Desenvolvedor'
  | 'Editor-Chefe'
  | 'Repórter'
  | 'Jornalista'
  | 'Estagiário'
  | 'Anunciante'
  | 'Empresa'
  | 'Prestador de Serviço'
  | 'Leitor';

export type UserStatus = 'active' | 'suspended';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: string;
  avatar?: string;
  password?: string;
  bio?: string;
  isVerified?: boolean;

  // Dados Pessoais Estendidos
  birthDate?: string;
  zipCode?: string;
  city?: string;
  state?: string;
  phone?: string;
  document?: string; // CPF ou CNPJ

  // Identidade Profissional (Para Bicos e Empregos)
  profession?: string;
  education?: string;
  skills?: string[];
  professionalBio?: string;
  availability?: 'full_time' | 'part_time' | 'weekends' | 'freelance';

  // Identidade Comercial (Para Classificados e Anunciantes)
  companyName?: string;
  businessType?: string;
  whatsappVisible?: boolean;

  themePreference?: 'light' | 'dark';
  socialLinks?: {
    instagram?: string;
    twitter?: string;
    linkedin?: string;
  };
  permissions?: Record<string, boolean>;
  advertiserPlan?: string;
  activePlans?: string[]; // Suporte a múltiplos planos (até 3)
  subscriptionStart?: string;
  subscriptionEnd?: string;
  twoFactorEnabled?: boolean;

  // Créditos e Limites Customizados (Override do Plano)
  usageCredits?: {
    postsRemaining?: number;
    videosRemaining?: number; // Redes Sociais
    featuredDaysRemaining?: number; // Destaques (Locais)
    bannersRemaining?: number;
    popupsRemaining?: number;
    jobsRemaining?: number; // Vagas de Emprego
    gigsRemaining?: number; // Bicos
    clicksBalance?: number; // Saldo de cliques extras
  };

  // Carteira Virtual (Para compra de upgrades/planos)
  siteCredits?: number;

  customLimits?: {
    maxUploadSize?: number; // em MB
    canPostUrgent?: boolean;
  };
}

export interface UserSession {
  id: string;
  device: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
}

export interface Invoice {
  id: string;
  date: string;
  description: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
}
