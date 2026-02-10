
/**
 * Serviço para buscar dados de mercado atualizados com cache inteligente.
 */
const CDI_CACHE_KEY = 'finanza_pro_cdi_cache';
const CACHE_EXPIRATION_MS = 1000 * 60 * 60 * 12; // 12 horas

interface CDICache {
  rate: number;
  timestamp: number;
}

export const getCDIRate = async (): Promise<number> => {
  try {
    // Verificar cache primeiro
    const cached = localStorage.getItem(CDI_CACHE_KEY);
    if (cached) {
      const { rate, timestamp }: CDICache = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_EXPIRATION_MS) {
        return rate;
      }
    }

    // API do Banco Central do Brasil - Série 1178 (Selic diária anualizada)
    // O CDI costuma orbitar exatamente 0.10% abaixo da Selic Meta.
    const response = await fetch('https://api.bcb.gov.br/dados/serie/bcdata.sgs.1178/dados/ultimos/1?formato=json');
    if (!response.ok) throw new Error('Falha ao buscar CDI');
    
    const data = await response.json();
    if (data && data.length > 0) {
      const selicRate = parseFloat(data[0].valor);
      const cdiRate = Number((selicRate - 0.10).toFixed(2));
      
      // Salvar no cache
      localStorage.setItem(CDI_CACHE_KEY, JSON.stringify({
        rate: cdiRate,
        timestamp: Date.now()
      }));

      return cdiRate;
    }
    return 11.15; // Fallback
  } catch (error) {
    console.error("Erro ao buscar CDI do Banco Central:", error);
    
    // Se falhar, tenta usar o cache mesmo expirado antes do fallback hardcoded
    const cached = localStorage.getItem(CDI_CACHE_KEY);
    if (cached) {
      return JSON.parse(cached).rate;
    }
    
    return 11.15; 
  }
};
