import React, { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { format, subMonths } from 'date-fns'
import { ko } from 'date-fns/locale'
import { getAllEconomicData } from './services/api'
import './App.css'

// 샘플 데이터 (API 키가 없을 때 사용)
const generateSampleData = () => {
  const data = []
  const startDate = subMonths(new Date(), 24)
  
  for (let i = 0; i < 24; i++) {
    const date = new Date(startDate)
    date.setMonth(date.getMonth() + i)
    
    data.push({
      date: format(date, 'yyyy-MM'),
      balanceSheet: 8500000 + Math.random() * 500000 - 250000, // 연준 대차대조표 (백만 달러)
      dollarIndex: 100 + Math.random() * 20 - 10, // 달러 인덱스
      m2MoneySupply: 21000000 + Math.random() * 1000000 - 500000, // M2 통화량 (백만 달러)
    })
  }
  
  return data
}

const App = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState('24')

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        // 실제 API 데이터 가져오기 시도
        const apiData = await getAllEconomicData(parseInt(selectedPeriod))
        
        if (apiData && apiData.length > 0) {
          setData(apiData)
        } else {
          // API 데이터가 없으면 샘플 데이터 사용
          console.log('API 데이터를 가져올 수 없어 샘플 데이터를 사용합니다.')
          setData(generateSampleData())
        }
      } catch (error) {
        console.error('데이터 가져오기 실패:', error)
        // 에러 발생 시 샘플 데이터 사용
        setData(generateSampleData())
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [selectedPeriod])

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const formatNumber = (value) => {
    return new Intl.NumberFormat('ko-KR').format(value)
  }

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>데이터를 불러오는 중...</p>
      </div>
    )
  }

  return (
    <div className="app">
      <header className="header">
        <h1>경제 지표 대시보드</h1>
        <p>중앙은행 대차대조표, 달러인덱스, M2 통화량을 한눈에 확인하세요</p>
      </header>

      <div className="controls">
        <div className="period-selector">
          <label>기간 선택:</label>
          <select 
            value={selectedPeriod} 
            onChange={(e) => setSelectedPeriod(e.target.value)}
          >
            <option value="6">최근 6개월</option>
            <option value="12">최근 1년</option>
            <option value="24">최근 2년</option>
          </select>
        </div>
      </div>

      <div className="dashboard">
        <div className="chart-container">
          <div className="chart-card">
            <h2>연준 대차대조표</h2>
            <p className="chart-description">미국 연방준비제도의 총 자산 규모</p>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => format(new Date(value + '-01'), 'MM/yy', { locale: ko })}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `${(value / 1000000).toFixed(0)}T`}
                />
                <Tooltip 
                  formatter={(value) => [formatCurrency(value), '대차대조표']}
                  labelFormatter={(value) => format(new Date(value + '-01'), 'yyyy년 MM월', { locale: ko })}
                />
                <Area 
                  type="monotone" 
                  dataKey="balanceSheet" 
                  stroke="#8884d8" 
                  fill="#8884d8" 
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card">
            <h2>달러 인덱스 (DXY)</h2>
            <p className="chart-description">주요 통화 대비 미국 달러의 가치</p>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => format(new Date(value + '-01'), 'MM/yy', { locale: ko })}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  domain={['dataMin - 5', 'dataMax + 5']}
                />
                <Tooltip 
                  formatter={(value) => [value.toFixed(2), '달러 인덱스']}
                  labelFormatter={(value) => format(new Date(value + '-01'), 'yyyy년 MM월', { locale: ko })}
                />
                <Line 
                  type="monotone" 
                  dataKey="dollarIndex" 
                  stroke="#82ca9d" 
                  strokeWidth={2}
                  dot={{ fill: '#82ca9d', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card">
            <h2>M2 통화량</h2>
            <p className="chart-description">시중에 유통되는 통화의 총량</p>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => format(new Date(value + '-01'), 'MM/yy', { locale: ko })}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `${(value / 1000000).toFixed(0)}T`}
                />
                <Tooltip 
                  formatter={(value) => [formatCurrency(value), 'M2 통화량']}
                  labelFormatter={(value) => format(new Date(value + '-01'), 'yyyy년 MM월', { locale: ko })}
                />
                <Area 
                  type="monotone" 
                  dataKey="m2MoneySupply" 
                  stroke="#ffc658" 
                  fill="#ffc658" 
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="summary-cards">
          <div className="summary-card">
            <h3>최신 대차대조표</h3>
            <div className="value">
              {formatCurrency(data[data.length - 1]?.balanceSheet || 0)}
            </div>
            <div className="change">
              {data.length > 1 && (
                <span className={data[data.length - 1].balanceSheet > data[data.length - 2].balanceSheet ? 'positive' : 'negative'}>
                  {data[data.length - 1].balanceSheet > data[data.length - 2].balanceSheet ? '↗' : '↘'} 
                  {Math.abs(((data[data.length - 1].balanceSheet - data[data.length - 2].balanceSheet) / data[data.length - 2].balanceSheet * 100)).toFixed(2)}%
                </span>
              )}
            </div>
          </div>

          <div className="summary-card">
            <h3>현재 달러 인덱스</h3>
            <div className="value">
              {(data[data.length - 1]?.dollarIndex || 0).toFixed(2)}
            </div>
            <div className="change">
              {data.length > 1 && (
                <span className={data[data.length - 1].dollarIndex > data[data.length - 2].dollarIndex ? 'positive' : 'negative'}>
                  {data[data.length - 1].dollarIndex > data[data.length - 2].dollarIndex ? '↗' : '↘'} 
                  {Math.abs(data[data.length - 1].dollarIndex - data[data.length - 2].dollarIndex).toFixed(2)}
                </span>
              )}
            </div>
          </div>

          <div className="summary-card">
            <h3>최신 M2 통화량</h3>
            <div className="value">
              {formatCurrency(data[data.length - 1]?.m2MoneySupply || 0)}
            </div>
            <div className="change">
              {data.length > 1 && (
                <span className={data[data.length - 1].m2MoneySupply > data[data.length - 2].m2MoneySupply ? 'positive' : 'negative'}>
                  {data[data.length - 1].m2MoneySupply > data[data.length - 2].m2MoneySupply ? '↗' : '↘'} 
                  {Math.abs(((data[data.length - 1].m2MoneySupply - data[data.length - 2].m2MoneySupply) / data[data.length - 2].m2MoneySupply * 100)).toFixed(2)}%
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <footer className="footer">
        <p>데이터 출처: 연방준비제도(FRED), 금융 데이터 제공업체</p>
        <p>업데이트: {format(new Date(), 'yyyy년 MM월 dd일 HH:mm', { locale: ko })}</p>
      </footer>
    </div>
  )
}

export default App
