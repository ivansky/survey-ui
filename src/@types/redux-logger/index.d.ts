declare module 'redux-logger' {
  import { Middleware } from 'redux';
  function createLogger(): Middleware;
  export = createLogger;
}
