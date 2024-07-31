# 预绑定追加器 <Badge type="tip" text="1.5.6 +" />

由于Log4a是多Logger设计，在之前的版本中，如果有多个不同的Logger需要绑定相同的一组追加器，
需要对每一个Logger都分别绑定。而在`1.5.6`版本之后，我们仅需要通过向LogManager中添加预绑定追加器，
即可快速解决这个问题。

以下是一段展示该功能如何使用的伪代码

```ts:line-numbers
const exampleAppender = ...

LogManager.preBindAppender(exampleAppender)
```

注意，这些代码应当在EntryAbility中的onCreate生命周期中调用。