import React from 'react';
import ReactDOM from 'react-dom';
import Modal from 'react-modal';
import './index.css';
import App from './components/App';
import registerServiceWorker from './registerServiceWorker';
import 'babel-polyfill';

ReactDOM.render(<App />, document.getElementById('root'));
Modal.setAppElement('#root');
registerServiceWorker();
