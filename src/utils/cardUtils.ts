/**
 * Máscara para número de cartão (XXXX-XXXX-XXXX-XXXX)
 */
export const maskCardNumber = (value: string): string => {
  const cleaned = value.replace(/\D/g, '');
  const limited = cleaned.slice(0, 16);
  return limited
    .replace(/(\d{4})(?=\d)/g, '$1-')
    .toUpperCase();
};

/**
 * Remove máscara do número do cartão
 */
export const unmaskCardNumber = (value: string): string => {
  return value.replace(/\D/g, '');
};

/**
 * Máscara para data de validade (MM/AA)
 */
export const maskExpiry = (value: string): string => {
  const cleaned = value.replace(/\D/g, '').slice(0, 4);
  if (cleaned.length < 2) return cleaned;
  return `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
};

/**
 * Máscara para CVV (3-4 dígitos)
 */
export const maskCVV = (value: string): string => {
  return value.replace(/\D/g, '').slice(0, 4);
};

/**
 * Máscara para número de telemóvel
 */
export const maskPhoneNumber = (value: string): string => {
  const cleaned = value.replace(/\D/g, '');
  // Formato Angola: +244 92X XXXXXX ou 9XX XXXXXX
  if (cleaned.length <= 2) return cleaned;
  if (cleaned.length <= 5) return `${cleaned.slice(0, 2)} ${cleaned.slice(2)}`;
  return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5, 9)}`;
};

/**
 * Detecta tipo de cartão pelo BIN (primeiros 6 dígitos)
 */
export const detectCardBrand = (cardNumber: string): {
  brand: string;
  logo?: string;
  color: string;
} => {
  const cleaned = unmaskCardNumber(cardNumber);
  const bin = cleaned.slice(0, 6);

  // Visa: começa com 4
  if (cleaned[0] === '4') {
    return { brand: 'Visa', color: '#1A1F71' };
  }

  // Mastercard: 51-55 ou 2221-2720
  if (/^(5[1-5]|222[1-9]|22[3-9]|2[3-6]|27[01]|2720)/.test(cleaned)) {
    return { brand: 'Mastercard', color: '#EB001B' };
  }

  // American Express: 34 ou 37
  if (/^3[47]/.test(cleaned)) {
    return { brand: 'American Express', color: '#006FCF' };
  }

  // UnionPay: 62
  if (cleaned.startsWith('62')) {
    return { brand: 'UnionPay', color: '#E60012' };
  }

  // Diners Club: 36 ou 38
  if (/^3[68]/.test(cleaned)) {
    return { brand: 'Diners Club', color: '#0079BE' };
  }

  // JCB: 3528-3589
  if (/^35(2[89]|[3-8])/.test(cleaned)) {
    return { brand: 'JCB', color: '#0066B2' };
  }

  return { brand: 'Desconhecido', color: '#999999' };
};

/**
 * Detecta banco pelo BIN (específico para Angola)
 */
export const detectBankByBIN = (cardNumber: string): {
  bank: string;
  code: string;
  logo?: string;
} | null => {
  const cleaned = unmaskCardNumber(cardNumber);
  const bin = cleaned.slice(0, 6);

  // BINs de bancos em Angola (exemplos - em produção, usar API/base de dados)
  const bankBINs: Record<string, { bank: string; code: string }> = {
    // BAI - Banco Angolano de Investimento
    '501809': { bank: 'BAI', code: 'BAI' },
    '639607': { bank: 'BAI', code: 'BAI' },

    // BFA - Banco de Fomento Angola
    '621850': { bank: 'BFA', code: 'BFA' },
    '639608': { bank: 'BFA', code: 'BFA' },

    // BIC - Banco de Investimentos da Caixa
    '639609': { bank: 'BIC', code: 'BIC' },

    // Standard Bank
    '501810': { bank: 'Standard Bank', code: 'SBK' },
    '639610': { bank: 'Standard Bank', code: 'SBK' },

    // Banco Crédito do Sul
    '639611': { bank: 'Crédito do Sul', code: 'BCS' },

    // Banco Angola
    '503723': { bank: 'Banco de Angola', code: 'BNA' },

    // Ecobank
    '627883': { bank: 'Ecobank', code: 'ECO' },
    '639612': { bank: 'Ecobank', code: 'ECO' },
  };

  if (bankBINs[bin]) {
    return bankBINs[bin];
  }

  // Detectar por padrão
  for (const [binPrefix, bankInfo] of Object.entries(bankBINs)) {
    if (bin.startsWith(binPrefix.slice(0, 4))) {
      return bankInfo;
    }
  }

  return null;
};

/**
 * Valida número de cartão usando algoritmo de Luhn
 */
export const validateCardNumber = (cardNumber: string): boolean => {
  const cleaned = unmaskCardNumber(cardNumber);

  if (cleaned.length < 13 || cleaned.length > 19) {
    return false;
  }

  let sum = 0;
  let isEven = false;

  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned.charAt(i), 10);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
};

/**
 * Valida data de validade
 */
export const validateExpiry = (expiry: string): boolean => {
  const [month, year] = expiry.split('/');

  if (!month || !year) {
    return false;
  }

  const monthNum = parseInt(month, 10);
  const yearNum = parseInt(year, 10);

  if (monthNum < 1 || monthNum > 12) {
    return false;
  }

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear() % 100;
  const currentMonth = currentDate.getMonth() + 1;

  if (yearNum < currentYear) {
    return false;
  }

  if (yearNum === currentYear && monthNum < currentMonth) {
    return false;
  }

  return true;
};

/**
 * Valida CVV
 */
export const validateCVV = (cvv: string): boolean => {
  return /^\d{3,4}$/.test(cvv);
};

/**
 * Valida número de telemóvel (Angola)
 */
export const validateAngolnPhoneNumber = (phone: string): boolean => {
  // Remove espaços e caracteres especiais
  const cleaned = phone.replace(/\D/g, '');

  // Aceita: 924XXXXXX, 925XXXXXX, 92XXXXXXX (9 dígitos)
  // Ou com código do país: +244924XXXXXX
  if (cleaned.length === 9 && cleaned.startsWith('92')) {
    return true;
  }

  if (cleaned.length === 12 && cleaned.startsWith('244')) {
    return cleaned[3] === '9' && cleaned[4] === '2';
  }

  return false;
};
