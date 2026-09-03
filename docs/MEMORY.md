# Memory

Notes carried over from the sessions that built this, so a new machine has the same context. Update these when something durable changes; `HANDOFF.md` holds the detailed state.

## The project

Started on 2 September 2026 from a single request: a low-poly Xbox controller in the style of the game Firewatch, as an artifact to review. It became a prop generator with a fixed style runtime, then an environment pipeline that composes homes from a household sheet and streets from OpenStreetMap footprints, roads and USGS grade, dressed from Street View captures. The owner's stated aim is a larger LLM process that uses these tools to generate cities.

Layout: `props/` (style runtime, catalog, validator, gallery, CLI, MCP) and `environments/` (research, composing session, verification, manifests, CLI, MCP). One git repo, pushed to https://github.com/Pliskeviski/3d-model-generator. Review surface: the gallery artifact at https://claude.ai/code/artifact/4d0d68f4-d71c-4266-ad60-76669961e660, published from `props/dist/artifact.html`; pass that URL as `url` when publishing to keep it.

## The owner's preferences, with why

- **Model tiers by complexity.** Stated after watching runs: "sonnet is good with smaller and more simple props, opus can handle more complex objects and fable for even more complex like a car." Encoded as the default policy in `props/lib/generate.js`.
- **Honest judgement from stills.** Every model and scene gets one still, one look, one fix, and a plain statement of what does not read. The owner responds to specific gaps ("the ground is getting covered up", "white squares") with screenshots; treat those as bug reports against the catalog, fix the cause there, and say what the cause was.
- **Sheets before placement.** For a home, who lives there decides the inventory (household sheet). For a street, a street sheet with a per-lot table written off photos decides fences, trees, steps, bins and drives. The owner asked for this to be repeatable as a tool step.
- **Compare with the real place.** The owner works from Google Street View at real addresses (239 Hollister Ave, Santa Monica). Realism means the elements the photos show: tree species, parked cars, poles and lines, road markings, fences, grade, building types, landmarks, not photoreal materials. A "June gloom" sky exists for fair comparison; dusk stays the house style.
- **Subscription, not API key.** Generation runs through the `claude` CLI on the owner's login. Long runs go in the background with a progress log and ETA; the owner asks "how's it going" and expects the log.
- **Organisation.** The owner asked for the environment process as its own package beside the props package, and for the whole thing on GitHub with this context included.

## Timings seen so far

Diner mug on Sonnet: 4 min. Fiat Mobi: Sonnet 12 min, Fable 39 min. Honda Fit on Fable: 11 min (it reused a sibling model). Fire station on Opus from screenshots: 11 min. Home environment on Opus: 22 min. Street environment on Opus: 27 min. Opus and Fable spend most of their time composing before writing; the heartbeat in the progress log is what shows they are alive.

## Things that bit us

Undefined materials render as unlit white with no error. Embedded props inherit the scene's colorway unless given their own slots. Bounding boxes measured in world space shrink rotated props. A flat tilted plane hides sloped roads. OpenStreetMap ways run past the query disc. Nominatim lands mid-block on intersections. The browser gallery cannot fetch files, so data ships as script modules.
