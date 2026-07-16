# 외환 창구 업무 도우미 (FX Teller Helper)

은행 외환 창구용 **환전·해외송금 계산**과 **거래 기록** 대시보드입니다.  
React 19 · Vite · TypeScript · Tailwind · Vitest · FSD

## 실행

```bash
npm install
cp .env.example .env   # 키 입력
npm run dev
npm test
npm run build
```

## 환경변수 (`.env`)

| 키 | 용도 |
|----|------|
| `VITE_EXCHANGE_API_KEY` | 한국수출입은행 현재환율 OpenAPI |
| `VITE_SUPABASE_URL` | Supabase 프로젝트 URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key |

실키는 커밋하지 마세요. 개발 시 환율 API는 Vite proxy(`/api/exim`)를 사용합니다.

## 송금 수수료 기준 (`src/shared/config`)

| 송금액(USD) | 송금수수료 |
|-------------|------------|
| ~ $500 | 5,000원 |
| $500 초과 ~ $2,000 | 10,000원 |
| $2,000 초과 ~ $5,000 | 15,000원 |
| $5,000 초과 ~ $20,000 | 20,000원 |
| $20,000 초과 | 25,000원 |

- 전신료(해외): **8,000원/건**
- 현찰 스프레드 기본 **1.75%**, 전신환 **1.0%**

## 저장 전략

- **주 저장소:** Supabase `transactions` (앱 시작 시 로드, 추가/삭제 시 자동 반영)
- **캐시/오프라인:** `localStorage` — 키 없음·네트워크·테이블 오류 시에도 계산·기록 계속 (**E-7.1**)
- **다중 기기·탭:** 충돌 병합 없음. **마지막 쓰기**가 남습니다 (**E-7.2**)
- UI: **클라우드에서 새로고침** / **캐시 재업로드** 버튼으로 수동 보강 가능

### Supabase 테이블 (SQL 예시)

에러 `Could not find the table 'public.transactions'` 는 **테이블 미생성**입니다.  
Supabase Dashboard → **SQL Editor** → New query에 아래를 실행하거나,  
저장소의 `supabase/migrations/20260716_create_transactions.sql` 내용을 붙여넣기 실행하세요.

```sql
create table if not exists public.transactions (
  id uuid primary key,
  customer_name text not null,
  type text not null,
  currency text not null,
  base_rate numeric not null,
  spread_rate numeric not null,
  preferential_rate numeric not null,
  applied_rate numeric not null,
  foreign_amount numeric not null,
  krw_amount numeric not null,
  fee_total numeric,
  memo text,
  created_at timestamptz not null
);

alter table public.transactions enable row level security;

create policy "Allow anon read transactions"
  on public.transactions for select to anon using (true);
create policy "Allow anon insert transactions"
  on public.transactions for insert to anon with check (true);
create policy "Allow anon update transactions"
  on public.transactions for update to anon using (true) with check (true);
create policy "Allow anon delete transactions"
  on public.transactions for delete to anon using (true);
```

실행 후 **클라우드로 동기화**를 다시 눌러보세요.

## 문서

- `prd.md` / `docs/PRD.md` — 제품 요구
- `trd.md` / `docs/ARCHITECTURE.md` — 기술·FSD
- `docs/WORKFLOW.md` · `docs/prompts.md` — Cursor 협업
- `task.md` — 구현 Task
- `.cursor/rules/` — Always + file-specific Rules

## 배포 (Vercel)

1. GitHub `KB-JNK-REPO1` 연동 (또는 CLI `vercel --prod`)
2. Environment Variables에 위 `VITE_*` 등록
3. 배포 URL을 이 README에 기재

**배포 URL:** https://kb-fx-teller-helper.vercel.app

환율 API는 프로덕션에서 `/api/exim/*` → 한국수출입은행 OpenAPI 로 rewrite (`vercel.json`) 합니다.

## 검증

```bash
npm test   # PRD 인수 시나리오 회귀
```
