import { router } from '@kit.ArkUI';
import { Logger, LogManager } from '@log/log4a';

@Entry
@Component
struct SecondPage {
  @State message: string = 'Hello World';
  logger: Logger = LogManager.getLogger(this);

  build() {
    Row() {
      Column() {
        Text(this.message)
          .fontSize(50)
          .fontWeight(FontWeight.Bold)
        Button('back')
          .onClick(() => {
            router.back({ url: 'pages/Index' })
          })
      }
      .width('100%')
    }
    .height('100%')
  }
}