import * as THREE from 'three';
import * as Nodes from 'three/nodes';
import { Canvas, CircleMenu, ButtonInput, StringInput, ContextMenu, Tips, Search, Loader, Node, TreeViewNode, TreeViewInput, Element } from 'flow';
import { FileEditor } from './editors/FileEditor.js';
import { exportJSON } from './NodeEditorUtils.js';
import { init, ClassLib, getNodeEditorClass, getNodeList } from './NodeEditorLib.js';

init();

Element.icons.unlink = 'ti ti-unlink';

export class NodeEditor extends THREE.EventDispatcher {

	constructor( scene = null, renderer = null, composer = null ) {

		super();

		const domElement = document.createElement( 'flow' );
		const canvas = new Canvas();

		domElement.append( canvas.dom );

		this.scene = scene;
		this.renderer = renderer;

		const { global } = Nodes;

		global.set( 'THREE', THREE );
		global.set( 'TSL', Nodes );

		global.set( 'scene', scene );
		global.set( 'renderer', renderer );
		global.set( 'composer', composer );

		this.nodeClasses = [];

		this.canvas = canvas;
		this.domElement = domElement;

		this._preview = false;

		this.search = null;

		this.menu = null;
		this.previewMenu = null;

		this.nodesContext = null;
		this.examplesContext = null;

		this._initUpload();
		this._initTips();
		this._initMenu();
		this._initSearch();
		this._initNodesContext();
		this._initExamplesContext();
		this._initShortcuts();
		this._initParams();

	}

	setSize( width, height ) {

		this.canvas.setSize( width, height );

		return this;

	}

	centralizeNode( node ) {

		const canvas = this.canvas;
		const nodeRect = node.dom.getBoundingClientRect();

		node.setPosition(
			( ( canvas.width / 2 ) - canvas.scrollLeft ) - nodeRect.width,
			( ( canvas.height / 2 ) - canvas.scrollTop ) - nodeRect.height
		);

		return this;

	}

	add( node ) {

		const onRemove = () => {

			node.removeEventListener( 'remove', onRemove );

			node.setEditor( null );

		};

		node.setEditor( this );
		node.addEventListener( 'remove', onRemove );

		this.canvas.add( node );

		this.dispatchEvent( { type: 'add', node } );

		return this;

	}

	get nodes() {

		return this.canvas.nodes;

	}

	set preview( value ) {

		if ( this._preview === value ) return;

		if ( value ) {

			this.menu.dom.remove();
			this.canvas.dom.remove();
			this.search.dom.remove();

			this.domElement.append( this.previewMenu.dom );

		} else {

			this.canvas.focusSelected = false;

			this.domElement.append( this.menu.dom );
			this.domElement.append( this.canvas.dom );
			this.domElement.append( this.search.dom );

			this.previewMenu.dom.remove();

		}

		this._preview = value;

	}

	get preview() {

		return this._preview;

	}

	newProject() {

		const canvas = this.canvas;
		canvas.clear();
		canvas.scrollLeft = 0;
		canvas.scrollTop = 0;
		canvas.zoom = 1;

		this.dispatchEvent( { type: 'new' } );

	}

	async loadURL( url ) {

		const loader = new Loader( Loader.OBJECTS );
		const json = await loader.load( url, ClassLib );

		this.loadJSON( json );

	}

	loadJSON( json ) {

		const canvas = this.canvas;

		canvas.clear();

		canvas.deserialize( json );

		for ( const node of canvas.nodes ) {

			this.add( node );

		}

		this.dispatchEvent( { type: 'load' } );

	}

	_initUpload() {

		const canvas = this.canvas;

		canvas.onDrop( () => {

			for ( const item of canvas.droppedItems ) {

				const { relativeClientX, relativeClientY } = canvas;

				const file = item.getAsFile();
				const reader = new FileReader();

				reader.onload = () => {

					const fileEditor = new FileEditor( reader.result, file.name );

					fileEditor.setPosition(
						relativeClientX - ( fileEditor.getWidth() / 2 ),
						relativeClientY - 20
					);

					this.add( fileEditor );

				};

				reader.readAsArrayBuffer( file );

			}

		} );

	}

	_initTips() {

		this.tips = new Tips();

		this.domElement.append( this.tips.dom );

	}

	_initMenu() {

		const menu = new CircleMenu();
		const previewMenu = new CircleMenu();

		menu.setAlign( 'top left' );
		previewMenu.setAlign( 'top left' );

		const previewButton = new ButtonInput().setIcon( 'ti ti-brand-threejs' ).setToolTip( 'Preview' );
		const menuButton = new ButtonInput().setIcon( 'ti ti-apps' ).setToolTip( 'Add' );
		const examplesButton = new ButtonInput().setIcon( 'ti ti-file-symlink' ).setToolTip( 'Examples' );
		const newButton = new ButtonInput().setIcon( 'ti ti-file' ).setToolTip( 'New' );
		const openButton = new ButtonInput().setIcon( 'ti ti-upload' ).setToolTip( 'Open' );
		const saveButton = new ButtonInput().setIcon( 'ti ti-download' ).setToolTip( 'Save' );

		const editorButton = new ButtonInput().setIcon( 'ti ti-subtask' ).setToolTip( 'Editor' );

		previewButton.onClick( () => this.preview = true );
		editorButton.onClick( () => this.preview = false );

		menuButton.onClick( () => this.nodesContext.open() );
		examplesButton.onClick( () => this.examplesContext.open() );

		newButton.onClick( () => {

			if ( confirm( 'Are you sure?' ) === true ) {

				this.newProject();

			}

		} );

		openButton.onClick( () => {

			const input = document.createElement( 'input' );
			input.type = 'file';

			input.onchange = e => {

				const file = e.target.files[ 0 ];

				const reader = new FileReader();
				reader.readAsText( file, 'UTF-8' );

				reader.onload = readerEvent => {

					const loader = new Loader( Loader.OBJECTS );
					const json = loader.parse( JSON.parse( readerEvent.target.result ), ClassLib );

					this.loadJSON( json );

				};

			};

			input.click();

		} );

		saveButton.onClick( () => {

			exportJSON( this.canvas.toJSON(), 'node_editor' );

		} );

		menu.add( previewButton )
			.add( newButton )
			.add( examplesButton )
			.add( openButton )
			.add( saveButton )
			.add( menuButton );

		previewMenu.add( editorButton );

		this.domElement.append( menu.dom );

		this.menu = menu;
		this.previewMenu = previewMenu;

	}

	_initExamplesContext() {

		const context = new ContextMenu();

		//**************//
		// MAIN
		//**************//

		const onClickExample = async ( button ) => {

			this.examplesContext.hide();

			const filename = button.getExtra();

			this.loadURL( `./examples/${filename}.json` );

		};

		const addExamples = ( category, names ) => {

			const subContext = new ContextMenu();

			for ( const name of names ) {

				const filename = name.replaceAll( ' ', '-' ).toLowerCase();

				subContext.add( new ButtonInput( name )
					.setIcon( 'ti ti-file-symlink' )
					.onClick( onClickExample )
					.setExtra( category.toLowerCase() + '/' + filename )
				);

			}

			context.add( new ButtonInput( category ), subContext );

			return subContext;

		};

		//**************//
		// EXAMPLES
		//**************//

		addExamples( 'Universal', [
			'Teapot',
			'Matcap',
			'Fresnel'
		] );

		if ( this.renderer.isWebGLRenderer ) {

			addExamples( 'WebGL', [
				'Car'
			] );

			context.add( new ButtonInput( 'WebGPU Version' ).onClick( () => {

				if ( confirm( 'Are you sure?' ) === true ) {

					window.location.search = '?backend=webgpu';

				}

			} ) );

		} else if ( this.renderer.isWebGPURenderer ) {

			addExamples( 'WebGPU', [
				'Particle'
			] );

			context.add( new ButtonInput( 'WebGL Version' ).onClick( () => {

				if ( confirm( 'Are you sure?' ) === true ) {

					window.location.search = '';

				}

			} ) );

		}

		this.examplesContext = context;

	}

	_initShortcuts() {

		document.addEventListener( 'keydown', ( e ) => {

			if ( e.target === document.body ) {

				const key = e.key;

				if ( key === 'Tab' ) {

					this.search.inputDOM.focus();

					e.preventDefault();
					e.stopImmediatePropagation();

				} else if ( key === ' ' ) {

					this.preview = ! this.preview;

				} else if ( key === 'Delete' ) {

					if ( this.canvas.selected ) this.canvas.selected.dispose();
					
				} else if ( key === 'Escape' ) {

					this.canvas.select( null );

				}
			}

		} );

	}

	_initParams() {

		const urlParams = new URLSearchParams( window.location.search );

		const example = urlParams.get( 'example' ) || 'universal/teapot';

		this.loadURL( `./examples/${example}.json` );

	}

	addClass( nodeData ) {

		this.removeClass( nodeData );

		this.nodeClasses.push( nodeData );

		ClassLib[ nodeData.name ] = nodeData.nodeClass;

		return this;

	}

	removeClass( nodeData ) {

		const index = this.nodeClasses.indexOf( nodeData );

		if ( index !== - 1 ) {

			this.nodeClasses.splice( index, 1 );

			delete ClassLib[ nodeData.name ];

		}

		return this;

	}

	_initSearch() {

		const traverseNodeEditors = ( item ) => {

			if ( item.children ) {

				for ( const subItem of item.children ) {

					traverseNodeEditors( subItem );

				}

			} else {

				const button = new ButtonInput( item.name );
				button.setIcon( `ti ti-${item.icon}` );
				button.addEventListener( 'complete', async () => {

					const nodeClass = await getNodeEditorClass( item );

					const node = new nodeClass();

					this.add( node );

					this.centralizeNode( node );
					this.canvas.select( node );

				} );

				search.add( button );

				if ( item.tags !== undefined ) {

					search.setTag( button, item.tags );

				}

			}



		};

		const search = new Search();
		search.forceAutoComplete = true;

		search.onFilter( async () => {

			search.clear();

			const nodeList = await getNodeList();

			for ( const item of nodeList.nodes ) {

				traverseNodeEditors( item );

			}

			for ( const item of this.nodeClasses ) {

				traverseNodeEditors( item );

			}

		} );

		search.onSubmit( () => {

			if ( search.currentFiltered !== null ) {

				search.currentFiltered.button.dispatchEvent( new Event( 'complete' ) );

			}

		} );

		this.search = search;

		this.domElement.append( search.dom );

	}

	async _initNodesContext() {

		const context = new ContextMenu( this.canvas.canvas ).setWidth( 300 );

		let isContext = false;
		const contextPosition = {};

		const add = ( node ) => {

			context.hide();

			this.add( node );

			if ( isContext ) {

				node.setPosition(
					Math.round( contextPosition.x ),
					Math.round( contextPosition.y )
				);

			} else {

				this.centralizeNode( node );

			}

			this.canvas.select( node );

			isContext = false;

		};

		context.onContext( () => {

			isContext = true;

			const { relativeClientX, relativeClientY } = this.canvas;

			contextPosition.x = Math.round( relativeClientX );
			contextPosition.y = Math.round( relativeClientY );

		} );

		context.addEventListener( 'show', () => {

			reset();
			focus();

		} );

		//**************//
		// INPUTS
		//**************//

		const nodeButtons = [];

		let nodeButtonsVisible = [];
		let nodeButtonsIndex = - 1;

		const focus = () => requestAnimationFrame( () => search.inputDOM.focus() );
		const reset = () => {

			search.setValue( '', false );

			for ( const button of nodeButtons ) {

				button.setOpened( false ).setVisible( true ).setSelected( false );

			}

		};

		const node = new Node();
		context.add( node );

		const search = new StringInput().setPlaceHolder( 'Search...' ).setIcon( 'ti ti-list-search' );

		search.inputDOM.addEventListener( 'keydown', e => {

			const key = e.key;

			if ( key === 'ArrowDown' ) {

				const previous = nodeButtonsVisible[ nodeButtonsIndex ];
				if ( previous ) previous.setSelected( false );

				const current = nodeButtonsVisible[ nodeButtonsIndex = ( nodeButtonsIndex + 1 ) % nodeButtonsVisible.length ];
				if ( current ) current.setSelected( true );

				e.preventDefault();
				e.stopImmediatePropagation();

			} else if ( key === 'ArrowUp' ) {

				const previous = nodeButtonsVisible[ nodeButtonsIndex ];
				if ( previous ) previous.setSelected( false );

				const current = nodeButtonsVisible[ nodeButtonsIndex > 0 ? -- nodeButtonsIndex : ( nodeButtonsIndex = nodeButtonsVisible.length - 1 ) ];
				if ( current ) current.setSelected( true );

				e.preventDefault();
				e.stopImmediatePropagation();

			} else if ( key === 'Enter' ) {

				if ( nodeButtonsVisible[ nodeButtonsIndex ] !== undefined ) {

					nodeButtonsVisible[ nodeButtonsIndex ].dom.click();

				} else {

					context.hide();

				}

				e.preventDefault();
				e.stopImmediatePropagation();

			} else if ( key === 'Escape' ) {

				context.hide();

			}

		} );

		search.onChange( () => {

			const value = search.getValue().toLowerCase();

			if ( value.length === 0 ) return reset();

			nodeButtonsVisible = [];
			nodeButtonsIndex = 0;

			for ( const button of nodeButtons ) {

				const buttonLabel = button.getLabel().toLowerCase();

				button.setVisible( false ).setSelected( false );

				const visible = buttonLabel.indexOf( value ) !== - 1;

				if ( visible && button.children.length === 0 ) {

					nodeButtonsVisible.push( button );

				}

			}

			for ( const button of nodeButtonsVisible ) {

				let parent = button;

				while ( parent !== null ) {

					parent.setOpened( true ).setVisible( true );

					parent = parent.parent;

				}

			}

			if ( nodeButtonsVisible[ nodeButtonsIndex ] !== undefined ) {

				nodeButtonsVisible[ nodeButtonsIndex ].setSelected( true );

			}

		} );

		const treeView = new TreeViewInput();
		node.add( new Element().setHeight( 30 ).add( search ) );
		node.add( new Element().setHeight( 200 ).add( treeView ) );

		const addNodeEditorElement = ( nodeData ) => {

			const button = new TreeViewNode( nodeData.name );
			button.setIcon( `ti ti-${nodeData.icon}` );

			if ( nodeData.children === undefined ) {

				button.isNodeClass = true;
				button.onClick( async () => {

					const nodeClass = await getNodeEditorClass( nodeData );

					add( new nodeClass() );

				} );

			}

			if ( nodeData.tip ) {

				//button.setToolTip( item.tip );

			}

			nodeButtons.push( button );

			if ( nodeData.children ) {

				for ( const subItem of nodeData.children ) {

					const subButton = addNodeEditorElement( subItem );

					button.add( subButton );

				}

			}

			return button;

		};

		//

		const nodeList = await getNodeList();

		for ( const node of nodeList.nodes ) {

			const button = addNodeEditorElement( node );

			treeView.add( button );

		}

		this.nodesContext = context;

	}

}
