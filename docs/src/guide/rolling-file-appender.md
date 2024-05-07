# 滚动文件追加器

为了方便开发者使用，`Log4a`对文件追加器进一步封装，提供了两种滚动文件追加器，分别为：

- `DailyRollingFileAppender` - 每日滚动文件追加器
- `RollingFileAppender` - 滚动文件追加器

## 每日滚动文件追加器

每日滚动文件追加器会每天输出一个日志文件，开发者不能指定日志文件名。要使用每日滚动文件追加器，开发者必须在LogManager中先指定日志文件存储位置。

```ts
// EntryAbility.ets
export default class EntryAbility extends UIAbility {
    onCreate(want: Want, launchParam: AbilityConstant.LaunchParam): void {
        // ...其他代码
        LogManager.setLogFilePath(this.context.filesDir);
    }
    // ...其他代码
}
```

随后可以在页面中新建一个追加器，并通过addAppender方法绑定至Logger

```ts
// Index.ets
const myDailyRollingFileAppender: DailyRollingFileAppender = new DailyRollingFileAppender('main', Level.ALL, true);

@Entry
@Component
struct Index {
    logger: Logger = LogManager.getLogger(this).addAppender(myDailyRollingFileAppender);
    
    build(){
        // ...其他代码
    }
}
```