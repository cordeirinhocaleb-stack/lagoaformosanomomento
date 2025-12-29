
import React from 'react';

interface LogoProps {
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ className, ...props }) => {
  // URL Principal
  const logoUrl = "https://lh3.googleusercontent.com/d/1u0-ygqjuvPa4STtU8gT8HFyF05luNo1P";
  
  // Placeholder Base64 transparente para evitar requisições de rede falhas (Loop ORB)
  const fallbackBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

  return (
    <div className={`inline-block bg-transparent transition-all duration-500 ${className}`}>
      <img 
        src={logoUrl} 
        alt="Logo Oficial Lagoa Formosa No Momento" 
        className="block object-contain w-full h-full cursor-pointer select-none bg-transparent animate-mic-shake"
        {...props}
        onError={(e) => {
          // INTERROMPE O LOOP INFINITO: Remove o listener de erro imediatamente
          e.currentTarget.onerror = null;
          // Define um fallback seguro que não requer rede
          e.currentTarget.src = fallbackBase64;
          // Opcional: Log discreto para debug
          // console.warn("Logo fallback triggered to avoid ORB loop");
        }}
      />
    </div>
  );
};

export default Logo;
