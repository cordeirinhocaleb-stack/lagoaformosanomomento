import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Advertiser } from '../../types';

export async function generateContractPDF(advertiser: Advertiser) {
    // Criar elemento HTML temporário
    const container = document.createElement('div');
    container.innerHTML = getContractHTML(advertiser);
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.width = '210mm'; // A4 width
    container.style.padding = '20mm';
    container.style.backgroundColor = 'white';
    document.body.appendChild(container);

    try {
        // Converter para canvas
        const canvas = await html2canvas(container, {
            scale: 2,
            useCORS: true,
            backgroundColor: '#ffffff'
        });

        // Criar PDF
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgData = canvas.toDataURL('image/png');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

        // Download
        const fileName = `contrato_${advertiser.name.replace(/\s+/g, '_')}_${Date.now()}.pdf`;
        pdf.save(fileName);

        return { success: true, fileName };
    } catch (error) {
        console.error('Erro ao gerar PDF:', error);
        return { success: false, error };
    } finally {
        // Limpar
        document.body.removeChild(container);
    }
}

function getContractHTML(advertiser: Advertiser): string {
    const today = new Date().toLocaleDateString('pt-BR');
    const billingCycleNames: Record<string, string> = {
        daily: 'Diário',
        weekly: 'Semanal',
        monthly: 'Mensal',
        quarterly: 'Trimestral',
        semiannual: 'Semestral',
        yearly: 'Anual'
    };

    return `
        <div style="font-family: Arial, sans-serif; color: #000; line-height: 1.6;">
            <!-- Cabeçalho -->
            <div style="text-align: center; margin-bottom: 30px; border-bottom: 3px solid #DC2626; padding-bottom: 20px;">
                <h1 style="color: #DC2626; font-size: 24px; margin: 0;">CONTRATO DE PUBLICIDADE DIGITAL</h1>
                <p style="font-size: 12px; color: #666; margin: 10px 0 0 0;">
                    Lagoa Formosa no Momento<br/>
                    Contrato Nº: ${advertiser.id.substring(0, 8).toUpperCase()}<br/>
                    Data de Emissão: ${today}
                </p>
            </div>

            <!-- Dados do Anunciante -->
            <div style="margin-bottom: 25px;">
                <h2 style="font-size: 16px; color: #DC2626; border-bottom: 2px solid #DC2626; padding-bottom: 5px; margin-bottom: 15px;">
                    DADOS DO ANUNCIANTE
                </h2>
                <table style="width: 100%; font-size: 12px;">
                    <tr>
                        <td style="padding: 5px 0; width: 30%; font-weight: bold;">Nome:</td>
                        <td style="padding: 5px 0;">${advertiser.name}</td>
                    </tr>
                    <tr>
                        <td style="padding: 5px 0; font-weight: bold;">Categoria:</td>
                        <td style="padding: 5px 0;">${advertiser.category}</td>
                    </tr>
                    ${advertiser.address ? `
                    <tr>
                        <td style="padding: 5px 0; font-weight: bold;">Endereço:</td>
                        <td style="padding: 5px 0;">${advertiser.address}</td>
                    </tr>
                    ` : ''}
                    ${advertiser.phone ? `
                    <tr>
                        <td style="padding: 5px 0; font-weight: bold;">Telefone:</td>
                        <td style="padding: 5px 0;">${advertiser.phone}</td>
                    </tr>
                    ` : ''}
                    ${advertiser.email ? `
                    <tr>
                        <td style="padding: 5px 0; font-weight: bold;">Email:</td>
                        <td style="padding: 5px 0;">${advertiser.email}</td>
                    </tr>
                    ` : ''}
                    ${advertiser.cpfCnpj ? `
                    <tr>
                        <td style="padding: 5px 0; font-weight: bold;">CPF/CNPJ:</td>
                        <td style="padding: 5px 0;">${advertiser.cpfCnpj}</td>
                    </tr>
                    ` : ''}
                </table>
            </div>

            <!-- Plano Contratado -->
            <div style="margin-bottom: 25px;">
                <h2 style="font-size: 16px; color: #DC2626; border-bottom: 2px solid #DC2626; padding-bottom: 5px; margin-bottom: 15px;">
                    PLANO CONTRATADO
                </h2>
                <table style="width: 100%; font-size: 12px;">
                    <tr>
                        <td style="padding: 5px 0; width: 30%; font-weight: bold;">Plano:</td>
                        <td style="padding: 5px 0; text-transform: uppercase;">${advertiser.plan}</td>
                    </tr>
                    <tr>
                        <td style="padding: 5px 0; font-weight: bold;">Ciclo de Pagamento:</td>
                        <td style="padding: 5px 0;">${billingCycleNames[advertiser.billingCycle] || advertiser.billingCycle}</td>
                    </tr>
                    <tr>
                        <td style="padding: 5px 0; font-weight: bold;">Período:</td>
                        <td style="padding: 5px 0;">${new Date(advertiser.startDate).toLocaleDateString('pt-BR')} até ${new Date(advertiser.endDate).toLocaleDateString('pt-BR')}</td>
                    </tr>
                    <tr>
                        <td style="padding: 5px 0; font-weight: bold;">Status de Pagamento:</td>
                        <td style="padding: 5px 0;">
                            <span style="color: ${advertiser.isPaid ? '#16A34A' : '#EA580C'}; font-weight: bold;">
                                ${advertiser.isPaid ? '✓ PAGO' : 'PENDENTE'}
                            </span>
                        </td>
                    </tr>
                </table>
            </div>

            <!-- Serviços Incluídos -->
            <div style="margin-bottom: 25px;">
                <h2 style="font-size: 16px; color: #DC2626; border-bottom: 2px solid #DC2626; padding-bottom: 5px; margin-bottom: 15px;">
                    SERVIÇOS INCLUÍDOS
                </h2>
                <div style="font-size: 12px;">
                    ${advertiser.promoBanners && advertiser.promoBanners.length > 0 ? `
                        <div style="margin-bottom: 15px;">
                            <h3 style="font-size: 14px; margin-bottom: 10px;">📢 Banner Home</h3>
                            <ul style="margin: 0; padding-left: 20px;">
                                ${advertiser.promoBanners.map(banner => `
                                    <li style="margin-bottom: 5px;">
                                        <strong>${banner.tag || banner.title}</strong>
                                        ${banner.textPositionPreset ? ` - Tema: ${banner.textPositionPreset}` : ''}
                                    </li>
                                `).join('')}
                            </ul>
                        </div>
                    ` : ''}
                    
                    ${advertiser.popupSet && advertiser.popupSet.items && advertiser.popupSet.items.length > 0 ? `
                        <div style="margin-bottom: 15px;">
                            <h3 style="font-size: 14px; margin-bottom: 10px;">🎯 Popup Promocional</h3>
                            <ul style="margin: 0; padding-left: 20px;">
                                ${advertiser.popupSet.items.map(popup => `
                                    <li style="margin-bottom: 5px;">
                                        <strong>${popup.title}</strong>
                                    </li>
                                `).join('')}
                            </ul>
                        </div>
                    ` : ''}

                    ${advertiser.internalPage ? `
                        <div style="margin-bottom: 15px;">
                            <h3 style="font-size: 14px; margin-bottom: 10px;">🏪 Vitrine de Produtos</h3>
                            <p style="margin: 5px 0;">Página interna com produtos e redes sociais</p>
                        </div>
                    ` : ''}
                </div>
            </div>

            <!-- Termos -->
            <div style="margin-bottom: 25px; font-size: 11px; color: #666;">
                <h2 style="font-size: 16px; color: #DC2626; border-bottom: 2px solid #DC2626; padding-bottom: 5px; margin-bottom: 15px;">
                    TERMOS DE SERVIÇO
                </h2>
                <p style="margin-bottom: 10px;">
                    O presente contrato tem por objeto a prestação de serviços de publicidade digital na plataforma 
                    "Lagoa Formosa no Momento", conforme plano e configurações acima especificados.
                </p>
                <p style="margin-bottom: 10px;">
                    <strong>Vigência:</strong> Este contrato terá vigência conforme período especificado, 
                    podendo ser renovado automaticamente conforme ciclo de pagamento escolhido.
                </p>
                <p style="margin-bottom: 10px;">
                    <strong>Métricas:</strong> O anunciante terá acesso a métricas de visualizações e cliques 
                    através do painel administrativo.
                </p>
            </div>

            <!-- Assinaturas -->
            <div style="margin-top: 50px;">
                <h2 style="font-size: 16px; color: #DC2626; border-bottom: 2px solid #DC2626; padding-bottom: 5px; margin-bottom: 30px;">
                    ASSINATURAS
                </h2>
                <div style="display: flex; justify-content: space-between; margin-top: 40px;">
                    <div style="width: 45%; text-align: center;">
                        <div style="border-top: 2px solid #000; padding-top: 10px; margin-top: 60px;">
                            <p style="margin: 5px 0; font-size: 12px; font-weight: bold;">ANUNCIANTE</p>
                            <p style="margin: 5px 0; font-size: 11px;">${advertiser.name}</p>
                            <p style="margin: 5px 0; font-size: 10px; color: #666;">
                                ${advertiser.cpfCnpj || 'CPF/CNPJ: ___________________'}
                            </p>
                        </div>
                    </div>
                    <div style="width: 45%; text-align: center;">
                        <div style="border-top: 2px solid #000; padding-top: 10px; margin-top: 60px;">
                            <p style="margin: 5px 0; font-size: 12px; font-weight: bold;">LAGOA FORMOSA NO MOMENTO</p>
                            <p style="margin: 5px 0; font-size: 11px;">Responsável</p>
                            <p style="margin: 5px 0; font-size: 10px; color: #666;">Data: ${today}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}
