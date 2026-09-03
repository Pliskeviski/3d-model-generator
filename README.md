# Two Forks

Low-poly worlds in a Firewatch-dusk style, built as code.

- `props/` builds single objects: an Xbox controller, a MacBook, a house, a car. One prompt, optional photos or links, a validated model in the gallery with GLB and OBJ exports. Has the style runtime, the furniture catalog, the validator, the gallery, a CLI and an MCP server.
- `environments/` composes lived-in places from those pieces: a home interior from a building and links, a street from a map location. One prompt, research from links and OpenStreetMap, a composing session that follows a written recipe, verification, a manifest. Has a CLI and an MCP server, meant to be driven by a larger city-generation process.

```
cd props && npm install && npm run validate -- --export && npm run gallery
node environments/bin/env.js build "build a street at 4th Street & Hollister Avenue, Santa Monica"
```

`.mcp.json` registers both servers for Claude Code sessions opened in this folder.
