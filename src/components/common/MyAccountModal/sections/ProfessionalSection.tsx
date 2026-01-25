import React from 'react';
import { User } from '../../../../types';

interface ProfessionalSectionProps {
  formData: User;
  setFormData: (user: User) => void;
  isSaving: boolean;
  onSave: () => void;
}

const ProfessionalSection: React.FC<ProfessionalSectionProps> = ({ formData, setFormData, isSaving, onSave }) => {
  return (
    <div className="max-w-3xl mx-auto animate-fadeIn">
      <h1 className="text-3xl font-black uppercase italic tracking-tighter mb-2">
        Identidade <span className="text-red-600">Profissional</span>
      </h1>
      <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-8">
        Dados para bicos, classificados e empregos
      </p>
      <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block tracking-widest">
              WhatsApp Público
            </label>
            <input
              type="text"
              value={formData.phone || ''}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="(34) 9 9999-9999"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold"
            />
          </div>
          <div>
            <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block tracking-widest">
              Sua Profissão
            </label>
            <input
              type="text"
              value={formData.profession || ''}
              onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
              placeholder="Ex: Eletricista"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold"
            />
          </div>
        </div>
        <div>
          <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block tracking-widest">
            Resumo Profissional / Habilidades
          </label>
          <textarea
            value={formData.professionalBio || ''}
            onChange={(e) => setFormData({ ...formData, professionalBio: e.target.value })}
            rows={4}
            placeholder="Conte suas experiências para conseguir bicos e empregos..."
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm resize-none"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block tracking-widest">
              Escolaridade
            </label>
            <select
              value={formData.education || ''}
              onChange={(e) => setFormData({ ...formData, education: e.target.value })}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold"
            >
              <option value="">Não informado</option>
              <option value="Fundamental">Ensino Fundamental</option>
              <option value="Médio">Ensino Médio</option>
              <option value="Superior">Ensino Superior</option>
              <option value="Técnico">Curso Técnico</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block tracking-widest">
              Disponibilidade
            </label>
            <select
              value={formData.availability || ''}
              onChange={(e) => setFormData({ ...formData, availability: e.target.value as any })}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold"
            >
              <option value="freelance">Apenas Bicos / Freelance</option>
              <option value="full_time">Tempo Integral</option>
              <option value="part_time">Meio Período</option>
              <option value="weekends">Finais de Semana</option>
            </select>
          </div>
        </div>
        <button
          onClick={onSave}
          disabled={isSaving}
          className="bg-red-600 text-white px-8 py-3 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-black transition-all disabled:opacity-50 disabled:cursor-wait"
        >
          {isSaving ? (
            <>
              <i className="fas fa-spinner fa-spin mr-2"></i> Salvando...
            </>
          ) : (
            'Atualizar Identidade Profissional'
          )}
        </button>
      </div>
    </div>
  );
};

export default ProfessionalSection;
