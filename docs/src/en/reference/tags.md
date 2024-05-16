# tag

To help developers get useful information quickly, Log4a provides two tags to track the performance of property functions.

## `TracedStr`

Placed before a template string, used to track build parameters for the template string

## `MarkedTracedStr(mark)`

- `mark` string - Label name

Put in front of the template string, used to track the template string construction parameters, the output log contains` mark `, easy to search

> [!IMPORTANT]
The difference between the two is that `TracedStr` is a tag that can be used directly, while `MarkedTracedStr` is a function that needs to be passed a tag name.