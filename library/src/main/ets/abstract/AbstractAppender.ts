import { NotImplementedError } from '../spi/NotImplementError';

export abstract class AbstractAppender {
  append(message: string) {
    throw new NotImplementedError();
  }
}