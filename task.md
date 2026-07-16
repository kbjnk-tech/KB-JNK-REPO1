# Task Breakdown — 외환 창구 업무 도우미 (FX Teller Helper)

> 근거 문서: `prd.md` (기능·인수 기준) + `trd.md` (FSD·Phase·기술 설계)  
> 규칙: 난이도는 **10점 만점**. **실행 단위(리프 Task / Sub-task)는 모두 7점 이하**. 원래 8점 이상이었던 묶음은 Sub-task로 분리함.

---

## 난이도 산정 기준

| 점수 | 기준 |
|------|------|
| 1–2 | 설정·문서·단일 파일, 외부 의존 거의 없음 |
| 3–4 | 단일 슬라이스/UI 또는 단순 연동, 검증 범위가 좁음 |
| 5–6 | 여러 파일·레이어, 도메인 규칙/예외 처리 포함 |
| 7 | 핵심 도메인·복수 시나리오·아키텍처 제약 동시 적용 |
| 8–10 | (금지) 반드시 Sub-task로 분리 |

**표기:** `[난이도: N/10]` · PRD/TRD 참조 ID를 함께 적음 · `원 난이도`는 분리 전 참고용(실행 단위 아님)

---

## Phase 0 — 환경·계정 준비

| ID | Task | 난이도 | 근거 | 완료 기준 |
|----|------|--------|------|-----------|
| T-0.1 | Node.js 20+, GitHub, Cursor, (선택) 환율 API·Supabase·Vercel 계정/키 준비 | 2 | TRD Phase 0, PRD F-5/F-7 | 계정·키 확보, 실키는 `.env`만 사용 예정 |

### Phase 0 체크리스트

**필수**
- [x] Node.js 20+ / npm
- [x] Cursor 워크스페이스
- [x] `.gitignore`에 `.env` 반영
- [x] `git init` + `origin` → `https://github.com/kbjnk-tech/KB-JNK-REPO1.git`

**가산 (계정·키만 — 연동 코드는 Phase 4·7)**
- [x] 환율 API: 한국수출입은행 OpenAPI 인증키 → `.env`의 `VITE_EXCHANGE_API_KEY`
- [x] Supabase: 프로젝트 → `.env`의 `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (테이블은 Phase 7)
- [x] Vercel: 계정 준비 (배포는 Phase 7)
- [x] `.env.example` 키 이름만 준비 (실키 없음)
- [x] `.env`는 gitignore로 추적되지 않음

---

## Phase 1 — 프로젝트 골격 · FSD · Rules · Docs

> **원 난이도 9** (Vite 스캐폴드 + FSD + Rules + docs + MCP 일괄) → Sub-task 분리

### Phase 1 체크리스트

- [x] T-1.1 Tailwind + Vitest 설정, `npm test` / build
- [x] T-1.2 FSD 폴더·Public API 스텁 + 대시보드 셸
- [x] T-1.3 `docs/` PRD·ARCHITECTURE·WORKFLOW·prompts
- [x] T-1.4 `.cursor/rules/` Always(00·01) + file-specific(10·20·25·30·40~43)
- [x] T-1.5 `.cursor/mcp.json` + `.env.example`

### T-1 — 개발 기반 구축 (분리됨)

#### T-1.1 Vite + React 19 + TypeScript + Tailwind + Vitest 초기화 `[난이도: 4/10]`

- **근거:** PRD MVP-4, F-3.2 / TRD 1.1·1.2, Phase 1
- **작업:** 기존 Vite 앱에 Tailwind·Vitest 설정, `npm run dev` / `npx vitest` 경로 확인
- **완료:** 브라우저 기동, Vitest 스모크 통과

#### T-1.2 FSD 폴더·Public API(`index.ts`) 스텁 `[난이도: 5/10]`

- **근거:** PRD MVP-5 / TRD 2.2·2.3
- **작업:** `app` · `pages/dashboard` · `widgets/*` · `features/*` · `entities/*` · `shared/*` 생성, 레이어 규칙 주석/빈 export
- **완료:** TRD 트리와 대응, deep import 없이 `index.ts`만 노출 가능한 구조

#### T-1.3 `docs/` 필수 문서 초안 `[난이도: 4/10]`

- **근거:** PRD §7 / TRD Phase 1, §7.3
- **작업:** `docs/PRD.md`, `ARCHITECTURE.md`, `WORKFLOW.md`, `prompts.md` (루트 `prd.md`/`trd.md` 반영)
- **완료:** 4종 문서 존재, FSD·Phase·협업 흐름 기술

#### T-1.4 Cursor Rules 작성 `[난이도: 5/10]`

- **근거:** PRD MVP-5, F-8 / TRD §4 + 중첩·범위 제한 원칙
- **작업:** Always(`00`·`01`) + file-specific(`10`·`20`·`25`·`30`·`40`~`43`)
- **완료:** 협업 Always Apply, 폴더/feature glob으로 수정 범위 제한, FE↔인프라 통신 룰 포함
- **상태:** [x] 완료

#### T-1.5 `.cursor/mcp.json` 초안 + `.env.example` `[난이도: 2/10]`

- **근거:** PRD ADV-6, F-5.3, F-8.2 / TRD 5.1·5.4
- **작업:** filesystem·context7 등 등록, 환율/Supabase 키 **이름만** `.env.example`
- **완료:** mcp.json·env.example 커밋 가능 상태(실키 없음)

---

## Phase 2 — 도메인 엔티티 · 순수 함수 · TDD

> **원 난이도 9** (환전+송금+스키마+전 시나리오 테스트) → Sub-task 분리

### Phase 2 체크리스트

- [x] T-2.1~T-2.6 도메인 + Vitest 12케이스 PASS

### T-2 — 환율·송금 도메인 코어 (분리됨)

#### T-2.1 `entities/currency` — 통화·단위 정의 `[난이도: 3/10]`

- **근거:** PRD F-1.1, F-1.5 / TRD 3.1·3.6
- **작업:** `CurrencyCode`, `CurrencyConfig` (USD/EUR/CNY unit=1, JPY unit=100)
- **완료:** Public API export, 단위 상수 테스트 가능

#### T-2.2 `shared/config` — 스프레드·전신료·송금수수료 `[난이도: 3/10]`

- **근거:** PRD F-4, §6 / TRD 3.5
- **작업:** `DEFAULT_CASH_SPREAD=1.75`, `DEFAULT_REMIT_SPREAD=1.0`, `TELEGRAPHIC_FEE=8000`, `getRemittanceFee`
- **완료:** PRD 수수료 구간표와 일치하는 순수 함수

#### T-2.3 `shared/lib` — 반올림·원화/환율 포맷 `[난이도: 4/10]`

- **근거:** PRD F-1.6 / TRD 3.3
- **작업:** 적용환율 소수 2자리, 원화 정수, 천단위 콤마 + `원`
- **완료:** 포맷 유틸 단독 테스트 가능, UI에서 인라인 포맷 금지 준비

#### T-2.4 적용환율·원화 환산 순수 함수 (현찰 살/팔) `[난이도: 7/10]`

- **근거:** PRD F-1.2~F-1.6, E-1.x, §6.1 / TRD 3.2·3.3
- **작업:** `applyExchangeRate`, `exchangeToKRW` — 우대율·JPY unit·반올림 순서
- **완료:** PRD ①②③④·우대 100% 수치와 일치 (테스트는 T-2.6과 연계)

#### T-2.5 전신환·송금 총 출금액 순수 함수 `[난이도: 6/10]`

- **근거:** PRD F-4.1~F-4.2, §6.2 / TRD 3.2·3.4
- **작업:** 전신환 적용환율 + `getRemittanceFee` + 전신료 → `calcRemittanceTotal`
- **완료:** $3,000 / B=1320 / P=0% → **4,022,600원**

#### T-2.6 `entities/transaction` 스키마 + Vitest 회귀 스위트 `[난이도: 6/10]`

- **근거:** PRD F-2, ADV-4, F-8.4, §6 / TRD 3.6, §7.1·7.2, Phase 2
- **작업:** `Transaction` 타입, PRD ①~⑤·우대100%·송금 총액 케이스 `*.test.ts` (TDD)
- **완료:** `npx vitest` 전 시나리오 PASS

---

## Phase 3 — Features · Widgets · Dashboard UI

> **원 난이도 10** (환전·송금·기록·CSV·대시보드 일괄) → Sub-task 분리

### Phase 3 체크리스트

- [x] T-3A 환전·송금 UI
- [x] T-3B 기록·localStorage·CSV·대시보드 통합
- [x] T-3C 반응형·다크모드·인쇄

### T-3A — 환전·송금 UI (분리됨, 원 난이도 8)

#### T-3A.1 `features/calculate-exchange` `[난이도: 5/10]`

- **근거:** PRD F-1 / TRD 2.2 features
- **작업:** 입력 상태 → entities 호출, JSX에 계산식 인라인 금지
- **완료:** 매매기준율·스프레드·우대·금액 변경 시 적용환율·원화 갱신

#### T-3A.2 `widgets/exchange-panel` `[난이도: 5/10]`

- **근거:** PRD F-1, F-3.1, F-3.3 / TRD 20-ui
- **작업:** 통화·살때/팔때·입력 폼·결과 표시(한국어), 기본 스프레드 1.75%
- **완료:** E-1.1~E-1.5 안내 메시지 동작

#### T-3A.3 `features/calculate-remittance` `[난이도: 5/10]`

- **근거:** PRD ADV-1, F-4 / TRD Phase 3
- **작업:** 전신환 스프레드(기본 1.0%)·수수료·전신료 합산 연결
- **완료:** 총 출금액 표시, README에 넣을 수수료 기준과 동일 소스(`shared/config`)

#### T-3A.4 `widgets/remittance-panel` + 탭 전환 `[난이도: 5/10]`

- **근거:** PRD ADV-1, F-3 / TRD widgets
- **작업:** 환전/송금 탭 UI, shared/ui Tabs 등 재사용
- **완료:** 한 대시보드에서 환전·송금 전환 가능

### T-3B — 거래 기록 · 영속화 · CSV (분리됨, 원 난이도 9)

#### T-3B.1 `features/add-transaction` + 유효성 `[난이도: 4/10]`

- **근거:** PRD F-2.1, E-2.1 / TRD Phase 3
- **작업:** 고객명·통화·금액·메모·계산 결과 필드 저장, 빈 내용 거부
- **완료:** 목록 즉시 반영, 빈 입력 시 안내

#### T-3B.2 `features/search-transaction` `[난이도: 3/10]`

- **근거:** PRD F-2.3, §6.3
- **작업:** 고객명·통화·메모 키워드 필터
- **완료:** 검색 시 해당 기록만 표시

#### T-3B.3 localStorage 영속화 `[난이도: 4/10]`

- **근거:** PRD MVP-3, F-2.4, §6.3 / TRD 1.1, 2.3-4
- **작업:** 추가/삭제 후 저장, entities 계산과 분리된 저장 계층
- **완료:** 새로고침·재오픈 후 목록·삭제 상태 유지

#### T-3B.4 `widgets/transaction-history-panel` (추가·삭제·검색 UI) `[난이도: 5/10]`

- **근거:** PRD F-2, F-3.1
- **작업:** 목록·삭제·검색 입력 UI 한국어
- **완료:** §6.3 수동 시나리오 통과

#### T-3B.5 `features/export-csv` `[난이도: 3/10]`

- **근거:** PRD ADV-3, F-6 / TRD 5.2
- **작업:** Transaction[] → CSV, UTF-8 BOM, Blob 다운로드
- **완료:** 필터된 목록 기준 파일 다운로드·내용 일치

#### T-3B.6 `pages/dashboard` 통합 + `shared/ui` 정리 `[난이도: 5/10]`

- **근거:** PRD MVP-4, F-3 / TRD Phase 3
- **작업:** exchange / remittance / history 패널 한 화면 배치, App 라우팅
- **완료:** 단일 대시보드에서 환전·송금·기록·CSV 사용 가능

### T-3C — UI 확장: 반응형 · 다크모드 · 인쇄 (분리됨)

### Phase 3C 체크리스트

- [x] T-3C.1 반응형 레이아웃
- [x] T-3C.2 다크모드 토글·영속화
- [x] T-3C.3 거래 기록 인쇄

#### T-3C.1 반응형 레이아웃 `[난이도: 3/10]`

- **근거:** PRD ADV-10, F-9.1 / TRD 5.3
- **작업:** `pages`·`widgets`·`shared/ui`에 `sm:`/`lg:` 등 브레이크포인트, 모바일 1열 스택
- **완료:** 좁은 폭에서도 환전/송금/기록 사용 가능

#### T-3C.2 다크모드 `[난이도: 4/10]`

- **근거:** PRD ADV-11, F-9.2 / TRD 5.3
- **작업:** `ThemeToggle` + `html.dark` + Tailwind dark variant, `shared/lib` 테마 localStorage
- **완료:** 토글·새로고침 후 테마 유지

#### T-3C.3 거래 기록 인쇄 `[난이도: 3/10]`

- **근거:** PRD ADV-12, F-9.3 / TRD 5.3
- **작업:** history 패널 인쇄 버튼, `@media print` + `.no-print` / `.print-area`
- **완료:** 필터된 거래 목록만 인쇄, 계산·동기화·검색/삭제 UI 제외

---

## Phase 4 — 실시간 환율 API

> **원 난이도 8** → Sub-task 분리

### Phase 4 체크리스트

- [x] T-4.1 `fetchBaseRate` + Vite proxy
- [x] T-4.2 UI 자동 채움 + 수동 fallback

### T-4 — 환율 API 연동 (분리됨)

#### T-4.1 `shared/api` — `fetchBaseRate` 클라이언트 `[난이도: 4/10]`

- **근거:** PRD ADV-2, F-5.1, F-5.3 / TRD 5.1
- **작업:** `VITE_EXCHANGE_API_KEY` 등, entities에 API 호출 금지
- **완료:** 성공 시 number 반환, 실패 시 throw

#### T-4.2 UI 자동 채움 + 수동 fallback `[난이도: 5/10]`

- **근거:** PRD F-5.2, E-5.1
- **작업:** 환전/송금 패널에 기준율 자동 입력, 실패·키없음·네트워크 오류 시 안내 + 수동 유지
- **완료:** 성공/실패 경로 수동 검증

---

## Phase 5 — GitHub · CodeRabbit

### Phase 5 체크리스트

- [x] T-5.1 `.coderabbit.yaml` + GitHub remote push
- [x] T-5.2 기능 단위 PR + CodeRabbit 리뷰 (PR #1)

| ID | Task | 난이도 | 근거 | 완료 기준 |
|----|------|--------|------|-----------|
| T-5.1 | `.coderabbit.yaml` 작성 + GitHub 원격 연동 | 3 | PRD ADV-5, F-8.1 / TRD 5.5, Phase 5 | yaml 커밋, 저장소 push 가능 |
| T-5.2 | 기능 단위 PR 생성 후 CodeRabbit 리뷰 수신 | 2 | PRD F-8.1, §6.4 | PR에서 자동 리뷰 이력 확보 |

---

## Phase 6 — MCP · Custom Mode · 협업 문서

### Phase 6 체크리스트

- [x] T-6.1 `.cursor/mcp.json` 최종화 (filesystem · context7, 시크릿 없음)
- [x] T-6.2 Custom Mode Plan / Implement / Review + WORKFLOW 기록
- [x] T-6.3 `docs/prompts.md` 모드별 프롬프트 정리

| ID | Task | 난이도 | 근거 | 완료 기준 |
|----|------|--------|------|-----------|
| T-6.1 | `.cursor/mcp.json` 최종화 (context7 등) | 2 | PRD ADV-6, F-8.2 / TRD Phase 6 | mcp.json 동작, 시크릿 미커밋 |
| T-6.2 | Custom Mode Plan / Implement / Review + WORKFLOW 기록 | 4 | PRD ADV-7, F-8.3 / TRD 5.5 | WORKFLOW에 절차·사용법 명시 |
| T-6.3 | `docs/prompts.md` — 모드별 프롬프트 정리 | 3 | PRD §7 / TRD Phase 6 | Plan·Implement·Review 프롬프트 문서화 |

---

## Phase 7 — Supabase · Vercel

> **원 난이도 9** → Sub-task 분리

### Phase 7 체크리스트

- [x] T-7.1 Supabase 클라이언트·`transactions` 테이블 (프로젝트 `excahngemoney`, RLS·anon upsert/select 확인)
- [x] T-7.2 `features/sync-supabase` + 오프라인 fallback (README 전략 B, 실동기화 OK)
- [x] T-7.3 Vercel 배포 + env — https://kb-fx-teller-helper.vercel.app

### T-7 — 클라우드 저장 · 배포 (분리됨)

#### T-7.1 Supabase 클라이언트·`transactions` 테이블 `[난이도: 5/10]`

- **근거:** PRD ADV-8, F-7.1 / TRD 5.4
- **작업:** `shared/supabase` 초기화, Transaction 스키마 대응 테이블, `.env` 키
- **완료:** 클라우드 insert/select 가능

#### T-7.2 `features/sync-supabase` + 오프라인 fallback `[난이도: 6/10]`

- **근거:** PRD F-7.1, E-7.1 / TRD 5.4 (localStorage 유지 + sync 권장)
- **작업:** localStorage와 병행/동기화, 연결 실패 시 localStorage 계속 + 안내
- **완료:** README에 동기화 전략(A/B 중 선택) 명시, E-7.1 만족

#### T-7.3 Vercel 배포 + env 설정 `[난이도: 4/10]`

- **근거:** PRD ADV-9, F-7.2 / TRD Phase 7
- **작업:** Git 연동 배포, API·Supabase env 등록
- **완료:** 공개 URL에서 환전·기록 등 핵심 기능 동작, README에 URL 기재
  - URL: https://kb-fx-teller-helper.vercel.app

---

## Phase 8 — 제출 마감 · 체크리스트

### Phase 8 체크리스트

- [x] T-8.1 TRD §7.3 체크리스트 전수 점검
- [x] T-8.2 `README.md` 보완 (수수료·동기화·배포 URL·실행법)

| ID | Task | 난이도 | 근거 | 완료 기준 |
|----|------|--------|------|-----------|
| T-8.1 | TRD §7.3 체크리스트 전수 점검 | 3 | TRD §7.3, Phase 8 | FSD·Rules·Vitest·가산 기능·협업 산출물 체크 |
| T-8.2 | `README.md` 보완 (수수료 기준·동기화·배포 URL·실행법) | 3 | PRD F-4.3, F-7, §7 / TRD Phase 8 | 제출 가능한 README |

---

## 실행 단위 난이도 요약

| Phase | 실행 Task 수 | 최고 난이도 | 8점 이상 |
|-------|-------------|-------------|----------|
| 0 | 1 | 2 | 없음 |
| 1 | 5 | 5 | 없음 (원 9 분리) |
| 2 | 6 | 7 | 없음 (원 9 분리) |
| 3 | 10 | 5 | 없음 (원 8·9·10 분리) |
| 3C | 3 | 4 | 없음 |
| 4 | 2 | 5 | 없음 (원 8 분리) |
| 5 | 2 | 3 | 없음 |
| 6 | 3 | 4 | 없음 |
| 7 | 3 | 6 | 없음 (원 9 분리) |
| 8 | 2 | 3 | 없음 |
| **합계** | **37** | **7** | **0** |

---

## 권장 진행 순서

```text
T-0.1
  → T-1.1 → T-1.2 → T-1.3 → T-1.4 → T-1.5
  → T-2.1 → T-2.2 → T-2.3 → T-2.4 → T-2.5 → T-2.6
  → T-3A.* → T-3B.* → T-3C.*
  → T-4.* → T-5.* → T-6.* → T-7.* → T-8.*
```

기능 단위 PR(CodeRabbit)은 Phase 2·3·4 완료 구간마다 끊어서 올리는 것을 권장한다.
