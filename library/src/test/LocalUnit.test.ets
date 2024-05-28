import { describe, beforeAll, beforeEach, afterEach, afterAll, it, expect } from '@ohos/hypium';
import { ConsoleAppender, FileAppender, Level, LogManager, PatternLayout } from '../../Index';
import { TemporaryLoggerContext } from '../main/ets/TemporaryLoggerContext';

export default function localUnitTest() {
  describe('localUnitTest', () => {
    // Defines a test suite. Two parameters are supported: test suite name and test suite function.
    beforeAll(() => {
      // Presets an action, which is performed only once before all test cases of the test suite start.
      // This API supports only one parameter: preset action function.
      const fileAppender = new FileAppender('unitTest.log', 'testFileAppender', Level.ALL, {
        maxFileSize: 10,
        maxCacheCount: 5
      })
      LogManager.setLogFilePath('../../../tmpOutput');
      LogManager.getLogger('UnitTest')
        .addAppender(fileAppender);
    });
    beforeEach(() => {
      // Presets an action, which is performed before each unit test case starts.
      // The number of execution times is the same as the number of test cases defined by **it**.
      // This API supports only one parameter: preset action function.
    });
    afterEach(() => {
      // Presets a clear action, which is performed after each unit test case ends.
      // The number of execution times is the same as the number of test cases defined by **it**.
      // This API supports only one parameter: clear action function.
    });
    afterAll(() => {
      // Presets a clear action, which is performed after all test cases of the test suite end.
      // This API supports only one parameter: clear action function.
    });
    it('assertContain', 0, () => {
      // Defines a test case. This API supports three parameters: test case name, filter parameter, and test case function.
      const logger = LogManager.getLogger('UnitTest');
      logger.info('UnitTest {}', 'begins');
      const appender = new ConsoleAppender();
      const tC = new TemporaryLoggerContext();
      // Defines a variety of assertion methods, which are used to declare expected boolean conditions.
      expect(appender.makeMessage(Level.INFO, 'UnitTest', 40, 0, 'UnitTest Message', tC))
        .assertEqual('[INFO ]	1970-01-01 08:00:00,040	[UnitTest:0]	UnitTest Message')
      appender.setLayout(new PatternLayout('%d{yyyy-MM-dd HHH:mm:ss,SSS}'));
      expect(appender.makeMessage(Level.INFO, 'UnitTest', 40, 0, 'UnitTestMessage', tC))
        .assertEqual('1970-01-01 008:00:00,040')
    });
  });
}