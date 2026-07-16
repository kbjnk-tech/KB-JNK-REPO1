# Technical Requirement Document (TRD)

> 관련 문서: `docs/ARCHITECTURE.md`, `docs/WORKFLOW.md`  
> 제품 요구: `prd.md` / `docs/PRD.md`  
> 아키텍처: **FSD (Feature-Sliced Design)** 채택 — 가산 기능(송금·API·CSV·UI 확장·Supabase 등)까지 동일 레이어 규칙으로 확장

---

## 1. 기술 스택 및 개발 환경

### 1.1 필수 스택


| 구분                   | 기술                                             |
| -------------------- | ---------------------------------------------- |
| Runtime              | Node.js **20+** / npm                          |
| Language & Framework | **React 19**, TypeScript, Vite                 |
| Styling              | TailwindCSS                                    |
| State                | React `useState` / `useReducer` (필요 시 Context) |
| Persistence (기본)     | Browser `localStorage`                         |
| AI IDE               | Cursor Pro (권장: Claude Sonnet 4.6)             |


### 1.2 가산 스택 (구현 포함)


| 구분          | 기술                                              | 용도               |
| ----------- | ----------------------------------------------- | ---------------- |
| Test        | **Vitest**                                      | 도메인 순수 함수 TDD·회귀 |
| Code Review | **CodeRabbit** + `.coderabbit.yaml`             | PR 자동 리뷰         |
| MCP         | `.cursor/mcp.json` (filesystem, **context7** 등) | 팀 공용 MCP·최신 문서   |
| Custom Mode | Plan / Implement / Review                       | 상황별 모델·규칙        |
| FX API      | 공개 환율 API (예: 한국수출입은행)                          | 매매기준율 자동 채움      |
| CSV         | 클라이언트 파일 생성                                     | 거래 기록 내보내기       |
| UI UX       | Tailwind 반응형 · `dark` 클래스 · `@media print`      | 반응형·다크모드·인쇄     |
| Cloud DB    | **Supabase**                                    | 거래 기록 클라우드       |
| Deploy      | **Vercel**                                      | 공개 URL           |


### 1.3 개발 운영 규칙

- 라이브러리 문법은 **context7 MCP**로 최신 문서 확인
- 큰 다파일 작업은 Agent 모드 위임
- `npm install` 등 터미널 명령은 개발자가 직접 실행·확인
- API·Supabase 키는 `.env` / Vercel env만 사용, **git 커밋 금지**

---

## 2. 시스템 아키텍처 (FSD)

### 2.1 선택 이유

1. 화면·기능 단위로 Context를 좁혀 AI·팀 Rules 강제에 유리
2. 환율·송금 계산을 `entities` / `shared` 순수 함수로 분리 → Vitest·CodeRabbit 용이
3. 과제 권장 구조와 일치하며, 가산 슬라이스(송금·CSV·API·UI 확장)를 같은 규칙으로 추가 가능

### 2.2 폴더 구조 (필수 + 가산)

```text
KB_전나경_외환도우미/
├── README.md
├── .env.example                 # 키 이름만 (실키 없음)
├── .cursor/
│   ├── mcp.json                 # 팀 공용 MCP (가산)
│   └── rules/
│       ├── 00-architecture.mdc  # alwaysApply — FSD
│       ├── 01-collaboration.mdc # alwaysApply — Plan/Implement/Review·시크릿
│       ├── 10-domain-fx.mdc     # entities, shared/lib·config
│       ├── 20-ui.mdc            # pages, widgets, shared/ui (features 제외)
│       ├── 25-client-infra.mdc  # shared/api·supabase, sync-supabase
│       ├── 30-testing.mdc       # *.test.ts(x)
│       ├── 40-feature-exchange.mdc
│       ├── 41-feature-remittance.mdc
│       ├── 42-feature-transactions.mdc
│       └── 43-feature-export-csv.mdc
├── docs/
│   ├── PRD.md
│   ├── ARCHITECTURE.md
│   ├── WORKFLOW.md
│   └── prompts.md
├── .coderabbit.yaml             # 가산
├── package.json
├── vite.config.ts
├── tailwind.config.js (또는 CSS 기반 Tailwind v4 설정)
└── src/
    ├── app/
    │   └── App.tsx
    ├── pages/
    │   └── dashboard/
    ├── widgets/
    │   ├── exchange-panel/
    │   ├── remittance-panel/            # 가산: 해외송금
    │   └── transaction-history-panel/
    ├── features/
    │   ├── calculate-exchange/
    │   ├── calculate-remittance/        # 가산
    │   ├── add-transaction/
    │   ├── search-transaction/
    │   ├── export-csv/                  # 가산
    │   └── sync-supabase/               # 가산 (선택 슬라이스명)
    ├── entities/
    │   ├── currency/
    │   ├── rate/
    │   └── transaction/
    └── shared/
        ├── lib/          # format, round
        ├── ui/           # Button, Input, Tabs 등
        ├── config/       # 스프레드·수수료·전신료
        ├── api/          # 가산: 환율 API 클라이언트
        └── supabase/     # 가산: 클라이언트 초기화 (또는 infrastructure 성격의 shared)
```

### 2.3 아키텍처 규칙

1. **의존 방향 (상위 → 하위만)**
  `app → pages → widgets → features → entities → shared`  
  - 역방향 import 금지  
  - **동일 레이어 슬라이스 간 import 금지**
2. **Public API**
  각 슬라이스는 `index.ts`로만 외부 노출. Deep import 금지.
3. **도메인 순수성**
  환율·송금·수수료 계산은 UI·localStorage·Supabase·API와 분리된 **순수 함수**.
4. **저장소 추상**
  localStorage / Supabase 접근은 features 또는 shared 인프라 쪽에 두고, entities 계산식과 섞지 않는다.

---

## 3. 핵심 비즈니스 로직

### 3.1 용어


| 기호   | 의미        | 예시                     |
| ---- | --------- | ---------------------- |
| B    | 매매기준율     | 1,540.00               |
| S    | 스프레드율 (%) | 현찰 1.75, 전신환 1.0       |
| P    | 우대율 (%)   | 0 ~ 100                |
| unit | 통화 단위     | USD/EUR/CNY=1, JPY=100 |


우대율 = 스프레드를 깎는 비율. 우대 70% → 스프레드의 30%만 적용.

### 3.2 적용환율

```text
현찰 살 때:  B × (1 + (S/100) × (1 − P/100))
현찰 팔 때:  B × (1 − (S/100) × (1 − P/100))
전신환(송금): 동일 식 + 전신환 스프레드율 S
```

### 3.3 수치 정밀도 (필수 순서)

1. 적용환율을 **소수점 2자리**로 반올림해 고정
2. `원화 = round(외화금액 ÷ unit × 적용환율)` → **정수(원)**
3. 표시: 천 단위 콤마 + `원`

### 3.4 송금 총 출금액

```text
총 출금액 = 원화환산 송금원금 + getRemittanceFee(USD금액) + TELEGRAPHIC_FEE
```

### 3.5 config 예시 (`shared/config`)

```ts
export const DEFAULT_CASH_SPREAD = 1.75;   // %
export const DEFAULT_REMIT_SPREAD = 1.0;   // %
export const TELEGRAPHIC_FEE = 8_000;      // 원/건

export function getRemittanceFee(usdAmount: number): number {
  if (usdAmount <= 500) return 5_000;
  if (usdAmount <= 2_000) return 10_000;
  if (usdAmount <= 5_000) return 15_000;
  if (usdAmount <= 20_000) return 20_000;
  return 25_000;
}
```

### 3.6 데이터 스키마

```ts
export type CurrencyCode = 'USD' | 'JPY' | 'EUR' | 'CNY';

export interface CurrencyConfig {
  code: CurrencyCode;
  unit: number;
  label: string;
}

export interface Transaction {
  id: string;
  customerName: string;
  type: 'buy' | 'sell' | 'remit';
  currency: CurrencyCode;
  baseRate: number;
  spreadRate: number;
  preferentialRate: number;
  appliedRate: number;
  foreignAmount: number;
  krwAmount: number;
  /** 송금 시: 수수료+전신료 포함 총액 등 확장 필드 가능 */
  feeTotal?: number;
  memo?: string;
  createdAt: string; // ISO
}
```

---

## 4. Cursor Rules (`.cursor/rules/`)

> **원칙:** Always Apply = 협업·FSD 공통 가드레일.  
> File-specific = 해당 디렉터리/슬라이스 작업 시에만 중첩 연결.  
> features UI·로직은 TRD 초안의 `20-ui` 일괄 glob 대신 **`40`~`43` feature 룰**로 범위를 제한한다.

### 4.1 `00-architecture.mdc` — alwaysApply

- FSD(`app/pages/widgets/features/entities/shared`) 준수
- 상위 → 하위만 import, 동일 레이어 슬라이스 간 import 금지
- Public API(`index.ts`)만 외부 노출
- 역할에 맞는 레이어에 배치, 위반 시 생성 중단·구조 수정 제안
- 요청 Task/슬라이스 밖 수정 금지; `shared/api`·`supabase`는 인프라(통신)

### 4.2 `01-collaboration.mdc` — alwaysApply

- Plan → Implement → Review (`docs/WORKFLOW.md`, `docs/prompts.md`)
- context7로 최신 문서 확인, 실키 커밋·출력 금지
- 기능 단위 PR, file-specific 허용 경로 준수
- `npm install` 등 패키지 설치는 개발자 확인, 큰 다파일은 Agent 위임 가능

### 4.3 `10-domain-fx.mdc` — globs: `src/entities/**`, `src/shared/lib/**`, `src/shared/config/**`

- 환율·송금 계산은 순수 함수, UI/저장소와 분리
- 적용환율·원화 반올림 규칙 준수
- JPY 등 100단위 통화 처리
- Vitest로 채점·송금 시나리오 회귀 유지

### 4.4 `20-ui.mdc` — globs: `src/pages/**`, `src/widgets/**`, `src/shared/ui/**`

- 함수형 컴포넌트 + useState/useReducer
- UI 텍스트 한국어
- 금액·환율 표시는 `shared/lib` 포맷만 사용
- 계산식을 JSX에 인라인 금지 → entities/features 호출
- 반응형·다크모드·인쇄는 pages/widgets/`shared/ui`(+ 테마는 `shared/lib`)에서 처리 (PRD F-9)
- **`features/**` 는 이 룰에서 제외** → feature별 `40`~`43` 적용

### 4.5 `25-client-infra.mdc` — globs: `shared/api`, `shared/supabase`, `features/sync-supabase`

- FE↔환율 API·Supabase 통신 경계
- entities에 API/DB 호출 금지, 실패 시 fallback (수동 입력 / localStorage)

### 4.6 `30-testing.mdc` — globs: `**/*.test.ts(x)`

- 순수 함수는 테스트 먼저 (TDD)
- PRD 인수 시나리오를 회귀 테스트로 유지
- UI/저장소 테스트보다 도메인 단위 테스트 우선

### 4.7 Feature 룰 (`40`~`43`) — 슬라이스별 globs

| 파일 | 범위 |
|------|------|
| `40-feature-exchange` | calculate-exchange + exchange-panel |
| `41-feature-remittance` | calculate-remittance + remittance-panel |
| `42-feature-transactions` | add/search-transaction + history-panel |
| `43-feature-export-csv` | export-csv (변환·BOM만, 계산 없음) |

각 룰에 **허용/금지 경로**를 두어 다른 feature·도메인 무단 수정을 막는다.

---

## 5. 가산 기능 기술 설계

### 5.1 환율 API (`shared/api`)

- Vite 환경변수: `VITE_EXCHANGE_API_KEY` 등 (`.env.example`에 키 이름만)
- `fetchBaseRate(currency): Promise<number>`
- 실패 시 throw → UI에서 수동 입력 fallback
- entities에 API 호출을 넣지 않음

### 5.2 CSV (`features/export-csv`)

- Transaction[] → CSV 문자열 → Blob 다운로드
- UTF-8 BOM 권장
- 도메인 계산 없음 (변환·다운로드만)

### 5.3 UI 확장 — 반응형 · 다크모드 · 인쇄 (PRD F-9 / ADV-10~12)

| 항목 | 구현 위치 | 설계 |
|------|-----------|------|
| 반응형 | `pages`·`widgets`·`shared/ui` | Tailwind `sm:`/`lg:` 등 브레이크포인트, 좁은 폭에서 1열 스택 |
| 다크모드 | `shared/ui/ThemeToggle`, `shared/lib` 테마 저장 | `html.dark` 클래스 + Tailwind `@custom-variant dark`, `localStorage` 유지 (미선택 시 `prefers-color-scheme`) |
| 인쇄 | `transaction-history-panel` + `index.css` | `window.print()`, `.no-print`로 계산·동기화·검색/삭제 숨김, `.print-area`에 거래 목록만 출력 |

- 도메인 계산·CSV 직렬화와 분리된 **표시/테마/인쇄** 관심사
- 테마 키 예: `fx-teller-theme` (`light` \| `dark`)

### 5.4 Supabase

- `shared/supabase`에서 클라이언트 생성
- 테이블 예: `transactions` (Transaction 스키마 대응)
- 전략(README 명시):  
  - A) Supabase를 주 저장소, localStorage는 캐시/오프라인  
  - B) localStorage 주 + 수동/자동 동기화
- 권장: 오프라인에서도 계산·기록이 되게 **localStorage 유지 + 가능 시 sync**

### 5.5 CodeRabbit / MCP / Custom Mode / Vercel


| 항목          | 산출물                                                             |
| ----------- | --------------------------------------------------------------- |
| CodeRabbit  | `.coderabbit.yaml`, GitHub PR 리뷰                                |
| MCP         | `.cursor/mcp.json` (context7 등, **시크릿은 커밋하지 않거나 팀 안내에 env 사용**) |
| Custom Mode | WORKFLOW.md에 Plan→Implement→Review 절차                           |
| Vercel      | Git 연동 배포, env에 API/Supabase 키                                  |


---

## 6. 구현 Phase (필수 + 가산 통합)


| Phase | 내용                                                                   | 검증                       |
| ----- | -------------------------------------------------------------------- | ------------------------ |
| **0** | Node/Cursor/GitHub/API·Supabase·Vercel 계정·키 준비                       | 계정 준비 완료                 |
| **1** | Vite+React-TS+Tailwind+Vitest, FSD 템플릿, docs, Rules, mcp.json 초안     | `npm run dev`            |
| **2** | entities/rate·currency·transaction, shared/lib·config, **환전+송금 TDD** | `npx vitest` 전 시나리오 PASS |
| **3** | features→widgets→dashboard: 환전·**송금·기록·CSV**                         | 수동 인수 시나리오               |
| **3C** | UI 확장: **반응형·다크모드·인쇄** (PRD F-9)                                      | 모바일·테마·인쇄 미리보기           |
| **4** | 환율 API + fallback                                                    | 자동 채움 / 실패 안내            |
| **5** | GitHub push, `.coderabbit.yaml`, 기능 PR + CodeRabbit                  | 리뷰 수신                    |
| **6** | MCP 최종, Custom Mode, WORKFLOW·prompts 정리                             | 문서·설정 존재                 |
| **7** | Supabase 연동 + Vercel 배포                                              | 클라우드 저장 + 배포 URL         |
| **8** | 전체 체크리스트·README 보완                                                   | 제출 가능                    |


---

## 7. 검증 및 테스트

### 7.1 공통 데이터셋 (현찰 1.75% / 전신환 1.0%)


| 통화  | 구분  | 기준율  | 우대   | 외화     | 적용환율    | 원화      |
| --- | --- | ---- | ---- | ------ | ------- | ------- |
| USD | 살 때 | 1540 | 0%   | 500    | 1566.95 | 783475  |
| USD | 살 때 | 1540 | 80%  | 500    | 1545.39 | 772695  |
| USD | 팔 때 | 1540 | 0%   | 500    | 1513.05 | 756525  |
| JPY | 살 때 | 980  | 0%   | 100000 | 997.15  | 997150  |
| USD | 전신환 | 1540 | 0%   | 1000   | 1555.40 | 1555400 |
| USD | 살 때 | 1540 | 100% | 500    | 1540.00 | 770000  |


송금 총액: $3000 / B=1320 / P=0% → **4,022,600원**

### 7.2 Vitest 핵심 케이스

```ts
// applyExchangeRate(B, S%, P%, 'buy'|'sell') → 적용환율(2자리)
// exchangeToKRW(amount, appliedRate, unit) → 원화(정수)
// calcRemittanceTotal(...) → 총 출금액
```

- PRD ①~⑤, 우대 100%, 송금 4,022,600원 시나리오를 `*.test.ts`로 유지

### 7.3 아키텍처·산출물 체크리스트

- [ ] FSD 레이어로 폴더 분리
- [ ] 의존 방향·Public API 준수
- [ ] 환율/송금 계산 = 순수 함수
- [ ] `.cursor/rules/` Always(00·01) + file-specific(10·20·25·30·40~43) — 역할별 2개 이상
- [ ] `docs/ARCHITECTURE.md`, `WORKFLOW.md`, `PRD.md`, `prompts.md`, `README.md`
- [ ] Vitest 통과
- [ ] 송금 탭·CSV·환율 API 동작
- [ ] 반응형·다크모드·인쇄 (F-9) 동작
- [ ] `.coderabbit.yaml`, `.cursor/mcp.json`
- [ ] Custom Mode / WORKFLOW 기록
- [ ] Supabase + Vercel URL

---

## 8. 필수·가산 산출물 요약


| 산출물                            | 구분    |
| ------------------------------ | ----- |
| 환전 계산기 + 거래 기록 + localStorage  | 필수    |
| FSD + Rules + docs + README    | 필수    |
| 해외송금 계산기                       | 가산·구현 |
| 환율 API / CSV                   | 가산·구현 |
| 반응형 · 다크모드 · 인쇄                | 가산·구현 |
| Vitest(TDD)                    | 가산·구현 |
| CodeRabbit / MCP / Custom Mode | 가산·구현 |
| Supabase / Vercel              | 가산·구현 |


