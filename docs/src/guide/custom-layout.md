# 日志布局<Badge type="tip" text="1.4.0 +" />

Log4a自1.4.0版本开始，支持开发者自行设置追加器日志布局，1.4.0版本更新了两种布局，分别为：

- `PatternLayout`
- `CSVLayout`

## `PatternLayout`的使用

开发者在定义追加器时，可以通过调用`setLayout(layout)`方法来设置布局

```ts
const myFileAppender = new FileAppender('log.txt','mainFileAppender', Level.ALL).setLayout(new PatternLayout());
```

所有追加器在默认情况下都分配了一个`PatternLayout`，其pattern默认为：`[%-5p]\t%d\t[%C:%r]\t%m`

要自定义一个`PatternLayout`，可以通过在初始化PatternLayout时传入自定义Pattern达成，开发者可以使用以下占位符：

| 占位符 | 描述                                                                                                                                                                  | 用例                        |
| ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------- |
| %C     | 打印Logger所属类名                                                                                                                                                    | %.30c                       |
| %d     | 打印当前日志时间，可通过跟随如`{yyyy-MM-dd}`等参数自定义日期打印格式，默认为`ISO8601`，Log4a还预置了`ABSOLUTE`、`DATE`等格式，可通过例如`%d{ISO8601}`来使用预置格式。 | %d{yyyy-MM-dd HH:mm:ss,SSS} |
| %l     | 打印日志打印堆栈                                                                                                                                                      | %-10l                       |
| %L     | 打印日志输出行号                                                                                                                                                      |                            |
| %m     | 打印日志内容                                                                                                                                                          |                            |
| %p     | 打印日志等级                                                                                                                                                          |                            |
| %r     | 打印自Logger创建以来，打印的日志数量                                                                                                                                  |                            |
| %%     | 打印一个百分号                                                                                                                                                                     |                            |

## 日期打印

- `yyyy` - 年份
- `MM` - 月份
  - 当超过3位时，会以文字方式呈现，如十一月时：`MMM` - `Nov`
- `dd` - 日期
- `HH` - 小时
- `mm` - 分钟
- `ss` - 秒
- `SSS` - 毫秒

> 当实际数字不足所需长度时，左侧补0
