# Scroll file append

In order to facilitate the use of developers, 'Log4a' further encapsulates the file append, providing two kinds of rolling file append, respectively:

- `DailyRollingFileAppender` - Daily scroll file appender
- `RollingFileAppender` - Scroll file appender

## Daily scroll file append

The daily scroll file append outputs one log file per day, and the developer cannot specify the log file name. To use the daily scroll file append, the developer must first specify the log file storage location in the LogManager.

```ts
// EntryAbility.ets
export default class EntryAbility extends UIAbility {
    onCreate(want: Want, launchParam: AbilityConstant.LaunchParam): void {
        // ...Other code
        LogManager.setLogFilePath(this.context.filesDir);
    }
    // ...Other code
}
```

You can create an append on the page and bind it to the Logger using the addAppender method

```ts
// Index.ets
const myDailyRollingFileAppender: DailyRollingFileAppender = new DailyRollingFileAppender('main', Level.ALL, true);

@Entry
@Component
struct Index {
    logger: Logger = LogManager.getLogger(this).addAppender(myDailyRollingFileAppender);
    
    build(){
        // ...Other code
    }
}
```