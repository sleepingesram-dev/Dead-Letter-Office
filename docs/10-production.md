# 10 — Production Plan

The game must be realistic for solo or very-small-team development.

## Full Game Scope

- 2 to 4 hour main story
- 7 shifts
- 50 to 70 letters
- 8 to 12 major characters
- 4 main endings
- 1 secret ending
- 1 main office environment
- 4 to 6 unlockable rooms
- 6 to 8 core tools
- Minimal NPCs
- No combat
- No complex enemy AI
- No open world
- No procedural generation required

### Full Game Content Target

- 55 letters
- 7 shifts
- 5 endings
- 8 main characters
- 20 optional secrets
- 1 main office
- 5 unlockable rooms
- 6 tools
- 4 official record systems
- 1 evolving map
- 1 strong trailer
- 1 polished demo

## MVP Scope

The MVP should be a polished vertical slice:

- 30 to 45 minutes
- 2 shifts
- 15 to 20 letters
- 3 characters
- 1 office room
- 1 filing cabinet area
- 1 map
- 3 sorting bins
- 2 tools
- 1 major twist
- 1 teaser ending

MVP tools: letter opener, stamp, address registry, death records, UV lamp (optional).

MVP characters: Ruth Bell, Jonah Bell, Eleanor Vale.

MVP story reveal: Jonah is dead according to records, but his letters continue to arrive.

MVP ending: a letter appears addressed to the player, dated tomorrow.

### MVP Content Breakdown

**Environment:**

- Sorting desk
- Wall map
- Filing cabinet
- Archive tray
- Incinerator bin

**Letters (15 total):**

- 5 normal letters
- 4 Ruth/Jonah letters
- 3 Eleanor letters
- 2 official memos
- 1 letter addressed to the player

(Full list in [06 — Letters](06-letters.md).)

**The MVP should prove:**

- Sorting mail is satisfying.
- Reading letters is interesting.
- The mystery hook works.
- The office atmosphere works.
- Player choices matter.
- People would wishlist the full version.

## Recommended Build Order

### Phase 1: Prototype the Sorting Loop

Build: desk, incoming tray, letter object, open-letter UI, read letter, stamp letter, sort into bins, end-shift button.

**Goal:** Make sorting physical and satisfying. If stamping letters feels bad, fix it immediately — this game lives or dies on the tactile job loop.

### Phase 2: Add Records and Contradictions

Build: address registry, death records, simple search UI, letters with conflicting information, correct/incorrect sorting logic.

**Goal:** Make the player feel like a document detective.

### Phase 3: Add Consequences

Build: state tracking, letter decisions affecting future letters, map updates, office warnings, re-readable archived letters.

**Goal:** Make decisions feel meaningful.

### Phase 4: Add Atmosphere

Build: lighting, audio ambience, office changes, phone ringing, flickers, environmental details.

**Goal:** Make the office feel wrong without relying on jumpscares.

### Phase 5: Add Secret Layer

Build: UV hidden messages, codes, optional notes, previous clerk clues, secret drawer, alternate ending flag.

**Goal:** Reward obsessive players.

### Phase 6: Build Demo

Build: 2 complete shifts, Steam-ready menu, settings, save system, trailer scenes, demo ending hook.

**Goal:** Release a demo for Steam Next Fest or early wishlist campaign.

## Systems Needed

### Essential Systems

- First-person controller or fixed desk interface
- Interactable objects
- Letter inspection UI
- Document reading UI
- Sorting/stamping system
- Shift progression system
- Decision tracking
- Basic save/load
- Audio manager
- Lighting/event trigger system
- Records database UI
- Archive/re-read system
- Map update system

### Nice-to-Have Systems

- Red string evidence board
- Player notes
- Dynamic office changes
- Multiple endings
- Secret tracking
- Hidden ink tool
- Audio tape playback
- Accessibility font mode
- Text size options
- Colorblind-safe stamps/icons

### Avoid Until Later

- Full town exploration
- NPC character models
- Voice acting for every letter
- Procedural mail generation
- Complex physics
- Combat
- Chase sequences
- Giant branching narrative tree
- Multiplayer
- VR
- Massive ARG

## Recommended Tech Approach

Use whichever engine the developer is comfortable with. Good choices:

### Godot

Pros: lightweight, good for solo dev, good UI tools, no runtime fees, easy 2D/3D hybrid.

Good if the game is desk-focused and UI-heavy.

### Unity

Pros: lots of assets and plugins, good 3D interaction support, easy Steam integration, many tutorials.

Good if the developer wants first-person interaction and asset store support.

### Unreal

Pros: strong visuals, good lighting, Blueprint system.

Cons: heavier, more overhead, overkill for this game unless the developer already knows it.

**Best recommendation: use Godot or Unity.** Do not spend 3 months fighting your engine like a tragic medieval peasant fighting a tax form.

## Asset Strategy

Use simple, reusable assets. Needed assets:

Desk, chair, lamp, filing cabinets, envelopes, papers, stamps, trays, map, clock, phone, radio, incinerator, office door, shelves, fluorescent lights, bulletin board, folders, typewriter or terminal, old printer.

Art should be stylized enough that assets do not need AAA detail. Use texture work and lighting to create quality.

## UI Strategy

The UI should feel like physical paperwork, not modern menus.

UI elements: paper forms, stamped labels, file tabs, typewritten text, redactions, postal codes, warning memos, old terminal screens.

Important UI screens:

- Letter reader
- Envelope inspection
- Address registry
- Death records
- Archive
- Shift summary
- Policy manual
- Map view
- Settings

Accessibility:

- Adjustable text size
- High contrast reading mode
- Option to reduce flicker
- Subtitles for audio clues
- Rebindable controls

## Saving and Progression

Save system:

- Autosave at start of each shift
- Autosave after major decisions
- Manual save optional

Progression unlocks:

- New office tools
- New rooms
- New record systems
- New map areas
- New sorting categories
- New endings

Player choices should be stored as flags. Example flags:

- `RuthLetter1Archived`
- `JonahLetterDelivered`
- `BlackEnvelopeOpened`
- `PreviousClerkNoteFound`
- `BellHouseUnlocked`
- `EleanorChainStarted`
- `DestroyedForbiddenMailCount`
- `ComplianceScore`
- `MemoryRecoveredScore`
