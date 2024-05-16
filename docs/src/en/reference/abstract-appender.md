# AbstractAppender

AbstractAppender is the base class for all appenders, and all listed methods can be invoked in other appenders

## `getName()`

Obtain the Appender name

## `getCurrentHistory()`

Example Obtain all logs generated by the current session

# # `setLayout (layout)` <Badge type = "tip" text = "1.4.0 +" />

- 'layout' T extends AbstractLayout - Log layout

Set the log layout for the Appender

## `getType()`

Gets the current Appender type

## `onTerminate()`

Terminates the output of the current Appender and cleans up memory garbage