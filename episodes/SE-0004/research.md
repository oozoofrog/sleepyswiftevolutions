# SE-0004 production notes

Chris Lattner traced the four operators to C. Postfix yields the old value and prefix yields the new one. The proposal considers returning Void and explains why that would make prefix and postfix redundant. The example starts each variant independently at four. [Proposal](https://github.com/swiftlang/swift-evolution/blob/main/proposals/0004-remove-pre-post-inc-decrement.md)

The change drew discussion even after deprecation. In April 2016, participants revisited the cost of rewriting loops and how continue and break affect an explicit increment. This retrospective thread is not the acceptance announcement. [Discussion](https://lists.swift.org/pipermail/swift-evolution/Week-of-Mon-20160328/014055.html)

Swift 2.2 deprecated the operators in March 2016. Swift 3 shipped in September 2016. The proposal links the compiler change. [Swift 2.2](https://www.swift.org/blog/swift-2.2-released/) · [Swift 3](https://www.swift.org/blog/swift-3.0-released/) · [Implementation](https://github.com/swiftlang/swift/commit/8e12008d2b34a605f8766310f53d5668f3d50955)

## What the surviving records establish

| Record date (UTC) | Speaker or artifact | What the record supports |
| --- | --- | --- |
| 2015-11-15 | Chris Lattner, first file revision | Both the status line and commit message describe an already accepted change. This dates the record. The precise decision date and original deliberation remain unknown. [First revision](https://github.com/swiftlang/swift-evolution/commit/d093aa24e20f) |
| 2015-11-22 | Proposal edit | A diff deletes the suggestion that keeping the operators might complicate a future numeric model. The commit message attributes a concern about speculation to Doug. The deleted sentence should not be narrated as an adopted rationale. [Diff](https://github.com/swiftlang/swift-evolution/commit/a9e0908ed592) |
| 2015-12-05 | David Zarzycki | Asked whether to extend simplification to user-defined postfix operators, citing ambiguity when referring to an operator as a function. The opening explicitly assumes acceptance. [Original mail](https://lists.swift.org/pipermail/swift-evolution/Week-of-Mon-20151130/000414.html) |
| 2015-12-06 | Jonathan Hull, quoted in Zarzycki’s reply | Hull wrote grammar rules using custom postfix operators. His star meant zero or more repetitions. Zarzycki acknowledged their usefulness and clarified his concern about assigning different meanings by position. The video uses an abbreviated rule label to illustrate Hull’s example. [Reply with quoted example](https://forums.swift.org/t/feedback-for-se-0004-remove-the-and-operators/168/3) |
| 2015-12-06 | Chris Lattner, quoted in a reply | Old source still had to parse so the compiler could diagnose the spelling and suggest fixes. His future schedule was an estimate. [Reply](https://forums.swift.org/t/feedback-for-se-0004-remove-the-and-operators/168/2) |
| 2016-04-17 | Compiler tests and diagnostics | Lattner's commit turns warnings into errors. The loop tests include cases without automatic fixes. The same commit changes tuple splat under SE-0029, a separate decision. [Implementation diff](https://github.com/swiftlang/swift/commit/8e12008d2b34a605f8766310f53d5668f3d50955) |

The forum republishes the mailing list. Matching posts count as one exchange. The feed has no linked discussions for this entry. Searching the proposal repository's pull requests by proposal ID did not identify the original decision thread. The November commit and the dated releases establish different events.

Hull's forum handle is linked by the same wording attributed to Jonathan Hull in a later mail exchange. [Forum post](https://forums.swift.org/t/proposal-and-timeline-for-discourse-transition/7238/8)

For the shipped warning, the Swift 2.2 release tag has a test that expects a deprecation warning for both postfix and prefix increment. [Tagged diagnostic test](https://github.com/swiftlang/swift/blob/swift-2.2-RELEASE/test/Sema/diag_c_style_for.swift)

Closing claim for both editions: readers should be able to tell when a value changes. This paraphrases the proposal’s concerns about position-dependent return values and hard-to-read side effects, illustrated by saving the value before incrementing it. [Disadvantages, items 5–6](https://github.com/swiftlang/swift-evolution/blob/main/proposals/0004-remove-pre-post-inc-decrement.md#disadvantages-of-these-operators)
