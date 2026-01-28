import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Advertiser } from '../../types';
import { getSystemSetting } from '../content/contentService'; // Ajustar import
import { generatePixPayload } from '../../utils/pixPayload';

export async function generateCarnetPDF(advertiser: Advertiser) {
    const settings = await getSystemSetting('general_settings');
    let pixConfig = settings?.pixConfig || null;

    try {
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth(); // 210mm

        // Margens de Segurança para A4 (10mm de cada lado)
        const marginX = 10;
        const marginY = 10;
        const printableWidth = pdfWidth - (marginX * 2); // 190mm

        const billingCycle = advertiser.billingCycle || 'monthly';
        let numberOfSlips = 1;

        if (billingCycle === 'monthly') numberOfSlips = advertiser.contractDuration || 12;
        if (billingCycle === 'quarterly') numberOfSlips = 4;
        if (billingCycle === 'semiannual') numberOfSlips = 2;
        if (billingCycle === 'yearly') numberOfSlips = 1;

        if (advertiser.installments && advertiser.installments > 1) {
            numberOfSlips = advertiser.installments;
        }

        for (let i = 0; i < numberOfSlips; i++) {
            if (i > 0) pdf.addPage();

            const dueDate = new Date();
            if (billingCycle === 'monthly') dueDate.setMonth(dueDate.getMonth() + i);
            else {
                // Cálculo genérico para outros ciclos
                const increment = billingCycle === 'quarterly' ? 3 : billingCycle === 'semiannual' ? 6 : 12;
                dueDate.setMonth(dueDate.getMonth() + (i * increment));
            }

            let pixPayload = '';
            if (pixConfig && advertiser.billingValue) {
                pixPayload = generatePixPayload({
                    key: pixConfig.key,
                    merchantName: pixConfig.merchantName,
                    merchantCity: pixConfig.merchantCity,
                    amount: advertiser.totalWithInterest ? (advertiser.totalWithInterest / numberOfSlips) : advertiser.billingValue,
                    txid: `CARNE${advertiser.id.substring(0, 5)}${i + 1}`.replace(/[^a-zA-Z0-9]/g, '')
                });
            }

            const slipHTML = getCarnetSlipHTML(advertiser, i + 1, numberOfSlips, dueDate, pixPayload, pixConfig, '000', settings);
            const imgData = await createPDFImage(slipHTML);

            // Ajusta a altura da imagem mantendo a proporção (Largura = 190mm)
            const imgHeight = (imgData.height * printableWidth) / imgData.width;

            // Lógica de Paginação Vertical
            // Se o próximo boleto estourar a página, cria nova
            // Altura segura A4 ~280mm (297 - margins)
            const currentY = marginY + (i % 2) * (imgHeight + 15); // 2 por página (Vertical é mais alto)

            // Se for o 3º item (índice 2, 4, 6...), ou se estourar altura
            if (i > 0 && i % 2 === 0) {
                pdf.addPage();
            }

            // Recalcula Y após possível nova página
            const finalY = (i % 2 === 0) ? marginY : marginY + imgHeight + 15;

            pdf.addImage(imgData.data, 'PNG', marginX, finalY, printableWidth, imgHeight);
        }

        const fileName = `carne_${advertiser.name.replace(/\s+/g, '_')}_${Date.now()}.pdf`;
        pdf.save(fileName);
        return { success: true, fileName };

    } catch (error) {
        console.error('Erro ao gerar Carnê:', error);
        return { success: false, error };
    }
}

async function createPDFImage(html: string) {
    const container = document.createElement('div');
    container.innerHTML = html;
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    // Aumentar container para não cortar o conteúdo de 850px
    container.style.width = '1200px';
    container.style.padding = '0';
    container.style.backgroundColor = 'white';
    document.body.appendChild(container);

    // Modificação Crítica: Capturar o ELEMENTO CONTEÚDO, não o container wrapper de 1200px
    const content = container.firstElementChild as HTMLElement;

    try {
        const canvas = await html2canvas(content, {
            scale: 2,
            useCORS: true,
            backgroundColor: '#ffffff',
            windowWidth: 2000, // Força a largura da janela de renderização
            x: 0 // Garante coordenadas corretas
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

// Helper interno se não existir no arquivo (rever se tem Utils)
const Helpers = {
    formatCurrency: (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value),
    formatDate: (date: Date) => new Intl.DateTimeFormat('pt-BR').format(date)
};

function getCarnetSlipHTML(advertiser: Advertiser, currentParcel: number, totalParcels: number, dueDate: Date, pixPayload: string, pixConfig: any, bankCode: string = '000', settings?: any) {
    const value = advertiser.totalWithInterest ? (advertiser.totalWithInterest / totalParcels) : (advertiser.billingValue || 0);

    let displayBarcode = advertiser.billingBarCode || '';

    // Fail-safe e Sanitization de Código de Barras
    // Garante que trabalhamos apenas com números puros
    let cleanBarcode = displayBarcode.replace(/\D/g, '');

    if (cleanBarcode.length < 47 || displayBarcode.includes('Math.floor') || displayBarcode.includes('=>')) {
        const ref = advertiser.id.substring(0, 5).replace(/[^0-9]/g, '9').padEnd(5, '0');
        const parcelSuffix = String(currentParcel).padStart(2, '0');
        // Padrão Dummy: 47 Números Puros (Sem pontos/espaços)
        // Ex: 34191 + 5digit + 5digit + ...
        cleanBarcode = `34191${ref}00000${parcelSuffix}000000000000001000000000000000`;
    }

    // Atualiza para uso nas conversões
    const cleanLine = cleanBarcode;
    let barcode44 = cleanLine;

    if (cleanLine.length === 47) {
        barcode44 = cleanLine.substring(0, 4) +                // AAAB
            cleanLine.substring(32, 33) +              // K (DV Geral)
            cleanLine.substring(33, 47) +              // UUUUVVVVVVVVVV (Fator + Valor)
            cleanLine.substring(4, 9) +                // CCCCC
            cleanLine.substring(10, 20) +              // DDDDDDDDDD
            cleanLine.substring(21, 31);               // EEEEEEEEEE
    } else if (cleanLine.length !== 44) {
        // Fallback se não for 47 nem 44
        barcode44 = cleanLine.padEnd(44, '0').substring(0, 44);
    }

    // CSS para simulação de barcode
    let barcodeCSS = '';
    for (let k = 0; k < 60; k++) {
        const width = Math.random() > 0.5 ? 2 : 4;
        const space = Math.random() > 0.5 ? 1 : 2;
        barcodeCSS += `<div style="width:${width}px; height:100%; background:black; margin-right:${space}px; display:inline-block;"></div>`;
    }

    const qrCodeUrl = pixPayload
        ? `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(pixPayload)}&bgcolor=fafafa`
        : '';

    // Layout VERTICAL: Canhoto em cima, Ficha embaixo. Width ideal para A4.
    return `
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; width: 800px; background: #fff; position: relative; box-sizing: border-box; display: flex; flex-direction: column; color: #000; border: 1px solid #e5e7eb;">
        <style>

        </style>
        
        <!-- Canhoto (Topo) -->
        <div style="width: 100%; border-bottom: 2px dashed #000; padding: 15px; background: #f9fafb; display: flex; justify-content: space-between; align-items: flex-start;">
            <div style="display: flex; gap: 20px;">
                <div style="display: flex; flex-direction: column; gap: 5px;">
                     <div style="display: flex; align-items: center; gap: 8px;">
                        <span style="background: #000; color: #fff; font-weight: 900; font-size: 14px; padding: 4px 8px; border-radius: 4px;">L</span>
                        <div>
                            <h1 style="margin: 0; font-size: 12px; font-weight: 900; color: #111;">LAGOA FORMOSA</h1>
                            <span style="font-size: 8px; color: #b91c1c; font-weight: 700; text-transform: uppercase;">No Momento</span>
                        </div>
                     </div>
                     <div style="font-size: 9px; color: #9ca3af; margin-top: 5px;">VIA DO PAGADOR</div>
                </div>

                <div style="display: flex; gap: 15px;">
                    <div>
                        <div style="font-size: 8px; color: #6b7280; font-weight: 700; text-transform: uppercase;">Vencimento</div>
                        <div style="font-size: 14px; font-weight: 700; color: #b91c1c;">${Helpers.formatDate(dueDate)}</div>
                    </div>
                    <div>
                        <div style="font-size: 8px; color: #6b7280; font-weight: 700; text-transform: uppercase;">Valor</div>
                        <div style="font-size: 14px; font-weight: 900;">${Helpers.formatCurrency(value)}</div>
                    </div>
                    <div>
                        <div style="font-size: 8px; color: #6b7280; font-weight: 700; text-transform: uppercase;">Nosso Núm.</div>
                        <div style="font-size: 12px; font-weight: 600;">${advertiser.id.substring(0, 5).toUpperCase()}</div>
                    </div>
                     <div>
                        <div style="font-size: 8px; color: #6b7280; font-weight: 700; text-transform: uppercase;">Parcela</div>
                        <div style="font-size: 10px; font-weight: 800; background: #fee2e2; padding: 2px 6px; border-radius: 4px; color: #991b1b;">${currentParcel}/${totalParcels}</div>
                    </div>
                </div>
            </div>
            
            <!-- Logo ou Info Extra -->
             <div style="text-align: right;">
                <div style="font-size: 12px; font-weight: 900; color: #111;">RECIBO</div>
            </div>
        </div>

        <!-- Boleto Principal (Baixo) -->
        <div style="width: 100%; padding: 20px; display: flex; flex-direction: column;">
            
            <!-- Cabeçalho Banco -->
            <div style="display: flex; align-items: flex-end; border-bottom: 3px solid #b91c1c; padding-bottom: 8px; margin-bottom: 15px;">
                <div style="display: flex; align-items: center; justify-content: center; width: 50px; height: 25px; margin-right: 12px;">
                     <span style="font-weight: 900; color: #111; font-size: 18px;">${bankCode}</span>
                </div>
                <div style="border-left: 2px solid #e5e7eb; padding-left: 12px; flex: 1;">
                     <div style="font-family: monospace; font-size: 15px; font-weight: 600; letter-spacing: 1px; text-align: right; color: #374151;">
                        ${cleanLine.replace(/(\d{5})(\d{5})(\d{5})(\d{6})(\d{5})(\d{6})(\d)(\d{14})/g, '$1.$2 $3.$4 $5.$6 $7 $8')}
                     </div>
                </div>
            </div>

            <div style="display: flex; gap: 20px;">
                <!-- Coluna Esquerda -->
                <div style="flex: 1;">
                    <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 10px; border-bottom: 1px solid #f3f4f6; padding-bottom: 10px; margin-bottom: 10px;">
                        <div>
                            <div style="font-size: 8px; color: #6b7280; text-transform: uppercase; font-weight: 700;">Local de Pagamento</div>
                            <div style="font-size: 10px; font-weight: 500; color: #111;">PAGÁVEL EM QUALQUER BANCO OU VIA PIX</div>
                        </div>
                        <div style="background: #fef2f2; padding: 5px; border-radius: 4px; border: 1px solid #fee2e2;">
                             <div style="font-size: 8px; color: #991b1b; text-transform: uppercase; font-weight: 700;">Vencimento</div>
                             <div style="font-size: 14px; font-weight: 900; color: #b91c1c; text-align: right;">${Helpers.formatDate(dueDate)}</div>
                        </div>
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr; gap: 8px; margin-bottom: 15px;">
                        <div style="border-bottom: 1px solid #f3f4f6; padding-bottom: 5px;">
                            <div style="font-size: 8px; color: #6b7280; text-transform: uppercase; font-weight: 700;">Beneficiário</div>
                            <div style="font-size: 11px; font-weight: 600; color: #111;">${pixConfig.merchantName || 'LAGOA FORMOSA NO MOMENTO LTDA'}</div>
                            <div style="font-size: 9px; color: #6b7280;">CNPJ: ${pixConfig.key || '00.000.000/0001-00'}</div>
                        </div>
                    </div>

                     <div style="margin-bottom: 15px; background: #fff; border: 1px solid #e5e7eb; border-radius: 6px; padding: 10px;">
                        <div style="font-size: 8px; color: #6b7280; text-transform: uppercase; font-weight: 700; margin-bottom: 4px;">Pagador</div>
                        <div style="font-size: 11px; font-weight: 700; color: #111;">${advertiser.name.toUpperCase()}</div>
                        <div style="font-size: 9px; color: #4b5563;">${advertiser.address || 'Endereço não informado'}</div>
                        <div style="font-size: 9px; color: #4b5563;">CPF/CNPJ: ${advertiser.cpfCnpj || '000.000.000-00'}</div>
                     </div>
                     
                     <div style="margin-bottom: 10px; border-bottom: 1px solid #f3f4f6; padding-bottom: 5px;">
                        <div style="font-size: 8px; color: #6b7280; text-transform: uppercase; font-weight: 700;">Instruções</div>
                        <div style="font-size: 9px; color: #111; line-height: 1.3;">
                            ${settings?.enableInterestBilling
            ? 'Após vencimento, cobrar multa de 1% e juros de 0,2% ao dia.<br/>Não receber após 30 dias.'
            : 'Sr. Caixa, não cobrar juros ou multa.<br/>Não receber após 30 dias.'}
                        </div>
                     </div>
                </div>

                <!-- Coluna Direita -->
                <div style="width: 140px; display: flex; flex-direction: column;">
                    <div style="background: #f9fafb; padding: 10px; border-radius: 8px; border: 1px solid #e5e7eb; margin-bottom: 10px;">
                        <div style="font-size: 8px; color: #6b7280; text-transform: uppercase; font-weight: 700;">Valor Total</div>
                        <div style="font-size: 18px; font-weight: 900; color: #111; text-align: right;">${Helpers.formatCurrency(value)}</div>
                    </div>

                    <div style="background: #fff; padding: 0; flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: start; text-align: center;">
                        ${pixPayload ? `
                        <div style="border: 1px solid #e5e7eb; padding: 5px; border-radius: 6px; display: inline-block;">
                            <img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(pixPayload)}" style="width: 90px; height: 90px; display: block;" />
                        </div>
                        <div style="font-size: 9px; font-weight: 700; margin-top: 5px; color: #059669; text-transform: uppercase;">Pix</div>
                        ` : ''}
                    </div>
                </div>
            </div>


        </div>
    </div>
    `;
}
