# SE-0004 대본 작성 프롬프트 (Remove the `++` and `--` operators)

한국어 복제 음성은 제작 스킬의 말끝 검증을 적용합니다. 최종 재생 속도로 ‘다’의 모음과 다음 문장 앞의 쉼을 확인합니다.

아래 Swift Evolution 원문을 바탕으로 `episodes/SE-0004/script.json`을 작성해 주세요.

## 메타데이터
- **Proposal ID**: SE-0004
- **Episode Number**: 4
- **Title**: Remove the `++` and `--` operators
- **Status / Version**: implemented (Swift 3.0)
- **Authors**: Chris Lattner
- **URL**: https://github.com/swiftlang/swift-evolution/blob/main/proposals/0004-remove-pre-post-inc-decrement.md
- **Next Episode Hint**: SE-0005 - Better Translation of Objective-C APIs Into Swift

## 작성 규칙

인물을 언급할 때는 해당 speech 자막에서 cue를 골라 장면의 people 배열에 영문 이름(name), 플랫폼과 @아이디(account), 공식 프로필 URL(profile), 당시 맡은 역할(role)을 기록하세요. 내레이션에서는 제안자가 바꾸려던 점과 토론자가 제시한 실제 사례나 우려를 해당 발언에 근거해 설명하세요. 출처와 사용 조건이 확인된 실제 사진은 에피소드의 audio/people에 저장하고 photo의 file, source, credit을 채우세요. 공동 저자는 각각 표시하고 설명란에 프로필과 사진 출처를 남기세요. 사진 출처는 직접 조사하세요. 수익화 영상에 쓸 수 있는지 확인되지 않으면 조사 결과를 기록하고 영문 이름과 계정만 표시하세요. 대본 작성 전에 공식 원문 최초판과 최종판, 변경 이력과 PR, 제안·리뷰 토론, 결정 공지, 구현과 출시 기록을 조사해 에피소드 폴더의 research.md에 날짜·발언자·근거 링크를 남기세요. 본편에서는 당시의 문제, 의견이 갈린 이유, 검토한 대안, 실제 수정과 최종 결정이 어떻게 이어졌는지 장면으로 설명하세요. 쇼츠에도 결정의 이유를 하나 담으세요. 예제 수정과 설계 변경, 당사자의 의견과 공식 결정, 채택 전 논쟁과 후속 논의를 구분하세요. 찾지 못한 기록은 조사 노트에 밝히고 대화를 창작하지 마세요.

korean-product-writing 원칙에 따라 한 문장에 한 가지를 설명하고 대상과 동작을 구체적으로 말하세요. 제안 당시 의도와 출시된 변경은 날짜가 있는 과거형으로, 현재 동작은 확인한 버전을 기준으로, 미출시 동작은 상태와 조건을 밝혀 쓰세요. RFC 2119의 의무·권고·선택 구분과 ASD-STE100의 명료성 원칙을 한국어 합니다체에 맞게 적용하세요. 영어는 뜻이 이어지는 짧은 영어 구절로 묶어 en 음성으로 합성하세요. 제목에는 무엇이 어떻게 달라졌는지 동사로 쓰세요. 예를 들어 SE-0001은 “백틱이 사라졌다”입니다. 초보자부터 중급자까지 볼 수 있도록 전문 용어가 처음 들리는 장면에 termNotes를 넣으세요. term은 용어, meaning은 현재 코드에 맞춘 짧은 한글 풀이, cue는 해당 자막에서 그대로 가져온 구절입니다. 시리즈 이름은 “듣다 보면 잠이 오는 스위프트 에볼루션 훑어보기”입니다. 첫 화면의 badge와 썸네일 subheadline에 이 이름을 쓰세요. 늦은 밤 동료에게 이야기하듯 편안하게 읽고, 썸네일에는 그 편에서 달라진 점을 짧게 쓰세요. 첫 질문과 답 직후, 제안서 최초 기록·구현 기록·해당 Swift 버전과 정식 출시 시기를 history 장면으로 짧게 소개하세요. milestones 배열에 확인된 사건을 시간순으로 최대 3개 넣으세요. 각 항목은 date(표시할 날짜), event(사건), sourceUrl(공식 출처 URL)로 구성합니다. 제안서 이력과 공식 출시 발표로 확인한 날짜만 쓰고, 미출시 제안은 확인된 상태까지만 소개하세요. 첫 화면에 제목이 약속한 코드를 보여주고, 시청자가 눈으로 답을 찾을 수 있는 질문을 하나 던지세요. 코드가 바뀌는 지점에 강조와 설명을 맞추세요. 친한 동료와 같은 코드를 보며 발견한 내용을 나누듯 쓰세요. 한국어 낭독문과 해당 자막은 모두 ‘다.’로 끝내세요. 시청자가 답을 생각하도록 ‘어떤 값이 돌아올지 잠시 생각해 봅니다.’처럼 간접 질문을 쓰세요. 삭제를 보여주는 첫 장면은 heading에 질문을 쓰고 codeReveal.parts에 한 줄의 코드를 순서대로 나누세요. 남길 부분은 문자열, 지울 부분은 {"remove":"문자"}입니다. 답이 들리는 단어로 새 speech 구간을 시작하고 그 caption 전체를 codeReveal.answerCue에 넣으세요. 오래전에 사라진 문법은 시청자가 처음 본다고 가정하세요. 도입에서 사용 시기를 표시하고 당시 선언과 구체적인 실행 결과를 먼저 보여준 뒤, 제안 당시의 쟁점으로 넘어가세요. 마지막에는 그 선언과 현재 가능한 호출을 함께 보여주세요. 본편과 쇼츠 모두 첫 화면에 코드를 띄우고 “오늘도 코드 한 줄을 함께 살펴봅니다.”로 시작하세요. 그 편에서 생각해 볼 문제 하나를 짚고 답을 보여주기 전에 한 박자 기다리세요. 끝에서는 첫 코드를 다시 보여주고 질문의 답과 제안의 의미를 연결하세요. 본편과 쇼츠의 마지막 대사는 제안서에 근거해 이 제안이 해결하려던 문제를 말해야 합니다. 채택 여부와 목표를 구분하세요. 마지막 대사가 끝나면 예제 코드를 잠시 남기세요. [시리즈 연출 근거](../../_context/editorial-direction.md)

1. **언어/톤**: 한국어 개발자 유튜브 스타일(친절하고 명쾌하며 실무 중심). 각 장면의 deliveryNote에는 가장 또렷하게 읽을 단어와 숨을 고를 지점을 한두 문장으로 쓰세요. 녹음 메모에서는 실제 들숨과 시청자가 코드를 볼 기다림을 구분하세요. 주어와 서술어는 한 호흡으로 이으세요. 코칭은 narration이나 speech.text에 넣지 마세요. 문장이 끝나면 다음 발화 전에 쉴 수 있도록 speech를 한 문장씩 나누세요. 종결음 ‘다’는 힘을 빼고 살짝 길게 내려놓으세요. 한 문장 안에서 코드만 따로 읽을 때는 불필요한 마침표를 넣지 마세요. 화면과 자막(narration)에는 원래 철자를 유지하세요. 한영 혼용 장면에는 speech 배열을 작성하세요. 각 구간의 caption을 순서대로 합치면 narration과 같아야 합니다. language는 ko 또는 en, text는 실제 낭독문입니다. 영어 제안 제목은 한 구절로 묶고, 한국어 문장 안의 약어나 버전은 문맥에 맞게 풀어 읽으세요. 예: {"language":"en","caption":"indexOf","text":"index of"}, {"language":"ko","caption":"API를 호출합니다.","text":"에이피아이를 호출합니다."}. 코드의 구두점은 의미가 있을 때만 읽으세요. shortNarration을 따로 쓰면 shortSpeech도 별도로 작성하세요. 각 대사의 등장 대상과 순서를 direction.stages에 짧은 표기 1~3개로 쓰세요. 코드에 초점을 맞출 때 direction.panel에 code, codeBefore, codeAfter 중 실제 패널을 쓰고 direction.lines에 1부터 시작하는 줄 번호를 적으세요.
2. **16:9 일반 영상 (`scenes`)**:
   - 5~7개 씬 구성 권장 (`intro` -> `history` -> `problem` -> `code-compare` -> `code-focus` -> `key-points` -> `outro`).
   - 총 나레이션 길이 1.5~3.5분 분량 (한국어 약 450~1,100자).
   - 각 `codeBefore` / `codeAfter` / `code` 블록은 1920x1080 화면에서 한눈에 읽히도록 3~12줄 이내로 간결하게 다듬기.
   - 강조할 줄이 있으면 `highlightLines`, `diffAddedLines`, `diffRemovedLines` (1-based line numbers) 활용.
3. **9:16 쇼츠 (`shortsScenes` 또는 `includeInShort`/`shortNarration`)**:
   - **50초 이내** (한국어 약 160~230자, 3~4개 씬)로 강렬한 훅 + Before/After 코드 + 한 줄 결론 구성!
   - `shortsScenes` 배열을 별도로 작성하면 세로 화면에 최적화된 짧은 제목/코드/나레이션을 완전히 독립 제어할 수 있어 가장 추천합니다.
4. **썸네일 (`thumbnail`)**:
   - `headline`은 2줄 이내의 임팩트 있는 한국어 문구 (`\n`으로 줄바꿈).
   - `codeBefore`, `codeAfter`는 1~2줄짜리 대비 코드.
5. **YouTube 메타데이터**:
   - `youtube.long.title`: 100자 이내, 클릭하고 싶은 한국어 제목.
   - `youtube.short.title`: 100자 이내, 끝에 `#Shorts` 포함.
   - `playlistNames`: long은 `["Swift Evolution 처음부터 끝까지"]`, short는 `["Swift Evolution Shorts"]`.
6. **검증**: 작성 후 `pnpm evo validate SE-0004` 로 스키마 통과 확인.

## 원문 Proposal (`proposal.md`)

```markdown
# Remove the `++` and `--` operators

* Proposal: [SE-0004](0004-remove-pre-post-inc-decrement.md)
* Author: [Chris Lattner](https://github.com/lattner)
* Status: **Implemented (Swift 3.0)**
* Implementation: [apple/swift@8e12008](https://github.com/apple/swift/commit/8e12008d2b34a605f8766310f53d5668f3d50955)

## Introduction

The increment/decrement operators in Swift were added very early in the
development of Swift, as a carry-over from C.  These were added without much
consideration, and haven't been thought about much since then.  This document
provides a fresh look at them, and ultimately recommends we just remove them
entirely, since they are confusing and not carrying their weight.

As a quick refresher, there are four operators in this family:

```swift
let a = ++x  // pre-increment  - returns input value after mutation
let b = x++  // post-increment - returns copy of input value before mutation
let c = --x  // pre-decrement  - returns input value after mutation
let d = x--  // post-decrement - returns copy of input value before mutation
```

However, the result value of these operators are frequently ignored.


## Advantages of These Operators

The primary advantage of these operators is their expressive capability.  They
are shorthand for (e.g.) `x += 1` on a numeric type, or `x.advance()` on an
iterator-like value.  When the return value is needed, the Swift `+=` operator
cannot be used in-line, since (unlike C) it returns `Void`.

The second advantage of Swift supporting this family of operators is continuity
with C, and other common languages in the extended C family (C++, Objective-C, 
Java, C#, Javascript, etc).  People coming to Swift from these other languages
may reasonably expect these operators to exist.  That said, there are also
popular languages which have kept the majority of C operators but dropped these
(e.g. Python).


## Disadvantages of These Operators

1. These operators increase the burden to learn Swift as a first programming
language - or any other case where you don't already know these operators from a
different language.

2. Their expressive advantage is minimal - `x++` is not much shorter
than `x += 1`.

3. Swift already deviates from C in that the `=`, `+=` and other assignment-like
operations returns `Void` (for a number of reasons).  These operators are
inconsistent with that model.

4. Swift has powerful features that eliminate many of the common reasons you'd
use `++i` in a C-style for loop in other languages, so these are relatively
infrequently used in well-written Swift code.  These features include
the `for-in` loop, ranges, `enumerate`, `map`, etc.

5. Code that actually uses the result value of these operators is often
confusing and subtle to a reader/maintainer of code.  They encourage "overly
tricky" code which may be cute, but difficult to understand.

6. While Swift has well defined order of evaluation, any code that depended on
it (like `foo(++a, a++)`) would be undesirable even if it was well-defined.

7. These operators are applicable to relatively few types: integer and floating
point scalars, and iterator-like concepts. They do not apply to complex numbers,
matrices, etc.  

Finally, these fail the metric of "if we didn't already have these, would we add
them to Swift 3?"


## Proposed Approach

We should just drop these operators entirely.  In terms of roll-out, we should
deprecate them in the Spring Swift 2.x release (with a nice Fixit hint to cover
common cases), and remove them completely in Swift 3.


## Alternatives considered

Simplest alternative: we could keep them. More interesting to consider, we could
change these operators to return Void.  This solves some of the problems above,
but introduces a new question: once the result is gone, the difference between
the prefix and postfix form also vanishes.  Given that, we would have to pick 
between these unfortunate choices:

1) Keep both `x++` and `++x` in the language, even though they do the same
thing.

2) Drop one of `x++` or `++x`.  C++ programmers generally prefer the prefix
forms, but everyone else generally prefers the postfix forms.  Dropping either
one would be a significant deviation from C.

Despite considering these options carefully, they still don't justify the
complexity that the operators add to Swift.


```

Use the [historical research workflow](../../_context/historical-research.md) and verify historical claims against [this episode’s ledger](research.md).
