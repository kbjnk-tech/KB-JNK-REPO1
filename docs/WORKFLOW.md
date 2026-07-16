# Workflow — Cursor 협업 방식

## 1. 기본 흐름

```text
Plan → Implement → Review
```

Always Apply 룰 `01-collaboration.mdc`가 위 모드를 AI에 강제한다.  
도메인·UI·통신·feature 세부 규칙은 **해당 파일 glob**이 열릴 때 file-specific 룰로 중첩 연결된다.

| Mode | 목적 | 주의 |
|------|------|------|
| **Plan** | 범위·파일·위험 정리, 구현 전 설계 | 코드 대량 변경 금지 |
| **Implement** | 허용 경로만 수정, FSD·feature 룰 준수 | context7로 최신 문법 확인 |
| **Review** | 아키텍처·도메인·테스트·범위 일탈 점검 | PRD 인수 시나리오 대조 |

상세 프롬프트: `docs/prompts.md`

## 2. 개발 규칙

1. 라이브러리 문법은 **context7 MCP**로 확인
2. 큰 다파일 작업은 Agent에 위임하되, Rules(`.cursor/rules`)가 항상 적용되게 유지
3. `npm install` 등 패키지 설치는 개발자가 실행·확인
4. API·Supabase 키는 `.env` / Vercel env만 — **git 커밋 금지**
5. 기능 단위로 브랜치·PR 분리 → CodeRabbit 리뷰 (Phase 5+)

## 3. 검증 명령

```bash
npm run dev      # 대시보드 기동
npm test         # Vitest
npm run build    # 타입체크 + 빌드
```

## 4. PR 체크리스트 (요약)

- [ ] FSD 의존 방향·Public API 준수
- [ ] 도메인 계산 = 순수 함수 + 테스트 통과
- [ ] UI 한국어, 계산식 인라인 없음
- [ ] 실키 미포함
