import { Status } from './types';

/**
 * Status Codes as return states by the `Emitter`. These codes are 
 * useful to find out what happened after an `Emitter.emit()` was 
 * called. For example if there are no actions, the `Status` will be 
 * `NOT_FOUND`. If any of the actions returns `false`, then the next 
 * actions won't be called and the `Status` will be `ABORTED`. If all 
 * actions were called and the last one did not return `false`, then 
 * the `Status` will be `OK`.
 */
export default {
  get ABORT(): Status {
    return { code: 308, message: 'Aborted' };
  },

  get ERROR(): Status {
    return { code: 500, message: 'Internal Error' };
  },

  get NOT_FOUND(): Status {
    return { code: 404, message: 'Not Found' };
  },

  get OK(): Status {
    return { code: 200, message: 'OK' };
  }
}