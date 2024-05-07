# 实现追加器

所有追加器都继承自同一抽象类`AbstractAppender`，开发者可以自行实现其中关键方法，并通过`Logger`中的`addAppender`方法将追加器绑定至`Logger`。

## 追加器的生命周期

追加器有以下周期

`onLog(level,message)`

- `level` Level - 日志等级
- `message` string - 日志内容

当有日志被记录时，追加器的onLog方法会被Logger调用，开发者可自行实现日志功能。

`onTerminate()`

当追加器被终止时，onTerminate方法会被Logger调用，开发者应当在此处回收不再被使用的内存，或取消不必要的事件订阅。
