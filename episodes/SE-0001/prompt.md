# SE-0001 대본 작성 프롬프트 (Allow (most) keywords as argument labels)

아래 Swift Evolution 원문을 바탕으로 `episodes/SE-0001/script.json`을 작성해 주세요.

## 메타데이터
- **Proposal ID**: SE-0001
- **Episode Number**: 1
- **Title**: Allow (most) keywords as argument labels
- **Status / Version**: implemented (Swift 2.2)
- **Authors**: Doug Gregor
- **URL**: https://github.com/swiftlang/swift-evolution/blob/main/proposals/0001-keywords-as-argument-labels.md
- **Next Episode Hint**: SE-0002 - Removing currying `func` declaration syntax

## 작성 규칙

korean-product-writing 원칙에 따라 한 문장에 한 가지를 설명하고 대상과 동작을 구체적으로 말하세요. 제안 당시 의도와 출시된 변경은 날짜가 있는 과거형으로, 현재 동작은 확인한 버전을 기준으로, 미출시 동작은 상태와 조건을 밝혀 쓰세요. RFC 2119의 의무·권고·선택 구분과 ASD-STE100의 명료성 원칙을 한국어 해요체에 맞게 적용하세요. 영어는 뜻이 이어지는 짧은 영어 구절로 묶어 en 음성으로 합성하세요. 제목에는 무엇이 어떻게 달라졌는지 동사로 쓰세요. 예를 들어 SE-0001은 “백틱이 사라졌다”입니다. 초보자부터 중급자까지 볼 수 있도록 전문 용어가 처음 들리는 장면에 termNotes를 넣으세요. term은 용어, meaning은 현재 코드에 맞춘 짧은 한글 풀이, cue는 해당 자막에서 그대로 가져온 구절입니다. 시리즈 이름은 “듣다 보면 잠이 오는 스위프트 에볼루션 훑어보기”입니다. 첫 화면의 badge와 썸네일 subheadline에 이 이름을 쓰세요. 늦은 밤 동료에게 이야기하듯 편안하게 읽고, 썸네일에는 그 편에서 달라진 점을 짧게 쓰세요. 첫 질문과 답 직후, 제안서 최초 기록·구현 기록·해당 Swift 버전과 정식 출시 시기를 history 장면으로 짧게 소개하세요. milestones 배열에 확인된 사건을 시간순으로 최대 3개 넣으세요. 각 항목은 date(표시할 날짜), event(사건), sourceUrl(공식 출처 URL)로 구성합니다. 제안서 이력과 공식 출시 발표로 확인한 날짜만 쓰고, 미출시 제안은 확인된 상태까지만 소개하세요. 첫 화면에 제목이 약속한 코드를 보여주고, 시청자가 눈으로 답을 찾을 수 있는 질문을 하나 던지세요. 코드가 바뀌는 지점에 강조와 설명을 맞추세요. 친한 동료와 같은 코드를 보며 발견한 내용을 나누듯 쓰세요. 예를 들어 “두 개, 보이죠?”로 시선을 맞추고 “쏙 빠져요.”로 짧게 받으세요. 해요체를 기본으로 하되 매번 확인을 요구하거나 감탄사를 덧붙이지 마세요. 삭제를 보여주는 첫 장면은 heading에 질문을 쓰고 codeReveal.parts에 한 줄의 코드를 순서대로 나누세요. 남길 부분은 문자열, 지울 부분은 {"remove":"문자"}입니다. 답이 들리는 단어로 새 speech 구간을 시작하고 그 caption 전체를 codeReveal.answerCue에 넣으세요. [시리즈 연출 근거](../../_context/editorial-direction.md)

1. **언어/톤**: 한국어 개발자 유튜브 스타일(친절하고 명쾌하며 실무 중심). 각 장면의 deliveryNote에는 가장 또렷하게 읽을 단어와 숨을 고를 지점을 한두 문장으로 쓰세요. 녹음 메모에서는 실제 들숨과 시청자가 코드를 볼 기다림을 구분하세요. 주어와 서술어는 한 호흡으로 이으세요. 코칭은 narration이나 speech.text에 넣지 마세요. 문장이 끝나면 다음 발화 전에 쉴 수 있도록 speech를 한 문장씩 나누세요. 한 문장 안에서 코드만 따로 읽을 때는 불필요한 마침표를 넣지 마세요. 화면과 자막(narration)에는 원래 철자를 유지하세요. 한영 혼용 장면에는 speech 배열을 작성하세요. 각 구간의 caption을 순서대로 합치면 narration과 같아야 합니다. language는 ko 또는 en, text는 실제 낭독문입니다. 영어 제안 제목은 한 구절로 묶고, 한국어 문장 안의 약어나 버전은 문맥에 맞게 풀어 읽으세요. 예: {"language":"en","caption":"indexOf","text":"index of"}, {"language":"ko","caption":"API를 호출합니다.","text":"에이피아이를 호출합니다."}. 코드의 구두점은 의미가 있을 때만 읽으세요. shortNarration을 따로 쓰면 shortSpeech도 별도로 작성하세요.
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
6. **검증**: 작성 후 `pnpm se validate SE-0001` 로 스키마 통과 확인.

## 원문 Proposal (`proposal.md`)

```markdown
# Allow (most) keywords as argument labels

* Proposal: [SE-0001](0001-keywords-as-argument-labels.md)
* Author: [Doug Gregor](https://github.com/DougGregor)
* Status: **Implemented (Swift 2.2)**
* Bug: [SR-344](https://bugs.swift.org/browse/SR-344)

## Introduction

Argument labels are an important part of the interface of a Swift function, describing what particular arguments to the function do and improving readability. Sometimes, the most natural label for an argument coincides with a language keyword, such as `in`, `repeat`, or `defer`. Such keywords should be allowed as argument labels, allowing better expression of these interfaces.

## Motivation

In some functions, the best argument label for a particular parameter
happens to coincide with a language keyword. For example, consider a
module-scope function that finds the index of a particular value in a
collection. A natural name for this would be `indexOf(_:in:)`:

	indexOf(value, in: collection)

However, because `in` is a keyword, one would actually have to use backticks to escape the `in`, e.g.:

	indexOf(value, `in`: collection)

When defining new APIs in Swift, authors will tend to pick other
non-keyword words (e.g., `within` for this example), even if they
aren't ideal. However, this issue also comes up when importing
Objective-C APIs under the "omit needless words" heuristics, requiring
escaping to use those APIs. For example:

	event.touchesMatching([.Began, .Moved], `in`: view)
	NSXPCInterface(`protocol`: SomeProtocolType.Protocol)


## Proposed solution

Allow the use of all keywords except `inout`, `var`, and `let` as argument labels. This affects the grammar in three places:

* Call expressions, such as the examples above. Here, we have no grammatic ambiguities, because "<keyword> \`:\`" does not appear in any grammar production within a parenthesized expression list. This is, by far, the most important case.

* Function/subscript/initializer declarations: aside from the three exclusions above, there is no ambiguity here because the keyword will always be followed by an identifier, ‘:’, or ‘_’. For example:

```swift
func touchesMatching(phase: NSTouchPhase, in view: NSView?) -> Set<NSTouch>
```

  Keywords that introduce or modify a parameter—-currently just
"inout", "let", and "var"—-will need to retain their former
meanings. If we invent an API that uses such keywords, they will still
need to be back-ticked:

```swift
func addParameter(name: String, `inout`: Bool)
```

* Function types: these are actually easier than #2, because the parameter name is always followed by a ‘:’:

```swift
(NSTouchPhase, in: NSView?) -> Set<NSTouch>
(String, inout: Bool) -> Void
```

## Impact on existing code

This functionality is strictly additive, and does not break any existing
code: it only makes some previously ill-formed code well-formed, and
does not change the behavior of any well-formed code.

## Alternatives considered

The primary alternative here is to do nothing: Swift APIs will
continue to avoid keywords for argument labels, even when they are the
most natural word for the label, and imported APIs will either
continue to use backticks or will need to be renamed. This alternative
leaves a large number of imported APIs (nearly 200) requiring either
some level of renaming of the API or backticks at the call site.

A second alternative is to focus on `in` itself, which is by far the
most common keyword argument in imported APIs. In a brief survey of
imported APIs, `in` accounted for 90% of the conflicts with existing
keywords. Moreover, the keyword `in` is only used in two places in the
Swift grammar--for loops and closures--so it could be made
context-sensitive. However, this solution is somewhat more complicated
(because it requires more context-sensitive keyword parsing) and less
general.


```

연혁 출처는 [SE-0001 제작 저널](../../_context/production-journal.md)을 참조하세요.

Use the Korean ending release check in the project production skill. Compare the final export at its delivery speed with the approved two-line sample.

For noise review, select a quiet passage and a sentence ending from the same take. Use the voice-only comparison in the narration guide.

For opening-only hiss, compare the isolated first sentence to the approved opening retake before assembling the episode.

Use the series opening lead-in and listen to the first intended consonant at final playback speed.
