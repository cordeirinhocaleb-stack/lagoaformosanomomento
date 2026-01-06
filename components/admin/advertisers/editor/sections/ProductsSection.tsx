
import React from 'react';
import { Advertiser, AdvertiserProduct } from '../../../../../types';
import MediaUploader from '../../../../media/MediaUploader';
import { uploadToCloudinary } from '../../../../../services/cloudinaryService';

interface ProductsSectionProps {
  data: Advertiser;
  onChange: (data: Advertiser) => void;
}

const ProductsSection: React.FC<ProductsSectionProps> = ({ data, onChange }) => {
  const products = data.internalPage?.products || [];

  const handleAddProduct = () => {
      const newProduct: AdvertiserProduct = {
          id: Math.random().toString(36).substr(2, 9),
          name: '',
          price: '',
          description: '',
          promotionStyle: 'default'
      };
      onChange({
          ...data,
          internalPage: {
              ...data.internalPage!,
              products: [newProduct, ...products]
          }
      });
  };

  const handleUpdateProduct = (id: string, field: keyof AdvertiserProduct, value: any) => {
      const updatedProducts = products.map(p => p.id === id ? { ...p, [field]: value } : p);
      onChange({
          ...data,
          internalPage: { ...data.internalPage!, products: updatedProducts }
      });
  };

  const handleRemoveProduct = (id: string) => {
      if(!confirm("Remover este produto?")) return;
      const updatedProducts = products.filter(p => p.id !== id);
      onChange({
          ...data,
          internalPage: { ...data.internalPage!, products: updatedProducts }
      });
  };

  const handleImageSelect = async (id: string, file: File | null, preview: string) => {
      if (file) {
          try {
            // Set preview immediately
            handleUpdateProduct(id, 'imageUrl', preview);
            // Upload to lfnm_cms/advertisers/{ID}/products
            const url = await uploadToCloudinary(file, `lfnm_cms/advertisers/${data.id}/products`);
            handleUpdateProduct(id, 'imageUrl', url);
          } catch (e) {
              console.error(e);
              alert("Erro ao enviar imagem do produto.");
          }
      } else {
          handleUpdateProduct(id, 'imageUrl', '');
      }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
        <div className="flex justify-between items-center mb-6">
            <h3 className="text-xs font-black uppercase text-gray-400 tracking-widest">
                Catálogo de Ofertas ({products.length})
            </h3>
            <button 
                onClick={handleAddProduct}
                className="bg-black text-white px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-gray-800 transition-colors flex items-center gap-2"
            >
                <i className="fas fa-plus"></i> Novo Produto
            </button>
        </div>

        {products.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50">
                <i className="fas fa-box-open text-3xl text-gray-300 mb-2"></i>
                <p className="text-xs font-bold text-gray-400 uppercase">Nenhum produto cadastrado</p>
                <p className="text-[9px] text-yellow-500 mt-1">Crie promoções exclusivas para atrair clientes</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 gap-6">
                {products.map((product, idx) => (
                    <div key={product.id} className="bg-white border border-gray-200 rounded-2xl p-4 flex flex-col md:flex-row gap-6 shadow-sm hover:border-gray-300 transition-all relative group">
                        
                        <div className="w-full md:w-32 aspect-square bg-gray-50 rounded-xl overflow-hidden shrink-0 border border-gray-100">
                            {product.imageUrl ? (
                                <div className="relative w-full h-full group/img">
                                    <img src={product.imageUrl} className="w-full h-full object-cover" alt="Product" />
                                    <button 
                                        onClick={() => handleUpdateProduct(product.id, 'imageUrl', '')}
                                        className="absolute top-1 right-1 bg-red-600 text-white w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity"
                                    >
                                        <i className="fas fa-times text-[10px]"></i>
                                    </button>
                                </div>
                            ) : (
                                <div className="w-full h-full">
                                    <MediaUploader onMediaSelect={(f, p) => handleImageSelect(product.id, f, p)} />
                                </div>
                            )}
                        </div>

                        <div className="flex-1 space-y-3">
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="text-[8px] font-black uppercase text-gray-400 block mb-1">Nome do Produto</label>
                                    <input 
                                        type="text" 
                                        value={product.name}
                                        onChange={e => handleUpdateProduct(product.id, 'name', e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold outline-none focus:border-black"
                                        placeholder="Ex: Promoção X"
                                    />
                                </div>
                                <div className="w-32">
                                    <label className="text-[8px] font-black uppercase text-gray-400 block mb-1">Preço (R$)</label>
                                    <input 
                                        type="text" 
                                        value={product.price || ''}
                                        onChange={e => handleUpdateProduct(product.id, 'price', e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold outline-none text-green-700"
                                        placeholder="0,00"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-[8px] font-black uppercase text-gray-400 block mb-1">Descrição Curta</label>
                                <input 
                                    type="text" 
                                    value={product.description || ''}
                                    onChange={e => handleUpdateProduct(product.id, 'description', e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none"
                                    placeholder="Detalhes da oferta..."
                                />
                            </div>
                            
                            <div className="flex items-center gap-4 pt-2">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input 
                                        type="radio" 
                                        checked={product.promotionStyle === 'default'}
                                        onChange={() => handleUpdateProduct(product.id, 'promotionStyle', 'default')}
                                        className="text-black focus:ring-black"
                                    />
                                    <span className="text-[10px] font-bold uppercase text-gray-600">Padrão</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input 
                                        type="radio" 
                                        checked={product.promotionStyle === 'sale'}
                                        onChange={() => handleUpdateProduct(product.id, 'promotionStyle', 'sale')}
                                        className="text-red-600 focus:ring-red-600"
                                    />
                                    <span className="text-[10px] font-bold uppercase text-red-600">Oferta (Destaque)</span>
                                </label>
                            </div>
                        </div>

                        <button 
                            onClick={() => handleRemoveProduct(product.id)}
                            className="absolute top-4 right-4 text-gray-300 hover:text-red-600 transition-colors"
                        >
                            <i className="fas fa-trash"></i>
                        </button>
                    </div>
                ))}
            </div>
        )}
    </div>
  );
};

export default ProductsSection;
