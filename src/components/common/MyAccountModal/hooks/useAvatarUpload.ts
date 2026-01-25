import { useState, useRef } from 'react';
import { uploadToCloudinary } from '../../../../services/cloudinaryService';
import { User } from '../../../../types';

export const useAvatarUpload = (
    formData: User,
    setFormData: (user: User) => void,
    onUpdateUser: (user: User) => void | Promise<void>
) => {
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploadingAvatar(true);
        try {
            const url = await uploadToCloudinary(file, 'avatars', 'perfil_usuario');
            const updatedUser = { ...formData, avatar: url };
            setFormData(updatedUser);
            await onUpdateUser(updatedUser);
        } catch (err: any) {
            alert('Erro ao carregar avatar: ' + err.message);
        } finally {
            setIsUploadingAvatar(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    return {
        isUploadingAvatar,
        fileInputRef,
        handleAvatarChange
    };
};
