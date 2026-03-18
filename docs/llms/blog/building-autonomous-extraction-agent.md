

Fixed extraction strategies work well when you know the document structure. But what if documents vary? What if you don't know which sections contain the data you need? An autonomous agent can explore documents and decide dynamically.

The Problem with Fixed Strategies [#the-problem-with-fixed-strategies]

Traditional extraction follows a fixed path:

1. Parse document
2. Split into chunks
3. Extract from each chunk
4. Merge results

This works when:

* Documents have consistent structure
* You know which sections matter
* The same approach works for all documents

But what if:

* Document structure varies wildly?
* Some documents are 5 pages, others 50?
* Relevant data could be anywhere?

You'd need to process everything, hoping to find what you need. Or write custom logic for each document type.

The Agent Approach [#the-agent-approach]

An extraction agent is an LLM with tools. It can:

* **Read** — View document content
* **Grep** — Search for patterns
* **Find** — Locate specific sections
* **Explore** — Navigate without predefined paths

Instead of processing every chunk, the agent decides what to read based on what it's learned so far.

How It Works [#how-it-works]

The Virtual Filesystem [#the-virtual-filesystem]

The agent sees the document as a filesystem:

```
/artifacts/
├── document.pdf/
│   ├── page-1.txt
│   ├── page-2.txt
│   ├── page-3.txt
│   └── manifest.json
└── manifest.json
```

The manifest describes the document:

```json
{
  "name": "contract.pdf",
  "pages": 15,
  "hasTables": true,
  "hasImages": false
}
```

The Tools [#the-tools]

The agent has access to tools:

| Tool                       | Purpose                 |
| -------------------------- | ----------------------- |
| `read(path)`               | Read file content       |
| `grep(pattern)`            | Search across all files |
| `find(name)`               | Find files by name      |
| `ls(path)`                 | List directory contents |
| `set_output_data(data)`    | Set extraction output   |
| `update_output_data(data)` | Update output (merge)   |
| `finish()`                 | Signal completion       |
| `fail(reason)`             | Signal failure          |

The Loop [#the-loop]

```typescript
while (!finished) {
  const action = await llm.decide({
    tools: availableTools,
    goal: schema,
    context: whatWeveLearned,
  });
  
  const result = await execute(action);
  
  if (action.tool === 'finish' || action.tool === 'fail') {
    finished = true;
  }
}
```

The LLM decides what to do next based on:

* The extraction goal (schema)
* What it's learned so far
* What tools are available

Example: Contract Analysis [#example-contract-analysis]

Let's trace an agent extracting from a 15-page contract:

**Initial state:**

```
Goal: Extract { parties, effectiveDate, term, obligations }
Known: Document has 15 pages, has tables
```

**Step 1: Explore**

```
Agent: "I need to find the parties. Let me search."
→ grep("party|parties|between")
→ Found in page-2.txt, page-5.txt
```

**Step 2: Read**

```
Agent: "Let me read page 2 where 'parties' appears."
→ read("/artifacts/contract.pdf/page-2.txt")
→ Content: "This Agreement is between ACME Corp and Beta Inc..."
```

**Step 3: Extract**

```
Agent: "Found the parties. Let me set them."
→ set_output_data({
    parties: [
      { name: "ACME Corp", role: "Party A" },
      { name: "Beta Inc", role: "Party B" }
    ]
  })
```

**Step 4: Continue**

```
Agent: "Now I need the effective date."
→ grep("effective|date|commencement")
→ Found in page-2.txt, page-8.txt
```

**Step 5: Read**

```
Agent: "Page 2 already read. Let me check page 8."
→ read("/artifacts/contract.pdf/page-8.txt")
→ Content: "Term: This Agreement shall commence on January 1, 2025..."
```

**Step 6: Extract**

```
Agent: "Found the effective date and term."
→ update_output_data({
    effectiveDate: "2025-01-01",
    term: "2 years"
  })
```

**Step 7: Search for obligations**

```
Agent: "I need obligations. Let me search."
→ grep("shall|must|will|obligation")
→ Found in page-3.txt, page-4.txt, page-7.txt, page-10.txt
```

**Step 8: Read selectively**

```
Agent: "That's 4 pages. Let me read page 3 first."
→ read("/artifacts/contract.pdf/page-3.txt")
→ Content: "Party A shall provide services..."

Agent: "Found obligations. Let me read page 4 for more."
→ read("/artifacts/contract.pdf/page-4.txt")
→ Content: "Party B shall make payments..."
```

**Step 9: Final extraction**

```
Agent: "I have all required fields."
→ update_output_data({
    obligations: [
      { party: "Party A", obligation: "Provide services" },
      { party: "Party B", obligation: "Make payments" }
    ]
  })
→ finish()
```

**Result:**

* Read 4 pages out of 15
* Found all required fields
* No wasted processing

Trade-offs [#trade-offs]

Advantages [#advantages]

* **Adapts to document structure** — No need to know layout upfront
* **Efficient** — Only reads relevant sections
* **Handles variation** — Different documents, same agent
* **Explainable** — Can trace decision path

Disadvantages [#disadvantages]

* **Variable token cost** — Depends on agent decisions
* **Requires tool-calling model** — GPT-4, Claude 3.5, etc.
* **Non-deterministic** — Same document might take different paths
* **More complex** — Harder to debug than fixed strategies

When to Use the Agent [#when-to-use-the-agent]

**Use agent when:**

* Document structure varies
* You don't know what sections matter
* Documents are long but sparse
* You need to cross-reference sections

**Use simpler strategies when:**

* Documents have consistent structure
* Entire document is relevant
* You know exactly what to extract
* Cost predictability matters

Implementation Details [#implementation-details]

Prompting Strategy [#prompting-strategy]

The agent prompt includes:

1. **Goal** — The output schema
2. **Available tools** — What it can do
3. **Current state** — What's been extracted
4. **Constraints** — Don't read everything, be efficient

Example system prompt:

```
You are an extraction agent. Your goal is to extract data matching this schema:
{schema}

You have access to a document filesystem. Use tools to explore and extract.

Rules:
- Be efficient. Don't read everything.
- Use grep to find relevant sections.
- Set output data when you have confident extractions.
- Call finish() when all required fields are populated.
- Call fail() if you cannot complete the extraction.
```

Error Handling [#error-handling]

If the agent:

* **Loops forever** — Max steps limit (default: 50)
* **Extracts invalid data** — Validation feedback sent back
* **Fails to extract** — Fallback to simple strategy

Token Tracking [#token-tracking]

Agent extractions track:

* Tokens per tool call
* Total tokens used
* Pages read
* Time taken

This helps optimize prompts and estimate costs.

Comparison with Other Strategies [#comparison-with-other-strategies]

| Strategy   | Pages Read | Tokens   | Best For          |
| ---------- | ---------- | -------- | ----------------- |
| Simple     | All        | High     | Small documents   |
| Parallel   | All        | High     | Speed over cost   |
| Sequential | All        | High     | Order matters     |
| **Agent**  | Variable   | Variable | Unknown structure |

The agent might read 3 pages or 30. It depends on the document.

See Also [#see-also]

* [What is an Extraction Agent?](/docs/what-is-an-extraction-agent)
* [Agent vs Simple vs Parallel](/blog/agent-vs-simple-vs-parallel)
* [Struktur Documentation](/docs)
