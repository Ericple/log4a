# Decorator

To help developers get useful information quickly, Log4a provides several decorators and helper tools for tracking function execution and template string construction.

## `@TraceEntry`

Used to trace function entries

## `@TraceExit`

Used to track function results

## `TracedStr`

Used to track template string construction

## `MarkedTracedStr(marker: string = "Anonymous")`

Used to track template string construction, and the output log carries a marker
