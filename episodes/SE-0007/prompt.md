# SE-0007 대본 작성 프롬프트 (Remove C-style for-loops with conditions and incrementers)

한국어 복제 음성은 제작 스킬의 말끝 검증을 적용합니다. 최종 재생 속도로 ‘다’의 모음과 다음 문장 앞의 쉼을 확인합니다.

아래 Swift Evolution 원문을 바탕으로 `episodes/SE-0007/script.json`을 작성해 주세요.

## 메타데이터
- **Proposal ID**: SE-0007
- **Episode Number**: 7
- **Title**: Remove C-style for-loops with conditions and incrementers
- **Status / Version**: implemented (Swift 3.0)
- **Authors**: Erica Sadun
- **URL**: https://github.com/swiftlang/swift-evolution/blob/main/proposals/0007-remove-c-style-for-loops.md
- **Next Episode Hint**: SE-0008 - Add a Lazy flatMap for Sequences of Optionals

## 작성 규칙

첫 커밋에 이미 채택됐다고 적혀 있으면 그 날짜를 결정일로 단정하지 마세요. 동시대 발언에서 실제 사용 사례를 찾아 누가 무엇을 지키려 했는지 대본에 담으세요. 포럼에 옮겨진 메일의 인용문은 원 발언자와 회신자를 구별하세요. 인물을 언급할 때는 해당 speech 자막에서 cue를 골라 장면의 people 배열에 영문 이름(name), 플랫폼과 @아이디(account), 공식 프로필 URL(profile), 당시 맡은 역할(role)을 기록하세요. 내레이션에서는 제안자가 바꾸려던 점과 토론자가 제시한 실제 사례나 우려를 해당 발언에 근거해 설명하세요. 출처와 사용 조건이 확인된 실제 사진은 에피소드의 audio/people에 저장하고 photo의 file, source, credit을 채우세요. 공동 저자는 각각 표시하고 설명란에 프로필과 사진 출처를 남기세요. 사진 출처는 직접 조사하세요. 수익화 영상에 쓸 수 있는지 확인되지 않으면 조사 결과를 기록하고 영문 이름과 계정만 표시하세요. 대본 작성 전에 공식 원문 최초판과 최종판, 변경 이력과 PR, 제안·리뷰 토론, 결정 공지, 구현과 출시 기록을 조사해 에피소드 폴더의 research.md에 날짜·발언자·근거 링크를 남기세요. 본편에서는 당시의 문제, 의견이 갈린 이유, 검토한 대안, 실제 수정과 최종 결정이 어떻게 이어졌는지 장면으로 설명하세요. 쇼츠에도 결정의 이유를 하나 담으세요. 예제 수정과 설계 변경, 당사자의 의견과 공식 결정, 채택 전 논쟁과 후속 논의를 구분하세요. 찾지 못한 기록은 조사 노트에 밝히고 대화를 창작하지 마세요.

제목과 설명은 Apple 시스템 서체, Swift 코드는 Menlo로 연출하세요. 작은 제안 번호, 버전 표기와 계정명은 Atkinson Hyperlegible Next를 사용하세요. korean-product-writing 원칙에 따라 한 문장에 한 가지를 설명하고 대상과 동작을 구체적으로 말하세요. 제안 당시 의도와 출시된 변경은 날짜가 있는 과거형으로, 현재 동작은 확인한 버전을 기준으로, 미출시 동작은 상태와 조건을 밝혀 쓰세요. RFC 2119의 의무·권고·선택 구분과 ASD-STE100의 명료성 원칙을 한국어 합니다체에 맞게 적용하세요. 영어는 뜻이 이어지는 짧은 영어 구절로 묶어 en 음성으로 합성하세요. 장 제목과 대사에서 막연한 ‘자리’ 대신 실제 번호, 행과 열, 코드의 역할을 쓰세요. 장 제목에는 누가 무엇을 했는지 드러내세요. 예를 들어 “제록스의 중국어 글꼴 개발”처럼 실제 작업을 쓰세요. 작성 후 pnpm lint:ko로 검사하세요. 제목에는 무엇이 어떻게 달라졌는지 동사로 쓰세요. 이름을 논의하는 장의 챕터 제목에는 화면에서 볼 식별자나 접두사를 넣으세요. 예를 들어 SE-0001은 “백틱이 사라졌다”입니다. 초보자부터 중급자까지 볼 수 있도록 전문 용어가 처음 들리는 장면에 termNotes를 넣으세요. term은 용어, meaning은 현재 코드에 맞춘 짧은 한글 풀이, cue는 해당 자막에서 그대로 가져온 구절입니다. 시리즈 이름은 “듣다 보면 잠이 오는 스위프트 에볼루션 훑어보기”입니다. 첫 화면의 badge와 썸네일 subheadline에 이 이름을 쓰세요. 늦은 밤 동료에게 이야기하듯 편안하게 읽고, 썸네일에는 그 편에서 달라진 점을 짧게 쓰세요. 첫 질문과 답 직후, 제안서 최초 기록·구현 기록·해당 Swift 버전과 정식 출시 시기를 history 장면으로 짧게 소개하세요. milestones 배열에 확인된 사건을 시간순으로 최대 3개 넣으세요. 각 항목은 date(표시할 날짜), event(사건), sourceUrl(공식 출처 URL)로 구성합니다. 제안서 이력과 공식 출시 발표로 확인한 날짜만 쓰고, 미출시 제안은 확인된 상태까지만 소개하세요. 첫 화면에 제목이 약속한 코드를 보여주고, 시청자가 눈으로 답을 찾을 수 있는 질문을 하나 던지세요. 코드가 바뀌는 지점에 강조와 설명을 맞추세요. 그 편의 코드가 실제로 다루는 대상을 화면에 보여주세요. 그리기 API라면 현재 점을 옮기는 호출과 선분을 추가해 그리는 호출의 결과를 구분하고, 변화가 해당 코드와 대사에 맞춰 나타나게 하세요. 친한 동료와 같은 코드를 보며 발견한 내용을 나누듯 쓰세요. 한국어 낭독문과 해당 자막은 모두 ‘다.’로 끝내세요. 진행자가 다음에 할 일은 ‘첫 호출로 돌아가 보겠습니다.’처럼 안내하세요. 화면에서 확인할 사실은 ‘첫 줄은 점 하나를 만듭니다.’처럼 현재형으로, 당시의 결정은 과거형으로 말하세요. 시청자가 답을 찾도록 코드에서 볼 단서를 한 가지 짚고 잠시 쉬세요. 삭제를 보여주는 첫 장면은 heading에 질문을 쓰고 codeReveal.parts에 한 줄의 코드를 순서대로 나누세요. 남길 부분은 문자열, 지울 부분은 {"remove":"문자"}입니다. 답이 들리는 단어로 새 speech 구간을 시작하고 그 caption 전체를 codeReveal.answerCue에 넣으세요. 오래전에 사라진 문법은 시청자가 처음 본다고 가정하세요. 도입에서 사용 시기를 표시하고 당시 선언과 구체적인 실행 결과를 먼저 보여준 뒤, 제안 당시의 쟁점으로 넘어가세요. 마지막에는 그 선언과 현재 가능한 호출을 함께 보여주세요. 본편과 쇼츠 모두 첫 화면에 코드를 띄우고 “오늘도 코드 한 줄을 함께 살펴보겠습니다.”로 시작하세요. 그 편에서 생각해 볼 문제 하나를 짚고 답을 보여주기 전에 한 박자 기다리세요. 끝에서는 첫 코드를 다시 보여주고 질문의 답과 제안의 의미를 연결하세요. 본편과 쇼츠의 마지막 대사는 제안서에 근거해 이 제안이 해결하려던 문제를 말해야 합니다. 채택 여부와 목표를 구분하세요. 마지막 대사가 끝나면 예제 코드를 잠시 남기세요. [시리즈 연출 근거](../../_context/editorial-direction.md)


1. **언어/톤**: 한국어 개발자 유튜브 스타일(친절하고 명쾌하며 실무 중심). 각 장면의 deliveryNote에는 가장 또렷하게 읽을 단어와 숨을 고를 지점을 한두 문장으로 쓰세요. 녹음 메모에서는 실제 들숨과 시청자가 코드를 볼 기다림을 구분하세요. 주어와 서술어는 한 호흡으로 이으세요. 코칭은 narration이나 speech.text에 넣지 마세요. 문장이 끝나면 다음 발화 전에 쉴 수 있도록 speech를 한 문장씩 나누세요. 종결음 ‘다’는 힘을 빼고 살짝 길게 내려놓으세요. 한 문장 안에서 코드만 따로 읽을 때는 불필요한 마침표를 넣지 마세요. 선택형 자막에는 원래 철자를 유지하세요. 화면에는 코드와 설명을 표시하고 내레이션 전문은 자막 파일에 담으세요. 한영 혼용 장면에는 speech 배열을 작성하세요. 각 구간의 caption을 순서대로 합치면 narration과 같아야 합니다. language는 ko 또는 en, text는 실제 낭독문입니다. 영어 제안 제목은 한 구절로 묶고, 한국어 문장 안의 약어나 버전은 문맥에 맞게 풀어 읽으세요. 예: {"language":"en","caption":"indexOf","text":"index of"}, {"language":"ko","caption":"API를 호출합니다.","text":"에이피아이를 호출합니다."}. 코드의 구두점은 의미가 있을 때만 읽으세요. shortNarration을 따로 쓰면 shortSpeech도 별도로 작성하세요. 각 대사의 등장 대상과 순서를 direction.stages에 짧은 표기 1~3개로 쓰세요. 코드에 초점을 맞출 때 direction.panel에 code, codeBefore, codeAfter 중 실제 패널을 쓰고 direction.lines에 1부터 시작하는 줄 번호를 적으세요.
2. **16:9 일반 영상 (`scenes`)**:
   - 5~7개 씬 구성 권장 (`intro` -> `history` -> `problem` -> `code-compare` -> `code-focus` -> `key-points` -> `outro`).
   - 총 나레이션 길이 1.5~3.5분 분량 (한국어 약 450~1,100자).
   - 각 `codeBefore` / `codeAfter` / `code` 블록은 1920x1080 화면에서 한눈에 읽히도록 3~12줄 이내로 간결하게 다듬기.
   - 장면과 설명 그림에 등장·퇴장 전환을 두세요. 기존 코드나 도표가 다음 장면에도 보이면 sceneTransition에 shared-layout을 지정하세요. 기존 요소를 다음 위치와 크기까지 이어서 움직이고, 새 요소는 기존 요소와 맞닿은 가장자리 뒤에서 드러내세요. 그림의 바탕을 먼저 보여 주고, 화자가 지칭하는 요소를 차례로 드러내세요. 인사와 배경 설명에서는 코드를 중립 상태로 표시하세요. 코드가 바뀌면 공통 글자를 새 위치로 옮기세요. 화자가 처음 지칭한 글자 뒤에만 배경을 천천히 넣으세요. 같은 표기를 다시 지칭하면 글자만 살짝 키웠다가 원래 크기로 돌리세요. 본편과 쇼츠의 언급 순서는 따로 기록하세요. direction.references의 발화 시점은 최종 음성에서 확인해 입력하며, 녹음 전에는 초 단위를 추측하지 마세요.
   - 녹음 후 각 references 항목의 targets에 실제 코드의 줄 번호(line)와 정확한 표기(text)를 지정하세요.
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
6. **검증**: 작성 후 `pnpm evo validate SE-0007` 로 스키마 통과 확인.

## 원문 Proposal (`proposal.md`)

```markdown
# Remove C-style for-loops with conditions and incrementers

* Proposal: [SE-0007](0007-remove-c-style-for-loops.md)
* Author: [Erica Sadun](https://github.com/erica)
* Review Manager: [Doug Gregor](https://github.com/DougGregor)
* Status: **Implemented (Swift 3.0)**
* Decision Notes: [Rationale](https://forums.swift.org/t/accepted-se-0007-remove-c-style-for-loops-with-conditions-and-incrementers/512)
* Bugs: [SR-226](https://bugs.swift.org/browse/SR-226), [SR-227](https://bugs.swift.org/browse/SR-227)

## Introduction

The C-style `for-loop` appears to be a mechanical carry-over from C rather than a
genuinely Swift-specific construct. It is rarely used and not very Swift-like. 

More Swift-typical construction is already available with `for-in`
statements and `stride`. Removing for loops would simplify the language and starve the
most common use-points for `--` and `++`, which are already due to be eliminated from the
language.

The value of this construct is limited and I believe its removal should be seriously considered.

This proposal was discussed on the Swift Evolution list in the [C-style For Loops](https://forums.swift.org/t/c-style-for-loops/31) thread and reviewed in the [\[Review\] Remove C-style for-loops with conditions	and incrementers](https://forums.swift.org/t/review-remove-c-style-for-loops-with-conditions-and-incrementers/255) thread.

## Advantages of For Loops

Swift design supported a shallow learning curve using familiar constants and control
structures. The `for-loop` mimics C and limits the effort needed to master this control flow.

## Disadvantages of For Loops

1. Both `for-in` and `stride` provide equivalent behavior using Swift-coherent approaches 
   without being tied to legacy terminology. 
1. There is a distinct expressive disadvantage in using `for-loops` compared to `for-in` 
   in succinctness
1. `for-loop` implementations do not lend themselves to use with collections and other core Swift types.
1. The `for-loop` encourages use of unary incrementors and decrementors, which will be
   soon removed from the language.
1. The semi-colon delimited declaration offers a steep learning curve from users arriving
   from non C-like languages
1. If the `for-loop` did not exist, I doubt it would be considered for inclusion in Swift 3.

## Proposed Approach

I suggest that the for-loop be deprecated in Swift 2.x and removed entirely in Swift 3, with coverage removed from the Swift Programming Language to match the revisions in the current 2.2 update.

## Alternatives considered

Not removing `for-loop` from Swift, losing the opportunity to streamline the language
and discard an unneeded control flow item.

## Impact on existing code

A search of the Apple Swift codebase suggests this feature is rarely used. Community members of the Swift-Evolution mail list confirm that it does not feature in many pro-level apps and can be worked around for those few times when `for-loop`s do pop up. For example:

```swift
char *blk_xor(char *dst, const char *src, size_t len)
{
 const char *sp = src;
 for (char *dp = dst; sp - src < len; sp++, dp++)
   *dp ^= *sp;
 return dst;
}
```

versus


```swift
func blk_xor(dst: UnsafeMutablePointer<CChar>, src:
UnsafePointer<CChar>, len: Int) -> UnsafeMutablePointer<CChar> {
   for i in 0..<len {
       dst[i] ^= src[i]
   }
   return dst
}
```

A search of github's Swift gists suggests the approach is used primarily by those new to the language with minimal language skills and is abandoned as language mastery is achieved.

For example:

```swift
for var i = 0 ; i < 10 ; i++ {
    print(i)
}
```

and 

```swift
var array = [10,20,30,40,50]
for(var i=0 ; i < array.count ;i++){
    println("array[i] \(array[i])")
}
```

## Community Responses
* "I am certainly open to considering dropping the C-style for loop.  IMO, it is a rarely used feature of Swift that doesn’t carry its weight.  Many of the reasons to remove them align with the rationale for removing -- and ++. " -- Chris Lattner, clattner@apple.com
* "My intuition *completely* agrees that Swift no longer needs C-style for loops. We have richer, better-structured looping and functional algorithms. That said, one bit of data I’d like to see is how often C-style for loops are actually used in Swift. It’s something a quick crawl through Swift sources on GitHub could establish. If the feature feels anachronistic and is rarely used, it’s a good candidate for removal." -- Douglas Gregnor, dgregor@apple.com
* "Every time I’ve used a C-style for loop in Swift it was because I forgot that .indices existed. If it’s removed, a fixme pointing that direction might be useful." -- David Smith, david_smith@apple.com
* "For what it's worth we don't have a single C style for loop in the Lyft codebase." -- Keith Smiley, keithbsmiley@gmail.com
* "Just checked; ditto Khan Academy." -- Andy Matsuchak, andy@andymatuschak.org
* "We’ve developed a number of Swift apps for various clients over the past year and have not needed C style for loops either." -- Eric Chamberlain, eric.chamberlain@arctouch.com
* "Every time I've tried to use a C-style for loop, I've ended up switching to a while loop because my iteration variable ended up having the wrong type (e.g. having an optional type when the value must be non-optional for the body to execute). The Postmates codebase contains no instances of C-style for loops in Swift." -- Lily Ballard, lily@sb.org
* "I found a couple of cases of them in my codebase, but they were trivially transformed into “proper” Swift-style for loops that look better anyway. If it were a vote, I’d vote for eliminating C-style." -- Sean Heber, sean@fifthace.com


```
