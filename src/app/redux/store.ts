import { applyMiddleware, compose, createStore } from 'redux';
import createLogger from 'redux-logger';
import createSagaMiddleware, { END } from 'redux-saga';
import thunk from 'redux-thunk';
import rootReducer from './reducers/root-reducer';

const initialState = {};

export default function configureStore(state = initialState) {
  const sagaMiddleware = createSagaMiddleware();

  const store = createStore(
    rootReducer,
    state,
    compose(
      applyMiddleware(
        thunk,
        sagaMiddleware,
        createLogger(),
      ),
      // @ts-ignore
      window.devToolsExtension ? window.devToolsExtension() : f => f,
    ),
  );

  // @ts-ignore
  if (module.hot) {
    // Enable Webpack hot module replacement for reducers
    // @ts-ignore
    module.hot.accept('./reducers/root-reducer', () => {
      const nextRootReducer = require('./reducers/root-reducer').default;

      store.replaceReducer(nextRootReducer);
    });
  }

  // @todo add redux-saga
  // store.runSaga = sagaMiddleware.run;
  // @ts-ignore
  store.close = () => store.dispatch(END);

  return store;
}
