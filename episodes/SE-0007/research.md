# SE-0007 research notebook

A loop is written `for var i = 0; i < 3; i++ { … }`. In Swift 2.2 the compiler accepts it with a warning. What does Swift 3 require the reader to write instead, and which loops did the old form handle that the new one does not translate mechanically?

## Source ledger

| Date (UTC) | Record | What it establishes |
|---|---|---|
| 2015-12-03 | [Erica Sadun's pitch on the Swift Forums](https://forums.swift.org/t/c-style-for-loops/31) | The removal was first proposed here. The mailing-list archive for the pitch week is missing (messages 000000–000410 return 404). The pitch survives only on the forums. |
| 2015-12-04 | [Proposal PR #23](https://github.com/swiftlang/swift-evolution/pull/23) | The first revision already has the final text. The local `proposal.md` copy matches upstream. |
| 2015-12-07 to 12-10 | [Public review opened by Doug Gregor](https://forums.swift.org/t/review-remove-c-style-for-loops-with-conditions-and-incrementers/255) and [a parallel discussion thread](https://forums.swift.org/t/review-for-remove-c-style-for-loops-with-conditions-and-incrementers/259) | Gregor closed the review on 2015-12-11 without announcing a decision in that thread. On 2015-12-07 Dmitri Gribenko asked for data on loops without a better replacement and noted that a `while` equivalent of a loop containing `continue` duplicates the increment ([259/1](https://forums.swift.org/t/review-for-remove-c-style-for-loops-with-conditions-and-incrementers/259/1)). All 8 community quotes in the proposal are verbatim. All 8 are supportive. The objections, several with code, are not quoted. |
| 2015-12-14 | [Acceptance by Doug Gregor](https://forums.swift.org/t/accepted-se-0007-remove-c-style-for-loops-with-conditions-and-incrementers/512/1) | Accepted for Swift 3.0. The core team judged that counting down SHOULD be eased by Standard Library improvements, that advanced uses were too rare to keep the form, that optimizer work could close the performance gap, and that `while` loops were an acceptable substitute for performance-critical code. Staged plan: Swift 2.2 warns ([SR-226, swiftlang/swift#42848](https://github.com/swiftlang/swift/issues/42848)) and Swift 3.0 removes the form ([SR-227, swiftlang/swift#42849](https://github.com/swiftlang/swift/issues/42849)). Erica Sadun thanked the list the same day ([512/2](https://forums.swift.org/t/accepted-se-0007-remove-c-style-for-loops-with-conditions-and-incrementers/512/2)). |
| 2016-03-21 | Swift 2.2 release | The deprecation warning ships ([swiftlang/swift PR #552](https://github.com/swiftlang/swift/pull/552), by gregomni). The Swift 2.2 release blog does not list SE-0007. Use the 2.2 CHANGELOG, the tagged `diag_c_style_for.swift` test and the 2016-03-30 "new features" post as evidence. |
| 2016-04-17 | [Commit 183ae242](https://github.com/swiftlang/swift/commit/183ae242) by Chris Lattner | The warning becomes an error. Do not cite `8e12008d`: that is the SE-0004 commit, and in it the C-style `for` is still a warning. |
| 2016-09-06 | Proposal status change | Status set to "Implemented (Swift 3)". |
| 2016-09-13 | [Swift 3.0 release](https://www.swift.org/blog/swift-3.0-released/) | The form is removed. |

## Example verification

- Opening draft: `for var i = 0; i < 3; i++` morphs into `for i in 0..<3`. The edit adds characters, so it MUST use the glyph-morph animation. `codeReveal` only removes text.
- Swift 6.4.2 (local) still rejects the C-style form and offers no fix-it. Its message reads "was removed in Swift 3". Swift 3.0 read "has been removed in Swift 3".
- The Swift 2.2 fix-it rewrote only simple counting-up loops. It did not handle counting down, steps other than 1, `<=`, or a loop variable changed inside the body.
- The 2.2 blog spellings `reverse()` and `0.stride(...)` do not compile in Swift 6.4.2. The proposal's `blk_xor` example still compiles.
- The proposal's `println` example is a deliberate verbatim copy of Swift 1.x gist code (PR #28 tried to modernize it and was closed). If shown, label it as Swift 1.x code found in the wild.
- No Swift 2.2 or 3.0 compiler was run. Behaviour of those releases comes from the tagged tests only.

## Objections worth telling

All items below were read in the original forum posts.

- Dmitri Gribenko (2015-12-07, [259/1](https://forums.swift.org/t/review-for-remove-c-style-for-loops-with-conditions-and-incrementers/259/1)): a `while` rewrite of a loop with `continue` must duplicate the increment. The other session also confirmed locally that a `while` rewrite that forgets the increment before `continue` hangs.
- Paul Cantrell (2015-12-09, [255/2](https://forums.swift.org/t/review-remove-c-style-for-loops-with-conditions-and-incrementers/255/2)): supported the removal. The feature is not widely used, is easily replaced and is inconsistent with the language.
- Stephen Canon (2015-12-10, [255/3](https://forums.swift.org/t/review-remove-c-style-for-loops-with-conditions-and-incrementers/255/3)): mild concern. Removal leaves a hole that should be filled first.
- Two variables stepped together: `for var i = 10, j = 20; i > 0 && j > 0; i -= 1, j -= 2` versus `zip(10.stride(to: 0, by: -1), 20.stride(to: 0, by: -2))`, discussed in [255/10](https://forums.swift.org/t/review-remove-c-style-for-loops-with-conditions-and-incrementers/255/10) onward.
- David Owens II (2015-12-10, [255/17](https://forums.swift.org/t/review-remove-c-style-for-loops-with-conditions-and-incrementers/255/17)): XCTest timings. Non-optimized: C-style 0.126 s, zip+stride 2.189 s (about 17×). Optimized: 0.008 s versus 0.015 s (about 2×). He also found the zip version less readable.
- Paul Cantrell ([255/21](https://forums.swift.org/t/review-remove-c-style-for-loops-with-conditions-and-incrementers/255/21)) then reported zip+stride ran faster than the C-style loop when both variables were used in the body. Treat the benchmark as disputed.
- Thorsten (2015-12-11, [255/23](https://forums.swift.org/t/review-remove-c-style-for-loops-with-conditions-and-incrementers/255/23)): "I revoked my support", citing the performance results and repeated suggestions to use `defer` for the increment "even though it changes semantics".

The proposal says removing these loops "starves" `++`/`--`. One line pointing back to SE-0004 covers this. SE-0007 should tell the loop and `continue` story without re-explaining `++`.

## Names and credits

- "Douglas Gregnor" in the proposal is Douglas Gregor. "Andy Matsuchak" is Andy Matuschak.
- The 2015 post now credited to Lily Ballard was signed "Kevin Ballard". Show her current name with GitHub handle `lilyball`. Show no email addresses.
- `blk_xor`: the C half came from ChanMaxthon and the Swift half from Lily Ballard. Credit both.
- jckarter's GitHub display name contains invisible Unicode characters. Strip them before rendering.
- The proposal's searches of Apple's codebase and GitHub gists give no counts or method. Do not present them as measurements.

## Portraits

- Chris Lattner: reuse the FOSDEM photo (CC BY-SA 2.0).
- Erica Sadun: reuse the swift.org photo (Apache 2.0, no photographer named).
- Doug Gregor and other participants: no commercial-use permission found. Show name and account only.

## Production notes

- `init` does not create `research.md`, and `pnpm evo script` will not run without it. This file fills that gap.
- The starter template conflicts with series rules: it puts a hint in the opening puzzle, uses a different title format, and does not end the outro in 다. Fix these when drafting the script.
- Link bugs directly to swiftlang/swift#42848 and #42849. The bugs.swift.org links redirect twice.

## Gaps

- Not traced: the commit that brought SR-533's `var` removal into Swift 2.2, and any separate removal PR for SR-227.
