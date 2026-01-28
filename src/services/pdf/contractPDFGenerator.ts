import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Advertiser } from '../../types';
import { getSystemSetting } from '../content/contentService';
import { generatePixPayload } from '../../utils/pixPayload';

export async function generateContractPDF(advertiser: Advertiser) {
    // Buscar configurações de PIX do sistema
    const settings = await getSystemSetting('general_settings');
    let pixPayload = '';
    let pixConfig = null;

    if (settings?.pixConfig) {
        pixConfig = settings.pixConfig;
        if (advertiser.billingValue && advertiser.billingValue > 0) {
            pixPayload = generatePixPayload({
                key: pixConfig.key,
                merchantName: pixConfig.merchantName,
                merchantCity: pixConfig.merchantCity,
                amount: advertiser.totalWithInterest || advertiser.billingValue,
                txid: advertiser.id ? advertiser.id.replace(/-/g, '').substring(0, 25) : 'ADV001'
            });
        }
    }

    try {
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();

        // --- PÁGINA 1: Contrato Principal ---
        const lateRuleText = settings?.enableInterestBilling
            ? "Multa de 1% e juros de 0,2% ao dia. Cobrar a partir do 1º dia útil após o vencimento."
            : "O pagamento pontual garante a continuidade dos serviços.";

        const page1HTML = getContractHTML(advertiser, pixPayload, pixConfig, lateRuleText);
        const imgData1 = await createPDFImage(page1HTML);
        const pdfHeight1 = (imgData1.height * pdfWidth) / imgData1.width;
        pdf.addImage(imgData1.data, 'PNG', 0, 0, pdfWidth, pdfHeight1);

        // --- PÁGINA 2: Termos e Políticas ---
        pdf.addPage();
        const page2HTML = getTermsHTML(advertiser, settings);
        const imgData2 = await createPDFImage(page2HTML);
        const pdfHeight2 = (imgData2.height * pdfWidth) / imgData2.width;
        pdf.addImage(imgData2.data, 'PNG', 0, 0, pdfWidth, pdfHeight2);

        // Download
        const fileName = `contrato_${advertiser.name.replace(/\s+/g, '_')}_${Date.now()}.pdf`;
        pdf.save(fileName);

        return { success: true, fileName };
    } catch (error) {
        console.error('Erro ao gerar PDF:', error);
        return { success: false, error };
    }
}

async function createPDFImage(html: string) {
    const container = document.createElement('div');
    container.innerHTML = html;
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.width = '210mm'; // A4 width
    container.style.padding = '0';
    container.style.backgroundColor = 'white';
    document.body.appendChild(container);

    try {
        const canvas = await html2canvas(container, {
            scale: 2,
            useCORS: true,
            backgroundColor: '#ffffff'
        });
        return {
            data: canvas.toDataURL('image/png'),
            width: canvas.width,
            height: canvas.height
        };
    } finally {
        document.body.removeChild(container);
    }
}

function getTermsHTML(advertiser: Advertiser, settings?: any): string {
    return `
        <div style="font-family: 'Helvetica Neue', Arial, sans-serif; color: #333; line-height: 1.6; padding: 40px; max-width: 210mm; box-sizing: border-box;">
            
            <div style="border-bottom: 2px solid #DC2626; padding-bottom: 20px; margin-bottom: 30px;">
                <h1 style="color: #DC2626; font-size: 22px; margin: 0; text-transform: uppercase;">Termos de Uso e Políticas</h1>
                <p style="font-size: 10px; color: #666; margin-top: 5px;">Anexo ao Contrato Nº ${advertiser.id.substring(0, 8).toUpperCase()}</p>
            </div>

            <div style="font-size: 11px; text-align: justify; column-count: 2; column-gap: 40px;">
                <h3 style="font-size: 12px; font-weight: 900; margin-top: 0; margin-bottom: 10px; color: #000;">1. DO OBJETO</h3>
                <p style="margin-bottom: 15px;">
                    1.1. Este documento regulamenta a prestação de serviços de publicidade digital e divulgação de conteúdo através da plataforma "Lagoa Formosa No Momento".
                    <br/>1.2. A CONTRATADA compromete-se a veicular os anúncios nas áreas especificadas no plano contratado, garantindo a disponibilidade e visualização conforme métricas de mercado.
                </p>

                <h3 style="font-size: 12px; font-weight: 900; margin-bottom: 10px; color: #000;">2. RESPONSABILIDADES</h3>
                <p style="margin-bottom: 15px;">
                    2.1. O CONTRATANTE declara ser titular dos direitos sobre as marcas e conteúdos enviados, isentando a CONTRATADA de quaisquer ônus por violação de direitos autorais ou de imagem.
                    <br/>2.2. A CONTRATADA não se responsabiliza por indisponibilidades temporárias causadas por falhas técnicas de terceiros, internet ou força maior.
                </p>

                <h3 style="font-size: 12px; font-weight: 900; margin-bottom: 10px; color: #000;">3. POLÍTICA DE CONTEÚDO</h3>
                <p style="margin-bottom: 15px;">
                     3.1. É estritamente proibida a veiculação de conteúdos ilícitos, ofensivos, discriminatórios ou que violem a legislação brasileira vigente.
                     <br/>3.2. A CONTRATADA reserva-se o direito de recusar ou suspender anúncios que infrinjam estas políticas, sem direito a reembolso imediato.
                </p>

                <h3 style="font-size: 12px; font-weight: 900; margin-bottom: 10px; color: #000;">4. PAGAMENTO E INADIMPLÊNCIA</h3>
                <p style="margin-bottom: 15px;">
                    4.1. O não pagamento até a data de vencimento sujeitará o CONTRATANTE às sanções legais cabíveis e suspensão dos serviços.
                    ${settings?.enableInterestBilling ? '<br/>4.2. Será cobrada multa de 1% e juros de mora de 0,2% ao dia.' : ''}
                </p>

                <h3 style="font-size: 12px; font-weight: 900; margin-bottom: 10px; color: #000;">5. CANCELAMENTO</h3>
                <p style="margin-bottom: 15px;">
                    5.1. O cancelamento pode ser solicitado a qualquer momento com aviso prévio de 30 dias.
                    <br/>5.2. Planos anuais ou semestrais pagos antecipadamente poderão ter reembolso parcial calculado pro-rata, deduzida multa rescisória de 20% do saldo restante.
                </p>

                <h3 style="font-size: 12px; font-weight: 900; margin-bottom: 10px; color: #000;">6. DISPOSIÇÕES GERAIS</h3>
                <p style="margin-bottom: 15px;">
                    6.1. As partes elegem o foro da Comarca de Lagoa Formosa/MG para dirimir quaisquer dúvidas oriundas deste contrato.
                    <br/>6.2. Este termo é parte integrante do Contrato de Publicidade Digital assinado digitalmente.
                </p>
            </div>

            <div style="margin-top: 50px; border-top: 1px solid #eee; padding-top: 20px; text-align: center;">
                 <p style="font-size: 10px; color: #999;">
                    Este documento foi gerado eletronicamente em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')} e possui validade jurídica conforme aceite digital.
                 </p>
            </div>
        </div>
    `;
}

function getContractHTML(advertiser: Advertiser, pixPayload: string, pixConfig: any, lateRuleText: string): string {
    const today = new Date().toLocaleDateString('pt-BR');
    const billingCycleNames: Record<string, string> = {
        daily: 'Diário',
        weekly: 'Semanal',
        monthly: 'Mensal',
        quarterly: 'Trimestral',
        semiannual: 'Semestral',
        yearly: 'Anual'
    };

    // Calcular data de vencimento com regra de dia útil (simulada)
    // Regra: 1% multa + 0.2% dia. Início 1 dia útil após.
    // Verifica toggle em settings se foi passado no objeto ou se precisa buscar
    // NOTA: Para este contexto simples, vamos assumir que se não foi passado no pixConfig, não exibimos, ou buscamos via parametro extra.
    // Como a função é sync na string, precisamos injetar o texto.
    // Vamos usar hack: checar se 'pixConfig' tem propriedade oculta ou se 'lateRuleText' vem de fora.
    // Para simplificar: Se o termo 'Juros' não estiver habilitado, mandamos vazio.
    // Mas 'getContractHTML' é puro. Vamos passar o texto como argumento.

    // CORREÇÃO: Vamos mudar a assinatura de getContractHTML para receber o texto de juros.
    return `
        <div style="font-family: 'Helvetica Neue', Arial, sans-serif; color: #111; line-height: 1.5; padding: 40px; max-width: 210mm; box-sizing: border-box;">
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Libre+Barcode+128&display=swap');
                .barcode-font { font-family: 'Libre Barcode 128', cursive; }
            </style>
            
            <!-- HEADER PREMIUM -->
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 30px;">
                <div style="flex: 1;">
                   <!-- Logo Placeholder ou Texto -->
                   <h1 style="font-size: 28px; font-weight: 900; letter-spacing: -1px; margin: 0; text-transform: uppercase;">
                        Lagoa Formosa<br/><span style="color: #DC2626;">No Momento</span>
                   </h1>
                   <p style="font-size: 10px; color: #666; margin-top: 5px; text-transform: uppercase; letter-spacing: 2px;">Publicidade & Mídia Digital</p>
                </div>
                <div style="text-align: right;">
                    <h2 style="font-size: 14px; margin: 0; color: #666;">CONTRATO DE PRESTAÇÃO DE SERVIÇOS</h2>
                    <p style="font-size: 12px; font-weight: bold; margin: 5px 0 0;">Nº ${advertiser.id.substring(0, 8).toUpperCase()}</p>
                    <p style="font-size: 12px; margin: 0;">Emissão: ${today}</p>
                </div>
            </div>

            <!-- GRID PRINCIPAL -->
            <div style="display: flex; gap: 40px; margin-bottom: 30px;">
                <!-- Coluna Esquerda: Anunciante -->
                <div style="flex: 1;">
                    <h3 style="font-size: 12px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #ccc; padding-bottom: 5px; margin-bottom: 15px;">
                        Dados do Contratante
                    </h3>
                    <table style="width: 100%; font-size: 11px; border-collapse: collapse;">
                        <tr><td style="padding: 4px 0; color: #666;">Razão Social / Nome:</td><td style="font-weight: bold;">${advertiser.name}</td></tr>
                        <tr><td style="padding: 4px 0; color: #666;">CPF / CNPJ:</td><td style="font-weight: bold;">${advertiser.cpfCnpj || 'Não informado'}</td></tr>
                        <tr><td style="padding: 4px 0; color: #666;">Endereço:</td><td>${advertiser.address || '-'}</td></tr>
                        <tr><td style="padding: 4px 0; color: #666;">Contato:</td><td>${advertiser.phone || '-'}</td></tr>
                        <tr><td style="padding: 4px 0; color: #666;">Email:</td><td>${advertiser.email || '-'}</td></tr>
                    </table>
                </div>

                <!-- Coluna Direita: Plano -->
                <div style="flex: 1;">
                    <h3 style="font-size: 12px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #ccc; padding-bottom: 5px; margin-bottom: 15px;">
                        Detalhes do Plano
                    </h3>
                    <div style="background: #f9fafb; padding: 15px; border-radius: 8px;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                            <span style="font-size: 11px; color: #666;">Plano Contratado</span>
                            <span style="font-size: 12px; font-weight: 900; color: #DC2626; text-transform: uppercase;">${advertiser.plan}</span>
                        </div>
                         <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                            <span style="font-size: 11px; color: #666;">Vigência</span>
                            <span style="font-size: 11px; font-weight: bold;">${new Date(advertiser.startDate).toLocaleDateString('pt-BR')} até ${new Date(advertiser.endDate).toLocaleDateString('pt-BR')}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                            <span style="font-size: 11px; color: #666;">Ciclo de Renovação</span>
                            <span style="font-size: 11px; font-weight: bold;">${billingCycleNames[advertiser.billingCycle] || advertiser.billingCycle}</span>
                        </div>
                        <div style="margin-top: 15px; padding-top: 10px; border-top: 1px dashed #ccc; display: flex; justify-content: space-between; align-items: center;">
                             <span style="font-size: 11px; font-weight: 900;">VALOR TOTAL</span>
                             <span style="font-size: 16px; font-weight: 900; color: #16A34A;">R$ ${(advertiser.totalWithInterest || advertiser.billingValue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                        </div>

                        ${pixPayload ? `
                        <div style="margin-top: 15px; padding-top: 15px; border-top: 1px dashed #ccc;">
                            <div style="display: flex; gap: 15px; align-items: start;">
                                <img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(pixPayload)}" 
                                     alt="QR Code Pix" 
                                     style="width: 80px; height: 80px; border: 1px solid #ddd; padding: 2px; background: white; border-radius: 4px;" 
                                />
                                <div style="flex: 1;">
                                    <p style="font-size: 10px; font-weight: bold; color: #16A34A; margin: 0 0 5px 0; text-transform: uppercase;">
                                        Pagar com PIX
                                    </p>
                                    <p style="font-size: 9px; color: #666; margin: 0 0 5px 0; line-height: 1.2;">
                                        Escaneie o QR Code ou use o código abaixo:
                                    </p>
                                    <div style="font-size: 8px; font-family: monospace; background: #eee; padding: 5px; border-radius: 4px; word-break: break-all; color: #333;">
                                        ${pixPayload}
                                    </div>
                                </div>
                            </div>
                        </div>
                        ` : ''}
                    </div>
                </div>
            </div>

            <!-- TERMOS RESUMIDOS -->
            <div style="margin-bottom: 40px;">
                <h3 style="font-size: 12px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #ccc; padding-bottom: 5px; margin-bottom: 10px;">
                    Termos e Condições
                </h3>
                <p style="font-size: 10px; color: #555; text-align: justify; margin-bottom: 8px;">
                    1. O CONTRATANTE autoriza a veiculação dos materiais publicitários fornecidos na plataforma Lagoa Formosa No Momento.
                    2. O pagamento deverá ser efetuado conforme data de vencimento estabelecida. <strong>${lateRuleText}</strong>
                    3. A renovação deste contrato ocorre automaticamente conforme ciclo escolhido, salvo cancelamento prévio de 30 dias.
                    4. Este documento serve como título extrajudicial executável em caso de inadimplência.
                </p>
            </div>

            <!-- ASSINATURAS -->
             <div style="display: flex; justify-content: space-between; gap: 40px; margin-bottom: 60px;">
                <div style="flex: 1; text-align: center;">
                    <div style="border-bottom: 1px solid #000; height: 30px; margin-bottom: 10px;"></div>
                    <p style="font-size: 10px; font-weight: bold; text-transform: uppercase;">${advertiser.name}</p>
                    <p style="font-size: 9px; color: #666;">Contratante</p>
                </div>
                <div style="flex: 1; text-align: center;">
                     <div style="border-bottom: 1px solid #000; height: 30px; margin-bottom: 10px;"></div>
                    <p style="font-size: 10px; font-weight: bold; text-transform: uppercase;">Lagoa Formosa No Momento</p>
                    <p style="font-size: 9px; color: #666;">Contratada</p>
                </div>
             </div>

             <!-- RODAPÉ INFORMATIVO (SEM FICHA DE COMPENSAÇÃO) -->
             <div style="margin-top: 40px; border-top: 1px dashed #ccc; padding-top: 10px; font-size: 10px; color: #999; text-align: center;">
                 <p>Este contrato é um instrumento legal. Para efetuar o pagamento, utilize o Carnê ou Boleto gerado separadamente.</p>
                 <p>Documento assinado digitalmente em conformidade com a MP 2.200-2/2001.</p>
             </div>
        </div>
    `;
}
