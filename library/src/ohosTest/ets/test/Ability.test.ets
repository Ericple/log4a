import { describe, beforeAll, it, expect } from '@ohos/hypium';
import { abilityDelegatorRegistry } from '@kit.TestKit';
import { common, Want } from '@kit.AbilityKit';
import { FileAppender, Level, LogManager } from '../../../../Index';
import { fileIo } from '@kit.CoreFileKit';

const delegator = abilityDelegatorRegistry.getAbilityDelegator()
const bundleName = abilityDelegatorRegistry.getArguments().bundleName;

function sleep(time: number) {
  return new Promise<void>((resolve: Function) => setTimeout(resolve, time));
}

export default function abilityTest() {
  describe('ActsAbilityTest', () => {
    let ctx: common.UIAbilityContext;
    // Defines a test suite. Two parameters are supported: test suite name and test suite function.
    beforeAll(async () => {
      // Presets an action, which is performed only once before all test cases of the test suite start.
      // This API supports only one parameter: preset action function.
      const want: Want = {
        bundleName: bundleName,
        abilityName: 'TestAbility'
      }
      await delegator.startAbility(want);
      await sleep(1500);
      let ability = await delegator.getCurrentTopAbility();
      ctx = ability.context;
    })
    it('logFilePath', 0, () => {
      let path = `${ctx.cacheDir}/log`;
      LogManager.setLogFilePath(path);
      let fileAppender = new FileAppender('mainLog.log', 'mainFileAppender', Level.ALL);
      LogManager.preBindAppender(fileAppender);
      LogManager.getLogger('TestLogger').info('test');
      let targetPath = `${path}/mainLog.log`;
      expect(fileIo.accessSync(targetPath)).assertEqual(true);
    });
    it('encryptorWithWorker', 0, async () => {
      let fileAppender = new FileAppender('encryptLog.log', 'encryptFileAppender', Level.ALL, {
        encryptor: (_, msg) => msg + 'encrypted!',
        useWorker: true
      });
      LogManager.bindAppenderGlobally(fileAppender);
      try {
        LogManager.getLogger('TestLogger').info('Hello encryptor!');
        expect(true).assertEqual(true);
      } catch {
        expect(true).assertEqual(false);
      }
    });
    it('encryptorWithoutWorker', 0, async () => {
      let fileAppender = new FileAppender('encryptLog.log', 'encryptFileAppender', Level.ALL, {
        encryptor: (_, msg) => msg + 'encrypted!'
      });
      LogManager.bindAppenderGlobally(fileAppender);
      try {
        LogManager.getLogger('TestLogger').info('Hello encryptor!');
        expect(true).assertEqual(true);
      } catch {
        expect(true).assertEqual(false);
      }
    })
  })
}