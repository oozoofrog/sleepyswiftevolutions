# SE-0002 research notes

Reviewed 2026-11-26. Dates distinguish the surviving record from the decision itself.

| Evidence and date | What the record establishes | Screen use |
|---|---|---|
| [First preserved proposal, 2015-11-04](https://github.com/swiftlang/swift-evolution/blob/604c4f6dea75/proposals/0002-remove-currying.md) | Joe Groff describes recurring disagreement over whether later argument lists continue the original function or start another one. Labels and mutable parameters made that distinction consequential. He considered the dedicated declaration form of limited use in standard-library and Cocoa practice. The first snapshot already says Accepted. | Why the author proposed removal. Do not infer a ballot, vote date or named opponent from this account. |
| [Corrected migration example, PR 20](https://github.com/swiftlang/swift-evolution/pull/20), [diff, 2015-12-04](https://github.com/swiftlang/swift-evolution/commit/714ab1cb2f) | Moving the closing parenthesis made the closure parameter a String rather than a function from String to Float. This was an example correction after the accepted snapshot. | Show the two actual type fragments. |
| [Compiler commit, 2016-01-21](https://github.com/swiftlang/swift/commit/983a674e0ca35a85532d70a3eb61e71a6d024108) | The compiler made curried declaration syntax an error. Explicit closures preserve the behavior. | Implementation milestone and runnable addition example. |
| [Follow-up draft, 2016-02-02](https://forums.swift.org/t/1284/1), [Lattner’s reply](https://forums.swift.org/t/1284/4) | Erica Sadun and Davide De Franceschi proposed marking unsupplied arguments with underscores. Chris Lattner objected that the same symbol already signifies discarding or ignoring a value. These are paraphrases from a later discussion. The placeholder is not part of SE-0002. | Clearly label the abbreviated example as a proposed alternative. |
| [Swift 3 release, 2016-09-13](https://www.swift.org/blog/swift-3.0-released/) | The release lists SE-0002 among the language changes. Removing chained parameter lists from declarations does not remove consecutive calls to functions that return functions. | Closing comparison. |

No separate formal decision announcement or transcript of the original deliberation was located in the proposal history and discussion sources reviewed. The repository records the outcome. The later forum exchange supplies attributed discussion only for the follow-up idea.

## On-screen identities

Verified GitHub accounts: [Joe Groff](https://github.com/jckarter), [Erica Sadun](https://github.com/erica), [Davide De Franceschi](https://github.com/DeFrenZ), [Chris Lattner](https://github.com/lattner). The proposal links Groff and the follow-up thread links Sadun and De Franceschi.

Sadun: [Swift.org article identifying the photograph](https://www.swift.org/blog/property-wrappers/), [asset and repository license](https://github.com/swiftlang/swift-org-website/blob/main/LICENSE.md). Lattner: [Alexandre Dulaunoy, FOSDEM 2011, cropped version](https://commons.wikimedia.org/wiki/File:FOSDEM_2011_-_Chris_Lattner_-_LLVM_(cropped).jpg), [CC BY-SA 2.0](https://creativecommons.org/licenses/by-sa/2.0/). The downloaded images are scaled to fit. Groff uses an illustration on GitHub. De Franceschi has a profile photograph but its reuse terms were not verified.

The review of the [Joe Groff profile](https://github.com/jckarter), the [Davide De Franceschi profile](https://github.com/DeFrenZ), Wikimedia Commons and Openverse did not identify a portrait of either contributor with verified commercial reuse terms. Both appear by name and GitHub handle when mentioned.
