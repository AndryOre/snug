# 18. The privacy policy is translated and the English text prevails

## Status

Accepted. Supersedes the "English only" scope cut made for the privacy page in
the landing spec (AO-1248).

## Context

The privacy page launched English only because translating a legal text raises
two questions: who reviews the translation, and which version prevails when they
differ. The rest of the Landing page is translated into nine other locales, so
visitors reading it in their language landed on an English page from the footer,
and the extension linked the same English page from every UI language.

## Decision

- The privacy policy is published in every site locale at `/<locale>/privacy/`.
- Translations are AI-made with no human review. Each translated page shows a
  notice that it is a translation and that the English version prevails, with a
  link to `/privacy/`.
- `PRIVACY_POLICY.md` stays the canonical English source, rendered at
  `/privacy/`. The store listings keep linking `/privacy/`, because their
  privacy URL is a single field per item.
- The extension links the privacy page in its UI language, falling back to
  English.

## Considered Options

- **Native-speaker review before publishing**: rejected. It would block every
  policy edit across nine locales on a reviewer who may not exist.
- **Stay English only**: rejected. The rest of the site is translated, and the
  policy is the page where a visitor most needs to understand what is collected.

## Consequences

- A change to the English policy has to update every translation in the same
  change. A drift test compares each translation's "Last updated" date and
  heading structure with the English policy and fails the build otherwise.
- The translations carry no legal weight of their own, so a wrong translation is
  a bug to fix, not a different promise.
