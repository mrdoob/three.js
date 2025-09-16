import { EventDispatcher } from '../core/EventDispatcher.js';
import { warn } from '../utils.js';

/**
 * Abstract base class for controls.
 *
 * @abstract
 * @augments EventDispatcher
 */
class Controls extends EventDispatcher {

	/**
	 * Constructs a new controls instance.
	 *
	 * @param {Object3D} object - The object that is managed by the controls.
	 * @param {?HTMLElement} domElement - The HTML element used for event listeners.
	 */
	constructor( object, domElement = null ) {

		super();

		/**
		 * The object that is managed by the controls.
		 *
		 * @type {Object3D}
		 */
		this.object = object;

		/**
		 * The HTML element used for event listeners.
		 *
		 * @type {?HTMLElement}
		 * @default null
		 */
		this.domElement = domElement;

		/**
		 * Whether the controls responds to user input or not.
		 *
		 * @type {boolean}
		 * @default true
		 */
		this.enabled = true;

		/**
		 * The internal state of the controls.
		 *
		 * @type {number}
		 * @default -1
		 */
		this.state = - 1;

		/**
		 * This object defines the keyboard input of the controls.
		 *
		 * @type {Object}
		 */
		this.keys = {};

		/**
		 * This object defines what type of actions are assigned to the available mouse buttons.
		 * It depends on the control implementation what kind of mouse buttons and actions are supported.
		 *
		 * @type {{LEFT: ?number, MIDDLE: ?number, RIGHT: ?number}}
		 */
		this.mouseButtons = { LEFT: null, MIDDLE: null, RIGHT: null };

		/**
		 * This object defines what type of actions are assigned to what kind of touch interaction.
		 * It depends on the control implementation what kind of touch interaction and actions are supported.
		 *
		 * @type {{ONE: ?number, TWO: ?number}}
		 */
		this.touches = { ONE: null, TWO: null };

	}

	/**
	 * Connects the controls to the DOM. This method has so called "side effects" since
	 * it adds the module's event listeners to the DOM.
	 *
	 * @param {HTMLElement} element - The DOM element to connect to.
	 */
	connect( element ) {

		if ( element === undefined ) {

			warn( 'Controls: connect() now requires an element.' ); // @deprecated, the warning can be removed with r185
			return;

		}

		if ( this.domElement !== null ) this.disconnect();

		this.domElement = element;

	}

	/**
	 * Disconnects the controls from the DOM.
	 */
	disconnect() {}

	/**
	 * Call this method if you no longer want use to the controls. It frees all internal
	 * resources and removes all event listeners.
	 */
	dispose() {}

	/**
	 * Controls should implement this method if they have to update their internal state
	 * per simulation step.
	 *
	 * @param {number} [delta] - The time delta in seconds.
	 */
	update( /* delta */ ) {}

}

export { Controls };
