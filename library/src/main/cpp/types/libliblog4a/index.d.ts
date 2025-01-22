import { Logger } from "../../../ets/Logger";

export const getLogger: (ident: string) => Logger;

export const hasLogger: (ident: string) => boolean;

export const createLogger: (ident: string, logger: Logger) => void;