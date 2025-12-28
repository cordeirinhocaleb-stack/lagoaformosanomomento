
import React from 'react';

interface LogoProps {
  className?: string;
}

/**
 * [COMPONENTE VISUAL] Logo Oficial
 * ------------------------------------------------------------------
 * Este é o componente central da identidade visual.
 * Onde quer que este componente (<Logo />) seja usado (Footer, Login, Cards),
 * ele exibirá a imagem definida abaixo.
 * 
 * Efeito: Adicionada classe 'animate-mic-shake' para movimento global no hover.
 */
const Logo: React.FC<LogoProps> = ({ className, ...props }) => {
  // [CONFIGURAÇÃO] Link da Nova Imagem
  const logoUrl = "https://lh3.googleusercontent.com/d/1u0-ygqjuvPa4STtU8gT8HFyF05luNo1P";

  return (
    <div className={`inline-block bg-transparent transition-all duration-500 ${className}`}>
      <img 
        src={logoUrl} 
        alt="Logo Oficial Lagoa Formosa No Momento" 
        className="block object-contain w-full h-full cursor-pointer select-none bg-transparent animate-mic-shake"
        {...props}
        onError={(e) => {
          // [FALLBACK] Caso a imagem principal falhe, tenta carregar uma imagem de segurança
          e.currentTarget.src = "https://lh3.googleusercontent.com/d/16YlahxaRxgS7XpJ0Kbm5JpNGn4cWiA8f";
        }}
      />
    </div>
  );
};

export default Logo;
