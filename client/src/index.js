import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';

import { BrowserRouter ,Routes,Route} from "react-router-dom";
import * as serviceWorker from './serviceWorker';
// import reportWebVitals from "./reportWebVitals";
import { MoralisProvider } from "react-moralis";
require("dotenv").config();

const serverUrl = process.env.REACT_APP_SERVER_URL;
const apiId = process.env.REACT_APP_API_ID;

ReactDOM.render(
 
    <MoralisProvider serverUrl={serverUrl} appId={apiId}>
     <App />
    </MoralisProvider>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
