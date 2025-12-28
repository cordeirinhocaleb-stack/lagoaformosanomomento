
import React, { useState } from 'react';
import { User, UserRole } from '../types';
import Logo from './Logo';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulação de delay de rede para UX
    setTimeout(() => {
        // Lógica de Atribuição de Cargo (Mock)
        // Em produção, isso viria do backend após validar a senha
        let role: UserRole = 'Repórter'; // Cargo padrão
        
        const userLower = email.toLowerCase();
        
        if (userLower.includes('dev') || userLower === 'admin') {
            role = 'Desenvolvedor';
        } else if (userLower.includes('welix') || userLower.includes('chefe')) {
            role = 'Editor-Chefe';
        } else if (userLower.includes('jornalista')) {
            role = 'Jornalista';
        } else if (userLower.includes('estagiario')) {
            role = 'Estagiário';
        }

        const user: User = {
          id: Math.random().toString(36).substr(2, 9),
          name: email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1), // Formata nome baseado no email
          email: email,
          role: role,
          status: 'active'
        };
        
        onLogin(user);
        setLoading(false);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-[3000] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4">
      {/* Botão de Fechar/Voltar (Garante que o usuário não fique preso) */}
      <a 
        href="#/" 
        className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors text-sm font-bold uppercase tracking-widest flex items-center gap-2 z-20"
      >
        <i className="fas fa-times"></i> Cancelar
      </a>

      {/* Card de Login Minimalista */}
      <div className="w-full max-w-[400px] bg-white rounded-3xl overflow-hidden shadow-2xl animate-fadeInUp relative z-10">
        
        {/* Header Visual */}
        <div className="bg-gray-50 p-8 text-center border-b border-gray-100 flex flex-col items-center">
          <div className="w-16 h-16 mb-4">
            <Logo />
          </div>
          <h2 className="text-gray-900 text-xl font-black uppercase tracking-tighter">
            Acesso <span className="text-red-600">Restrito</span>
          </h2>
          <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-1">
            Portal Administrativo
          </p>
        </div>

        {/* Formulário Clean */}
        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          <div className="space-y-4">
            <div className="relative group">
              <i className="fas fa-user absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-red-600 transition-colors"></i>
              <input 
                type="text" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Usuário ou E-mail"
                className="w-full bg-gray-50 border border-gray-100 p-4 pl-12 rounded-xl outline-none focus:border-red-600 focus:bg-white focus:shadow-lg transition-all font-medium text-sm text-gray-800 placeholder:text-gray-400"
              />
            </div>

            <div className="relative group">
              <i className="fas fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-red-600 transition-colors"></i>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Senha de Acesso"
                className="w-full bg-gray-50 border border-gray-100 p-4 pl-12 rounded-xl outline-none focus:border-red-600 focus:bg-white focus:shadow-lg transition-all font-medium text-sm text-gray-800 placeholder:text-gray-400"
              />
            </div>
          </div>

          <div className="pt-2">
            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-4 rounded-xl font-black uppercase text-xs tracking-[0.2em] hover:bg-red-600 transition-all shadow-xl active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
            >
              {loading ? (
                <>
                  <i className="fas fa-circle-notch fa-spin"></i> Verificando...
                </>
              ) : (
                <>
                  Entrar <i className="fas fa-arrow-right"></i>
                </>
              )}
            </button>
          </div>

          <div className="text-center pt-2">
            <a href="#" className="text-[10px] font-bold text-gray-400 hover:text-red-600 uppercase tracking-widest transition-colors">
              Esqueceu suas credenciais?
            </a>
          </div>
        </form>
      </div>
      
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-600/20 blur-[100px] rounded-full pointer-events-none"></div>
    </div>
  );
};

export default Login;
