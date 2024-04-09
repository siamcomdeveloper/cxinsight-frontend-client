import * as React from 'react'; 
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import ClientSurvey from './components/client-survey.component';

import 'antd/dist/antd.css';
import 'toastr/build/toastr.min.css'; 
import './App.css';

const App: React.FC = () => {
  return (
      <Router basename={`cxm`}>
          <Switch>
              <Route path='/:xSite/sv' component={ ClientSurvey } />
          </Switch>
      </Router>
  );
}

export default App;
