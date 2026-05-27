import { Hono } from "hono";

const app = new Hono();

const HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Struktur Debug</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-50 text-gray-900 min-h-screen">
  <div class="max-w-4xl mx-auto p-6">
    <h1 class="text-2xl font-bold mb-6">Struktur Debug</h1>

    <form id="form" class="bg-white rounded-lg shadow p-6 mb-6 space-y-4">
      <div>
        <label class="block text-sm font-medium mb-1">File</label>
        <input type="file" name="file" required class="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium mb-1">Model</label>
          <input type="text" name="model" value="openai/gpt-4o-mini" class="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Strategy</label>
          <select name="strategy" class="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="simple">simple</option>
            <option value="parallel">parallel</option>
            <option value="sequential">sequential</option>
            <option value="parallelAutoMerge">parallelAutoMerge</option>
            <option value="sequentialAutoMerge">sequentialAutoMerge</option>
            <option value="doublePass">doublePass</option>
            <option value="doublePassAutoMerge">doublePassAutoMerge</option>
            <option value="agent">agent</option>
          </select>
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium mb-1">Schema (JSON) or Fields shorthand</label>
        <input type="text" name="schema" value='{"type":"object","properties":{"content":{"type":"string"}}}' class="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <p class="text-xs text-gray-500 mt-1">Leave as-is for a generic object schema, or enter a fields shorthand like <code>name,email,phone</code>.</p>
      </div>

      <div>
        <label class="block text-sm font-medium mb-1">API Key (optional)</label>
        <input type="password" name="apiKey" placeholder="Bearer token if auth is enabled" class="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>

      <div class="flex items-center gap-4">
        <button type="submit" id="submitBtn" class="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-50">Upload &amp; Extract</button>
        <button type="button" id="clearBtn" class="text-gray-600 px-4 py-2 rounded text-sm font-medium hover:bg-gray-100">Clear</button>
      </div>
    </form>

    <div id="status" class="hidden mb-4 text-sm font-medium text-blue-700"></div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="bg-white rounded-lg shadow p-4">
        <h2 class="text-sm font-semibold text-gray-700 mb-2">Events</h2>
        <pre id="events" class="text-xs font-mono bg-gray-900 text-green-400 rounded p-3 h-96 overflow-auto"></pre>
      </div>
      <div class="bg-white rounded-lg shadow p-4">
        <h2 class="text-sm font-semibold text-gray-700 mb-2">Result</h2>
        <pre id="result" class="text-xs font-mono bg-gray-900 text-blue-300 rounded p-3 h-96 overflow-auto">Waiting...</pre>
      </div>
    </div>
  </div>

  <script>
    const form = document.getElementById('form');
    const submitBtn = document.getElementById('submitBtn');
    const clearBtn = document.getElementById('clearBtn');
    const eventsEl = document.getElementById('events');
    const resultEl = document.getElementById('result');
    const statusEl = document.getElementById('status');

    clearBtn.addEventListener('click', () => {
      eventsEl.textContent = '';
      resultEl.textContent = 'Waiting...';
      statusEl.classList.add('hidden');
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      eventsEl.textContent = '';
      resultEl.textContent = 'Streaming...';
      submitBtn.disabled = true;
      statusEl.textContent = 'Connecting...';
      statusEl.classList.remove('hidden');

      const formData = new FormData(form);
      const apiKey = formData.get('apiKey');
      formData.delete('apiKey');

      // Try schema first; if it doesn't parse, treat as fields shorthand
      const schemaOrFields = formData.get('schema');
      formData.delete('schema');
      try {
        JSON.parse(schemaOrFields);
        formData.append('schema', schemaOrFields);
      } catch {
        formData.append('fields', schemaOrFields);
      }

      const headers = {};
      if (apiKey) {
        headers['Authorization'] = 'Bearer ' + apiKey;
      }

      try {
        const response = await fetch('/extract/stream', {
          method: 'POST',
          body: formData,
          headers,
        });

        if (!response.ok) {
          const text = await response.text();
          resultEl.textContent = 'HTTP ' + response.status + '\\n' + text;
          statusEl.textContent = 'Error: HTTP ' + response.status;
          statusEl.classList.replace('text-blue-700', 'text-red-700');
          return;
        }

        statusEl.textContent = 'Streaming events...';
        statusEl.classList.replace('text-red-700', 'text-blue-700');

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let events = [];

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\\n');
          buffer = lines.pop();

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const payload = line.slice(6);
              if (!payload) continue;
              try {
                const event = JSON.parse(payload);
                events.push(event);
                eventsEl.textContent = events.map(ev => JSON.stringify(ev, null, 2)).join('\\n---\\n');
                eventsEl.scrollTop = eventsEl.scrollHeight;

                if (event.type === 'complete') {
                  resultEl.textContent = JSON.stringify(event.data, null, 2);
                  statusEl.textContent = 'Complete';
                }
                if (event.type === 'error') {
                  resultEl.textContent = JSON.stringify(event.data, null, 2);
                  statusEl.textContent = 'Error: ' + event.data.message;
                  statusEl.classList.replace('text-blue-700', 'text-red-700');
                }
              } catch {
                // ignore malformed SSE lines
              }
            }
          }
        }

        if (statusEl.textContent === 'Streaming events...') {
          statusEl.textContent = 'Finished (no complete event)';
        }
      } catch (err) {
        resultEl.textContent = err.message;
        statusEl.textContent = 'Network error';
        statusEl.classList.replace('text-blue-700', 'text-red-700');
      } finally {
        submitBtn.disabled = false;
      }
    });
  </script>
</body>
</html>`;

app.get("/", (c) => {
  return c.html(HTML);
});

export default app;
