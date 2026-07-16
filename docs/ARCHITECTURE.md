# Architecture — 외환 창구 업무 도우미

> 상세 기술 요구: 루트 `trd.md`  
> 제품 요구: `docs/PRD.md` / 루트 `prd.md`

## 1. 스택

| 구분 | 기술 |
|------|------|
| UI | React 19 + Vite + TypeScript + Tailwind CSS v4 |
| 상태 | useState / useReducer (필요 시 Context) |
| 영속화 | localStorage (기본) + Supabase (가산) |
| 테스트 | Vitest |
| 배포 | Vercel |

## 2. FSD 레이어

```text
src/
├── app/                 # 앱 엔트리 조합
├── pages/dashboard/     # 단일 대시보드 페이지
├── widgets/             # exchange / remittance / transaction-history
├── features/            # calculate-*, add/search-transaction, export-csv, sync-supabase
├── entities/            # currency, rate, transaction
└── shared/              # lib, ui, config, api, supabase
```

### 의존 규칙

1. `app → pages → widgets → features → entities → shared` (상위→하위만)
2. 동일 레이어 슬라이스 간 import 금지
3. Public API: 각 슬라이스 `index.ts`만 외부 노출
4. 환율·송금 계산 = entities / shared 순수 함수 (UI·저장소와 분리)

## 3. 핵심 도메인

- 현찰 스프레드 기본 1.75%, 전신환 1.0%
- 적용환율 소수 2자리 → 원화 정수
- JPY unit = 100
- 송금 총액 = 원화원금 + 구간 수수료 + 전신료(8,000원)

## 4. Cursor 산출물

| 경로 | 적용 | 역할 |
|------|------|------|
| `00-architecture.mdc` | **Always** | FSD 의존·Public API·작업 범위 |
| `01-collaboration.mdc` | **Always** | Plan/Implement/Review·시크릿·MCP·PR |
| `10-domain-fx.mdc` | entities, shared/lib·config | 도메인 순수 함수 |
| `20-ui.mdc` | pages, widgets, shared/ui | UI (features 제외) |
| `25-client-infra.mdc` | api, supabase, sync-supabase | FE↔인프라 통신 |
| `30-testing.mdc` | `*.test.ts(x)` | TDD·회귀 |
| `40`~`43-feature-*.mdc` | 해당 feature/widget만 | 슬라이스 범위 제한 |

원칙: Always = 협업·공통 가드레일. File-specific = 해당 디렉터리 작업 시에만 중첩 연결.

## 5. 구현 Phase

| Phase | 내용 |
|-------|------|
| 0 | 환경·계정·키 |
| 1 | 스캐폴드·FSD·docs·Rules·MCP (본 문서 시점) |
| 2 | 도메인 + TDD |
| 3 | features/widgets/dashboard |
| 4 | 환율 API |
| 5 | CodeRabbit |
| 6 | Custom Mode·문서 |
| 7 | Supabase·Vercel |
| 8 | README·체크리스트 |
