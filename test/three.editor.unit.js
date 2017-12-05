/**
 * @author TristanVALCKE / https://github.com/Itee
 */

// TODO (Itee) Editor is not es6 module so care to include order !!!
// TODO: all views could not be testable, waiting modular code before implement units tests on them

//editor
import './unit/editor/Command.tests';
import './unit/editor/Config.tests';
import './unit/editor/Editor.tests';
import './unit/editor/History.tests';
import './unit/editor/Loader.tests';
import './unit/editor/Player.tests';
import './unit/editor/Script.tests';

import './unit/editor/Menubar.tests';
import './unit/editor/Menubar.Add.tests';
import './unit/editor/Menubar.Edit.tests';
import './unit/editor/Menubar.Examples.tests';
import './unit/editor/Menubar.File.tests';
import './unit/editor/Menubar.Help.tests';
import './unit/editor/Menubar.Play.tests';
import './unit/editor/Menubar.Status.tests';
import './unit/editor/Menubar.View.tests';

import './unit/editor/Sidebar.tests';
import './unit/editor/Sidebar.Animation.tests';
import './unit/editor/Sidebar.Geometry.tests';
import './unit/editor/Sidebar.Geometry.BoxGeometry.tests';
import './unit/editor/Sidebar.Geometry.BufferGeometry.tests';
import './unit/editor/Sidebar.Geometry.CircleGeometry.tests';
import './unit/editor/Sidebar.Geometry.CylinderGeometry.tests';
import './unit/editor/Sidebar.Geometry.Geometry.tests';
import './unit/editor/Sidebar.Geometry.IcosahedronGeometry.tests';
import './unit/editor/Sidebar.Geometry.LatheGeometry.tests';
import './unit/editor/Sidebar.Geometry.Modifiers.tests';
import './unit/editor/Sidebar.Geometry.PlaneGeometry.tests';
import './unit/editor/Sidebar.Geometry.SphereGeometry.tests';
import './unit/editor/Sidebar.Geometry.TeapotBufferGeometry.tests';
import './unit/editor/Sidebar.Geometry.TorusGeometry.tests';
import './unit/editor/Sidebar.Geometry.TorusKnotGeometry.tests';
import './unit/editor/Sidebar.History.tests';
import './unit/editor/Sidebar.Material.tests';
import './unit/editor/Sidebar.Object.tests';
import './unit/editor/Sidebar.Project.tests';
import './unit/editor/Sidebar.Properties.tests';
import './unit/editor/Sidebar.Scene.tests';
import './unit/editor/Sidebar.Script.tests';
import './unit/editor/Sidebar.Settings.tests';

import './unit/editor/Storage.tests';
import './unit/editor/Toolbar.tests';
import './unit/editor/Viewport.tests';
import './unit/editor/Viewport.Info.tests';

//editor/commands
import './unit/editor/commands/AddObjectCommand.tests';
import './unit/editor/commands/AddScriptCommand.tests';
import './unit/editor/commands/MoveObjectCommand.tests';
import './unit/editor/commands/MultiCmdsCommand.tests';
import './unit/editor/commands/RemoveObjectCommand.tests';
import './unit/editor/commands/RemoveScriptCommand.tests';
import './unit/editor/commands/SetColorCommand.tests';
import './unit/editor/commands/SetGeometryCommand.tests';
import './unit/editor/commands/SetGeometryValueCommand.tests';
import './unit/editor/commands/SetMaterialColorCommand.tests';
import './unit/editor/commands/SetMaterialCommand.tests';
import './unit/editor/commands/SetMaterialMapCommand.tests';
import './unit/editor/commands/SetMaterialValueCommand.tests';
import './unit/editor/commands/SetPositionCommand.tests';
import './unit/editor/commands/SetRotationCommand.tests';
import './unit/editor/commands/SetScaleCommand.tests';
import './unit/editor/commands/SetSceneCommand.tests';
import './unit/editor/commands/SetScriptValueCommand.tests';
import './unit/editor/commands/SetUuidCommand.tests';
import './unit/editor/commands/SetValueCommand.tests';

//editor/others

