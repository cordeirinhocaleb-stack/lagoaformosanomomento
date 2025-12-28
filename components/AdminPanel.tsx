
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { User, NewsItem, PostStatus, NewsVersion, SocialDistribution, Advertiser, UserRole, AdPlan, AdPricingConfig } from '../types';
import Logo from './Logo';
import MediaUploader from './MediaUploader';
import { adaptContentForSocialMedia } from '../services/geminiService';
import { dispatchSocialWebhook, mockPostToNetwork } from '../services/integrationService';

const CATEGORIES = ['Cotidiano', 'Polícia', 'Agro', 'Política', 'Esporte', 'Cultura', 'Saúde'];
const USER_ROLES: UserRole[] = ['Desenvolvedor', 'Editor-Chefe', 'Repórter', 'Jornalista', 'Estagiário'];

// Declaração de Tipos para Variáveis Globais do Google API
declare global {
  interface Window {
    gapi: any;
    google: any;
  }
}

interface AdminPanelProps {
  user: User;
  newsHistory: NewsItem[];
  allUsers: User[];
  advertisers: Advertiser[];
  adConfig: AdPricingConfig; // Configuração de Preços recebida via prop
  onAddNews: (news: NewsItem) => void;
  onUpdateNews: (news: NewsItem) => void;
  onUpdateUser: (user: User) => void;
  onUpdateAdvertiser?: (advertiser: Advertiser) => void;
  onUpdateAdConfig?: (config: AdPricingConfig) => void; // Callback para salvar preços
}

// --- COMPONENTE INTERNO: OVERLAY DE PUBLICAÇÃO ---
const PublishingOverlay = ({ 
  steps, 
  currentStepIndex, 
  isComplete,
  onClose 
}: { 
  steps: { id: string, label: string, status: 'pending' | 'loading' | 'success' | 'error' }[], 
  currentStepIndex: number,
  isComplete: boolean,
  onClose: () => void 
}) => {
    return (
        <div className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-6 animate-fadeIn">
            <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                {/* Background Grid Animation */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                
                <div className="relative z-10 text-center mb-8">
                    <div className="w-20 h-20 bg-black border-2 border-red-600 rounded-full mx-auto mb-6 flex items-center justify-center shadow-[0_0_30px_rgba(220,38,38,0.5)]">
                        {isComplete ? (
                            <i className="fas fa-check text-4xl text-green-500 animate-bounce"></i>
                        ) : (
                            <i className="fas fa-satellite-dish text-4xl text-red-600 animate-pulse"></i>
                        )}
                    </div>
                    <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-2">
                        {isComplete ? 'TRANSMISSÃO CONCLUÍDA' : 'DISTRIBUINDO CONTEÚDO'}
                    </h2>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        {isComplete ? 'Sua notícia está no ar em todas as redes.' : 'Conectando aos servidores globais...'}
                    </p>
                </div>

                <div className="space-y-4 relative z-10">
                    {steps.map((step, idx) => (
                        <div key={step.id} className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-500 ${
                            step.status === 'loading' ? 'bg-gray-800 border border-red-600/50 shadow-[0_0_15px_rgba(220,38,38,0.2)]' :
                            step.status === 'success' ? 'bg-green-900/20 border border-green-500/30' :
                            'bg-gray-800/50 border border-gray-800 opacity-50'
                        }`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm border ${
                                step.status === 'loading' ? 'border-red-500 text-red-500' :
                                step.status === 'success' ? 'bg-green-500 border-green-500 text-black' :
                                'border-gray-600 text-gray-600'
                            }`}>
                                {step.status === 'loading' ? <i className="fas fa-circle-notch fa-spin"></i> :
                                 step.status === 'success' ? <i className="fas fa-check"></i> :
                                 <i className={`fab fa-${step.id === 'site' ? 'chrome' : step.id.replace('_feed','')}`}></i>}
                            </div>
                            <div className="flex-1">
                                <span className={`text-xs font-black uppercase tracking-widest ${
                                    step.status === 'loading' ? 'text-white' :
                                    step.status === 'success' ? 'text-green-400' : 'text-gray-500'
                                }`}>
                                    {step.label}
                                </span>
                                {step.status === 'loading' && (
                                    <div className="w-full bg-gray-700 h-1 mt-2 rounded-full overflow-hidden">
                                        <div className="h-full bg-red-600 animate-progress-indeterminate"></div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {isComplete && (
                    <button 
                        onClick={onClose}
                        className="mt-8 w-full bg-white text-black py-4 rounded-xl font-black uppercase tracking-widest hover:bg-green-500 hover:text-white transition-all animate-fadeInUp shadow-xl"
                    >
                        Fechar Painel
                    </button>
                )}
            </div>
            
            <style>{`
                @keyframes progress-indeterminate {
                    0% { transform: translateX(-100%); }
                    50% { transform: translateX(50%); }
                    100% { transform: translateX(100%); }
                }
                .animate-progress-indeterminate {
                    animation: progress-indeterminate 1s infinite linear;
                }
            `}</style>
        </div>
    );
};

const AdminPanel: React.FC<AdminPanelProps> = ({ user, newsHistory, allUsers, advertisers, adConfig, onAddNews, onUpdateNews, onUpdateUser, onUpdateAdvertiser, onUpdateAdConfig }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'editor' | 'workflow' | 'users' | 'advertisers' | 'settings'>('dashboard');
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  
  // --- ADVERTISER MANAGEMENT STATE ---
  const [isEditingAdvertiser, setIsEditingAdvertiser] = useState(false);
  const [currentAdvertiser, setCurrentAdvertiser] = useState<Advertiser | null>(null);
  const [showAdPricingSettings, setShowAdPricingSettings] = useState(false); // Toggle para configurações de preço
  const [tempAdConfig, setTempAdConfig] = useState<AdPricingConfig>(adConfig); // Estado local para edição

  // --- GOOGLE DRIVE INTEGRATION STATE ---
  const [tokenClient, setTokenClient] = useState<any>(null);
  const [gapiInited, setGapiInited] = useState(false);
  const [gisInited, setGisInited] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isDriveUploading, setIsDriveUploading] = useState(false);
  const [isPickerLoading, setIsPickerLoading] = useState(false);

  // --- EDITOR CONTEXT MENU STATE ---
  const [contextMenu, setContextMenu] = useState<{x: number, y: number} | null>(null);
  const bodyFileInputRef = useRef<HTMLInputElement>(null);
  const galleryFileInputRef = useRef<HTMLInputElement>(null);
  const savedSelectionRef = useRef<Range | null>(null);

  // --- USER MANAGEMENT STATE ---
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<string>('all');

  // --- WORKFLOW / ANALYTICS STATE ---
  const [workflowSubTab, setWorkflowSubTab] = useState<'queue' | 'analytics'>('queue');
  const [postSearch, setPostSearch] = useState('');
  const [postFilterCategory, setPostFilterCategory] = useState('all');

  // --- SETTINGS STATE (Google Drive) ---
  const [driveConfig, setDriveConfig] = useState({ clientId: '', apiKey: '', appId: '' });

  // --- EDITOR STATE (WordPress Style) ---
  const [title, setTitle] = useState('');
  const [lead, setLead] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [mediaData, setMediaData] = useState({ url: '', credits: '', type: 'image' as 'image' | 'video' });
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [isBreaking, setIsBreaking] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
  
  // Content (Rich Text)
  const [content, setContent] = useState('');
  const editorContentRef = useRef<HTMLDivElement>(null);
  
  // Image Manipulation State
  const [selectedImg, setSelectedImg] = useState<HTMLImageElement | null>(null);
  const [resizerState, setResizerState] = useState<{ x: number, y: number, w: number, h: number } | null>(null);
  const [isResizing, setIsResizing] = useState(false);
  const resizeStartRef = useRef<{ startX: number, startWidth: number } | null>(null);

  // SEO States
  const [seoFocusKeyword, setSeoFocusKeyword] = useState('');
  const [seoSlug, setSeoSlug] = useState('');
  const [seoMetaDesc, setSeoMetaDesc] = useState('');

  // Social Hub States
  const [socialCaptions, setSocialCaptions] = useState<Record<string, string>>({});
  const [socialStatus, setSocialStatus] = useState<Record<string, 'idle' | 'sending' | 'published' | 'error'>>({
    instagram_feed: 'idle',
    instagram_stories: 'idle',
    facebook: 'idle',
    whatsapp: 'idle',
    linkedin: 'idle'
  });
  const [isGeneratingSocial, setIsGeneratingSocial] = useState(false);
  const [autoPostSocial, setAutoPostSocial] = useState(true);

  // --- PUBLISHING OVERLAY STATE ---
  const [isPublishingFlow, setIsPublishingFlow] = useState(false);
  const [publishingSteps, setPublishingSteps] = useState<{ id: string, label: string, status: 'pending' | 'loading' | 'success' | 'error' }[]>([]);
  const [currentPublishIndex, setCurrentPublishIndex] = useState(0);

  const isAdmin = user.role === 'Desenvolvedor' || user.role === 'Editor-Chefe';

  // --- INITIALIZATION & SCRIPT LOADING ---
  
  useEffect(() => {
    const savedDrive = localStorage.getItem('lfnm_drive_config');
    if (savedDrive) {
      const parsed = JSON.parse(savedDrive);
      setDriveConfig(parsed);
    }
  }, []);

  // Update temp config when prop changes
  useEffect(() => {
    setTempAdConfig(adConfig);
  }, [adConfig]);

  useEffect(() => {
    const loadGoogleScripts = () => {
      // GAPI
      if (!document.getElementById('google-api-script')) {
        const scriptGapi = document.createElement('script');
        scriptGapi.src = "https://apis.google.com/js/api.js";
        scriptGapi.id = 'google-api-script';
        scriptGapi.async = true;
        scriptGapi.defer = true;
        scriptGapi.onload = () => {
          setGapiInited(true);
        };
        document.body.appendChild(scriptGapi);
      } else {
        if (window.gapi) setGapiInited(true);
      }

      // GIS (Identity Services)
      if (!document.getElementById('google-gis-script')) {
        const scriptGis = document.createElement('script');
        scriptGis.src = "https://accounts.google.com/gsi/client";
        scriptGis.id = 'google-gis-script';
        scriptGis.async = true;
        scriptGis.defer = true;
        scriptGis.onload = () => {
          setGisInited(true);
        };
        document.body.appendChild(scriptGis);
      } else {
        if (window.google) setGisInited(true);
      }
    };

    loadGoogleScripts();
  }, []);

  useEffect(() => {
    if (gapiInited && gisInited && driveConfig.apiKey && driveConfig.clientId) {
      if (!window.gapi.client.getToken && window.gapi.load) {
         window.gapi.load('client:picker', async () => {
            await window.gapi.client.init({
              apiKey: driveConfig.apiKey,
              discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
            }).then(() => {
               // Initialized OK
            }).catch((err: any) => console.error("GAPI Init Error:", err));
         });
      }

      if (window.google && window.google.accounts) {
         const client = window.google.accounts.oauth2.initTokenClient({
            client_id: driveConfig.clientId,
            scope: 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.readonly',
            callback: (response: any) => {
              if (response.access_token) {
                setAccessToken(response.access_token);
              }
            },
         });
         setTokenClient(client);
      }
    }
  }, [gapiInited, gisInited, driveConfig.apiKey, driveConfig.clientId]); 

  useEffect(() => {
    const closeMenu = () => setContextMenu(null);
    window.addEventListener('click', closeMenu);
    return () => window.removeEventListener('click', closeMenu);
  }, []);

  // --- ADVERTISER MANAGEMENT FUNCTIONS ---

  const handleStartNewAdvertiser = () => {
    setCurrentAdvertiser({
        id: '',
        name: '',
        category: '',
        plan: 'standard',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
        isActive: true,
        views: 0,
        clicks: 0,
        redirectType: 'external',
        internalPage: { description: '', products: [] }
    });
    setIsEditingAdvertiser(true);
  };

  const handleEditAdvertiser = (ad: Advertiser) => {
    setCurrentAdvertiser(ad);
    setIsEditingAdvertiser(true);
  };

  const handleSaveAdvertiser = () => {
    if (!currentAdvertiser || !currentAdvertiser.name) {
        alert("Preencha o nome do parceiro.");
        return;
    }

    const isNew = !currentAdvertiser.id;
    const finalAdvertiser = {
        ...currentAdvertiser,
        id: isNew ? Math.random().toString(36).substr(2, 9) : currentAdvertiser.id
    };

    if (onUpdateAdvertiser) {
        onUpdateAdvertiser(finalAdvertiser);
    } else {
        const exists = advertisers.find(a => a.id === finalAdvertiser.id);
        if (exists) {
            Object.assign(exists, finalAdvertiser);
        } else {
            advertisers.push(finalAdvertiser);
        }
    }

    alert(`Parceiro ${finalAdvertiser.name} salvo com sucesso!`);
    setIsEditingAdvertiser(false);
    setCurrentAdvertiser(null);
  };

  const handleSaveAdConfig = () => {
     if(onUpdateAdConfig) {
         onUpdateAdConfig(tempAdConfig);
         alert("Tabela de Preços e Promoções atualizada!");
         setShowAdPricingSettings(false);
     }
  };

  // Calculadora de Custo Estimado
  const estimatedCost = useMemo(() => {
     if (!currentAdvertiser) return 0;
     const start = new Date(currentAdvertiser.startDate);
     const end = new Date(currentAdvertiser.endDate);
     const diffTime = Math.abs(end.getTime() - start.getTime());
     const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
     
     let dailyPrice = 0;
     if (currentAdvertiser.plan === 'master') dailyPrice = adConfig.masterDailyPrice;
     else if (currentAdvertiser.plan === 'premium') dailyPrice = adConfig.premiumDailyPrice;
     else dailyPrice = adConfig.standardDailyPrice;

     return diffDays * dailyPrice;
  }, [currentAdvertiser, adConfig]);


  // --- DRIVE HELPER FUNCTIONS ---
  // (Mantido igual)
  const uploadFileToDrive = async (file: File): Promise<string> => {
      const metadata = { name: file.name, mimeType: file.type };
      const form = new FormData();
      form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
      form.append('file', file);

      const uploadRes = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
          method: 'POST',
          headers: new Headers({ 'Authorization': 'Bearer ' + accessToken }),
          body: form
      });
      const fileData = await uploadRes.json();
      
      if(fileData.error) throw new Error(fileData.error.message);

      await fetch(`https://www.googleapis.com/drive/v3/files/${fileData.id}/permissions`, {
          method: 'POST',
          headers: new Headers({ 
              'Authorization': 'Bearer ' + accessToken,
              'Content-Type': 'application/json'
          }),
          body: JSON.stringify({ role: 'reader', type: 'anyone' })
      });

      if (file.type.startsWith('video')) {
          return `https://drive.google.com/uc?export=download&id=${fileData.id}`;
      } else {
          return `https://lh3.googleusercontent.com/d/${fileData.id}`;
      }
  };

  // ... (Funções do Drive e Editor mantidas iguais) ...
  const handleOpenPicker = () => {
    // ... mantido ...
    if (!driveConfig.apiKey || !driveConfig.clientId || !driveConfig.appId) {
       alert("⚠️ Configurações do Google Drive incompletas. Vá em Configurações e preencha API Key, Client ID e App ID.");
       return;
    }
    // ... (rest of picker logic same as before)
    if (!gapiInited || !gisInited) {
       alert("⏳ Aguardando carregamento dos serviços do Google. Tente novamente em alguns segundos.");
       return;
    }

    setIsPickerLoading(true);

    const createPicker = () => {
      try {
        if (!accessToken) return;
        
        const pickerCallback = (data: any) => {
           if (data.action === window.google.picker.Action.PICKED) {
              const file = data.docs[0];
              const fileId = file.id;
              const isVideo = file.mimeType?.startsWith('video');
              const directLink = isVideo 
                ? `https://drive.google.com/uc?export=download&id=${fileId}`
                : `https://lh3.googleusercontent.com/d/${fileId}`;
                
              setMediaData({ ...mediaData, url: directLink, type: isVideo ? 'video' : 'image' });
           }
           setIsPickerLoading(false);
        };

        const view = new window.google.picker.View(window.google.picker.ViewId.DOCS);
        view.setMimeTypes("image/png,image/jpeg,image/jpg,video/mp4");
        
        const picker = new window.google.picker.PickerBuilder()
            .setDeveloperKey(driveConfig.apiKey)
            .setAppId(driveConfig.appId)
            .setOAuthToken(accessToken)
            .addView(view)
            .addView(new window.google.picker.DocsUploadView())
            .setCallback(pickerCallback)
            .build();
        picker.setVisible(true);
      } catch (e) {
        console.error(e);
        alert("Erro ao abrir seletor. Verifique o console.");
        setIsPickerLoading(false);
      }
    };

    if (tokenClient) {
        tokenClient.callback = async (resp: any) => {
            if (resp.error !== undefined) {
                console.error(resp);
                setIsPickerLoading(false);
                return;
            }
            setAccessToken(resp.access_token);
            createPicker();
        };

        if (accessToken === null) {
            tokenClient.requestAccessToken({prompt: 'consent'});
        } else {
            tokenClient.requestAccessToken({prompt: ''});
        }
    } else {
        alert("Erro: Cliente de Autenticação não inicializado. Recarregue a página.");
        setIsPickerLoading(false);
    }
  };

  const handleDriveUpload = async (file: File) => {
     if (!driveConfig.apiKey) return alert("Configure a integração com Google Drive primeiro.");

     const uploadLogic = async () => {
        try {
           setIsDriveUploading(true);
           const link = await uploadFileToDrive(file);
           setMediaData({ 
             ...mediaData, 
             url: link, 
             type: file.type.startsWith('video') ? 'video' : 'image' 
           });
           alert("✅ Upload para o Google Drive concluído com sucesso!");
        } catch (error) {
           console.error(error);
           alert("Erro ao fazer upload. Verifique permissões e cota.");
        } finally {
           setIsDriveUploading(false);
        }
     };

     if (tokenClient) {
        tokenClient.callback = (resp: any) => {
            if (resp.error) return;
            setAccessToken(resp.access_token);
            uploadLogic();
        };
        if (!accessToken) tokenClient.requestAccessToken({prompt: 'consent'});
        else uploadLogic();
     }
  };

  const handleBodyDriveUpload = async (file: File) => {
    // ... mantido ...
     if (!driveConfig.apiKey) return alert("Configure a integração com Google Drive primeiro.");

    const uploadLogic = async () => {
       try {
          setIsDriveUploading(true); 
          const link = await uploadFileToDrive(file);
          
          if (editorContentRef.current) {
             editorContentRef.current.focus();
             if (savedSelectionRef.current) {
                const sel = window.getSelection();
                sel?.removeAllRanges();
                sel?.addRange(savedSelectionRef.current);
             }
             
             let htmlToInsert = '';
             if (file.type.startsWith('video')) {
                htmlToInsert = `<div class="aspect-video w-full my-6 rounded-2xl overflow-hidden shadow-lg"><video src="${link}" controls class="w-full h-full"></video></div><p><br></p>`;
             } else {
                htmlToInsert = `<img src="${link}" class="block mx-auto rounded-2xl my-4 shadow-md cursor-pointer hover:ring-4 ring-red-500/30 w-full" style="max-width: 100%; height: auto;" /><p><br></p>`;
             }

             document.execCommand('insertHTML', false, htmlToInsert);
             handleEditorInput(); 
          }
       } catch (error) {
          console.error(error);
          alert("Erro ao fazer upload no corpo do texto.");
       } finally {
          setIsDriveUploading(false);
          setContextMenu(null);
       }
    };

    if (tokenClient) {
       tokenClient.callback = (resp: any) => {
           if (resp.error) return;
           setAccessToken(resp.access_token);
           uploadLogic();
       };
       if (!accessToken) tokenClient.requestAccessToken({prompt: 'consent'});
       else uploadLogic();
    }
  };

  const handleGalleryDriveUpload = async (files: FileList) => {
     // ... mantido ...
      if (!driveConfig.apiKey) return alert("Configure a integração com Google Drive primeiro.");
    
    const filesArray = Array.from(files);
    if (filesArray.length === 0) return;

    const uploadLogic = async () => {
        try {
            setIsDriveUploading(true);
            const uploadPromises = filesArray.map(async (file) => {
                const link = await uploadFileToDrive(file);
                return link;
            });

            const results = await Promise.all(uploadPromises);
            setGalleryImages(prev => [...prev, ...results]);
            
            alert(`✅ ${results.length} imagens adicionadas à galeria com sucesso!`);
        } catch (error) {
            console.error(error);
            alert("Erro ao fazer upload da galeria. Verifique o console.");
        } finally {
            setIsDriveUploading(false);
        }
    };

    if (tokenClient) {
       tokenClient.callback = (resp: any) => {
           if (resp.error) return;
           setAccessToken(resp.access_token);
           uploadLogic();
       };
       if (!accessToken) tokenClient.requestAccessToken({prompt: 'consent'});
       else uploadLogic();
    }
  };

  // ... (Rich text functions, context menu, resizer - mantidos) ...
  const execCmd = (command: string, value: string | undefined = undefined) => {
    // ... mantido ...
    if (editorContentRef.current) {
      editorContentRef.current.focus();
    }
    
    if (savedSelectionRef.current) {
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(savedSelectionRef.current);
    }

    document.execCommand(command, false, value);
    
    if (editorContentRef.current) {
      setContent(editorContentRef.current.innerHTML);
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
      // ... mantido
    e.preventDefault();
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      savedSelectionRef.current = sel.getRangeAt(0);
    }
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  const handleContextMenuClick = (action: string, value?: string) => {
      // ... mantido
    if (action === 'upload') {
      bodyFileInputRef.current?.click();
    } else {
      execCmd(action, value);
    }
    setContextMenu(null);
  };

  const updateResizerPosition = useCallback(() => {
    // ... mantido
    if (selectedImg && editorContentRef.current) {
      const editorRect = editorContentRef.current.getBoundingClientRect();
      const imgRect = selectedImg.getBoundingClientRect();
      
      setResizerState({
        x: imgRect.left - editorRect.left,
        y: imgRect.top - editorRect.top,
        w: imgRect.width,
        h: imgRect.height
      });
    }
  }, [selectedImg]);

  useEffect(() => {
    // ... mantido
    if (selectedImg) {
      updateResizerPosition();
      window.addEventListener('resize', updateResizerPosition);
      window.addEventListener('scroll', updateResizerPosition, true); 
      return () => {
        window.removeEventListener('resize', updateResizerPosition);
        window.removeEventListener('scroll', updateResizerPosition, true);
      };
    } else {
      setResizerState(null);
    }
  }, [selectedImg, updateResizerPosition]);

  useEffect(() => {
    if (activeTab === 'editor' && editorContentRef.current) {
       if (editorContentRef.current.innerHTML !== content) {
          editorContentRef.current.innerHTML = content;
       }
    }
  }, [activeTab, editingPostId]); 

  const handleMouseDownResize = (e: React.MouseEvent) => {
    // ... mantido
    e.preventDefault();
    e.stopPropagation();
    if (!selectedImg) return;
    setIsResizing(true);
    resizeStartRef.current = { startX: e.clientX, startWidth: selectedImg.offsetWidth };
    document.addEventListener('mousemove', handleMouseMoveResize);
    document.addEventListener('mouseup', handleMouseUpResize);
  };

  const handleMouseMoveResize = useCallback((e: MouseEvent) => {
      // ... mantido
    if (!resizeStartRef.current || !selectedImg) return;
    const currentX = e.clientX;
    const deltaX = currentX - resizeStartRef.current.startX;
    const newWidth = Math.max(50, resizeStartRef.current.startWidth + deltaX);
    selectedImg.style.width = `${newWidth}px`;
    selectedImg.style.maxWidth = '100%';
    selectedImg.style.height = 'auto';
    selectedImg.classList.remove('w-full', 'w-1/2', 'w-1/3', 'w-1/4', 'w-3/4');
    updateResizerPosition();
  }, [selectedImg, updateResizerPosition]);

  const handleMouseUpResize = useCallback(() => {
    // ... mantido
    setIsResizing(false);
    resizeStartRef.current = null;
    document.removeEventListener('mousemove', handleMouseMoveResize);
    document.removeEventListener('mouseup', handleMouseUpResize);
    if (editorContentRef.current) setContent(editorContentRef.current.innerHTML);
  }, [handleMouseMoveResize]);

  const handleEditorClick = (e: React.MouseEvent) => {
    // ... mantido
    const target = e.target as HTMLElement;
    if (target.tagName === 'IMG') {
      setSelectedImg(target as HTMLImageElement);
      setTimeout(updateResizerPosition, 0);
    } else {
      if (!isResizing && !(e.target as HTMLElement).classList.contains('resizer-handle')) {
        setSelectedImg(null);
      }
    }
  };

  const handleEditorInput = () => {
    if (editorContentRef.current) {
      const html = editorContentRef.current.innerHTML;
      setContent(html);
      if (selectedImg) updateResizerPosition();
    }
  };

  const applyImgStyle = (styleType: 'float' | 'width', value: string) => {
    // ... mantido
    if (!selectedImg) return;
    const baseClasses = "rounded-2xl shadow-md my-4 transition-all duration-300 cursor-pointer hover:ring-4 ring-red-500/30";
    if (styleType === 'float') {
      selectedImg.style.float = '';
      selectedImg.style.margin = '';
      selectedImg.style.display = '';
      selectedImg.className = selectedImg.className.replace(/float-left|float-right|mx-auto|block|mr-6|ml-6|mb-4/g, '').trim();
      if (value === 'left') selectedImg.className = `${baseClasses} float-left mr-6 mb-4`;
      else if (value === 'right') selectedImg.className = `${baseClasses} float-right ml-6 mb-4`;
      else if (value === 'center') selectedImg.className = `${baseClasses} block mx-auto mb-6`;
    }
    setTimeout(updateResizerPosition, 100);
    if (editorContentRef.current) setContent(editorContentRef.current.innerHTML);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    // ... mantido
    const text = e.clipboardData.getData('text/plain');
    const youtubeMatch = text.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?(.+)/);
    if (youtubeMatch) {
      e.preventDefault();
      const videoId = youtubeMatch[1].split('&')[0];
      const embedHtml = `<div class="aspect-video w-full my-6 rounded-2xl overflow-hidden shadow-lg"><iframe src="https://www.youtube.com/embed/${videoId}" class="w-full h-full" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div><p><br></p>`;
      document.execCommand('insertHTML', false, embedHtml);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
      // ... mantido
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const imgHtml = `<img src="${event.target?.result}" class="block mx-auto rounded-2xl my-4 shadow-md cursor-pointer hover:ring-4 ring-red-500/30 w-full" style="max-width: 100%; height: auto;" /><p><br></p>`;
          document.execCommand('insertHTML', false, imgHtml);
          setTimeout(() => {
             if (editorContentRef.current) {
                const imgs = editorContentRef.current.querySelectorAll('img');
                const lastImg = imgs[imgs.length - 1];
                if (lastImg) setSelectedImg(lastImg as HTMLImageElement);
             }
          }, 100);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  // ... (Save logic, resetStates, etc. mantidos) ...
  const saveDriveSettings = () => {
    localStorage.setItem('lfnm_drive_config', JSON.stringify(driveConfig));
    alert("✅ Configurações do Drive salvas com sucesso! As APIs serão inicializadas.");
    window.location.reload(); 
  };
  
  const handleSave = async (status: PostStatus = 'draft') => {
    let finalStatus = status;

    if (!isAdmin && status === 'published') {
      alert("⚠️ Perfil restrito: Sua matéria foi enviada para REVISÃO do Editor-Chefe.");
      finalStatus = 'in_review';
    }

    if (!title.trim() || !mediaData.url) {
      alert("❌ Erro: Título e Imagem Principal (Capa) são obrigatórios.");
      return;
    }

    const id = editingPostId || Math.random().toString(36).substr(2, 9);
    const existingPost = newsHistory.find(n => n.id === id);

    if (existingPost?.status === 'published' && finalStatus === 'published' && !isAdmin) {
      finalStatus = 'in_review';
      alert("⚠️ Edições em posts publicados requerem nova aprovação.");
    }

    const socialDistribution: SocialDistribution[] = Object.keys(socialStatus).map(key => ({
      platform: key as any,
      status: (finalStatus === 'published' && autoPostSocial) ? 'published' : 'idle', 
      content: socialCaptions[key] || '',
      publishedAt: (finalStatus === 'published' && autoPostSocial) ? new Date().toISOString() : undefined
    }));

    const version: NewsVersion = {
      id: Math.random().toString(36).substr(2, 9),
      postId: id,
      versionNumber: (existingPost?.versions?.length || 0) + 1,
      timestamp: new Date().toISOString(),
      authorId: user.id,
      authorName: user.name,
      changeSummary: editingPostId ? "Edição de conteúdo" : "Criação inicial",
      snapshot: {
        title, lead, content, category,
        imageUrl: mediaData.url, imageCredits: mediaData.credits,
        seo: { slug: seoSlug, metaTitle: title, metaDescription: seoMetaDesc, focusKeyword: seoFocusKeyword }
      }
    };

    const newsData: NewsItem = {
      id,
      status: finalStatus,
      title, lead, content, category,
      authorId: user.id, author: user.name,
      createdAt: existingPost?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      imageUrl: mediaData.url || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c',
      imageCredits: mediaData.credits,
      mediaType: mediaData.type,
      galleryUrls: galleryImages,
      city: 'Lagoa Formosa', region: 'Alto Paranaíba',
      isBreaking, isFeatured,
      featuredPriority: existingPost?.featuredPriority || 5,
      seo: { 
        slug: seoSlug || title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''), 
        metaTitle: title, 
        metaDescription: seoMetaDesc || lead, 
        focusKeyword: seoFocusKeyword 
      },
      source: 'site',
      versions: [...(existingPost?.versions || []), version],
      socialDistribution,
      views: existingPost?.views || 0
    };

    // --- NOVA LÓGICA DE PUBLICAÇÃO OMNICHANNEL VISUAL ---
    if (finalStatus === 'published' && autoPostSocial) {
      // 1. Configura os passos do Overlay
      const steps = [
        { id: 'site', label: 'Salvando no Banco de Dados', status: 'pending' as const },
        { id: 'instagram_feed', label: 'Publicando no Instagram', status: 'pending' as const },
        { id: 'facebook', label: 'Publicando no Facebook', status: 'pending' as const },
        { id: 'whatsapp', label: 'Enviando para Grupos WhatsApp', status: 'pending' as const },
        { id: 'linkedin', label: 'Postando no LinkedIn', status: 'pending' as const }
      ];
      setPublishingSteps(steps);
      setIsPublishingFlow(true);
      setCurrentPublishIndex(0);

      // 2. Executa a sequência com delays visuais
      const executeStep = async (index: number) => {
        if (index >= steps.length) {
            // Fim do processo
            setTimeout(() => {
                editingPostId ? onUpdateNews(newsData) : onAddNews(newsData);
                // Não fechamos automaticamente, deixamos o usuário ver o "Sucesso Total"
            }, 500);
            return;
        }

        const step = steps[index];
        
        // Atualiza status para 'loading'
        setPublishingSteps(prev => prev.map((s, i) => i === index ? { ...s, status: 'loading' } : s));

        if (step.id === 'site') {
            // Salva dados locais
            await new Promise(r => setTimeout(r, 800)); // Delay fake
            // Dispara webhook principal (o "cérebro" real)
            dispatchSocialWebhook(newsData);
        } else {
            // Simula envio individual para rede social (visual only)
            await mockPostToNetwork(step.label);
        }

        // Atualiza status para 'success'
        setPublishingSteps(prev => prev.map((s, i) => i === index ? { ...s, status: 'success' } : s));
        setCurrentPublishIndex(index + 1);
        
        // Próximo passo
        executeStep(index + 1);
      };

      // Inicia sequência
      executeStep(0);

    } else {
      // Salva sem overlay se não for publicar
      editingPostId ? onUpdateNews(newsData) : onAddNews(newsData);
      if (finalStatus === 'published') {
        alert("✅ Matéria Publicada no Site (Redes Sociais ignoradas).");
      } else {
        alert("💾 Salvo com sucesso.");
      }
      setActiveTab('dashboard');
      resetStates();
    }
  };
  
  const handleCloseOverlay = () => {
    setIsPublishingFlow(false);
    setActiveTab('dashboard');
    resetStates();
  };

  const resetStates = () => {
    // ... mantido
    setEditingPostId(null); setTitle(''); setLead(''); setContent('');
    setSeoSlug(''); setSeoFocusKeyword(''); setSeoMetaDesc('');
    setMediaData({ url: '', credits: '', type: 'image' });
    setGalleryImages([]);
    setSocialCaptions({});
    setSocialStatus({ instagram_feed: 'idle', instagram_stories: 'idle', facebook: 'idle', whatsapp: 'idle', linkedin: 'idle' });
    setSelectedImg(null);
    setResizerState(null);
    setIsBreaking(false);
    setIsFeatured(false);
    if(editorContentRef.current) editorContentRef.current.innerHTML = '';
  };
  
  const startEdit = (post: NewsItem) => {
      // ... mantido
      setEditingPostId(post.id); setTitle(post.title); setLead(post.lead); setContent(post.content);
    setCategory(post.category); setSeoSlug(post.seo.slug); setSeoFocusKeyword(post.seo.focusKeyword);
    setMediaData({ url: post.imageUrl, credits: post.imageCredits, type: post.mediaType });
    setGalleryImages(post.galleryUrls || []);
    setIsBreaking(post.isBreaking); setIsFeatured(post.isFeatured);
    
    if (post.socialDistribution) {
      const caps: Record<string, string> = {};
      const stats: Record<string, any> = {};
      post.socialDistribution.forEach(d => {
        caps[d.platform] = d.content;
        stats[d.platform] = d.status === 'published' ? 'published' : 'idle';
      });
      setSocialCaptions(caps);
      setSocialStatus(prev => ({...prev, ...stats}));
    }

    setActiveTab('editor');
    setSelectedUser(null);
  };
  
  const handleGenerateSocial = async () => {
      // ... mantido
      if(!title || !lead) return alert("Preencha título e resumo para gerar legendas.");
    
    setIsGeneratingSocial(true);
    
    try {
        // Agora usa a versão assíncrona que chama a IA ou fallback
        const generated = await adaptContentForSocialMedia(title, lead, category);
        setSocialCaptions(generated);
    } catch (e) {
        console.error(e);
        alert("Erro ao gerar legendas automáticas.");
    } finally {
        setIsGeneratingSocial(false);
    }
  };

  // ... (NavButton, Metrics, etc. mantidos) ...
  const adMetrics = useMemo(() => {
    const totalViews = advertisers.reduce((acc, ad) => acc + ad.views, 0);
    const totalClicks = advertisers.reduce((acc, ad) => acc + ad.clicks, 0);
    const ctr = totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(2) : '0';
    return { totalViews, totalClicks, ctr };
  }, [advertisers]);

  const filteredPosts = useMemo(() => {
    return newsHistory.filter(post => {
      const matchesSearch = post.title.toLowerCase().includes(postSearch.toLowerCase()) || post.author.toLowerCase().includes(postSearch.toLowerCase());
      const matchesCategory = postFilterCategory === 'all' || post.category === postFilterCategory;
      return matchesSearch && matchesCategory;
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [newsHistory, postSearch, postFilterCategory]);

  const contentMetrics = useMemo(() => {
    const totalViews = newsHistory.reduce((acc, curr) => acc + (curr.views || 0), 0);
    const publishedCount = newsHistory.filter(n => n.status === 'published').length;
    const avgViews = publishedCount > 0 ? Math.round(totalViews / publishedCount) : 0;
    const topPost = [...newsHistory].sort((a, b) => (b.views || 0) - (a.views || 0))[0];
    return { totalViews, avgViews, topPost };
  }, [newsHistory]);

  const getInitials = (name: string) => {
     return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
  };

  const filteredUsers = useMemo(() => {
    return allUsers.filter(u => {
      const matchesSearch = u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase());
      const matchesRole = userRoleFilter === 'all' || u.role === userRoleFilter;
      return matchesSearch && matchesRole;
    });
  }, [allUsers, userSearch, userRoleFilter]);

  const getUserStats = (userId: string) => {
    const userPosts = newsHistory.filter(n => n.authorId === userId);
    const totalPosts = userPosts.filter(n => n.status === 'published').length;
    const totalViews = userPosts.reduce((acc, n) => acc + (n.views || Math.floor(Math.random() * 500)), 0); 
    const rejectedPosts = userPosts.filter(n => n.status === 'needs_changes').length;
    return { totalPosts, totalViews, rejectedPosts, userPosts };
  };

  const handleUserUpdate = (updatedUser: User) => {
     if (user.id === updatedUser.id && updatedUser.status === 'suspended') {
       alert("🚫 Ação Negada: Você não pode banir a si mesmo.");
       return;
     }
     onUpdateUser(updatedUser);
     setSelectedUser(updatedUser);
  };

  const NavButton = ({ id, icon, label, isActive, onClick }: { id: string, icon: string, label: string, isActive: boolean, onClick: () => void }) => (
    <button 
      onClick={onClick} 
      className={`group relative w-12 h-12 flex items-center justify-center rounded-xl transition-all duration-300 ${
        isActive 
          ? 'bg-gradient-to-br from-red-600 to-red-800 text-white shadow-[0_0_20px_rgba(220,38,38,0.4)] scale-110 z-10' 
          : 'text-gray-500 hover:bg-white/5 hover:text-white'
      }`}
    >
      <i className={`fas ${icon} text-lg ${isActive ? 'animate-pulse' : ''}`}></i>
      <span className="hidden md:block absolute left-full ml-4 bg-white text-black text-[10px] font-black uppercase px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl z-50 pointer-events-none translate-x-[-10px] group-hover:translate-x-0 duration-300">
        {label}
        <span className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-white rotate-45"></span>
      </span>
      {isActive && <div className="hidden md:block absolute -left-3 top-1/2 -translate-y-1/2 w-1 h-6 bg-red-600 rounded-r-full shadow-[0_0_10px_#dc2626]"></div>}
    </button>
  );

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans relative flex-col md:flex-row">
       {/* OVERLAY DE PUBLICAÇÃO OMNICHANNEL */}
       {isPublishingFlow && (
           <PublishingOverlay 
               steps={publishingSteps}
               currentStepIndex={currentPublishIndex}
               isComplete={currentPublishIndex >= publishingSteps.length}
               onClose={handleCloseOverlay}
           />
       )}

       {/* ... (Mobile Nav e Sidebar - Mantidos) ... */}
       <nav className="md:hidden sticky top-0 z-50 bg-[#050505] text-white shadow-2xl border-b border-white/10">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="w-8 h-8 flex-shrink-0">
             <Logo />
          </div>
          
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide flex-1 mx-4">
            {[
               { id: 'dashboard', icon: 'fa-chart-pie' },
               { id: 'editor', icon: 'fa-file-pen' },
               { id: 'workflow', icon: 'fa-clipboard-check' },
               { id: 'advertisers', icon: 'fa-store' },
               ...(isAdmin ? [{ id: 'users', icon: 'fa-user-shield' }] : []),
               { id: 'settings', icon: 'fa-cog' }
            ].map(tab => (
               <button
                  key={tab.id}
                  onClick={() => {
                     if(tab.id === 'editor') resetStates();
                     setActiveTab(tab.id as any);
                  }}
                  className={`p-2 rounded-lg transition-all ${activeTab === tab.id ? 'bg-red-600 text-white' : 'text-gray-400'}`}
               >
                  <i className={`fas ${tab.icon} text-sm`}></i>
               </button>
            ))}
          </div>

          <button className="text-gray-400 hover:text-red-500">
             <i className="fas fa-sign-out-alt"></i>
          </button>
        </div>
      </nav>

      {/* --- SIDEBAR COMMAND CENTER (Desktop) --- */}
      <aside className="hidden md:flex w-24 bg-[#050505] flex-col items-center py-10 fixed h-full z-40 border-r border-white/5 shadow-2xl">
        <div className="mb-12 relative group cursor-pointer">
           <div className="absolute inset-0 bg-red-600 rounded-3xl blur-lg opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
           <div className="w-14 h-14 bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-2xl p-2.5 relative z-10 shadow-inner group-hover:border-red-500/30 transition-colors">
              <Logo />
           </div>
        </div>

        <nav className="flex flex-col gap-6 w-full px-4 items-center">
          <NavButton id="dashboard" icon="fa-chart-pie" label="Dashboard" isActive={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <NavButton id="editor" icon="fa-file-pen" label="Redação" isActive={activeTab === 'editor'} onClick={() => { resetStates(); setActiveTab('editor'); }} />
          <NavButton id="workflow" icon="fa-clipboard-check" label="Gestor de Conteúdo" isActive={activeTab === 'workflow'} onClick={() => setActiveTab('workflow')} />
          <NavButton id="advertisers" icon="fa-store" label="Anunciantes" isActive={activeTab === 'advertisers'} onClick={() => setActiveTab('advertisers')} />
          {isAdmin && <NavButton id="users" icon="fa-user-shield" label="Equipe" isActive={activeTab === 'users'} onClick={() => setActiveTab('users')} />}
          <NavButton id="settings" icon="fa-cog" label="Configurações" isActive={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
        </nav>

        <div className="mt-auto mb-4 flex flex-col gap-4">
           <button className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-500 hover:text-red-500 hover:bg-white/10 transition-all group relative">
              <i className="fas fa-sign-out-alt text-xs"></i>
              <span className="absolute left-full ml-4 bg-red-600 text-white text-[9px] font-black uppercase px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">Sair</span>
           </button>
        </div>
      </aside>

      <main className="flex-1 md:ml-24 p-4 md:p-8 min-w-0 flex flex-col w-full">
        {/* ... (Settings, Dashboard, Users, Workflow e Editor mantidos) ... */}
        {activeTab === 'settings' && (
             <div className="animate-fadeIn max-w-4xl mx-auto w-full">
             <header className="mb-12">
                <h1 className="text-3xl md:text-4xl font-black uppercase italic tracking-tighter">CONFIGURAÇÕES DO <span className="text-red-600">SISTEMA</span></h1>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Gerenciamento de Integrações e APIs</p>
             </header>

             {/* ... (Conteúdo de Configurações Mantido) ... */}
             <div className="grid grid-cols-1 gap-8">
                {/* Google Drive Integration Card */}
                <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-gray-100 shadow-sm relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-6 opacity-5 rotate-12">
                      <i className="fab fa-google-drive text-9xl text-green-600"></i>
                   </div>
                   
                   <div className="flex items-center gap-4 mb-8">
                      <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-green-600 text-2xl border border-green-100">
                         <i className="fab fa-google-drive"></i>
                      </div>
                      <div>
                         <h2 className="text-xl font-black text-gray-900 uppercase italic">Integração Google Drive</h2>
                         <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Armazenamento de Mídia em Nuvem</p>
                      </div>
                   </div>

                   <div className="space-y-6 max-w-2xl relative z-10 w-full">
                      <div className={`p-4 rounded-r-xl border-l-4 ${gapiInited && gisInited ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'}`}>
                         <p className={`text-xs leading-relaxed ${gapiInited && gisInited ? 'text-green-800' : 'text-red-800'}`}>
                            <i className={`fas ${gapiInited && gisInited ? 'fa-check-circle' : 'fa-exclamation-triangle'} mr-2`}></i>
                            {gapiInited && gisInited ? 
                                "Módulos de API do Google carregados corretamente." : 
                                "APIs não carregadas. Verifique se as credenciais abaixo estão salvas e corretas."}
                         </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div>
                            <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block tracking-widest">Client ID</label>
                            <input 
                              type="text" 
                              value={driveConfig.clientId}
                              onChange={(e) => setDriveConfig({...driveConfig, clientId: e.target.value})}
                              placeholder="ex: 123456-abcde.apps.googleusercontent.com"
                              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-green-500 transition-all"
                            />
                         </div>
                         <div>
                            <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block tracking-widest">API Key</label>
                            <input 
                              type="password" 
                              value={driveConfig.apiKey}
                              onChange={(e) => setDriveConfig({...driveConfig, apiKey: e.target.value})}
                              placeholder="Sua API Key do Google Cloud"
                              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-green-500 transition-all"
                            />
                         </div>
                         <div className="md:col-span-2">
                            <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block tracking-widest">App ID (Project ID)</label>
                            <input 
                              type="text" 
                              value={driveConfig.appId}
                              onChange={(e) => setDriveConfig({...driveConfig, appId: e.target.value})}
                              placeholder="ex: 1234567890"
                              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-green-500 transition-all"
                            />
                         </div>
                      </div>

                      <div className="pt-4 border-t border-gray-100 flex justify-end">
                         <button 
                           onClick={saveDriveSettings}
                           className="bg-black text-white px-8 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-green-600 transition-all shadow-lg flex items-center gap-2"
                         >
                            <i className="fas fa-save"></i> Salvar & Recarregar
                         </button>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        )}
        {activeTab === 'dashboard' && (
            <div className="animate-fadeIn w-full">
            <header className="mb-8 md:mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-black uppercase italic tracking-tighter">CENTRO DE <span className="text-red-600">COMANDO</span></h1>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Bem-vindo, {user.name} • {user.role}</p>
              </div>
              <div className="flex flex-col md:flex-row gap-3">
                 <button onClick={() => setActiveTab('advertisers')} className="hidden md:flex bg-white text-gray-800 border border-gray-200 px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-sm items-center gap-2 hover:bg-gray-50 transition-colors">
                   <i className="fas fa-users-cog"></i> Gestão de Anunciantes
                 </button>
                 <button onClick={() => { resetStates(); setActiveTab('editor'); }} className="hidden md:flex bg-black text-white px-8 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl items-center gap-2 hover:bg-red-600 transition-colors">
                   <i className="fas fa-plus"></i> Nova Matéria
                 </button>
              </div>
            </header>

            {/* Mobile Action Button */}
            <div className="md:hidden mb-8 w-full flex flex-col gap-3">
              <button onClick={() => { resetStates(); setActiveTab('editor'); }} className="w-full bg-black text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl flex justify-center items-center gap-2 active:scale-95 transition-transform">
                <i className="fas fa-plus"></i> Escrever Nova Matéria
              </button>
              <button onClick={() => setActiveTab('advertisers')} className="w-full bg-white border border-gray-200 text-gray-800 py-3 rounded-2xl font-black uppercase text-xs tracking-widest shadow-sm flex justify-center items-center gap-2 active:scale-95 transition-transform">
                <i className="fas fa-users-cog"></i> Gerir Anunciantes
              </button>
            </div>

            {/* Metrics */}
            <div className="mb-12 w-full">
               <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-white p-6 rounded-[2rem] border shadow-sm">
                     <span className="text-[9px] font-black uppercase text-slate-400">Total Visualizações</span>
                     <p className="text-3xl font-black text-slate-900 mt-2">{adMetrics.totalViews.toLocaleString()}</p>
                     <div className="w-full bg-slate-100 h-1.5 mt-4 rounded-full overflow-hidden">
                        <div className="bg-blue-600 h-full w-[70%]"></div>
                     </div>
                  </div>
                  <div className="bg-white p-6 rounded-[2rem] border shadow-sm">
                     <span className="text-[9px] font-black uppercase text-slate-400">Total Cliques</span>
                     <p className="text-3xl font-black text-slate-900 mt-2">{adMetrics.totalClicks.toLocaleString()}</p>
                     <div className="w-full bg-slate-100 h-1.5 mt-4 rounded-full overflow-hidden">
                        <div className="bg-green-500 h-full w-[45%]"></div>
                     </div>
                  </div>
                  <div className="bg-white p-6 rounded-[2rem] border shadow-sm">
                     <span className="text-[9px] font-black uppercase text-slate-400">CTR Médio</span>
                     <p className="text-3xl font-black text-purple-600 mt-2">{adMetrics.ctr}%</p>
                  </div>
                  <div onClick={() => setActiveTab('advertisers')} className="bg-black p-6 rounded-[2rem] border border-gray-800 shadow-xl relative overflow-hidden group cursor-pointer">
                     <div className="absolute inset-0 bg-red-600/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                     <div className="flex justify-between items-start">
                        <span className="text-[9px] font-black uppercase text-gray-400">Anunciantes Ativos</span>
                        <i className="fas fa-arrow-right text-gray-500 group-hover:text-white transition-colors transform -rotate-45 group-hover:rotate-0"></i>
                     </div>
                     <p className="text-3xl font-black text-white mt-2">{advertisers.filter(a => a.isActive).length}</p>
                  </div>
               </div>
            </div>

            <div className="bg-white rounded-[3rem] border shadow-sm overflow-hidden w-full max-w-full">
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left min-w-[600px]">
                  <thead className="bg-slate-50 border-b">
                    <tr>
                      <th className="p-6 text-[10px] font-black uppercase text-slate-400">Notícia</th>
                      <th className="p-6 text-[10px] font-black uppercase text-slate-400">Status</th>
                      <th className="p-6 text-[10px] font-black uppercase text-slate-400">Omnichannel</th>
                      <th className="p-6 text-[10px] font-black uppercase text-slate-400 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {newsHistory.slice().reverse().map(n => (
                      <tr key={n.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-6">
                          <p className="font-black text-slate-900 uppercase italic leading-tight truncate max-w-[150px] md:max-w-[200px]">{n.title}</p>
                          <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">{n.category} • Por {n.author}</p>
                        </td>
                        <td className="p-6">
                          <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${n.status === 'published' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                            {n.status}
                          </span>
                        </td>
                        <td className="p-6">
                          <div className="flex gap-1">
                            {n.socialDistribution?.map((sd, i) => (
                              <span key={i} title={sd.platform} className={`w-2 h-2 rounded-full ${sd.status === 'published' ? 'bg-blue-500' : 'bg-gray-200'}`}></span>
                            ))}
                          </div>
                        </td>
                        <td className="p-6 text-right">
                          <button onClick={() => startEdit(n)} className="w-10 h-10 rounded-xl bg-slate-100 text-slate-400 hover:bg-red-600 hover:text-white transition-all"><i className="fas fa-pencil"></i></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
        {activeTab === 'users' && isAdmin && (
            <div className="animate-fadeIn relative w-full">
             <header className="mb-8">
                <h1 className="text-3xl md:text-4xl font-black uppercase italic tracking-tighter mb-2">GESTÃO DE <span className="text-red-600">EQUIPE</span></h1>
                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Controle total de permissões e produtividade</p>
             </header>

             {/* FILTERS */}
             <div className="flex flex-col md:flex-row gap-4 mb-8">
               <div className="flex-1 relative">
                 <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"></i>
                 <input 
                   type="text" 
                   placeholder="Buscar por nome ou e-mail..." 
                   value={userSearch}
                   onChange={(e) => setUserSearch(e.target.value)}
                   className="w-full pl-10 pr-4 py-4 bg-white rounded-2xl border border-gray-100 outline-none focus:border-red-500 font-bold text-sm"
                 />
               </div>
               <select 
                 value={userRoleFilter} 
                 onChange={(e) => setUserRoleFilter(e.target.value)}
                 className="px-6 py-4 bg-white rounded-2xl border border-gray-100 outline-none font-bold text-sm uppercase text-gray-600 focus:border-red-500"
               >
                 <option value="all">Todos os Cargos</option>
                 {USER_ROLES.map(role => <option key={role} value={role}>{role}</option>)}
               </select>
             </div>

             {/* USERS MASTER TABLE */}
             <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden w-full max-w-full">
               <div className="overflow-x-auto w-full">
                <table className="w-full text-left min-w-[600px]">
                  {/* ... (Conteúdo da tabela de usuários mantido) ... */}
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="p-6 text-[10px] font-black uppercase text-gray-400 tracking-widest">Usuário</th>
                      <th className="p-6 text-[10px] font-black uppercase text-gray-400 tracking-widest">Cargo</th>
                      <th className="p-6 text-[10px] font-black uppercase text-gray-400 tracking-widest">Status</th>
                      <th className="p-6 text-[10px] font-black uppercase text-gray-400 tracking-widest">Produção</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredUsers.map(u => {
                      const stats = getUserStats(u.id);
                      return (
                        <tr 
                          key={u.id} 
                          onClick={() => setSelectedUser(u)}
                          className={`cursor-pointer hover:bg-red-50/50 transition-colors group ${selectedUser?.id === u.id ? 'bg-red-50' : ''}`}
                        >
                          <td className="p-6 flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-black text-xs border-2 border-transparent group-hover:border-red-600 transition-colors">
                              {u.avatar ? <img src={u.avatar} className="w-full h-full rounded-full object-cover" /> : getInitials(u.name)}
                            </div>
                            <div>
                              <p className="font-black text-gray-900 text-sm leading-none">{u.name}</p>
                              <p className="text-[10px] font-bold text-gray-400 mt-1">{u.email}</p>
                            </div>
                          </td>
                          <td className="p-6">
                            <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border border-gray-200">
                              {u.role}
                            </span>
                          </td>
                          <td className="p-6">
                            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-2 w-fit ${u.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                              <span className={`w-2 h-2 rounded-full ${u.status === 'active' ? 'bg-green-600' : 'bg-red-600'}`}></span>
                              {u.status === 'active' ? 'Ativo' : 'Suspenso'}
                            </span>
                          </td>
                          <td className="p-6">
                            <span className="text-sm font-black text-gray-900">{stats.totalPosts} <span className="text-[9px] text-gray-400 font-bold uppercase">Posts</span></span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
               </div>
             </div>

             {/* USER DETAIL SLIDE-OVER (Right Side) - Mantido */}
             {selectedUser && (
               <div className="fixed inset-y-0 right-0 w-full md:w-[450px] bg-white shadow-[-10px_0_40px_rgba(0,0,0,0.1)] z-50 animate-fadeInRight border-l border-gray-100 flex flex-col">
                 {/* ... (Detalhes do usuário mantidos) ... */}
                 <div className="p-8 border-b border-gray-100 bg-gray-50 flex flex-col gap-6">
                    <button onClick={() => setSelectedUser(null)} className="self-start text-[10px] font-black uppercase text-gray-400 hover:text-red-600 mb-2">
                       <i className="fas fa-arrow-right mr-2"></i> Fechar Painel
                    </button>
                    
                    <div className="flex items-center gap-6">
                       <div className="w-20 h-20 rounded-[2rem] bg-black text-white flex items-center justify-center font-black text-2xl shadow-xl">
                          {selectedUser.avatar ? <img src={selectedUser.avatar} className="w-full h-full rounded-[2rem] object-cover" /> : getInitials(selectedUser.name)}
                       </div>
                       <div>
                          <h2 className="text-2xl font-black text-gray-900 leading-tight">{selectedUser.name}</h2>
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">{selectedUser.email}</p>
                       </div>
                    </div>

                    <div className="flex gap-4">
                       <div className="flex-1">
                          <label className="text-[9px] font-black uppercase text-gray-400 mb-2 block">Cargo</label>
                          <select 
                            value={selectedUser.role} 
                            onChange={(e) => handleUserUpdate({...selectedUser, role: e.target.value as UserRole})}
                            className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold uppercase outline-none focus:border-red-500"
                          >
                             {USER_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                          </select>
                       </div>
                       <div className="flex-1">
                          <label className="text-[9px] font-black uppercase text-gray-400 mb-2 block">Acesso</label>
                          <button 
                            onClick={() => handleUserUpdate({...selectedUser, status: selectedUser.status === 'active' ? 'suspended' : 'active'})}
                            className={`w-full py-2 rounded-xl text-xs font-bold uppercase border transition-all ${selectedUser.status === 'active' ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100' : 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100'}`}
                          >
                             {selectedUser.status === 'active' ? 'Banir Usuário' : 'Reativar'}
                          </button>
                       </div>
                    </div>
                    
                    <button onClick={() => alert("Link de redefinição enviado para o email do usuário.")} className="text-[9px] font-bold uppercase text-gray-400 hover:text-black underline decoration-gray-300">
                       <i className="fas fa-key mr-1"></i> Resetar Senha
                    </button>
                 </div>
                 {/* ... Metrics Grid ... */}
                 <div className="grid grid-cols-3 gap-4 p-6 border-b border-gray-100">
                    <div className="bg-gray-50 rounded-2xl p-4 text-center">
                       <span className="block text-2xl font-black text-gray-900">{getUserStats(selectedUser.id).totalPosts}</span>
                       <span className="text-[8px] font-black uppercase text-gray-400">Posts</span>
                    </div>
                    <div className="bg-gray-50 rounded-2xl p-4 text-center">
                       <span className="block text-2xl font-black text-gray-900">{getUserStats(selectedUser.id).rejectedPosts}</span>
                       <span className="text-[8px] font-black uppercase text-red-400">Rejeitados</span>
                    </div>
                    <div className="bg-gray-50 rounded-2xl p-4 text-center">
                       <span className="block text-2xl font-black text-gray-900">{(getUserStats(selectedUser.id).totalViews / 1000).toFixed(1)}k</span>
                       <span className="text-[8px] font-black uppercase text-blue-400">Views</span>
                    </div>
                 </div>
                 {/* ... Production History ... */}
                 <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
                    <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-4">Histórico de Produção</h3>
                    <div className="space-y-3">
                       {getUserStats(selectedUser.id).userPosts.slice().reverse().map(post => (
                          <div key={post.id} className="bg-white p-4 rounded-2xl border border-gray-100 hover:shadow-md transition-shadow flex gap-4 items-center group">
                             <div className="w-12 h-12 rounded-xl bg-gray-200 flex-shrink-0 overflow-hidden">
                                <img src={post.imageUrl} className="w-full h-full object-cover" />
                             </div>
                             <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start mb-1">
                                   <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                                      post.status === 'published' ? 'bg-green-500' :
                                      post.status === 'needs_changes' ? 'bg-red-500' : 'bg-amber-400'
                                   }`}></span>
                                   <span className="text-[9px] font-bold text-gray-300 uppercase ml-2 flex-shrink-0">{new Date(post.createdAt).toLocaleDateString()}</span>
                                </div>
                                <h4 className="text-xs font-black text-gray-900 uppercase leading-tight truncate">{post.title}</h4>
                             </div>
                             <button 
                                onClick={() => startEdit(post)}
                                className="w-8 h-8 rounded-lg bg-gray-50 text-gray-400 hover:bg-black hover:text-white transition-colors flex items-center justify-center"
                                title="Editar Post"
                             >
                                <i className="fas fa-pencil text-xs"></i>
                             </button>
                          </div>
                       ))}
                       {getUserStats(selectedUser.id).userPosts.length === 0 && (
                          <div className="text-center py-10 opacity-50">
                             <i className="fas fa-folder-open text-3xl text-gray-300 mb-2"></i>
                             <p className="text-[10px] font-bold uppercase text-gray-400">Sem histórico</p>
                          </div>
                       )}
                    </div>
                 </div>
               </div>
             )}
          </div>
        )}
        {activeTab === 'workflow' && (
          <div className="animate-fadeIn w-full">
            <header className="mb-8">
              <h2 className="text-3xl md:text-4xl font-black uppercase italic tracking-tighter mb-2">Gestor de <span className="text-red-600">Conteúdo</span></h2>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Controle editorial, métricas e aprovações</p>
            </header>
            
            <div className="flex gap-4 mb-8 bg-white p-2 rounded-2xl w-full md:w-fit shadow-sm border border-gray-100 overflow-x-auto">
              <button 
                onClick={() => setWorkflowSubTab('queue')}
                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                  workflowSubTab === 'queue' ? 'bg-black text-white shadow-md' : 'text-gray-400 hover:bg-gray-50'
                }`}
              >
                Fila de Aprovação
                {newsHistory.filter(n => n.status === 'in_review').length > 0 && (
                   <span className="ml-2 bg-red-600 text-white px-1.5 py-0.5 rounded-full text-[8px]">{newsHistory.filter(n => n.status === 'in_review').length}</span>
                )}
              </button>
              <button 
                onClick={() => setWorkflowSubTab('analytics')}
                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                  workflowSubTab === 'analytics' ? 'bg-black text-white shadow-md' : 'text-gray-400 hover:bg-gray-50'
                }`}
              >
                Acervo & Métricas
              </button>
            </div>

            {/* VIEW: APPROVAL QUEUE */}
            {workflowSubTab === 'queue' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {newsHistory.filter(n => n.status !== 'published').length > 0 ? (
                  newsHistory.filter(n => n.status !== 'published').map(n => (
                    <div key={n.id} className="bg-white p-8 rounded-[3rem] border shadow-sm hover:shadow-xl transition-all border-l-8 border-amber-500 group">
                      <div className="flex justify-between items-start mb-4">
                         <span className="bg-amber-100 text-amber-600 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">{n.status.replace('_', ' ')}</span>
                         <span className="text-[9px] font-bold text-gray-400 uppercase">{new Date(n.updatedAt).toLocaleDateString()}</span>
                      </div>
                      <h4 className="font-black uppercase italic text-slate-900 mb-2 line-clamp-2 leading-tight group-hover:text-amber-600 transition-colors">{n.title}</h4>
                      <p className="text-xs text-gray-500 line-clamp-2 mb-6 font-medium">{n.lead || "Sem resumo definido..."}</p>
                      
                      <div className="flex gap-2">
                        <button onClick={() => startEdit(n)} className="flex-1 bg-slate-900 text-white py-3 rounded-2xl text-[9px] font-black uppercase hover:bg-black transition-colors">Abrir Editor</button>
                        {isAdmin && <button onClick={() => onUpdateNews({...n, status: 'published'})} className="bg-green-600 text-white px-4 py-3 rounded-2xl text-[9px] font-black uppercase hover:scale-105 transition-transform"><i className="fas fa-check"></i></button>}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full py-20 text-center opacity-40">
                    <i className="fas fa-check-circle text-6xl text-green-200 mb-4"></i>
                    <p className="text-gray-400 font-bold uppercase tracking-widest">Tudo limpo! Nenhuma pendência.</p>
                  </div>
                )}
              </div>
            )}

            {/* VIEW: ANALYTICS & ALL POSTS LIST */}
            {workflowSubTab === 'analytics' && (
               <div className="space-y-8 animate-fadeIn w-full">
                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                     <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-6 opacity-5"><i className="fas fa-eye text-6xl"></i></div>
                        <span className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Alcance Total</span>
                        <p className="text-4xl font-black text-gray-900 mt-2">{contentMetrics.totalViews.toLocaleString()}</p>
                        <p className="text-[9px] font-bold text-green-500 mt-2 uppercase">+ Leituras em tempo real</p>
                     </div>
                     <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-6 opacity-5"><i className="fas fa-trophy text-6xl"></i></div>
                        <span className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Matéria Mais Lida</span>
                        <p className="text-xl font-black text-gray-900 mt-2 line-clamp-2 leading-tight min-h-[3.5rem]">
                           {contentMetrics.topPost ? contentMetrics.topPost.title : "Nenhum dado"}
                        </p>
                        <p className="text-[9px] font-bold text-red-500 mt-2 uppercase">
                           {contentMetrics.topPost ? `${contentMetrics.topPost.views} Visualizações` : "-"}
                        </p>
                     </div>
                     <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-6 opacity-5"><i className="fas fa-chart-line text-6xl"></i></div>
                        <span className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Média por Post</span>
                        <p className="text-4xl font-black text-blue-600 mt-2">{contentMetrics.avgViews.toLocaleString()}</p>
                        <p className="text-[9px] font-bold text-gray-400 mt-2 uppercase">Engajamento estimado</p>
                     </div>
                  </div>

                  {/* Filters */}
                  <div className="flex flex-col md:flex-row gap-4">
                     <div className="flex-1 relative">
                        <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"></i>
                        <input 
                           type="text" 
                           placeholder="Buscar por título ou autor..." 
                           value={postSearch}
                           onChange={(e) => setPostSearch(e.target.value)}
                           className="w-full pl-10 pr-4 py-3 bg-white rounded-2xl border border-gray-100 outline-none focus:border-black font-bold text-sm transition-colors"
                        />
                     </div>
                     <select 
                        value={postFilterCategory} 
                        onChange={(e) => setPostFilterCategory(e.target.value)}
                        className="px-6 py-3 bg-white rounded-2xl border border-gray-100 outline-none font-bold text-sm uppercase text-gray-600 focus:border-black min-w-[200px]"
                     >
                        <option value="all">Todas as Categorias</option>
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                     </select>
                  </div>

                  {/* Enhanced Table */}
                  <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden w-full max-w-full">
                     <div className="overflow-x-auto w-full">
                        <table className="w-full text-left border-collapse min-w-[600px]">
                           <thead className="bg-gray-50">
                              <tr>
                                 <th className="p-6 text-[9px] font-black uppercase text-gray-400 tracking-widest w-1/2">Publicação</th>
                                 <th className="p-6 text-[9px] font-black uppercase text-gray-400 tracking-widest">Categoria</th>
                                 <th className="p-6 text-[9px] font-black uppercase text-gray-400 tracking-widest">Performance</th>
                                 <th className="p-6 text-[9px] font-black uppercase text-gray-400 tracking-widest text-right">Status</th>
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-gray-50">
                              {filteredPosts.map(post => {
                                 const viewPercentage = contentMetrics.topPost && contentMetrics.topPost.views 
                                    ? ((post.views || 0) / contentMetrics.topPost.views) * 100 
                                    : 0;

                                 return (
                                    <tr key={post.id} className="hover:bg-gray-50/50 transition-colors group cursor-pointer" onClick={() => startEdit(post)}>
                                       <td className="p-6">
                                          <div className="flex items-center gap-4">
                                             <div className="w-12 h-12 rounded-xl bg-gray-200 overflow-hidden flex-shrink-0 relative">
                                                <img src={post.imageUrl} className="w-full h-full object-cover" />
                                                {post.mediaType === 'video' && <div className="absolute inset-0 flex items-center justify-center bg-black/30"><i className="fas fa-play text-white text-[8px]"></i></div>}
                                             </div>
                                             <div>
                                                <h4 className="font-black text-gray-900 text-sm leading-tight mb-1 line-clamp-1 group-hover:text-red-600 transition-colors">{post.title}</h4>
                                                <div className="flex items-center gap-2">
                                                   <div className="w-4 h-4 rounded-full bg-gray-200 flex items-center justify-center text-[8px] font-black">{getInitials(post.author)}</div>
                                                   <span className="text-[10px] text-gray-500 font-bold uppercase">{post.author} • {new Date(post.createdAt).toLocaleDateString()}</span>
                                                </div>
                                             </div>
                                          </div>
                                       </td>
                                       <td className="p-6">
                                          <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest border border-gray-200">
                                             {post.category}
                                          </span>
                                       </td>
                                       <td className="p-6">
                                          <div className="flex flex-col gap-1 w-32">
                                             <div className="flex justify-between items-end">
                                                <span className="text-xs font-black text-gray-900">{post.views || 0}</span>
                                                <span className="text-[8px] font-bold text-gray-400 uppercase">Cliques</span>
                                             </div>
                                             <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                <div className="h-full bg-gradient-to-r from-red-500 to-red-600" style={{ width: `${viewPercentage}%` }}></div>
                                             </div>
                                          </div>
                                       </td>
                                       <td className="p-6 text-right">
                                          <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest inline-block ${
                                             post.status === 'published' ? 'bg-green-100 text-green-700' :
                                             post.status === 'draft' ? 'bg-gray-100 text-gray-500' :
                                             'bg-amber-100 text-amber-600'
                                          }`}>
                                             {post.status === 'published' ? 'Publicado' : post.status === 'draft' ? 'Rascunho' : 'Em Revisão'}
                                          </span>
                                       </td>
                                    </tr>
                                 );
                              })}
                              {filteredPosts.length === 0 && (
                                 <tr>
                                    <td colSpan={4} className="p-10 text-center text-gray-400 text-xs font-bold uppercase">Nenhuma publicação encontrada para os filtros atuais.</td>
                                 </tr>
                              )}
                           </tbody>
                        </table>
                     </div>
                  </div>
               </div>
            )}
            {/* Fechar o Workflow Tab corretamente antes de iniciar o Editor */}
          </div>
        )}

        {/* --- EDITOR TAB --- */}
            {activeTab === 'editor' && (
                <div className="animate-fadeIn max-w-full w-full">
                {/* Header Toolbar */}
                <div className="flex justify-between items-center mb-6 sticky top-0 bg-slate-50 z-20 py-2 border-b border-transparent">
                <button onClick={() => setActiveTab('dashboard')} className="text-[10px] font-black uppercase text-slate-400 hover:text-red-600 transition-colors flex items-center gap-2">
                    <i className="fas fa-arrow-left"></i> Voltar
                </button>
                <div className="flex items-center gap-3">
                    <button onClick={() => handleSave('draft')} className="bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-lg text-xs font-bold uppercase hover:bg-gray-50 transition-all">
                        Rascunho
                    </button>
                    <button onClick={() => handleSave('published')} className="bg-black text-white px-6 py-2 rounded-lg text-xs font-black uppercase hover:bg-red-600 shadow-lg transition-all flex items-center gap-2">
                        {isAdmin ? 'Publicar' : 'Revisar'} <i className="fas fa-paper-plane"></i>
                    </button>
                </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                {/* MAIN CONTENT AREA (Left Column) */}
                <div className="flex-1 bg-white rounded-[2rem] shadow-sm border border-gray-200 p-6 md:p-8 min-h-[80vh] relative w-full min-w-0">
                    {/* Title Input */}
                    <input 
                        type="text" 
                        placeholder="Adicione um título..." 
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        className="w-full text-3xl md:text-5xl font-black uppercase italic text-gray-900 placeholder:text-gray-300 outline-none border-none bg-transparent mb-6 break-words whitespace-normal"
                    />

                    {/* Permalink Preview */}
                    {title && (
                        <div className="text-[10px] text-gray-400 mb-6 flex items-center gap-2 font-mono flex-wrap">
                            <i className="fas fa-link"></i>
                            <span>.../noticia/</span>
                            <input 
                            value={seoSlug || title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '')}
                            onChange={e => setSeoSlug(e.target.value)}
                            className="bg-transparent border-b border-dotted border-gray-300 text-gray-600 outline-none focus:border-red-500 min-w-[50px] flex-1"
                            />
                        </div>
                    )}

                    {/* Toolbar */}
                    <div className="sticky top-14 md:top-4 z-10 bg-gray-50 border border-gray-100 rounded-xl p-2 mb-6 flex items-center gap-1 shadow-sm w-full overflow-x-auto scrollbar-hide">
                        <button onClick={() => execCmd('bold')} className="w-8 h-8 shrink-0 rounded hover:bg-white hover:shadow flex items-center justify-center font-bold text-gray-600" title="Negrito">B</button>
                        <button onClick={() => execCmd('italic')} className="w-8 h-8 shrink-0 rounded hover:bg-white hover:shadow flex items-center justify-center italic text-gray-600" title="Itálico">I</button>
                        <div className="w-px bg-gray-200 mx-1 h-5 shrink-0"></div>
                        <button onClick={() => execCmd('formatBlock', 'H2')} className="w-8 h-8 shrink-0 rounded hover:bg-white hover:shadow flex items-center justify-center font-black text-xs text-gray-600" title="H2">H2</button>
                        <button onClick={() => execCmd('formatBlock', 'H3')} className="w-8 h-8 shrink-0 rounded hover:bg-white hover:shadow flex items-center justify-center font-bold text-xs text-gray-600" title="H3">H3</button>
                        <button onClick={() => execCmd('formatBlock', 'blockquote')} className="w-8 h-8 shrink-0 rounded hover:bg-white hover:shadow flex items-center justify-center text-gray-600" title="Citação"><i className="fas fa-quote-right"></i></button>
                        <div className="w-px bg-gray-200 mx-1 h-5 shrink-0"></div>
                        <button onClick={() => execCmd('justifyLeft')} className="w-8 h-8 shrink-0 rounded hover:bg-white hover:shadow flex items-center justify-center text-gray-600" title="Alinhar Esquerda"><i className="fas fa-align-left"></i></button>
                        <button onClick={() => execCmd('justifyCenter')} className="w-8 h-8 shrink-0 rounded hover:bg-white hover:shadow flex items-center justify-center text-gray-600" title="Centralizar"><i className="fas fa-align-center"></i></button>
                        <div className="w-px bg-gray-200 mx-1 h-5 shrink-0"></div>
                        <button onClick={() => { const url = prompt("Link:"); if(url) execCmd('createLink', url); }} className="w-8 h-8 shrink-0 rounded hover:bg-white hover:shadow flex items-center justify-center text-gray-600" title="Link"><i className="fas fa-link"></i></button>
                        <button onClick={() => execCmd('insertHorizontalRule')} className="w-8 h-8 shrink-0 rounded hover:bg-white hover:shadow flex items-center justify-center text-gray-600" title="Divisor"><i className="fas fa-minus"></i></button>
                    </div>

                    {/* WYSIWYG Editor */}
                    <div className="relative w-full overflow-hidden">
                        <div 
                        ref={editorContentRef}
                        contentEditable
                        onInput={handleEditorInput}
                        onClick={handleEditorClick}
                        onPaste={handlePaste}
                        onDrop={handleDrop}
                        onContextMenu={handleContextMenu}
                        className="outline-none prose prose-lg max-w-none w-full text-gray-800 leading-loose prose-h2:text-2xl prose-h2:font-black prose-h2:uppercase prose-h2:italic prose-a:text-red-600 prose-blockquote:border-l-4 prose-blockquote:border-red-600 prose-blockquote:bg-gray-50 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:italic min-h-[400px] break-words"
                        data-placeholder="Comece a escrever sua história..."
                        ></div>

                        {/* Hidden Body Image Input */}
                        <input 
                        type="file"
                        ref={bodyFileInputRef}
                        className="hidden"
                        accept="image/*,video/*"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleBodyDriveUpload(file);
                            e.target.value = ''; // Reset input
                        }}
                        />

                        {/* Context Menu (Botão Direito) - Expandido */}
                        {contextMenu && (
                        <div 
                            className="fixed z-50 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 min-w-[200px] animate-fadeIn flex flex-col gap-1"
                            style={{ top: contextMenu.y, left: contextMenu.x }}
                        >
                            {/* Seção 1: Formatação Básica */}
                            <div className="px-2 flex justify-between gap-1">
                                <button onClick={() => handleContextMenuClick('bold')} className="p-2 hover:bg-gray-100 rounded text-gray-700 w-full flex justify-center" title="Negrito"><i className="fas fa-bold"></i></button>
                                <button onClick={() => handleContextMenuClick('italic')} className="p-2 hover:bg-gray-100 rounded text-gray-700 w-full flex justify-center" title="Itálico"><i className="fas fa-italic"></i></button>
                                <button onClick={() => handleContextMenuClick('underline')} className="p-2 hover:bg-gray-100 rounded text-gray-700 w-full flex justify-center" title="Sublinhado"><i className="fas fa-underline"></i></button>
                                <button onClick={() => handleContextMenuClick('strikeThrough')} className="p-2 hover:bg-gray-100 rounded text-gray-700 w-full flex justify-center" title="Riscado"><i className="fas fa-strikethrough"></i></button>
                            </div>
                            <div className="h-px bg-gray-100 my-1 mx-2"></div>

                            {/* Seção 2: Cabeçalhos */}
                            <div className="px-2 grid grid-cols-2 gap-1">
                                <button onClick={() => handleContextMenuClick('formatBlock', 'H2')} className="px-3 py-1.5 hover:bg-gray-50 rounded text-xs font-black uppercase text-left">Título 1</button>
                                <button onClick={() => handleContextMenuClick('formatBlock', 'H3')} className="px-3 py-1.5 hover:bg-gray-50 rounded text-xs font-bold uppercase text-left">Título 2</button>
                                <button onClick={() => handleContextMenuClick('formatBlock', 'p')} className="px-3 py-1.5 hover:bg-gray-50 rounded text-xs text-gray-500 uppercase text-left col-span-2">Parágrafo Normal</button>
                            </div>
                            <div className="h-px bg-gray-100 my-1 mx-2"></div>

                            {/* Seção 3: Cores (Pintar) */}
                            <div className="px-3 py-1">
                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">Cor do Texto</span>
                                <div className="flex gap-2">
                                    <button onClick={() => handleContextMenuClick('foreColor', '#dc2626')} className="w-5 h-5 rounded-full bg-red-600 border border-gray-200 hover:scale-110 transition-transform" title="Vermelho"></button>
                                    <button onClick={() => handleContextMenuClick('foreColor', '#2563eb')} className="w-5 h-5 rounded-full bg-blue-600 border border-gray-200 hover:scale-110 transition-transform" title="Azul"></button>
                                    <button onClick={() => handleContextMenuClick('foreColor', '#16a34a')} className="w-5 h-5 rounded-full bg-green-600 border border-gray-200 hover:scale-110 transition-transform" title="Verde"></button>
                                    <button onClick={() => handleContextMenuClick('foreColor', '#000000')} className="w-5 h-5 rounded-full bg-black border border-gray-200 hover:scale-110 transition-transform" title="Preto"></button>
                                </div>
                            </div>
                            <div className="px-3 py-1">
                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">Destacar</span>
                                <div className="flex gap-2">
                                    <button onClick={() => handleContextMenuClick('hiliteColor', '#fef08a')} className="w-full h-5 rounded bg-yellow-200 border border-gray-200 hover:brightness-95 transition-all text-[8px] font-bold uppercase flex items-center justify-center">Marca-Texto</button>
                                    <button onClick={() => handleContextMenuClick('hiliteColor', 'transparent')} className="w-5 h-5 rounded bg-white border border-gray-200 text-gray-400 flex items-center justify-center hover:text-red-500" title="Sem cor"><i className="fas fa-ban text-[10px]"></i></button>
                                </div>
                            </div>
                            <div className="h-px bg-gray-100 my-1 mx-2"></div>

                            {/* Seção 4: Alinhamento e Listas */}
                            <div className="px-2 flex justify-between gap-1">
                                <button onClick={() => handleContextMenuClick('justifyLeft')} className="p-2 hover:bg-gray-100 rounded text-gray-500 hover:text-black transition-colors"><i className="fas fa-align-left"></i></button>
                                <button onClick={() => handleContextMenuClick('justifyCenter')} className="p-2 hover:bg-gray-100 rounded text-gray-500 hover:text-black transition-colors"><i className="fas fa-align-center"></i></button>
                                <button onClick={() => handleContextMenuClick('justifyRight')} className="p-2 hover:bg-gray-100 rounded text-gray-500 hover:text-black transition-colors"><i className="fas fa-align-right"></i></button>
                                <div className="w-px bg-gray-200 h-6 my-auto"></div>
                                <button onClick={() => handleContextMenuClick('insertUnorderedList')} className="p-2 hover:bg-gray-100 rounded text-gray-500 hover:text-black transition-colors"><i className="fas fa-list-ul"></i></button>
                                <button onClick={() => handleContextMenuClick('insertOrderedList')} className="p-2 hover:bg-gray-100 rounded text-gray-500 hover:text-black transition-colors"><i className="fas fa-list-ol"></i></button>
                            </div>
                            <div className="h-px bg-gray-100 my-1 mx-2"></div>

                            {/* Seção 5: Ações Especiais (Upload) */}
                            <button 
                            onClick={() => handleContextMenuClick('upload')}
                            className="w-full text-left px-4 py-3 hover:bg-green-50 text-xs font-bold uppercase tracking-widest text-green-700 flex items-center gap-3 transition-colors"
                            >
                            <i className="fab fa-google-drive text-sm"></i> Upload Mídia (Drive)
                            </button>
                        </div>
                        )}

                        {/* Floating Image Menu */}
                        {selectedImg && !isResizing && (
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-12 bg-black text-white p-2 rounded-xl shadow-2xl flex items-center gap-4 z-20 animate-fadeIn">
                            <div className="flex items-center gap-1">
                                <button onClick={() => applyImgStyle('float', 'left')} className="p-2 hover:bg-gray-800 rounded" title="Esquerda"><i className="fas fa-align-left"></i></button>
                                <button onClick={() => applyImgStyle('float', 'center')} className="p-2 hover:bg-gray-800 rounded" title="Centro"><i className="fas fa-align-center"></i></button>
                                <button onClick={() => applyImgStyle('float', 'right')} className="p-2 hover:bg-gray-800 rounded" title="Direita"><i className="fas fa-align-right"></i></button>
                            </div>
                            <button onClick={() => setSelectedImg(null)} className="ml-2 text-red-500 hover:text-red-400"><i className="fas fa-times"></i></button>
                        </div>
                        )}

                        {/* Resizer Overlay */}
                        {selectedImg && resizerState && (
                        <div 
                            className="absolute border-2 border-blue-500 pointer-events-none z-10"
                            style={{ top: resizerState.y, left: resizerState.x, width: resizerState.w, height: resizerState.h }}
                        >
                            <div 
                            className="resizer-handle absolute bottom-0 right-0 w-4 h-4 bg-blue-500 cursor-se-resize pointer-events-auto border-2 border-white shadow-lg rounded-sm"
                            onMouseDown={handleMouseDownResize}
                            ></div>
                        </div>
                        )}
                    </div>
                </div>

                {/* SIDEBAR SETTINGS (Right Column) */}
                <div className="w-full lg:w-[350px] flex flex-col gap-6">
                    
                    {/* Status Box */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                            <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Publicação</span>
                            <i className="fas fa-chevron-down text-gray-400 text-xs"></i>
                        </div>
                        <div className="p-4 space-y-4">
                            <div className="flex justify-between items-center text-xs">
                            <span className="text-gray-500 font-bold"><i className="fas fa-key mr-2"></i>Status:</span>
                            <span className="font-black text-gray-900 uppercase">Rascunho</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                            <span className="text-gray-500 font-bold"><i className="fas fa-eye mr-2"></i>Visibilidade:</span>
                            <span className="font-black text-gray-900 uppercase">Público</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                            <span className="text-gray-500 font-bold"><i className="far fa-calendar-alt mr-2"></i>Data:</span>
                            <span className="font-bold text-gray-900">Imediato</span>
                            </div>
                        </div>
                    </div>

                    {/* Social Hub Box (Omnichannel) */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden relative transition-all hover:shadow-lg">
                        <div className="bg-gradient-to-r from-gray-900 to-black px-4 py-3 border-b border-gray-800 flex justify-between items-center">
                            <span className="text-[10px] font-black uppercase text-white tracking-widest flex items-center gap-2">
                            <i className="fas fa-share-alt text-red-500"></i> Social Hub
                            </span>
                            <div className="flex items-center gap-2">
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" checked={autoPostSocial} onChange={e => setAutoPostSocial(e.target.checked)} className="sr-only peer" />
                                <div className="w-7 h-4 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-green-500"></div>
                                <span className="ml-1 text-[8px] font-bold text-gray-400 uppercase">Sync</span>
                            </label>
                            </div>
                        </div>
                        <div className="p-4 space-y-4">
                            <p className="text-[9px] text-gray-500 text-center italic mb-2">Publique em todas as redes com 1 clique.</p>
                            
                            <button 
                            onClick={handleGenerateSocial}
                            disabled={isGeneratingSocial}
                            className={`w-full py-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex justify-center items-center gap-2 border ${
                                isGeneratingSocial ? 'bg-gray-100 text-gray-400 border-gray-200' : 'bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-100'
                            }`}
                            >
                            {isGeneratingSocial ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-robot"></i>} 
                            {isGeneratingSocial ? 'Gerando Legendas...' : 'Gerar com IA (Gemini)'}
                            </button>
                            
                            <div className="space-y-3">
                            {['instagram_feed', 'facebook', 'whatsapp', 'linkedin'].map(network => (
                                <div key={network} className="flex items-start gap-3 p-2 bg-gray-50 rounded-lg border border-gray-100 group hover:border-blue-200 transition-colors">
                                    <div className={`w-6 h-6 rounded flex items-center justify-center text-white text-xs shadow-sm ${
                                        network === 'whatsapp' ? 'bg-green-500' : 
                                        network === 'facebook' ? 'bg-blue-600' : 
                                        network === 'linkedin' ? 'bg-blue-800' :
                                        'bg-pink-600'
                                    }`}>
                                        <i className={`fab fa-${network === 'instagram_feed' ? 'instagram' : network}`}></i>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-center mb-1">
                                        <span className="text-[9px] font-black uppercase text-gray-700">{network.replace('_feed', '')}</span>
                                        <span className={`w-2 h-2 rounded-full ${socialCaptions[network] ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                                        </div>
                                        <textarea 
                                        value={socialCaptions[network] || ''}
                                        onChange={e => setSocialCaptions({...socialCaptions, [network]: e.target.value})}
                                        className="w-full bg-white text-[9px] text-gray-600 border border-gray-200 rounded p-1.5 h-16 resize-none focus:border-blue-400 outline-none transition-all placeholder:text-gray-300"
                                        placeholder="Conteúdo gerado aparecerá aqui..."
                                        />
                                    </div>
                                </div>
                            ))}
                            </div>
                        </div>
                    </div>

                    {/* Categories Box */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                            <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Categoria</span>
                        </div>
                        <div className="p-4 max-h-40 overflow-y-auto space-y-2">
                            {CATEGORIES.map(cat => (
                            <label key={cat} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                                <input 
                                    type="radio" 
                                    name="category"
                                    checked={category === cat}
                                    onChange={() => setCategory(cat)}
                                    className="accent-red-600"
                                />
                                <span className="text-xs font-bold text-gray-700">{cat}</span>
                            </label>
                            ))}
                        </div>
                    </div>

                    {/* Featured Image Box */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                            <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Imagem/Vídeo Destaque (Capa)</span>
                        </div>
                        <div className="p-4">
                            {mediaData.url ? (
                            <div className="relative group">
                                {mediaData.type === 'video' ? (
                                    <video src={mediaData.url} className="w-full h-32 object-cover rounded-lg border border-gray-200" controls />
                                ) : (
                                    <img src={mediaData.url} className="w-full h-32 object-cover rounded-lg border border-gray-200" alt="Capa" />
                                )}
                                <button 
                                    onClick={() => setMediaData({ ...mediaData, url: '' })}
                                    className="absolute top-2 right-2 bg-red-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <i className="fas fa-times"></i>
                                </button>
                            </div>
                            ) : (
                            <div className="flex flex-col gap-3">
                                <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center hover:bg-gray-50 transition-colors">
                                    <MediaUploader 
                                    onMediaSelect={(_, url, type) => setMediaData({...mediaData, url, type})}
                                    onDriveUpload={handleDriveUpload} 
                                    />
                                    <p className="text-[9px] text-gray-400 mt-2 uppercase font-bold">Clique para upload</p>
                                </div>
                                
                                <button 
                                    onClick={handleOpenPicker}
                                    disabled={isPickerLoading}
                                    className={`w-full bg-blue-50 text-blue-600 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-blue-100 transition-all flex justify-center items-center gap-2 border border-blue-100 ${isPickerLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    {isPickerLoading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fab fa-google-drive text-sm"></i>} 
                                    {isPickerLoading ? 'Conectando...' : 'Selecionar do Drive'}
                                </button>
                            </div>
                            )}
                            <input 
                            type="text" 
                            placeholder="Créditos da imagem" 
                            value={mediaData.credits}
                            onChange={e => setMediaData({...mediaData, credits: e.target.value})}
                            className="w-full mt-2 text-[10px] border-b border-gray-200 py-1 outline-none focus:border-red-500"
                            />
                        </div>
                    </div>

                    {/* GALLERY / CAROUSEL BOX */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                            <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Galeria / Carrossel</span>
                            <span className="text-[8px] font-bold text-gray-400 bg-gray-200 px-2 py-0.5 rounded">{galleryImages.length}</span>
                        </div>
                        <div className="p-4">
                            <input 
                            type="file" 
                            multiple 
                            accept="image/*" 
                            ref={galleryFileInputRef} 
                            className="hidden" 
                            onChange={(e) => {
                                if(e.target.files) handleGalleryDriveUpload(e.target.files);
                                e.target.value = ''; // Reset
                            }}
                            />
                            <button 
                            onClick={() => galleryFileInputRef.current?.click()}
                            className="w-full bg-purple-50 text-purple-600 py-2 mb-4 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-purple-100 transition-colors flex justify-center items-center gap-2 border border-purple-100"
                            >
                            <i className="fas fa-plus-circle"></i> Adicionar Múltiplas (Drive)
                            </button>

                            <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto">
                            {galleryImages.map((url, idx) => (
                                <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200">
                                    <img src={url} className="w-full h-full object-cover" alt={`Galeria ${idx}`} />
                                    <button 
                                        onClick={() => setGalleryImages(prev => prev.filter((_, i) => i !== idx))}
                                        className="absolute top-1 right-1 bg-red-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-[8px] opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                                    >
                                        <i className="fas fa-times"></i>
                                    </button>
                                </div>
                            ))}
                            </div>
                        </div>
                    </div>

                    {/* Lead / Excerpt Box */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                            <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Resumo (Lead)</span>
                        </div>
                        <div className="p-4">
                            <textarea 
                            value={lead}
                            onChange={e => setLead(e.target.value)}
                            className="w-full h-24 text-xs p-2 border border-gray-200 rounded-lg outline-none focus:border-red-500 resize-none"
                            placeholder="Escreva um breve resumo..."
                            />
                        </div>
                    </div>

                    {/* Options */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                            <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Destaques</span>
                        </div>
                        <div className="p-4 space-y-2">
                            <label className="flex items-center justify-between cursor-pointer">
                            <span className="text-xs font-bold text-gray-700">Notícia Urgente (Plantão)</span>
                            <input type="checkbox" checked={isBreaking} onChange={e => setIsBreaking(e.target.checked)} className="accent-red-600" />
                            </label>
                            <label className="flex items-center justify-between cursor-pointer">
                            <span className="text-xs font-bold text-gray-700">Destaque na Home</span>
                            <input type="checkbox" checked={isFeatured} onChange={e => setIsFeatured(e.target.checked)} className="accent-red-600" />
                            </label>
                        </div>
                    </div>

                </div>
                </div>
                
            </div>
            )}
        {/* --- ADVERTISERS TAB (UPDATED WITH PRICING) --- */}
        {activeTab === 'advertisers' && (
          <div className="animate-fadeIn w-full">
             
             {/* PRICING SETTINGS TOGGLE */}
             {showAdPricingSettings ? (
                <div className="animate-fadeIn max-w-4xl mx-auto w-full mb-8">
                    <header className="mb-8 flex justify-between items-center">
                        <div>
                            <h2 className="text-3xl font-black uppercase italic tracking-tighter text-gray-900 mb-1">
                                Tabela de Preços
                            </h2>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Configuração Global de Anúncios</p>
                        </div>
                        <div className="flex gap-2">
                             <button onClick={() => setShowAdPricingSettings(false)} className="bg-white border border-gray-200 px-4 py-2 rounded-xl text-xs font-bold uppercase hover:bg-gray-50">Cancelar</button>
                             <button onClick={handleSaveAdConfig} className="bg-black text-white px-6 py-2 rounded-xl text-xs font-black uppercase hover:bg-green-600 shadow-lg">Salvar Configurações</button>
                        </div>
                    </header>
                    
                    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div>
                           <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block tracking-widest">Preço Diário Master (R$)</label>
                           <input 
                               type="number" 
                               value={tempAdConfig.masterDailyPrice}
                               onChange={(e) => setTempAdConfig({...tempAdConfig, masterDailyPrice: Number(e.target.value)})}
                               className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-red-500"
                           />
                       </div>
                       <div>
                           <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block tracking-widest">Preço Diário Premium (R$)</label>
                           <input 
                               type="number" 
                               value={tempAdConfig.premiumDailyPrice}
                               onChange={(e) => setTempAdConfig({...tempAdConfig, premiumDailyPrice: Number(e.target.value)})}
                               className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-red-500"
                           />
                       </div>
                       <div>
                           <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block tracking-widest">Cashback Promocional (%)</label>
                           <input 
                               type="number" 
                               value={tempAdConfig.cashbackPercent}
                               onChange={(e) => setTempAdConfig({...tempAdConfig, cashbackPercent: Number(e.target.value)})}
                               className="w-full bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-green-500"
                           />
                       </div>
                       <div>
                           <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block tracking-widest">Texto Promocional (Banner)</label>
                           <input 
                               type="text" 
                               value={tempAdConfig.promoText}
                               onChange={(e) => setTempAdConfig({...tempAdConfig, promoText: e.target.value})}
                               className="w-full bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-yellow-500"
                               placeholder="Ex: Black Friday 50% OFF"
                           />
                       </div>
                    </div>
                </div>
             ) : null}

             {isEditingAdvertiser && currentAdvertiser ? (
                // --- FORMULÁRIO DE EDIÇÃO DE ANUNCIANTE ---
                <div className="animate-fadeIn w-full max-w-4xl mx-auto">
                    <header className="mb-8 flex justify-between items-center">
                        <div>
                            <h2 className="text-3xl font-black uppercase italic tracking-tighter text-gray-900 mb-1">
                                {currentAdvertiser.id ? 'Editar Parceiro' : 'Novo Parceiro'}
                            </h2>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Preencha os dados comerciais</p>
                        </div>
                        <div className="flex gap-2">
                             <button onClick={() => { setIsEditingAdvertiser(false); setCurrentAdvertiser(null); }} className="bg-white border border-gray-200 px-4 py-2 rounded-xl text-xs font-bold uppercase hover:bg-gray-50">Cancelar</button>
                             <button onClick={handleSaveAdvertiser} className="bg-black text-white px-6 py-2 rounded-xl text-xs font-black uppercase hover:bg-green-600 shadow-lg">Salvar</button>
                        </div>
                    </header>
                    
                    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
                        {/* CALCULADORA DE CUSTO (NOVO) */}
                        <div className="bg-gray-900 text-white p-6 rounded-2xl flex justify-between items-center shadow-lg">
                             <div>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block">Custo Estimado da Campanha</span>
                                <span className="text-3xl font-black">R$ {estimatedCost.toFixed(2)}</span>
                                {adConfig.cashbackPercent > 0 && (
                                   <span className="text-[10px] font-bold text-green-400 block mt-1 uppercase">
                                      <i className="fas fa-wallet mr-1"></i> Cashback: R$ {((estimatedCost * adConfig.cashbackPercent) / 100).toFixed(2)}
                                   </span>
                                )}
                             </div>
                             <div className="text-right">
                                <span className="block text-xs font-bold text-gray-400">Plano Selecionado</span>
                                <span className="block text-xl font-black uppercase text-white">{currentAdvertiser.plan}</span>
                             </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block tracking-widest">Nome da Empresa</label>
                                <input 
                                    type="text" 
                                    value={currentAdvertiser.name}
                                    onChange={(e) => setCurrentAdvertiser({...currentAdvertiser, name: e.target.value})}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-red-500"
                                    placeholder="Ex: Supermercado Central"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block tracking-widest">Categoria</label>
                                <input 
                                    type="text" 
                                    value={currentAdvertiser.category}
                                    onChange={(e) => setCurrentAdvertiser({...currentAdvertiser, category: e.target.value})}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-red-500"
                                    placeholder="Ex: Varejo"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block tracking-widest">Plano</label>
                                <select 
                                    value={currentAdvertiser.plan}
                                    onChange={(e) => setCurrentAdvertiser({...currentAdvertiser, plan: e.target.value as AdPlan})}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-red-500 uppercase"
                                >
                                    <option value="standard">Standard (R$ {adConfig.standardDailyPrice}/dia)</option>
                                    <option value="premium">Premium (R$ {adConfig.premiumDailyPrice}/dia)</option>
                                    <option value="master">Master (R$ {adConfig.masterDailyPrice}/dia)</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block tracking-widest">Início</label>
                                <input 
                                    type="date" 
                                    value={currentAdvertiser.startDate}
                                    onChange={(e) => setCurrentAdvertiser({...currentAdvertiser, startDate: e.target.value})}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-red-500"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block tracking-widest">Término</label>
                                <input 
                                    type="date" 
                                    value={currentAdvertiser.endDate}
                                    onChange={(e) => setCurrentAdvertiser({...currentAdvertiser, endDate: e.target.value})}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-red-500"
                                />
                            </div>
                        </div>

                        {/* ... Resto do formulário mantido (Links, Status, Descrição) ... */}
                        <div>
                             <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block tracking-widest">Destino do Clique (Redirect)</label>
                             <div className="flex gap-4">
                                <label className="flex items-center gap-2 cursor-pointer bg-gray-50 p-3 rounded-xl border border-gray-200 w-full hover:border-red-500">
                                    <input 
                                      type="radio" 
                                      checked={currentAdvertiser.redirectType === 'external'} 
                                      onChange={() => setCurrentAdvertiser({...currentAdvertiser, redirectType: 'external'})} 
                                      className="accent-red-600"
                                    />
                                    <span className="text-xs font-bold text-gray-700">Link Externo (Site Próprio)</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer bg-gray-50 p-3 rounded-xl border border-gray-200 w-full hover:border-red-500">
                                    <input 
                                      type="radio" 
                                      checked={currentAdvertiser.redirectType === 'internal'} 
                                      onChange={() => setCurrentAdvertiser({...currentAdvertiser, redirectType: 'internal'})} 
                                      className="accent-red-600"
                                    />
                                    <span className="text-xs font-bold text-gray-700">Página Interna (Vitrine no Portal)</span>
                                </label>
                             </div>
                         </div>
                         
                         {currentAdvertiser.redirectType === 'external' ? (
                            <div>
                                <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block tracking-widest">URL Externa</label>
                                <input 
                                    type="text" 
                                    value={currentAdvertiser.externalUrl || ''}
                                    onChange={(e) => setCurrentAdvertiser({...currentAdvertiser, externalUrl: e.target.value})}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-red-500"
                                    placeholder="https://meusite.com.br"
                                />
                            </div>
                         ) : (
                             // Campos de página interna
                             <>
                                <div>
                                    <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block tracking-widest">WhatsApp (Apenas números)</label>
                                    <input 
                                        type="text" 
                                        value={currentAdvertiser.internalPage?.whatsapp || ''}
                                        onChange={(e) => setCurrentAdvertiser({
                                            ...currentAdvertiser, 
                                            internalPage: { ...currentAdvertiser.internalPage!, whatsapp: e.target.value }
                                        })}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-red-500"
                                        placeholder="34999999999"
                                    />
                                </div>
                                {/* ... Resto dos campos internos (Instagram, Descrição) mantidos ... */}
                             </>
                         )}

                         <div>
                             <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block tracking-widest">Status</label>
                             <div className="flex items-center gap-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" checked={currentAdvertiser.isActive} onChange={() => setCurrentAdvertiser({...currentAdvertiser, isActive: true})} />
                                    <span className="text-sm font-bold text-green-600">Ativo</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" checked={!currentAdvertiser.isActive} onChange={() => setCurrentAdvertiser({...currentAdvertiser, isActive: false})} />
                                    <span className="text-sm font-bold text-red-600">Inativo</span>
                                </label>
                             </div>
                         </div>

                        <div>
                            <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block tracking-widest">Logo URL</label>
                            <input 
                                type="text" 
                                value={currentAdvertiser.logoUrl || ''}
                                onChange={(e) => setCurrentAdvertiser({...currentAdvertiser, logoUrl: e.target.value})}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-red-500"
                                placeholder="https://..."
                            />
                        </div>
                    </div>
                </div>
             ) : (
                // --- LISTA DE ANUNCIANTES (TABELA) ---
                <>
                 <header className="mb-8 flex flex-col md:flex-row justify-between items-end gap-4">
                    <div>
                      <h1 className="text-3xl md:text-4xl font-black uppercase italic tracking-tighter mb-2">GESTÃO DE <span className="text-red-600">ANUNCIANTES</span></h1>
                      <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Painel de Parceiros Comerciais</p>
                    </div>
                    <div className="flex gap-2">
                        {/* BOTÃO DE CONFIGURAÇÃO DE PREÇOS (NOVO) */}
                        <button 
                            onClick={() => setShowAdPricingSettings(true)}
                            className="bg-white text-gray-800 border border-gray-200 px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-sm flex items-center gap-2 hover:bg-gray-50 transition-colors"
                        >
                        <i className="fas fa-tags"></i> Configurar Preços
                        </button>
                        <button 
                            onClick={handleStartNewAdvertiser}
                            className="bg-black text-white px-8 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl flex items-center gap-2 hover:bg-green-600 transition-colors"
                        >
                        <i className="fas fa-plus"></i> Novo Parceiro
                        </button>
                    </div>
                 </header>

                 <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden w-full max-w-full">
                   <div className="overflow-x-auto w-full">
                    <table className="w-full text-left min-w-[700px]">
                      <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                          <th className="p-6 text-[10px] font-black uppercase text-gray-400 tracking-widest">Empresa</th>
                          <th className="p-6 text-[10px] font-black uppercase text-gray-400 tracking-widest">Plano</th>
                          <th className="p-6 text-[10px] font-black uppercase text-gray-400 tracking-widest">Vigência</th>
                          <th className="p-6 text-[10px] font-black uppercase text-gray-400 tracking-widest">Performance</th>
                          <th className="p-6 text-[10px] font-black uppercase text-gray-400 tracking-widest">Status</th>
                          <th className="p-6 text-[10px] font-black uppercase text-gray-400 tracking-widest text-right">Ação</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {advertisers.map(ad => (
                          <tr key={ad.id} className="hover:bg-gray-50 transition-colors group">
                            <td className="p-6 flex items-center gap-4">
                               <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center border border-gray-200 overflow-hidden">
                                  {ad.logoUrl ? <img src={ad.logoUrl} className="w-full h-full object-cover" /> : <i className={`fas ${ad.logoIcon || 'fa-store'} text-gray-400`}></i>}
                               </div>
                               <div>
                                  <p className="font-black text-gray-900 text-sm leading-none">{ad.name}</p>
                                  <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase">{ad.category}</p>
                                </div>
                            </td>
                            <td className="p-6">
                               <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                                  ad.plan === 'master' ? 'bg-black text-white border-black' : 
                                  ad.plan === 'premium' ? 'bg-purple-50 text-purple-600 border-purple-100' : 
                                  'bg-gray-50 text-gray-500 border-gray-200'
                               }`}>
                                  {ad.plan}
                               </span>
                            </td>
                            <td className="p-6">
                               <div className="text-[10px] font-bold text-gray-600 flex flex-col">
                                  <span><i className="fas fa-play text-green-500 mr-2"></i>{new Date(ad.startDate).toLocaleDateString()}</span>
                                  <span><i className="fas fa-flag-checkered text-red-500 mr-2"></i>{new Date(ad.endDate).toLocaleDateString()}</span>
                               </div>
                            </td>
                            <td className="p-6">
                               <div className="flex gap-4">
                                  <div className="text-center">
                                     <span className="block text-xs font-black text-gray-900">{ad.views}</span>
                                     <span className="text-[8px] uppercase text-gray-400 font-bold">Views</span>
                                  </div>
                                  <div className="text-center">
                                     <span className="block text-xs font-black text-gray-900">{ad.clicks}</span>
                                     <span className="text-[8px] uppercase text-gray-400 font-bold">Clicks</span>
                                  </div>
                               </div>
                            </td>
                            <td className="p-6">
                               <span className={`px-2 py-1 rounded text-[8px] font-black uppercase tracking-widest ${ad.isActive ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}>
                                  {ad.isActive ? 'Ativo' : 'Inativo'}
                               </span>
                            </td>
                            <td className="p-6 text-right">
                               <button 
                                    onClick={() => handleEditAdvertiser(ad)}
                                    className="w-8 h-8 rounded-lg bg-white border border-gray-200 hover:bg-black hover:text-white transition-colors"
                               >
                                  <i className="fas fa-cog"></i>
                               </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                   </div>
                 </div>
                </>
             )}
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminPanel;
