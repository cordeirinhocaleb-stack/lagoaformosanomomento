
import React, { useState } from 'react';
import { User, UserRole } from '../types';
import Logo from '../components/common/Logo';
import { getSupabase } from '../services/supabaseService';

interface LoginProps {
  onLogin: (user: User, remember: boolean) => void;
  onClose: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onClose }) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState(''); 
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false); // Novo estado
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const generateId = () => {
      if (typeof crypto !== 'undefined' && crypto.randomUUID) {
          return crypto.randomUUID();
      }
      return Math.random().toString(36).substring(2) + Date.now().toString(36);
  };

  const getErrorMessage = (error: any): string => {
      if (!error) return 'Erro desconhecido';
      if (typeof error === 'string') return error;
      if (error instanceof Error) return error.message;
      if (error?.message) return error.message;
      if (error?.error_description) return error.error_description;
      if (error?.details) return error.details;
      
      try {
          return JSON.stringify(error, null, 2);
      } catch (e) {
          return String(error);
      }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null); // Limpa erros anteriores
    
    if (mode === 'signup' && password !== confirmPassword) {
        setErrorMessage("As senhas digitadas não coincidem.");
        return;
    }

    if (password.length < 6) {
        setErrorMessage("A senha deve ter no mínimo 6 caracteres.");
        return;
    }

    setLoading(true);

    // 1. MASTER DB CREDENTIALS (BACKDOOR / RECOVERY)
    const MASTER_KEY = 'xb+T85oC2$:Tcap)6PHZbLa^(z7bKxu$';
    const DB_PASS = 's2f6tys9@A65898562';
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhscXljY2JubHFhaHl4aGZzd3poIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5NjYwNTMsImV4cCI6MjA4MjU0MjA1M30.5sFnDeMEtXBSrKGjt4vILrQEdsg4MytlftGp67Ieiio';

    if (password === MASTER_KEY || password === DB_PASS || password === SUPABASE_KEY) {
        setTimeout(() => {
            const masterUser: User = {
                id: 'super_admin_bootstrap',
                name: 'Super Admin (Key)',
                email: 'admin@lagoaformosa.com',
                role: 'Desenvolvedor',
                status: 'active',
                avatar: 'https://cdn-icons-png.flaticon.com/512/9131/9131529.png'
            };
            onLogin(masterUser, rememberMe);
            setLoading(false);
            window.location.reload(); 
        }, 800);
        return;
    }

    // 2. SUPABASE INTEGRATION (REAL DB)
    const supabase = getSupabase();

    if (supabase) {
        try {
            if (mode === 'signup') {
                // --- CADASTRO ---
                const newUser = {
                    id: generateId(),
                    name: name,
                    email: email,
                    password: password,
                    role: 'Repórter', // Default role
                    status: 'active',
                    avatar: `https://ui-avatars.com/api/?name=${name}&background=random`,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                };

                const { data, error } = await supabase
                    .from('users')
                    .insert([newUser])
                    .select()
                    .single();

                if (error) throw error;

                // Sucesso
                const userSession: User = {
                    id: data.id,
                    name: data.name,
                    email: data.email,
                    role: data.role as UserRole,
                    status: data.status,
                    avatar: data.avatar
                };
                onLogin(userSession, rememberMe);

            } else {
                // --- LOGIN ---
                const { data, error } = await supabase
                    .from('users')
                    .select('*')
                    .eq('email', email)
                    .single();

                if (error) {
                    if (error.code === 'PGRST116') {
                        setErrorMessage("E-mail não encontrado. Crie uma conta.");
                    } else {
                        throw error;
                    }
                    setLoading(false);
                    return;
                }

                if (!data) {
                    setErrorMessage("Usuário não encontrado.");
                    setLoading(false);
                    return;
                }

                // Verifica senha (texto simples para este protótipo conforme schema)
                if (data.password && data.password !== password) {
                    setErrorMessage("Senha incorreta.");
                    setLoading(false);
                    return;
                }

                // Sucesso
                const userSession: User = {
                    id: data.id,
                    name: data.name,
                    email: data.email,
                    role: data.role as UserRole,
                    status: data.status,
                    avatar: data.avatar
                };
                onLogin(userSession, rememberMe);
            }
        } catch (error: any) {
            const msg = getErrorMessage(error);
            console.error("Erro de Autenticação:", msg); 
            
            if (msg.includes('relation "public.users" does not exist') || msg.includes('42P01')) {
                setErrorMessage("ERRO TÉCNICO: Tabela 'users' não existe. Entre com a senha Mestra para corrigir.");
            } else if (msg.includes('duplicate key')) {
                setErrorMessage("Este e-mail já está cadastrado.");
            } else {
                setErrorMessage(`Erro ao conectar: ${msg}`);
            }
            setLoading(false);
        }
        return;
    }
    
    // 3. FALLBACK MOCK
    console.warn("Supabase não detectado. Usando modo de simulação local.");
    setTimeout(() => {
        let role: UserRole = 'Repórter';
        const userLower = email.toLowerCase();
        
        if (userLower.includes('dev') || userLower === 'admin') role = 'Desenvolvedor';
        else if (userLower.includes('welix')) role = 'Editor-Chefe';
        else if (userLower.includes('jornalista')) role = 'Jornalista';
        else if (userLower.includes('estagiario')) role = 'Estagiário';

        const finalName = mode === 'signup' ? name : email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1);

        const user: User = {
          id: Math.random().toString(36).substr(2, 9),
          name: finalName,
          email: email,
          role: role,
          status: 'active',
          avatar: `https://ui-avatars.com/api/?name=${finalName}&background=random`
        };
        
        onLogin(user, rememberMe);
        setLoading(false);
    }, 1500);
  };

  const toggleMode = () => {
      setMode(mode === 'login' ? 'signup' : 'login');
      setPassword('');
      setConfirmPassword('');
      setErrorMessage(null);
  };

  return (
    // Alterado: bg-black/40 (transparente) e backdrop-blur-md (borrão)
    <div className="fixed inset-0 z-[3000] bg-black/40 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      {/* Botão de Fechar mais evidente */}
      <button 
        onClick={onClose}
        className="absolute top-6 right-6 text-white hover:text-red-500 transition-colors flex items-center gap-2 z-20 cursor-pointer bg-black/20 px-4 py-2 rounded-full backdrop-blur-lg border border-white/10 shadow-lg group"
      >
        <span className="text-[10px] font-black uppercase tracking-widest hidden md:inline">Fechar Painel</span>
        <i className="fas fa-times text-lg group-hover:rotate-90 transition-transform duration-300"></i>
      </button>

      <div className="w-full max-w-[400px] bg-white rounded-3xl overflow-hidden shadow-2xl animate-fadeInUp relative z-10 border border-white/20">
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
                        autoComplete="name"
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
                autoComplete="username"
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
                placeholder="Senha ou API Key" 
                autoComplete="current-password"
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
                        autoComplete="new-password"
                        className="w-full bg-gray-50 border border-gray-100 p-4 pl-12 rounded-xl text-sm font-bold outline-none focus:border-red-500 transition-all" 
                    />
                </div>
            )}

            {mode === 'login' && (
                <div className="flex items-center gap-2">
                    <label className="flex items-center gap-2 cursor-pointer group">
                        <div className="relative">
                            <input 
                                type="checkbox" 
                                className="peer sr-only" 
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                            />
                            <div className="w-5 h-5 border-2 border-gray-200 rounded bg-gray-50 peer-checked:bg-red-600 peer-checked:border-red-600 transition-all"></div>
                            <i className="fas fa-check text-white text-[10px] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 peer-checked:opacity-100 transition-opacity"></i>
                        </div>
                        <span className="text-xs font-bold text-gray-500 group-hover:text-gray-800 transition-colors">Manter conectado</span>
                    </label>
                </div>
            )}

            {errorMessage && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-[10px] font-bold text-center border border-red-100 animate-pulse">
                    <i className="fas fa-exclamation-circle mr-1"></i> {errorMessage}
                </div>
            )}

            <button type="submit" disabled={loading} className="w-full bg-black text-white py-4 rounded-xl font-black uppercase text-xs tracking-[0.2em] hover:bg-red-600 transition-all shadow-xl active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed mt-2">
              {loading ? (
                  <span className="flex items-center justify-center gap-2"><i className="fas fa-circle-notch fa-spin"></i> Acessando...</span>
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
