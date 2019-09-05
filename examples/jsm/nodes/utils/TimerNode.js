/**
 * @author sunag / http://www.sunag.com.br/
 */

import { FloatNode } from '../inputs/FloatNode.js';
import { NodeLib } from '../core/NodeLib.js';

export class TimerNode extends FloatNode {

	constructor( scale, scope, timeScale ) {

		super();

		this.scale = scale !== undefined ? scale : 1;
		this.scope = scope || TimerNode.GLOBAL;

		this.timeScale = timeScale !== undefined ? timeScale : scale !== undefined;

		this.nodeType = "Timer";

	}

	getReadonly() {

		// never use TimerNode as readonly but aways as "uniform"

		return false;

	};

	getUnique() {

		// share TimerNode "uniform" input if is used on more time with others TimerNode

		return this.timeScale && ( this.scope === TimerNode.GLOBAL || this.scope === TimerNode.DELTA );

	}

	updateFrame( frame ) {

		var scale = this.timeScale ? this.scale : 1;

		switch ( this.scope ) {

			case TimerNode.LOCAL:

				this.value += frame.delta * scale;

				break;

			case TimerNode.DELTA:

				this.value = frame.delta * scale;

				break;

			default:

				this.value = frame.time * scale;

		}

	}

	copy( source ) {

		super.copy( source );

		this.scope = source.scope;
		this.scale = source.scale;

		this.timeScale = source.timeScale;

		return this;

	}

	toJSON( meta ) {

		var data = this.getJSONNode( meta );

		if ( ! data ) {

			data = this.createJSONNode( meta );

			data.scope = this.scope;
			data.scale = this.scale;

			data.timeScale = this.timeScale;

		}

		return data;

	}

}

TimerNode.GLOBAL = 'global';
TimerNode.LOCAL = 'local';
TimerNode.DELTA = 'delta';

NodeLib.addKeyword( 'time', function () {

	return new TimerNode();

} );
