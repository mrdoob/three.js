import { UIPanel } from "./libs/ui.js";
import { Viewport } from './Viewport.js';
import { Toolbar } from './Toolbar.js';
import { Script } from './Script.js';
import { Player } from './Player.js';
import { Sidebar } from './Sidebar.js';
import { Menubar } from './Menubar.js';

var EditorView = function ( editor ) {

    this.editor = editor;
    
    var container = new UIPanel();

    var viewport = new Viewport( editor );
    var toolbar = new Toolbar( editor );
    var script = new Script( editor );
    var player = new Player( editor );
    var sidebar = new Sidebar( editor );
    var menubar = new Menubar( editor );

    container.add( viewport );
    container.add( toolbar );
    container.add( script );
    container.add( player );
    container.add( sidebar );
    container.add( menubar );

    return container;

};

export { EditorView }