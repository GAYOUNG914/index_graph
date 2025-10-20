# 경제 지표 대시보드

중앙은행 대차대조표, 달러인덱스, M2 통화량을 한눈에 볼 수 있는 React 기반 웹 대시보드입니다.

## 주요 기능

- 📊 **연준 대차대조표**: 미국 연방준비제도의 총 자산 규모 추이
- 💱 **달러 인덱스 (DXY)**: 주요 통화 대비 미국 달러의 가치 변화
- 💰 **M2 통화량**: 시중에 유통되는 통화의 총량 변화
- 📈 **인터랙티브 차트**: Recharts를 사용한 반응형 차트
- 📱 **반응형 디자인**: 모바일과 데스크톱 모두 지원
- ⏰ **실시간 업데이트**: 최신 경제 지표 데이터 표시

## 기술 스택

- **Frontend**: React 18, Vite
- **차트**: Recharts
- **스타일링**: CSS3 (Grid, Flexbox)
- **데이터**: FRED API, Alpha Vantage API
- **날짜 처리**: date-fns

## 설치 및 실행

### 1. 의존성 설치

```bash
npm install
```

### 2. API 키 설정

실제 데이터를 사용하려면 다음 API 키를 발급받아 설정해야 합니다:

#### FRED API (무료)
1. [FRED API 키 발급](https://fred.stlouisfed.org/docs/api/api_key.html)에서 계정 생성
2. `src/services/api.js` 파일에서 `YOUR_FRED_API_KEY`를 실제 키로 교체

#### Alpha Vantage API (무료)
1. [Alpha Vantage API 키 발급](https://www.alphavantage.co/support/#api-key)에서 계정 생성
2. `src/services/api.js` 파일에서 `YOUR_ALPHA_VANTAGE_API_KEY`를 실제 키로 교체

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:3000`으로 접속하여 대시보드를 확인할 수 있습니다.

## 프로젝트 구조

```
src/
├── App.jsx          # 메인 애플리케이션 컴포넌트
├── App.css          # 스타일시트
├── main.jsx         # 애플리케이션 진입점
└── services/
    └── api.js       # API 연동 서비스
```

## 데이터 소스

### 연준 대차대조표
- **API**: FRED API
- **시리즈 ID**: WALCL (연준 총 자산)
- **업데이트**: 주간

### M2 통화량
- **API**: FRED API
- **시리즈 ID**: M2SL (M2 통화량)
- **업데이트**: 월간

### 달러 인덱스
- **API**: Alpha Vantage API
- **심볼**: USD/DXY
- **업데이트**: 일간

## 주요 컴포넌트

### App.jsx
- 메인 대시보드 컴포넌트
- 데이터 상태 관리
- 차트 렌더링
- 기간 선택 기능

### api.js
- FRED API 연동
- Alpha Vantage API 연동
- 데이터 통합 및 변환
- 에러 처리

## 스타일링

- **그라데이션 배경**: 보라색 계열 그라데이션
- **카드 디자인**: 둥근 모서리와 그림자 효과
- **반응형 그리드**: CSS Grid를 사용한 레이아웃
- **호버 효과**: 마우스 오버 시 카드 상승 효과

## 브라우저 지원

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 라이선스

MIT License

## 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 문의

프로젝트에 대한 문의사항이 있으시면 이슈를 생성해 주세요.
