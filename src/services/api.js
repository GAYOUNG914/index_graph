import axios from 'axios'

// FRED API 키 (무료로 발급받을 수 있음)
const FRED_API_KEY = import.meta.env.VITE_FRED_API_KEY || '45995be636090700d8281300e3179454'
const ALPHA_VANTAGE_API_KEY = import.meta.env.VITE_ALPHA_VANTAGE_API_KEY || 'QDQ4G54QZZFACCWN'

// FRED API 기본 설정 (CORS 프록시 사용)
const fredApi = axios.create({
  baseURL: 'https://cors-anywhere.herokuapp.com/https://api.stlouisfed.org/fred',
  params: {
    api_key: FRED_API_KEY,
    file_type: 'json'
  }
})

// Alpha Vantage API 기본 설정 (CORS 프록시 사용)
const alphaVantageApi = axios.create({
  baseURL: 'https://cors-anywhere.herokuapp.com/https://www.alphavantage.co/query'
})

// 연준 대차대조표 데이터 가져오기
export const getFederalReserveBalanceSheet = async (startDate, endDate) => {
  try {
    const response = await fredApi.get('/series/observations', {
      params: {
        series_id: 'WALCL', // 연준 총 자산
        observation_start: startDate,
        observation_end: endDate,
        frequency: 'm', // 월별
        sort_order: 'asc'
      }
    })
    
    return response.data.observations.map(obs => ({
      date: obs.date,
      value: parseFloat(obs.value) || 0
    }))
  } catch (error) {
    console.error('연준 대차대조표 데이터 가져오기 실패:', error)
    return []
  }
}

// M2 통화량 데이터 가져오기
export const getM2MoneySupply = async (startDate, endDate) => {
  try {
    const response = await fredApi.get('/series/observations', {
      params: {
        series_id: 'M2SL', // M2 통화량
        observation_start: startDate,
        observation_end: endDate,
        frequency: 'm', // 월별
        sort_order: 'asc'
      }
    })
    
    return response.data.observations.map(obs => ({
      date: obs.date,
      value: parseFloat(obs.value) || 0
    }))
  } catch (error) {
    console.error('M2 통화량 데이터 가져오기 실패:', error)
    return []
  }
}

// 달러 인덱스 데이터 가져오기 (주요 통화 대비 달러 강도 계산)
export const getDollarIndex = async () => {
  try {
    // 주요 통화들에 대한 USD 환율 가져오기
    const currencies = ['EUR', 'JPY', 'GBP', 'CAD', 'AUD', 'CHF']
    const exchangeRates = {}
    
    // 각 통화에 대한 환율 데이터 수집
    for (const currency of currencies) {
      try {
        const response = await alphaVantageApi.get('', {
          params: {
            function: 'FX_DAILY',
            from_symbol: 'USD',
            to_symbol: currency,
            apikey: ALPHA_VANTAGE_API_KEY
          }
        })
        
        if (response.data['Time Series (FX)']) {
          exchangeRates[currency] = response.data['Time Series (FX)']
        }
      } catch (error) {
        console.warn(`${currency} 환율 데이터 가져오기 실패:`, error)
      }
    }
    
    // 달러 인덱스 계산 (간단한 가중평균)
    const dollarIndexData = []
    const dates = new Set()
    
    // 모든 통화의 날짜 수집
    Object.values(exchangeRates).forEach(rates => {
      Object.keys(rates).forEach(date => dates.add(date))
    })
    
    // 각 날짜별로 달러 인덱스 계산
    Array.from(dates).sort().slice(-90).forEach(date => { // 최근 90일
      let totalRate = 0
      let validCurrencies = 0
      
      currencies.forEach(currency => {
        if (exchangeRates[currency] && exchangeRates[currency][date]) {
          const rate = parseFloat(exchangeRates[currency][date]['4. close'])
          if (currency === 'JPY') {
            // JPY는 역환율로 계산
            totalRate += 1 / rate
          } else {
            totalRate += rate
          }
          validCurrencies++
        }
      })
      
      if (validCurrencies > 0) {
        const dollarIndex = (totalRate / validCurrencies) * 100 // 기준점 100으로 정규화
        dollarIndexData.push({
          date,
          value: dollarIndex
        })
      }
    })
    
    return dollarIndexData.slice(-30) // 최근 30일
  } catch (error) {
    console.error('달러 인덱스 데이터 가져오기 실패:', error)
    return []
  }
}

// 대체 데이터 소스: 무료 API들
export const getAlternativeData = async () => {
  try {
    // 무료 경제 데이터 API 사용
    const response = await axios.get('https://api.exchangerate-api.com/v4/latest/USD')
    
    // 간단한 달러 강도 계산 (주요 통화 대비)
    const rates = response.data.rates
    const majorCurrencies = ['EUR', 'JPY', 'GBP', 'CAD', 'AUD', 'CHF']
    const dollarIndex = majorCurrencies.reduce((sum, currency) => {
      return sum + (1 / rates[currency])
    }, 0) / majorCurrencies.length * 100
    
    return {
      dollarIndex: dollarIndex,
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    console.error('대체 데이터 가져오기 실패:', error)
    return null
  }
}

// 통합 데이터 가져오기 함수
export const getAllEconomicData = async (months = 24) => {
  const endDate = new Date()
  const startDate = new Date()
  startDate.setMonth(startDate.getMonth() - months)
  
  const startDateStr = startDate.toISOString().split('T')[0]
  const endDateStr = endDate.toISOString().split('T')[0]
  
  try {
    // 병렬로 데이터 가져오기
    const [balanceSheetData, m2Data, dollarIndexData] = await Promise.allSettled([
      getFederalReserveBalanceSheet(startDateStr, endDateStr),
      getM2MoneySupply(startDateStr, endDateStr),
      getDollarIndex()
    ])
    
    // 데이터 통합
    const combinedData = []
    const maxLength = Math.max(
      balanceSheetData.status === 'fulfilled' ? balanceSheetData.value.length : 0,
      m2Data.status === 'fulfilled' ? m2Data.value.length : 0,
      dollarIndexData.status === 'fulfilled' ? dollarIndexData.value.length : 0
    )
    
    for (let i = 0; i < maxLength; i++) {
      const dataPoint = {
        date: '',
        balanceSheet: 0,
        m2MoneySupply: 0,
        dollarIndex: 0
      }
      
      if (balanceSheetData.status === 'fulfilled' && balanceSheetData.value[i]) {
        dataPoint.date = balanceSheetData.value[i].date
        dataPoint.balanceSheet = balanceSheetData.value[i].value
      }
      
      if (m2Data.status === 'fulfilled' && m2Data.value[i]) {
        if (!dataPoint.date) dataPoint.date = m2Data.value[i].date
        dataPoint.m2MoneySupply = m2Data.value[i].value
      }
      
      if (dollarIndexData.status === 'fulfilled' && dollarIndexData.value[i]) {
        if (!dataPoint.date) dataPoint.date = dollarIndexData.value[i].date
        dataPoint.dollarIndex = dollarIndexData.value[i].value
      }
      
      if (dataPoint.date) {
        combinedData.push(dataPoint)
      }
    }
    
    return combinedData
  } catch (error) {
    console.error('경제 데이터 통합 실패:', error)
    return []
  }
}
