# LogView

An ArkUI component for displaying Logger logs in an application. It can be imported through the deep path:

```ts
import { LogView, LogViewMode, LogViewColorConfig } from '@pie/log4a/src/main/ets/components/LogView';
```

## `LogView`

- `src` Logger - The Logger to display
- `config` LogViewConfigAll | LogViewConfigSession - Display configuration

## `LogViewMode`

- `ALL` - Display history logs (usually rolled cache files; `DailyRollingFileAppender` also includes the current session)
- `SESSION` - Display current session logs (history must be enabled on the appender)

## `LogViewColorConfig`

Log color configuration, containing `fatal`, `error`, `warn`, `info`, `debug`, `trace` color properties.

## `LogViewConfig`

- `mode` LogViewMode - Display mode
- `colorConfig` LogViewColorConfig - Color configuration

## `LogViewConfigAll`

- Adds `appender: string` to `LogViewConfig`, used to display history logs of a named file-type Appender.

## `LogViewConfigSession`

- Adds `appender: string | AppenderTypeEnum` to `LogViewConfig`, used to display current session logs by name or type.
