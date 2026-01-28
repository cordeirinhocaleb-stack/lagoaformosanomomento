/**
 * Utilitário para geração de payload PIX estático (BR Code)
 * Versão simplificada para integração com o sistema de cobrança
 */

function crc16ccitt(data: string): string {
    let crc = 0xFFFF;
    const polynomial = 0x1021;

    for (let i = 0; i < data.length; i++) {
        let b = data.charCodeAt(i);
        for (let j = 0; j < 8; j++) {
            let bit = ((b >> (7 - j) & 1) === 1);
            let c15 = ((crc >> 15 & 1) === 1);
            crc <<= 1;
            if (c15 !== bit) crc ^= polynomial;
        }
    }

    crc &= 0xFFFF;
    return crc.toString(16).toUpperCase().padStart(4, '0');
}

function formatTLV(id: string, value: string): string {
    const length = value.length.toString().padStart(2, '0');
    return `${id}${length}${value}`;
}

export interface PixOptions {
    key: string;
    merchantName: string;
    merchantCity: string;
    amount?: number;
    txid?: string;
}

export function generatePixPayload({ key, merchantName, merchantCity, amount, txid = '***' }: PixOptions): string {
    txid = txid.substring(0, 25); // Limite do TXID em pix estático

    const gui = formatTLV('00', 'br.gov.bcb.pix');
    const keyField = formatTLV('01', key);
    const merchantAccountInfo = formatTLV('26', gui + keyField);

    let payload = [
        formatTLV('00', '01'), // Payload Format Indicator
        formatTLV('01', '12'), // Point of Initiation Method (12 = one use recommended for fixed amount)
        merchantAccountInfo,
        formatTLV('52', '0000'), // Merchant Category Code
        formatTLV('53', '986'),  // Transaction Currency (BRL)
        amount ? formatTLV('54', amount.toFixed(2)) : '', // Transaction Amount
        formatTLV('58', 'BR'),   // Country Code
        formatTLV('59', merchantName.substring(0, 25).toUpperCase()),
        formatTLV('60', merchantCity.substring(0, 15).toUpperCase()),
        formatTLV('62', formatTLV('05', txid)), // Additional Data Field (TXID)
        '6304' // CRC16 Fixed Indicator
    ].join('');

    const crc = crc16ccitt(payload);
    return payload + crc;
}
