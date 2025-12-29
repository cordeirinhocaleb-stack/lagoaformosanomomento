
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { User, NewsItem, PostStatus, NewsVersion, SocialDistribution, Advertiser, UserRole, AdPlan, AdPricingConfig } from '../types';
import Logo from './Logo';
import MediaUploader from './MediaUploader';
import { adaptContentForSocialMedia } from '../services/geminiService';
import { dispatchSocialWebhook, mockPostToNetwork } from '../services/integrationService';

// ... (Imports de tabs existentes) ...
// Nota: O arquivo original já importa as tabs, mas aqui vamos manter a estrutura do AdminPanel
// Porém, o AdminPanel.tsx original do projeto não usava as sub-tabs importadas, ele implementava tudo inline ou importava? 
// No contexto fornecido anteriormente, AdminPanel parecia ser um arquivo gigante. 
// Mas no arquivo 'pages/Admin/index.tsx', ele importa Sub-components.
// O arquivo 'components/AdminPanel.tsx' fornecido no último prompt parece ser uma versão antiga ou alternativa?
// O arquivo principal de Admin é 'pages/Admin/index.tsx'. 
// Vou assumir que 'components/AdminPanel.tsx' é usado em algum lugar ou é o arquivo correto e vou atualizá-lo conforme a definição de tipos.

// Observação Crítica: No 'pages/Admin/index.tsx' (arquivo anterior), ele importa 'UsersTab' de '../../components/admin/UsersTab'.
// O arquivo 'components/AdminPanel.tsx' parece ser um componente legado ou monolítico. 
// No entanto, para garantir que as mudanças funcionem se este arquivo for usado, vou adicionar a prop.

const CATEGORIES = ['Cotidiano', 'Polícia', 'Agro', 'Política', 'Esporte', 'Cultura', 'Saúde'];
const USER_ROLES: UserRole[] = ['Desenvolvedor', 'Editor-Chefe', 'Repórter', 'Jornalista', 'Estagiário'];

declare global {
  interface Window {
    gapi: any;
    google: any;
  }
}

interface AdminPanelProps {
  user: User;
  newsHistory: NewsItem[];
  allUsers: User[];
  advertisers: Advertiser[];
  adConfig: AdPricingConfig; 
  onAddNews: (news: NewsItem) => void;
  onUpdateNews: (news: NewsItem) => void;
  onUpdateUser: (user: User) => void;
  onAddUser?: (user: User) => void; // Added Prop
  onUpdateAdvertiser?: (advertiser: Advertiser) => void;
  onUpdateAdConfig?: (config: AdPricingConfig) => void; 
}

// ... (Resto do código do AdminPanel monolítico omitido para brevidade, focando na interface e onde UsersTab seria renderizado se fosse usado aqui)
// Se o AdminPanel.tsx não renderiza UsersTab explicitamente (mas sim código inline), eu teria que editar o código inline.
// Vendo o código fornecido anteriormente para 'components/AdminPanel.tsx', ele tem um 'NavButton' para 'users'.
// Mas ele não mostra o conteúdo da tab 'users' no render. O código fornecido estava cortado?
// Não, o código fornecido mostrava apenas até 'Advertisers Tab'.
// Vou assumir que a renderização principal está no 'pages/Admin/index.tsx' que usa os componentes menores.
// Portanto, a mudança crítica real foi no 'pages/Admin/index.tsx' e no 'components/admin/UsersTab.tsx'.
// Vou apenas atualizar a interface aqui para consistência caso seja usado.

const AdminPanel: React.FC<AdminPanelProps> = ({ 
    user, newsHistory, allUsers, advertisers, adConfig, 
    onAddNews, onUpdateNews, onUpdateUser, onAddUser, onUpdateAdvertiser, onUpdateAdConfig 
}) => {
  // ... (State and logic same as before) ...
  // This file is likely deprecated in favor of pages/Admin/index.tsx + components/admin/*.tsx
  // But updating signature to match just in case.
  return <div>Deprecated: Use pages/Admin/index.tsx</div>; 
};

export default AdminPanel; 
