# SE-0005 대본 작성 프롬프트 (Better Translation of Objective-C APIs Into Swift)

한국어 복제 음성은 제작 스킬의 말끝 검증을 적용합니다. 최종 재생 속도로 ‘다’의 모음과 다음 문장 앞의 쉼을 확인합니다.

아래 Swift Evolution 원문을 바탕으로 `episodes/SE-0005/script.json`을 작성해 주세요.

## 메타데이터
- **Proposal ID**: SE-0005
- **Episode Number**: 5
- **Title**: Better Translation of Objective-C APIs Into Swift
- **Status / Version**: implemented (Swift 3.0)
- **Authors**: Doug Gregor, Dave Abrahams
- **URL**: https://github.com/swiftlang/swift-evolution/blob/main/proposals/0005-objective-c-name-translation.md
- **Next Episode Hint**: SE-0006 - Apply API Guidelines to the Standard Library

## 작성 규칙

장면과 설명 카드에는 등장과 퇴장 전환을 쓰세요. 기존 코드나 도표가 다음 장면에도 보이면 sceneTransition에 shared-layout을 지정하세요. 기존 요소를 다음 위치와 크기까지 이어서 움직이고, 새 요소는 기존 요소와 맞닿은 가장자리 뒤에서 드러내세요. 그리기 장면은 빈 종이, 시작점, 연필 순서로 열고 각 동작을 가리키는 대사에 맞추세요. 코드가 바뀔 때는 같은 글자가 새 위치로 이동하고, 추가·삭제되는 글자는 해당 자리에서 나타나거나 사라지게 하세요. 처음 지칭할 때는 해당 글자 뒤에만 배경을 천천히 넣으세요. 같은 표기를 다시 지칭하면 글자만 살짝 키웠다가 원래 크기로 돌리세요. 본편과 쇼츠의 언급 순서는 따로 기록하세요. 인사와 배경 설명에서는 코드 줄을 중립 상태로 두세요. 각 대사의 연출에 `references`를 기록하고, 각 references 항목의 targets에 줄 번호와 정확한 코드 조각을 넣고, 발화 시점에 맞춰 강조하세요. 한 문장에서 두 줄을 차례로 지칭하면 각각의 시점을 기록하세요. 음성을 다시 만들면 단어 시점도 다시 확인하세요.

첫 커밋에 이미 채택됐다고 적혀 있으면 그 날짜를 결정일로 단정하지 마세요. 동시대 발언에서 실제 사용 사례를 찾아 누가 무엇을 지키려 했는지 대본에 담으세요. 포럼에 옮겨진 메일의 인용문은 원 발언자와 회신자를 구별하세요. 인물을 언급할 때는 해당 speech 자막에서 cue를 골라 장면의 people 배열에 영문 이름(name), 플랫폼과 @아이디(account), 공식 프로필 URL(profile), 당시 맡은 역할(role)을 기록하세요. 내레이션에서는 제안자가 바꾸려던 점과 토론자가 제시한 실제 사례나 우려를 해당 발언에 근거해 설명하세요. 출처와 사용 조건이 확인된 실제 사진은 에피소드의 audio/people에 저장하고 photo의 file, source, credit을 채우세요. 공동 저자는 각각 표시하고 설명란에 프로필과 사진 출처를 남기세요. 사진 출처는 직접 조사하세요. 수익화 영상에 쓸 수 있는지 확인되지 않으면 조사 결과를 기록하고 영문 이름과 계정만 표시하세요. 대본 작성 전에 공식 원문 최초판과 최종판, 변경 이력과 PR, 제안·리뷰 토론, 결정 공지, 구현과 출시 기록을 조사해 에피소드 폴더의 research.md에 날짜·발언자·근거 링크를 남기세요. 본편에서는 당시의 문제, 의견이 갈린 이유, 검토한 대안, 실제 수정과 최종 결정이 어떻게 이어졌는지 장면으로 설명하세요. 쇼츠에도 결정의 이유를 하나 담으세요. 예제 수정과 설계 변경, 당사자의 의견과 공식 결정, 채택 전 논쟁과 후속 논의를 구분하세요. 찾지 못한 기록은 조사 노트에 밝히고 대화를 창작하지 마세요.

제목과 설명은 Apple 시스템 서체, Swift 코드는 Menlo로 연출하세요. 작은 제안 번호, 버전 표기와 계정명은 Atkinson Hyperlegible Next를 사용하세요. korean-product-writing 원칙에 따라 한 문장에 한 가지를 설명하고 대상과 동작을 구체적으로 말하세요. 제안 당시 의도와 출시된 변경은 날짜가 있는 과거형으로, 현재 동작은 확인한 버전을 기준으로, 미출시 동작은 상태와 조건을 밝혀 쓰세요. RFC 2119의 의무·권고·선택 구분과 ASD-STE100의 명료성 원칙을 한국어 합니다체에 맞게 적용하세요. 영어는 뜻이 이어지는 짧은 영어 구절로 묶어 en 음성으로 합성하세요. 제목에는 무엇이 어떻게 달라졌는지 동사로 쓰세요. 이름을 논의하는 장의 챕터 제목에는 화면에서 볼 식별자나 접두사를 넣으세요. 예를 들어 SE-0001은 “백틱이 사라졌다”입니다. 초보자부터 중급자까지 볼 수 있도록 전문 용어가 처음 들리는 장면에 termNotes를 넣으세요. term은 용어, meaning은 현재 코드에 맞춘 짧은 한글 풀이, cue는 해당 자막에서 그대로 가져온 구절입니다. 시리즈 이름은 “듣다 보면 잠이 오는 스위프트 에볼루션 훑어보기”입니다. 첫 화면의 badge와 썸네일 subheadline에 이 이름을 쓰세요. 늦은 밤 동료에게 이야기하듯 편안하게 읽고, 썸네일에는 그 편에서 달라진 점을 짧게 쓰세요. 첫 질문과 답 직후, 제안서 최초 기록·구현 기록·해당 Swift 버전과 정식 출시 시기를 history 장면으로 짧게 소개하세요. milestones 배열에 확인된 사건을 시간순으로 최대 3개 넣으세요. 각 항목은 date(표시할 날짜), event(사건), sourceUrl(공식 출처 URL)로 구성합니다. 제안서 이력과 공식 출시 발표로 확인한 날짜만 쓰고, 미출시 제안은 확인된 상태까지만 소개하세요. 첫 화면에 제목이 약속한 코드를 보여주고, 시청자가 눈으로 답을 찾을 수 있는 질문을 하나 던지세요. 코드가 바뀌는 지점에 강조와 설명을 맞추세요. 그 편의 코드가 실제로 다루는 대상을 화면에 보여주세요. 그리기 API라면 현재 점을 옮기는 호출과 선분을 추가해 그리는 호출의 결과를 구분하고, 변화가 해당 코드와 대사에 맞춰 나타나게 하세요. 친한 동료와 같은 코드를 보며 발견한 내용을 나누듯 쓰세요. 한국어 낭독문과 해당 자막은 모두 ‘다.’로 끝내세요. 진행자가 다음에 할 일은 ‘첫 호출로 돌아가 보겠습니다.’처럼 안내하세요. 화면에서 확인할 사실은 ‘첫 줄은 점 하나를 만듭니다.’처럼 현재형으로, 당시의 결정은 과거형으로 말하세요. 시청자가 답을 찾도록 코드에서 볼 단서를 한 가지 짚고 잠시 쉬세요. 삭제를 보여주는 첫 장면은 heading에 질문을 쓰고 codeReveal.parts에 한 줄의 코드를 순서대로 나누세요. 남길 부분은 문자열, 지울 부분은 {"remove":"문자"}입니다. 답이 들리는 단어로 새 speech 구간을 시작하고 그 caption 전체를 codeReveal.answerCue에 넣으세요. 오래전에 사라진 문법은 시청자가 처음 본다고 가정하세요. 도입에서 사용 시기를 표시하고 당시 선언과 구체적인 실행 결과를 먼저 보여준 뒤, 제안 당시의 쟁점으로 넘어가세요. 마지막에는 그 선언과 현재 가능한 호출을 함께 보여주세요. 본편과 쇼츠 모두 첫 화면에 코드를 띄우고 “오늘도 코드 한 줄을 함께 살펴보겠습니다.”로 시작하세요. 그 편에서 생각해 볼 문제 하나를 짚고 답을 보여주기 전에 한 박자 기다리세요. 끝에서는 첫 코드를 다시 보여주고 질문의 답과 제안의 의미를 연결하세요. 본편과 쇼츠의 마지막 대사는 제안서에 근거해 이 제안이 해결하려던 문제를 말해야 합니다. 채택 여부와 목표를 구분하세요. 마지막 대사가 끝나면 예제 코드를 잠시 남기세요. [시리즈 연출 근거](../../_context/editorial-direction.md)

1. **언어/톤**: 한국어 개발자 유튜브 스타일(친절하고 명쾌하며 실무 중심). 각 장면의 deliveryNote에는 가장 또렷하게 읽을 단어와 숨을 고를 지점을 한두 문장으로 쓰세요. 녹음 메모에서는 실제 들숨과 시청자가 코드를 볼 기다림을 구분하세요. 주어와 서술어는 한 호흡으로 이으세요. 코칭은 narration이나 speech.text에 넣지 마세요. 문장이 끝나면 다음 발화 전에 쉴 수 있도록 speech를 한 문장씩 나누세요. 종결음 ‘다’는 힘을 빼고 살짝 길게 내려놓으세요. 한 문장 안에서 코드만 따로 읽을 때는 불필요한 마침표를 넣지 마세요. 선택형 자막에는 원래 철자를 유지하세요. 화면에는 코드와 설명을 표시하고 내레이션 전문은 자막 파일에 담으세요. 한영 혼용 장면에는 speech 배열을 작성하세요. 각 구간의 caption을 순서대로 합치면 narration과 같아야 합니다. language는 ko 또는 en, text는 실제 낭독문입니다. 영어 제안 제목은 한 구절로 묶고, 한국어 문장 안의 약어나 버전은 문맥에 맞게 풀어 읽으세요. 예: {"language":"en","caption":"indexOf","text":"index of"}, {"language":"ko","caption":"API를 호출합니다.","text":"에이피아이를 호출합니다."}. 코드의 구두점은 의미가 있을 때만 읽으세요. shortNarration을 따로 쓰면 shortSpeech도 별도로 작성하세요. 각 대사의 등장 대상과 순서를 direction.stages에 짧은 표기 1~3개로 쓰세요. 코드에 초점을 맞출 때 direction.panel에 code, codeBefore, codeAfter 중 실제 패널을 쓰고 direction.lines에 1부터 시작하는 줄 번호를 적으세요.
2. **16:9 일반 영상 (`scenes`)**:
   - 5~7개 씬 구성 권장 (`intro` -> `history` -> `problem` -> `code-compare` -> `code-focus` -> `key-points` -> `outro`).
   - 총 나레이션 길이 1.5~3.5분 분량 (한국어 약 450~1,100자).
   - 각 `codeBefore` / `codeAfter` / `code` 블록은 1920x1080 화면에서 한눈에 읽히도록 3~12줄 이내로 간결하게 다듬기.
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
6. **검증**: 작성 후 `pnpm evo validate SE-0005` 로 스키마 통과 확인.

## 원문 Proposal (`proposal.md`)

```markdown
# Better Translation of Objective-C APIs Into Swift

* Proposal: [SE-0005](0005-objective-c-name-translation.md)
* Authors: [Doug Gregor](https://github.com/DougGregor), [Dave Abrahams](https://github.com/dabrahams)
* Review Manager: [Doug Gregor](https://github.com/DougGregor)
* Status: **Implemented (Swift 3.0)**
* Decision Notes: [Rationale](https://forums.swift.org/t/accepted-with-modification-se-0005-better-translation-of-objective-c-apis-into-swift/1668)

## Reviewer notes

This review is part of a group of three related reviews, running
concurrently:

* [SE-0023 API Design Guidelines](0023-api-guidelines.md)
  ([Review](https://forums.swift.org/t/review-se-0023-api-design-guidelines/1162))
* [SE-0006 Apply API Guidelines to the Standard Library](0006-apply-api-guidelines-to-the-standard-library.md)
  ([Review](https://forums.swift.org/t/review-se-0006-apply-api-guidelines-to-the-standard-library/1163))
* [SE-0005 Better Translation of Objective-C APIs Into Swift](0005-objective-c-name-translation.md)
  ([Review](https://forums.swift.org/t/review-se-0005-better-translation-of-objective-c-apis-into-swift/1164))

These reviews are running concurrently because they interact strongly
(e.g., an API change in the standard library will correspond to a
particular guideline, or an importer rule implements a particular
guideline, etc.). Because of these interactions, and to keep
discussion manageable, we ask that you:

* **Please get a basic understanding of all three documents** before
  posting review commentary
* **Please post your review of each individual document in response to
  its review announcement**. It's okay (and encouraged) to make
  cross-references between the documents in your review where it helps
  you make a point.

## Introduction

This proposal describes how we can improve Swift's "Clang Importer", which is responsible for mapping C and Objective-C APIs into Swift, to translate the names of Objective-C functions, types, methods, properties, etc. into names that more closely align with the [Swift API Design Guidelines][api-design-guidelines] being developed as part of Swift 3. Our approach focuses on the differences between the Objective-C [Coding Guidelines for Cocoa][objc-cocoa-guidelines] and the Swift API Design Guidelines, using some simple linguistic analysis to aid the automatic translation from Objective-C names to more "Swifty" names.

The results of this transformation can be seen in the [Swift 3 API Guidelines Review](https://github.com/apple/swift-3-api-guidelines-review) repository, which contains Swift projections of Objective-C APIs in Swift 2 ([`swift-2` branch](https://github.com/apple/swift-3-api-guidelines-review/tree/swift-2)) and Swift 3 ([`swift-3` branch](https://github.com/apple/swift-3-api-guidelines-review/tree/swift-3)) along with partially-migrated sample code. One can also see the overall changes by [comparing the two branches](https://github.com/apple/swift-3-api-guidelines-review/compare/swift-2...swift-3).

## Motivation

The Objective-C [Coding Guidelines for Cocoa][objc-cocoa-guidelines]
provide a framework for creating clear, consistent APIs in
Objective-C, where they work extraordinarily well. However, Swift is a
different language: in particular, it is strongly typed and provides
type inference, generics, and overloading. As a result, Objective-C
APIs that feel right in Objective-C can feel wordy when used in
Swift. For example:

```swift
let content = listItemView.text.stringByTrimmingCharactersInSet(
   NSCharacterSet.whitespaceAndNewlineCharacterSet())
```

The APIs used here follow the Objective-C guidelines. A more "Swifty"
version of the same code might instead look like this:

```swift
let content = listItemView.text.trimming(.whitespaceAndNewlines)
```

The latter example more closely adheres to the [Swift API Design
Guidelines][api-design-guidelines], in particular, omitting "needless"
words that restate the types already enforced by the compiler (view,
string, character set, etc.). The goal of this proposal is to make
imported Objective-C feel more "Swifty", providing a more fluid
experience for Swift programmers using Objective-C APIs.

The solution in this proposal applies equally to the Objective-C
frameworks (e.g., all of Cocoa and Cocoa Touch) and any Objective-C
APIs that are available to Swift in mix-and-match projects. Note that
the [Swift core libraries][core-libraries]
reimplement the APIs of Objective-C frameworks, so any API changes to
those frameworks (Foundation, XCTest, etc.) will be reflected in the
Swift 3 implementations of the core libraries.

## Proposed solution

The proposed solution involves identifying the differences between the
Objective-C [Coding Guidelines for Cocoa][objc-cocoa-guidelines] and
the [Swift API Design Guidelines][api-design-guidelines] to build a
set of transformations that map from the former to the latter based on
the guidelines themselves and other observed conventions in
Objective-C. This is an extension of other heuristics in the Clang
importer that translate names, e.g., the mapping of global enum
constants into Swift's cases (which strips common prefixes from the
enum constant names) and the mapping from Objective-C factory methods
(e.g., `+[NSNumber numberWithBool:]`) to Swift initializers
(`NSNumber(bool: true)`).

The heuristics described in this proposal will require iteration,
tuning, and experimentation across a large body of Objective-C APIs to
get right. Moreover, it will not be perfect: some APIs will
undoubtedly end up being less clear in Swift following this
translation than they had been before. Therefore, the goal is to make
the vast majority of imported Objective-C APIs feel more "Swifty", and
allow the authors of Objective-C APIs that end up being less clear to
address those problems on a per-API basis via annotation within the
Objective-C headers.

The proposed solution involves several related changes to the Clang importer:

1. **Generalize the applicability of the `swift_name` attribute**: The
Clang `swift_name` attribute currently allows limited renaming of enum
cases and factory methods. It should be generalized to allow arbitrary
renaming of any C or Objective-C entity when it is imported into
Swift, allowing authors of C or Objective-C APIs more fine-grained
control over the process.

2. **Prune redundant type names**: The Objective-C Coding Guidelines
   for Cocoa require that the method describe each argument. When
   those descriptions restate the type of the corresponding parameter,
   the name conflicts with the
   [omit needless words](https://swift.org/documentation/api-design-guidelines#omit-needless-words)
   guideline for Swift APIs. Therefore, we prune these type names
   during import.

3. **Add default arguments**: In cases where the Objective-C API strongly hints at the need for a default argument, infer the default argument when importing the API. For example, an option-set parameter can be defaulted to `[]`.

4. **Add first argument labels**: If the first parameter of a method
   is defaulted,
   [it should have an argument label](https://swift.org/documentation/api-design-guidelines#first-argument-label). Determine
   a first argument label for that method.

5. **Prepend "is" to Boolean properties**:
   [Boolean properties should read as assertions on the receiver](https://swift.org/documentation/api-design-guidelines#boolean-assertions),
   but the Objective-C Coding Guidelines for Cocoa
   [prohibit the use of "is" on properties](https://developer.apple.com/library/mac/documentation/Cocoa/Conceptual/CodingGuidelines/Articles/NamingIvarsAndTypes.html#//apple_ref/doc/uid/20001284-BAJGIIJE). Import
   such properties with "is" prepended.

6. **Lowercase values**: The Swift API Design Guidelines have non-type
declarations lowercased. Lowercase non-prefixed values whenever they
are imported, including enumerators (whether they end up in Swift as
enum cases or option sets) and any other properties/functions (e.g., a
property named `URLHandler` will be lowercased to `urlHandler`).

7. **Adopt Comparable to classes that implement** `compare(_:) -> NSComparisonResult`: The objective-c classes that implement compare all have declared a capability of being compared in an ordered manner. `Comparable` formalizes this declaration into an implementable operator by the import process.

To get a sense of what these transformations do, consider a portion of
the imported `UIBezierPath` API in Swift 2:

```swift
class UIBezierPath : NSObject, NSCopying, NSCoding {
  convenience init(ovalInRect: CGRect)
  func moveToPoint(_: CGPoint)
  func addLineToPoint(_: CGPoint)
  func addCurveToPoint(_: CGPoint, controlPoint1: CGPoint, controlPoint2: CGPoint)
  func addQuadCurveToPoint(_: CGPoint, controlPoint: CGPoint)
  func appendPath(_: UIBezierPath)
  func bezierPathByReversingPath() -> UIBezierPath
  func applyTransform(_: CGAffineTransform)
  var empty: Bool { get }
  func containsPoint(_: CGPoint) -> Bool
  func fillWithBlendMode(_: CGBlendMode, alpha: CGFloat)
  func strokeWithBlendMode(_: CGBlendMode, alpha: CGFloat)
  func copyWithZone(_: NSZone) -> AnyObject
  func encodeWithCoder(_: NSCoder)
}
```

And the same API imported under our current, experimental implementation of this proposal:

```swift
class UIBezierPath : NSObject, NSCopying, NSCoding {
  convenience init(ovalIn rect: CGRect)
  func move(to point: CGPoint)
  func addLine(to point: CGPoint)
  func addCurve(to endPoint: CGPoint, controlPoint1 controlPoint1: CGPoint, controlPoint2 controlPoint2: CGPoint)
  func addQuadCurve(to endPoint: CGPoint, controlPoint controlPoint: CGPoint)
  func append(_ bezierPath: UIBezierPath)
  func reversing() -> UIBezierPath
  func apply(_ transform: CGAffineTransform)
  var isEmpty: Bool { get }
  func contains(_ point: CGPoint) -> Bool
  func fill(_ blendMode: CGBlendMode, alpha alpha: CGFloat)
  func stroke(_ blendMode: CGBlendMode, alpha alpha: CGFloat)
  func copy(with zone: NSZone = nil) -> AnyObject
  func encode(with aCoder: NSCoder)
}
```

In the latter case, a number of words that restated type information
in the original APIs have been pruned. The result is closer to
following the Swift API Design Guidelines. For example, this shows
that Swift developers can now copy any object conforming to the
NSCopying with a simple call to `foo.copy()` instead of calling
`foo.copyWithZone(nil)`.

## Implementation Experience

An experimental implementation of this proposal is available in the
main Swift repository. There are a set of compiler flags that one can
use to see the results of applying this proposal to imported
Objective-C APIs (e.g., via the script in
`utils/omit-needless-words.py`) and to Swift code itself. The flags
are:

* `-enable-omit-needless-words`: this flag enables most of the changes
  to the Clang importer (bullets 1, 2, 4, and 5 in the prior
  section). It is currently suitable only for printing the Swift
  interface to Objective-C modules (e.g., via `swift-ide-test`) in the
  Swift master branch and [Swift 2.2 branch][swift-2_2-branch], and is enabled on the [Swift 3 API Guidelines branch][swift-3-api-guidelines-branch].

* `-enable-infer-default-arguments`: this flag enables inference of
  default arguments in the Clang importer (bullet 3 in the prior
  section).

* `-swift3-migration`: only available on the [Swift 2.2
  branch][swift-2_2-branch], this flag performs basic migration from
  Swift 2 names to the Swift 3 names via Fix-Its. Tied together with
  other compiler flags (e.g., `-fixit-code`, `-fixit-all`) and a
  script to collect and apply Fix-Its (in
  `utils/apply-fixit-edits.py`), this flag provides a rudimentary
  migrator that lets us see how Swift code would look under the
  proposed changes, updating both declarations and use sites.

To actually get the "Swift 3 experience" of compiling code using these
names, one can use the [Swift 3 API Guidelines
branch][swift-3-api-guidelines-branch], which enables these features
by default along with the changes to the standard library.

## Detailed design

This section details the experimental implementation of rules 2-5 in prose. The actual implementation is available in the Swift source tree, mostly in the `omitNeedlessWords` functions of [lib/Basic/StringExtras.cpp](https://github.com/apple/swift/blob/master/lib/Basic/StringExtras.cpp).

The descriptions in this section are described in terms of the incoming Objective-C API. For example, Objective-C method names are "selectors", e.g., `startWithQueue:completionHandler:` is a selector with two selector pieces, `startWithQueue` and `completionHandler`. A direct mapping of this name into Swift would produce `startWithQueue(_:completionHandler:)`.


### Prune redundant type names

Objective-C API names often contain names of parameter and/or result
types that would be omitted in a Swift API. The following rules are
designed to identify and remove these
words. [[Omit Needless Words](https://swift.org/documentation/api-design-guidelines#omit-needless-words)]

#### Identifying type names

The matching process described below searches in a selector piece for
a suffix of a string called the **type name**, which is defined as follows:

* For most Objective-C types, the *type name* is the name under which
  Swift imports the type, ignoring nullability. For example,

  |Objective-C type       | *Type Name*                                |
  |-----------------------|--------------------------------------------|
  |`float`                |`Float`                                     |
  |`nullable NSString`    |`String`                                    |
  |`UIDocument`           |`UIDocument`                                |
  |`nullable UIDocument`  |`UIDocument`                                |
  |`NSInteger`            |`NSInteger`                                 |
  |`NSUInteger`           |`NSUInteger`                                |
  |`CGFloat`              |`CGFloat`                                   |

* When the Objective-C type is a block, the *type name* is "`Block`."

* When the Objective-C type is a pointer- or reference-to-function,
  the *type name* is "`Function`."

* When the Objective-C type is a typedef other than `NSInteger`,
  `NSUInteger`, or `CGFloat` (which follow the first rule above), the
  *type name* is that of the underlying type. For example, when the
  Objective-C type is `UILayoutPriority`, which is a typedef for
  `float`, we try to match the string
  "`Float`". [[Compensate for Weak Type Information](https://swift.org/documentation/api-design-guidelines#weak-type-information)]

#### Matching

In order to prune a redundant type name from a selector piece, we
need to match a substring of the selector that identifies the type.  

A couple of basic rules govern all matches:

* **Matches begin and end at word boundaries** in both type names and
  selector pieces.  Word boundaries occur at the beginning and end of
  a string, and before every capital letter.

  Treating every capital letter as the beginning of a word allows us
  to match uppercased acronyms without maintaining a special lists of
  acronyms or prefixes:

  <pre>
  func documentFor<b>URL</b>(_: NS<b>URL</b>) -> NSDocument?
  </pre>

  while preventing partial-word mismatches:

  <pre>
  var thumbnailPre<b>view</b> : UI<b>View</b>  // not matched
  </pre>

* **Matched text extends to the end of the type name**. Because we
  accept a match for *any suffix* of the type name, this code:

  <pre>
  func constraintEqualTo<b>Anchor</b>(anchor: NSLayout<b>Anchor</b>) -&gt; NSLayoutConstraint?
  </pre>

  can be pruned as follows:

  <pre>
  func constraintEqualTo(anchor: NSLayoutAnchor) -&gt; NSLayoutConstraint?
  </pre>

  Conveniently, matching by suffix also means that module prefixes
  such as `NS` do not prevent matching or pruning.

Matches are a sequence of one or more of the following:

* **Basic matches**

  * Any substring of the selector piece matches an identical
    substring of the type name, e.g., `String` in `appendString`
    matches `String` in `NSString`:

    <pre>
    func append<b>String</b>(_: NS<b>String</b>)
    </pre>

  * `Index` in the selector piece matches `Int` in the type name:

    <pre>
    func characterAt<b>Index</b>(_: <b>Int</b>) -> unichar
    </pre>

* **Collection matches**

  * `Indexes` or `Indices` in the selector piece matches `IndexSet` in
  the type name:

    <pre>
    func removeObjectsAt<b>Indexes</b>(_: NS<b>IndexSet</b>)
    </pre>

  * A plural noun in the selector piece matches a collection type name
    if the noun's singular form matches the name of the collection's
    element type:

    <pre>
    func arrange<b>Objects</b>(_: <b>[</b>Any<b>Object]</b>) -> [AnyObject]
    </pre>

* **Special suffix matches**

  * The empty string in the selector piece matches `Type` or `_t` in the type name:

    <pre>
    func writableTypesFor<b>SaveOperation</b>(_: NS<b>SaveOperation</b><i>Type</i>) -> [String]
    func objectFor<b>Key</b>(_: <b>Key</b><i>Type</i>) -> AnyObject
    func startWith<b>Queue</b>(_: dispatch_<b>queue</b><i>_t</i>, completionHandler: MKMapSnapshotCompletionhandler)
    </pre>

  * The empty string in the selector piece matches *one or more digits
    followed by "D"* in the type name:

    <pre>
    func pointFor<b>Coordinate</b>(_: CLLocation<b>Coordinate</b><i>2D</i>) -> NSPoint
    </pre>

In the examples above, the italic text is effectively skipped, so the
bold part of the selector piece can be matched and pruned.

#### Pruning Restrictions

The following restrictions govern the pruning steps listed in the
next section.  If any step would violate one of these rules, it is
skipped.

* **Never make a selector piece entirely empty**.

* **Never transform the first selector piece into a Swift keyword**,
  to avoid forcing the user to escape it with backticks. In Swift, the
  first Objective-C selector piece becomes:

    * the base name of a method
    * or the full name of a property 

  neither of which can match a Swift keyword without forcing the
  user to write backticks.  For example,

  <pre>
  extension NSParagraphStyle {
  &nbsp;&nbsp;class func default<b>ParagraphStyle</b>() -> NS<b>ParagraphStyle</b>
  }
  let defaultStyle = NSParagraphStyle.<b>default</b>ParagraphStyle()  // OK
  </pre>

  would become:

  <pre>
  extension NSParagraphStyle {
  &nbsp;&nbsp;class func <b>`default`</b>() -> NSParagraphStyle
  }
  let defaultStyle = NSParagraphStyle.<b>`default`</b>()              // Awkward
  </pre>

  By contrast, later selector pieces become argument labels, which
  are allowed to match Swift keywords without requiring backticks:

  <pre>
  receiver.handle(someMessage, <b>for</b>: somebody)  // OK
  </pre>

* **Never transform a name into "get", "set", "with", "for", or
  "using"**, just to avoid creating absurdly vacuous names.

* **Never prune a suffix from a parameter introducer unless the suffix
  is immediately preceded by a preposition, verb, or gerund**.


  This heuristic has the effect of preventing us from breaking up
  sequences of nouns that refer to a parameter.  Dropping just the
  suffix of a noun phrase tends to imply something unintended about
  the parameter that follows.  For example,

  <pre>
  func setText<b>Color</b>(_: UI<b>Color</b>)
  ...
  button.<b>setTextColor</b>(.red())  <b>// clear</b>
  </pre>

  If we were to drop `Color`, leaving just `Text`, call sites 
  would become confusing:

  <pre>
  func setText(_: UIColor)
  ...
  button.<b>setText</b>(.red())      <b>// appears to be setting the text!</b>
  </pre>

  Note: We don't maintain a list of nouns, but if we did, this
  rule could be more simply phrased as "don't prune a suffix
  leaving a trailing noun before a parameter".

* **Never prune a suffix from the base name of a method that matches a property of the enclosing class**: 

  This heuristic has the effect of preventing us from producing
  too-generic names for methods that conceptually modify a property
  of the class.

  <pre>
  var <b>gestureRecognizers</b>: [UIGestureRecognizer]
  func add<b>GestureRecognizer</b>(_: UI<b>GestureRecognizer</b>)
  </pre>

  If we were to drop `GestureRecognizer`, leaving just `add`, we end
  up with a method that conceptually modifies the
  `gestureRecognizers` property but uses an overly generic name to
  do so:

  <pre>
  var gestureRecognizers: [UIGestureRecognizer]
  func add(_: UIGestureRecognizer) <b>// should indicate that we're adding to the property</b>
  </pre>

#### Pruning Steps

The following pruning steps are performed in the order
shown:

1. **Prune the result type from the head of type-preserving
   transforms**.  Specifically, when

   * the receiver type is the same as the result type
   * and the type name is matched at the head of the first selector piece
   * and the match is followed by a preposition

   then prune the match.

   You can think of the affected operations as properties or
   non-mutating methods that produce a transformed version of the
   receiver.  For example:

   <pre>
   extension NS<b>Color</b> {
   &nbsp;&nbsp;func <b>color</b><i>With</i>AlphaComponent(_: CGFloat) -> NS<b>Color</b>
   }
   let translucentForeground = <b>foregroundColor.color</b><i>With</i>AlphaComponent(0.5)
   </pre>

   becomes:

   <pre>
   extension NS<b>Color</b> {
   &nbsp;&nbsp;func <i>with</i>AlphaComponent(_: CGFloat) -> NS<b>Color</b>
   }
   let translucentForeground = <b>foregroundColor</b>.<i>with</i>AlphaComponent(0.5)
   </pre>

2. **Prune an additional hanging "By"**. Specifically, if

   * anything was pruned in step 1
   * and the remaining selector piece begins with "`By`" *followed by a gerund*,

   then prune the initial "`By`" as well.
   
   This heuristic allows us to arrive at usage of the form `a =
   b.frobnicating(c)`.  For example:

   <pre>
   extension NSString {
   &nbsp;&nbsp;func string<b>By</b><i>Applying</i>Transform(_: NSString, reverse: Bool) -> NSString?
   }
   let sanitizedInput = rawInput.<b>stringByApplyingTransform</b>(NSStringTransformToXMLHex, reverse: false)
   </pre>

   becomes:

   <pre>
   extension NSString {
   &nbsp;&nbsp;func applyingTransform(_: NSString, reverse: Bool) -> NString?
   }
   let sanitizedInput = rawInput.<b>applyingTransform</b>(NSStringTransformToXMLHex, reverse: false)
   </pre>

3. **Prune a match for any type name in the signature from the tail of
   the preceding selector piece**. Specifically,

   |From the tail of:                               |Prune a match for:              |
   |------------------------------------------------|--------------------------------|
   |a selector piece that introduces a parameter    |the parameter type name         |
   |the name of a property                          |the property type name          |
   |the name of a zero-argument method              |the return type name            |
       
   For example,

   <pre>
   extension NSDocumentController {
   &nbsp;&nbsp;func documentFor<b>URL</b>(_ url: NS<b>URL</b>) -> NSDocument? // parameter introducer
   }
   extension NSManagedObjectContext {
   &nbsp;&nbsp;var parent<b>Context</b>: NSManagedObject<b>Context</b>?       // property
   }
   extension UIColor {
   &nbsp;&nbsp;class func darkGray<b>Color</b>() -> UI<b>Color</b>            // zero-argument method
   }
   ...
   myDocument = self.documentFor<b>URL</b>(locationOfFile)
   if self.managedObjectContext.parent<b>Context</b> != changedContext { return }
   foregroundColor = .darkGray<b>Color</b>()
   </pre>

   becomes:

   <pre>
   extension NSDocumentController {
   &nbsp;&nbsp;func documentFor(_ url: NSURL) -> NSDocument?
   }
   extension NSManagedObjectContext {
   &nbsp;&nbsp;var parent : NSManagedObjectContext?
   }
   extension UIColor {
   &nbsp;&nbsp;class func darkGray() -> UIColor
   }
   ...
   myDocument = self.<b>documentFor</b>(locationOfFile)
   if self.managedObjectContext.<b>parent</b> != changedCont

... (전체 원문은 같은 폴더의 proposal.md를 참고하세요)
```

## SE-0005 opening context

After the series greeting, introduce Objective-C as a programming language used for iPhone apps before Swift. Introduce UIKit through its role in drawing on screen. Show the same operation first as an Objective-C message, then as a Swift 2 method call. Explain why importing names unchanged can repeat information Swift already expresses. Only then introduce the naming puzzle. Apply this order to the Short as well.
