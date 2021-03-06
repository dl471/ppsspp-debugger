import React, { Component } from 'react';
import { NavLink, BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import CPU from './CPU';
import GPU from './GPU';
import Log from './Log';
import NotConnected from './NotConnected';
import PPSSPP from '../sdk/ppsspp.js';
import listeners from '../utils/listeners.js';
import logo from '../assets/logo.svg';
import './App.css';

const versionInfo = {
	name: process.env.REACT_APP_NAME,
	version: process.env.REACT_APP_VERSION,
};

class App extends Component {
	state = {
		connected: false,
		connecting: false,
	};
	logRef;
	ppsspp;
	originalTitle;

	constructor(props) {
		super(props);

		this.logRef = React.createRef();
		this.ppsspp = new PPSSPP();
		this.originalTitle = document.title;

		listeners.init(this.ppsspp);
		listeners.listen({
			'connection.change': this.onConnectionChange,
			'game.start': this.updateTitle,
			'game.quit': this.updateTitle,
		});
	}

	render() {
		return (
			<Router>
				<div className="App">
					<header className="App-header">
						<ul className="App-nav">
							<NavLink to="/cpu">CPU</NavLink>
							<NavLink to="/gpu">GPU</NavLink>
						</ul>
						<img src={logo} className="App-logo" alt="PPSSPP" />
						<h1 className="App-title">Debugger</h1>
					</header>
					{this.renderContent()}
					<Log ppsspp={this.ppsspp} ref={this.logRef} />
				</div>
			</Router>
		);
	}

	renderContent() {
		if (!this.state.connected) {
			return <NotConnected connecting={this.state.connecting} connect={this.connect} />;
		}

		return (
			<Switch>
				<Route path="/gpu">
					<GPU ppsspp={this.ppsspp} log={this.log} />
				</Route>
				<Route>
					<CPU ppsspp={this.ppsspp} log={this.log} />
				</Route>
			</Switch>
		);
	}

	componentDidMount() {
		// Connect automatically on start.
		if (!this.props.testing) {
			this.handleAutoConnect();
		}
	}

	handleAutoConnect = () => {
		this.connect(null);
	}

	connect = (uri) => {
		this.setState({ connecting: true });

		this.ppsspp.onClose = () => {
			this.log('Debugger disconnected');
			listeners.change(false);
			this.setState({ connected: false, connecting: false });
		};

		let connection;
		if (uri === null) {
			connection = this.ppsspp.autoConnect();
		} else {
			connection = this.ppsspp.connect(uri);
		}

		connection.then(() => {
			this.log('Debugger connected');
			listeners.change(true);
			this.setState({ connected: true, connecting: false });
		}, err => {
			this.log('Debugger could not connect');
			listeners.change(false);
			this.setState({ connected: false, connecting: false });
		});
	}

	handleDisconnect = () => {
		// Should trigger the appropriate events automatically.
		this.ppsspp.disconnect();
	}

	log = (message) => {
		// Would rather keep Log managing its state, and pass this callback around.
		if (this.logRef.current) {
			this.logRef.current.addLogItem({ message: message + '\n' });
		} else {
			console.error(message);
		}
	}

	updateTitle = (data) => {
		if (!document) {
			return;
		}

		if (data.game) {
			document.title = this.originalTitle + ' - ' + data.game.id + ': ' + data.game.title;
		} else {
			document.title = this.originalTitle;
		}
	}

	onConnectionChange = (status) => {
		if (status) {
			this.ppsspp.send({ event: 'version', ...versionInfo }).catch((err) => {
				window.alert('PPSSPP seems to think this debugger is out of date.  Try refreshing?\n\nDetails: ' + err);
			});
			this.ppsspp.send({ event: 'game.status' }).then(this.updateTitle, (err) => this.updateTitle({}));
		} else {
			this.updateTitle({});
		}
	}
}

export default App;
