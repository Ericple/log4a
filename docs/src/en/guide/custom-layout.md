<script setup>
import {defineAsyncComponent} from 'vue';
import {inBrowser} from 'vitepress';

const DemoEditor = inBrowser ? defineAsyncComponent(()=>import('../components/DemoEditor.vue')):()=>null;
</script>
# Badge type="tip" text="1.4.0 +" />

Since version 1.4.0, Log4a supports developers to set their own add-on log layout, and version 1.4.0 updates two layouts, respectively:

- `PatternLayout`
- `CSVLayout`

## Use of 'PatternLayout'

When defining the append, the developer can set the layout by calling the 'setLayout(layout)' method

```ts
const myFileAppender = new FileAppender('log.txt','mainFileAppender', Level.ALL).setLayout(new PatternLayout());
```

All apenders are assigned a 'PatternLayout' by default, the pattern of which defaults to: '[%-5p]\t%d\t[%C:%r]\t%m'

To customize a 'PatternLayout', you can do this by passing the custom Pattern when initializing PatternLayout. The developer can use the following placeholders:

| placeholder | description | use case |
| ----------- | ----------- |--------------------------------------------- | ----------------------------- |
| %C | Prints the name of the class to which the Logger belongs                                                    | %.30c                         |
| %d | to print the current log time, you can customize the DATE print format by following parameters such as' {yyyy-MM-dd} ', the default is' ISO8601 ', Log4a also preset 'ABSOLUTE', 'date' and other formats, The preset format can be used by, for example, '%d{ISO8601}'. | `%d{yyyy-MM-dd HH:mm:ss,SSS}` |
| %l | Print log print stack                                                  | %-10l                         |
| %L | Indicates the row number of the log output                                                  |                               |
| %m | Displays the log content                                                    |                               |
| %p | Indicates the log level                                                    |                               |
| %r | print since Logger was created, Number of logs to be printed                  |                               |
| %% | Print a percent sign                                                   |                               |

## Date print

- `yyyy` - Year
- `MM` - month
  - When there are more than 3 digits, it is presented as text, such as November: 'MMM' - 'Nov'
- `dd` - Date
- `HH` - hour
- `mm` - minutes
- `ss` - second
- `SSS` - milliseconds

> When the actual number is short of the required length, add 0 to the left

## Unit formatting

The developer can provide more information in the placeholder to format the information

The alignment and length setting information must follow the '%' character

- `%-5p` - Align to the left, minimum length is 5 characters, if insufficient, fill space to the right
- `%10p` - The minimum length is 10 characters. If it is insufficient, fill space to the left
- `%.10C` - The maximum length is 10 characters. Any part exceeding 10 characters will be intercepted
- `% -5.10c` - Maximum length 10 characters, minimum length 5 characters, justified on the left

Other parameters can be passed by adding a `{}` wrapper to the tail

- `%d{yyyy-MM-dd}` - Format a date in the format yyyy-MM-dd

> [!TIP]
> is currently valid only for other arguments passed in %d, and for other placeholders, the arguments passed in are ignored

## Try it

<DemoEditor code='const layout = new PatternLayout("%d{yyyy-MM-dd HH:mm:ss,SSS}\t%m");
const appender = new ConsoleAppender().setLayout(layout);
const logger = LogManager
                  .getLogger("Log4a")
                  .removeAppenderByType(AppenderTypeEnum.CONSOLE);
logger.addAppender(appender);
logger.info("Hello World!");' />