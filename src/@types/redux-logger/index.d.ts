import { Middleware } from 'redux';

declare module 'redux-logger' {
  type createLogger = Middleware;
  export = createLogger;
}
