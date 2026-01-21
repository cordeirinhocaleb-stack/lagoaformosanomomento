/**
 * Utilitário para traduzir mensagens de erro técnicas do Supabase Auth
 * para mensagens amigáveis e claras para o usuário final em Português.
 */

export const translateAuthError = (errorMessage: string): string => {
    const error = errorMessage.toLowerCase();

    // Erros de Envio de Email
    if (error.includes('error sending confirmation email') || error.includes('535 5.7.8')) {
        return 'Erro de configuração no servidor de e-mail (SMTP). Se você for o administrador, verifique as credenciais de e-mail no painel da Supabase. Para usuários: tente novamente mais tarde.';
    }

    if (error.includes('email rate limit exceeded')) {
        return 'Muitas tentativas de envio de e-mail. Por favor, aguarde um pouco antes de tentar novamente.';
    }

    // Erros de Usuário existente
    if (error.includes('user already registered') || error.includes('already exists')) {
        return 'Este e-mail já está cadastrado em nosso sistema. Tente fazer login ou recupere sua senha.';
    }

    // Erros de Login
    if (error.includes('invalid login credentials') || error.includes('credentials invalid') || error.includes('invalid grant')) {
        return 'Usuário ou senha incorretos. Por favor, verifique seus dados.';
    }

    if (error.includes('email not confirmed')) {
        return 'Seu e-mail ainda não foi confirmado. Por favor, verifique sua caixa de entrada (e pasta de spam) para ativar sua conta.';
    }

    // Erros de Segurança / Captcha
    if (error.includes('captcha verification process failed') || error.includes('captcha invalid') || error.includes('timeout-or-duplicate') || error.includes('no captcha response')) {
        return 'Verificação de segurança (CAPTCHA) necessária ou inválida. Por favor, tente novamente (resolva o desafio se aparecer).';
    }

    if (error.includes('too many requests')) {
        return 'Muitas solicitações em pouco tempo. Por favor, aguarde um momento antes de tentar novamente.';
    }

    // Outros erros comuns
    if (error.includes('network error') || error.includes('failed to fetch')) {
        return 'Erro de conexão. Verifique sua internet e tente novamente.';
    }

    if (error.includes('password is too short')) {
        return 'A senha deve ter pelo menos 6 caracteres.';
    }

    // Fallback para erros desconhecidos ou técnicos
    if (error.includes('unexpected_failure')) {
        return 'Erro inesperado no servidor. Tente novamente em alguns instantes.';
    }

    return errorMessage.replace('Error: ', '');
};
