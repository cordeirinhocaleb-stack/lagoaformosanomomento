import { useState } from 'react';
import { User } from '../../../../types';

export const useAccountActions = (
    formData: User,
    onUpdateUser: (user: User) => void | Promise<void>
) => {
    const [isSaving, setIsSaving] = useState(false);

    const handleSaveProfile = async () => {
        setIsSaving(true);
        try {
            await onUpdateUser(formData);
            alert('Perfil atualizado com sucesso!');
        } catch (error) {
            console.error("Erro ao salvar perfil:", error);
            alert('Erro ao atualizar perfil. Verifique sua conexão e tente novamente.');
        } finally {
            setIsSaving(false);
        }
    };

    return {
        isSaving,
        handleSaveProfile
    };
};
