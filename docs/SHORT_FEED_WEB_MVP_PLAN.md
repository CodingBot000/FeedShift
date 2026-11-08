# 모바일 퍼스트 숏폼 피드 웹 MVP 개발계획서

> 목적: 로컬 `test` 폴더에 넣어둔 소수의 동영상 파일을 자동 탐색하여, 모바일 웹에서 Reels / Shorts / TikTok 계열의 세 가지 숏폼 UI 스타일을 선택하고 실제로 빠르게 위로 스와이프하며 성능을 검증할 수 있는 MVP를 구현한다.
>
> 이 문서는 Codex에 한정하지 않는다. 어떤 코딩에이전트가 작업하더라도 현재 저장소를 먼저 분석한 뒤, 기존 구조를 최대한 존중하면서 구현하도록 한다.

---

## 0. 이 문서의 우선순위

이번 MVP의 우선순위는 다음과 같다.

1. 모바일 브라우저에서 세로 숏폼 영상을 매우 부드럽게 넘길 수 있을 것
2. `test` 폴더의 동영상 파일명을 하드코딩하지 않고 자동 탐색할 것
3. 영상 수가 3~4개뿐이어도 무한 반복 피드처럼 계속 스와이프할 수 있을 것
4. 현재 영상은 자동 재생되고, 화면에서 벗어난 영상은 즉시 정지할 것
5. 빠른 연속 스와이프에도 검은 화면, 장시간 로딩, 중복 재생, 오디오 중첩이 최대한 발생하지 않을 것
6. 첫 화면에서 Reels / Shorts / TikTok 스타일 중 하나를 선택할 수 있을 것
7. 실제 서비스의 공식 로고·상표 자산·브랜드명을 제품명으로 복제하지 않고, 인터랙션과 정보 배치 방식만 참고할 것
8. 백엔드, 회원가입, DB, 추천 알고리즘 등은 이번 MVP 범위에서 제외할 것

이번 작업의 본질은 디자인 복제가 아니라 **숏폼 피드 엔진의 체감 성능 검증**이다.

---

# 1. 개발 시작 전 코딩에이전트 행동 지침

코딩에이전트는 구현 전에 반드시 현재 저장소를 먼저 조사한다.

확인해야 할 항목:

- 현재 프로젝트가 존재하는지
- package manager가 무엇인지 (`npm`, `pnpm`, `yarn`, `bun`)
- React/Vite/Next.js 등 기존 프레임워크가 있는지
- TypeScript 사용 여부
- 기존 CSS 방식
- 기존 라우팅 구조
- 이미 사용 중인 아이콘 라이브러리
- 이 문서가 저장된 디렉터리
- 이 문서와 같은 위치에 `test` 폴더가 있는지
- `test` 폴더 안에 어떤 영상 파일이 있는지

기존 프로젝트가 있다면 구조를 무시하고 새 프로젝트를 덮어쓰지 않는다.

기존 프로젝트가 없다면 아래 스택을 기본 권장안으로 사용한다.

- React
- Vite
- TypeScript
- CSS 또는 CSS Module
- 아이콘: `lucide-react` 우선
- 테스트가 필요하면 Vitest
- 별도의 상태관리 라이브러리는 이번 MVP에서는 필수가 아님

React/Vite가 이미 존재한다면 그대로 사용한다.

---

# 2. 디렉터리 기준

이 개발계획서 파일이 위치한 디렉터리를 프로젝트 기준 위치로 본다.

예:

```text
project/
├─ SHORT_FEED_MVP_PLAN.md       ← 이 문서
├─ test/                        ← 사용자가 테스트 동영상을 넣는 위치
│  ├─ sample01.mp4
│  ├─ sample02.mp4
│  ├─ sample03.mp4
│  └─ sample04.mp4
├─ package.json
├─ src/
└─ ...
```

사용자가 `test` 폴더에 몇 개의 영상을 넣을지는 고정하지 않는다.

최소 목표는 3~4개 이상이지만 다음 경우에도 앱이 죽지 않아야 한다.

- 영상 0개
- 영상 1개
- 영상 2개
- 영상 10개 이상

영상 0개라면 피드 화면 대신 명확한 안내를 표시한다.

예:

```text
테스트 동영상이 없습니다.

이 개발계획서와 같은 위치의
/test 폴더에 MP4 또는 WebM 동영상을 넣어주세요.
```

---

# 3. 중요한 제약: 브라우저는 로컬 폴더 목록을 직접 탐색할 수 없음

브라우저 클라이언트 코드에서 임의의 서버 폴더를 `readdir()` 하는 방식은 사용할 수 없다.

따라서 영상 파일명을 코드에 직접 작성하지 말고 **개발 서버 실행 및 빌드 전에 Node.js 스크립트로 `test` 폴더를 자동 스캔하여 manifest를 생성**한다.

권장 구조:

```text
scripts/
└─ generate-test-video-manifest.mjs

src/
└─ generated/
   └─ testVideos.ts
```

또는 현재 프로젝트 구조에 더 자연스러운 위치가 있다면 코딩에이전트가 조정한다.

### Manifest 생성 흐름

```text
/test
  ↓
Node.js scan script
  ↓
지원 영상 확장자 필터링
  ↓
파일명 정렬
  ↓
웹에서 접근 가능한 위치 준비
  ↓
src/generated/testVideos.ts 생성
  ↓
React 앱이 import
```

지원 우선순위:

1. `.mp4`
2. `.webm`
3. 필요 시 `.m4v`

`.mov`는 브라우저별 호환성 차이가 있으므로 자동 발견은 가능하더라도 경고를 표시하거나, MVP에서는 공식 지원 대상에서 제외해도 된다.

### 절대 하지 말 것

```ts
const videos = [
  "/test/a.mp4",
  "/test/b.mp4",
  "/test/c.mp4"
];
```

처럼 파일명을 사람이 직접 입력하도록 만들지 않는다.

사용자가 `test` 폴더에 새 영상을 추가한 뒤 개발 서버를 다시 실행하거나 manifest 생성 명령을 실행하면 자동 반영되어야 한다.

가능하다면 `predev`, `prebuild` 스크립트에 manifest 생성을 연결한다.

예시 개념:

```json
{
  "scripts": {
    "predev": "node scripts/generate-test-video-manifest.mjs",
    "dev": "vite",
    "prebuild": "node scripts/generate-test-video-manifest.mjs",
    "build": "vite build"
  }
}
```

기존 package.json이 있다면 기존 script를 훼손하지 말고 안전하게 통합한다.

---

# 4. 테스트 영상 파일 제공 방식

Vite 또는 사용 중인 프레임워크가 프로젝트 루트의 `test` 폴더를 직접 정적 파일로 서비스하지 않는다면 코딩에이전트가 가장 단순하고 안전한 방식을 선택한다.

가능한 방식:

### 방식 A — 개발/빌드 시 public 영역으로 복사

```text
/test/*.mp4
        ↓
script
        ↓
/public/test-generated/*.mp4
```

manifest에는 웹 URL만 기록한다.

장점:
- 가장 단순함
- Vite/정적 호스팅에서 안정적
- 브라우저 `<video>`로 직접 재생 가능

### 방식 B — Vite plugin 또는 dev middleware

개발 서버가 `/test-media/...` 경로를 프로젝트 루트의 `test` 폴더에 매핑한다.

장점:
- 개발 중 파일 복사가 필요 없음

단점:
- 빌드/배포 시 별도 처리가 필요

이번 MVP에서는 **복잡성이 낮은 방식 A를 우선 추천**한다.

단, 코딩에이전트는 현재 프로젝트 구조를 분석한 후 더 적절한 방식이 있으면 변경할 수 있다.

---

# 5. 전체 사용자 흐름

## 5.1 앱 최초 진입

첫 화면은 스타일 선택 화면이다.

예:

```text
┌─────────────────────────────┐
│                             │
│      Short Feed Test        │
│                             │
│   피드 스타일을 선택하세요   │
│                             │
│  ┌────────┐ ┌────────┐      │
│  │ Reels  │ │ Shorts │      │
│  └────────┘ └────────┘      │
│                             │
│       ┌────────┐            │
│       │ TikTok │            │
│       └────────┘            │
│                             │
│         [ 확인 ]             │
│                             │
└─────────────────────────────┘
```

제품명은 실제 Instagram, YouTube, TikTok과 다른 임시 제품명을 사용한다.

예를 들어 프로젝트 내부 임시명:

```text
Short Feed Lab
```

제품명은 상수 또는 설정 파일에서 쉽게 변경 가능하게 한다.

### 선택 UX

- 기본적으로 한 가지 스타일만 선택 가능
- 선택된 카드가 시각적으로 구분되어야 함
- `확인` 버튼을 누르면 피드 화면으로 이동
- 아무 것도 선택하지 않았다면 확인 버튼 disabled 또는 안내 표시
- 선택 결과는 React state 정도로 유지해도 됨
- 새로고침 시 유지 여부는 중요하지 않음
- 원한다면 localStorage를 사용해도 되지만 필수는 아님

---

# 6. 세 가지 피드 스타일

세 모드는 **서로 다른 피드 엔진을 만들지 않는다.**

반드시 하나의 공통 ShortFeed 엔진 위에 UI Skin만 교체한다.

개념:

```text
ShortFeedCore
├─ current index
├─ infinite logical index
├─ autoplay
├─ pause
├─ preload
├─ media lifecycle
├─ visibility
├─ loop
└─ swipe/page behavior
        │
        ├─ ReelsLikeSkin
        ├─ ShortsLikeSkin
        └─ TikTokLikeSkin
```

이 구조가 중요하다.

세 UI를 각각 별도 구현해서 같은 동영상 로직을 세 번 작성하지 않는다.

---

# 7. Reels 스타일

정확한 상표/로고 자산은 사용하지 않는다.

참고할 UX 요소:

- 전체 화면 세로 영상
- 상단 최소한의 탐색 UI
- 오른쪽 세로 액션 영역
- 하단 좌측 사용자/설명 텍스트 영역
- 하단 탐색 영역
- 좋아요/댓글/공유/더보기 아이콘 배치
- 어두운 영상 위에 흰색 아이콘/텍스트
- 필요하면 아주 약한 하단 gradient

예:

```text
┌────────────────────────────┐
│  Following      For You    │
│                            │
│                            │
│          VIDEO             │
│                       ♡    │
│                       ◯    │
│                       ↗    │
│                       ⋯    │
│                            │
│ @demo                      │
│ 테스트 동영상 03           │
│ 간단한 설명 텍스트          │
│                            │
│  ⌂       ◇       +      ◎ │
└────────────────────────────┘
```

공식 Instagram 로고나 Instagram이라는 제품명은 피드 내부 브랜딩에 사용하지 않는다.

선택 화면에서 개발 테스트용 reference label로 `Reels`라고 표시하는 것은 가능하되, 제품 자체 브랜딩은 별도로 둔다.

---

# 8. Shorts 스타일

참고할 UX 요소:

- 전체 화면 영상
- 오른쪽 세로 액션
- 액션 아이콘 아래 짧은 라벨
- 하단 제목/채널형 정보
- 좌측 하단 중심의 텍스트
- 단순하고 명확한 컨트롤 구조

예:

```text
┌────────────────────────────┐
│                            │
│                            │
│           VIDEO       ♡    │
│                      Like  │
│                       ◯    │
│                    Comment │
│                       ↗    │
│                     Share  │
│                            │
│ 테스트 동영상 01           │
│ @demo-feed                 │
│                            │
└────────────────────────────┘
```

공식 YouTube 로고, Shorts 로고, 구독 버튼 디자인 등을 그대로 복제하지 않는다.

---

# 9. TikTok 스타일

참고할 UX 요소:

- 상단 중앙의 두 개 피드 탭
- 오른쪽 avatar/action rail
- 하단 사용자명 / caption / audio-style row
- 매우 몰입적인 full-screen 구조
- 상단과 하단에만 최소한의 정보

예:

```text
┌────────────────────────────┐
│    Following  |  For You   │
│                            │
│                            │
│           VIDEO        ◉   │
│                        ♡   │
│                        ◯   │
│                        ↗   │
│                            │
│ @demo                      │
│ 테스트 콘텐츠 설명         │
│ ♪ sample audio             │
│                            │
└────────────────────────────┘
```

공식 TikTok 로고/브랜드 자산/특유의 로고 컬러 조합을 그대로 사용하지 않는다.

---

# 10. 아이콘

MVP이므로 별도 디자인 에셋을 제작하지 않는다.

React icon library를 사용한다.

우선 추천:

```text
lucide-react
```

예:

- Heart
- MessageCircle
- Share2
- Bookmark
- MoreHorizontal
- Home
- Search
- Plus
- User
- Volume2
- VolumeX
- ArrowLeft

이미 프로젝트에 다른 아이콘 라이브러리가 있다면 새 라이브러리를 추가하지 않고 기존 것을 우선 사용한다.

---

# 11. 모바일 퍼스트

이번 MVP는 데스크톱보다 **모바일 브라우저 경험을 최우선**으로 한다.

기준 viewport 예:

```text
360 × 800
390 × 844
393 × 852
412 × 915
430 × 932
```

반드시 다음을 고려한다.

```css
height: 100dvh;
```

가능하면 단순 `100vh`보다 dynamic viewport height를 우선 사용한다.

iPhone safe area도 고려한다.

```css
padding-top: env(safe-area-inset-top);
padding-bottom: env(safe-area-inset-bottom);
```

---

# 12. 데스크톱 테스트

데스크톱 브라우저에서도 테스트할 수 있어야 한다.

단, 16:9 화면 전체를 영상으로 채우지 않는다.

예:

```text
Desktop

█████████████████████████████
█████  ┌──────────────┐ █████
█████  │              │ █████
█████  │ Mobile Feed  │ █████
█████  │              │ █████
█████  └──────────────┘ █████
█████████████████████████████
```

권장:

```css
max-width: 480px;
margin: 0 auto;
```

단 실제 모바일에서는 width 100%.

---

# 13. 영상 렌더링 기본 조건

영상은 전체 화면 background 역할을 한다.

권장:

```css
video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
```

필수 속성 개념:

```html
<video
  autoplay
  playsinline
  loop
/>
```

그러나 피드 전체가 반복되는 구조이므로 개별 video의 `loop`는 상황에 따라 사용하지 않아도 된다.

현재 아이템이 화면에 머무르는 동안 영상 자체가 끝났다면 다시 처음부터 재생하는 것은 허용한다.

---

# 14. 자동재생 정책

사용자 요구사항:

> 피드의 현재 영상은 항상 자동재생되어야 한다.

다만 모바일 브라우저는 음성이 켜진 자동재생을 제한할 수 있다.

이번 MVP는 다음 전략을 사용한다.

### 14.1 시작 화면의 `확인` 버튼을 사용자 gesture로 활용

사용자가:

```text
스타일 선택
   ↓
확인 터치
   ↓
피드 진입
```

했기 때문에 가능하다면 첫 영상의 재생을 즉시 시작한다.

### 14.2 autoplay가 브라우저 정책 때문에 거부되면

fallback:

```text
muted autoplay
```

으로 즉시 재생한다.

화면에 임시 음소거 버튼을 제공한다.

```text
🔇 → 🔊
```

사용자가 한 번 소리를 켠 이후에는 현재 세션에서 다음 영상에도 같은 음소거 상태를 유지한다.

### 14.3 절대 허용하지 않을 상태

- 영상이 자동재생 실패한 채 검은 화면만 표시
- 여러 영상의 오디오가 동시에 재생
- 화면에서 사라진 영상이 계속 소리를 냄

---

# 15. 핵심: Scroll 구현

JS의 `touchmove`를 이용해 모든 프레임의 이동을 직접 계산하는 구현은 피한다.

기본적으로 브라우저 compositor가 처리하는 native scrolling을 활용한다.

권장:

```css
.short-feed {
  height: 100dvh;
  overflow-y: auto;
  scroll-snap-type: y mandatory;
  overscroll-behavior-y: contain;
}

.short-feed-item {
  height: 100dvh;
  scroll-snap-align: start;
  scroll-snap-stop: always;
}
```

필요하면 브라우저별 동작을 확인하여 조정한다.

목표는 **손가락의 세로 swipe가 최대한 브라우저 native scroll path에서 처리되는 것**이다.

---

# 16. 현재 영상 판별

IntersectionObserver 또는 동등한 lightweight 방식으로 어떤 item이 현재 viewport의 중심인지 판별한다.

기본 규칙 예:

```text
viewport 60~70% 이상 차지
→ active video 후보
```

최종 active가 변경되면:

```text
이전 video.pause()
이전 video currentTime 정책 처리

현재 video.play()

다음 video preload
```

를 수행한다.

한 순간에 `playing video`는 원칙적으로 단 하나만 존재해야 한다.

---

# 17. 무한 반복 피드

사용자가 제공한 영상이 3~4개밖에 없어도 무한 스크롤처럼 보여야 한다.

예:

```text
원본:

A
B
C
D
```

사용자가 보는 논리적 순서:

```text
A
B
C
D
A
B
C
D
A
B
C
D
...
```

그러나 DOM에 이 목록을 끝없이 추가해서는 안 된다.

---

# 18. Infinite Feed 구현 원칙

코딩에이전트는 아래 원칙을 만족하는 방식 중 현재 프로젝트에 가장 적절한 방법을 선택한다.

### 필수 원칙

- 논리적 index는 무한 증가 가능
- 실제 video URL은 modulo로 계산 가능

예:

```ts
const media = videos[logicalIndex % videos.length];
```

- DOM에 수백 개 `<video>`를 누적하지 않는다
- 현재 위치 주변의 소수 item만 렌더한다
- 빠른 swipe에도 자연스럽게 다음 item으로 넘어간다
- 재중앙화 또는 virtualization 때문에 사용자가 화면 jump를 체감하지 않도록 한다

### 권장 viewport window

개념적으로:

```text
index -2
index -1
index      ← active
index +1
index +2
```

약 5개 정도를 중심으로 관리한다.

필요하면 7개까지 사용 가능하다.

### 구현 선택지는 코딩에이전트가 결정

예:

- custom circular/windowed feed
- virtualized list
- bounded repeating list + invisible recenter
- 다른 안정적인 방식

단순히 배열을 수천 번 복제해 DOM에 모두 렌더하는 방법은 금지한다.

---

# 19. Preload 정책

이번 MVP 성능의 핵심이다.

기본 목표:

```text
현재 영상   → 즉시 재생
다음 +1     → 적극 preload
다음 +2     → 필요시 metadata / partial preparation
이전 -1     → 직전 이동 대비 유지
나머지      → 불필요한 network 사용 금지
```

HTML video의 `preload` 값을 상황에 맞게 사용한다.

예:

```text
active    = auto
next +1   = auto
next +2   = metadata
others    = none 또는 DOM 미존재
```

브라우저가 preload 힌트를 반드시 그대로 따르는 것은 아니므로 실제 네트워크 패널에서 확인한다.

---

# 20. Player/Video element 관리

이번 MVP에서 가장 중요한 검증 항목 중 하나다.

권장 목표:

```text
활성 video element 수 최소화
```

다음 두 방법 중 하나를 고려한다.

### A. item별 `<video>` + 제한된 virtual window

구현 단순성 때문에 MVP에서는 우선 추천.

### B. 적은 수의 player element를 재사용

성능 문제 발생 시 고려.

초기에는 과도한 player abstraction을 만들지 말되, video element가 무한히 증가하지 않도록 해야 한다.

---

# 21. 빠른 스와이프 상황 처리

다음 시나리오를 반드시 테스트한다.

사용자가 약 1~2초 안에:

```text
A → B → C → D → A → B
```

처럼 매우 빠르게 넘긴다.

이 경우:

- 중간 video에 대해 불필요한 `play()` 호출이 과도하게 쌓이지 않아야 함
- 마지막으로 정착한 video만 정상 재생
- 이전 video 오디오 중지
- rejected `play()` Promise가 콘솔 에러를 도배하지 않도록 처리
- 이전 preload 요청이 리소스를 지나치게 차지하지 않도록 함
- UI가 touch에 즉시 반응

필요하다면 debounce보다 **최종 active item 기준 lifecycle 관리**를 우선한다.

---

# 22. 영상 전환 시 재생 위치 정책

MVP 기본 정책:

```text
영상을 떠남
→ pause
→ currentTime = 0
```

따라서 같은 영상이 다음 cycle에서 다시 등장하면 처음부터 재생한다.

이유:
- 숏폼 앱과 유사한 테스트
- 구현 단순
- 반복 콘텐츠 테스트에 적절

추후 서비스에서는 watch progress 정책을 별도 검토할 수 있다.

---

# 23. 동일한 원본 영상이 빠르게 다시 등장하는 경우

영상이 3개뿐이라면:

```text
A B C A B C ...
```

처럼 같은 URL이 짧은 간격으로 다시 나온다.

브라우저 cache가 효율적으로 재사용되는지 확인한다.

동일 URL에 cache busting query string을 매번 붙이면 안 된다.

금지 예:

```text
video.mp4?t=123456
video.mp4?t=123457
```

이렇게 하면 브라우저 cache 활용이 깨질 수 있다.

---

# 24. Video UI Overlay

영상 위 UI는 position absolute overlay로 구성한다.

대략:

```text
FeedItem
├─ Video
├─ TopOverlay
├─ RightActionRail
├─ BottomMetadata
├─ BottomNavigation
└─ SoundButton
```

Overlay 자체가 스크롤/gesture를 방해하지 않도록 한다.

버튼이 아닌 영역에는 불필요한 `pointer-events`를 붙이지 않는다.

---

# 25. 임시 데이터

실제 회원/댓글/추천 데이터는 구현하지 않는다.

각 video item에는 manifest에서 최소 다음 정도를 생성한다.

```ts
type TestVideo = {
  id: string;
  fileName: string;
  src: string;
  title: string;
};
```

title은 파일명에서 확장자를 제거한 값을 사용하면 된다.

예:

```text
finance_001.mp4
↓
finance_001
```

추가 UI에 필요한 값은 fixture로 만든다.

예:

```ts
{
  creator: "@demo",
  likeCount: 128,
  commentCount: 12,
  caption: "테스트 콘텐츠"
}
```

실제 기능처럼 보이게 하기 위한 임시 값일 뿐이며 backend는 만들지 않는다.

---

# 26. Action 버튼 동작

MVP에서는 버튼의 실제 서버 기능이 필요 없다.

### Like

클릭 시 로컬 state로 토글.

```text
♡ ↔ ♥
```

### Bookmark

로컬 state 토글.

### Comment

클릭 시 작은 임시 bottom sheet 또는 toast 정도.

실제 댓글 기능은 구현하지 않는다.

### Share

가능하면 Web Share API:

```ts
navigator.share(...)
```

를 사용할 수 있지만 필수는 아님.

지원하지 않으면 toast.

### More

간단한 dummy menu.

---

# 27. 음소거 토글

영상 영역을 탭하면 pause/play가 바뀌도록 할지 여부는 코딩에이전트가 현재 UI에 맞게 판단해도 된다.

하지만 반드시 별도의 mute/unmute control을 제공한다.

상태:

```text
muted = true/false
```

모든 feed video에 공통 적용한다.

현재 영상이 바뀌더라도 음소거 설정이 유지되어야 한다.

---

# 28. 스타일 전환

Feed 화면에서 반드시 스타일을 즉시 바꿀 필요는 없다.

MVP 기본 흐름:

```text
Start
 ↓
Style Select
 ↓
Confirm
 ↓
Feed
```

다시 스타일을 선택하고 싶다면 feed 화면에 아주 작은 back/change-style 기능을 제공한다.

예:

```text
←
```

이 기능은 video interaction을 방해하지 않는 위치에 둔다.

---

# 29. 라우팅

규모가 작다면 별도 Router는 필수가 아니다.

```ts
screen = "select" | "feed"
```

정도의 state로 구현해도 된다.

기존 프로젝트에 Router가 이미 있다면 기존 Router를 사용한다.

불필요하게 React Router를 새로 추가하지 않는다.

---

# 30. 애니메이션

과도한 JS animation library를 사용하지 않는다.

우선:

```text
CSS transition
CSS transform
CSS opacity
```

를 사용한다.

좋아요 클릭 정도에는 작은 scale animation 허용.

스크롤 자체는 CSS/native scroll 중심.

---

# 31. 스타일링 원칙

세 스타일이 서로 다른 앱처럼 느껴질 정도의 배치 차이는 둔다.

하지만 핵심 video feed component는 공유한다.

대략적인 차이:

| 구분 | Reels-like | Shorts-like | TikTok-like |
|---|---|---|---|
| 상단 | 최소 탭/제목 | 비교적 단순 | 중앙 Following/For You |
| 우측 액션 | 아이콘 중심 | 아이콘+라벨 | avatar + 세로 액션 |
| 하단 정보 | 사용자/caption | 제목/channel 느낌 | creator/caption/audio |
| 하단 nav | 있음 | 최소 | 있음 |
| 전체 느낌 | 정돈 | 실용 | 몰입 |

정확한 pixel-perfect 복제가 목적은 아니다.

그러나 **사용자가 보자마자 어떤 계열을 참고했는지 느낄 정도로 UX 차이는 확실하게 표현**한다.

---

# 32. 브랜드/심사 리스크 회피

이번 프로젝트는 학습/성능 테스트이지만 추후 실제 앱 전환을 고려하여 다음은 하지 않는다.

- Instagram 공식 로고 사용
- YouTube 공식 로고 사용
- TikTok 공식 로고 사용
- 공식 앱 아이콘 사용
- 각 서비스의 실제 제품명을 우리 제품명처럼 표시
- 공식 브랜드 컬러 및 로고 조합을 그대로 복제
- “공식 Instagram 대체 앱” 등의 오해 가능한 표현

허용 범위:

- 풀스크린 세로 영상
- 위로 swipe
- 자동재생
- 오른쪽 action rail
- 하단 caption
- top feed tabs
- bottom navigation
- 일반적인 social icon

즉 **interaction grammar는 강하게 참고하되 identity는 별도**로 둔다.

---

# 33. 성능 관찰용 Debug Mode

개발 단계에서만 간단한 debug overlay를 켤 수 있게 한다.

예:

```text
DEV MODE

active logicalIndex: 17
source: sample02.mp4
DOM video count: 5
playing count: 1
buffer state: ...
style: tiktok
```

production build에서는 보이지 않아야 한다.

환경 변수 또는 개발 모드 조건으로 처리한다.

이 기능은 실제 스와이프 성능 문제를 파악하는 데 유용하다.

---

# 34. 성능 측정

Chrome DevTools / Safari Web Inspector에서 다음을 확인한다.

### Memory

빠르게 100회 이상 넘겨도 memory가 계속 선형 증가하면 안 된다.

예:

```text
초기 100MB
50 swipe 180MB
100 swipe 270MB
200 swipe 450MB
```

와 같이 계속 증가한다면 video element 또는 event listener가 누수되는 것.

### Network

현재/근접 영상 이외의 모든 파일을 동시에 다운로드하지 않는지 확인.

### CPU

scroll 이벤트에서 heavy state update가 반복되지 않는지 확인.

### FPS

실기기에서 연속 swipe 시 눈에 띄는 frame drop이 없는지 확인.

---

# 35. 주요 테스트 시나리오

반드시 직접 테스트한다.

## T01 — 4개 영상

```text
A B C D
```

20회 이상 계속 넘겨도:

```text
A B C D A B C D...
```

자연스럽게 반복.

---

## T02 — 영상 1개

A만 있어도 앱이 죽지 않고 A가 반복되어야 함.

---

## T03 — 영상 0개

안내 화면 표시.

---

## T04 — 빠른 swipe

5~10개의 page를 연속 빠르게 넘긴다.

마지막 page가 정상 재생되어야 한다.

---

## T05 — 위/아래 반복

```text
A
↓
B
↓
C
↑
B
↑
A
```

처럼 역방향 이동도 정상 동작.

---

## T06 — 오디오

한 영상만 소리가 나야 한다.

---

## T07 — tab/background

모바일 브라우저를 background로 이동 후 다시 돌아왔을 때 playback이 비정상적으로 여러 개 시작되지 않아야 한다.

---

## T08 — rotate

세로 모드가 기본.

가로 모드는 최소한 레이아웃이 깨지지 않게 하거나 필요하면 portrait 권장 안내.

---

## T09 — Safari iPhone

가능하면 실제 iPhone Safari에서 테스트.

---

## T10 — Android Chrome

실제 Android Chrome에서도 테스트.

---

# 36. Safari/iOS 주의사항

다음 속성을 확인한다.

```text
playsinline
```

필수에 가깝다.

자동재생 정책 때문에 첫 `play()`가 reject될 수 있으므로 Promise rejection을 안전하게 처리한다.

페이지가 background로 들어가면 필요에 따라 active video를 pause한다.

`visibilitychange` 이벤트 활용 가능.

---

# 37. Android/Chrome 주의사항

저사양 Android를 고려한다.

- 지나치게 많은 video element 금지
- 복잡한 blur/filter 남발 금지
- 매 scroll frame마다 React state 업데이트 금지
- box-shadow 다량 남발 금지
- 큰 투명 PNG 사용 금지

이번 MVP UI는 단순해야 한다.

---

# 38. 접근성/기본 웹 품질

MVP라도 다음은 지킨다.

- button은 실제 `<button>`
- icon-only button에는 `aria-label`
- keyboard focus가 완전히 깨지지 않도록 함
- 영상이 없을 때 명확한 안내
- JS error로 blank screen이 나오지 않도록 Error Boundary 또는 기본 오류 처리

---

# 39. 콘텐츠 로딩 실패 처리

영상 파일 하나가 깨졌다고 전체 피드를 멈추지 않는다.

video error가 발생하면:

```text
이 영상을 재생할 수 없습니다.
다음 영상으로 이동하세요.
```

정도의 overlay를 표시하거나 자동 skip을 고려한다.

개발 console에는 실제 파일명을 출력한다.

---

# 40. 파일명 정렬

manifest 생성 시 파일 순서가 OS별로 달라지지 않도록 명시적으로 정렬한다.

권장:

```text
localeCompare + numeric option
```

예:

```text
video1.mp4
video2.mp4
video10.mp4
```

순서가 되도록 한다.

---

# 41. 테스트 파일 변경 Workflow

사용자가 할 일은 단순해야 한다.

```text
1. /test 폴더를 연다.
2. mp4 파일을 넣는다.
3. 개발 서버를 실행한다.
4. 앱에서 자동으로 나타난다.
```

가능하다면 dev server 실행 중 `test` 폴더 변경을 watch해서 manifest를 자동 갱신해도 된다.

하지만 MVP의 필수 조건은 아니다.

최소한 dev server 재시작 시 자동 반영되어야 한다.

---

# 42. 구현 권장 컴포넌트

실제 이름은 기존 프로젝트 naming convention을 우선한다.

개념적인 구조:

```text
src/
├─ app/
│  └─ App.tsx
│
├─ features/
│  └─ short-feed/
│     ├─ ShortFeed.tsx
│     ├─ ShortFeedItem.tsx
│     ├─ useActiveVideo.ts
│     ├─ useFeedWindow.ts
│     ├─ useVideoPlayback.ts
│     ├─ types.ts
│     │
│     └─ skins/
│        ├─ ReelsLikeSkin.tsx
│        ├─ ShortsLikeSkin.tsx
│        └─ TikTokLikeSkin.tsx
│
├─ screens/
│  ├─ StyleSelectScreen.tsx
│  └─ FeedScreen.tsx
│
├─ generated/
│  └─ testVideos.ts
│
└─ styles/
```

단, 현재 프로젝트에 이미 구조가 존재한다면 이를 강제로 적용하지 않는다.

---

# 43. Feed Core와 Skin 분리 예시

개념:

```tsx
<ShortFeed
  videos={videos}
  renderOverlay={(context) => (
    <SelectedSkin
      video={context.video}
      active={context.active}
    />
  )}
/>
```

핵심:

```text
video lifecycle
scroll
infinite loop
preload
virtualization
```

과

```text
icon 위치
caption 위치
top bar
bottom nav
```

를 분리한다.

---

# 44. CSS 구조

Video layer:

```text
z-index 0
```

Gradient:

```text
z-index 1
```

Content overlay:

```text
z-index 2
```

Control:

```text
z-index 3
```

UI가 video repaint를 불필요하게 많이 발생시키지 않도록 단순하게 유지한다.

---

# 45. 처음부터 구현하지 않을 기능

이번 단계에서 아래는 만들지 않는다.

- 로그인
- 회원가입
- Backend API
- DB
- 실제 댓글
- 실제 Like 서버 저장
- 추천 알고리즘
- 콘텐츠 카테고리
- 금융/과학/영어 콘텐츠 데이터
- 관리자 페이지
- CDN
- Cloudflare R2
- HLS
- 영상 업로드 UI
- 신고
- 팔로우
- 실제 사용자 프로필
- push notification
- 앱 차단 기능
- Screen Time API
- Android Accessibility
- React Native
- Flutter
- WebView wrapping

이것들은 숏폼 웹 피드 성능이 검증된 다음 단계에서 다룬다.

---

# 46. MVP 성공 조건

다음이 모두 만족되면 이번 개발은 성공으로 본다.

### Functional

- 첫 화면에서 3가지 스타일 선택 가능
- 확인 후 피드 진입
- `test` 동영상 자동 발견
- 파일명 하드코딩 없음
- 모든 영상 자동재생
- 위로 swipe
- 아래로 swipe
- 무한 순환
- style별 UI 차이
- action icon 표시
- mute/unmute
- style 선택 화면으로 복귀 가능

### Performance

- 현재 video 외 불필요한 playback 없음
- 빠른 연속 swipe 가능
- DOM video element 수 제한
- 메모리 지속 증가 없음
- 다음 video loading 대기 최소화
- mobile Safari/Chrome에서 사용 가능

### Architecture

- ShortFeed core와 Skin 분리
- test file manifest 자동 생성
- 코드에서 파일명 수동 배열 금지
- 새 video 추가 시 최소 작업으로 반영

---

# 47. 코딩에이전트에게 요구하는 작업 순서

코딩에이전트는 다음 순서로 진행한다.

## Step 1 — 저장소 조사

현재 구조와 실행 방법을 파악한다.

아직 코드를 대규모 변경하지 않는다.

---

## Step 2 — `test` 폴더 조사

현재 존재하는 동영상 파일을 확인한다.

사용자가 아직 파일을 넣지 않았다면 0개 상태도 정상 처리한다.

---

## Step 3 — manifest generator

`test` 폴더를 자동 탐색하는 기능부터 만든다.

파일명을 코드에 하드코딩하지 않는다.

---

## Step 4 — 단일 영상 feed prototype

한 개의 video가 full-screen에서 정상 autoplay 되는 것을 먼저 검증한다.

---

## Step 5 — vertical scroll snap

2개 이상의 video를 위아래로 swipe 가능하게 한다.

---

## Step 6 — active playback lifecycle

현재 video만 play하고 나머지는 pause.

---

## Step 7 — infinite/windowed feed

원본 영상 수에 관계없이 계속 반복되도록 구현.

DOM 누적 방지.

---

## Step 8 — preload 최적화

다음 video가 빠르게 나타나도록 조정.

---

## Step 9 — 기본 UI skin

한 가지 스타일을 먼저 완성한다.

기본 우선순위는 TikTok/Reels 계열의 몰입형 UI.

---

## Step 10 — 나머지 두 Skin

동일한 feed core에 overlay만 교체.

---

## Step 11 — Style Select 화면

3개 선택 UI 연결.

---

## Step 12 — 실기기 테스트

가능한 범위에서 mobile viewport 및 실제 기기 검증.

---

# 48. 코딩에이전트의 판단에 맡길 부분

다음은 문서를 기계적으로 따라가기보다 현재 환경에 맞게 판단한다.

- 정확한 파일/폴더명
- CSS module 여부
- routing 사용 여부
- virtualization 구현 방식
- Vite plugin vs manifest copy 방식
- icon library
- 테스트 도구
- component 세부 분할

단, 아래 원칙은 변경하면 안 된다.

```text
test 폴더 자동 탐색
파일명 하드코딩 금지
모바일 퍼스트
무한 순환
자동재생
한 번에 하나만 실제 재생
DOM 무한 증가 금지
세 UI가 하나의 feed core 공유
```

---

# 49. 최종 실행 경험

사용자가 이 프로젝트를 받아서 해야 할 행동은 다음처럼 단순해야 한다.

```text
/test
  ├─ a.mp4
  ├─ b.mp4
  ├─ c.mp4
  └─ d.mp4

↓ dev 실행

[Short Feed Lab]

어떤 스타일로 테스트할까요?

[ Reels ]
[ Shorts ]
[ TikTok ]

       [확인]

↓

FULL SCREEN VIDEO
            ♡
            ◯
            ↗

↑ Swipe

↓

NEXT VIDEO AUTO PLAY

↑ Swipe
↑ Swipe
↑ Swipe
↑ Swipe

계속 반복
```

사용자가 빠르게 계속 위로 넘겨도 **영상 전환이 부드럽게 이어지는지 확인하는 것**이 이번 MVP의 핵심이다.

---

# 50. 완료 후 코딩에이전트가 보고할 내용

작업이 끝나면 다음 내용을 짧게 보고한다.

1. 실제 사용한 기술 스택
2. 새로 추가하거나 수정한 핵심 파일
3. `test` 폴더 영상 탐색 방식
4. infinite loop 구현 방식
5. 동시에 유지하는 video element 개수
6. preload 전략
7. autoplay/audio 정책
8. 실행 명령
9. 테스트한 브라우저/viewport
10. 알려진 제한사항

특히 성능 관련해서는 단순히 "완료"라고 하지 말고,

```text
현재 DOM video 개수
현재/다음 preload 전략
빠른 swipe 테스트 결과
```

를 구체적으로 보고한다.

---

# 핵심 요약

이번 MVP에서 가장 중요한 것은 아래 네 가지다.

```text
1. /test 영상 자동 발견
2. 모바일 full-screen vertical swipe
3. 현재 영상 autoplay + 다음 영상 preload
4. 영상이 몇 개 없어도 무한 순환
```

Reels / Shorts / TikTok 스타일은 이 공통 엔진 위에 올라가는 **세 가지 UI Skin**으로 구현한다.

처음부터 서버나 실제 콘텐츠 시스템을 만들지 않는다.

이 웹 MVP에서 빠른 연속 swipe를 충분히 견디는 것이 확인되면 다음 단계에서:

```text
웹
↓
React Native WebView / native shell
↓
iOS / Android
```

또는 필요한 부분만 native video feed로 교체하는 방향을 검토한다.

---

# 51. 개발 완료 후 배포 절차

개발이 끝나면 아래 순서대로 커밋, 원격 저장소 push, Vercel 배포를 수행한다.

## 51-1. 커밋

```bash
git init
git add .
git commit -m "feat: 숏폼 피드 웹 MVP 구현"
```

## 51-2. 원격 저장소 연결 및 push

```bash
git branch -M main
git remote add origin https://github.com/CodingBot000/FeedShift.git
git push -u origin main
```

이미 `origin`이 등록되어 있다면:

```bash
git remote set-url origin https://github.com/CodingBot000/FeedShift.git
git push -u origin main
```

## 51-3. Vercel 배포

```bash
npm install -g vercel
vercel login
vercel --prod
```

- 프레임워크가 Vite라면 빌드 명령 `npm run build`, 출력 디렉터리 `dist`를 사용한다.
- Git 연동 배포를 원하면 Vercel 대시보드에서 `https://github.com/CodingBot000/FeedShift` 저장소를 Import해도 된다. 이후 `main` 브랜치 push 시 자동 배포된다.

## 51-4. 한 번에 실행

```bash
git add . && git commit -m "feat: 숏폼 피드 웹 MVP 구현" && git push origin main && vercel --prod
```
