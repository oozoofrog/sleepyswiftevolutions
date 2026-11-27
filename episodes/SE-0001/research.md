# SE-0001 · How Swift recognized an argument label

The [first recorded proposal](https://github.com/swiftlang/swift-evolution/commit/463051803866) dates from 4 November 2015 UTC. [Doug Gregor's text](https://github.com/swiftlang/swift-evolution/blob/main/proposals/0001-keywords-as-argument-labels.md) considers retaining the old grammar and making only in context-sensitive. The estimate of nearly 200 imported APIs and the 90 percent share refer to the proposal's survey of keyword conflicts. The film attributes both alternatives to the document. It invents no review dialogue.

The [compiler commit](https://github.com/swiftlang/swift/commit/c8dd8d066132683aa32c2a5740b291d057937367) changes parsing and tests, including an imported Objective-C call with protocol as a label. The [23 December status edit](https://github.com/swiftlang/swift-evolution/commit/960107656dff) records implementation. [Swift 2.2 shipped on 21 March 2016](https://www.swift.org/blog/swift-2.2-released/). The exception for parameter introducers is described in its historical declaration context.

The opening list and search for 7 are editorial examples. On Apple Swift 6.4.2 the following program printed 1 twice. The compiler warned about the redundant backticks in the second call.

```swift
func indexOf(_ value: Int, in list: [Int]) -> Int? { list.firstIndex(of: value) }
let list = [4, 7, 9]
print(indexOf(7, in: list)!)
print(indexOf(7, `in`: list)!)
```

The historical syntax was checked against the original text. The run above used the modern compiler.
