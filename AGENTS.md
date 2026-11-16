<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## 눈길 발자국 — 작업 규칙

아티큘레이션(스타카토, 레가토, 악센트, 테누토, 마르카토)을 걸음과 발자국으로 배우는 학습 게임 웹앱이다. 사용자는 개발자가 아니다.

### 기준

- 무엇을 만드는지는 `docs/눈길발자국_기획서.md`가 기준이다(R = 규칙, T = 문구, L = 화면에만 있는 말, S = 화면, D와 P = 결정). 만드는 순서는 `docs/눈길발자국_프롬프트설계서.md`의 단계다.
- 사용자가 준 단계만 한다. 다음 단계의 일을 미리 하지 않는다.
- 기획서와 다르게 만들어야 하거나 기획서에 없는 것을 정해야 하면 멈추고 사용자에게 묻는다. 선택지, 추천, 이유를 함께 말한다.

### 엔진

- `src/engine/engine.ts`는 규칙의 원본이다. 고치지 않는다.
- 정답, 판정, 안내 문장, 주문 문장, 문제 뽑기, 별, 잠금, 자국 도형, 펭귄 자세, 소리 일정은 엔진 함수가 준 값만 쓴다. 화면 쪽에서 다시 계산하지 않는다(기획서 7.1, 7.3).
- `src/engine/golden/snowpath_golden_v1.json`은 약 0.9MB다. 열어서 읽지 않는다. 고치지 않는다. `src/engine/engine.golden.test.ts`와 `scripts/gen_golden.py`도 고치지 않는다.
- 엔진이 틀린 것 같으면 고치지 말고 사용자에게 알린다.

### 화면

- 화면의 문장은 엔진의 것(TEXT, NAME, MEANS, WALK_WORD, INTRO, 문장을 돌려주는 함수)을 쓴다. 엔진에 없는 단추 이름 등은 기획서 9.8의 표를 `src/screens/labels.ts`에 옮겨 쓴다. 새 문장을 지어내지 않는다.
- `docs/prototype.html`(시안)은 그리는 방법의 기준이다: 악보, 이음줄, 자국, 펭귄, 눈 퍼짐, 소리 합성, 색과 배치. 계산 함수는 시안의 것을 옮기지 말고 엔진 것을 쓴다(둘의 결과는 같다). 시안의 맨 끝에 있는 window.claude 관련 코드는 옮기지 않는다.
- 폴더는 기획서 16장을 따른다. `src/engine/`은 다른 폴더를 불러오지 않는다.
- 세로 폰 360×640이 기준이다. 누르는 곳의 높이는 44 이상.

### 기술

- Next.js 정적 내보내기(`output: "export"`), TypeScript strict, Tailwind CSS, Zustand, Vitest.
- 서버 코드, 실행 중의 외부 요청, 로그인, 분석 도구, 광고를 넣지 않는다.
- 새 꾸러미(npm 패키지)는 사용자에게 묻고 넣는다.
- Next.js에 관한 것은 위 블록의 안내대로 설치된 판의 문서(`node_modules/next/dist/docs/`)를 먼저 확인한다.

### 단계를 마칠 때

- `npm run check`(시험, 타입 검사, 형식 검사, 빌드)가 모두 통과해야 한다. 통과하지 못했으면 끝났다고 하지 않는다.
- 통과하면 단계 이름으로 커밋한다. 원격 저장소(origin)가 있으면 push도 한다.
- 보고는 한국어로, 쉬운 말로, 결론부터 쓴다. 달라진 것, 확인한 것, 확인하지 못한 것, 사용자가 직접 볼 것을 나눠 적는다. 화면을 직접 보지 못했으면 그렇게 적는다.

현재 작업 승인: 사용자는 2026-11-16에 제공한 자료 기반 전 단계 개발과 통상 구현 결정을 질문 없이 진행하도록 승인했다. 제공되지 않은 참조 키트 대신 기획서와 시안에서 재구성한 엔진임을 검증 기록에 명시한다.
