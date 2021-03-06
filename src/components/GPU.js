import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import listeners from '../utils/listeners.js';
import './GPU.css';

class GPU extends PureComponent {
	state = {
		connected: false,
		started: false,
		paused: true,
		recording: false,
	};

	render() {
		return (
			<div id="GPU">
				<div className="GPU__info">
					{this.state.started && !this.state.paused ? 'Click below to generate a GE dump.  It will download as a file.' : 'Waiting for a game to start...'}
				</div>
				{this.state.started && !this.state.paused ? (
					<form className="GPU__form" onSubmit={this.beginRecord}>
						<button disabled={this.state.recording}>{this.state.recording ? 'Recording...' : 'Record'}</button>
					</form>
				) : null}
			</div>
		);
	}

	componentDidMount() {
		this.listeners_ = listeners.listen({
			'connection': () => this.onConnection(),
			'connection.change': (connected) => this.onConnectionChange(connected),
			'game.start': () => this.setState({ started: true, paused: false }),
			'game.quit': () => this.setState({ started: false, paused: true }),
			'game.pause': () => this.setState({ paused: true }),
			'game.resume': () => this.setState({ paused: false }),
		});
	}

	componentWillUnmount() {
		listeners.forget(this.listeners_);
	}

	onConnectionChange(connected) {
		// On any reconnect, assume paused until proven otherwise.
		this.setState({ connected, started: false, paused: true });
	}

	onConnection() {
		// Update the status of this connection immediately too.
		this.props.ppsspp.send({ event: 'cpu.status' }).then((result) => {
			const { stepping, paused, pc } = result;
			const started = pc !== 0 || stepping;

			this.setState({ connected: true, started, paused });
		}, (err) => {
			this.setState({ paused: true });
		});
	}

	beginRecord = (ev) => {
		this.setState({ recording: true });
		this.props.ppsspp.send({ event: 'gpu.record.dump' }).then(result => {
			var a = document.createElement('a');
			a.setAttribute('download', 'recording.ppdmp');
			a.href = result.uri;
			a.hidden = true;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);

			this.setState({ recording: false });
		});
		ev.preventDefault();
	}
}

GPU.propTypes = {
	ppsspp: PropTypes.object.isRequired,
	log: PropTypes.func.isRequired,
};

export default GPU;
