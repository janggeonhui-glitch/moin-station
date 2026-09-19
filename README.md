# centro 🚉

> 친구들이 각자 출발역만 넣으면 **모두에게 공평한 중간역**, **취향에 맞는 동네**, **요즘 핫플·팝업 성지**를 추천해 주는 약속 장소 웹앱

약속 장소를 정할 때마다 "너무 멀다", "거긴 할 게 없다"로 대화가 길어지는 문제에서 출발했습니다.
지리적 중간점이 아니라 **실제로 모두가 비슷하게 걸리는 역**을 찾고, 그 동네에서 무엇을 할 수 있는지까지 한 화면에서 보여줍니다.

**🔗 데모: https://janggeonhui-glitch.github.io/moin-station/**

<!-- 스크린샷을 docs/screenshot.png로 추가하세요 -->

## 주요 기능

| 기능 | 설명 |
| --- | --- |
| 출발역 검색 | 수도권 약 180개 역 자동완성 + **한글 초성 검색**(`ㅍㄱ` → 판교) |
| 멤버별 취향 | 맛집·카페·술집·방탈출·전시·팝업 등 13가지 중 다중 선택 |
| 3가지 추천 모드 | **거리 중간** / **취향 저격** / **핫플·팝업** 탭 전환 |
| 지도 | Leaflet 지도에 출발지 → 추천역 경로와 예상 소요 시간 표시 |
| 공평도 | 멤버별 소요 시간 막대, 편차, 환승 여부 |
| 동네 정보 | 대표 놀거리 + 네이버지도·카카오맵·팝업 검색 바로가기 |
| 링크 공유 | 모임 전체를 URL에 담아 **서버 없이** 링크 하나로 공유 |
| 테마 | 시스템 / 라이트 / 다크 3단계 |

## 기술 스택

- **React 19 + TypeScript (strict)** — 컴포넌트/훅/순수 로직 분리
- **Vite 6** — 개발 서버, 번들링, 코드 스플리팅
- **Leaflet + react-leaflet** — 지도 (OpenStreetMap 타일, API 키 불필요 · 테마별 CSS 필터)
- **CSS Modules + 디자인 토큰(CSS 변수)** — 런타임 비용 없는 스타일링, 테마 전환
- **Vitest + Testing Library** — 로직 단위 테스트, 접근성 컴포넌트 상호작용 테스트
- **ESLint (typescript-eslint, jsx-a11y, react-hooks)**
- **GitHub Actions** — lint → test → build → GitHub Pages 배포

## 폴더 구조

```
src/
├─ App.tsx                 # 화면 조립, 레이아웃
├─ types.ts                # 도메인 타입 (Station, Area, Member, Candidate …)
├─ data/                   # 정적 데이터: 역 좌표, 후보 동네, 노선색, 취향
├─ lib/                    # UI와 무관한 순수 함수 (전부 단위 테스트)
│  ├─ geo.ts               #   거리·소요 시간 추정 모델
│  ├─ scoring.ts           #   모드별 추천 점수, 공평도
│  ├─ hangul.ts            #   초성 변환 + 역 검색
│  ├─ share.ts             #   URL ↔ 상태 직렬화 (검증 포함)
│  └─ color.ts             #   WCAG 대비 계산, 역명판 배경 보정
├─ hooks/
│  ├─ useMeetup.ts         #   useReducer 상태 + URL/localStorage 동기화
│  └─ useTheme.ts          #   3단계 테마
└─ components/
   ├─ MemberPanel/         #   멤버 목록, 추가 폼, 역 검색 콤보박스
   ├─ ModeTabs/            #   추천 모드 탭
   ├─ MeetMap/             #   Leaflet 지도 (lazy chunk)
   ├─ CandidateList/       #   후보 순위
   ├─ AreaDetail/          #   역명판, 소요 시간 막대, 놀거리, 외부 링크
   └─ ui/                  #   LineBadge, Tag, Toast, Icons
```

## 구현 포인트

### 1. "공평한" 중간역 추천 알고리즘 — [`lib/scoring.ts`](src/lib/scoring.ts)

좌표 평균(무게중심)은 한강이나 산 한가운데가 나오기도 하고, 노선 구조를 반영하지 못합니다.
그래서 **후보 역 44곳 각각에 대해 멤버별 소요 시간을 추정**하고, 모드별 비용 함수로 순위를 매깁니다.

- 소요 시간 추정 ([`lib/geo.ts`](src/lib/geo.ts)): `대기 7분 + 직선거리 × 우회계수 1.3 ÷ 평균속도 33km/h (+ 공유 노선이 없으면 환승 5분)`, 0.7km 미만이면 도보
- **거리 중간** = `0.45·평균 + 0.4·최대 + 0.15·편차` — 최대 시간 비중을 높여 "한 명만 유독 먼" 장소를 뒤로 보냅니다
- **취향 저격** = 이동 시간 비중을 낮추고, 멤버들이 고른 취향과의 일치율 가중치를 크게
- **핫플·팝업** = 인기도·팝업 빈도 중심, 이동 시간은 가벼운 페널티

모든 파라미터는 상수로 분리해 두어 조정이 쉽고, 추천 결과의 성질(예: "모두 강남 출발이면 1위는 강남")을 테스트로 고정했습니다.

### 2. 서버 없는 상태 공유 — [`lib/share.ts`](src/lib/share.ts), [`hooks/useMeetup.ts`](src/hooks/useMeetup.ts)

```
?m=지우~노원~bar.cheap~0|태현~신도림~food~1&mode=taste&a=seongsu
```

- 상태는 `useReducer` 하나로 관리하고, 변경될 때마다 `history.replaceState`로 URL에 반영
- 링크를 받은 친구는 같은 멤버·모드·선택 동네를 그대로 보게 됩니다
- 디코딩 시 **없는 역·취향·모드는 조용히 버려** 오래되거나 조작된 링크에도 앱이 깨지지 않습니다
- 우선순위: 공유 링크 → 이 기기에 저장된 모임(localStorage) → 예시 데이터

### 3. 접근성

- **역 검색**: WAI-ARIA 1.2 Combobox 패턴 — 포커스는 input에 두고 `aria-activedescendant`로 옵션 탐색, ↑↓ / Enter / Esc 지원
- **추천 모드**: WAI-ARIA Tabs 패턴 — roving tabindex, ←→ / Home / End
- 노선 배지는 시각적으로 `2`, 스크린리더에는 "2호선"으로 읽히도록 분리
- **색 대비 자동 보정**: 역명판 배경은 노선색을 흰 글자 대비 4.5:1(WCAG AA)을 넘을 때까지 어둡게 조정 — 20개 노선 전부 테스트로 검증
- 스킵 링크, 폼 에러의 `role="alert"` + `aria-describedby`, 토스트 live region, `prefers-reduced-motion` 대응

### 4. 성능

- 지도(Leaflet)는 `React.lazy`로 **별도 chunk**로 분리해 첫 화면 로딩에서 제외
- 점수 계산은 `useMemo`로 멤버가 바뀔 때만 수행, 지도는 좌표 시그니처가 바뀔 때만 범위를 다시 맞춤

### 5. 디자인

- 모티프: **서울 지하철 사인 시스템** — 멤버 아바타는 노선색, 후보 역은 환승역 기호(흰 원 + 굵은 테두리), 선택된 동네는 역명판으로 표현
- 타이포: Do Hyeon(제목) · IBM Plex Sans KR(본문) · IBM Plex Mono(분·km 숫자, tabular-nums)
- 토큰 기반 라이트/다크 테마, 모바일 1열 레이아웃

## 실행

Node.js 20 이상이 필요합니다.

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # 단위·컴포넌트 테스트
npm run lint
npm run build      # 타입 체크 + 프로덕션 빌드
```

## 배포

`main` 브랜치에 push하면 GitHub Actions가 lint → test → build 후 GitHub Pages에 배포합니다.
저장소 **Settings → Pages → Source**를 `GitHub Actions`로 설정해 주세요.

## 한계와 다음 단계

- 소요 시간은 직선거리 기반 **추정치**입니다 → ODsay 등 대중교통 경로 API로 실제 경로·막차 반영
- 맛집·팝업은 자주 바뀌어서 저장하지 않고 검색 링크로 연결합니다 → 카카오 로컬 API로 앱 안에서 바로 보여주기
- 후보 동네 44곳은 수동으로 정리한 데이터입니다 → 데이터 소스 자동화, 지방 광역시 확장
- 친구들이 각자 기기에서 동시에 입력하는 실시간 모임방 (현재는 링크 공유 방식)
