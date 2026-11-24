/**
 * Starts the bridge over stdio like an MCP client does and calls the free
 * tools on the live server. With GRIDIZE_API_KEY set it also checks that the
 * key reaches the server (get_credits, which is free).
 */
import assert from 'node:assert/strict';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const client = new Client({ name: 'smoke', version: '1.0.0' });
await client.connect(
  new StdioClientTransport({
    command: process.execPath,
    args: ['src/index.js'],
    env: { ...process.env },
    stderr: 'inherit',
  })
);

const { tools } = await client.listTools();
const names = tools.map((tool) => tool.name).sort();
console.log('tools:', names.join(', '));
assert.ok(names.includes('image_to_pixel_art'));
assert.ok(names.includes('generate_pixel_art'));

const palettes = await client.callTool({
  name: 'list_palettes',
  arguments: {},
});
assert.ok(!palettes.isError);
console.log('list_palettes: ok');

const converted = await client.callTool({
  name: 'image_to_pixel_art',
  arguments: {
    image_url: 'https://gridize.dev/images/mcp/knight.png',
    palette: 'pico8',
  },
});
assert.ok(!converted.isError, JSON.stringify(converted.content));
assert.equal(converted.content[0].type, 'image');
console.log('image_to_pixel_art:', JSON.stringify(converted.structuredContent));

const credits = await client.callTool({ name: 'get_credits', arguments: {} });
if (process.env.GRIDIZE_API_KEY) {
  assert.ok(!credits.isError, JSON.stringify(credits.content));
  console.log('get_credits: balance', credits.structuredContent.balance);
} else {
  assert.ok(credits.isError);
  console.log('get_credits without a key: explains how to get one');
}

await client.close();
