import {noop} from '../noop';


/*
 * Only allow uuids.
 * Version's regular expressions:
 * https://github.com/chriso/validator.js/blob/b59133b1727b6af355b403a9a97a19226cceb34b/lib/isUUID.js#L14-L19.
 */
export function IsUUID() { return noop }
