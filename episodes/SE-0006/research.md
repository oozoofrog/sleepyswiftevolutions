# SE-0006 research notebook

A race official needs both the finish order and a list sorted by bib number. In Swift 2.2, what happens to the finish record after `let order = bibs.sort()`? What must a reader of Swift 3 write to get the same result?

## Source ledger

| Date | Record | What it establishes |
|---|---|---|
| 2015-12-02 | [First surviving proposal revision](https://github.com/swiftlang/swift-evolution/blob/12f00334057e/proposals/0006-apply-api-guidelines-to-the-standard-library.md) | Dave Abrahams, Dmitri Gribenko and Maxim Moiseev proposed applying the emerging naming guidelines across the standard library. The first text gives protocol and iterator examples. The sorting diff appeared later. |
| 2016-01-20 | [API diff added to the proposal](https://github.com/swiftlang/swift-evolution/blob/9bb6efeb8d85/proposals/0006-apply-api-guidelines-to-the-standard-library.md) | The diff pairs the value-returning `sort()` with `sorted()` and the mutating `sortInPlace()` with `sort()`. |
| 2016-01-22 | [Doug Gregor opens public review](https://forums.swift.org/t/review-se-0006-apply-api-guidelines-to-the-standard-library/1163/1) | The standard library, Swift API Design Guidelines and Objective-C importer reviews ran together. This episode covers the standard library. |
| 2016-01-25 | [Radek Pietruszewski’s review](https://forums.swift.org/t/review-se-0006-apply-api-guidelines-to-the-standard-library/1163/6) | He argued that a shorter, easier-to-enter spelling could encourage callers to choose the nonmutating operation. He also discussed the difficulty of forming English participles. The film attributes the first argument to him. |
| 2016-02-13 | [Standard library implementation update](https://github.com/swiftlang/swift/commit/efaa39ea794d) | Gribenko updated APIs to track the design guidelines, including first-argument labels. This work was broader than the zero-argument calls in the film. |
| 2016-03-03 | [Gregor’s decision](https://forums.swift.org/t/accepted-with-modifications-se-0006-apply-api-guidelines-to-the-standard-library/1667/1) and [accepted text](https://github.com/swiftlang/swift-evolution/blob/a4a9f33c208b/proposals/0006-apply-api-guidelines-to-the-standard-library.md) | The team accepted a revised proposal. Changes included first-argument labels, enum case spelling and deferral of changes to Unmanaged. The record does not attribute these modifications to the sorting objection. |
| 2016-09-13 | [Swift 3.0 release](https://www.swift.org/blog/swift-3.0-released/) | The release announcement lists SE-0006 among the shipped changes and identifies it as a major source of migration work. |

## Example verification

The three bib numbers and the finish-line story are original teaching material. The animation shows where the values end up. Its movement does not represent a particular sorting algorithm.

- The Swift 2.2 release test assigns `ary.sort()` to a second array. A separate test calls `sortInPlace()` on a mutable collection. The episode’s historical code was checked against the release tests and the proposal signatures. [Swift 2.2 release tests](https://github.com/swiftlang/swift/blob/swift-2.2-RELEASE/test/1_stdlib/Sort.swift.gyb)
- The Swift 3.0 release test assigns `ary.sorted()` to a second array and uses `sort()` on a mutable collection. [Swift 3.0 release tests](https://github.com/swiftlang/swift/blob/swift-3.0-RELEASE/validation-test/stdlib/Sort.swift.gyb)
- Local execution used Apple Swift 6.4.2. With `var bibs = [3, 1, 2]`, the first assertion checked `bibs == [3, 1, 2]` and `order == [1, 2, 3]` after `let order = bibs.sorted()`. The second assertion checked `bibs == [1, 2, 3]` after `bibs.sort()`. Both passed. The execution used the installed compiler. Historical verification used the two tagged sources above.

The closing sentence in both editions connects this example to the aim of making standard library calls readable under common guidelines. Sorting is one example from the full proposal.
