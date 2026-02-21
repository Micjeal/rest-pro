/**
 * Currency Configuration
 * East African currencies and international currencies for the POS system
 */

export interface Currency {
  code: string
  name: string
  symbol: string
  country: string
  decimalDigits: number
}

export const CURRENCIES: Currency[] = [
  // East African Currencies
  {
    code: 'KES',
    name: 'Kenyan Shilling',
    symbol: 'KSh',
    country: 'Kenya',
    decimalDigits: 2
  },
  {
    code: 'UGX',
    name: 'Ugandan Shilling',
    symbol: 'USh',
    country: 'Uganda',
    decimalDigits: 0
  },
  {
    code: 'TZS',
    name: 'Tanzanian Shilling',
    symbol: 'TSh',
    country: 'Tanzania',
    decimalDigits: 2
  },
  {
    code: 'RWF',
    name: 'Rwandan Franc',
    symbol: 'RF',
    country: 'Rwanda',
    decimalDigits: 0
  },
  {
    code: 'BIF',
    name: 'Burundian Franc',
    symbol: 'FBu',
    country: 'Burundi',
    decimalDigits: 0
  },
  {
    code: 'SCR',
    name: 'Seychellois Rupee',
    symbol: 'SR',
    country: 'Seychelles',
    decimalDigits: 2
  },
  {
    code: 'MUR',
    name: 'Mauritian Rupee',
    symbol: 'Rs',
    country: 'Mauritius',
    decimalDigits: 2
  },
  {
    code: 'SOS',
    name: 'Somali Shilling',
    symbol: 'SSh',
    country: 'Somalia',
    decimalDigits: 0
  },
  {
    code: 'DJF',
    name: 'Djiboutian Franc',
    symbol: 'Fdj',
    country: 'Djibouti',
    decimalDigits: 0
  },
  {
    code: 'ETB',
    name: 'Ethiopian Birr',
    symbol: 'Br',
    country: 'Ethiopia',
    decimalDigits: 2
  },
  {
    code: 'ERN',
    name: 'Eritrean Nakfa',
    symbol: 'Nfk',
    country: 'Eritrea',
    decimalDigits: 2
  },
  {
    code: 'SDD',
    name: 'Sudanese Pound',
    symbol: 'LSd',
    country: 'Sudan',
    decimalDigits: 2
  },
  {
    code: 'SSP',
    name: 'South Sudanese Pound',
    symbol: 'SSP',
    country: 'South Sudan',
    decimalDigits: 2
  },
  {
    code: 'ZMW',
    name: 'Zambian Kwacha',
    symbol: 'ZK',
    country: 'Zambia',
    decimalDigits: 2
  },
  {
    code: 'MWK',
    name: 'Malawian Kwacha',
    symbol: 'MK',
    country: 'Malawi',
    decimalDigits: 2
  },
  {
    code: 'MZN',
    name: 'Mozambican Metical',
    symbol: 'MTn',
    country: 'Mozambique',
    decimalDigits: 2
  },
  {
    code: 'MGA',
    name: 'Malagasy Ariary',
    symbol: 'Ar',
    country: 'Madagascar',
    decimalDigits: 2
  },
  {
    code: 'CDF',
    name: 'Congolese Franc',
    symbol: 'FC',
    country: 'DRC',
    decimalDigits: 2
  },
  {
    code: 'AOA',
    name: 'Angolan Kwanza',
    symbol: 'Kz',
    country: 'Angola',
    decimalDigits: 2
  },
  {
    code: 'NAD',
    name: 'Namibian Dollar',
    symbol: 'N$',
    country: 'Namibia',
    decimalDigits: 2
  },
  {
    code: 'BWP',
    name: 'Botswana Pula',
    symbol: 'P',
    country: 'Botswana',
    decimalDigits: 2
  },
  {
    code: 'SZL',
    name: 'Eswatini Lilangeni',
    symbol: 'E',
    country: 'Eswatini',
    decimalDigits: 2
  },
  {
    code: 'LSL',
    name: 'Lesotho Loti',
    symbol: 'L',
    country: 'Lesotho',
    decimalDigits: 2
  },
  {
    code: 'ZAR',
    name: 'South African Rand',
    symbol: 'R',
    country: 'South Africa',
    decimalDigits: 2
  },
  {
    code: 'CVE',
    name: 'Cape Verdean Escudo',
    symbol: '$',
    country: 'Cape Verde',
    decimalDigits: 2
  },
  {
    code: 'GHS',
    name: 'Ghanaian Cedi',
    symbol: 'GH₵',
    country: 'Ghana',
    decimalDigits: 2
  },
  {
    code: 'NGN',
    name: 'Nigerian Naira',
    symbol: '₦',
    country: 'Nigeria',
    decimalDigits: 2
  },
  {
    code: 'XAF',
    name: 'Central African CFA Franc',
    symbol: 'FCFA',
    country: 'Central Africa',
    decimalDigits: 0
  },
  {
    code: 'GMD',
    name: 'Gambian Dalasi',
    symbol: 'D',
    country: 'Gambia',
    decimalDigits: 2
  },
  {
    code: 'LRD',
    name: 'Liberian Dollar',
    symbol: '$',
    country: 'Liberia',
    decimalDigits: 2
  },
  {
    code: 'SLL',
    name: 'Sierra Leonean Leone',
    symbol: 'Le',
    country: 'Sierra Leone',
    decimalDigits: 2
  },
  {
    code: 'GNF',
    name: 'Guinean Franc',
    symbol: 'FG',
    country: 'Guinea',
    decimalDigits: 0
  },
  {
    code: 'GNQ',
    name: 'Guinea-Bissau CFA Franc',
    symbol: 'CFA',
    country: 'Guinea-Bissau',
    decimalDigits: 0
  },
  {
    code: 'KMF',
    name: 'Comorian Franc',
    symbol: 'CF',
    country: 'Comoros',
    decimalDigits: 0
  },
  {
    code: 'MRO',
    name: 'Mauritanian Ouguiya',
    symbol: 'UM',
    country: 'Mauritania',
    decimalDigits: 2
  },
  {
    code: 'MRU',
    name: 'Mauritanian Ouguiya',
    symbol: 'UM',
    country: 'Mauritania',
    decimalDigits: 2
  },
  
  // Major International Currencies
  {
    code: 'USD',
    name: 'US Dollar',
    symbol: '$',
    country: 'United States',
    decimalDigits: 2
  },
  {
    code: 'EUR',
    name: 'Euro',
    symbol: '€',
    country: 'European Union',
    decimalDigits: 2
  },
  {
    code: 'GBP',
    name: 'British Pound',
    symbol: '£',
    country: 'United Kingdom',
    decimalDigits: 2
  },
  {
    code: 'JPY',
    name: 'Japanese Yen',
    symbol: '¥',
    country: 'Japan',
    decimalDigits: 0
  },
  {
    code: 'CNY',
    name: 'Chinese Yuan',
    symbol: '¥',
    country: 'China',
    decimalDigits: 2
  },
  {
    code: 'INR',
    name: 'Indian Rupee',
    symbol: '₹',
    country: 'India',
    decimalDigits: 2
  },
  {
    code: 'AUD',
    name: 'Australian Dollar',
    symbol: 'A$',
    country: 'Australia',
    decimalDigits: 2
  },
  {
    code: 'CAD',
    name: 'Canadian Dollar',
    symbol: 'C$',
    country: 'Canada',
    decimalDigits: 2
  },
  {
    code: 'CHF',
    name: 'Swiss Franc',
    symbol: 'CHF',
    country: 'Switzerland',
    decimalDigits: 2
  },
  {
    code: 'AED',
    name: 'UAE Dirham',
    symbol: 'د.إ',
    country: 'United Arab Emirates',
    decimalDigits: 2
  },
  {
    code: 'SAR',
    name: 'Saudi Riyal',
    symbol: '﷼',
    country: 'Saudi Arabia',
    decimalDigits: 2
  }
]

// Get currency by code
export function getCurrency(code: string): Currency | undefined {
  return CURRENCIES.find(currency => currency.code === code)
}

// Format currency amount
export function formatCurrency(amount: number, currencyCode: string = 'UGX'): string {
  const currency = getCurrency(currencyCode)
  if (!currency) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'UGX'
    }).format(amount)
  }

  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: currency.decimalDigits,
      maximumFractionDigits: currency.decimalDigits
    }).format(amount)
  } catch (error) {
    // Fallback for unsupported currencies
    return `${currency.symbol}${amount.toFixed(currency.decimalDigits)}`
  }
}

// Get East African currencies only
export function getEastAfricanCurrencies(): Currency[] {
  return CURRENCIES.filter(currency => {
    const eastAfricanCountries = [
      'Kenya', 'Uganda', 'Tanzania', 'Rwanda', 'Burundi', 'Seychelles',
      'Mauritius', 'Somalia', 'Djibouti', 'Ethiopia', 'Eritrea', 'Sudan',
      'South Sudan', 'Zambia', 'Malawi', 'Mozambique', 'Madagascar',
      'DRC', 'Angola', 'Namibia', 'Botswana', 'Eswatini', 'Lesotho',
      'South Africa', 'Cape Verde', 'Ghana', 'Nigeria', 'Central Africa',
      'West Africa', 'Gambia', 'Liberia', 'Sierra Leone', 'Guinea',
      'Guinea-Bissau', 'Comoros', 'Mauritania'
    ]
    return eastAfricanCountries.includes(currency.country)
  })
}

// Group currencies by region
export function getCurrenciesByRegion() {
  return {
    eastAfrica: getEastAfricanCurrencies(),
    international: CURRENCIES.filter(currency => {
      const eastAfricanCountries = [
        'Kenya', 'Uganda', 'Tanzania', 'Rwanda', 'Burundi', 'Seychelles',
        'Mauritius', 'Somalia', 'Djibouti', 'Ethiopia', 'Eritrea', 'Sudan',
        'South Sudan', 'Zambia', 'Malawi', 'Mozambique', 'Madagascar',
        'DRC', 'Angola', 'Namibia', 'Botswana', 'Eswatini', 'Lesotho',
        'South Africa', 'Cape Verde', 'Ghana', 'Nigeria', 'Central Africa',
        'West Africa', 'Gambia', 'Liberia', 'Sierra Leone', 'Guinea',
        'Guinea-Bissau', 'Comoros', 'Mauritania'
      ]
      return !eastAfricanCountries.includes(currency.country)
    })
  }
}
