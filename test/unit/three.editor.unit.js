// TODO (Itee) Editor is not es6 module so care to include order !!!
// TODO: all views could not be testable, waiting modular code before implement units tests on them

import './utils/qunit-utils.js';

//editor
import './editor/Command.tests';
import './editor/Config.tests';
import './editor/Editor.tests';
import './editor/History.tests';
import './editor/Loader.tests';
import './editor/Player.tests';
import './editor/Script.tests';

import './editor/Menubar.tests';
import './editor/Menubar.Add.tests';
import './editor/Menubar.Edit.tests';
import './editor/Menubar.Examples.tests';
import './editor/Menubar.File.tests';
import './editor/Menubar.Help.tests';
import './editor/Menubar.Play.tests';
import './editor/Menubar.Status.tests';
import './editor/Menubar.View.tests';

import './editor/Sidebar.tests';
import './editor/Sidebar.Animation.tests';
import './editor/Sidebar.Geometry.tests';
import './editor/Sidebar.Geometry.BoxGeometry.tests';
import './editor/Sidebar.Geometry.BufferGeometry.tests';
import './editor/Sidebar.Geometry.CircleGeometry.tests';
import './editor/Sidebar.Geometry.CylinderGeometry.tests';
import './editor/Sidebar.Geometry.Geometry.tests';
import './editor/Sidebar.Geometry.IcosahedronGeometry.tests';
import './editor/Sidebar.Geometry.LatheGeometry.tests';
import './editor/Sidebar.Geometry.Modifiers.tests';
import './editor/Sidebar.Geometry.PlaneGeometry.tests';
import './editor/Sidebar.Geometry.SphereGeometry.tests';
import './editor/Sidebar.Geometry.TeapotBufferGeometry.tests';
import './editor/Sidebar.Geometry.TorusGeometry.tests';
import './editor/Sidebar.Geometry.TorusKnotGeometry.tests';
import './editor/Sidebar.History.tests';
import './editor/Sidebar.Material.tests';
import './editor/Sidebar.Object.tests';
import './editor/Sidebar.Project.tests';
import './editor/Sidebar.Properties.tests';
import './editor/Sidebar.Scene.tests';
import './editor/Sidebar.Script.tests';
import './editor/Sidebar.Settings.tests';

import './editor/Storage.tests';
import './editor/Toolbar.tests';
import './editor/Viewport.tests';
import './editor/Viewport.Info.tests';

//editor/commands
import './editor/commands/AddObjectCommand.tests';
import './editor/commands/AddScriptCommand.tests';
import './editor/commands/MoveObjectCommand.tests';
import './editor/commands/MultiCmdsCommand.tests';
import './editor/commands/RemoveObjectCommand.tests';
import './editor/commands/RemoveScriptCommand.tests';
import './editor/commands/SetColorCommand.tests';
import './editor/commands/SetGeometryCommand.tests';
import './editor/commands/SetGeometryValueCommand.tests';
import './editor/commands/SetMaterialColorCommand.tests';
import './editor/commands/SetMaterialCommand.tests';
import './editor/commands/SetMaterialMapCommand.tests';
import './editor/commands/SetMaterialValueCommand.tests';
import './editor/commands/SetPositionCommand.tests';
import './editor/commands/SetRotationCommand.tests';
import './editor/commands/SetScaleCommand.tests';
import './editor/commands/SetSceneCommand.tests';
import './editor/commands/SetScriptValueCommand.tests';
import './editor/commands/SetUuidCommand.tests';
import './editor/commands/SetValueCommand.tests';

//editor/others
