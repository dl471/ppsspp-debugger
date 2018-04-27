import React, { PureComponent } from 'react';
import { ContextMenu, MenuItem, connectMenu } from 'react-contextmenu';
import { copyText } from '../../utils/clipboard';
import { toString08X } from '../../utils/format';

class DisasmContextMenu extends PureComponent {
	render() {
		const { id, trigger } = this.props;
		if (!trigger) {
			return <ContextMenu id={id}><MenuItem divider /></ContextMenu>;
		}

		const disabled = !this.props.stepping;
		const { line } = trigger;

		const followBranch = line.branch !== null || line.relevantData !== null || line.type === 'data';

		return (
			<ContextMenu id={id}>
				<MenuItem onClick={this.handleCopyAddress}>
					Copy Address
				</MenuItem>
				<MenuItem data={{ action: 'copy_hex' }} onClick={this.handleTodo}>
					Copy Instruction (Hex)
				</MenuItem>
				<MenuItem data={{ action: 'copy_disasm' }} onClick={this.handleTodo}>
					Copy Instruction (Disasm)
				</MenuItem>
				<MenuItem divider />
				<MenuItem data={{ action: 'assemble' }} disabled={disabled} onClick={this.handleTodo}>
					Assemble Opcode...
				</MenuItem>
				<MenuItem divider />
				<MenuItem data={{ action: 'step_until' }} disabled={disabled} onClick={this.handleTodo}>
					Run to Cursor
				</MenuItem>
				<MenuItem data={{ action: 'change_pc' }} disabled={disabled} onClick={this.handleTodo}>
					Jump to Cursor
				</MenuItem>
				<MenuItem data={{ action: 'toggle_breakpoint' }} onClick={this.handleTodo}>
					Toggle Breakpoint
				</MenuItem>
				<MenuItem divider />
				<MenuItem data={{ action: 'follow_branch' }} disabled={!followBranch} onClick={this.handleTodo}>
					Follow Branch
				</MenuItem>
				<MenuItem data={{ action: 'goto_memory' }} onClick={this.handleTodo}>
					Go to in Memory View
				</MenuItem>
				<MenuItem data={{ action: 'goto_jit' }} onClick={this.handleTodo}>
					Go to in Jit Compare
				</MenuItem>
				<MenuItem divider />
				<MenuItem data={{ action: 'func_rename' }} onClick={this.handleTodo}>
					Rename Function...
				</MenuItem>
				<MenuItem data={{ action: 'func_remove' }} onClick={this.handleTodo}>
					Remove Function
				</MenuItem>
				<MenuItem data={{ action: 'func_add' }} onClick={this.handleTodo}>
					Add Function Here
				</MenuItem>
			</ContextMenu>
		);
	}

	handleCopyAddress = (ev, data) => {
		copyText(toString08X(data.line.address));
	}

	handleTodo = (ev, data) => {
		// TODO
		console.log(data);
	}
};

export default connectMenu('disasm')(DisasmContextMenu);