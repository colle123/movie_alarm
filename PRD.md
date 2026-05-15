# 프로젝트: 영화 개봉 알람

## 목표
- 웹 브라우저에서 한국 영화 개봉 일정을 확인하고 알림을 받는 페이지 제작

## 구현 범위
- TMDB API에서 한국 영화 데이터를 조회해 월별 달력에 개봉일 기준으로 표시
- 날짜를 클릭하면 해당 날짜의 영화 목록을 팝업 형태로 표시
- 영화 목록에 포스터, 제목, 개봉일, 평점, 줄거리 표시
- 브라우저가 열려 있는 경우 개봉 당일 오전 10시에 알림 표시
- 알림 전송 여부는 `LocalStorage`에 저장

## 구현 기준
- `HTML`, `CSS`, `JavaScript`만 사용
- 파일은 역할별로 분리해서 관리
- 영화 데이터는 TMDB API를 사용
- 영화 대상은 한국 영화만 조회
- 팝업은 클릭한 날짜 셀 근처에 표시

## 폴더 구조
```text
movie_alarm/
├─ favicon.ico
├─ index.html
├─ css/
│  └─ styles.css
├─ js/
│  ├─ app.js        -- 앱 시작점
│  ├─ calendar.js   -- 달력 렌더링 및 날짜 선택 처리
│  ├─ movieapi.js   -- TMDB API 호출 및 데이터 가공
│  └─ utils.js      -- 공통 유틸리티 함수
├─ assets/
│  └─ images/
├─ PRD.md
└─ README.md
```
