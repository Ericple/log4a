# What is Log4a?

Log4a is an ArkTS/TypeScript logging library designed for high performance and ease of use.

Just want to try it? Skip to [Quick Start](/guide/getting-started)

[![Ericple/log4a](https://gitee.com/ericple/log4a/widgets/widget_card.svg?colors=4183c4,ffffff,ffffff,e3e9ed,666666,9b9b9b)](https://gitee.com/ericple/log4a)

## Use scenario

- ### debug at development time

Developers can integrate Log4a during the development phase to help obtain application running information and quickly locate problems by generating logs and tracking function runs.

- ### Collect logs after the application goes online

With Log4a's well-designed log output capability, developers can output logs to one or more files and upload the logs to the server for application analysis.

## Performance

- Supports multithreaded file output

Developers can choose whether to enable multithreaded working mode when binding a FileAppender. After this mode is enabled, log writing will be completed by one Worker, and through Worker sharing, multiple multithreaded appenders will share a ThreadWorker to reserve more available threads for high application concurrency.

- Unified management of files to reduce memory pressure

Log4a avoids repeated object instantiation when FileAppender attached to multiple loggers point to the same File. FileAppender is unique to the same file in the same thread. That is to say, if multiple loggers point to the same file, Log4a can avoid repeated object instantiation by design. They are bound to the same FileAppender. In simple terms, a FileAppender can be bound to multiple loggers and perform log output tasks.