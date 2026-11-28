# SE-0006 대본 작성 프롬프트 (Apply API Guidelines to the Standard Library)

한국어 복제 음성은 제작 스킬의 말끝 검증을 적용합니다. 최종 재생 속도로 ‘다’의 모음과 다음 문장 앞의 쉼을 확인합니다.

아래 Swift Evolution 원문을 바탕으로 `episodes/SE-0006/script.json`을 작성해 주세요.

## 메타데이터
- **Proposal ID**: SE-0006
- **Episode Number**: 6
- **Title**: Apply API Guidelines to the Standard Library
- **Status / Version**: implemented (Swift 3.0)
- **Authors**: Dave Abrahams, Dmitri Gribenko, Maxim Moiseev
- **URL**: https://github.com/swiftlang/swift-evolution/blob/main/proposals/0006-apply-api-guidelines-to-the-standard-library.md
- **Next Episode Hint**: SE-0007 - Remove C-style for-loops with conditions and incrementers

## 작성 규칙

첫 커밋에 이미 채택됐다고 적혀 있으면 그 날짜를 결정일로 단정하지 마세요. 동시대 발언에서 실제 사용 사례를 찾아 누가 무엇을 지키려 했는지 대본에 담으세요. 포럼에 옮겨진 메일의 인용문은 원 발언자와 회신자를 구별하세요. 인물을 언급할 때는 해당 speech 자막에서 cue를 골라 장면의 people 배열에 영문 이름(name), 플랫폼과 @아이디(account), 공식 프로필 URL(profile), 당시 맡은 역할(role)을 기록하세요. 내레이션에서는 제안자가 바꾸려던 점과 토론자가 제시한 실제 사례나 우려를 해당 발언에 근거해 설명하세요. 출처와 사용 조건이 확인된 실제 사진은 에피소드의 audio/people에 저장하고 photo의 file, source, credit을 채우세요. 공동 저자는 각각 표시하고 설명란에 프로필과 사진 출처를 남기세요. 사진 출처는 직접 조사하세요. 수익화 영상에 쓸 수 있는지 확인되지 않으면 조사 결과를 기록하고 영문 이름과 계정만 표시하세요. 대본 작성 전에 공식 원문 최초판과 최종판, 변경 이력과 PR, 제안·리뷰 토론, 결정 공지, 구현과 출시 기록을 조사해 에피소드 폴더의 research.md에 날짜·발언자·근거 링크를 남기세요. 본편에서는 당시의 문제, 의견이 갈린 이유, 검토한 대안, 실제 수정과 최종 결정이 어떻게 이어졌는지 장면으로 설명하세요. 쇼츠에도 결정의 이유를 하나 담으세요. 예제 수정과 설계 변경, 당사자의 의견과 공식 결정, 채택 전 논쟁과 후속 논의를 구분하세요. 찾지 못한 기록은 조사 노트에 밝히고 대화를 창작하지 마세요.

제목과 설명은 Apple 시스템 서체, Swift 코드는 Menlo로 연출하세요. 작은 제안 번호, 버전 표기와 계정명은 Atkinson Hyperlegible Next를 사용하세요. korean-product-writing 원칙에 따라 한 문장에 한 가지를 설명하고 대상과 동작을 구체적으로 말하세요. 제안 당시 의도와 출시된 변경은 날짜가 있는 과거형으로, 현재 동작은 확인한 버전을 기준으로, 미출시 동작은 상태와 조건을 밝혀 쓰세요. RFC 2119의 의무·권고·선택 구분과 ASD-STE100의 명료성 원칙을 한국어 합니다체에 맞게 적용하세요. 영어는 뜻이 이어지는 짧은 영어 구절로 묶어 en 음성으로 합성하세요. 제목에는 무엇이 어떻게 달라졌는지 동사로 쓰세요. 이름을 논의하는 장의 챕터 제목에는 화면에서 볼 식별자나 접두사를 넣으세요. 예를 들어 SE-0001은 “백틱이 사라졌다”입니다. 초보자부터 중급자까지 볼 수 있도록 전문 용어가 처음 들리는 장면에 termNotes를 넣으세요. term은 용어, meaning은 현재 코드에 맞춘 짧은 한글 풀이, cue는 해당 자막에서 그대로 가져온 구절입니다. 시리즈 이름은 “듣다 보면 잠이 오는 스위프트 에볼루션 훑어보기”입니다. 첫 화면의 badge와 썸네일 subheadline에 이 이름을 쓰세요. 늦은 밤 동료에게 이야기하듯 편안하게 읽고, 썸네일에는 그 편에서 달라진 점을 짧게 쓰세요. 첫 질문과 답 직후, 제안서 최초 기록·구현 기록·해당 Swift 버전과 정식 출시 시기를 history 장면으로 짧게 소개하세요. milestones 배열에 확인된 사건을 시간순으로 최대 3개 넣으세요. 각 항목은 date(표시할 날짜), event(사건), sourceUrl(공식 출처 URL)로 구성합니다. 제안서 이력과 공식 출시 발표로 확인한 날짜만 쓰고, 미출시 제안은 확인된 상태까지만 소개하세요. 첫 화면에 제목이 약속한 코드를 보여주고, 시청자가 눈으로 답을 찾을 수 있는 질문을 하나 던지세요. 코드가 바뀌는 지점에 강조와 설명을 맞추세요. 그 편의 코드가 실제로 다루는 대상을 화면에 보여주세요. 그리기 API라면 현재 점을 옮기는 호출과 선분을 추가해 그리는 호출의 결과를 구분하고, 변화가 해당 코드와 대사에 맞춰 나타나게 하세요. 친한 동료와 같은 코드를 보며 발견한 내용을 나누듯 쓰세요. 한국어 낭독문과 해당 자막은 모두 ‘다.’로 끝내세요. 진행자가 다음에 할 일은 ‘첫 호출로 돌아가 보겠습니다.’처럼 안내하세요. 화면에서 확인할 사실은 ‘첫 줄은 점 하나를 만듭니다.’처럼 현재형으로, 당시의 결정은 과거형으로 말하세요. 시청자가 답을 찾도록 코드에서 볼 단서를 한 가지 짚고 잠시 쉬세요. 삭제를 보여주는 첫 장면은 heading에 질문을 쓰고 codeReveal.parts에 한 줄의 코드를 순서대로 나누세요. 남길 부분은 문자열, 지울 부분은 {"remove":"문자"}입니다. 답이 들리는 단어로 새 speech 구간을 시작하고 그 caption 전체를 codeReveal.answerCue에 넣으세요. 오래전에 사라진 문법은 시청자가 처음 본다고 가정하세요. 도입에서 사용 시기를 표시하고 당시 선언과 구체적인 실행 결과를 먼저 보여준 뒤, 제안 당시의 쟁점으로 넘어가세요. 마지막에는 그 선언과 현재 가능한 호출을 함께 보여주세요. 본편과 쇼츠 모두 첫 화면에 코드를 띄우고 “오늘도 코드 한 줄을 함께 살펴보겠습니다.”로 시작하세요. 그 편에서 생각해 볼 문제 하나를 짚고 답을 보여주기 전에 한 박자 기다리세요. 끝에서는 첫 코드를 다시 보여주고 질문의 답과 제안의 의미를 연결하세요. 본편과 쇼츠의 마지막 대사는 제안서에 근거해 이 제안이 해결하려던 문제를 말해야 합니다. 채택 여부와 목표를 구분하세요. 마지막 대사가 끝나면 예제 코드를 잠시 남기세요. [시리즈 연출 근거](../../_context/editorial-direction.md)

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
6. **검증**: 작성 후 `pnpm evo validate SE-0006` 로 스키마 통과 확인.

## 원문 Proposal (`proposal.md`)

```markdown
# Apply API Guidelines to the Standard Library

* Proposal: [SE-0006](0006-apply-api-guidelines-to-the-standard-library.md)
* Authors: [Dave Abrahams](https://github.com/dabrahams), [Dmitri Gribenko](https://github.com/gribozavr), [Maxim Moiseev](https://github.com/moiseev)
* Review Manager: [Doug Gregor](https://github.com/DougGregor)
* Status: **Implemented (Swift 3.0)**
* Decision Notes: [Rationale](https://forums.swift.org/t/accepted-with-modifications-se-0006-apply-api-guidelines-to-the-standard-library/1667)

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

[Swift API Design Guidelines][api-design-guidelines] being developed as
part of Swift 3.  It is important that the Standard Library is an exemplar of
Swift API Design Guidelines: the APIs from the Standard Library are, probably,
the most frequently used Swift APIs in any application domain; the Standard
Library also sets precedent for other libraries.

In this project, we are reviewing the entire Standard Library and updating it
to follow the guidelines.

## Proposed solution

The actual work is being performed on the [swift-3-api-guidelines
branch][swift-3-api-guidelines-branch] of the [Swift repository][swift-repo].
On high level, the changes can be summarized as follows.

* Strip `Type` suffix from protocol names.  In a few special cases
  this means adding a `Protocol` suffix to get out of the way of type
  names that are primary (though most of these we expect to be
  obsoleted by Swift 3 language features).

* The concept of `generator` is renamed to `iterator` across all APIs.

* The type `Bit`, which was only used as the index for `CollectionOfOne`, was
  removed.  We recommend using `Int` instead.

* The generic parameter name in unsafe pointer types was renamed from `Memory`
  to `Pointee`.

* No-argument initializers were removed from unsafe pointer types.  We
  recommend using the `nil` literal instead.

* `PermutationGenerator` was removed.

* `MutableSliceable` was removed.  Use `Collection where SubSequence :
  MutableCollection` instead.

* `sort()` => `sorted()`, `sortInPlace()` => `sort()`.

* `reverse()` => `reversed()`.

* `enumerate()` => `enumerated()`.

* `partition()` API was simplified.  It composes better with collection slicing
  now.

* `SequenceType.minElement()` => `.min()`, `.maxElement()` => `.max()`.

* Some initializers for sequence and collection adapters were removed.  We
  suggest calling the corresponding algorithm function or method instead.

* Some functions were changed into properties and vice versa.

* `String` factory methods dealing with nul-terminated UTF-8 data (a.k.a.
  C-strings) became initializers.

## API diffs

Differences between Swift 2.2 Standard library API and the proposed API are
added to this section as they are being implemented on the
[swift-3-api-guidelines branch][swift-3-api-guidelines-branch].

For repetitive changes that affect many types, only one representative instance
is shown in the diff.  For example, `generate()` was renamed to
`makeIterator()`.  We only show the diff for the protocol requirement, and all
other renames of this method are implied.  If a type was renamed, we show only
the diff for the type declaration, all other effects on the API where the name
is used are implied.

* Strip `Type` suffix from protocol names.

```diff
-public protocol BooleanType { ... }
+public protocol Boolean { ... }

-public protocol SequenceType { ... }
+public protocol Sequence { ... }

-public protocol CollectionType : ... { ... }
+public protocol Collection : ... { ... }

-public protocol MutableCollectionType : ... { ... }
+public protocol MutableCollection : ... { ... }

-public protocol RangeReplaceableCollectionType : ... { ... }
+public protocol RangeReplaceableCollection : ... { ... }

-public protocol AnyCollectionType : ... { ... }
+public protocol AnyCollectionProtocol : ... { ... }

-public protocol IntegerType : ... { ... }
+public protocol Integer : ... { ... }

-public protocol SignedIntegerType : ... { ... }
+public protocol SignedInteger : ... { ... }

-public protocol UnsignedIntegerType : ... { ... }
+public protocol UnsignedInteger : ... { ... }

-public protocol FloatingPointType : ... { ... }
+public protocol FloatingPoint : ... { ... }

-public protocol ForwardIndexType { ... }
+public protocol ForwardIndex { ... }

-public protocol BidirectionalIndexType : ... { ... }
+public protocol BidirectionalIndex : ... { ... }

-public protocol RandomAccessIndexType : ... { ... }
+public protocol RandomAccessIndex : ... { ... }

-public protocol IntegerArithmeticType : ... { ... }
+public protocol IntegerArithmetic : ... { ... }

-public protocol SignedNumberType : ... { ... }
+public protocol SignedNumber : ... { ... }

-public protocol IntervalType : ... { ... }
+public protocol Interval : ... { ... }

-public protocol LazyCollectionType : ... { ... }
+public protocol LazyCollectionProtocol : ... { ... }

-public protocol LazySequenceType : ... { ... }
+public protocol LazySequenceProtocol : ... { ... }

-public protocol OptionSetType : ... { ... }
+public protocol OptionSet : ... { ... }

-public protocol OutputStreamType : ... { ... }
+public protocol OutputStream : ... { ... }

-public protocol BitwiseOperationsType { ... }
+public protocol BitwiseOperations { ... }

-public protocol ReverseIndexType : ... { ... }
+public protocol ReverseIndexProtocol : ... { ... }

-public protocol SetAlgebraType : ... { ... }
+public protocol SetAlgebra : ... { ... }

-public protocol UnicodeCodecType { ... }
+public protocol UnicodeCodec { ... }

-public protocol CVarArgType { ... }
+public protocol CVarArg { ... }

-public protocol MirrorPathType { ... }
+public protocol MirrorPath { ... }

-public protocol ErrorType { ... }
+public protocol ErrorProtocol { ... }
```

* The concept of "generator" is renamed to "iterator" across all APIs.

```diff
-public protocol GeneratorType { ... }
+public protocol IteratorProtocol { ... }

 public protocol Collection : ... {
-  associatedtype Generator : GeneratorType = IndexingGenerator<Self>
+  associatedtype Iterator : IteratorProtocol = IndexingIterator<Self>

-  func generate() -> Generator
+  func makeIterator() -> Iterator
 }

-public struct IndexingGenerator<Elements : Indexable> : ... { ... }
+public struct IndexingIterator<Elements : Indexable> : ... { ... }

-public struct GeneratorOfOne<Element> : ... { ... }
+public struct IteratorOverOne<Element> : ... { ... }

-public struct EmptyGenerator<Element> : ... { ... }
+public struct EmptyIterator<Element> : ... { ... }

-public struct AnyGenerator<Element> : ... { ... }
+public struct AnyIterator<Element> : ... { ... }

-public struct LazyFilterGenerator<Base : GeneratorType> : ... { ... }
+public struct LazyFilterIterator<Base : IteratorProtocol> : ... { ... }

-public struct FlattenGenerator<Base : ...> : ... { ... }
+public struct FlattenIterator<Base : ...> : ... { ... }

-public struct JoinGenerator<Base : ...> : ... { ... }
+public struct JoinedIterator<Base : ...> : ... { ... }

-public struct LazyMapGenerator<Base : ...> ... { ... }
+public struct LazyMapIterator<Base : ...> ... { ... }

-public struct RangeGenerator<Element : ForwardIndexType> : ... { ... }
+public struct RangeIterator<Element : ForwardIndex> : ... { ... }

-public struct GeneratorSequence<Base : GeneratorType> : ... { ... }
+public struct IteratorSequence<Base : IteratorProtocol> : ... { ... }

-public struct StrideToGenerator<Element : Strideable> : ... { ... }
+public struct StrideToIterator<Element : Strideable> : ... { ... }

-public struct StrideThroughGenerator<Element : Strideable> : ... { ... }
+public struct StrideThroughIterator<Element : Strideable> : ... { ... }

-public struct UnsafeBufferPointerGenerator<Element> : ... { ... }
+public struct UnsafeBufferPointerIterator<Element> : ... { ... }
```

* The type `Bit`, which was only used as the index for `CollectionOfOne`, was
  removed.  We recommend using `Int` instead.

```diff
-public enum Bit : ... { ... }
```

* `PermutationGenerator` was removed.

```diff
-public struct PermutationGenerator<
-  C : CollectionType, Indices : SequenceType
-  where C.Index == Indices.Generator.Element
-> : ... { ... }
```

* `MutableSliceable` was removed.  Use `Collection where SubSequence :
  MutableCollection` instead.

```diff
-public protocol MutableSliceable : CollectionType, MutableCollectionType {
-  subscript(_: Range<Index>) -> SubSequence { get set }
-}
```

* The generic parameter name in unsafe pointer types was renamed from `Memory`
  to `Pointee`.

* No-argument initializers were removed from unsafe pointer types.  We
  recommend using the `nil` literal instead.

```diff
 // The same changes applied to `UnsafePointer`, `UnsafeMutablePointer` and
 // `AutoreleasingUnsafeMutablePointer`.
 public struct UnsafePointer<
-  Memory
+  Pointee
 > ... : {
-  public var memory: Memory { get set }
+  public var pointee: Pointee { get set }

   // Use `nil` instead.
-  public init()
 }

public struct OpaquePointer : ... {
   // Use `nil` instead.
-  public init()
}
```

* `sort()` => `sorted()`, `sortInPlace()` => `sort()`.  We also added argument
  labels to closures.

```diff
 extension Sequence where Self.Iterator.Element : Comparable {
   @warn_unused_result
-  public func sort() -> [Generator.Element]
+  public func sorted() -> [Iterator.Element]
 }

 extension Sequence {
   @warn_unused_result
-  public func sort(
+  public func sorted(
-    @noescape                 isOrderedBefore: (Iterator.Element, Iterator.Element) -> Bool
+    @noescape isOrderedBefore isOrderedBefore: (Iterator.Element, Iterator.Element) -> Bool
   ) -> [Iterator.Element]
 }

 extension MutableCollection where Self.Iterator.Element : Comparable {
   @warn_unused_result(mutable_variant="sort")
-  public func sort() -> [Generator.Element]
+  public func sorted() -> [Iterator.Element]
 }

 extension MutableCollection {
   @warn_unused_result(mutable_variant="sort")
-  public func sort(
+  public func sorted(
-   @noescape                 isOrderedBefore: (Iterator.Element, Iterator.Element) -> Bool
+   @noescape isOrderedBefore isOrderedBefore: (Iterator.Element, Iterator.Element) -> Bool
   ) -> [Iterator.Element]
 }

 extension MutableCollection
   where
   Self.Index : RandomAccessIndex,
   Self.Iterator.Element : Comparable {

-  public mutating func sortInPlace()
+  public mutating func sort()

 }

 extension MutableCollection where Self.Index : RandomAccessIndex {
-  public mutating func sortInPlace(
+  public mutating func sort(
-    @noescape                 isOrderedBefore: (Iterator.Element, Iterator.Element) -> Bool
+    @noescape isOrderedBefore isOrderedBefore: (Iterator.Element, Iterator.Element) -> Bool
   )
 }
```

* `reverse()` => `reversed()`.

```diff
 extension SequenceType {
-  public func reverse() -> [Generator.Element]
+  public func reversed() -> [Iterator.Element]
 }

 extension CollectionType where Index : BidirectionalIndexType {
-  public func reverse() -> ReverseCollection<Self>
+  public func reversed() -> ReverseCollection<Self>
 }

 extension CollectionType where Index : RandomAccessIndexType {
-  public func reverse() -> ReverseRandomAccessCollection<Self>
+  public func reversed() -> ReverseRandomAccessCollection<Self>
 }

 extension LazyCollectionProtocol
   where Index : BidirectionalIndexType, Elements.Index : BidirectionalIndexType {

-  public func reverse()
+  public func reversed()
     -> LazyCollection<ReverseCollection<Elements>>
 }

 extension LazyCollectionProtocol
   where Index : RandomAccessIndexType, Elements.Index : RandomAccessIndexType {

-  public func reverse()
+  public func reversed()
     -> LazyCollection<ReverseRandomAccessCollection<Elements>>
 }
```

* `enumerate()` => `enumerated()`.

```diff
 extension Sequence {
-  public func enumerate() -> EnumerateSequence<Self>
+  public func enumerated() -> EnumeratedSequence<Self>
 }

-public struct EnumerateSequence<Base : SequenceType> : ... { ... }
+public struct EnumeratedSequence<Base : Sequence> : ... { ... }

-public struct EnumerateGenerator<Base : GeneratorType> : ... { ... }
+public struct EnumeratedIterator<Base : IteratorProtocol> : ... { ... }
```

* `partition()` API was simplified: the range argument was removed.  It
  composes better with collection slicing now, and is more uniform with other
  collection algorithms.  We also added `@noescape` and an argument label to
  the closure.

```diff
 extension MutableCollection where Index : RandomAccessIndex {
   public mutating func partition(
-    range: Range<Index>,
-                              isOrderedBefore: (Iterator.Element, Iterator.Element) -> Bool
+    @noescape isOrderedBefore isOrderedBefore: (Iterator.Element, Iterator.Element) -> Bool
   ) -> Index
 }

 extension MutableCollection
   where Index : RandomAccessIndex, Iterator.Element : Comparable {

-  public mutating func partition(range: Range<Index>) -> Index
+  public mutating func partition() -> Index
}
```

* `SequenceType.minElement()` => `.min()`, `.maxElement()` => `.max()`.  We
  also added argument labels to closures.

```diff
 extension Sequence {
-  public func minElement(
+  public func min(
-    @noescape                 isOrderedBefore: (Iterator.Element, Iterator.Element) throws -> Bool
+    @noescape isOrderedBefore isOrderedBefore: (Iterator.Element, Iterator.Element) throws -> Bool
   ) rethrows -> Iterator.Element?

-  public func maxElement(
+  public func max(
-    @noescape                 isOrderedBefore: (Iterator.Element, Iterator.Element) throws -> Bool
+    @noescape isOrderedBefore isOrderedBefore: (Iterator.Element, Iterator.Element) throws -> Bool
   ) rethrows -> Iterator.Element?
 }

 extension Sequence where Iterator.Element : Comparable {
-  public func minElement() -> Iterator.Element?
+  public func min() -> Iterator.Element?

-  public func maxElement() -> Iterator.Element?
+  public func max() -> Iterator.Element?
 }
```

* Some initializers for sequence, collection and iterator adapters were
  removed.  We suggest calling the corresponding algorithm function or
  method instead.

```diff
 extension Repeated {
-  public init(count: Int, repeatedValue: Element)
 }
+/// Return a collection containing `n` repetitions of `elementInstance`.
+public func repeatElement<T>(element: T, count n: Int) -> Repeated<T>

 public struct LazyMapSequence<Base : Sequence, Element> : ... {
   // Call `.lazy.map` on the sequence instead.
-  public init(_ base: Base, transform: (Base.Generator.Element) -> Element)
 }

 public struct LazyMapCollection<Base : Collection, Element> : ... {
   // Call `.lazy.map` on the collection instead.
-  public init(_ base: Base, transform: (Base.Generator.Element) -> Element)
 }

 public struct LazyFilterIterator<Base : IteratorProtocol> : ... {
   // Call `.lazy.filter` on the sequence instead.
-  public init(
-    _ base: Base,
-    whereElementsSatisfy predicate: (Base.Element) -> Bool
-  )
 }

 public struct RangeIterator<Element : ForwardIndex> : ... {
   // Use the 'generate()' method on the collection instead.
-  public init(_ bounds: Range<Element>)

   // Use the '..<' operator.
-  public init(start: Element, end: Element)
 }

 public struct ReverseCollection<Base : ...> : ... {
   // Use the 'reverse()' method on the collection.
-  public init(_ base: Base)
 }

 public struct ReverseRandomAccessCollection<Base : ...> : ... {
   // Use the 'reverse()' method on the collection.
-  public init(_ base: Base)
 }

 public struct Slice<Base : Indexable> : ... {
   // Use the slicing syntax.
-  public init(base: Base, bounds: Range<Index>)
 }

 public struct MutableSlice<Base : MutableIndexable> : ... {
   // Use the slicing syntax.
-  public init(base: Base, bounds: Range<Index>)
 }

 public struct EnumeratedIterator<Base : IteratorProtocol> : ... {
   // Use the 'enumerated()' method.
-  public init(_ base: Base)
 }

 public struct EnumeratedSequence<Base : IteratorProtocol> : ... {
   // Use the 'enumerated()' method.
-  public init(_ base: Base)
 }

 public struct IndexingIterator<Elements : Indexable> : ... {
   // Call 'iterator()' on the collection instead.
-  public init(_elements: Elements)
 }

 public struct HalfOpenInterval<Bound : Comparable> : ... {
   // Use the '..<' operator.
-  public init(_ start: Bound, _ end: Bound)
 }

 public struct ClosedInterval<Bound : Comparable> : ... {
   // Use the '...' operator.
-  public init(_ start: Bound, _ end: Bound)
 }
```

* Some functions were changed into properties and vice versa.

```diff
-public func unsafeUnwrap<T>(nonEmpty: T?) -> T
 extension Optional {
+  public var unsafelyUnwrapped: Wrapped { get }
 }

 public struct Mirror {
-  public func superclassMirror() -> Mirror?
+  public var superclassMirror: Mirror? { get }
 }

 public protocol CustomReflectable {
-  func customMirror() -> Mirror
+  var customMirror: Mirror { get }
 }

 public protocol Collection : ... {
-  public func underestimateCount() -> Int
+  public var underestimatedCount: Int { get }
 }

 public protocol CustomPlaygroundQuickLookable {
-  func customPlaygroundQuickLook() -> PlaygroundQuickLook
+  var customPlaygroundQuickLook: PlaygroundQuickLook { get }
 }

 extension String {
-  public var lowercaseString: String { get }
+  public func lowercased()

-  public var uppercaseString: String { get }
+  public func uppercased()
 }

 public enum UnicodeDecodingResult {
-  public func isEmptyInput() -> Bool {
+  public var isEmptyInput: Bool
 }

```

* Base names and argument labels were changed to follow guidelines about first
  argument labels.  (Some changes in this category are already specified
  elsewhere in the diff and are not repeated.)

```diff
 public protocol ForwardIndex {
-  func advancedBy(n: Distance) -> Self
+  func advanced(by n: Distance) -> Self

-  func advancedBy(n: Distance, limit: Self) -> Self
+  func advanced(by n: Distance, limit: Self) -> Self

-  func distanceTo(end: Self) -> Distance
+  func distance(to end: Self) -> Distance
 }

 public struct Set<Element : Hashable> : ... {
-  public mutating func removeAtIndex(index: Index) -> Element
+  public mutating func remove(at index: Index) -> Element
 }

 public struct Dictionary<Key : Hashable, Value> : ... {
-  public mutating func removeAtIndex(index: Index) -> Element
+  public mutating func remove(at index: Index) -> Element

-  public func indexForKey(key: Key) -> Index?
+  public func index(forKey key: Key) -> Index?

-  public mutating func removeValueForKey(key: Key) -> Value?
+  public mutating func removeValue(forKey key: Key) -> Value?
 }

 extension Sequence where Iterator.Element : Sequence {
   // joinWithSeparator(_:) => join(separator:)
-  public func joinWithSeparator<
+  public func joined<
     Separator : Sequence
     where
     Separator.Iterator.Element == Iterator.Element.Iterator.Element
-  >(separator: Separator) -> JoinSequence<Self>
+  >(separator separator: Separator) -> JoinedSequence<Self>
 }

 extension Sequence where Iterator.Element == String {
-  public func joinWithSeparator(separator: String) -> String
+  public func joined(separator separator: String) -> String
 }

 public class ManagedBuffer<Value, Element> : ... {
   public final class func create(
-    minimumCapacity: Int,
+    minimumCapacity minimumCapacity: Int,
     initialValue: (ManagedProtoBuffer<Value, Element>) -> Value
   ) -> ManagedBuffer<Value, Element>
 }

 public protocol Streamable {
-  func writeTo<Target : OutputStream>(inout target: Target)
+  func write<Target : OutputStream>(inout to target: Target)
 }

 public func dump<T, TargetStream : OutputStream>(
   value: T,
-  inout _ target: TargetStream,
+  inout to target: TargetStream,
   name: String? = nil,
   indent: Int = 0,
   maxDepth: Int = .max,
   maxItems: Int = .max
 ) -> T

 extension Sequence {
-  public func startsWith<
+  public func starts<
     PossiblePrefix : Sequence where PossiblePrefix.Iterator.Element == Iterator.Element
   >(
-    possiblePrefix: PossiblePrefix,
+    with possiblePrefix: PossiblePrefix,
     @noescape isEquivalent: (Iterator.Element, Iterator.Element) throws -> Bool
   ) rethrows -> Bool

-  public func startsWith<
+  public func starts<
     PossiblePrefix : Sequence where PossiblePrefix.Iterator.Element == Iterator.Element
   >(
-    possiblePrefix: PossiblePrefix
+    with possiblePrefix: PossiblePrefix
   ) -> Bool
 }

 extension CollectionType where Iterator.Element : Equatable {
-  public func indexOf(element: Iterator.Element) -> Index?
+  public func index(of element: Iterator.Element) -> Index?
 }

 extension CollectionType {
-  public func indexOf(predicate: (Iterator.Element) throws -> Bool) rethrows -> Index?
+  public func index(where predicate: (Iterator.Element) throws -> Bool) rethrows -> Index?
 }

 extension String.Index {
-  public func samePositionIn(utf8: String.UTF8View) -> String.UTF8View.Index
+  public func samePosition(in utf8: String.UTF8View) -> String.UTF8View.Index

-  public func samePositionIn(utf16: String.UTF16View) -> String.UTF16View.Index
+  public func samePosition(in utf16: String.UTF16View) -> String.UTF16View.Index

-  public func samePositionIn(unicodeScalars: String.UnicodeScalarView) -> String.UnicodeScalarView.Index
+  public func samePosition(in unicodeScalars: String.UnicodeScalarView) -> String.UnicodeScalarView.Index
 }

 extension String.UTF16View.Index {
-  public func samePositionIn(characters: String) -> String.Index
+  public func samePosition(in characters: String) -> String.Index

-  public func samePositionIn(utf8: String.UTF8View) -> String.UTF8View.Index
+  public func samePosition(in utf8: String.UTF8View) -> String.UTF8View.Index

-  public func samePositionIn(unicodeScalars: String.UnicodeScalarView) -> String.UnicodeScalarView.Index
+  public func samePosition(in unicodeScalars: String.UnicodeScalarView) -> String.UnicodeScalarView.Index
 }

 extension String.UTF8View.Index {
-  public func samePositionIn(characters: String) -> String.Index
+  public func samePosition(in characters: String) -> String.Index

-  public func samePositionIn(utf16: String.UTF16View) -> String.UTF16View.Index
+  public func samePosition(in utf16: String.UTF16View) -> String.UTF16View.Index

-  public func samePositionIn(unicodeScalars: String.UnicodeScalarView) -> String.UnicodeScalarView.Index
+  public func samePosition(in unicodeScalars: String.UnicodeScalarView) -> String.UnicodeScalarView.Index
 }

 extension String.UnicodeScalarView.Index {
-  public func samePositionIn(characters: String) -> String.Index
+  public func samePosition(in characters: String) -> String.Index

-  public func samePositionIn(utf16: String.UTF16View) -> String.UTF1

... (전체 원문은 같은 폴더의 proposal.md를 참고하세요)
```
