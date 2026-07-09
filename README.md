# Dead Letter Office

**Sort undeliverable mail from a dead town where every letter changes the truth — and some letters are addressed to you.**

Dead Letter Office is a dark narrative job-sim, mystery game, and psychological horror experience about working alone in a government mail office that processes undeliverable letters from a town that should not exist anymore.

> **North star:** Dead Letter Office is a dark postal mystery where every undeliverable letter is a person asking not to be forgotten.

The core fantasy:

> "I am the last person sorting through the forgotten lives of a dead town, and every letter I process reveals more about what happened there, why it was erased, and why the office knows who I am."

## Play the MVP

The playable MVP (the two-shift vertical slice defined in the [production plan](docs/10-production.md)) is in this repository. It is plain HTML/CSS/JS — no engine, no build step, no dependencies.

**Play in the browser:** https://sleepingesram-dev.github.io/Dead-Letter-Office/ — deployed automatically to GitHub Pages by [a workflow](.github/workflows/deploy-pages.yml) on every push to `main`.

**Or run locally:**

```
git clone https://github.com/sleepingesram-dev/Dead-Letter-Office.git
cd Dead-Letter-Office
python3 -m http.server 8000     # or any static server; opening index.html directly also works
```

Then open `http://localhost:8000` in a browser.

**How to play:** the first letter walks you through the procedure step by step. For every item: take it from the tray, inspect the envelope (flip it, view its contents), then verify what it claims — the sender's town against the ADDRESS REGISTRY, and (from Shift 2) every name against the DEATH RECORDS and the NEWSPAPER ARCHIVE. **FORM 11**, pinned beneath each item, fills in as you check the records and states plainly what policy directs. Then stamp the item into a sorting tray — RETURN TO SENDER, ARCHIVE, or DESTROY. (The DELIVER and REVIEW trays are sealed. Do not ask about the DELIVER and REVIEW trays.) Policy tells you what the office wants; the letters tell you something else, and every deviation is recorded. A DESK REFERENCE drawer explains all of it in one place. Your choices carry across both shifts and change what you see. Headphones recommended; sound is synthesized live and can be toggled off.

**What's in the slice:** 2 full shifts, all 15 MVP letters, the Ruth/Jonah/Eleanor storylines, the black-sealed envelope, the previous clerk's note, the UV lamp, a burned letter that comes back, an archive that changes behind your back, a wall map that gains a house, an office compliance review, and the demo cliffhanger ending.

## Quick Facts

| | |
| --- | --- |
| Genre | Narrative mystery job-sim / psychological horror |
| Perspective | First-person, desk-focused |
| Length | 2–4 hours main story, 4–6 hours completionist |
| Structure | 7 main shifts + final shift + secret epilogue |
| Endings | 4 main endings + 1 secret ending |
| Combat | None |
| Engine | Godot or Unity (recommended) |
| Price | $9.99–$14.99, free demo |

## Design Documentation

| Doc | Contents |
| --- | --- |
| [01 — Vision & Pitch](docs/01-vision.md) | High-level pitch, hooks, genre, target player, design pillars, creative direction |
| [02 — Gameplay](docs/02-gameplay.md) | Core loop, letter inspection, sorting, rules, compliance system, interaction and puzzle design |
| [03 — Setting](docs/03-setting.md) | The Dead Letter Office and the erased town of Marrow Creek |
| [04 — Characters](docs/04-characters.md) | The player, the Bells, Eleanor Vale, Silas Crowe, Director Pike, the Previous Clerk |
| [05 — Story Structure & Endings](docs/05-structure.md) | Shift-by-shift breakdown and all five endings |
| [06 — Letters](docs/06-letters.md) | Letter design rules, example letters, MVP letter list |
| [07 — Secrets & Lore](docs/07-secrets.md) | The five optional secret chains |
| [08 — Art & Audio](docs/08-art-audio.md) | Visual identity, motifs, capsule art, audio direction |
| [09 — Writing](docs/09-writing.md) | Writing style guide and example official policies |
| [10 — Production Plan](docs/10-production.md) | Scope, build order, systems, content targets, tech, assets, UI, saving |
| [11 — Marketing](docs/11-marketing.md) | Trailer design, streamer potential, positioning, pricing, commercial strategy, risks |

## The Game in One Paragraph

You work the night shift in an isolated postal archive, processing undeliverable mail from a forgotten town called **Marrow Creek**. At first the job is mundane and bureaucratic: read names, check addresses, match stamps, verify dates, sort letters according to official rules. Then the letters begin to contradict each other. Some are dated years before the sender was born. Some are addressed to dead people. Some describe events that have not happened yet. Eventually, some letters are addressed directly to you. The office itself begins changing — and you realize it is not just storing mail. It is controlling what is remembered, what is forgotten, and who is allowed to exist.

## MVP at a Glance

A polished 30–45 minute vertical slice: 2 shifts, 15 letters, 3 characters (Ruth Bell, Jonah Bell, Eleanor Vale), one office room, letter opener + stamps + address registry + death records, and one major twist — Jonah is dead according to records, but his letters keep arriving. The demo ends with a letter addressed to the player, dated tomorrow. See [10 — Production Plan](docs/10-production.md).
