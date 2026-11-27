# Gridize: pixel art MCP server for Claude, Cursor and Codex

An MCP server that lets Claude, Claude Code, Codex, Cursor, Antigravity or
any [Model Context Protocol](https://modelcontextprotocol.io) client make
pixel art through [Gridize](https://gridize.dev/?utm_source=github&utm_medium=mcp).
Your agent can:

- **generate pixel art sprites** from a text prompt at 16, 32 or 64 px;
- **animate a sprite** from a motion prompt (walk, idle, attack, spells) and
  get a looping GIF plus every frame;
- **turn any image into clean pixel art** on a real grid, including AI
  images with blurry or uneven "fake" pixels: free, no account.

Hosted server, nothing to run: add one URL and sign in. A local `npx`
bridge is there for clients that only run local servers.

Install page: [gridize.dev/mcp](https://gridize.dev/mcp?utm_source=github&utm_medium=mcp)

| Prompt | Result |
|---|---|
| `generate_pixel_art`: "a knight with a blue shield", 32 px | <img src="https://gridize.dev/images/mcp/knight.png" width="128" alt="A 32 px pixel art knight" style="image-rendering: pixelated"> |
| `animate_sprite`: "walks to the right in a loop" | <img src="https://gridize.dev/images/mcp/knight-walk.gif" width="128" alt="The knight walking in a loop" style="image-rendering: pixelated"> |
| `image_to_pixel_art`: blurry or AI-made image → clean grid | <img src="https://gridize.dev/images/converter/before-after.webp" width="260" alt="An image before and after conversion to pixel art"> |

## What to ask your agent

- "Make a 32 px pixel art slime enemy for my Godot game and save it to
  `assets/sprites/`."
- "Animate `player.png` walking right, then save the GIF and every frame
  next to it."
- "This AI image has blurry pixels. Convert it to clean pixel art with the
  PICO-8 palette."
- "Turn these four item icons into pixel art at the same size and palette."

## Install

### Let your AI do it

Paste this into Claude Code, Codex, Cursor, Antigravity or any AI assistant:

```
Install the Gridize MCP server for me. Follow the guide at https://gridize.dev/mcp.md
```

It follows the [install guide for AI agents](https://gridize.dev/mcp.md). You
sign in to Gridize once in the browser; new accounts get free trial credits.
No API key needed.

### Or set it up yourself

MCP URL (Streamable HTTP, sign in with OAuth): `https://gridize.dev/api/mcp/account`

**Claude** (web, desktop and mobile): open claude.ai → Customize → Connectors
→ + Add → Add custom connector, paste the URL, then Connect and sign in. The
Free plan allows one custom connector.

**Claude Code**

```sh
claude mcp add --transport http --scope user gridize https://gridize.dev/api/mcp/account
```

Then type `/mcp` in Claude Code, pick gridize and sign in.

**Codex**

```sh
codex mcp add gridize --url https://gridize.dev/api/mcp/account
codex mcp login gridize
```

**Cursor**: `~/.cursor/mcp.json`, then enable gridize in Cursor Settings →
MCP and sign in when asked.

```json
{ "mcpServers": { "gridize": { "url": "https://gridize.dev/api/mcp/account" } } }
```

**Antigravity**: `~/.gemini/config/mcp_config.json`, then Agent settings →
Customizations → Authenticate, and paste the code from the sign-in page.

```json
{ "mcpServers": { "gridize": { "serverUrl": "https://gridize.dev/api/mcp/account" } } }
```

### Without an account

`https://gridize.dev/api/mcp` needs no sign-in and offers the free tools
(`image_to_pixel_art`, `list_palettes`).

### API key, or clients that only run local servers

For scripts and clients without sign-in, create a key at
[gridize.dev/settings/apikeys](https://gridize.dev/settings/apikeys) and send
`Authorization: Bearer <key>`. Keep keys in config or environment variables,
never in a chat.

This package is a small local (stdio) bridge to the hosted server for clients
that only run local servers. It needs Node.js 18 or later:

```json
{
  "mcpServers": {
    "gridize": {
      "command": "npx",
      "args": ["-y", "gridize-mcp"],
      "env": { "GRIDIZE_API_KEY": "YOUR_API_KEY" }
    }
  }
}
```

Omit `env` to use only the free tools.

| Variable | Purpose |
|---|---|
| `GRIDIZE_API_KEY` | API key for the credit-based tools (optional) |
| `GRIDIZE_MCP_URL` | Server URL; defaults to `https://gridize.dev/api/mcp` |

## Tools

| Tool | Key | Cost | What it does |
|---|---|---|---|
| `image_to_pixel_art` | No | Free | PNG, JPEG or WebP up to 1024 px → native-size pixel art; automatic pixel size, a color limit or one of 25 palettes |
| `list_palettes` | No | Free | The 25 palette presets (PICO-8, NES, Game Boy…) with their colors |
| `generate_pixel_art` | Yes | 8 credits for one, 20 for four | Sprites at 16, 32 or 64 px from a prompt in any language; saved to your Gridize library |
| `animate_sprite` | Yes | 30 credits up to 33 frames, 40 longer | Starts an animation from a 16–256 px PNG sprite and a motion prompt; returns an id |
| `get_animation` | Yes | Free | The finished loop as a GIF and, on request, every frame as a PNG; failed clips are refunded |
| `get_credits` | Yes | Free | Your balance and the price of each tool |

Prices are the same as in the [Gridize studio](https://gridize.dev/pricing?utm_source=github&utm_medium=mcp).
Rendering an animation takes a few minutes; the agent polls `get_animation`.

## Limits and privacy

- Free tools: 10 calls a minute per address; images up to 10 MB and 1024 px
  on the longer side.
- Images sent to the converter are processed in memory and not stored.
  Generated sprites and animations are saved to your Gridize library, where
  you can change timing or export sprite sheets.
- The bridge forwards requests to gridize.dev and stores nothing locally.

## Development

```sh
npm install
npm test        # calls the live server; set GRIDIZE_API_KEY to test a key
```

## License

MIT for the code in this repository. Use of the hosted service follows the
[Gridize terms](https://gridize.dev/terms).
