import * as THREE from 'three';
import { ShaderDebugger } from './ShaderDebugger.js';
import { UniformPresetManager } from './UniformPresetManager.js';
import { GLTFLoader } from '../loaders/GLTFLoader.js';
import { OBJLoader } from '../loaders/OBJLoader.js';
import { TransformControls } from '../controls/TransformControls.js';

/**
 * ShaderDebuggerUI - Standalone UI panel for shader debugging
 * 
 * Provides a complete UI for:
 * - Scene object management
 * - Material library
 * - Shader code editing
 * - Uniform editing
 * - Performance profiling
 * - Session persistence
 */
class ShaderDebuggerUI {

	constructor( options = {} ) {

		// Configuration
		this.position = options.position || 'right'; // 'right' or 'bottom'
		this.width = options.width || 420;
		this.height = options.height || 350;

		// References
		this.renderer = null;
		this.scene = null;
		this.camera = null;
		this.orbitControls = null;
		this.debugger = null;

		// State
		this.currentMaterial = null;
		this.currentShaderTab = 'vertex';
		this.sceneObjects = [];
		this.selectedObject = null;
		this.materialLibrary = [];
		this.presetManager = new UniformPresetManager();
		this.autoSaveEnabled = true;
		this.autoSaveTimeout = null;
		this.storageKey = 'shader_debugger_session';
		this.isVisible = false;
		this.isProfiling = false;

		// Loaders
		this.gltfLoader = new GLTFLoader();
		this.objLoader = new OBJLoader();

		// TransformControls
		this.transformControls = null;
		this.raycaster = new THREE.Raycaster();
		this.mouse = new THREE.Vector2();

		// Create UI
		this._injectStyles();
		this._createPanel();

	}

	/**
	 * Initializes the debugger with renderer, scene, and camera.
	 * @param {WebGLRenderer} renderer
	 * @param {Scene} scene
	 * @param {Camera} camera
	 * @param {OrbitControls} controls - Optional orbit controls
	 */
	init( renderer, scene, camera, controls = null ) {

		this.renderer = renderer;
		this.scene = scene;
		this.camera = camera;
		this.orbitControls = controls;

		// Create debugger instance
		this.debugger = new ShaderDebugger( renderer );

		// Setup event listeners
		this.debugger.addEventListener( 'error', ( e ) => this._displayError( e.error ) );
		this.debugger.addEventListener( 'attached', () => this._updateUI() );

		// Initialize transform controls
		this._initTransformControls();

		// Setup click-to-select
		this._setupClickToSelect();

		// Update template selector
		this._updateTemplateSelector();

		// Try to restore session
		setTimeout( () => this._loadFromLocalStorage(), 100 );

	}

	/**
	 * Shows the debugger panel.
	 */
	show() {

		this.panel.style.display = 'flex';
		this.isVisible = true;

	}

	/**
	 * Hides the debugger panel.
	 */
	hide() {

		this.panel.style.display = 'none';
		this.isVisible = false;

	}

	/**
	 * Toggles panel visibility.
	 */
	toggle() {

		if ( this.isVisible ) {

			this.hide();

		} else {

			this.show();

		}

	}

	/**
	 * Updates the debugger (call each frame).
	 */
	update() {

		if ( this.isProfiling && this.debugger ) {

			this.debugger.updateProfiler();
			this._updateProfilerDisplay();

		}

	}

	// ==================== PRIVATE METHODS ====================

	/**
	 * Injects CSS styles.
	 * @private
	 */
	_injectStyles() {

		if ( document.getElementById( 'shader-debugger-ui-styles' ) ) return;

		const style = document.createElement( 'style' );
		style.id = 'shader-debugger-ui-styles';
		style.textContent = `
			.sdu-panel {
				position: fixed;
				background: #1e1e1e;
				color: #ddd;
				font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
				font-size: 12px;
				border: 1px solid #3c3c3c;
				box-shadow: 0 4px 20px rgba(0,0,0,0.5);
				display: none;
				flex-direction: column;
				z-index: 10000;
			}
			.sdu-panel.right {
				right: 10px;
				top: 10px;
				bottom: 10px;
				width: 420px;
				border-radius: 8px;
			}
			.sdu-panel.bottom {
				left: 10px;
				right: 10px;
				bottom: 10px;
				height: 350px;
				border-radius: 8px;
			}
			.sdu-header {
				display: flex;
				align-items: center;
				padding: 10px 12px;
				background: #2d2d2d;
				border-bottom: 1px solid #3c3c3c;
				border-radius: 8px 8px 0 0;
				cursor: move;
			}
			.sdu-title {
				font-weight: 600;
				font-size: 13px;
				flex: 1;
			}
			.sdu-close {
				background: none;
				border: none;
				color: #888;
				font-size: 18px;
				cursor: pointer;
				padding: 0 4px;
			}
			.sdu-close:hover { color: #fff; }
			.sdu-content {
				flex: 1;
				overflow-y: auto;
				padding: 0;
			}
			.sdu-section {
				border-bottom: 1px solid #3c3c3c;
			}
			.sdu-section-header {
				display: flex;
				align-items: center;
				padding: 8px 12px;
				background: #2d2d2d;
				cursor: pointer;
				user-select: none;
			}
			.sdu-section-header:hover { background: #363636; }
			.sdu-section-arrow {
				width: 16px;
				margin-right: 6px;
				transition: transform 0.15s;
				color: #888;
			}
			.sdu-section-arrow.collapsed { transform: rotate(-90deg); }
			.sdu-section-title {
				font-weight: 600;
				font-size: 11px;
				text-transform: uppercase;
				letter-spacing: 0.5px;
				color: #bbb;
			}
			.sdu-section-content {
				padding: 10px 12px;
				background: #252526;
			}
			.sdu-section-content.collapsed { display: none; }
			.sdu-row {
				display: flex;
				align-items: center;
				margin-bottom: 8px;
				gap: 8px;
			}
			.sdu-row:last-child { margin-bottom: 0; }
			.sdu-label {
				width: 80px;
				flex-shrink: 0;
				font-size: 11px;
				color: #aaa;
			}
			.sdu-control { flex: 1; display: flex; gap: 6px; }
			.sdu-select, .sdu-input {
				padding: 4px 8px;
				background: #3c3c3c;
				border: 1px solid #555;
				border-radius: 3px;
				color: #ddd;
				font-size: 11px;
				outline: none;
			}
			.sdu-select { flex: 1; }
			.sdu-input { width: 60px; }
			.sdu-select:focus, .sdu-input:focus { border-color: #0078d4; }
			.sdu-btn {
				padding: 5px 12px;
				background: #0078d4;
				border: none;
				border-radius: 3px;
				color: #fff;
				font-size: 11px;
				font-weight: 500;
				cursor: pointer;
			}
			.sdu-btn:hover { background: #1084d8; }
			.sdu-btn.secondary { background: #3c3c3c; border: 1px solid #555; }
			.sdu-btn.secondary:hover { background: #454545; }
			.sdu-btn.success { background: #107c10; }
			.sdu-btn.danger { background: #d32f2f; }
			.sdu-btn-group { display: flex; gap: 6px; flex-wrap: wrap; }
			.sdu-list {
				background: #1e1e1e;
				border: 1px solid #3c3c3c;
				border-radius: 3px;
				max-height: 100px;
				overflow-y: auto;
				margin-bottom: 8px;
			}
			.sdu-list-item {
				padding: 6px 10px;
				cursor: pointer;
				border-bottom: 1px solid #2d2d2d;
				font-size: 11px;
				display: flex;
				align-items: center;
				gap: 8px;
			}
			.sdu-list-item:last-child { border-bottom: none; }
			.sdu-list-item:hover { background: #2d2d2d; }
			.sdu-list-item.selected { background: #0078d4; color: #fff; }
			.sdu-shader-tabs {
				display: flex;
				background: #1e1e1e;
				border-bottom: 1px solid #3c3c3c;
			}
			.sdu-shader-tab {
				padding: 8px 16px;
				background: transparent;
				border: none;
				color: #888;
				cursor: pointer;
				font-size: 11px;
				border-bottom: 2px solid transparent;
			}
			.sdu-shader-tab:hover { color: #ddd; }
			.sdu-shader-tab.active { color: #0078d4; border-bottom-color: #0078d4; }
			.sdu-editor {
				width: 100%;
				height: 200px;
				padding: 10px;
				background: #1e1e1e;
				border: 1px solid #3c3c3c;
				border-radius: 3px;
				color: #ddd;
				font-family: 'Consolas', 'Monaco', monospace;
				font-size: 12px;
				line-height: 1.5;
				resize: vertical;
				outline: none;
			}
			.sdu-editor-actions {
				display: flex;
				gap: 6px;
				padding: 8px 0;
			}
			.sdu-error-panel {
				background: #3c1f1f;
				border: 1px solid #5c2e2e;
				border-radius: 3px;
				padding: 10px;
				margin-top: 8px;
				display: none;
				font-family: monospace;
				font-size: 11px;
				color: #f48771;
			}
			.sdu-error-panel.visible { display: block; }
			.sdu-uniform-item {
				background: #2d2d2d;
				border-radius: 4px;
				padding: 10px;
				margin-bottom: 8px;
			}
			.sdu-uniform-name {
				font-weight: 600;
				color: #4fc3f7;
				font-size: 11px;
				margin-bottom: 6px;
			}
			.sdu-uniform-type { color: #888; font-size: 10px; font-weight: normal; margin-left: 6px; }
			.sdu-slider {
				flex: 1;
				height: 4px;
				-webkit-appearance: none;
				background: #3c3c3c;
				border-radius: 2px;
			}
			.sdu-slider::-webkit-slider-thumb {
				-webkit-appearance: none;
				width: 12px;
				height: 12px;
				background: #0078d4;
				border-radius: 50%;
				cursor: pointer;
			}
			.sdu-color-swatch {
				position: relative;
				width: 40px;
				height: 20px;
				border: 1px solid #555;
				border-radius: 3px;
				cursor: pointer;
				overflow: hidden;
			}
			.sdu-color-input {
				position: absolute;
				top: 0; left: 0;
				width: 100%; height: 100%;
				opacity: 0;
				cursor: pointer;
			}
			.sdu-stats-grid {
				display: grid;
				grid-template-columns: repeat(2, 1fr);
				gap: 8px;
			}
			.sdu-stat-item {
				background: #2d2d2d;
				padding: 10px;
				border-radius: 4px;
			}
			.sdu-stat-value { font-size: 18px; font-weight: 600; color: #4fc3f7; }
			.sdu-stat-label { font-size: 10px; color: #888; text-transform: uppercase; margin-top: 2px; }
			.sdu-stat-item.good .sdu-stat-value { color: #81c784; }
			.sdu-stat-item.warning .sdu-stat-value { color: #ffb74d; }
			.sdu-stat-item.bad .sdu-stat-value { color: #e57373; }
		`;
		document.head.appendChild( style );

	}

	/**
	 * Creates the main panel.
	 * @private
	 */
	_createPanel() {

		this.panel = document.createElement( 'div' );
		this.panel.className = `sdu-panel ${this.position}`;

		// Header
		const header = document.createElement( 'div' );
		header.className = 'sdu-header';

		const title = document.createElement( 'div' );
		title.className = 'sdu-title';
		title.textContent = '🎨 Shader Debugger';

		const closeBtn = document.createElement( 'button' );
		closeBtn.className = 'sdu-close';
		closeBtn.innerHTML = '×';
		closeBtn.addEventListener( 'click', () => this.hide() );

		header.appendChild( title );
		header.appendChild( closeBtn );

		// Make header draggable
		this._makeDraggable( header );

		// Content
		const content = document.createElement( 'div' );
		content.className = 'sdu-content';
		this.contentEl = content;

		// Create sections
		this._createSceneSection( content );
		this._createMaterialSection( content );
		this._createShaderSection( content );
		this._createPropertiesSection( content );
		this._createPerformanceSection( content );

		this.panel.appendChild( header );
		this.panel.appendChild( content );

		document.body.appendChild( this.panel );

	}

	/**
	 * Makes an element draggable.
	 * @private
	 */
	_makeDraggable( handle ) {

		let isDragging = false;
		let startX, startY, startLeft, startTop;

		handle.addEventListener( 'mousedown', ( e ) => {

			if ( e.button !== 0 ) return;
			isDragging = true;
			startX = e.clientX;
			startY = e.clientY;
			const rect = this.panel.getBoundingClientRect();
			startLeft = rect.left;
			startTop = rect.top;
			e.preventDefault();

		} );

		document.addEventListener( 'mousemove', ( e ) => {

			if ( ! isDragging ) return;
			const dx = e.clientX - startX;
			const dy = e.clientY - startY;
			this.panel.style.left = ( startLeft + dx ) + 'px';
			this.panel.style.top = ( startTop + dy ) + 'px';
			this.panel.style.right = 'auto';
			this.panel.style.bottom = 'auto';

		} );

		document.addEventListener( 'mouseup', () => {

			isDragging = false;

		} );

	}

	/**
	 * Creates a collapsible section.
	 * @private
	 */
	_createSection( container, title, id, collapsed = false ) {

		const section = document.createElement( 'div' );
		section.className = 'sdu-section';
		section.id = `sdu-section-${id}`;

		const header = document.createElement( 'div' );
		header.className = 'sdu-section-header';

		const arrow = document.createElement( 'span' );
		arrow.className = 'sdu-section-arrow' + ( collapsed ? ' collapsed' : '' );
		arrow.innerHTML = '▼';

		const titleEl = document.createElement( 'div' );
		titleEl.className = 'sdu-section-title';
		titleEl.textContent = title;

		header.appendChild( arrow );
		header.appendChild( titleEl );

		const content = document.createElement( 'div' );
		content.className = 'sdu-section-content' + ( collapsed ? ' collapsed' : '' );

		header.addEventListener( 'click', () => {

			arrow.classList.toggle( 'collapsed' );
			content.classList.toggle( 'collapsed' );

		} );

		section.appendChild( header );
		section.appendChild( content );
		container.appendChild( section );

		return content;

	}

	/**
	 * Creates the Scene Objects section.
	 * @private
	 */
	_createSceneSection( container ) {

		const content = this._createSection( container, 'Scene Objects', 'scene' );

		// Object list
		this.objectListEl = document.createElement( 'div' );
		this.objectListEl.className = 'sdu-list';
		content.appendChild( this.objectListEl );

		// Add primitive row
		const addRow = document.createElement( 'div' );
		addRow.className = 'sdu-row';

		this.primitiveSelect = document.createElement( 'select' );
		this.primitiveSelect.className = 'sdu-select';
		this.primitiveSelect.innerHTML = `
			<option value="box">Box</option>
			<option value="sphere">Sphere</option>
			<option value="plane">Plane</option>
			<option value="cylinder">Cylinder</option>
			<option value="torus">Torus</option>
		`;

		const addBtn = document.createElement( 'button' );
		addBtn.className = 'sdu-btn success';
		addBtn.textContent = 'Add';
		addBtn.addEventListener( 'click', () => this._spawnPrimitive() );

		addRow.appendChild( this.primitiveSelect );
		addRow.appendChild( addBtn );
		content.appendChild( addRow );

		// Action buttons
		const actions = document.createElement( 'div' );
		actions.className = 'sdu-btn-group';

		const importBtn = document.createElement( 'button' );
		importBtn.className = 'sdu-btn secondary';
		importBtn.textContent = 'Import Model';
		importBtn.addEventListener( 'click', () => this._uploadModel() );

		const deleteBtn = document.createElement( 'button' );
		deleteBtn.className = 'sdu-btn danger';
		deleteBtn.textContent = 'Delete';
		deleteBtn.addEventListener( 'click', () => this._deleteSelectedObject() );

		actions.appendChild( importBtn );
		actions.appendChild( deleteBtn );
		content.appendChild( actions );

	}

	/**
	 * Creates the Material section.
	 * @private
	 */
	_createMaterialSection( container ) {

		const content = this._createSection( container, 'Material', 'material' );

		// Material list
		this.materialListEl = document.createElement( 'div' );
		this.materialListEl.className = 'sdu-list';
		content.appendChild( this.materialListEl );

		// Template row
		const templateRow = document.createElement( 'div' );
		templateRow.className = 'sdu-row';

		const templateLabel = document.createElement( 'div' );
		templateLabel.className = 'sdu-label';
		templateLabel.textContent = 'Template';

		this.templateSelect = document.createElement( 'select' );
		this.templateSelect.className = 'sdu-select';
		this.templateSelect.innerHTML = '<option value="">Blank</option>';

		const createBtn = document.createElement( 'button' );
		createBtn.className = 'sdu-btn success';
		createBtn.textContent = 'Create';
		createBtn.addEventListener( 'click', () => this._createNewMaterial() );

		templateRow.appendChild( templateLabel );
		templateRow.appendChild( this.templateSelect );
		templateRow.appendChild( createBtn );
		content.appendChild( templateRow );

		// Action buttons
		const actions = document.createElement( 'div' );
		actions.className = 'sdu-btn-group';

		const applyBtn = document.createElement( 'button' );
		applyBtn.className = 'sdu-btn';
		applyBtn.textContent = 'Apply to Object';
		applyBtn.addEventListener( 'click', () => this._applyMaterialToObject() );

		const deleteMatBtn = document.createElement( 'button' );
		deleteMatBtn.className = 'sdu-btn danger';
		deleteMatBtn.textContent = 'Delete';
		deleteMatBtn.addEventListener( 'click', () => this._deleteSelectedMaterial() );

		actions.appendChild( applyBtn );
		actions.appendChild( deleteMatBtn );
		content.appendChild( actions );

		// Save/Load scene
		const sceneActions = document.createElement( 'div' );
		sceneActions.className = 'sdu-btn-group';
		sceneActions.style.marginTop = '8px';

		const exportBtn = document.createElement( 'button' );
		exportBtn.className = 'sdu-btn secondary';
		exportBtn.textContent = 'Export';
		exportBtn.addEventListener( 'click', () => this._saveScene() );

		const importSceneBtn = document.createElement( 'button' );
		importSceneBtn.className = 'sdu-btn secondary';
		importSceneBtn.textContent = 'Import';
		importSceneBtn.addEventListener( 'click', () => this._loadScene() );

		const resetBtn = document.createElement( 'button' );
		resetBtn.className = 'sdu-btn danger';
		resetBtn.textContent = 'Reset';
		resetBtn.addEventListener( 'click', () => this._hardReload() );

		sceneActions.appendChild( exportBtn );
		sceneActions.appendChild( importSceneBtn );
		sceneActions.appendChild( resetBtn );
		content.appendChild( sceneActions );

	}

	/**
	 * Creates the Shader section.
	 * @private
	 */
	_createShaderSection( container ) {

		const content = this._createSection( container, 'Shader Code', 'shader' );

		// Tabs
		const tabs = document.createElement( 'div' );
		tabs.className = 'sdu-shader-tabs';

		this.vertexTabBtn = document.createElement( 'button' );
		this.vertexTabBtn.className = 'sdu-shader-tab active';
		this.vertexTabBtn.textContent = 'Vertex';
		this.vertexTabBtn.addEventListener( 'click', () => this._showShaderTab( 'vertex' ) );

		this.fragmentTabBtn = document.createElement( 'button' );
		this.fragmentTabBtn.className = 'sdu-shader-tab';
		this.fragmentTabBtn.textContent = 'Fragment';
		this.fragmentTabBtn.addEventListener( 'click', () => this._showShaderTab( 'fragment' ) );

		tabs.appendChild( this.vertexTabBtn );
		tabs.appendChild( this.fragmentTabBtn );
		content.appendChild( tabs );

		// Editor
		this.shaderEditor = document.createElement( 'textarea' );
		this.shaderEditor.className = 'sdu-editor';
		this.shaderEditor.placeholder = 'Select a material to edit...';
		this.shaderEditor.spellcheck = false;
		content.appendChild( this.shaderEditor );

		// Actions
		const actions = document.createElement( 'div' );
		actions.className = 'sdu-editor-actions';

		const compileBtn = document.createElement( 'button' );
		compileBtn.className = 'sdu-btn';
		compileBtn.textContent = 'Compile';
		compileBtn.addEventListener( 'click', () => this._applyShaderCode() );

		const resetBtn = document.createElement( 'button' );
		resetBtn.className = 'sdu-btn secondary';
		resetBtn.textContent = 'Reset';
		resetBtn.addEventListener( 'click', () => this._resetShaderCode() );

		const saveBtn = document.createElement( 'button' );
		saveBtn.className = 'sdu-btn secondary';
		saveBtn.textContent = 'Export';
		saveBtn.addEventListener( 'click', () => this._saveShaderCode() );

		actions.appendChild( compileBtn );
		actions.appendChild( resetBtn );
		actions.appendChild( saveBtn );
		content.appendChild( actions );

		// Error panel
		this.errorPanel = document.createElement( 'div' );
		this.errorPanel.className = 'sdu-error-panel';
		content.appendChild( this.errorPanel );

	}

	/**
	 * Creates the Properties section.
	 * @private
	 */
	_createPropertiesSection( container ) {

		const content = this._createSection( container, 'Properties', 'properties' );

		this.uniformListEl = document.createElement( 'div' );
		content.appendChild( this.uniformListEl );

	}

	/**
	 * Creates the Performance section.
	 * @private
	 */
	_createPerformanceSection( container ) {

		const content = this._createSection( container, 'Performance', 'performance', true );

		const profileBtn = document.createElement( 'button' );
		profileBtn.className = 'sdu-btn';
		profileBtn.textContent = 'Start Profiling';
		profileBtn.style.marginBottom = '12px';
		profileBtn.addEventListener( 'click', () => this._toggleProfiling( profileBtn ) );
		content.appendChild( profileBtn );

		this.profilerDisplay = document.createElement( 'div' );
		this.profilerDisplay.className = 'sdu-stats-grid';
		content.appendChild( this.profilerDisplay );

	}

	// ==================== SCENE MANAGEMENT ====================

	_initTransformControls() {

		if ( ! this.camera || ! this.renderer || ! this.scene ) return;

		this.transformControls = new TransformControls( this.camera, this.renderer.domElement );
		this.transformControls.setMode( 'translate' );
		this.transformControls.size = 1;

		this.transformControls.addEventListener( 'dragging-changed', ( e ) => {

			if ( this.orbitControls ) this.orbitControls.enabled = ! e.value;
			if ( ! e.value ) this._autoSave();

		} );

		this.scene.add( this.transformControls.getHelper() );

	}

	_setupClickToSelect() {

		if ( ! this.renderer ) return;

		this.renderer.domElement.addEventListener( 'click', ( e ) => {

			if ( this.transformControls?.dragging ) return;
			if ( e.button !== 0 ) return;

			const rect = this.renderer.domElement.getBoundingClientRect();
			this.mouse.x = ( ( e.clientX - rect.left ) / rect.width ) * 2 - 1;
			this.mouse.y = - ( ( e.clientY - rect.top ) / rect.height ) * 2 + 1;

			this.raycaster.setFromCamera( this.mouse, this.camera );

			const meshes = [];
			this.sceneObjects.forEach( obj => {

				if ( obj.mesh.isMesh ) {

					meshes.push( obj.mesh );

				} else {

					obj.mesh.traverse( child => {

						if ( child.isMesh ) {

							child.userData._parentObj = obj;
							meshes.push( child );

						}

					} );

				}

			} );

			const intersects = this.raycaster.intersectObjects( meshes, false );

			if ( intersects.length > 0 ) {

				const hit = intersects[ 0 ].object;
				let sceneObj = this.sceneObjects.find( o => o.mesh === hit );
				if ( ! sceneObj && hit.userData._parentObj ) sceneObj = hit.userData._parentObj;
				if ( ! sceneObj ) {

					let parent = hit.parent;
					while ( parent ) {

						sceneObj = this.sceneObjects.find( o => o.mesh === parent );
						if ( sceneObj ) break;
						parent = parent.parent;

					}

				}
				if ( sceneObj ) this._selectObject( sceneObj.name );

			} else {

				this._selectObject( '' );

			}

		} );

	}

	_spawnPrimitive() {

		if ( ! this.scene ) return;

		const type = this.primitiveSelect.value;
		let geometry, name;

		switch ( type ) {

			case 'box': geometry = new THREE.BoxGeometry( 1, 1, 1 ); name = 'Box'; break;
			case 'sphere': geometry = new THREE.SphereGeometry( 0.5, 32, 32 ); name = 'Sphere'; break;
			case 'plane': geometry = new THREE.PlaneGeometry( 1, 1, 32, 32 ); name = 'Plane'; break;
			case 'cylinder': geometry = new THREE.CylinderGeometry( 0.5, 0.5, 1, 32 ); name = 'Cylinder'; break;
			case 'torus': geometry = new THREE.TorusGeometry( 0.5, 0.2, 16, 100 ); name = 'Torus'; break;
			default: return;

		}

		// Create default material
		const material = new THREE.ShaderMaterial( {
			uniforms: { time: { value: 0 }, color: { value: new THREE.Color( 0x4488ff ) } },
			vertexShader: `varying vec2 vUv; varying vec3 vNormal; void main() { vUv = uv; vNormal = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
			fragmentShader: `uniform vec3 color; varying vec2 vUv; void main() { gl_FragColor = vec4(color, 1.0); }`
		} );

		const objectName = `${name}_${this.sceneObjects.length + 1}`;
		const mesh = new THREE.Mesh( geometry, material );
		this.scene.add( mesh );

		this.sceneObjects.push( { mesh, name: objectName, type } );
		this._addMaterialToLibrary( material, `${objectName}_Material` );

		this._updateObjectList();
		this._updateMaterialList();
		this._selectObject( objectName );

	}

	_uploadModel() {

		const input = document.createElement( 'input' );
		input.type = 'file';
		input.accept = '.gltf,.glb,.obj';
		input.addEventListener( 'change', ( e ) => {

			const file = e.target.files[ 0 ];
			if ( ! file ) return;

			const url = URL.createObjectURL( file );
			const ext = file.name.split( '.' ).pop().toLowerCase();

			if ( ext === 'obj' ) {

				this.objLoader.load( url, ( obj ) => {

					const name = file.name.replace( /\.obj$/i, '' );
					this.scene.add( obj );
					this.sceneObjects.push( { mesh: obj, name, type: 'model' } );
					this._updateObjectList();
					URL.revokeObjectURL( url );

				} );

			} else {

				this.gltfLoader.load( url, ( gltf ) => {

					const name = file.name.replace( /\.(gltf|glb)$/i, '' );
					this.scene.add( gltf.scene );
					this.sceneObjects.push( { mesh: gltf.scene, name, type: 'model' } );
					this._updateObjectList();
					URL.revokeObjectURL( url );

				} );

			}

		} );
		input.click();

	}

	_deleteSelectedObject() {

		if ( ! this.selectedObject ) return;

		this.scene.remove( this.selectedObject.mesh );
		if ( this.selectedObject.mesh.geometry ) this.selectedObject.mesh.geometry.dispose();

		const idx = this.sceneObjects.indexOf( this.selectedObject );
		if ( idx > - 1 ) this.sceneObjects.splice( idx, 1 );

		if ( this.transformControls ) this.transformControls.detach();
		this.selectedObject = null;

		this._updateObjectList();
		this._autoSave();

	}

	_selectObject( name ) {

		const obj = this.sceneObjects.find( o => o.name === name );

		// Update list selection
		this.objectListEl.querySelectorAll( '.sdu-list-item' ).forEach( item => {

			item.classList.toggle( 'selected', item.dataset.name === name );

		} );

		if ( obj ) {

			this.selectedObject = obj;
			if ( this.transformControls ) this.transformControls.attach( obj.mesh );

			// Select material if it's a shader material
			if ( obj.mesh.material?.isShaderMaterial ) {

				const matEntry = this.materialLibrary.find( m => m.material === obj.mesh.material );
				if ( matEntry ) this._selectMaterial( matEntry.name );

			}

		} else {

			this.selectedObject = null;
			if ( this.transformControls ) this.transformControls.detach();

		}

	}

	_updateObjectList() {

		this.objectListEl.innerHTML = '';

		// None option
		const noneItem = document.createElement( 'div' );
		noneItem.className = 'sdu-list-item';
		noneItem.dataset.name = '';
		noneItem.textContent = '(None)';
		noneItem.addEventListener( 'click', () => this._selectObject( '' ) );
		this.objectListEl.appendChild( noneItem );

		this.sceneObjects.forEach( obj => {

			const item = document.createElement( 'div' );
			item.className = 'sdu-list-item';
			item.dataset.name = obj.name;
			if ( this.selectedObject?.name === obj.name ) item.classList.add( 'selected' );
			item.innerHTML = `<span>${obj.name}</span><span style="color:#666;font-size:10px;margin-left:auto">${obj.type}</span>`;
			item.addEventListener( 'click', () => this._selectObject( obj.name ) );
			this.objectListEl.appendChild( item );

		} );

		this._autoSave();

	}

	// ==================== MATERIAL MANAGEMENT ====================

	_addMaterialToLibrary( material, name ) {

		if ( this.materialLibrary.find( m => m.material === material ) ) return;
		this.materialLibrary.push( { material, name } );

	}

	_createNewMaterial() {

		const templateName = this.templateSelect.value;
		let material, name;

		if ( templateName && this.debugger ) {

			const template = this.debugger.templateLibrary.getTemplate( templateName );
			if ( template ) {

				const uniforms = {};
				for ( const key in template.uniforms ) {

					const u = template.uniforms[ key ];
					uniforms[ key ] = { value: u.value?.clone ? u.value.clone() : u.value };

				}

				material = new THREE.ShaderMaterial( {
					uniforms,
					vertexShader: template.vertexShader,
					fragmentShader: template.fragmentShader
				} );
				name = `${template.name}_${this.materialLibrary.length + 1}`;

			}

		}

		if ( ! material ) {

			material = new THREE.ShaderMaterial( {
				uniforms: { time: { value: 0 }, color: { value: new THREE.Color( 0x888888 ) } },
				vertexShader: `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
				fragmentShader: `uniform vec3 color; void main() { gl_FragColor = vec4(color, 1.0); }`
			} );
			name = `Material_${this.materialLibrary.length + 1}`;

		}

		this._addMaterialToLibrary( material, name );
		this._updateMaterialList();
		this._selectMaterial( name );

	}

	_applyMaterialToObject() {

		if ( ! this.selectedObject || ! this.currentMaterial ) {

			alert( 'Select both an object and a material' );
			return;

		}

		const obj = this.selectedObject.mesh;
		if ( obj.isMesh ) {

			obj.material = this.currentMaterial;

		} else {

			obj.traverse( child => {

				if ( child.isMesh ) child.material = this.currentMaterial;

			} );

		}

		this._autoSave();

	}

	_deleteSelectedMaterial() {

		if ( ! this.currentMaterial ) return;

		const entry = this.materialLibrary.find( m => m.material === this.currentMaterial );
		if ( ! entry ) return;

		const idx = this.materialLibrary.indexOf( entry );
		if ( idx > - 1 ) this.materialLibrary.splice( idx, 1 );

		if ( this.debugger ) this.debugger.detach( this.currentMaterial );
		this.currentMaterial = null;

		this._updateMaterialList();
		this._updateShaderEditor();
		this._updateUniformEditor();

	}

	_selectMaterial( name ) {

		const entry = this.materialLibrary.find( m => m.name === name );

		this.materialListEl.querySelectorAll( '.sdu-list-item' ).forEach( item => {

			item.classList.toggle( 'selected', item.dataset.name === name );

		} );

		if ( entry ) {

			if ( this.currentMaterial && this.debugger ) {

				this.debugger.detach( this.currentMaterial );

			}

			this.currentMaterial = entry.material;

			if ( this.debugger ) {

				this.debugger.attach( this.currentMaterial );

			}

			this._updateShaderEditor();
			this._updateUniformEditor();

		}

	}

	_updateMaterialList() {

		this.materialListEl.innerHTML = '';

		this.materialLibrary.forEach( entry => {

			const item = document.createElement( 'div' );
			item.className = 'sdu-list-item';
			item.dataset.name = entry.name;
			if ( this.currentMaterial === entry.material ) item.classList.add( 'selected' );
			item.innerHTML = `<span>●</span><span>${entry.name}</span>`;
			item.addEventListener( 'click', () => this._selectMaterial( entry.name ) );
			this.materialListEl.appendChild( item );

		} );

		this._autoSave();

	}

	_updateTemplateSelector() {

		if ( ! this.debugger ) return;

		const templates = this.debugger.templateLibrary.getAllTemplates();
		this.templateSelect.innerHTML = '<option value="">Blank</option>';

		templates.forEach( template => {

			const names = this.debugger.templateLibrary.getAllTemplateNames();
			const key = names.find( n => this.debugger.templateLibrary.getTemplate( n ) === template );

			const opt = document.createElement( 'option' );
			opt.value = key || '';
			opt.textContent = template.name;
			this.templateSelect.appendChild( opt );

		} );

	}

	// ==================== SHADER EDITOR ====================

	_showShaderTab( tab ) {

		this.currentShaderTab = tab;
		this.vertexTabBtn.classList.toggle( 'active', tab === 'vertex' );
		this.fragmentTabBtn.classList.toggle( 'active', tab === 'fragment' );
		this._updateShaderEditor();

	}

	_updateShaderEditor() {

		if ( ! this.currentMaterial ) {

			this.shaderEditor.value = '';
			return;

		}

		const attachment = this.debugger?.attachedMaterials.get( this.currentMaterial );
		const code = this.currentShaderTab === 'vertex'
			? ( attachment?.originalVertexShader || this.currentMaterial.vertexShader )
			: ( attachment?.originalFragmentShader || this.currentMaterial.fragmentShader );

		this.shaderEditor.value = this._formatCode( code || '' );

	}

	_formatCode( code ) {

		// Simple formatting
		const lines = code.split( '\n' );
		let indent = 0;
		const result = [];

		for ( let line of lines ) {

			line = line.trim();
			if ( ! line ) continue;

			if ( line.startsWith( '}' ) || line.startsWith( ')' ) ) indent = Math.max( 0, indent - 1 );

			result.push( '\t'.repeat( indent ) + line );

			if ( line.endsWith( '{' ) ) indent ++;

		}

		return result.join( '\n' );

	}

	_applyShaderCode() {

		if ( ! this.currentMaterial ) return;

		const code = this.shaderEditor.value;

		if ( this.currentShaderTab === 'vertex' ) {

			this.currentMaterial.vertexShader = code;

		} else {

			this.currentMaterial.fragmentShader = code;

		}

		this.currentMaterial.needsUpdate = true;

		// Update attachment
		const attachment = this.debugger?.attachedMaterials.get( this.currentMaterial );
		if ( attachment ) {

			if ( this.currentShaderTab === 'vertex' ) {

				attachment.originalVertexShader = code;

			} else {

				attachment.originalFragmentShader = code;

			}

		}

		this._clearErrors();
		this._updateUniformEditor();
		this._autoSave();

	}

	_resetShaderCode() {

		if ( ! this.currentMaterial || ! this.debugger ) return;

		const attachment = this.debugger.attachedMaterials.get( this.currentMaterial );
		if ( ! attachment ) return;

		if ( this.currentShaderTab === 'vertex' ) {

			this.currentMaterial.vertexShader = attachment.originalVertexShader;

		} else {

			this.currentMaterial.fragmentShader = attachment.originalFragmentShader;

		}

		this.currentMaterial.needsUpdate = true;
		this._updateShaderEditor();

	}

	_saveShaderCode() {

		const code = this.shaderEditor.value;
		const blob = new Blob( [ code ], { type: 'text/plain' } );
		const url = URL.createObjectURL( blob );
		const a = document.createElement( 'a' );
		a.href = url;
		a.download = `${this.currentShaderTab}_shader.glsl`;
		a.click();
		URL.revokeObjectURL( url );

	}

	// ==================== UNIFORM EDITOR ====================

	_updateUniformEditor() {

		this.uniformListEl.innerHTML = '';

		if ( ! this.currentMaterial?.uniforms ) return;

		// Sync uniforms from shader code
		this._syncUniformsFromShaderCode();

		for ( const name in this.currentMaterial.uniforms ) {

			const uniform = this.currentMaterial.uniforms[ name ];
			this._createUniformControl( name, uniform );

		}

	}

	_syncUniformsFromShaderCode() {

		if ( ! this.currentMaterial ) return;

		const vs = this.currentMaterial.vertexShader || '';
		const fs = this.currentMaterial.fragmentShader || '';
		const combined = vs + '\n' + fs;

		// Parse uniform declarations
		const regex = /uniform\s+(float|int|vec2|vec3|vec4|mat3|mat4|sampler2D)\s+(\w+)/g;
		const found = new Set();
		let match;

		while ( ( match = regex.exec( combined ) ) !== null ) {

			found.add( match[ 2 ] );

		}

		// Remove uniforms not in shader
		for ( const name of Object.keys( this.currentMaterial.uniforms ) ) {

			if ( ! found.has( name ) ) {

				delete this.currentMaterial.uniforms[ name ];

			}

		}

		// Add missing uniforms
		regex.lastIndex = 0;
		while ( ( match = regex.exec( combined ) ) !== null ) {

			const type = match[ 1 ];
			const name = match[ 2 ];

			if ( ! this.currentMaterial.uniforms[ name ] ) {

				let value;
				switch ( type ) {

					case 'float': case 'int': value = 0; break;
					case 'vec2': value = new THREE.Vector2(); break;
					case 'vec3': value = name.toLowerCase().includes( 'color' ) ? new THREE.Color() : new THREE.Vector3(); break;
					case 'vec4': value = new THREE.Vector4(); break;
					default: value = null;

				}

				if ( value !== null ) {

					this.currentMaterial.uniforms[ name ] = { value };

				}

			}

		}

	}

	_createUniformControl( name, uniform ) {

		const container = document.createElement( 'div' );
		container.className = 'sdu-uniform-item';

		const value = uniform.value;
		let typeStr = 'unknown';
		if ( typeof value === 'number' ) typeStr = 'float';
		else if ( value?.isColor ) typeStr = 'color';
		else if ( value?.isVector2 ) typeStr = 'vec2';
		else if ( value?.isVector3 ) typeStr = 'vec3';
		else if ( value?.isVector4 ) typeStr = 'vec4';

		container.innerHTML = `<div class="sdu-uniform-name">${name} <span class="sdu-uniform-type">${typeStr}</span></div>`;

		const controlRow = document.createElement( 'div' );
		controlRow.className = 'sdu-row';

		if ( typeof value === 'number' ) {

			const slider = document.createElement( 'input' );
			slider.type = 'range';
			slider.className = 'sdu-slider';
			slider.min = - 10; slider.max = 10; slider.step = 0.01;
			slider.value = value;

			const input = document.createElement( 'input' );
			input.type = 'number';
			input.className = 'sdu-input';
			input.value = value.toFixed( 2 );
			input.step = 0.01;

			const update = v => { uniform.value = parseFloat( v ); slider.value = v; input.value = parseFloat( v ).toFixed( 2 ); };
			slider.addEventListener( 'input', e => update( e.target.value ) );
			input.addEventListener( 'input', e => update( e.target.value ) );

			controlRow.appendChild( slider );
			controlRow.appendChild( input );

		} else if ( value?.isColor ) {

			const swatch = document.createElement( 'div' );
			swatch.className = 'sdu-color-swatch';
			swatch.style.background = '#' + value.getHexString();

			const picker = document.createElement( 'input' );
			picker.type = 'color';
			picker.className = 'sdu-color-input';
			picker.value = '#' + value.getHexString();
			picker.addEventListener( 'input', e => {

				value.setHex( parseInt( e.target.value.slice( 1 ), 16 ) );
				swatch.style.background = e.target.value;

			} );

			swatch.appendChild( picker );
			controlRow.appendChild( swatch );

		} else if ( value?.isVector2 || value?.isVector3 || value?.isVector4 ) {

			[ 'x', 'y', 'z', 'w' ].forEach( comp => {

				if ( value[ comp ] === undefined ) return;

				const input = document.createElement( 'input' );
				input.type = 'number';
				input.className = 'sdu-input';
				input.value = value[ comp ].toFixed( 2 );
				input.step = 0.01;
				input.placeholder = comp.toUpperCase();
				input.addEventListener( 'input', e => { value[ comp ] = parseFloat( e.target.value ) || 0; } );
				controlRow.appendChild( input );

			} );

		}

		container.appendChild( controlRow );
		this.uniformListEl.appendChild( container );

	}

	// ==================== ERROR HANDLING ====================

	_displayError( error ) {

		this.errorPanel.classList.add( 'visible' );
		let html = '';

		if ( error.vertexErrors?.length ) {

			html += '<strong>Vertex:</strong><br>';
			error.vertexErrors.forEach( e => html += `Line ${e.line}: ${e.message}<br>` );

		}

		if ( error.fragmentErrors?.length ) {

			html += '<strong>Fragment:</strong><br>';
			error.fragmentErrors.forEach( e => html += `Line ${e.line}: ${e.message}<br>` );

		}

		this.errorPanel.innerHTML = html || 'Unknown error';

	}

	_clearErrors() {

		this.errorPanel.classList.remove( 'visible' );
		this.errorPanel.innerHTML = '';

	}

	// ==================== PROFILER ====================

	_toggleProfiling( btn ) {

		if ( this.isProfiling ) {

			this.debugger?.stopProfiling();
			btn.textContent = 'Start Profiling';
			this.isProfiling = false;

		} else {

			this.debugger?.startProfiling();
			btn.textContent = 'Stop Profiling';
			this.isProfiling = true;

		}

	}

	_updateProfilerDisplay() {

		if ( ! this.debugger ) return;

		const s = this.debugger.profiler.getSummary();
		const fpsClass = s.fps >= 55 ? 'good' : s.fps >= 30 ? 'warning' : 'bad';

		this.profilerDisplay.innerHTML = `
			<div class="sdu-stat-item ${fpsClass}"><div class="sdu-stat-value">${s.fps.toFixed( 0 )}</div><div class="sdu-stat-label">FPS</div></div>
			<div class="sdu-stat-item"><div class="sdu-stat-value">${s.avgFrameTime.toFixed( 1 )}</div><div class="sdu-stat-label">Frame (ms)</div></div>
			<div class="sdu-stat-item"><div class="sdu-stat-value">${s.drawCalls}</div><div class="sdu-stat-label">Draw Calls</div></div>
			<div class="sdu-stat-item"><div class="sdu-stat-value">${s.triangles.toLocaleString()}</div><div class="sdu-stat-label">Triangles</div></div>
			<div class="sdu-stat-item"><div class="sdu-stat-value">${s.programs}</div><div class="sdu-stat-label">Programs</div></div>
			<div class="sdu-stat-item"><div class="sdu-stat-value">${s.textures}</div><div class="sdu-stat-label">Textures</div></div>
		`;

	}

	// ==================== PERSISTENCE ====================

	_autoSave() {

		if ( ! this.autoSaveEnabled || ! this.scene ) return;

		clearTimeout( this.autoSaveTimeout );
		this.autoSaveTimeout = setTimeout( () => {

			try {

				const data = this._getSceneData();
				localStorage.setItem( this.storageKey, JSON.stringify( data ) );

			} catch ( e ) { console.warn( 'Auto-save failed:', e ); }

		}, 500 );

	}

	_getSceneData() {

		const data = { materials: [], objects: [] };

		this.materialLibrary.forEach( entry => {

			const mat = entry.material;
			const uniforms = {};

			for ( const key in mat.uniforms ) {

				const v = mat.uniforms[ key ].value;
				if ( typeof v === 'number' ) uniforms[ key ] = { type: 'float', value: v };
				else if ( v?.isColor ) uniforms[ key ] = { type: 'color', value: v.getHex() };
				else if ( v?.isVector2 ) uniforms[ key ] = { type: 'vec2', value: v.toArray() };
				else if ( v?.isVector3 ) uniforms[ key ] = { type: 'vec3', value: v.toArray() };
				else if ( v?.isVector4 ) uniforms[ key ] = { type: 'vec4', value: v.toArray() };

			}

			data.materials.push( {
				name: entry.name,
				vertexShader: mat.vertexShader,
				fragmentShader: mat.fragmentShader,
				uniforms
			} );

		} );

		this.sceneObjects.forEach( obj => {

			if ( obj.type === 'model' ) return;

			const matIdx = this.materialLibrary.findIndex( m => m.material === obj.mesh.material );

			data.objects.push( {
				name: obj.name,
				type: obj.type,
				position: obj.mesh.position.toArray(),
				rotation: obj.mesh.rotation.toArray(),
				scale: obj.mesh.scale.toArray(),
				materialIndex: matIdx
			} );

		} );

		return data;

	}

	_loadFromLocalStorage() {

		try {

			const saved = localStorage.getItem( this.storageKey );
			if ( ! saved ) return;

			const data = JSON.parse( saved );
			this._restoreSceneData( data );

		} catch ( e ) { console.warn( 'Failed to load session:', e ); }

	}

	_restoreSceneData( data ) {

		// Clear existing
		this.sceneObjects.forEach( obj => this.scene.remove( obj.mesh ) );
		this.sceneObjects = [];
		this.materialLibrary = [];
		this.currentMaterial = null;
		if ( this.transformControls ) this.transformControls.detach();

		// Load materials
		const loadedMats = [];
		( data.materials || [] ).forEach( m => {

			const uniforms = {};
			for ( const key in m.uniforms ) {

				const u = m.uniforms[ key ];
				switch ( u.type ) {

					case 'float': uniforms[ key ] = { value: u.value }; break;
					case 'color': uniforms[ key ] = { value: new THREE.Color( u.value ) }; break;
					case 'vec2': uniforms[ key ] = { value: new THREE.Vector2().fromArray( u.value ) }; break;
					case 'vec3': uniforms[ key ] = { value: new THREE.Vector3().fromArray( u.value ) }; break;
					case 'vec4': uniforms[ key ] = { value: new THREE.Vector4().fromArray( u.value ) }; break;

				}

			}

			const mat = new THREE.ShaderMaterial( { uniforms, vertexShader: m.vertexShader, fragmentShader: m.fragmentShader } );
			loadedMats.push( mat );
			this._addMaterialToLibrary( mat, m.name );

		} );

		// Load objects
		( data.objects || [] ).forEach( o => {

			let geom;
			switch ( o.type ) {

				case 'box': geom = new THREE.BoxGeometry( 1, 1, 1 ); break;
				case 'sphere': geom = new THREE.SphereGeometry( 0.5, 32, 32 ); break;
				case 'plane': geom = new THREE.PlaneGeometry( 1, 1, 32, 32 ); break;
				case 'cylinder': geom = new THREE.CylinderGeometry( 0.5, 0.5, 1, 32 ); break;
				case 'torus': geom = new THREE.TorusGeometry( 0.5, 0.2, 16, 100 ); break;
				default: return;

			}

			const mat = o.materialIndex >= 0 && o.materialIndex < loadedMats.length
				? loadedMats[ o.materialIndex ]
				: new THREE.MeshBasicMaterial( { color: 0x888888 } );

			const mesh = new THREE.Mesh( geom, mat );
			mesh.position.fromArray( o.position );
			mesh.rotation.fromArray( o.rotation );
			mesh.scale.fromArray( o.scale );

			this.scene.add( mesh );
			this.sceneObjects.push( { mesh, name: o.name, type: o.type } );

		} );

		this._updateObjectList();
		this._updateMaterialList();

	}

	_saveScene() {

		const data = this._getSceneData();
		const blob = new Blob( [ JSON.stringify( data, null, 2 ) ], { type: 'application/json' } );
		const url = URL.createObjectURL( blob );
		const a = document.createElement( 'a' );
		a.href = url;
		a.download = 'scene.json';
		a.click();
		URL.revokeObjectURL( url );

	}

	_loadScene() {

		const input = document.createElement( 'input' );
		input.type = 'file';
		input.accept = '.json';
		input.addEventListener( 'change', e => {

			const file = e.target.files[ 0 ];
			if ( ! file ) return;

			const reader = new FileReader();
			reader.onload = ev => {

				try {

					const data = JSON.parse( ev.target.result );
					this._restoreSceneData( data );
					this._autoSave();

				} catch ( err ) { alert( 'Failed to load scene' ); }

			};
			reader.readAsText( file );

		} );
		input.click();

	}

	_hardReload() {

		if ( ! confirm( 'Clear all saved progress and reset?' ) ) return;
		localStorage.removeItem( this.storageKey );
		window.location.reload();

	}

	_updateUI() {

		this._updateObjectList();
		this._updateMaterialList();
		this._updateShaderEditor();
		this._updateUniformEditor();

	}

}

export { ShaderDebuggerUI };

