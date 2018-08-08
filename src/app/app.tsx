import React, { Component } from 'react';
import { Route } from 'react-router';
import { BrowserRouter as Router, Switch } from 'react-router-dom';

// Components
import SurveyBuilderPage from '../_app/components/page/SurveyBuilderPage';
import DashboardPage from '../_app/components/page/DashboardPage';
import SurveyPage from '../_app/components/page/SurveyPage';
import SurveyStatisticPage from '../_app/components/page/SurveyStatisticPage';
import { BreadCrumbsProvider } from './decorators/bredcrumbs';

import Layout from './components-ui/layout/Layout';
import { Provider } from 'react-redux';
import configureStore from '../_app/redux/store';

import './app.css';

const store = configureStore();

class App extends Component {
  public render() {
    return <Provider store={ store }>
      <Router>
        <Layout>
          <Switch>
            <Route exact path="/" component={ DashboardPage }/>
          </Switch>
        </Layout>
      </Router>
    </Provider>;
  }
}

export default App;
