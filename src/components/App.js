import React, { Component } from 'react';
import CPU from './CPU';
import Log from './Log';
import PPSSPP from '../sdk/ppsspp.js';
import listeners from '../utils/listeners.js';
import logo from '../assets/logo.svg';
import './App.css';

class App extends Component {
	constructor(props) {
		super(props);

		this.state = {
			connected: false,
			connecting: false,
		};

		this.logRef = React.createRef();
		this.ppsspp_ = new PPSSPP();
		listeners.init(this.ppsspp_);
	}

	render() {
		return (
			<div className="App">
				<header className="App-header">
					<img src={logo} className="App-logo" alt="logo" />
					<h1 className="App-title">Welcome to React</h1>
				</header>
				<p className="App-intro">
					To get started, edit <code>src/App.js</code> and save to reload.
				</p>
				<div className="App-button">{this.button()}</div>
				<CPU ppsspp={this.ppsspp_} log={this.log} />
				<Log ppsspp={this.ppsspp_} ref={this.logRef} />
			</div>
		);
	}

	button() {
		if (this.state.connecting) {
			return <button disabled="disabled">Connecting...</button>;
		} else if (this.state.connected) {
			return <button onClick={this.handleDisconnect}>Disconnect</button>;
		}
		return <button onClick={this.handleConnect}>Connect</button>;
	}

	componentDidMount() {
		// Connect automatically on start.
		this.handleConnect();
	}

	handleConnect = () => {
		this.setState({ connecting: true });

		this.ppsspp_.onClose = () => {
			this.log('Debugger disconnected');
			listeners.change(false);
			this.setState({ connected: false, connecting: false });
		};

		this.ppsspp_.autoConnect().then(() => {
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
		this.ppsspp_.disconnect();
	}

	log = (message) => {
		// Would rather keep Log managing its state, and pass this callback around.
		this.logRef.current.addLogItem({ message: message + '\n' });
	}
}

export default App;
