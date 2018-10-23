/**
 * @author mrdoob / http://mrdoob.com/
 */

var Strings = function ( config ) {

	var language = config.getKey( 'language' );

	var values = {

		en: {
			'menubar/file': 'File',
			'menubar/file/new': 'New',
			'menubar/file/import': 'Import',
			'menubar/file/export/geometry': 'Export Geometry',
			'menubar/file/export/object': 'Export Object',
			'menubar/file/export/scene': 'Export Scene',
			'menubar/file/export/dae': 'Export DAE',
			'menubar/file/export/glb': 'Export GLB',
			'menubar/file/export/gltf': 'Export GLTF',
			'menubar/file/export/obj': 'Export OBJ',
			'menubar/file/export/stl': 'Export STL',
			// 'menubar/file/export/stl_binary': 'Export STL (Binary)',
			'menubar/file/publish': 'Publish',

			'menubar/edit': 'Edit',
			'menubar/edit/undo': 'Undo (Ctrl+Z)',
			'menubar/edit/redo': 'Redo (Ctrl+Shift+Z)',
			'menubar/edit/clear_history': 'Clear History',
			'menubar/edit/clone': 'Clone',
			'menubar/edit/delete': 'Delete (Del)',
			'menubar/edit/minify_shaders': 'Minify Shaders',

			'menubar/add': 'Add',
			'menubar/add/group': 'Group',
			'menubar/add/plane': 'Plane',
			'menubar/add/box': 'Box',
			'menubar/add/circle': 'Circle',
			'menubar/add/cylinder': 'Cylinder',
			'menubar/add/sphere': 'Sphere',
			'menubar/add/icosahedron': 'Icosahedron',
			'menubar/add/torus': 'Torus',
			'menubar/add/torusknot': 'TorusKnot',
			'menubar/add/lathe': 'Lathe',
			'menubar/add/sprite': 'Sprite',
			'menubar/add/pointlight': 'PointLight',
			'menubar/add/spotlight': 'SpotLight',
			'menubar/add/directionallight': 'DirectionalLight',
			'menubar/add/hemispherelight': 'HemisphereLight',
			'menubar/add/ambientlight': 'AmbientLight',
			'menubar/add/perspectivecamera': 'PerspectiveCamera',

			'menubar/play': 'Play',

			'menubar/examples': 'Examples',

			'menubar/help': 'Help',
			'menubar/help/source_code': 'Source Code',
			'menubar/help/about': 'About'
		},

		zh: {
			'menubar/file': '文件',
			'menubar/file/new': '新建',
			'menubar/file/import': '导入',
			'menubar/file/export/geometry': '导出几何体',
			'menubar/file/export/object': '导出物体',
			'menubar/file/export/scene': '导出场景',
			'menubar/file/export/dae': '导出DAE',
			'menubar/file/export/glb': '导出GLB',
			'menubar/file/export/gltf': '导出GLTF',
			'menubar/file/export/obj': '导出OBJ',
			'menubar/file/export/stl': '导出STL',
			// 'menubar/file/export/stl_binary': '导出STL(二进制)',
			'menubar/file/publish': '发布',

			'menubar/edit': '编辑',
			'menubar/edit/undo': '撤销 (Ctrl+Z)',
			'menubar/edit/redo': '重做 (Ctrl+Shift+Z)',
			'menubar/edit/clear_history': '清空历史记录',
			'menubar/edit/clone': '拷贝',
			'menubar/edit/delete': '删除 (Del)',
			'menubar/edit/minify_shaders': '压缩着色器',

			'menubar/add': '添加',
			'menubar/add/group': '组',
			'menubar/add/plane': '平面',
			'menubar/add/box': '正方体',
			'menubar/add/circle': '圆',
			'menubar/add/cylinder': '圆柱体',
			'menubar/add/sphere': '球体',
			'menubar/add/icosahedron': '二十面体',
			'menubar/add/torus': '圆环体',
			'menubar/add/torusknot': '环面纽结体',
			'menubar/add/lathe': '酒杯',
			'menubar/add/sprite': '精灵',
			'menubar/add/pointlight': '点光源',
			'menubar/add/spotlight': 'spotlight',
			'menubar/add/directionallight': 'directionallight',
			'menubar/add/hemispherelight': '半球光',
			'menubar/add/ambientlight': '环境光',
			'menubar/add/perspectivecamera': '透视相机',

			'menubar/play': '启动',

			'menubar/examples': '示例',

			'menubar/help': '帮助',
			'menubar/help/source_code': '源码',
			'menubar/help/about': '关于'
		}

	};

	return {

		getKey: function ( key ) {

			return values[ language ][ key ] || '???';

		}

	}

};
