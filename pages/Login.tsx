
import React, { useState } from 'react';
import { User, UserRole } from '../types';
import Logo from '../components/common/Logo';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('dev');
  const [password, setPassword] = useState('123');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (mode === 'signup' && password !== confirmPassword) {
        alert("As senhas não coincidem.");
        return;
    }

    setLoading(true);
    
    // Simulação de autenticação/registro
    setTimeout(() => {
        let role: UserRole = 'Repórter';
        const userLower = email.toLowerCase();
        
        // Simulação de Regras de Cargo baseadas no e-mail (para teste fácil)
        if (userLower.includes('dev') || userLower === 'admin') role = 'Desenvolvedor';
        else if (userLower.includes('welix')) role = 'Editor-Chefe';
        else if (userLower.includes('jornalista')) role = 'Jornalista';
        else if (userLower.includes('estagiario')) role = 'Estagiário';

        // Se for cadastro, usa o nome digitado, senão extrai do email
        const finalName = mode === 'signup' ? name : email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1);

        const user: User = {
          id: Math.random().toString(36).substr(2, 9),
          name: finalName,
          email: email,
          role: role,
          status: 'active',
          avatar: `https://ui-avatars.com/api/?name=${finalName}&background=random`
        };
        
        onLogin(user);
        setLoading(false);
    }, 1500);
  };

  const toggleMode = () => {
      setMode(mode === 'login' ? 'signup' : 'login');
      setPassword('');
      setConfirmPassword('');
  };

  return (
    <div className="fixed inset-0 z-[3000] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4">
      <a href="#/" className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors text-sm font-bold uppercase tracking-widest flex items-center gap-2 z-20">
        <i className="fas fa-times"></i> Cancelar
      </a>

      <div className="w-full max-w-[400px] bg-white rounded-3xl overflow-hidden shadow-2xl animate-fadeInUp relative z-10">
        <div className="bg-gray-50 p-8 text-center border-b border-gray-100 flex flex-col items-center">
          <div className="w-16 h-16 mb-4"><Logo /></div>
          <h2 className="text-gray-900 text-xl font-black uppercase tracking-tighter">
            {mode === 'login' ? 'Acesso ' : 'Nova '} 
            <span className="text-red-600">{mode === 'login' ? 'Restrito' : 'Conta'}</span>
          </h2>
          <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-1">
            {mode === 'login' ? 'Portal Administrativo' : 'Junte-se à nossa redação'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-4">
            {mode === 'signup' && (
                <div className="relative group animate-slideUp">
                    <i className="fas fa-id-card absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"></i>
                    <input 
                        type="text" 
                        required 
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                        placeholder="Nome Completo" 
                        className="w-full bg-gray-50 border border-gray-100 p-4 pl-12 rounded-xl text-sm font-bold outline-none focus:border-red-500 transition-all" 
                    />
                </div>
            )}

            <div className="relative group">
              <i className="fas fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"></i>
              <input 
                type="text" 
                required 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="E-mail ou Usuário" 
                className="w-full bg-gray-50 border border-gray-100 p-4 pl-12 rounded-xl text-sm font-bold outline-none focus:border-red-500 transition-all" 
              />
            </div>

            <div className="relative group">
              <i className="fas fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"></i>
              <input 
                type="password" 
                required 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="Senha" 
                className="w-full bg-gray-50 border border-gray-100 p-4 pl-12 rounded-xl text-sm font-bold outline-none focus:border-red-500 transition-all" 
              />
            </div>

            {mode === 'signup' && (
                <div className="relative group animate-slideUp">
                    <i className="fas fa-shield-alt absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"></i>
                    <input 
                        type="password" 
                        required 
                        value={confirmPassword} 
                        onChange={(e) => setConfirmPassword(e.target.value)} 
                        placeholder="Confirmar Senha" 
                        className="w-full bg-gray-50 border border-gray-100 p-4 pl-12 rounded-xl text-sm font-bold outline-none focus:border-red-500 transition-all" 
                    />
                </div>
            )}

            <button type="submit" disabled={loading} className="w-full bg-black text-white py-4 rounded-xl font-black uppercase text-xs tracking-[0.2em] hover:bg-red-600 transition-all shadow-xl active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed mt-2">
              {loading ? (
                  <span className="flex items-center justify-center gap-2"><i className="fas fa-circle-notch fa-spin"></i> Processando...</span>
              ) : (
                  mode === 'login' ? 'Entrar' : 'Criar Conta'
              )}
            </button>

            <div className="pt-4 text-center border-t border-gray-50 mt-4">
                <button 
                    type="button"
                    onClick={toggleMode}
                    className="text-[10px] font-bold text-gray-400 hover:text-red-600 uppercase tracking-widest transition-colors"
                >
                    {mode === 'login' ? 'Não tem acesso? Criar conta' : 'Já possui conta? Fazer login'}
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
