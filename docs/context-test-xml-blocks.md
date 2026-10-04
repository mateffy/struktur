# Context test: XML blocks

This note records the harness context check for issue #59.

## What the test checks

The issue body must arrive on the task as an XML block. It must not be injected
into the system prompt.

## What was observed

The task message carried the issue as an XML element:

```xml
<issue number="59" state="OPEN" title="context test: xml blocks"
       url="https://github.com/mateffy/struktur/issues/59" labels="agent:auto">
The issue body must arrive as an XML block, not in the system prompt.
</issue>
```

The body text is present inside that element. The system prompt does not contain
the body.

## Result

Pass. No product code is affected.
