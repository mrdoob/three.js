import { Extension } from 'three/addons/inspector/Extension.js';
import {
	createDefaultParams,
	LUT_PRESETS,
	exportCubeFormat,
	exportLUTCanvas,
	parseCubeFormat
} from './LUTMath.js';
import {
	Data3DTexture,
	LinearFilter,
	RGBAFormat,
	FloatType,
	NoToneMapping,
	RenderPipeline
} from 'three/webgpu';
import { pass, texture3D, renderOutput } from 'three/tsl';
import { lut3D } from 'three/addons/tsl/display/Lut3DNode.js';

import { LUT3DStyle } from './LUT3DStyle.js';

// Module imports
import { WhiteBalanceModule } from './modules/WhiteBalanceModule.js';
import { ExposureModule } from './modules/ExposureModule.js';
import { BrightnessModule } from './modules/BrightnessModule.js';
import { HueModule } from './modules/HueModule.js';
import { ColorWheelModule } from './modules/ColorWheelModule.js';
import { CurvesModule } from './modules/CurvesModule.js';
import { ContrastModule } from './modules/ContrastModule.js';
import { SaturationModule } from './modules/SaturationModule.js';
import { VibranceModule } from './modules/VibranceModule.js';
import { ImportedCubeModule } from './modules/ImportedCubeModule.js';
import { RendererModule } from './modules/RendererModule.js';
import { OutputModule } from './modules/OutputModule.js';

const _rendererPipelines = new WeakMap();

const _origRender = RenderPipeline.prototype.render;

if ( _origRender && ! _origRender._lut3dHooked ) {

	RenderPipeline.prototype.render = function ( ...args ) {

		if ( this.renderer ) {

			_rendererPipelines.set( this.renderer, this );

		}

		return _origRender.apply( this, args );

	};

	RenderPipeline.prototype.render._lut3dHooked = true;

}

const DEFAULT_PIPELINE_ORDER = [
	'renderer',
	'whiteBalance',
	'lift',
	'gammaBal',
	'gain',
	'offset',
	'curves',
	'saturation',
	'vibrance',
	'output'
];

export class ColorGrading extends Extension {

	constructor( options = {} ) {

		super( 'Color Grading', options );

		LUT3DStyle.init();

		this.params = createDefaultParams();
		this.lutSize = 32;
		this.lutTexture = null;
		this.lutPassNode = null;
		this.sceneGradingEnabled = false;
		this.selectedToneMapping = NoToneMapping;
		this._lutNeedsUpdate = true;
		this._lutSizeChanged = false;
		this.activeTab = 'wheels';

		this.modulesMap = new Map();
		this.cardsMap = new Map();

		// Container Setup matching Inspector tabs
		this.content.style.overflow = 'hidden';
		this.content.style.display = 'flex';
		this.content.style.flexDirection = 'column';
		this.content.style.height = '100%';
		this.content.style.background = 'transparent';

		this._buildHeader();
		this._buildMainView();

	}

	_createSvgIcon( svgPath, width = 13, height = 13, strokeWidth = 2 ) {

		const ns = 'http://www.w3.org/2000/svg';
		const svg = document.createElementNS( ns, 'svg' );
		svg.setAttribute( 'width', String( width ) );
		svg.setAttribute( 'height', String( height ) );
		svg.setAttribute( 'viewBox', '0 0 24 24' );
		svg.setAttribute( 'fill', 'none' );
		svg.setAttribute( 'stroke', 'currentColor' );
		svg.setAttribute( 'stroke-width', String( strokeWidth ) );
		svg.setAttribute( 'stroke-linecap', 'round' );
		svg.setAttribute( 'stroke-linejoin', 'round' );
		svg.style.display = 'block';
		svg.innerHTML = svgPath;
		return svg;

	}

	_buildHeader() {

		// All controls consolidated into sleek Control Dock inside lut-container

	}

	_buildMainView() {

		this.viewContainer = document.createElement( 'div' );
		this.viewContainer.className = this.sceneGradingEnabled ? 'lut-container is-live-active' : 'lut-container';

		// Glass Control Dock Container at top of lut-container
		const dock = document.createElement( 'div' );
		dock.className = 'lut-dock-container';
		this.dockContainer = dock;

		// 1. LEFT GROUP: Grid Size
		const leftGroup = document.createElement( 'div' );
		leftGroup.className = 'lut-dock-group';

		const sizeLabel = document.createElement( 'span' );
		sizeLabel.className = 'lut-dock-label';
		sizeLabel.textContent = 'Grid';

		const sizeSelect = document.createElement( 'select' );
		sizeSelect.className = 'lut-dock-select';
		this.lutSizeSelect = sizeSelect;

		const sizes = [ 16, 32, 64 ];
		sizes.forEach( size => {

			const opt = document.createElement( 'option' );
			opt.value = size;
			opt.textContent = `${size}³`;
			if ( size === this.lutSize ) opt.selected = true;
			sizeSelect.appendChild( opt );

		} );

		sizeSelect.onchange = ( e ) => {

			this.lutSize = parseInt( e.target.value, 10 );
			this._lutSizeChanged = true;
			this._onParamChange();

		};

		leftGroup.appendChild( sizeLabel );
		leftGroup.appendChild( sizeSelect );

		// 2. CENTER GROUP: Live Preview Button
		const centerGroup = document.createElement( 'div' );
		centerGroup.className = 'lut-dock-group';

		const gradingBtn = document.createElement( 'button' );
		gradingBtn.className = 'lut-dock-btn';
		gradingBtn.title = 'Toggle Realtime Scene Color Grading';
		this.gradingBtn = gradingBtn;

		const updateGradingBtnState = () => {

			gradingBtn.innerHTML = '';
			const eyeIcon = this._createSvgIcon( '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>', 13, 13 );
			const lbl = document.createElement( 'span' );

			if ( this.sceneGradingEnabled ) {

				if ( this.viewContainer ) this.viewContainer.classList.add( 'is-live-active' );
				gradingBtn.className = 'lut-dock-btn active';
				lbl.textContent = 'Live Preview';
				lbl.className = 'lut-dock-text';

			} else {

				if ( this.viewContainer ) this.viewContainer.classList.remove( 'is-live-active' );
				gradingBtn.className = 'lut-dock-btn';
				lbl.textContent = 'Live Preview';
				lbl.className = 'lut-dock-text';

			}

			gradingBtn.appendChild( eyeIcon );
			gradingBtn.appendChild( lbl );
			this._updateRendererCardState();

		};

		this.updateGradingBtnState = updateGradingBtnState;

		gradingBtn.onclick = () => {

			this.sceneGradingEnabled = ! this.sceneGradingEnabled;
			updateGradingBtnState();
			this._toggleSceneGrading( this.sceneGradingEnabled );
			this.save();

		};

		updateGradingBtnState();
		centerGroup.appendChild( gradingBtn );

		// Active context menu tracker
		let activeContextMenu = null;

		const closeContextMenu = () => {

			if ( activeContextMenu ) {

				activeContextMenu.remove();
				activeContextMenu = null;

			}

		};

		window.addEventListener( 'pointerdown', ( e ) => {

			if ( activeContextMenu && ! activeContextMenu.contains( e.target ) ) {

				closeContextMenu();

			}

		} );

		const showContextMenu = ( parentNode, items, isSubmenu = false ) => {

			if ( ! isSubmenu ) closeContextMenu();

			const menu = document.createElement( 'div' );
			menu.className = isSubmenu ? 'lut-context-menu lut-submenu' : 'lut-context-menu';

			let activeSubmenu = null;

			const closeActiveSubmenu = () => {

				if ( activeSubmenu ) {

					activeSubmenu.remove();
					activeSubmenu = null;

				}

			};

			items.forEach( item => {

				if ( item.divider ) {

					const div = document.createElement( 'div' );
					div.className = 'lut-menu-divider';
					menu.appendChild( div );
					return;

				}

				const row = document.createElement( 'div' );
				row.className = 'lut-menu-item';

				if ( item.iconPath ) {

					const icon = this._createSvgIcon( item.iconPath, 13, 13 );
					row.appendChild( icon );

				}

				const label = document.createElement( 'span' );
				label.textContent = item.label;
				label.style.flex = '1';
				row.appendChild( label );

				if ( item.submenu ) {

					const arrow = document.createElement( 'span' );
					arrow.textContent = '▸';
					arrow.style.cssText = 'font-size: 10px; opacity: 0.6; margin-left: 6px;';
					row.appendChild( arrow );

					row.style.position = 'relative';

					const toggleSubmenu = ( e ) => {

						e.stopPropagation();
						if ( activeSubmenu ) {

							closeActiveSubmenu();

						} else {

							activeSubmenu = showContextMenu( row, item.submenu, true );

						}

					};

					row.onmouseenter = () => {

						closeActiveSubmenu();
						activeSubmenu = showContextMenu( row, item.submenu, true );

					};

					row.onclick = toggleSubmenu;

				} else if ( item.action ) {

					row.onmouseenter = () => closeActiveSubmenu();

					row.onclick = ( e ) => {

						e.stopPropagation();
						closeContextMenu();
						item.action();

					};

				}

				menu.appendChild( row );

			} );

			if ( ! isSubmenu ) {

				parentNode.style.position = 'relative';
				activeContextMenu = menu;

			}

			parentNode.appendChild( menu );
			return menu;

		};

		// 3. RIGHT GROUP: Action Buttons with Context Menus
		const rightGroup = document.createElement( 'div' );
		rightGroup.className = 'lut-dock-group';

		const createDockBtn = ( title, text, svgPath, onClick ) => {

			const btn = document.createElement( 'button' );
			btn.className = text ? 'lut-dock-btn' : 'lut-dock-btn lut-dock-icon-btn';
			btn.title = title;

			if ( svgPath ) {

				const icon = this._createSvgIcon( svgPath, 13, 13 );
				btn.appendChild( icon );

			}

			if ( text ) {

				const txt = document.createElement( 'span' );
				txt.textContent = text;
				btn.appendChild( txt );

			}

			btn.onclick = onClick;
			return btn;

		};

		const importBtn = createDockBtn(
			'Import (.CUBE / JSON / Presets)',
			'▾',
			'<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>',
			( e ) => {

				e.stopPropagation();

				const presetItems = Object.keys( LUT_PRESETS ).map( presetName => ( {
					label: presetName,
					iconPath: '<path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>',
					action: () => this.load( { params: LUT_PRESETS[ presetName ] } )
				} ) );

				showContextMenu( importBtn, [
					{
						label: 'Load JSON',
						iconPath: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>',
						action: () => this._importJsonFile()
					},
					{
						label: 'Import Adobe .CUBE',
						iconPath: '<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>',
						action: () => this._importCubeFile()
					},
					{ divider: true },
					{
						label: 'Presets',
						iconPath: '<path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>',
						submenu: presetItems
					}
				] );

			}
		);

		const exportBtn = createDockBtn(
			'Export (.CUBE / PNG / JSON)',
			'▾',
			'<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>',
			( e ) => {

				e.stopPropagation();
				showContextMenu( exportBtn, [
					{
						label: 'Export JSON',
						iconPath: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>',
						action: () => this._exportJsonFile()
					},
					{ divider: true },
					{
						label: 'Export .CUBE (3D LUT)',
						iconPath: '<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="7.5 4.21 12 6.81 16.5 4.21"/>',
						action: () => this._exportCubeFile()
					},
					{
						label: 'Export PNG (2D LUT)',
						iconPath: '<rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>',
						action: () => this._exportPngFile()
					}
				] );

			}
		);

		const resetBtn = createDockBtn(
			'Reset',
			null,
			'<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>',
			() => {

				// Reset component pipeline order to default
				this.pipelineOrder = [ ...DEFAULT_PIPELINE_ORDER ];

				// Remove any custom or duplicated cards if present
				this.modulesMap.forEach( ( comp, modId ) => {

					if ( ! DEFAULT_PIPELINE_ORDER.includes( modId ) ) {

						if ( comp && comp.domElement ) comp.domElement.remove();
						this.modulesMap.delete( modId );
						this.cardsMap.delete( modId );

					}

				} );

				// Re-render pipeline cards flow
				this._renderCardsFlow();

				// Reset all module components
				this.modulesMap.forEach( ( comp ) => {

					if ( comp && typeof comp.reset === 'function' ) {

						comp.reset();

					}

				} );

				// Reset all color grading parameters to neutral default
				this.load( { params: LUT_PRESETS[ 'Neutral (Default)' ] } );

			}
		);

		rightGroup.appendChild( importBtn );
		rightGroup.appendChild( exportBtn );
		rightGroup.appendChild( resetBtn );

		dock.appendChild( leftGroup );
		dock.appendChild( centerGroup );
		dock.appendChild( rightGroup );

		this.viewContainer.appendChild( dock );

		const panel = document.createElement( 'div' );
		panel.className = 'lut-panel';

		// Single Unified Horizontal Flow Cards Row
		this.cardsRow = document.createElement( 'div' );
		this.cardsRow.className = 'lut-cards-row';

		// Default calculation pipeline sequence
		this.pipelineOrder = [ ...DEFAULT_PIPELINE_ORDER ];

		// Initialize Module instances
		const onParamChange = () => this._onParamChange();

		const rendererComp = new RendererModule(
			{ toneMapping: this.selectedToneMapping, exposure: 1.0 },
			onParamChange,
			( comp ) => {

				this.selectedToneMapping = comp.params.toneMapping;
				if ( this.sceneGradingEnabled ) {

					const renderer = this.inspector ? this.inspector.getRenderer() : null;
					if ( renderer ) {

						renderer.toneMappingExposure = comp.params.exposure;

					}

					this._applyLiveGrading();

				}

				this.save();

			}
		);

		const wbComp = new WhiteBalanceModule( this.params, onParamChange, () => this._removeCard( 'whiteBalance' ) );

		const liftComp = new ColorWheelModule( 'lift', 'Shadows', this.params.lift, onParamChange, () => this._removeCard( 'lift' ) );
		const gammaBalComp = new ColorWheelModule( 'gammaBal', 'Midtones', this.params.gammaBal, onParamChange, () => this._removeCard( 'gammaBal' ) );
		const gainComp = new ColorWheelModule( 'gain', 'Highlights', this.params.gain, onParamChange, () => this._removeCard( 'gain' ) );
		const offsetComp = new ColorWheelModule( 'offset', 'Offset', this.params.offset || { r: 0, g: 0, b: 0 }, onParamChange, () => this._removeCard( 'offset' ) );

		const curvesComp = new CurvesModule( this.params.curves, onParamChange, () => this._removeCard( 'curves' ) );
		const satComp = new SaturationModule( this.params, onParamChange, () => this._removeCard( 'saturation' ) );
		const vibranceComp = new VibranceModule( this.params, onParamChange, () => this._removeCard( 'vibrance' ) );
		const outputComp = new OutputModule( {}, onParamChange );

		this.modulesMap = new Map( [
			[ 'renderer', rendererComp ],
			[ 'whiteBalance', wbComp ],
			[ 'lift', liftComp ],
			[ 'gammaBal', gammaBalComp ],
			[ 'gain', gainComp ],
			[ 'offset', offsetComp ],
			[ 'curves', curvesComp ],
			[ 'saturation', satComp ],
			[ 'vibrance', vibranceComp ],
			[ 'output', outputComp ]
		] );

		this.cardsMap = new Map();

		this.modulesMap.forEach( ( comp, id ) => {

			this.cardsMap.set( id, comp.domElement );
			this._setupCardDragAndDrop( comp.domElement, id );

		} );

		// Render initial flow of cards separated by connector lines
		this._renderCardsFlow();

		// Enable mouse wheel horizontal scrolling & background drag-to-pan
		this._setupPanAndWheelScroll( panel, this.cardsRow );

		if ( typeof ResizeObserver !== 'undefined' ) {

			this._cardsResizeObserver = new ResizeObserver( () => this._updateCardsRowAlignment() );
			this._cardsResizeObserver.observe( this.cardsRow );

		}

		this._windowResizeHandler = () => this._updateCardsRowAlignment();
		window.addEventListener( 'resize', this._windowResizeHandler );

		panel.appendChild( this.cardsRow );
		this.viewContainer.appendChild( panel );
		this.content.appendChild( this.viewContainer );

	}

	_isVerticalMode() {

		if ( ! this.cardsRow ) return false;
		const panelEl = this.content ? this.content.closest( '.profiler-panel' ) : null;
		return this.cardsRow.classList.contains( 'is-vertical' ) ||
			( this.viewContainer && this.viewContainer.classList.contains( 'is-vertical' ) ) ||
			( panelEl && ( panelEl.classList.contains( 'position-left' ) || panelEl.classList.contains( 'position-right' ) ) );

	}

	_updateCardsRowAlignment() {

		if ( ! this.cardsRow ) return;

		requestAnimationFrame( () => {

			if ( ! this.cardsRow ) return;

			const isVert = this._isVerticalMode();

			if ( isVert ) {

				const hasVertOverflow = this.cardsRow.scrollHeight > ( this.cardsRow.clientHeight + 2 );

				if ( hasVertOverflow ) {

					this.cardsRow.style.setProperty( 'justify-content', 'flex-start', 'important' );

				} else {

					this.cardsRow.style.setProperty( 'justify-content', 'center', 'important' );

				}

				this.cardsRow.style.setProperty( 'align-items', 'center', 'important' );

			} else {

				const hasOverflow = this.cardsRow.scrollWidth > ( this.cardsRow.clientWidth + 2 );

				if ( hasOverflow ) {

					this.cardsRow.style.setProperty( 'justify-content', 'flex-start', 'important' );

				} else {

					this.cardsRow.style.setProperty( 'justify-content', 'center', 'important' );

				}

				this.cardsRow.style.setProperty( 'align-items', 'center', 'important' );

			}

		} );

	}

	_setupPanAndWheelScroll( container, cardsRow ) {

		if ( ! cardsRow || ! container ) return;

		let targetScroll = 0;
		let isAnimating = false;

		const isVerticalMode = () => this._isVerticalMode();

		const updateSmoothScroll = () => {

			const isVert = isVerticalMode();
			const current = isVert ? cardsRow.scrollTop : cardsRow.scrollLeft;
			const diff = targetScroll - current;

			if ( Math.abs( diff ) > 0.5 ) {

				if ( isVert ) {

					cardsRow.scrollTop += diff * 0.18;

				} else {

					cardsRow.scrollLeft += diff * 0.18;

				}

				requestAnimationFrame( updateSmoothScroll );

			} else {

				if ( isVert ) {

					cardsRow.scrollTop = targetScroll;

				} else {

					cardsRow.scrollLeft = targetScroll;

				}

				isAnimating = false;

			}

		};

		cardsRow.addEventListener( 'wheel', ( e ) => {

			if ( isVerticalMode() ) {

				return; // Native vertical scrolling in vertical mode

			}

			if ( e.deltaY !== 0 ) {

				e.preventDefault();

				const maxScroll = cardsRow.scrollWidth - cardsRow.clientWidth;
				if ( ! isAnimating ) {

					targetScroll = cardsRow.scrollLeft;

				}

				targetScroll = Math.max( 0, Math.min( maxScroll, targetScroll + e.deltaY * 1.2 ) );

				if ( ! isAnimating ) {

					isAnimating = true;
					requestAnimationFrame( updateSmoothScroll );

				}

			}

		}, { passive: false } );

		let isPanning = false;
		let startPos = 0;
		let scrollStart = 0;
		let lastPos = 0;
		let lastTime = 0;
		let velocity = 0;
		let momentumRafId = null;

		const startPan = ( e ) => {

			if ( e.pointerType === 'touch' ) return;
			if ( e.target.closest( '.lut-card' ) || e.target.closest( '.lut-dock-container' ) ) return;

			if ( momentumRafId ) {

				cancelAnimationFrame( momentumRafId );
				momentumRafId = null;

			}

			isPanning = true;
			cardsRow.classList.add( 'is-panning' );
			container.classList.add( 'is-panning' );

			const isVert = isVerticalMode();
			const currentPos = isVert ? ( e.pageY - cardsRow.offsetTop ) : ( e.pageX - cardsRow.offsetLeft );

			startPos = currentPos;
			lastPos = currentPos;
			lastTime = performance.now();
			velocity = 0;
			scrollStart = isVert ? cardsRow.scrollTop : cardsRow.scrollLeft;
			targetScroll = scrollStart;

		};

		const movePan = ( e ) => {

			if ( ! isPanning ) return;
			e.preventDefault();

			const isVert = isVerticalMode();
			const currentPos = isVert ? ( e.pageY - cardsRow.offsetTop ) : ( e.pageX - cardsRow.offsetLeft );
			const currentTime = performance.now();

			const deltaPos = currentPos - lastPos;
			const deltaTime = Math.max( 1, currentTime - lastTime );

			const instantVelocity = deltaPos / deltaTime;
			velocity = 0.5 * velocity + 0.5 * instantVelocity;

			lastPos = currentPos;
			lastTime = currentTime;

			const walk = currentPos - startPos;

			if ( isVert ) {

				cardsRow.scrollTop = scrollStart - walk;
				targetScroll = cardsRow.scrollTop;

			} else {

				cardsRow.scrollLeft = scrollStart - walk;
				targetScroll = cardsRow.scrollLeft;

			}

		};

		const endPan = () => {

			if ( ! isPanning ) return;

			isPanning = false;
			cardsRow.classList.remove( 'is-panning' );
			container.classList.remove( 'is-panning' );

			const isVert = isVerticalMode();

			// Apply smooth momentum deceleration physics
			let currentVelocity = velocity;

			const animateMomentum = () => {

				if ( Math.abs( currentVelocity ) < 0.02 ) return;

				const maxScroll = isVert ? ( cardsRow.scrollHeight - cardsRow.clientHeight ) : ( cardsRow.scrollWidth - cardsRow.clientWidth );

				if ( isVert ) {

					cardsRow.scrollTop = Math.max( 0, Math.min( maxScroll, cardsRow.scrollTop - currentVelocity * 16 ) );

				} else {

					cardsRow.scrollLeft = Math.max( 0, Math.min( maxScroll, cardsRow.scrollLeft - currentVelocity * 16 ) );

				}

				currentVelocity *= 0.94; // Friction factor

				if ( Math.abs( currentVelocity ) >= 0.02 ) {

					momentumRafId = requestAnimationFrame( animateMomentum );

				}

			};

			momentumRafId = requestAnimationFrame( animateMomentum );

		};

		cardsRow.addEventListener( 'pointerdown', startPan );
		window.addEventListener( 'pointermove', movePan );
		window.addEventListener( 'pointerup', endPan );

	}

	_renderCardsFlow() {

		if ( ! this.cardsRow ) return;

		// Remove cards no longer in pipelineOrder
		const existingCards = Array.from( this.cardsRow.children );
		existingCards.forEach( child => {

			const modId = child.getAttribute( 'data-module-id' );
			if ( modId && ! this.pipelineOrder.includes( modId ) ) {

				child.remove();

			}

		} );

		// Clean old connectors
		const connectors = this.cardsRow.querySelectorAll( '.lut-flow-connector' );
		connectors.forEach( c => c.remove() );

		// Guarantee Renderer at start (0) and Output at end (last)
		if ( ! this.pipelineOrder.includes( 'renderer' ) ) {

			this.pipelineOrder.unshift( 'renderer' );

		} else {

			const rIdx = this.pipelineOrder.indexOf( 'renderer' );
			if ( rIdx !== 0 ) {

				this.pipelineOrder.splice( rIdx, 1 );
				this.pipelineOrder.unshift( 'renderer' );

			}

		}

		if ( ! this.pipelineOrder.includes( 'output' ) ) {

			this.pipelineOrder.push( 'output' );

		} else {

			const oIdx = this.pipelineOrder.indexOf( 'output' );
			if ( oIdx !== this.pipelineOrder.length - 1 ) {

				this.pipelineOrder.splice( oIdx, 1 );
				this.pipelineOrder.push( 'output' );

			}

		}

		// Re-append cards in current pipelineOrder
		this.pipelineOrder.forEach( ( modId ) => {

			const comp = this.modulesMap.get( modId );
			if ( comp && comp.domElement ) {

				comp.domElement.classList.remove( 'lut-card-moving' );
				this.cardsRow.appendChild( comp.domElement );

			}

		} );

		this._updateLiveFlowConnectors();
		this._updateRendererCardState();
		this._updateCardsRowAlignment();

	}

	_updateLiveFlowConnectors() {

		if ( ! this.cardsRow ) return;

		const oldConnectors = this.cardsRow.querySelectorAll( '.lut-flow-connector' );
		oldConnectors.forEach( c => c.remove() );

		const items = Array.from( this.cardsRow.children ).filter( el =>
			el.classList.contains( 'lut-card' )
		);

		const createConnector = ( insertIndex, titleTip ) => {

			const connector = document.createElement( 'div' );
			connector.className = 'lut-flow-connector';
			connector.title = titleTip;

			const addBtn = document.createElement( 'button' );
			addBtn.className = 'lut-connector-add-btn';
			addBtn.appendChild( this._createSvgIcon( '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>', 12, 12, 2.5 ) );
			addBtn.title = 'Add Card Here';
			addBtn.onclick = ( e ) => {

				e.stopPropagation();
				this._openAddCardModal( insertIndex );

			};

			connector.appendChild( addBtn );
			return connector;

		};

		for ( let i = 0; i < items.length - 1; i ++ ) {

			const current = items[ i ];
			const next = items[ i + 1 ];

			const idA = current.getAttribute( 'data-module-id' ) || 'Origin';
			const idB = next.getAttribute( 'data-module-id' ) || 'Target';

			const connector = createConnector( i + 1, `Insert Card between ${idA} ➔ ${idB}` );
			this.cardsRow.insertBefore( connector, next );

		}

	}

	_openAddCardModal( insertIndex ) {

		this._closeAddCardModal();

		const overlay = document.createElement( 'div' );
		overlay.className = 'lut-modal-overlay';
		this._activeModalOverlay = overlay;

		const content = document.createElement( 'div' );
		content.className = 'lut-modal-content';

		// Header
		const header = document.createElement( 'div' );
		header.className = 'lut-modal-header';

		const title = document.createElement( 'div' );
		title.className = 'lut-modal-title';
		title.appendChild( this._createSvgIcon( '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>', 14, 14, 2.5 ) );

		const titleTxt = document.createElement( 'span' );
		titleTxt.textContent = 'Add to Pipeline';
		title.appendChild( titleTxt );

		const closeBtn = document.createElement( 'button' );
		closeBtn.className = 'lut-modal-close-btn';
		closeBtn.appendChild( this._createSvgIcon( '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>', 12, 12, 2.5 ) );
		closeBtn.title = 'Close';
		closeBtn.onclick = () => this._closeAddCardModal();

		header.appendChild( title );
		header.appendChild( closeBtn );
		content.appendChild( header );

		// Filter Input Search Bar
		const filterBox = document.createElement( 'div' );
		filterBox.className = 'lut-modal-filter-box';

		const filterIcon = document.createElement( 'span' );
		filterIcon.className = 'lut-modal-filter-icon';
		filterIcon.appendChild( this._createSvgIcon( '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>', 13, 13, 2 ) );

		const filterInput = document.createElement( 'input' );
		filterInput.type = 'text';
		filterInput.className = 'lut-modal-filter-input';
		filterInput.placeholder = 'Filter...';

		filterBox.appendChild( filterIcon );
		filterBox.appendChild( filterInput );
		content.appendChild( filterBox );

		// Options Grid
		const grid = document.createElement( 'div' );
		grid.className = 'lut-modal-grid';

		const emptyMsg = document.createElement( 'div' );
		emptyMsg.className = 'lut-modal-empty-msg';
		emptyMsg.textContent = 'No cards match your filter';
		emptyMsg.style.display = 'none';

		const cardOptions = [
			{
				type: 'whiteBalance',
				name: 'White Balance',
				iconSvg: '<path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/>'
			},
			{
				type: 'exposure',
				name: 'Exposure',
				iconSvg: '<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>'
			},
			{
				type: 'brightness',
				name: 'Brightness',
				iconSvg: '<circle cx="12" cy="12" r="9"/><path d="M12 3v18a9 9 0 0 0 0-18z"/>'
			},
			{
				type: 'hue',
				name: 'Hue Shift',
				iconSvg: '<circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 1 9 9h-9V3z"/>'
			},
			{
				type: 'lift',
				name: 'Shadows (Lift)',
				iconSvg: '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>'
			},
			{
				type: 'gammaBal',
				name: 'Midtones (Gamma)',
				iconSvg: '<circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0 0 0 20z" fill="currentColor"/>'
			},
			{
				type: 'gain',
				name: 'Highlights (Gain)',
				iconSvg: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/>'
			},
			{
				type: 'offset',
				name: 'Offset',
				iconSvg: '<circle cx="12" cy="12" r="10"/><line x1="22" y1="12" x2="18" y2="12"/><line x1="6" y1="12" x2="2" y2="12"/><line x1="12" y1="6" x2="12" y2="2"/><line x1="12" y1="22" x2="12" y2="18"/>'
			},
			{
				type: 'curves',
				name: 'Curves',
				iconSvg: '<path d="M3 3v18h18"/><path d="M19 9l-5 5-4-4-3 3"/>'
			},
			{
				type: 'contrast',
				name: 'Contrast & Pivot',
				iconSvg: '<circle cx="12" cy="12" r="10"/><path d="M12 2v20a10 10 0 0 0 0-20z"/>'
			},
			{
				type: 'saturation',
				name: 'Saturation',
				iconSvg: '<path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>'
			},
			{
				type: 'vibrance',
				name: 'Vibrance',
				iconSvg: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>'
			},
			{
				type: 'importedCube',
				name: 'Import .CUBE',
				iconSvg: '<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>'
			}
		];

		const optionElements = [];

		cardOptions.forEach( opt => {

			const item = document.createElement( 'div' );
			item.className = 'lut-modal-option';

			const icon = document.createElement( 'div' );
			icon.className = 'lut-modal-option-icon';
			icon.appendChild( this._createSvgIcon( opt.iconSvg, 20, 20, 2 ) );

			const optTitle = document.createElement( 'div' );
			optTitle.className = 'lut-modal-option-title';
			optTitle.textContent = opt.name;

			item.appendChild( icon );
			item.appendChild( optTitle );

			const selectAction = () => {

				this._closeAddCardModal();
				if ( opt.type === 'importedCube' ) {

					this._importCubeFileAt( insertIndex );

				} else {

					this._addCardAt( opt.type, insertIndex );

				}

			};

			item.onclick = selectAction;

			grid.appendChild( item );
			optionElements.push( { el: item, name: opt.name.toLowerCase(), select: selectAction } );

		} );

		grid.appendChild( emptyMsg );

		const updateFocusState = ( query, visibleCount ) => {

			let singleVisibleObj = null;
			if ( query.length > 0 && visibleCount === 1 ) {

				singleVisibleObj = optionElements.find( obj => obj.el.style.display !== 'none' );

			}

			optionElements.forEach( obj => {

				if ( singleVisibleObj && obj === singleVisibleObj ) {

					obj.el.classList.add( 'is-focused' );

				} else {

					obj.el.classList.remove( 'is-focused' );

				}

			} );

		};

		filterInput.oninput = () => {

			const query = filterInput.value.trim().toLowerCase();
			let visibleCount = 0;

			optionElements.forEach( obj => {

				const matches = ! query || obj.name.includes( query );
				obj.el.style.display = matches ? 'flex' : 'none';
				if ( matches ) visibleCount ++;

			} );

			emptyMsg.style.display = visibleCount === 0 ? 'block' : 'none';

			if ( visibleCount === 1 ) {

				grid.style.justifyContent = 'center';
				grid.style.alignContent = 'center';
				grid.style.gridTemplateColumns = 'minmax(120px, 150px)';

			} else {

				grid.style.justifyContent = 'start';
				grid.style.alignContent = 'start';
				grid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(120px, 1fr))';

			}

			updateFocusState( query, visibleCount );

		};

		updateFocusState( '', optionElements.length );

		const handleKeyDown = ( e ) => {

			if ( e.key === 'Escape' || e.code === 'Escape' || e.keyCode === 27 ) {

				e.preventDefault();
				e.stopImmediatePropagation();
				this._closeAddCardModal();

			} else if ( e.key === 'Enter' || e.code === 'Enter' || e.keyCode === 13 ) {

				e.preventDefault();
				e.stopImmediatePropagation();
				const visibleItem = optionElements.find( obj => obj.el.style.display !== 'none' );
				if ( visibleItem ) {

					visibleItem.select();

				}

			}

		};

		window.addEventListener( 'keydown', handleKeyDown, true );
		this._modalKeyDownHandler = handleKeyDown;

		content.appendChild( grid );
		overlay.appendChild( content );

		setTimeout( () => filterInput.focus(), 50 );

		overlay.onclick = ( e ) => {

			if ( e.target === overlay ) {

				this._closeAddCardModal();

			}

		};

		if ( this.viewContainer ) {

			this.viewContainer.appendChild( overlay );

		}

	}

	_closeAddCardModal() {

		if ( this._modalKeyDownHandler ) {

			window.removeEventListener( 'keydown', this._modalKeyDownHandler, true );
			this._modalKeyDownHandler = null;

		}

		if ( this._activeModalOverlay ) {

			this._activeModalOverlay.remove();
			this._activeModalOverlay = null;

		}

	}

	_addCardAt( type, insertIndex, initialParams = {}, customId = null ) {

		const modId = customId || ( `${type}_${Date.now()}_${Math.floor( Math.random() * 1000 )}` );

		const onParamChange = () => this._onParamChange();
		const onRemove = () => this._removeCard( modId );

		let comp = null;

		switch ( type ) {

			case 'whiteBalance':
				comp = new WhiteBalanceModule( initialParams, onParamChange, onRemove, modId );
				break;

			case 'exposure':
			case 'exposureHue':
				comp = new ExposureModule( initialParams, onParamChange, onRemove, modId );
				break;

			case 'brightness':
				comp = new BrightnessModule( initialParams, onParamChange, onRemove, modId );
				break;

			case 'hue':
				comp = new HueModule( initialParams, onParamChange, onRemove, modId );
				break;

			case 'lift':
				comp = new ColorWheelModule( 'lift', 'Shadows', initialParams, onParamChange, onRemove, modId );
				break;

			case 'gammaBal':
				comp = new ColorWheelModule( 'gammaBal', 'Midtones', initialParams, onParamChange, onRemove, modId );
				break;

			case 'gain':
				comp = new ColorWheelModule( 'gain', 'Highlights', initialParams, onParamChange, onRemove, modId );
				break;

			case 'offset':
				comp = new ColorWheelModule( 'offset', 'Offset', initialParams, onParamChange, onRemove, modId );
				break;

			case 'curves':
				comp = new CurvesModule( initialParams, onParamChange, onRemove, modId );
				break;

			case 'contrast':
				comp = new ContrastModule( initialParams, onParamChange, onRemove, modId );
				break;

			case 'saturation':
				comp = new SaturationModule( initialParams, onParamChange, onRemove, modId );
				break;

			case 'vibrance':
			case 'satVibrance':
				comp = new VibranceModule( initialParams, onParamChange, onRemove, modId );
				break;

			default:
				console.warn( `Unknown card module type: ${type}` );
				return null;

		}

		this.modulesMap.set( modId, comp );
		this.cardsMap.set( modId, comp.domElement );

		const targetIdx = Math.max( 0, Math.min( this.pipelineOrder.length, insertIndex ) );
		this.pipelineOrder.splice( targetIdx, 0, modId );

		this._setupCardDragAndDrop( comp.domElement, modId );
		this._renderCardsFlow();
		this._onParamChange();

		if ( comp.domElement ) {

			setTimeout( () => {

				comp.domElement.scrollIntoView( { behavior: 'smooth', block: 'nearest', inline: 'center' } );

			}, 50 );

		}

		return comp;

	}

	_removeCard( modId ) {

		const comp = this.modulesMap.get( modId );
		if ( comp ) {

			if ( comp.domElement ) comp.domElement.remove();
			this.modulesMap.delete( modId );
			this.cardsMap.delete( modId );

		}

		const idx = this.pipelineOrder.indexOf( modId );
		if ( idx !== - 1 ) {

			this.pipelineOrder.splice( idx, 1 );

		}

		this._renderCardsFlow();
		this._onParamChange();

	}

	_setupCardDragAndDrop( card, moduleId ) {

		card.setAttribute( 'data-module-id', moduleId );

		const comp = this.modulesMap.get( moduleId );
		const isDraggable = comp ? comp.dragAndDrop !== false : true;

		if ( ! isDraggable ) {

			card.classList.add( 'lut-card-nodrag' );

		}

		const header = card.querySelector( '.lut-card-header' );

		if ( header ) {

			if ( isDraggable ) {

				header.draggable = true;

				if ( ! header.querySelector( '.lut-card-drag-handle' ) ) {

					const dragHandle = document.createElement( 'div' );
					dragHandle.className = 'lut-card-drag-handle';
					header.insertBefore( dragHandle, header.firstChild );

				}

				header.ondragstart = ( e ) => {

					e.dataTransfer.setData( 'text/plain', moduleId );
					e.dataTransfer.effectAllowed = 'move';

					const rect = card.getBoundingClientRect();
					const xOffset = e.clientX - rect.left;
					const yOffset = e.clientY - rect.top;
					e.dataTransfer.setDragImage( card, xOffset, yOffset );

					this._draggedModuleId = moduleId;

					setTimeout( () => {

						card.classList.add( 'lut-card-moving' );

					}, 0 );

					this._updateLiveFlowConnectors();

				};

				header.ondragend = () => {

					card.classList.remove( 'lut-card-moving' );
					this._draggedModuleId = null;

					const newOrder = [];
					const childCards = this.cardsRow.querySelectorAll( '.lut-card' );
					childCards.forEach( childCard => {

						const id = childCard.getAttribute( 'data-module-id' );
						if ( id && ! newOrder.includes( id ) ) {

							newOrder.push( id );

						}

					} );

					if ( newOrder.length > 0 ) {

						this.pipelineOrder = newOrder;

					}

					this._renderCardsFlow();
					this._onParamChange();

				};

			} else {

				header.draggable = false;

			}

		}

		card.ondragover = ( e ) => {

			e.preventDefault();
			e.dataTransfer.dropEffect = 'move';

			if ( this._draggedModuleId && this.cardsMap.has( this._draggedModuleId ) ) {

				const draggedCard = this.cardsMap.get( this._draggedModuleId );
				if ( card === draggedCard ) return;

				const targetComp = this.modulesMap.get( moduleId );
				if ( targetComp && targetComp.dragAndDrop === false ) return;

				const draggedComp = this.modulesMap.get( this._draggedModuleId );
				if ( draggedComp && draggedComp.dragAndDrop === false ) return;

				const rect = card.getBoundingClientRect();
				const isVert = this._isVerticalMode();

				const childCards = Array.from( this.cardsRow.querySelectorAll( '.lut-card' ) );
				const draggedIndex = childCards.indexOf( draggedCard );
				const targetIndex = childCards.indexOf( card );

				let changed = false;

				if ( isVert ) {

					const relativeY = ( e.clientY - rect.top ) / rect.height;

					if ( draggedIndex < targetIndex ) {

						if ( relativeY > 0.05 ) {

							if ( card.nextSibling !== draggedCard ) {

								this.cardsRow.insertBefore( draggedCard, card.nextSibling );
								changed = true;

							}

						}

					} else {

						if ( relativeY < 0.95 ) {

							if ( card.previousSibling !== draggedCard ) {

								this.cardsRow.insertBefore( draggedCard, card );
								changed = true;

							}

						}

					}

				} else {

					const relativeX = ( e.clientX - rect.left ) / rect.width;

					if ( draggedIndex < targetIndex ) {

						if ( relativeX > 0.05 ) {

							if ( card.nextSibling !== draggedCard ) {

								this.cardsRow.insertBefore( draggedCard, card.nextSibling );
								changed = true;

							}

						}

					} else {

						if ( relativeX < 0.95 ) {

							if ( card.previousSibling !== draggedCard ) {

								this.cardsRow.insertBefore( draggedCard, card );
								changed = true;

							}

						}

					}

				}

				if ( changed ) {

					this._updateLiveFlowConnectors();

				}

			}

		};

		card.ondrop = ( e ) => {

			e.preventDefault();

		};

	}

	_updateRendererCardState() {

		if ( ! this.cardsRow ) return;

		const cards = this.cardsRow.querySelectorAll( '.lut-card' );
		cards.forEach( card => {

			if ( this.sceneGradingEnabled ) {

				card.style.opacity = '1';
				card.style.pointerEvents = 'auto';

			} else {

				card.style.opacity = '0.4';
				card.style.pointerEvents = 'none';

			}

		} );

	}

	_onParamChange() {

		this._lutNeedsUpdate = true;

		if ( this.sceneGradingEnabled ) {

			this._applyLiveGrading();

		}

		this.save();

	}

	generate3DLUTData( size = this.lutSize, buffer = null ) {

		if ( buffer === null ) {

			buffer = new Float32Array( size * size * size * 4 );

		}

		let idx = 0;
		const norm = 1.0 / ( size - 1 );
		const _pixel = [ 0, 0, 0 ];

		const activeModules = [];
		for ( let i = 0; i < this.pipelineOrder.length; i ++ ) {

			const mod = this.modulesMap.get( this.pipelineOrder[ i ] );
			if ( mod && mod.enabled ) {

				activeModules.push( mod );

			}

		}

		const numModules = activeModules.length;

		for ( let b = 0; b < size; b ++ ) {

			for ( let g = 0; g < size; g ++ ) {

				for ( let r = 0; r < size; r ++ ) {

					_pixel[ 0 ] = r * norm;
					_pixel[ 1 ] = g * norm;
					_pixel[ 2 ] = b * norm;

					for ( let m = 0; m < numModules; m ++ ) {

						activeModules[ m ].applyPixel( _pixel[ 0 ], _pixel[ 1 ], _pixel[ 2 ], _pixel );

					}

					buffer[ idx ++ ] = _pixel[ 0 ];
					buffer[ idx ++ ] = _pixel[ 1 ];
					buffer[ idx ++ ] = _pixel[ 2 ];
					buffer[ idx ++ ] = 1.0;

				}

			}

		}

		return buffer;

	}

	_getExportFileName( defaultBase = 'My Color Grading' ) {

		const outputComp = this.modulesMap.get( 'output' );

		if ( outputComp && outputComp.params && outputComp.params.fileName ) {

			return outputComp.params.fileName;

		}

		return defaultBase;

	}

	_exportCubeFile() {

		const baseName = this._getExportFileName();
		const buffer = this.generate3DLUTData( this.lutSize );
		const cubeContent = exportCubeFormat( buffer, this.lutSize, baseName );
		const blob = new Blob( [ cubeContent ], { type: 'text/plain' } );
		const url = URL.createObjectURL( blob );

		const a = document.createElement( 'a' );
		a.href = url;
		a.download = `${baseName}_${this.lutSize}x${this.lutSize}.cube`;
		a.click();
		URL.revokeObjectURL( url );

	}

	_exportPngFile() {

		const baseName = this._getExportFileName();
		const buffer = this.generate3DLUTData( this.lutSize );
		const canvas = exportLUTCanvas( buffer, this.lutSize );
		canvas.toBlob( ( blob ) => {

			const url = URL.createObjectURL( blob );
			const a = document.createElement( 'a' );
			a.href = url;
			a.download = `${baseName}_${this.lutSize}x${this.lutSize}.png`;
			a.click();
			URL.revokeObjectURL( url );

		} );

	}

	toJSON() {

		const params = {};
		const modulesData = {};

		this.modulesMap.forEach( ( comp, id ) => {

			if ( ! comp ) return;

			let modType = 'whiteBalance';
			let mode = null;

			if ( comp.mode ) {

				modType = 'colorWheel';
				mode = comp.mode;

			} else if ( id.startsWith( 'importedCube_' ) ) {

				modType = 'importedCube';

			} else if ( id.startsWith( 'whiteBalance' ) ) {

				modType = 'whiteBalance';

			} else if ( id.startsWith( 'exposure' ) ) {

				modType = 'exposure';

			} else if ( id.startsWith( 'brightness' ) ) {

				modType = 'brightness';

			} else if ( id.startsWith( 'hue' ) ) {

				modType = 'hue';

			} else if ( id.startsWith( 'curves' ) ) {

				modType = 'curves';

			} else if ( id.startsWith( 'contrast' ) ) {

				modType = 'contrast';

			} else if ( id.startsWith( 'saturation' ) ) {

				modType = 'saturation';

			} else if ( id.startsWith( 'vibrance' ) ) {

				modType = 'vibrance';

			} else if ( id === 'renderer' ) {

				modType = 'renderer';

			} else if ( id === 'output' ) {

				modType = 'output';

			}

			modulesData[ id ] = {
				type: modType,
				mode: mode,
				params: JSON.parse( JSON.stringify( comp.params ) )
			};

			if ( id === 'lift' || id === 'gammaBal' || id === 'gain' || id === 'offset' ) {

				params[ id ] = JSON.parse( JSON.stringify( comp.params ) );

			} else if ( id === 'curves' ) {

				params.curves = JSON.parse( JSON.stringify( comp.params.curves ) );

			} else if ( id.startsWith( 'importedCube_' ) ) {

				if ( ! params.importedCubes ) params.importedCubes = {};
				params.importedCubes[ id ] = JSON.parse( JSON.stringify( comp.params ) );

			} else if ( id !== 'renderer' && ! id.includes( '_' ) ) {

				Object.assign( params, JSON.parse( JSON.stringify( comp.params ) ) );

			}

		} );

		return {
			version: 2,
			lutSize: this.lutSize,
			selectedToneMapping: this.selectedToneMapping,
			sceneGradingEnabled: this.sceneGradingEnabled,
			pipelineOrder: [ ...this.pipelineOrder ],
			modules: modulesData,
			params: params
		};

	}

	serialize() {

		return this.toJSON();

	}

	deserialize( data ) {

		if ( data ) {

			this.load( data );

		}

	}

	_applyParamsToModule( modId, params ) {

		const comp = this.modulesMap.get( modId );
		if ( ! comp ) return;

		switch ( modId ) {

			case 'whiteBalance':
				comp.fromJSON( { params: { temperature: params.temperature ?? 0, tint: params.tint ?? 0 } } );
				break;

			case 'exposure':
				comp.fromJSON( { params: { exposure: params.exposure ?? 0 } } );
				break;

			case 'brightness':
				comp.fromJSON( { params: { brightness: params.brightness ?? 0 } } );
				break;

			case 'hue':
				comp.fromJSON( { params: { hueShift: params.hueShift ?? 0 } } );
				break;

			case 'lift':
				if ( params.lift ) comp.fromJSON( { params: params.lift } );
				else comp.reset();
				break;

			case 'gammaBal':
				if ( params.gammaBal ) comp.fromJSON( { params: params.gammaBal } );
				else comp.reset();
				break;

			case 'gain':
				if ( params.gain ) comp.fromJSON( { params: params.gain } );
				else comp.reset();
				break;

			case 'offset':
				if ( params.offset ) comp.fromJSON( { params: params.offset } );
				else comp.reset();
				break;

			case 'curves':
				if ( params.curves ) comp.fromJSON( { params: { curves: params.curves } } );
				else comp.reset();
				break;

			case 'contrast':
				comp.fromJSON( { params: { contrast: params.contrast ?? 1.0, contrastPivot: params.contrastPivot ?? 0.5 } } );
				break;

			case 'saturation':
				comp.fromJSON( { params: { saturation: params.saturation ?? 1.0 } } );
				break;

			case 'vibrance':
				comp.fromJSON( { params: { vibrance: params.vibrance ?? 0 } } );
				break;

		}

	}

	load( data ) {

		if ( ! data ) return;

		let json = data;
		if ( typeof json === 'string' ) {

			try {

				json = JSON.parse( json );

			} catch ( err ) {

				console.error( 'ColorGrading.load: Invalid JSON data', err );
				return;

			}

		}

		if ( typeof json !== 'object' || json === null ) return;

		const params = json.params ? json.params : ( json.temperature !== undefined || json.contrast !== undefined || json.curves !== undefined ? json : null );

		if ( typeof json.lutSize === 'number' ) {

			this.lutSize = json.lutSize;
			if ( this.lutSizeSelect ) {

				this.lutSizeSelect.value = String( this.lutSize );

			}

		}

		if ( typeof json.selectedToneMapping === 'number' ) {

			this.selectedToneMapping = json.selectedToneMapping;
			const rendererComp = this.modulesMap.get( 'renderer' );
			if ( rendererComp ) {

				rendererComp.fromJSON( { params: { toneMapping: this.selectedToneMapping } } );

			}

		}

		if ( typeof json.sceneGradingEnabled === 'boolean' ) {

			this.sceneGradingEnabled = json.sceneGradingEnabled;
			this.updateGradingBtnState();
			this._toggleSceneGrading( this.sceneGradingEnabled );

		}

		if ( Array.isArray( json.pipelineOrder ) && json.pipelineOrder.length > 0 ) {

			this.pipelineOrder = [ ...json.pipelineOrder ];

		}

		if ( json.modules && typeof json.modules === 'object' ) {

			this.modulesMap.forEach( ( comp, id ) => {

				if ( id !== 'renderer' && id !== 'output' && ! this.pipelineOrder.includes( id ) ) {

					if ( comp.domElement ) comp.domElement.remove();
					this.modulesMap.delete( id );
					this.cardsMap.delete( id );

				}

			} );

			Object.keys( json.modules ).forEach( id => {

				const mData = json.modules[ id ];
				if ( id === 'renderer' ) {

					const rendererComp = this.modulesMap.get( 'renderer' );
					if ( rendererComp ) {

						rendererComp.fromJSON( { params: mData.params } );

					}

				} else if ( this.modulesMap.has( id ) ) {

					this.modulesMap.get( id ).fromJSON( { params: mData.params } );

				} else {

					if ( mData.type === 'importedCube' ) {

						const comp = new ImportedCubeModule(
							id,
							mData.params,
							() => this._onParamChange(),
							( removeId ) => this._removeCard( removeId )
						);

						this.modulesMap.set( id, comp );
						this.cardsMap.set( id, comp.domElement );
						this._setupCardDragAndDrop( comp.domElement, id );

					} else {

						const targetType = mData.mode || mData.type;
						this._addCardAt( targetType, this.pipelineOrder.length, mData.params, id );

					}

				}

			} );

		} else if ( params ) {

			const isWBActive = ( params.temperature !== undefined && params.temperature !== 0 ) || ( params.tint !== undefined && params.tint !== 0 );
			const isExpActive = params.exposure !== undefined && params.exposure !== 0;
			const isBrightActive = params.brightness !== undefined && params.brightness !== 0;
			const isHueActive = params.hueShift !== undefined && params.hueShift !== 0;
			const isLiftActive = params.lift && ( params.lift.r !== 0 || params.lift.g !== 0 || params.lift.b !== 0 );
			const isGammaActive = params.gammaBal && ( params.gammaBal.r !== 0 || params.gammaBal.g !== 0 || params.gammaBal.b !== 0 );
			const isGainActive = params.gain && ( params.gain.r !== 0 || params.gain.g !== 0 || params.gain.b !== 0 );
			const isOffsetActive = params.offset && ( params.offset.r !== 0 || params.offset.g !== 0 || params.offset.b !== 0 );
			const isCurvesActive = params.curves && Array.isArray( params.curves.rgb ) && ( params.curves.rgb.length > 2 || params.curves.rgb.some( p => p.x !== p.y ) || ( params.curves.red && params.curves.red.some( p => p.x !== p.y ) ) || ( params.curves.blue && params.curves.blue.some( p => p.x !== p.y ) ) );
			const isContrastActive = params.contrast !== undefined && params.contrast !== 1.0;
			const isSatActive = params.saturation !== undefined && params.saturation !== 1.0;
			const isVibActive = params.vibrance !== undefined && params.vibrance !== 0;

			const isAllNeutral = ! isWBActive && ! isExpActive && ! isBrightActive && ! isHueActive && ! isLiftActive && ! isGammaActive && ! isGainActive && ! isOffsetActive && ! isCurvesActive && ! isContrastActive && ! isSatActive && ! isVibActive;

			let targetOrder = [];

			if ( isAllNeutral ) {

				targetOrder = [ ...DEFAULT_PIPELINE_ORDER ];

			} else {

				targetOrder = [ 'renderer' ];
				if ( isWBActive ) targetOrder.push( 'whiteBalance' );
				if ( isExpActive ) targetOrder.push( 'exposure' );
				if ( isBrightActive ) targetOrder.push( 'brightness' );
				if ( isHueActive ) targetOrder.push( 'hue' );
				if ( isLiftActive ) targetOrder.push( 'lift' );
				if ( isGammaActive ) targetOrder.push( 'gammaBal' );
				if ( isGainActive ) targetOrder.push( 'gain' );
				if ( isOffsetActive ) targetOrder.push( 'offset' );
				if ( isCurvesActive ) targetOrder.push( 'curves' );
				if ( isContrastActive ) targetOrder.push( 'contrast' );
				if ( isSatActive ) targetOrder.push( 'saturation' );
				if ( isVibActive ) targetOrder.push( 'vibrance' );
				targetOrder.push( 'output' );

			}

			// Remove cards not used by this preset (except renderer)
			this.modulesMap.forEach( ( comp, id ) => {

				if ( id !== 'renderer' && id !== 'output' && ! targetOrder.includes( id ) ) {

					if ( comp && comp.domElement ) comp.domElement.remove();
					this.modulesMap.delete( id );
					this.cardsMap.delete( id );

				}

			} );

			// Ensure target cards exist and update their values
			targetOrder.forEach( ( modId ) => {

				if ( modId === 'renderer' ) {

					const rendererComp = this.modulesMap.get( 'renderer' );
					if ( rendererComp && ( params.rendererToneMapping !== undefined || params.rendererExposure !== undefined ) ) {

						const toneMapping = params.rendererToneMapping !== undefined ? params.rendererToneMapping : rendererComp.params.toneMapping;
						const exposure = params.rendererExposure !== undefined ? params.rendererExposure : rendererComp.params.exposure;
						rendererComp.fromJSON( { params: { toneMapping, exposure } } );

					}

				} else if ( this.modulesMap.has( modId ) ) {

					this._applyParamsToModule( modId, params );

				} else {

					this._addCardAt( modId, targetOrder.length, params, modId );

				}

			} );

			this.pipelineOrder = targetOrder;

			if ( params.importedCubes ) {

				Object.keys( params.importedCubes ).forEach( modId => {

					const cubeData = params.importedCubes[ modId ];
					const comp = this.modulesMap.get( modId );

					if ( ! comp ) {

						const newComp = new ImportedCubeModule(
							modId,
							cubeData,
							() => this._onParamChange(),
							( removeId ) => this._removeCard( removeId )
						);

						this.modulesMap.set( modId, newComp );
						this.cardsMap.set( modId, newComp.domElement );
						this._setupCardDragAndDrop( newComp.domElement, modId );

					} else {

						comp.fromJSON( { params: cubeData } );

					}

				} );

			}

		}

		this._renderCardsFlow();
		this._onParamChange();

	}

	_exportJsonFile() {

		const baseName = this._getExportFileName();
		const configStr = JSON.stringify( this.toJSON(), null, 2 );
		const blob = new Blob( [ configStr ], { type: 'application/json' } );
		const url = URL.createObjectURL( blob );
		const link = document.createElement( 'a' );
		link.href = url;
		link.download = `${baseName}.json`;
		link.click();
		URL.revokeObjectURL( url );

	}

	_importJsonFile() {

		const fileInput = document.createElement( 'input' );
		fileInput.type = 'file';
		fileInput.accept = '.json';

		fileInput.onchange = ( e ) => {

			const file = e.target.files[ 0 ];
			if ( ! file ) return;

			const reader = new FileReader();
			reader.onload = ( evt ) => {

				try {

					const json = JSON.parse( evt.target.result );
					this.load( json );

				} catch ( err ) {

					alert( 'Error reading JSON config file: ' + err.message );

				}

			};

			reader.readAsText( file );

		};

		fileInput.click();

	}

	_createImportedCubeCard( modId ) {

		const cubeInfo = this.params.importedCubes ? this.params.importedCubes[ modId ] : null;
		const comp = new ImportedCubeModule(
			modId,
			cubeInfo || {},
			() => this._onParamChange(),
			( removeId ) => this._removeCard( removeId )
		);

		this.modulesMap.set( modId, comp );
		this.cardsMap.set( modId, comp.domElement );

		return comp.domElement;

	}

	_removeImportedCubeCard( modId ) {

		this._removeCard( modId );

	}

	_importCubeFileAt( insertIndex ) {

		const fileInput = document.createElement( 'input' );
		fileInput.type = 'file';
		fileInput.accept = '.cube';

		fileInput.onchange = ( e ) => {

			const file = e.target.files[ 0 ];
			if ( ! file ) return;

			const reader = new FileReader();
			reader.onload = ( evt ) => {

				try {

					const text = evt.target.result;
					const parsed = parseCubeFormat( text );
					const cubeData = parsed.dataLines || parsed.data;
					if ( ! cubeData || cubeData.length === 0 ) {

						alert( 'Invalid or empty .CUBE file.' );
						return;

					}

					const modId = 'importedCube_' + Date.now() + '_' + Math.floor( Math.random() * 1000 );

					const fileNameNoExt = file.name.replace( /\.cube$/i, '' );
					const parsedTitle = parsed.title ? parsed.title.trim() : '';
					const isGenericTitle = ! parsedTitle ||
						parsedTitle.toLowerCase() === 'untitled' ||
						parsedTitle.toLowerCase() === 'imported lut';

					const titleName = isGenericTitle ? fileNameNoExt : parsedTitle;

					const cubeInfo = {
						title: titleName,
						size: parsed.size || 32,
						dataLines: cubeData,
						weight: 1.0
					};

					const comp = new ImportedCubeModule(
						modId,
						cubeInfo,
						() => this._onParamChange(),
						( removeId ) => this._removeCard( removeId )
					);

					this.modulesMap.set( modId, comp );
					this.cardsMap.set( modId, comp.domElement );

					const targetIdx = ( typeof insertIndex === 'number' ) ? Math.max( 0, Math.min( this.pipelineOrder.length, insertIndex ) ) : this.pipelineOrder.length;
					this.pipelineOrder.splice( targetIdx, 0, modId );

					this._setupCardDragAndDrop( comp.domElement, modId );

					this._renderCardsFlow();
					this._onParamChange();

					if ( comp.domElement ) {

						setTimeout( () => {

							comp.domElement.scrollIntoView( { behavior: 'smooth', block: 'nearest', inline: 'center' } );

						}, 50 );

					}

				} catch ( err ) {

					alert( 'Error reading .CUBE file: ' + err.message );

				}

			};

			reader.readAsText( file );

		};

		fileInput.click();

	}

	_importCubeFile() {

		this._importCubeFileAt( 1 );

	}

	init( inspector ) {

		super.init( inspector );

		const renderer = inspector.getRenderer();
		const rendererComp = this.modulesMap.get( 'renderer' );

		if ( renderer && rendererComp ) {

			const defaultTM = ( renderer.toneMapping !== undefined ) ? renderer.toneMapping : NoToneMapping;
			const defaultExp = ( renderer.toneMappingExposure !== undefined ) ? renderer.toneMappingExposure : 1.0;

			rendererComp.defaultToneMapping = defaultTM;
			rendererComp.defaultExposure = defaultExp;
			rendererComp.params.toneMapping = defaultTM;
			rendererComp.params.exposure = defaultExp;
			rendererComp.updateUI();

		}

		this.onOrientationChange();
		this.onLayoutChange();

	}

	setActive( isActive ) {

		super.setActive( isActive );

		if ( isActive ) {

			this.onOrientationChange();
			this.onLayoutChange();

		}

	}

	onOrientationChange( event ) {

		const isVert = this.inspector.isVertical() ||
			( event && event.isVertical ) ||
			( this.content.clientWidth < 550 );

		this.viewContainer.classList.toggle( 'is-vertical', isVert );
		this.cardsRow.classList.toggle( 'is-vertical', isVert );

		this.onLayoutChange();

	}

	onLayoutChange() {

		const width = this.content.clientWidth;
		this.dockContainer.classList.toggle( 'is-compact', width > 0 && width < 400 );

	}

	update( inspector ) {

		super.update( inspector );

		if ( this.sceneGradingEnabled && ( this._lutNeedsUpdate || this._lutSizeChanged ) ) {

			this._updateLiveGrading( inspector );

		}

	}

	_getRenderPipeline( renderer ) {

		return _rendererPipelines.get( renderer );

	}

	_toggleSceneGrading( enable ) {

		this.sceneGradingEnabled = enable;

		if ( enable ) {

			this._lutNeedsUpdate = true;

			this._applyLiveGrading();

		} else {

			this._removeLiveGrading();

		}

	}

	_updateLiveGrading( /* inspector */ ) {

		if ( this.sceneGradingEnabled ) {

			this._applyLiveGrading();

		}

	}

	_applyLiveGrading() {

		if ( ! this.lutTexture || this._lutSizeChanged || this._lutNeedsUpdate ) {

			const buffer = ( this.lutTexture && this.lutTexture.image && ! this._lutSizeChanged ) ? this.lutTexture.image.data : null;
			const data = this.generate3DLUTData( this.lutSize, buffer );

			if ( ! this.lutTexture || this._lutSizeChanged ) {

				if ( this.lutTexture ) this.lutTexture.dispose();

				this.lutTexture = new Data3DTexture( data, this.lutSize, this.lutSize, this.lutSize );
				this.lutTexture.format = RGBAFormat;
				this.lutTexture.type = FloatType;
				this.lutTexture.minFilter = LinearFilter;
				this.lutTexture.magFilter = LinearFilter;
				this.lutTexture.unpackAlignment = 1;
				this._lutSizeChanged = false;

			}

			this.lutTexture.needsUpdate = true;
			this._lutNeedsUpdate = false;

		}

		const renderer = this.inspector.getRenderer();
		let renderPipeline = _rendererPipelines.get( renderer );

		const primaryPass = this.inspector.getPrimaryPass();
		const scene = primaryPass ? primaryPass.scene : null;
		const camera = primaryPass ? primaryPass.camera : null;

		if ( ! renderPipeline && scene && camera ) {

			this._createdPipeline = new RenderPipeline( renderer, pass( scene, camera ) );
			renderPipeline = this._createdPipeline;
			_rendererPipelines.set( renderer, renderPipeline );

		}

		if ( ! renderPipeline ) return;

		if ( this._createdPipeline && ! this._origRendererRender ) {

			this._origRendererRender = renderer.render;
			let isRendering = false;

			renderer.render = ( sceneArg, cameraArg, ...rest ) => {

				if ( this.sceneGradingEnabled && ! isRendering ) {

					const activePipeline = _rendererPipelines.get( renderer );

					if ( activePipeline ) {

						isRendering = true;

						try {

							activePipeline.render();
							return;

						} finally {

							isRendering = false;

						}

					}

				}

				return this._origRendererRender.call( renderer, sceneArg, cameraArg, ...rest );

			};

		}

		if ( ! this._originalPipelineSettings ) {

			this._originalPipelineSettings = {
				outputNode: renderPipeline.outputNode,
				outputColorTransform: renderPipeline.outputColorTransform,
				rendererToneMapping: renderer.toneMapping
			};

			if ( renderer.toneMapping !== undefined ) {

				this.selectedToneMapping = renderer.toneMapping;
				const rendererComp = this.modulesMap.get( 'renderer' );
				if ( rendererComp ) {

					rendererComp.fromJSON( { params: { toneMapping: this.selectedToneMapping } } );

				}

			}

		}

		renderer.toneMapping = this.selectedToneMapping;
		renderPipeline.outputColorTransform = false;

		let inputNode = this._originalPipelineSettings.outputNode;

		if ( ! inputNode && scene && camera ) {

			inputNode = pass( scene, camera );

		}

		if ( inputNode ) {

			const outputPass = renderOutput( inputNode, this.selectedToneMapping );
			this.lutPassNode = lut3D( outputPass, texture3D( this.lutTexture ), this.lutSize, 1.0 );

			renderPipeline.outputNode = this.lutPassNode;
			renderPipeline.needsUpdate = true;

		}

	}

	_removeLiveGrading() {

		const renderer = this.inspector.getRenderer();
		const renderPipeline = _rendererPipelines.get( renderer );

		if ( this._originalPipelineSettings ) {

			if ( renderPipeline ) {

				renderPipeline.outputNode = this._originalPipelineSettings.outputNode;
				renderPipeline.outputColorTransform = this._originalPipelineSettings.outputColorTransform;
				renderPipeline.needsUpdate = true;

			}

			if ( renderer && this._originalPipelineSettings.rendererToneMapping !== undefined ) {

				renderer.toneMapping = this._originalPipelineSettings.rendererToneMapping;

			}

			this._originalPipelineSettings = null;

		}

		if ( renderer && this._origRendererRender ) {

			renderer.render = this._origRendererRender;
			this._origRendererRender = null;

		}

		if ( this._createdPipeline ) {

			if ( renderer ) {

				_rendererPipelines.delete( renderer );

			}

			this._createdPipeline.dispose();
			this._createdPipeline = null;

		}

		this.lutPassNode = null;

		if ( this.lutTexture ) {

			this.lutTexture.dispose();
			this.lutTexture = null;

		}

	}

	dispose() {

		this._removeLiveGrading();

		if ( this._cardsResizeObserver ) {

			this._cardsResizeObserver.disconnect();
			this._cardsResizeObserver = null;

		}

		if ( this._windowResizeHandler ) {

			window.removeEventListener( 'resize', this._windowResizeHandler );
			this._windowResizeHandler = null;

		}

		this.modulesMap.clear();
		this.cardsMap.clear();

		super.dispose();

	}

}
