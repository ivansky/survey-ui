import React from 'react'
import PropTypes from 'prop-types'

class EventEmitter {
  constructor() {
    this.events = {};
  }

  on(event, listener) {
    if (typeof this.events[event] !== 'object') {
      this.events[event] = [];
    }

    this.events[event].push(listener);

    return () => this.removeListener(event, listener);
  }

  removeListener(event, listener) {
    if (typeof this.events[event] === 'object') {
      const idx = this.events[event].indexOf(listener);

      if (idx > -1) {
        this.events[event].splice(idx, 1);
      }
    }
  }

  emit(event, ...args) {
    if (typeof this.events[event] === 'object') {
      this.events[event].forEach(listener => listener.apply(this, args));
    }
  }

  /*once(event, listener) {
    const remove = this.on(event, (...args) => {
      remove();
      listener.apply(this, args);
    });
  }*/
}

class BreadcumbsManager {

  _list = [];
  _reduxStore = null;

  constructor() {
    this._breadcrumbsStore = new BreadcrumbsStore(this);
  }

  getStore() {
    return this._breadcrumbsStore;
  }

  getBreadcrumbs() {
    return this._list;
  }

  setReduxStore(dispatch, getState) {
    this._reduxStore = {
      dispatch,
      getState
    }
  }

  dispatch(action) {
    return this._reduxStore.dispatch(action);
  }

  isReduxStoreBinded() {
    return !!this._reduxStore;
  }

  clear() {
    this._list = [];
  }

  push(name, path) {
    this._addBreadcrumb(name, path);
  }

  _addBreadcrumb(title, path) {
    this._list = [...this._list, { title, path }];
  }
}

class BreadcrumbsStore extends EventEmitter {
  constructor(manager) {
    super();
    this._manager = manager;
  }

  isBreadcrumbsReady(){

  }

  getBreadcrumbs(){
    this._manager.getBreadcrumbs();
  }

  map(...args) {
    return this._manager.getBreadcrumbs().map(...args);
  }

  add(name, path) {
    this._manager.push(name, path);
    this.update()
  }

  update() {
    this.emit('update');
  }

  clear() {
    this._manager.clear();
    this.emit('clear');
  }

  call(action) {
    try {
      const result = typeof action === 'function' ? action() : this._manager.dispatch(action);

      if(typeof result.then === 'function') {
        return result;
      }

      return Promise.resolve(result)
    } catch (e) {
      return Promise.reject(e)
    }
  }
}

const breadcumbsManager = new BreadcumbsManager();

export class BreadCrumbsProvider extends React.Component {
  static propTypes = {
    store: PropTypes.object
  };

  static childContextTypes = {
    breadcrumbs: PropTypes.object
  };

  getChildContext() {
    const breadcrumbsStore = breadcumbsManager.getStore();

    return { breadcrumbs: {
        ...breadcrumbsStore,
        add: breadcrumbsStore.add.bind(breadcrumbsStore),
        call: breadcrumbsStore.call.bind(breadcrumbsStore),
        map: breadcrumbsStore.map.bind(breadcrumbsStore),
        clear: breadcrumbsStore.clear.bind(breadcrumbsStore),
        update: breadcrumbsStore.update.bind(breadcrumbsStore),
        onUpdate: (callback) => breadcrumbsStore.on('update', callback),
        unsubscribe: (callback) => breadcrumbsStore.removeListener('update', callback),
    } };
  }

  constructor(props, context) {
    super(props, context);

    if (!breadcumbsManager.isReduxStoreBinded() && props.store) {
      breadcumbsManager.setReduxStore(props.store.dispatch, props.store.getState);
    }
  }

  render() {
    return this.props.children;
  }
}

export const breadcumbsReduxMiddleware = ({ dispatch, getState }) => next => action => {
  if (!breadcumbsManager.isReduxStoreBinded()) {
    breadcumbsManager.setReduxStore(dispatch, getState);
  }

  return next(action)
};

export function breadcrumb(breadcrumbHandler = null, parent = null) {
  return function (Component) {
    return class extends Component {
      static contextTypes = {
        ...(Component.contextTypes || {}),
        breadcrumbs: PropTypes.object.isRequired,
      };

      static breadcrumbHandler = breadcrumbHandler;

      constructor(props, context) {
        super(props, context);

        if (breadcrumbHandler && context && context.breadcrumbs) {
          const handlers = [];

          handlers.push(breadcrumbHandler);

          if (typeof parent === 'function' && parent.breadcrumbHandler) {
            handlers.push(parent.breadcrumbHandler);
          }

          context.breadcrumbs.clear();
          handlers.reverse().forEach(handler => handler({
            props: { ...props },
            context: { ...context },
            ...context.breadcrumbs
          }));
        }
      }
    }
  }
}
