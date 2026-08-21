# LogView

用于在应用中展示 Logger 日志的 ArkUI 组件，可通过深路径导入：

```ts
import { LogView, LogViewMode, LogViewColorConfig } from '@pie/log4a/src/main/ets/components/LogView';
```

## `LogView`

- `src` Logger - 要展示的Logger
- `config` LogViewConfigAll | LogViewConfigSession - 展示配置

## `LogViewMode`

- `ALL` - 展示历史日志（通常为已滚动生成的缓存文件；`DailyRollingFileAppender` 还会包含当前会话，当前会话部分需启用历史记录）
- `SESSION` - 展示当前会话日志（需要Appender启用历史记录）

## `LogViewColorConfig`

日志颜色配置，包含 `fatal`、`error`、`warn`、`info`、`debug`、`trace` 颜色属性。

## `LogViewConfig`

- `mode` LogViewMode - 展示模式
- `colorConfig` LogViewColorConfig - 颜色配置

## `LogViewConfigAll`

- 在 `LogViewConfig` 基础上增加 `appender: string`，用于按名称展示文件类Appender的历史日志。

## `LogViewConfigSession`

- 在 `LogViewConfig` 基础上增加 `appender: string | AppenderTypeEnum`，用于按名称或类型展示当前会话日志。
