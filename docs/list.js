var list = {

	"Manual": {

		"Getting Started": {

			"Creating a scene": "manual/introduction/Creating-a-scene",
			"Import via modules": "manual/introduction/Import-via-modules",
			"Browser support": "manual/introduction/Browser-support",
			"WebGL compatibility check": "manual/introduction/WebGL-compatibility-check",
			"How to run things locally": "manual/introduction/How-to-run-things-locally",
			"Drawing Lines": "manual/introduction/Drawing-lines",
			"Creating Text": "manual/introduction/Creating-text",
			"Migration Guide": "manual/introduction/Migration-guide",
			"Code Style Guide": "manual/introduction/Code-style-guide",
			"FAQ": "manual/introduction/FAQ",
			"Useful links": "manual/introduction/Useful-links"

		},

		"Next Steps": {

			"How to update things": "manual/introduction/How-to-update-things",
			"Matrix transformations": "manual/introduction/Matrix-transformations",
			"Animation System": "manual/introduction/Animation-system"

		},

		"Build Tools": {

			"Testing with NPM": "manual/buildTools/Testing-with-NPM"

		}


	},

	"Reference": {

		"Animation": {

			"AnimationAction": {

				"#URL": "api/animation/AnimationAction",
				"clampWhenFinished": "AnimationAction.clampWhenFinished",
				"enabled": "AnimationAction.enabled",
				"loop": "AnimationAction.loop",
				"paused": "AnimationAction.paused",
				"repetitions": "AnimationAction.repetitions",
				"time": "AnimationAction.time",
				"timeScale": "AnimationAction.timeScale",
				"weight": "AnimationAction.weight",
				"zeroSlopeAtEnd": "AnimationAction.zeroSlopeAtEnd",
				"zeroSlopeAtStart": "AnimationAction.zeroSlopeAtStart",
				"crossFadeFrom": "AnimationAction.crossFadeFrom",
				"crossFadeTo": "AnimationAction.crossFadeTo",
				"fadeIn": "AnimationAction.fadeIn",
				"fadeOut": "AnimationAction.fadeOut",
				"getEffectiveTimeScale": "AnimationAction.getEffectiveTimeScale",
				"getEffectiveWeight": "AnimationAction.getEffectiveWeight",
				"getClip": "AnimationAction.getClip",
				"getMixer": "AnimationAction.getMixer",
				"getRoot": "AnimationAction.getRoot",
				"halt": "AnimationAction.halt",
				"isRunning": "AnimationAction.isRunning",
				"isScheduled": "AnimationAction.isScheduled",
				"play": "AnimationAction.play",
				"reset": "AnimationAction.reset",
				"setDuration": "AnimationAction.setDuration",
				"setEffectiveTimeScale": "AnimationAction.setEffectiveTimeScale",
				"setEffectiveWeight": "AnimationAction.setEffectiveWeight",
				"setLoop": "AnimationAction.setLoop",
				"startAt": "AnimationAction.startAt",
				"stop": "AnimationAction.stop",
				"stopFading": "AnimationAction.stopFading",
				"stopWarping": "AnimationAction.stopWarping",
				"syncWith": "AnimationAction.syncWith",
				"warp": "AnimationAction.warp"

			},

			"AnimationClip": {

				"#URL": "api/animation/AnimationClip",
				"duration": "AnimationClip.duration",
				"name": "AnimationClip.name",
				"tracks": "AnimationClip.tracks",
				"uuid": "AnimationClip.uuid",
				"optimize": "AnimationClip.optimize",
				"resetDuration": "AnimationClip.resetDuration",
				"trim": "AnimationClip.trim",
				"CreateClipsFromMorphTargetSequences": "AnimationClip.CreateClipsFromMorphTargetSequences",
				"CreateFromMorphTargetSequence": "AnimationClip.CreateFromMorphTargetSequence",
				"findByName": "AnimationClip.findByName",
				"parse": "AnimationClip.parse",
				"parseAnimation": "AnimationClip.parseAnimation",
				"toJSON": "AnimationClip.toJSON"

			},

			"AnimationMixer": {

				"#URL": "api/animation/AnimationMixer",
				"time": "AnimationMixer.time",
				"timeScale": "AnimationMixer.timeScale",
				"clipAction": "AnimationMixer.clipAction",
				"existingAction": "AnimationMixer.existingAction",
				"getRoot": "AnimationMixer.getRoot",
				"stopAllAction": "AnimationMixer.stopAllAction",
				"update": "AnimationMixer.update",
				"uncacheClip": "AnimationMixer.uncacheClip",
				"uncacheRoot": "AnimationMixer.uncacheRoot",
				"uncacheAction": "AnimationMixer.uncacheAction"

			},

			"AnimationObjectGroup": {

				"#URL": "api/animation/AnimationObjectGroup",
				"stats": "AnimationObjectGroup.stats",
				"uuid": "AnimationObjectGroup.uuid",
				"add": "AnimationObjectGroup.add",
				"remove": "AnimationObjectGroup.remove",
				"uncache": "AnimationObjectGroup.uncache"

			},

			"AnimationUtils": {

				"#URL": "api/animation/AnimationUtils",
				"arraySlice": "AnimationUtils.arraySlice",
				"convertArray": "AnimationUtils.convertArray",
				"flattenJSON": "AnimationUtils.flattenJSON",
				"getKeyframeOrder": "AnimationUtils.getKeyframeOrder",
				"isTypedArray": "AnimationUtils.isTypedArray",
				"sortedArray": "AnimationUtils.sortedArray"

			},

			"KeyframeTrack": {

				"#URL": "api/animation/KeyframeTrack",
				"name": "KeyframeTrack.name",
				"times": "KeyframeTrack.times",
				"values": "KeyframeTrack.values",
				"DefaultInterpolation": "KeyframeTrack.DefaultInterpolation",
				"TimeBufferType ": "KeyframeTrack.TimeBufferType ",
				"ValueBufferType ": "KeyframeTrack.ValueBufferType ",
				"createInterpolant": "KeyframeTrack.createInterpolant",
				"getInterpolation": "KeyframeTrack.getInterpolation",
				"getValueSize": "KeyframeTrack.getValueSize",
				"InterpolantFactoryMethodDiscrete": "KeyframeTrack.InterpolantFactoryMethodDiscrete",
				"InterpolantFactoryMethodLinear": "KeyframeTrack.InterpolantFactoryMethodLinear",
				"InterpolantFactoryMethodSmooth": "KeyframeTrack.InterpolantFactoryMethodSmooth",
				"optimize": "KeyframeTrack.optimize",
				"scale": "KeyframeTrack.scale",
				"setInterpolation": "KeyframeTrack.setInterpolation",
				"shift": "KeyframeTrack.shift",
				"trim": "KeyframeTrack.trim",
				"validate": "KeyframeTrack.validate",
				"parse": "KeyframeTrack.parse",
				"toJSON": "KeyframeTrack.toJSON"

			},

			"PropertyBinding": {

				"#URL": "api/animation/PropertyBinding",
				"path": "PropertyBinding.path",
				"parsedPath": "PropertyBinding.parsedPath",
				"node": "PropertyBinding.node",
				"rootNode": "PropertyBinding.rootNode",
				"BindingType": "PropertyBinding.BindingType",
				"Versioning": "PropertyBinding.Versioning",
				"GetterByBindingType": "PropertyBinding.GetterByBindingType",
				"SetterByBindingTypeAndVersioning": "PropertyBinding.SetterByBindingTypeAndVersioning",
				"getValue": "PropertyBinding.getValue",
				"setValue": "PropertyBinding.setValue",
				"bind": "PropertyBinding.bind",
				"unbind": "PropertyBinding.unbind",
				"Composite": "PropertyBinding.Composite",
				"create": "PropertyBinding.create",
				"parseTrackName": "PropertyBinding.parseTrackName",
				"findNode": "PropertyBinding.findNode"

			},

			"PropertyMixer": {

				"#URL": "api/animation/PropertyMixer",
				"binding": "PropertyMixer.binding",
				"buffer": "PropertyMixer.buffer",
				"cumulativeWeight": "PropertyMixer.cumulativeWeight",
				"valueSize": "PropertyMixer.valueSize",
				"referenceCount": "PropertyMixer.referenceCount",
				"useCount": "PropertyMixer.useCount",
				"accumulate": "PropertyMixer.accumulate",
				"apply": "PropertyMixer.apply",
				"saveOriginalState": "PropertyMixer.saveOriginalState",
				"restoreOriginalState": "PropertyMixer.restoreOriginalState"

			}


		},

		"Animation / Tracks": {

			"BooleanKeyframeTrack": {

				"#URL": "api/animation/tracks/BooleanKeyframeTrack",
				"DefaultInterpolation": "BooleanKeyframeTrack.DefaultInterpolation",
				"ValueBufferType": "BooleanKeyframeTrack.ValueBufferType",
				"ValueTypeName": "BooleanKeyframeTrack.ValueTypeName",
				"InterpolantFactoryMethodLinear ": "BooleanKeyframeTrack.InterpolantFactoryMethodLinear ",
				"InterpolantFactoryMethodSmooth ": "BooleanKeyframeTrack.InterpolantFactoryMethodSmooth "

			},

			"ColorKeyframeTrack": {

				"#URL": "api/animation/tracks/ColorKeyframeTrack",
				"ValueTypeName": "ColorKeyframeTrack.ValueTypeName"

			},

			"NumberKeyframeTrack": {

				"#URL": "api/animation/tracks/NumberKeyframeTrack",
				"ValueTypeName": "NumberKeyframeTrack.ValueTypeName"

			},

			"QuaternionKeyframeTrack": {

				"#URL": "api/animation/tracks/QuaternionKeyframeTrack",
				"DefaultInterpolation": "QuaternionKeyframeTrack.DefaultInterpolation",
				"ValueTypeName": "QuaternionKeyframeTrack.ValueTypeName",
				"InterpolantFactoryMethodLinear": "QuaternionKeyframeTrack.InterpolantFactoryMethodLinear"

			},

			"StringKeyframeTrack": {

				"#URL": "api/animation/tracks/StringKeyframeTrack",
				"DefaultInterpolation": "StringKeyframeTrack.DefaultInterpolation",
				"ValueBufferType": "StringKeyframeTrack.ValueBufferType",
				"ValueTypeName": "StringKeyframeTrack.ValueTypeName",
				"InterpolantFactoryMethodLinear": "StringKeyframeTrack.InterpolantFactoryMethodLinear",
				"InterpolantFactoryMethodSmooth": "StringKeyframeTrack.InterpolantFactoryMethodSmooth"

			},

			"VectorKeyframeTrack": {

				"#URL": "api/animation/tracks/VectorKeyframeTrack",
				"ValueTypeName": "VectorKeyframeTrack.ValueTypeName"

			}


		},

		"Audio": {

			"Audio": {

				"#URL": "api/audio/Audio",
				"autoplay": "Audio.autoplay",
				"context": "Audio.context",
				"filters": "Audio.filters",
				"gain": "Audio.gain",
				"hasPlaybackControl": "Audio.hasPlaybackControl",
				"playbackRate": "Audio.playbackRate",
				"isPlaying": "Audio.isPlaying",
				"startTime": "Audio.startTime",
				"offset": "Audio.offset",
				"source": "Audio.source",
				"sourceType": "Audio.sourceType",
				"type": "Audio.type",
				"connect": "Audio.connect",
				"disconnect": "Audio.disconnect",
				"getFilter": "Audio.getFilter",
				"getFilters": "Audio.getFilters",
				"getLoop": "Audio.getLoop",
				"getOutput": "Audio.getOutput",
				"getPlaybackRate": "Audio.getPlaybackRate",
				"getVolume": "Audio.getVolume",
				"play": "Audio.play",
				"pause": "Audio.pause",
				"onEnded": "Audio.onEnded",
				"setBuffer": "Audio.setBuffer",
				"setFilter": "Audio.setFilter",
				"setFilters": "Audio.setFilters",
				"setLoop": "Audio.setLoop",
				"setNodeSource": "Audio.setNodeSource",
				"setPlaybackRate": "Audio.setPlaybackRate",
				"setVolume": "Audio.setVolume",
				"stop": "Audio.stop"

			},

			"AudioAnalyser": {

				"#URL": "api/audio/AudioAnalyser",
				"analyser": "AudioAnalyser.analyser",
				"fftSize": "AudioAnalyser.fftSize",
				"data": "AudioAnalyser.data",
				"getFrequencyData": "AudioAnalyser.getFrequencyData",
				"getAverageFrequency": "AudioAnalyser.getAverageFrequency"

			},

			"AudioContext": {

				"#URL": "api/audio/AudioContext",
				"getContext": "AudioContext.getContext",
				"setContext": "AudioContext.setContext"

			},

			"AudioListener": {

				"#URL": "api/audio/AudioListener",
				"context": "AudioListener.context",
				"gain": "AudioListener.gain",
				"filter": "AudioListener.filter",
				"getInput": "AudioListener.getInput",
				"removeFilter": "AudioListener.removeFilter",
				"getFilter": "AudioListener.getFilter",
				"setFilter": "AudioListener.setFilter",
				"getMasterVolume": "AudioListener.getMasterVolume",
				"setMasterVolume": "AudioListener.setMasterVolume"

			},

			"PositionalAudio": {

				"#URL": "api/audio/PositionalAudio",
				"panner": "PositionalAudio.panner",
				"getOutput": "PositionalAudio.getOutput",
				"getRefDistance": "PositionalAudio.getRefDistance",
				"setRefDistance": "PositionalAudio.setRefDistance",
				"getRolloffFactor": "PositionalAudio.getRolloffFactor",
				"setRolloffFactor": "PositionalAudio.setRolloffFactor",
				"getDistanceModel": "PositionalAudio.getDistanceModel",
				"setDistanceModel": "PositionalAudio.setDistanceModel",
				"getMaxDistance": "PositionalAudio.getMaxDistance",
				"setMaxDistance": "PositionalAudio.setMaxDistance"

			}


		},

		"Cameras": {

			"Camera": {

				"#URL": "api/cameras/Camera",
				"isCamera": "Camera.isCamera",
				"layers": "Camera.layers",
				"matrixWorldInverse": "Camera.matrixWorldInverse",
				"projectionMatrix": "Camera.projectionMatrix",
				"clone": "Camera.clone",
				"copy": "Camera.copy",
				"getWorldDirection": "Camera.getWorldDirection"

			},

			"CubeCamera": {

				"#URL": "api/cameras/CubeCamera",
				"renderTarget": "CubeCamera.renderTarget",
				"update": "CubeCamera.update",
				"clear": "CubeCamera.clear"

			},

			"OrthographicCamera": {

				"#URL": "api/cameras/OrthographicCamera",
				"bottom": "OrthographicCamera.bottom",
				"far": "OrthographicCamera.far",
				"isOrthographicCamera": "OrthographicCamera.isOrthographicCamera",
				"left": "OrthographicCamera.left",
				"near": "OrthographicCamera.near",
				"right": "OrthographicCamera.right",
				"top": "OrthographicCamera.top",
				"view": "OrthographicCamera.view",
				"zoom": "OrthographicCamera.zoom",
				"setViewOffset": "OrthographicCamera.setViewOffset",
				"clearViewOffset": "OrthographicCamera.clearViewOffset",
				"updateProjectionMatrix": "OrthographicCamera.updateProjectionMatrix",
				"toJSON": "OrthographicCamera.toJSON"

			},

			"PerspectiveCamera": {

				"#URL": "api/cameras/PerspectiveCamera",
				"aspect": "PerspectiveCamera.aspect",
				"far": "PerspectiveCamera.far",
				"filmGauge": "PerspectiveCamera.filmGauge",
				"filmOffset": "PerspectiveCamera.filmOffset",
				"focus": "PerspectiveCamera.focus",
				"fov": "PerspectiveCamera.fov",
				"isPerspectiveCamera": "PerspectiveCamera.isPerspectiveCamera",
				"near": "PerspectiveCamera.near",
				"view": "PerspectiveCamera.view",
				"zoom": "PerspectiveCamera.zoom",
				"clearViewOffset": "PerspectiveCamera.clearViewOffset",
				"getEffectiveFOV": "PerspectiveCamera.getEffectiveFOV",
				"getFilmHeight": "PerspectiveCamera.getFilmHeight",
				"getFilmWidth": "PerspectiveCamera.getFilmWidth",
				"getFocalLength": "PerspectiveCamera.getFocalLength",
				"setFocalLength": "PerspectiveCamera.setFocalLength",
				"setViewOffset": "PerspectiveCamera.setViewOffset",
				"updateProjectionMatrix": "PerspectiveCamera.updateProjectionMatrix",
				"toJSON": "PerspectiveCamera.toJSON"

			},

			"StereoCamera": {

				"#URL": "api/cameras/StereoCamera",
				"aspect": "StereoCamera.aspect",
				"eyeSep": "StereoCamera.eyeSep",
				"cameraL": "StereoCamera.cameraL",
				"cameraR": "StereoCamera.cameraR",
				"update": "StereoCamera.update"

			}


		},

		"Constants": {

			"Animation": {

				"#URL": "api/constants/Animation"

			},

			"Core": {

				"#URL": "api/constants/Core"

			},

			"CustomBlendingEquation": {

				"#URL": "api/constants/CustomBlendingEquations"

			},

			"DrawModes": {

				"#URL": "api/constants/DrawModes"

			},

			"Materials": {

				"#URL": "api/constants/Materials",
				"color": "Materials.color",
				"vertexColors": "Materials.vertexColors"

			},

			"Renderer": {

				"#URL": "api/constants/Renderer"

			},

			"Textures": {

				"#URL": "api/constants/Textures"

			}


		},

		"Core": {

			"BufferAttribute": {

				"#URL": "api/core/BufferAttribute",
				"array": "BufferAttribute.array",
				"count": "BufferAttribute.count",
				"dynamic": "BufferAttribute.dynamic",
				"isBufferAttribute": "BufferAttribute.isBufferAttribute",
				"itemSize": "BufferAttribute.itemSize",
				"name": "BufferAttribute.name",
				"needsUpdate": "BufferAttribute.needsUpdate",
				"normalized": "BufferAttribute.normalized",
				"onUploadCallback": "BufferAttribute.onUploadCallback",
				"updateRange": "BufferAttribute.updateRange",
				"uuid": "BufferAttribute.uuid",
				"version": "BufferAttribute.version",
				"clone": "BufferAttribute.clone",
				"copyArray": "BufferAttribute.copyArray",
				"copyAt": "BufferAttribute.copyAt",
				"copyColorsArray": "BufferAttribute.copyColorsArray",
				"copyIndicesArray": "BufferAttribute.copyIndicesArray",
				"copyVector2sArray": "BufferAttribute.copyVector2sArray",
				"copyVector3sArray": "BufferAttribute.copyVector3sArray",
				"copyVector4sArray": "BufferAttribute.copyVector4sArray",
				"getX": "BufferAttribute.getX",
				"getY": "BufferAttribute.getY",
				"getZ": "BufferAttribute.getZ",
				"getW": "BufferAttribute.getW",
				"onUpload": "BufferAttribute.onUpload",
				"set": "BufferAttribute.set",
				"setArray": "BufferAttribute.setArray",
				"setDynamic": "BufferAttribute.setDynamic",
				"setX": "BufferAttribute.setX",
				"setY": "BufferAttribute.setY",
				"setZ": "BufferAttribute.setZ",
				"setW": "BufferAttribute.setW",
				"setXY": "BufferAttribute.setXY",
				"setXYZ": "BufferAttribute.setXYZ",
				"setXYZW": "BufferAttribute.setXYZW"

			},

			"BufferGeometry": {

				"#URL": "api/core/BufferGeometry",
				"attributes": "BufferGeometry.attributes",
				"boundingBox": "BufferGeometry.boundingBox",
				"boundingSphere": "BufferGeometry.boundingSphere",
				"drawRange": "BufferGeometry.drawRange",
				"groups": "BufferGeometry.groups",
				"drawcalls": "BufferGeometry.drawcalls",
				"id": "BufferGeometry.id",
				"index": "BufferGeometry.index",
				"isBufferGeometry": "BufferGeometry.isBufferGeometry",
				"morphAttributes": "BufferGeometry.morphAttributes",
				"name": "BufferGeometry.name",
				"uuid": "BufferGeometry.uuid",
				"addAttribute": "BufferGeometry.addAttribute",
				"addGroup": "BufferGeometry.addGroup",
				"applyMatrix": "BufferGeometry.applyMatrix",
				"center": "BufferGeometry.center",
				"clone": "BufferGeometry.clone",
				"copy": "BufferGeometry.copy",
				"clearGroups": "BufferGeometry.clearGroups",
				"computeBoundingBox": "BufferGeometry.computeBoundingBox",
				"computeBoundingSphere": "BufferGeometry.computeBoundingSphere",
				"computeVertexNormals": "BufferGeometry.computeVertexNormals",
				"dispose": "BufferGeometry.dispose",
				"fromDirectGeometry": "BufferGeometry.fromDirectGeometry",
				"fromGeometry": "BufferGeometry.fromGeometry",
				"getAttribute": "BufferGeometry.getAttribute",
				"getIndex": "BufferGeometry.getIndex",
				"lookAt": "BufferGeometry.lookAt",
				"merge": "BufferGeometry.merge",
				"normalizeNormals": "BufferGeometry.normalizeNormals",
				"removeAttribute": "BufferGeometry.removeAttribute",
				"rotateX": "BufferGeometry.rotateX",
				"rotateY": "BufferGeometry.rotateY",
				"rotateZ": "BufferGeometry.rotateZ",
				"scale": "BufferGeometry.scale",
				"setIndex": "BufferGeometry.setIndex",
				"setDrawRange": "BufferGeometry.setDrawRange",
				"setFromObject": "BufferGeometry.setFromObject",
				"setFromPoints": "BufferGeometry.setFromPoints",
				"toJSON": "BufferGeometry.toJSON",
				"toNonIndexed": "BufferGeometry.toNonIndexed",
				"translate": "BufferGeometry.translate",
				"updateFromObject": "BufferGeometry.updateFromObject"

			},

			"Clock": {

				"#URL": "api/core/Clock",
				"autoStart": "Clock.autoStart",
				"startTime": "Clock.startTime",
				"oldTime": "Clock.oldTime",
				"elapsedTime": "Clock.elapsedTime",
				"running": "Clock.running",
				"start": "Clock.start",
				"stop": "Clock.stop",
				"getElapsedTime": "Clock.getElapsedTime",
				"getDelta": "Clock.getDelta"

			},

			"DirectGeometry": {

				"#URL": "api/core/DirectGeometry",
				"id": "DirectGeometry.id",
				"name": "DirectGeometry.name",
				"type": "DirectGeometry.type",
				"indices": "DirectGeometry.indices",
				"vertices": "DirectGeometry.vertices",
				"normals": "DirectGeometry.normals",
				"colors": "DirectGeometry.colors",
				"uvs": "DirectGeometry.uvs",
				"uvs2": "DirectGeometry.uvs2",
				"groups": "DirectGeometry.groups",
				"morphTargets": "DirectGeometry.morphTargets",
				"skinWeights": "DirectGeometry.skinWeights",
				"skinIndices": "DirectGeometry.skinIndices",
				"boundingBox": "DirectGeometry.boundingBox",
				"boundingSphere": "DirectGeometry.boundingSphere",
				"verticesNeedUpdate": "DirectGeometry.verticesNeedUpdate",
				"normalsNeedUpdate": "DirectGeometry.normalsNeedUpdate",
				"colorsNeedUpdate": "DirectGeometry.colorsNeedUpdate",
				"uvsNeedUpdate": "DirectGeometry.uvsNeedUpdate",
				"groupsNeedUpdate": "DirectGeometry.groupsNeedUpdate",
				"computeBoundingBox": "DirectGeometry.computeBoundingBox",
				"computeBoundingSphere": "DirectGeometry.computeBoundingSphere",
				"computeGroups": "DirectGeometry.computeGroups",
				"dispose": "DirectGeometry.dispose",
				"fromGeometry": "DirectGeometry.fromGeometry"

			},

			"EventDispatcher": {

				"#URL": "api/core/EventDispatcher",
				"addEventListener": "EventDispatcher.addEventListener",
				"hasEventListener": "EventDispatcher.hasEventListener",
				"removeEventListener": "EventDispatcher.removeEventListener",
				"dispatchEvent": "EventDispatcher.dispatchEvent"

			},

			"Face3": {

				"#URL": "api/core/Face3",
				"a": "Face3.a",
				"b": "Face3.b",
				"c": "Face3.c",
				"normal": "Face3.normal",
				"color": "Face3.color",
				"vertexNormals": "Face3.vertexNormals",
				"vertexColors": "Face3.vertexColors",
				"materialIndex": "Face3.materialIndex",
				"clone": "Face3.clone",
				"copy": "Face3.copy"

			},

			"Geometry": {

				"#URL": "api/core/Geometry",
				"boundingBox": "Geometry.boundingBox",
				"boundingSphere": "Geometry.boundingSphere",
				"colors": "Geometry.colors",
				"faces": "Geometry.faces",
				"faceVertexUvs": "Geometry.faceVertexUvs",
				"id": "Geometry.id",
				"isGeometry": "Geometry.isGeometry",
				"lineDistances": "Geometry.lineDistances",
				"morphTargets": "Geometry.morphTargets",
				"morphNormals": "Geometry.morphNormals",
				"name": "Geometry.name",
				"skinWeights": "Geometry.skinWeights",
				"skinIndices": "Geometry.skinIndices",
				"uuid": "Geometry.uuid",
				"vertices": "Geometry.vertices",
				"verticesNeedUpdate": "Geometry.verticesNeedUpdate",
				"elementsNeedUpdate": "Geometry.elementsNeedUpdate",
				"uvsNeedUpdate": "Geometry.uvsNeedUpdate",
				"normalsNeedUpdate": "Geometry.normalsNeedUpdate",
				"colorsNeedUpdate": "Geometry.colorsNeedUpdate",
				"groupsNeedUpdate": "Geometry.groupsNeedUpdate",
				"lineDistancesNeedUpdate": "Geometry.lineDistancesNeedUpdate",
				"applyMatrix": "Geometry.applyMatrix",
				"center": "Geometry.center",
				"clone": "Geometry.clone",
				"computeBoundingBox": "Geometry.computeBoundingBox",
				"computeBoundingSphere": "Geometry.computeBoundingSphere",
				"computeFaceNormals": "Geometry.computeFaceNormals",
				"computeFlatVertexNormals": "Geometry.computeFlatVertexNormals",
				"computeLineDistances": "Geometry.computeLineDistances",
				"computeMorphNormals": "Geometry.computeMorphNormals",
				"computeVertexNormals": "Geometry.computeVertexNormals",
				"copy": "Geometry.copy",
				"dispose": "Geometry.dispose",
				"fromBufferGeometry": "Geometry.fromBufferGeometry",
				"lookAt": "Geometry.lookAt",
				"merge": "Geometry.merge",
				"mergeMesh": "Geometry.mergeMesh",
				"mergeVertices": "Geometry.mergeVertices",
				"normalize": "Geometry.normalize",
				"rotateX": "Geometry.rotateX",
				"rotateY": "Geometry.rotateY",
				"rotateZ": "Geometry.rotateZ",
				"setFromPoints": "Geometry.setFromPoints",
				"sortFacesByMaterialIndex": "Geometry.sortFacesByMaterialIndex",
				"scale": "Geometry.scale",
				"toJSON": "Geometry.toJSON",
				"translate": "Geometry.translate"

			},

			"InstancedBufferAttribute": {

				"#URL": "api/core/InstancedBufferAttribute",
				"meshPerAttribute": "InstancedBufferAttribute.meshPerAttribute",
				"isInstancedBufferAttribute": "InstancedBufferAttribute.isInstancedBufferAttribute"

			},

			"InstancedBufferGeometry": {

				"#URL": "api/core/InstancedBufferGeometry",
				"maxInstancedCount": "InstancedBufferGeometry.maxInstancedCount",
				"isInstancedBufferGeometry": "InstancedBufferGeometry.isInstancedBufferGeometry",
				"addGroup": "InstancedBufferGeometry.addGroup"

			},

			"InstancedInterleavedBuffer": {

				"#URL": "api/core/InstancedInterleavedBuffer",
				"meshPerAttribute": "InstancedInterleavedBuffer.meshPerAttribute",
				"isInstancedInterleavedBuffer": "InstancedInterleavedBuffer.isInstancedInterleavedBuffer"

			},

			"InterleavedBuffer": {

				"#URL": "api/core/InterleavedBuffer",
				"array": "InterleavedBuffer.array",
				"stride": "InterleavedBuffer.stride",
				"count": "InterleavedBuffer.count",
				"dynamic": "InterleavedBuffer.dynamic",
				"updateRange": "InterleavedBuffer.updateRange",
				"updateRange.offset": "InterleavedBuffer.updateRange.offset",
				"updateRange.count": "InterleavedBuffer.updateRange.count",
				"version": "InterleavedBuffer.version",
				"isInterleavedBuffer": "InterleavedBuffer.isInterleavedBuffer",
				"needsUpdate": "InterleavedBuffer.needsUpdate",
				"setArray": "InterleavedBuffer.setArray",
				"setDynamic": "InterleavedBuffer.setDynamic",
				"copy": "InterleavedBuffer.copy",
				"copyAt": "InterleavedBuffer.copyAt",
				"set": "InterleavedBuffer.set",
				"clone": "InterleavedBuffer.clone"

			},

			"InterleavedBufferAttribute": {

				"#URL": "api/core/InterleavedBufferAttribute",
				"data": "InterleavedBufferAttribute.data",
				"array": "InterleavedBufferAttribute.array",
				"count": "InterleavedBufferAttribute.count",
				"itemSize": "InterleavedBufferAttribute.itemSize",
				"offset": "InterleavedBufferAttribute.offset",
				"normalized": "InterleavedBufferAttribute.normalized",
				"isInterleavedBufferAttribute": "InterleavedBufferAttribute.isInterleavedBufferAttribute",
				"getX": "InterleavedBufferAttribute.getX",
				"getY": "InterleavedBufferAttribute.getY",
				"getZ": "InterleavedBufferAttribute.getZ",
				"getW": "InterleavedBufferAttribute.getW",
				"setX": "InterleavedBufferAttribute.setX",
				"setY": "InterleavedBufferAttribute.setY",
				"setZ": "InterleavedBufferAttribute.setZ",
				"setW": "InterleavedBufferAttribute.setW",
				"setXY": "InterleavedBufferAttribute.setXY",
				"setXYZ": "InterleavedBufferAttribute.setXYZ",
				"setXYZW": "InterleavedBufferAttribute.setXYZW"

			},

			"Layers": {

				"#URL": "api/core/Layers",
				"mask": "Layers.mask",
				"disable": "Layers.disable",
				"enable": "Layers.enable",
				"set": "Layers.set",
				"test": "Layers.test",
				"toggle": "Layers.toggle"

			},

			"Object3D": {

				"#URL": "api/core/Object3D",
				"castShadow": "Object3D.castShadow",
				"children": "Object3D.children",
				"frustumCulled": "Object3D.frustumCulled",
				"id": "Object3D.id",
				"isObject": "Object3D.isObject",
				"layers": "Object3D.layers",
				"matrix": "Object3D.matrix",
				"matrixAutoUpdate": "Object3D.matrixAutoUpdate",
				"matrixWorld": "Object3D.matrixWorld",
				"matrixWorldNeedsUpdate": "Object3D.matrixWorldNeedsUpdate",
				"modelViewMatrix": "Object3D.modelViewMatrix",
				"name": "Object3D.name",
				"normalMatrix": "Object3D.normalMatrix",
				"onAfterRender": "Object3D.onAfterRender",
				"onBeforeRender": "Object3D.onBeforeRender",
				"parent": "Object3D.parent",
				"position": "Object3D.position",
				"quaternion": "Object3D.quaternion",
				"receiveShadow": "Object3D.receiveShadow",
				"renderOrder": "Object3D.renderOrder",
				"rotation": "Object3D.rotation",
				"scale": "Object3D.scale",
				"up": "Object3D.up",
				"userData": "Object3D.userData",
				"uuid": "Object3D.uuid",
				"visible": "Object3D.visible",
				"DefaultUp": "Object3D.DefaultUp",
				"DefaultMatrixAutoUpdate": "Object3D.DefaultMatrixAutoUpdate",
				"add": "Object3D.add",
				"applyMatrix": "Object3D.applyMatrix",
				"applyQuaternion": "Object3D.applyQuaternion",
				"clone": "Object3D.clone",
				"copy": "Object3D.copy",
				"getObjectById": "Object3D.getObjectById",
				"getObjectByName": "Object3D.getObjectByName",
				"getObjectByProperty": "Object3D.getObjectByProperty",
				"getWorldPosition": "Object3D.getWorldPosition",
				"getWorldQuaternion": "Object3D.getWorldQuaternion",
				"getWorldRotation": "Object3D.getWorldRotation",
				"getWorldScale": "Object3D.getWorldScale",
				"getWorldDirection": "Object3D.getWorldDirection",
				"localToWorld": "Object3D.localToWorld",
				"lookAt": "Object3D.lookAt",
				"raycast": "Object3D.raycast",
				"remove": "Object3D.remove",
				"rotateOnAxis": "Object3D.rotateOnAxis",
				"rotateOnWorldAxis": "Object3D.rotateOnWorldAxis",
				"rotateX": "Object3D.rotateX",
				"rotateY": "Object3D.rotateY",
				"rotateZ": "Object3D.rotateZ",
				"setRotationFromAxisAngle": "Object3D.setRotationFromAxisAngle",
				"setRotationFromEuler": "Object3D.setRotationFromEuler",
				"setRotationFromMatrix": "Object3D.setRotationFromMatrix",
				"setRotationFromQuaternion": "Object3D.setRotationFromQuaternion",
				"toJSON": "Object3D.toJSON",
				"translateOnAxis": "Object3D.translateOnAxis",
				"translateX": "Object3D.translateX",
				"translateY": "Object3D.translateY",
				"translateZ": "Object3D.translateZ",
				"traverse": "Object3D.traverse",
				"traverseVisible": "Object3D.traverseVisible",
				"traverseAncestors": "Object3D.traverseAncestors",
				"updateMatrix": "Object3D.updateMatrix",
				"updateMatrixWorld": "Object3D.updateMatrixWorld",
				"worldToLocal": "Object3D.worldToLocal"

			},

			"Raycaster": {

				"#URL": "api/core/Raycaster",
				"far": "Raycaster.far",
				"linePrecision": "Raycaster.linePrecision",
				"near": "Raycaster.near",
				"params": "Raycaster.params",
				"ray": "Raycaster.ray",
				"set": "Raycaster.set",
				"setFromCamera": "Raycaster.setFromCamera",
				"intersectObject": "Raycaster.intersectObject",
				"intersectObjects": "Raycaster.intersectObjects"

			},

			"Uniform": {

				"#URL": "api/core/Uniform",
				"value": "Uniform.value",
				"clone": "Uniform.clone"

			}


		},

		"Core / BufferAttributes": {

			"BufferAttribute Types": {

				"#URL": "api/core/bufferAttributeTypes/BufferAttributeTypes"

			}


		},

		"Deprecated": {

			"DeprecatedList": {

				"#URL": "api/deprecated/DeprecatedList"

			}


		},

		"Extras": {

			"Earcut": {

				"#URL": "api/extras/Earcut",
				"triangulate": "Earcut.triangulate"

			},

			"SceneUtils": {

				"#URL": "api/extras/SceneUtils",
				"createMultiMaterialObject": "SceneUtils.createMultiMaterialObject",
				"attach": "SceneUtils.attach",
				"detach": "SceneUtils.detach"

			},

			"ShapeUtils": {

				"#URL": "api/extras/ShapeUtils",
				"area": "ShapeUtils.area",
				"isClockwise": "ShapeUtils.isClockwise",
				"triangulateShape": "ShapeUtils.triangulateShape"

			}


		},

		"Extras / Core": {

			"Curve": {

				"#URL": "api/extras/core/Curve",
				"arcLengthDivisions": "Curve.arcLengthDivisions",
				"getPoint": "Curve.getPoint",
				"getPointAt": "Curve.getPointAt",
				"getPoints": "Curve.getPoints",
				"getSpacedPoints": "Curve.getSpacedPoints",
				"getLength": "Curve.getLength",
				"getLengths": "Curve.getLengths",
				"updateArcLengths": "Curve.updateArcLengths",
				"getUtoTmapping": "Curve.getUtoTmapping",
				"getTangent": "Curve.getTangent",
				"getTangentAt": "Curve.getTangentAt",
				"computeFrenetFrames": "Curve.computeFrenetFrames",
				"clone": "Curve.clone",
				"copy": "Curve.copy",
				"toJSON": "Curve.toJSON",
				"fromJSON": "Curve.fromJSON"

			},

			"CurvePath": {

				"#URL": "api/extras/core/CurvePath",
				"curves": "CurvePath.curves",
				"autoClose": "CurvePath.autoClose",
				"add": "CurvePath.add",
				"closePath": "CurvePath.closePath",
				"getCurveLengths": "CurvePath.getCurveLengths"

			},

			"Font": {

				"#URL": "api/extras/core/Font",
				"data": "Font.data",
				"isFont": "Font.isFont",
				"generateShapes": "Font.generateShapes"

			},

			"Interpolations": {

				"#URL": "api/extras/core/Interpolations",
				"CatmullRom": "Interpolations.CatmullRom",
				"QuadraticBezier": "Interpolations.QuadraticBezier",
				"CubicBezier": "Interpolations.CubicBezier"

			},

			"Path": {

				"#URL": "api/extras/core/Path",
				"currentPoint": "Path.currentPoint",
				"absarc": "Path.absarc",
				"absellipse": "Path.absellipse",
				"arc": "Path.arc",
				"bezierCurveTo": "Path.bezierCurveTo",
				"ellipse": "Path.ellipse",
				"lineTo": "Path.lineTo",
				"moveTo": "Path.moveTo",
				"quadraticCurveTo": "Path.quadraticCurveTo",
				"setFromPoints": "Path.setFromPoints",
				"splineThru": "Path.splineThru"

			},

			"Shape": {

				"#URL": "api/extras/core/Shape",
				"uuid": "Shape.uuid",
				"holes": "Shape.holes",
				"extractPoints": "Shape.extractPoints",
				"getPointsHoles": "Shape.getPointsHoles"

			},

			"ShapePath": {

				"#URL": "api/extras/core/ShapePath",
				"subPaths": "ShapePath.subPaths",
				"currentPath": "ShapePath.currentPath",
				"moveTo": "ShapePath.moveTo",
				"lineTo": "ShapePath.lineTo",
				"quadraticCurveTo": "ShapePath.quadraticCurveTo",
				"bezierCurveTo": "ShapePath.bezierCurveTo",
				"splineThru": "ShapePath.splineThru",
				"toShapes": "ShapePath.toShapes"

			}


		},

		"Extras / Curves": {

			"ArcCurve": {

				"#URL": "api/extras/curves/ArcCurve",
				"isArcCurve": "ArcCurve.isArcCurve"

			},

			"CatmullRomCurve3": {

				"#URL": "api/extras/curves/CatmullRomCurve3",
				"isCatmullRomCurve3": "CatmullRomCurve3.isCatmullRomCurve3",
				"points": "CatmullRomCurve3.points",
				"closed": "CatmullRomCurve3.closed",
				"curveType": "CatmullRomCurve3.curveType",
				"tension": "CatmullRomCurve3.tension"

			},

			"CubicBezierCurve": {

				"#URL": "api/extras/curves/CubicBezierCurve",
				"isCubicBezierCurve": "CubicBezierCurve.isCubicBezierCurve",
				"v0": "CubicBezierCurve.v0",
				"v1": "CubicBezierCurve.v1",
				"v2": "CubicBezierCurve.v2",
				"v3": "CubicBezierCurve.v3"

			},

			"CubicBezierCurve3": {

				"#URL": "api/extras/curves/CubicBezierCurve3",
				"isCubicBezierCurve3": "CubicBezierCurve3.isCubicBezierCurve3",
				"v0": "CubicBezierCurve3.v0",
				"v1": "CubicBezierCurve3.v1",
				"v2": "CubicBezierCurve3.v2",
				"v3": "CubicBezierCurve3.v3"

			},

			"EllipseCurve": {

				"#URL": "api/extras/curves/EllipseCurve",
				"isEllipseCurve": "EllipseCurve.isEllipseCurve",
				"aX": "EllipseCurve.aX",
				"aY": "EllipseCurve.aY",
				"xRadius": "EllipseCurve.xRadius",
				"yRadius": "EllipseCurve.yRadius",
				"aStartAngle": "EllipseCurve.aStartAngle",
				"aEndAngle": "EllipseCurve.aEndAngle",
				"aClockwise": "EllipseCurve.aClockwise",
				"aRotation": "EllipseCurve.aRotation"

			},

			"LineCurve": {

				"#URL": "api/extras/curves/LineCurve",
				"isLineCurve": "LineCurve.isLineCurve",
				"v1": "LineCurve.v1",
				"v2": "LineCurve.v2"

			},

			"LineCurve3": {

				"#URL": "api/extras/curves/LineCurve3",
				"isLineCurve3": "LineCurve3.isLineCurve3",
				"v1": "LineCurve3.v1",
				"v2": "LineCurve3.v2"

			},

			"QuadraticBezierCurve": {

				"#URL": "api/extras/curves/QuadraticBezierCurve",
				"isQuadraticBezierCurve": "QuadraticBezierCurve.isQuadraticBezierCurve",
				"v0": "QuadraticBezierCurve.v0",
				"v1": "QuadraticBezierCurve.v1",
				"v2": "QuadraticBezierCurve.v2"

			},

			"QuadraticBezierCurve3": {

				"#URL": "api/extras/curves/QuadraticBezierCurve3",
				"isQuadraticBezierCurve3": "QuadraticBezierCurve3.isQuadraticBezierCurve3",
				"v0": "QuadraticBezierCurve3.v0",
				"v1": "QuadraticBezierCurve3.v1",
				"v2": "QuadraticBezierCurve3.v2"

			},

			"SplineCurve": {

				"#URL": "api/extras/curves/SplineCurve",
				"isSplineCurve": "SplineCurve.isSplineCurve",
				"points": "SplineCurve.points"

			}


		},

		"Extras / Objects": {

			"ImmediateRenderObject": {

				"#URL": "api/extras/objects/ImmediateRenderObject",
				"render": "ImmediateRenderObject.render"

			}


		},

		"Geometries": {

			"BoxBufferGeometry": {

				"#URL": "api/geometries/BoxBufferGeometry"

			},

			"BoxGeometry": {

				"#URL": "api/geometries/BoxGeometry"

			},

			"CircleBufferGeometry": {

				"#URL": "api/geometries/CircleBufferGeometry"

			},

			"CircleGeometry": {

				"#URL": "api/geometries/CircleGeometry"

			},

			"ConeBufferGeometry": {

				"#URL": "api/geometries/ConeBufferGeometry"

			},

			"ConeGeometry": {

				"#URL": "api/geometries/ConeGeometry"

			},

			"CylinderBufferGeometry": {

				"#URL": "api/geometries/CylinderBufferGeometry"

			},

			"CylinderGeometry": {

				"#URL": "api/geometries/CylinderGeometry"

			},

			"DodecahedronBufferGeometry": {

				"#URL": "api/geometries/DodecahedronBufferGeometry",
				"parameters": "DodecahedronBufferGeometry.parameters"

			},

			"DodecahedronGeometry": {

				"#URL": "api/geometries/DodecahedronGeometry",
				"parameters": "DodecahedronGeometry.parameters"

			},

			"EdgesGeometry": {

				"#URL": "api/geometries/EdgesGeometry"

			},

			"ExtrudeGeometry": {

				"#URL": "api/geometries/ExtrudeGeometry",
				"addShapeList": "ExtrudeGeometry.addShapeList",
				"addShape": "ExtrudeGeometry.addShape"

			},

			"ExtrudeBufferGeometry": {

				"#URL": "api/geometries/ExtrudeBufferGeometry",
				"addShapeList": "ExtrudeBufferGeometry.addShapeList",
				"addShape": "ExtrudeBufferGeometry.addShape"

			},

			"IcosahedronBufferGeometry": {

				"#URL": "api/geometries/IcosahedronBufferGeometry",
				"parameters": "IcosahedronBufferGeometry.parameters"

			},

			"IcosahedronGeometry": {

				"#URL": "api/geometries/IcosahedronGeometry",
				"parameters": "IcosahedronGeometry.parameters"

			},

			"LatheBufferGeometry": {

				"#URL": "api/geometries/LatheBufferGeometry"

			},

			"LatheGeometry": {

				"#URL": "api/geometries/LatheGeometry"

			},

			"OctahedronBufferGeometry": {

				"#URL": "api/geometries/OctahedronBufferGeometry",
				"parameters": "OctahedronBufferGeometry.parameters"

			},

			"OctahedronGeometry": {

				"#URL": "api/geometries/OctahedronGeometry",
				"parameters": "OctahedronGeometry.parameters"

			},

			"ParametricBufferGeometry": {

				"#URL": "api/geometries/ParametricBufferGeometry"

			},

			"ParametricGeometry": {

				"#URL": "api/geometries/ParametricGeometry"

			},

			"PlaneBufferGeometry": {

				"#URL": "api/geometries/PlaneBufferGeometry"

			},

			"PlaneGeometry": {

				"#URL": "api/geometries/PlaneGeometry"

			},

			"PolyhedronBufferGeometry": {

				"#URL": "api/geometries/PolyhedronBufferGeometry",
				"parameters": "PolyhedronBufferGeometry.parameters"

			},

			"PolyhedronGeometry": {

				"#URL": "api/geometries/PolyhedronGeometry",
				"parameters": "PolyhedronGeometry.parameters"

			},

			"RingBufferGeometry": {

				"#URL": "api/geometries/RingBufferGeometry"

			},

			"RingGeometry": {

				"#URL": "api/geometries/RingGeometry"

			},

			"ShapeBufferGeometry": {

				"#URL": "api/geometries/ShapeBufferGeometry"

			},

			"ShapeGeometry": {

				"#URL": "api/geometries/ShapeGeometry"

			},

			"SphereBufferGeometry": {

				"#URL": "api/geometries/SphereBufferGeometry"

			},

			"SphereGeometry": {

				"#URL": "api/geometries/SphereGeometry"

			},

			"TetrahedronBufferGeometry": {

				"#URL": "api/geometries/TetrahedronBufferGeometry",
				"parameters": "TetrahedronBufferGeometry.parameters"

			},

			"TetrahedronGeometry": {

				"#URL": "api/geometries/TetrahedronGeometry",
				"parameters": "TetrahedronGeometry.parameters"

			},

			"TextBufferGeometry": {

				"#URL": "api/geometries/TextBufferGeometry"

			},

			"TextGeometry": {

				"#URL": "api/geometries/TextGeometry"

			},

			"TorusBufferGeometry": {

				"#URL": "api/geometries/TorusBufferGeometry"

			},

			"TorusGeometry": {

				"#URL": "api/geometries/TorusGeometry"

			},

			"TorusKnotBufferGeometry": {

				"#URL": "api/geometries/TorusKnotBufferGeometry"

			},

			"TorusKnotGeometry": {

				"#URL": "api/geometries/TorusKnotGeometry"

			},

			"TubeBufferGeometry": {

				"#URL": "api/geometries/TubeBufferGeometry",
				"parameters": "TubeBufferGeometry.parameters",
				"tangents": "TubeBufferGeometry.tangents",
				"normals": "TubeBufferGeometry.normals",
				"binormals": "TubeBufferGeometry.binormals"

			},

			"TubeGeometry": {

				"#URL": "api/geometries/TubeGeometry",
				"parameters": "TubeGeometry.parameters",
				"tangents": "TubeGeometry.tangents",
				"normals": "TubeGeometry.normals",
				"binormals": "TubeGeometry.binormals"

			},

			"WireframeGeometry": {

				"#URL": "api/geometries/WireframeGeometry"

			}


		},

		"Helpers": {

			"ArrowHelper": {

				"#URL": "api/helpers/ArrowHelper",
				"line": "ArrowHelper.line",
				"cone": "ArrowHelper.cone",
				"setColor": "ArrowHelper.setColor",
				"setLength": "ArrowHelper.setLength",
				"setDirection": "ArrowHelper.setDirection"

			},

			"AxesHelper": {

				"#URL": "api/helpers/AxesHelper"

			},

			"BoxHelper": {

				"#URL": "api/helpers/BoxHelper",
				"update": "BoxHelper.update",
				"setFromObject": "BoxHelper.setFromObject"

			},

			"Box3Helper": {

				"#URL": "api/helpers/Box3Helper",
				"box": "Box3Helper.box",
				"updateMatrixWorld": "Box3Helper.updateMatrixWorld"

			},

			"CameraHelper": {

				"#URL": "api/helpers/CameraHelper",
				"camera": "CameraHelper.camera",
				"pointMap": "CameraHelper.pointMap",
				"matrix": "CameraHelper.matrix",
				"matrixAutoUpdate": "CameraHelper.matrixAutoUpdate",
				"update": "CameraHelper.update"

			},

			"DirectionalLightHelper": {

				"#URL": "api/helpers/DirectionalLightHelper",
				"lightPlane": "DirectionalLightHelper.lightPlane",
				"light": "DirectionalLightHelper.light",
				"matrix": "DirectionalLightHelper.matrix",
				"matrixAutoUpdate": "DirectionalLightHelper.matrixAutoUpdate",
				"color": "DirectionalLightHelper.color",
				"dispose": "DirectionalLightHelper.dispose",
				"update": "DirectionalLightHelper.update"

			},

			"FaceNormalsHelper": {

				"#URL": "api/helpers/FaceNormalsHelper",
				"matrixAutoUpdate": "FaceNormalsHelper.matrixAutoUpdate",
				"object": "FaceNormalsHelper.object",
				"size": "FaceNormalsHelper.size",
				"update": "FaceNormalsHelper.update"

			},

			"GridHelper": {

				"#URL": "api/helpers/GridHelper"

			},

			"PolarGridHelper": {

				"#URL": "api/helpers/PolarGridHelper"

			},

			"HemisphereLightHelper": {

				"#URL": "api/helpers/HemisphereLightHelper",
				"light": "HemisphereLightHelper.light",
				"matrix": "HemisphereLightHelper.matrix",
				"matrixAutoUpdate": "HemisphereLightHelper.matrixAutoUpdate",
				"color": "HemisphereLightHelper.color",
				"dispose": "HemisphereLightHelper.dispose",
				"update": "HemisphereLightHelper.update"

			},

			"PlaneHelper": {

				"#URL": "api/helpers/PlaneHelper",
				"plane": "PlaneHelper.plane",
				"size": "PlaneHelper.size",
				"updateMatrixWorld": "PlaneHelper.updateMatrixWorld"

			},

			"PointLightHelper": {

				"#URL": "api/helpers/PointLightHelper",
				"light": "PointLightHelper.light",
				"matrix": "PointLightHelper.matrix",
				"matrixAutoUpdate": "PointLightHelper.matrixAutoUpdate",
				"color": "PointLightHelper.color",
				"dispose": "PointLightHelper.dispose",
				"update": "PointLightHelper.update"

			},

			"RectAreaLightHelper": {

				"#URL": "api/helpers/RectAreaLightHelper",
				"light": "RectAreaLightHelper.light",
				"color": "RectAreaLightHelper.color",
				"dispose": "RectAreaLightHelper.dispose",
				"update": "RectAreaLightHelper.update"

			},

			"SkeletonHelper": {

				"#URL": "api/helpers/SkeletonHelper",
				"bones": "SkeletonHelper.bones",
				"root": "SkeletonHelper.root"

			},

			"SpotLightHelper": {

				"#URL": "api/helpers/SpotLightHelper",
				"cone": "SpotLightHelper.cone",
				"light": "SpotLightHelper.light",
				"matrix": "SpotLightHelper.matrix",
				"matrixAutoUpdate": "SpotLightHelper.matrixAutoUpdate",
				"color": "SpotLightHelper.color",
				"dispose": "SpotLightHelper.dispose",
				"update": "SpotLightHelper.update"

			},

			"VertexNormalsHelper": {

				"#URL": "api/helpers/VertexNormalsHelper",
				"matrixAutoUpdate": "VertexNormalsHelper.matrixAutoUpdate",
				"object": "VertexNormalsHelper.object",
				"size": "VertexNormalsHelper.size",
				"update": "VertexNormalsHelper.update"

			}


		},

		"Lights": {

			"AmbientLight": {

				"#URL": "api/lights/AmbientLight",
				"castShadow": "AmbientLight.castShadow",
				"isAmbientLight": "AmbientLight.isAmbientLight"

			},

			"DirectionalLight": {

				"#URL": "api/lights/DirectionalLight",
				"castShadow": "DirectionalLight.castShadow",
				"isDirectionalLight": "DirectionalLight.isDirectionalLight",
				"position": "DirectionalLight.position",
				"shadow": "DirectionalLight.shadow",
				"target": "DirectionalLight.target",
				"copy": "DirectionalLight.copy"

			},

			"HemisphereLight": {

				"#URL": "api/lights/HemisphereLight",
				"castShadow": "HemisphereLight.castShadow",
				"color": "HemisphereLight.color",
				"groundColor": "HemisphereLight.groundColor",
				"isHemisphereLight": "HemisphereLight.isHemisphereLight",
				"position": "HemisphereLight.position",
				"copy": "HemisphereLight.copy"

			},

			"Light": {

				"#URL": "api/lights/Light",
				"color": "Light.color",
				"intensity": "Light.intensity",
				"isLight": "Light.isLight",
				"copy": "Light.copy",
				"toJSON": "Light.toJSON"

			},

			"PointLight": {

				"#URL": "api/lights/PointLight",
				"decay": "PointLight.decay",
				"distance": "PointLight.distance",
				"isPointLight": "PointLight.isPointLight",
				"power": "PointLight.power",
				"shadow": "PointLight.shadow",
				"copy": "PointLight.copy"

			},

			"RectAreaLight": {

				"#URL": "api/lights/RectAreaLight",
				"isRectAreaLight": "RectAreaLight.isRectAreaLight",
				"copy": "RectAreaLight.copy"

			},

			"SpotLight": {

				"#URL": "api/lights/SpotLight",
				"angle": "SpotLight.angle",
				"castShadow": "SpotLight.castShadow",
				"decay": "SpotLight.decay",
				"distance": "SpotLight.distance",
				"isSpotLight": "SpotLight.isSpotLight",
				"penumbra": "SpotLight.penumbra",
				"position": "SpotLight.position",
				"power": "SpotLight.power",
				"shadow": "SpotLight.shadow",
				"target": "SpotLight.target",
				"copy": "SpotLight.copy"

			}


		},

		"Lights / Shadows": {

			"DirectionalLightShadow": {

				"#URL": "api/lights/shadows/DirectionalLightShadow",
				"camera": "DirectionalLightShadow.camera"

			},

			"LightShadow": {

				"#URL": "api/lights/shadows/LightShadow",
				"camera": "LightShadow.camera",
				"bias": "LightShadow.bias",
				"map": "LightShadow.map",
				"mapSize": "LightShadow.mapSize",
				"matrix": "LightShadow.matrix",
				"radius": "LightShadow.radius",
				"copy": "LightShadow.copy",
				"clone": "LightShadow.clone",
				"toJSON": "LightShadow.toJSON"

			},

			"SpotLightShadow": {

				"#URL": "api/lights/shadows/SpotLightShadow",
				"camera": "SpotLightShadow.camera",
				"isSpotLightShadow": "SpotLightShadow.isSpotLightShadow",
				"update": "SpotLightShadow.update"

			}


		},

		"Loaders": {

			"AnimationLoader": {

				"#URL": "api/loaders/AnimationLoader",
				"manager": "AnimationLoader.manager",
				"load": "AnimationLoader.load",
				"parse": "AnimationLoader.parse"

			},

			"AudioLoader": {

				"#URL": "api/loaders/AudioLoader",
				"manager": "AudioLoader.manager",
				"load": "AudioLoader.load"

			},

			"BufferGeometryLoader": {

				"#URL": "api/loaders/BufferGeometryLoader",
				"manager": "BufferGeometryLoader.manager",
				"load": "BufferGeometryLoader.load",
				"parse": "BufferGeometryLoader.parse"

			},

			"Cache": {

				"#URL": "api/loaders/Cache",
				"enabled": "Cache.enabled",
				"files": "Cache.files",
				"add": "Cache.add",
				"get": "Cache.get",
				"remove": "Cache.remove",
				"clear": "Cache.clear"

			},

			"CompressedTextureLoader": {

				"#URL": "api/loaders/CompressedTextureLoader",
				"manager": "CompressedTextureLoader.manager",
				"path": "CompressedTextureLoader.path",
				"load": "CompressedTextureLoader.load",
				"setPath": "CompressedTextureLoader.setPath"

			},

			"CubeTextureLoader": {

				"#URL": "api/loaders/CubeTextureLoader",
				"crossOrigin": "CubeTextureLoader.crossOrigin",
				"manager": "CubeTextureLoader.manager",
				"path": "CubeTextureLoader.path",
				"load": "CubeTextureLoader.load",
				"setCrossOrigin": "CubeTextureLoader.setCrossOrigin",
				"setPath": "CubeTextureLoader.setPath"

			},

			"DataTextureLoader": {

				"#URL": "api/loaders/DataTextureLoader",
				"manager": "DataTextureLoader.manager",
				"load": "DataTextureLoader.load"

			},

			"FileLoader": {

				"#URL": "api/loaders/FileLoader",
				"cache": "FileLoader.cache",
				"manager": "FileLoader.manager",
				"mimeType": "FileLoader.mimeType",
				"path": "FileLoader.path",
				"responseType": "FileLoader.responseType",
				"withCredentials": "FileLoader.withCredentials",
				"load": "FileLoader.load",
				"setMimeType": "FileLoader.setMimeType",
				"setPath": "FileLoader.setPath",
				"setResponseType": "FileLoader.setResponseType",
				"setWithCredentials": "FileLoader.setWithCredentials"

			},

			"FontLoader": {

				"#URL": "api/loaders/FontLoader",
				"manager": "FontLoader.manager",
				"path": "FontLoader.path",
				"load": "FontLoader.load",
				"parse": "FontLoader.parse",
				"setPath": "FontLoader.setPath"

			},

			"ImageBitmapLoader": {

				"#URL": "api/loaders/ImageBitmapLoader",
				"manager": "ImageBitmapLoader.manager",
				"options": "ImageBitmapLoader.options",
				"path": "ImageBitmapLoader.path",
				"load": "ImageBitmapLoader.load",
				"setCrossOrigin": "ImageBitmapLoader.setCrossOrigin",
				"setOptions": "ImageBitmapLoader.setOptions",
				"setPath": "ImageBitmapLoader.setPath"

			},

			"ImageLoader": {

				"#URL": "api/loaders/ImageLoader",
				"crossOrigin": "ImageLoader.crossOrigin",
				"manager": "ImageLoader.manager",
				"path": "ImageLoader.path",
				"load": "ImageLoader.load",
				"setCrossOrigin": "ImageLoader.setCrossOrigin",
				"setPath": "ImageLoader.setPath"

			},

			"JSONLoader": {

				"#URL": "api/loaders/JSONLoader",
				"manager": "JSONLoader.manager",
				"withCredentials": "JSONLoader.withCredentials",
				"load": "JSONLoader.load",
				"setTexturePath": "JSONLoader.setTexturePath",
				"parse": "JSONLoader.parse"

			},

			"Loader": {

				"#URL": "api/loaders/Loader",
				"onLoadStart": "Loader.onLoadStart",
				"onLoadProgress": "Loader.onLoadProgress",
				"onLoadComplete": "Loader.onLoadComplete",
				"crossOrigin": "Loader.crossOrigin",
				"createMaterial": "Loader.createMaterial",
				"initMaterials": "Loader.initMaterials"

			},

			"LoaderUtils": {

				"#URL": "api/loaders/LoaderUtils",
				"decodeText": "LoaderUtils.decodeText",
				"extractUrlBase": "LoaderUtils.extractUrlBase"

			},

			"MaterialLoader": {

				"#URL": "api/loaders/MaterialLoader",
				"manager": "MaterialLoader.manager",
				"textures": "MaterialLoader.textures",
				"load": "MaterialLoader.load",
				"parse": "MaterialLoader.parse",
				"setTextures": "MaterialLoader.setTextures"

			},

			"ObjectLoader": {

				"#URL": "api/loaders/ObjectLoader",
				"crossOrigin": "ObjectLoader.crossOrigin",
				"manager": "ObjectLoader.manager",
				"texturePath": "ObjectLoader.texturePath",
				"load": "ObjectLoader.load",
				"parse": "ObjectLoader.parse",
				"parseGeometries": "ObjectLoader.parseGeometries",
				"parseMaterials": "ObjectLoader.parseMaterials",
				"parseAnimations": "ObjectLoader.parseAnimations",
				"parseImages": "ObjectLoader.parseImages",
				"parseTextures": "ObjectLoader.parseTextures",
				"parseObject": "ObjectLoader.parseObject",
				"setCrossOrigin": "ObjectLoader.setCrossOrigin",
				"setTexturePath": "ObjectLoader.setTexturePath"

			},

			"TextureLoader": {

				"#URL": "api/loaders/TextureLoader",
				"crossOrigin": "TextureLoader.crossOrigin",
				"manager": "TextureLoader.manager",
				"path": "TextureLoader.path",
				"withCredentials": "TextureLoader.withCredentials",
				"load": "TextureLoader.load",
				"setCrossOrigin": "TextureLoader.setCrossOrigin",
				"setPath": "TextureLoader.setPath",
				"setWithCredentials": "TextureLoader.setWithCredentials"

			}


		},

		"Loaders / Managers": {

			"DefaultLoadingManager": {

				"#URL": "api/loaders/managers/DefaultLoadingManager"

			},

			"LoadingManager": {

				"#URL": "api/loaders/managers/LoadingManager",
				"onStart": "LoadingManager.onStart",
				"onLoad": "LoadingManager.onLoad",
				"onProgress": "LoadingManager.onProgress",
				"onError": "LoadingManager.onError",
				"setURLModifier": "LoadingManager.setURLModifier",
				"resolveURL": "LoadingManager.resolveURL",
				"itemStart": "LoadingManager.itemStart",
				"itemEnd": "LoadingManager.itemEnd",
				"itemError": "LoadingManager.itemError"

			}


		},

		"Materials": {

			"LineBasicMaterial": {

				"#URL": "api/materials/LineBasicMaterial",
				"color": "LineBasicMaterial.color",
				"isLineBasicMaterial": "LineBasicMaterial.isLineBasicMaterial",
				"lights": "LineBasicMaterial.lights",
				"linewidth": "LineBasicMaterial.linewidth",
				"linecap": "LineBasicMaterial.linecap",
				"linejoin": "LineBasicMaterial.linejoin"

			},

			"LineDashedMaterial": {

				"#URL": "api/materials/LineDashedMaterial",
				"color": "LineDashedMaterial.color",
				"dashSize": "LineDashedMaterial.dashSize",
				"gapSize": "LineDashedMaterial.gapSize",
				"isLineDashedMaterial": "LineDashedMaterial.isLineDashedMaterial",
				"lights": "LineDashedMaterial.lights",
				"linewidth": "LineDashedMaterial.linewidth",
				"scale": "LineDashedMaterial.scale"

			},

			"Material": {

				"#URL": "api/materials/Material",
				"alphaTest": "Material.alphaTest",
				"blendDst": "Material.blendDst",
				"blending": "Material.blending",
				"blendDstAlpha": "Material.blendDstAlpha",
				"blendEquation": "Material.blendEquation",
				"blendEquationAlpha": "Material.blendEquationAlpha",
				"blendSrc": "Material.blendSrc",
				"blendSrcAlpha": "Material.blendSrcAlpha",
				"clipIntersection": "Material.clipIntersection",
				"clippingPlanes": "Material.clippingPlanes",
				"clipShadows": "Material.clipShadows",
				"colorWrite": "Material.colorWrite",
				"renderOrder": "Material.renderOrder",
				"customDepthMaterial": "Material.customDepthMaterial",
				"customDistanceMaterial": "Material.customDistanceMaterial",
				"defines": "Material.defines",
				"depthFunc": "Material.depthFunc",
				"depthTest": "Material.depthTest",
				"depthWrite": "Material.depthWrite",
				"fog": "Material.fog",
				"id": "Material.id",
				"isMaterial": "Material.isMaterial",
				"lights": "Material.lights",
				"name": "Material.name",
				"needsUpdate": "Material.needsUpdate",
				"opacity": "Material.opacity",
				"transparent": "Material.transparent",
				"overdraw": "Material.overdraw",
				"polygonOffset": "Material.polygonOffset",
				"polygonOffsetFactor": "Material.polygonOffsetFactor",
				"polygonOffsetUnits": "Material.polygonOffsetUnits",
				"precision": "Material.precision",
				"premultipliedAlpha": "Material.premultipliedAlpha",
				"dithering": "Material.dithering",
				"flatShading": "Material.flatShading",
				"side": "Material.side",
				"type": "Material.type",
				"uuid": "Material.uuid",
				"vertexColors": "Material.vertexColors",
				"visible": "Material.visible",
				"userData": "Material.userData",
				"clone": "Material.clone",
				"copy": "Material.copy",
				"dispose": "Material.dispose",
				"setValues": "Material.setValues",
				"toJSON": "Material.toJSON",
				"update": "Material.update",
				"dispatchEvent": "Material.dispatchEvent"

			},

			"MeshBasicMaterial": {

				"#URL": "api/materials/MeshBasicMaterial",
				"alphaMap": "MeshBasicMaterial.alphaMap",
				"aoMap": "MeshBasicMaterial.aoMap",
				"aoMapIntensity": "MeshBasicMaterial.aoMapIntensity",
				"color": "MeshBasicMaterial.color",
				"combine": "MeshBasicMaterial.combine",
				"isMeshBasicMaterial": "MeshBasicMaterial.isMeshBasicMaterial",
				"envMap": "MeshBasicMaterial.envMap",
				"lightMap": "MeshBasicMaterial.lightMap",
				"lightMapIntensity": "MeshBasicMaterial.lightMapIntensity",
				"lights": "MeshBasicMaterial.lights",
				"map": "MeshBasicMaterial.map",
				"morphTargets": "MeshBasicMaterial.morphTargets",
				"reflectivity": "MeshBasicMaterial.reflectivity",
				"refractionRatio": "MeshBasicMaterial.refractionRatio",
				"skinning": "MeshBasicMaterial.skinning",
				"specularMap": "MeshBasicMaterial.specularMap",
				"wireframe": "MeshBasicMaterial.wireframe",
				"wireframeLinecap": "MeshBasicMaterial.wireframeLinecap",
				"wireframeLinejoin": "MeshBasicMaterial.wireframeLinejoin",
				"wireframeLinewidth": "MeshBasicMaterial.wireframeLinewidth"

			},

			"MeshDepthMaterial": {

				"#URL": "api/materials/MeshDepthMaterial",
				"alphaMap": "MeshDepthMaterial.alphaMap",
				"depthPacking": "MeshDepthMaterial.depthPacking",
				"displacementMap": "MeshDepthMaterial.displacementMap",
				"displacementScale": "MeshDepthMaterial.displacementScale",
				"displacementBias": "MeshDepthMaterial.displacementBias",
				"fog": "MeshDepthMaterial.fog",
				"isMeshDepthMaterial": "MeshDepthMaterial.isMeshDepthMaterial",
				"lights": "MeshDepthMaterial.lights",
				"map": "MeshDepthMaterial.map",
				"morphTargets": "MeshDepthMaterial.morphTargets",
				"skinning": "MeshDepthMaterial.skinning",
				"wireframe": "MeshDepthMaterial.wireframe",
				"wireframeLinewidth": "MeshDepthMaterial.wireframeLinewidth"

			},

			"MeshLambertMaterial": {

				"#URL": "api/materials/MeshLambertMaterial",
				"alphaMap": "MeshLambertMaterial.alphaMap",
				"aoMap": "MeshLambertMaterial.aoMap",
				"aoMapIntensity": "MeshLambertMaterial.aoMapIntensity",
				"color": "MeshLambertMaterial.color",
				"combine": "MeshLambertMaterial.combine",
				"emissive": "MeshLambertMaterial.emissive",
				"emissiveMap": "MeshLambertMaterial.emissiveMap",
				"emissiveIntensity": "MeshLambertMaterial.emissiveIntensity",
				"envMap": "MeshLambertMaterial.envMap",
				"isMeshLambertMaterial": "MeshLambertMaterial.isMeshLambertMaterial",
				"lightMap": "MeshLambertMaterial.lightMap",
				"lightMapIntensity": "MeshLambertMaterial.lightMapIntensity",
				"map": "MeshLambertMaterial.map",
				"morphNormals": "MeshLambertMaterial.morphNormals",
				"morphTargets": "MeshLambertMaterial.morphTargets",
				"reflectivity": "MeshLambertMaterial.reflectivity",
				"refractionRatio": "MeshLambertMaterial.refractionRatio",
				"skinning": "MeshLambertMaterial.skinning",
				"specularMap": "MeshLambertMaterial.specularMap",
				"wireframe": "MeshLambertMaterial.wireframe",
				"wireframeLinecap": "MeshLambertMaterial.wireframeLinecap",
				"wireframeLinejoin": "MeshLambertMaterial.wireframeLinejoin",
				"wireframeLinewidth": "MeshLambertMaterial.wireframeLinewidth"

			},

			"MeshNormalMaterial": {

				"#URL": "api/materials/MeshNormalMaterial",
				"fog": "MeshNormalMaterial.fog",
				"isMeshNormalMaterial": "MeshNormalMaterial.isMeshNormalMaterial",
				"lights": "MeshNormalMaterial.lights",
				"morphTargets": "MeshNormalMaterial.morphTargets",
				"wireframe": "MeshNormalMaterial.wireframe",
				"wireframeLinewidth": "MeshNormalMaterial.wireframeLinewidth"

			},

			"MeshPhongMaterial": {

				"#URL": "api/materials/MeshPhongMaterial",
				"alphaMap": "MeshPhongMaterial.alphaMap",
				"aoMap": "MeshPhongMaterial.aoMap",
				"aoMapIntensity": "MeshPhongMaterial.aoMapIntensity",
				"bumpMap": "MeshPhongMaterial.bumpMap",
				"bumpScale": "MeshPhongMaterial.bumpScale",
				"color": "MeshPhongMaterial.color",
				"combine": "MeshPhongMaterial.combine",
				"displacementMap": "MeshPhongMaterial.displacementMap",
				"displacementScale": "MeshPhongMaterial.displacementScale",
				"displacementBias": "MeshPhongMaterial.displacementBias",
				"emissive": "MeshPhongMaterial.emissive",
				"emissiveMap": "MeshPhongMaterial.emissiveMap",
				"emissiveIntensity": "MeshPhongMaterial.emissiveIntensity",
				"envMap": "MeshPhongMaterial.envMap",
				"isMeshPhongMaterial": "MeshPhongMaterial.isMeshPhongMaterial",
				"lightMap": "MeshPhongMaterial.lightMap",
				"lightMapIntensity": "MeshPhongMaterial.lightMapIntensity",
				"map": "MeshPhongMaterial.map",
				"morphNormals": "MeshPhongMaterial.morphNormals",
				"morphTargets": "MeshPhongMaterial.morphTargets",
				"normalMap": "MeshPhongMaterial.normalMap",
				"normalScale": "MeshPhongMaterial.normalScale",
				"reflectivity": "MeshPhongMaterial.reflectivity",
				"refractionRatio": "MeshPhongMaterial.refractionRatio",
				"shininess": "MeshPhongMaterial.shininess",
				"skinning": "MeshPhongMaterial.skinning",
				"specular": "MeshPhongMaterial.specular",
				"specularMap": "MeshPhongMaterial.specularMap",
				"wireframe": "MeshPhongMaterial.wireframe",
				"wireframeLinecap": "MeshPhongMaterial.wireframeLinecap",
				"wireframeLinejoin": "MeshPhongMaterial.wireframeLinejoin",
				"wireframeLinewidth": "MeshPhongMaterial.wireframeLinewidth"

			},

			"MeshPhysicalMaterial": {

				"#URL": "api/materials/MeshPhysicalMaterial",
				"clearCoat": "MeshPhysicalMaterial.clearCoat",
				"clearCoatRoughness": "MeshPhysicalMaterial.clearCoatRoughness",
				"isMeshPhysicalMaterial": "MeshPhysicalMaterial.isMeshPhysicalMaterial",
				"defines": "MeshPhysicalMaterial.defines",
				"reflectivity": "MeshPhysicalMaterial.reflectivity"

			},

			"MeshStandardMaterial": {

				"#URL": "api/materials/MeshStandardMaterial",
				"alphaMap": "MeshStandardMaterial.alphaMap",
				"aoMap": "MeshStandardMaterial.aoMap",
				"aoMapIntensity": "MeshStandardMaterial.aoMapIntensity",
				"bumpMap": "MeshStandardMaterial.bumpMap",
				"bumpScale": "MeshStandardMaterial.bumpScale",
				"color": "MeshStandardMaterial.color",
				"defines": "MeshStandardMaterial.defines",
				"displacementMap": "MeshStandardMaterial.displacementMap",
				"displacementScale": "MeshStandardMaterial.displacementScale",
				"displacementBias": "MeshStandardMaterial.displacementBias",
				"emissive": "MeshStandardMaterial.emissive",
				"emissiveMap": "MeshStandardMaterial.emissiveMap",
				"emissiveIntensity": "MeshStandardMaterial.emissiveIntensity",
				"envMap": "MeshStandardMaterial.envMap",
				"envMapIntensity": "MeshStandardMaterial.envMapIntensity",
				"isMeshStandardMaterial": "MeshStandardMaterial.isMeshStandardMaterial",
				"lightMap": "MeshStandardMaterial.lightMap",
				"lightMapIntensity": "MeshStandardMaterial.lightMapIntensity",
				"map": "MeshStandardMaterial.map",
				"metalness": "MeshStandardMaterial.metalness",
				"metalnessMap": "MeshStandardMaterial.metalnessMap",
				"morphNormals": "MeshStandardMaterial.morphNormals",
				"morphTargets": "MeshStandardMaterial.morphTargets",
				"normalMap": "MeshStandardMaterial.normalMap",
				"normalScale": "MeshStandardMaterial.normalScale",
				"refractionRatio": "MeshStandardMaterial.refractionRatio",
				"roughness": "MeshStandardMaterial.roughness",
				"roughnessMap": "MeshStandardMaterial.roughnessMap",
				"skinning": "MeshStandardMaterial.skinning",
				"wireframe": "MeshStandardMaterial.wireframe",
				"wireframeLinecap": "MeshStandardMaterial.wireframeLinecap",
				"wireframeLinejoin": "MeshStandardMaterial.wireframeLinejoin",
				"wireframeLinewidth": "MeshStandardMaterial.wireframeLinewidth"

			},

			"MeshToonMaterial": {

				"#URL": "api/materials/MeshToonMaterial",
				"gradientMap": "MeshToonMaterial.gradientMap",
				"isMeshToonMaterial": "MeshToonMaterial.isMeshToonMaterial",
				"defines": "MeshToonMaterial.defines"

			},

			"PointsMaterial": {

				"#URL": "api/materials/PointsMaterial",
				"color": "PointsMaterial.color",
				"isPointsMaterial": "PointsMaterial.isPointsMaterial",
				"lights": "PointsMaterial.lights",
				"map": "PointsMaterial.map",
				"size": "PointsMaterial.size",
				"sizeAttenuation": "PointsMaterial.sizeAttenuation"

			},

			"RawShaderMaterial": {

				"#URL": "api/materials/RawShaderMaterial",
				"isRawShaderMaterial": "RawShaderMaterial.isRawShaderMaterial"

			},

			"ShaderMaterial": {

				"#URL": "api/materials/ShaderMaterial",
				"clipping": "ShaderMaterial.clipping",
				"defaultAttributeValues": "ShaderMaterial.defaultAttributeValues",
				"defines": "ShaderMaterial.defines",
				"extensions": "ShaderMaterial.extensions",
				"fog": "ShaderMaterial.fog",
				"fragmentShader": "ShaderMaterial.fragmentShader",
				"index0AttributeName": "ShaderMaterial.index0AttributeName",
				"isShaderMaterial": "ShaderMaterial.isShaderMaterial",
				"lights": "ShaderMaterial.lights",
				"linewidth": "ShaderMaterial.linewidth",
				"morphTargets": "ShaderMaterial.morphTargets",
				"morphNormals": "ShaderMaterial.morphNormals",
				"program": "ShaderMaterial.program",
				"flatShading": "ShaderMaterial.flatShading",
				"skinning": "ShaderMaterial.skinning",
				"uniforms": "ShaderMaterial.uniforms",
				"vertexColors": "ShaderMaterial.vertexColors",
				"vertexShader": "ShaderMaterial.vertexShader",
				"wireframe": "ShaderMaterial.wireframe",
				"wireframeLinewidth": "ShaderMaterial.wireframeLinewidth",
				"clone": "ShaderMaterial.clone"

			},

			"ShadowMaterial": {

				"#URL": "api/materials/ShadowMaterial",
				"isShadowMaterial": "ShadowMaterial.isShadowMaterial",
				"lights": "ShadowMaterial.lights",
				"transparent": "ShadowMaterial.transparent"

			},

			"SpriteMaterial": {

				"#URL": "api/materials/SpriteMaterial",
				"color": "SpriteMaterial.color",
				"fog": "SpriteMaterial.fog",
				"lights": "SpriteMaterial.lights",
				"map": "SpriteMaterial.map",
				"rotation": "SpriteMaterial.rotation"

			}


		},

		"Math": {

			"Box2": {

				"#URL": "api/math/Box2",
				"min": "Box2.min",
				"max": "Box2.max",
				"clampPoint": "Box2.clampPoint",
				"clone": "Box2.clone",
				"containsBox": "Box2.containsBox",
				"containsPoint": "Box2.containsPoint",
				"copy": "Box2.copy",
				"distanceToPoint": "Box2.distanceToPoint",
				"equals": "Box2.equals",
				"expandByPoint": "Box2.expandByPoint",
				"expandByScalar": "Box2.expandByScalar",
				"expandByVector": "Box2.expandByVector",
				"getCenter": "Box2.getCenter",
				"getParameter": "Box2.getParameter",
				"getSize": "Box2.getSize",
				"intersect": "Box2.intersect",
				"intersectsBox": "Box2.intersectsBox",
				"isEmpty": "Box2.isEmpty",
				"makeEmpty": "Box2.makeEmpty",
				"set": "Box2.set",
				"setFromCenterAndSize": "Box2.setFromCenterAndSize",
				"setFromPoints": "Box2.setFromPoints",
				"translate": "Box2.translate",
				"union": "Box2.union"

			},

			"Box3": {

				"#URL": "api/math/Box3",
				"isBox3": "Box3.isBox3",
				"min": "Box3.min",
				"max": "Box3.max",
				"applyMatrix4": "Box3.applyMatrix4",
				"clampPoint": "Box3.clampPoint",
				"clone": "Box3.clone",
				"containsBox": "Box3.containsBox",
				"containsPoint": "Box3.containsPoint",
				"copy": "Box3.copy",
				"distanceToPoint": "Box3.distanceToPoint",
				"equals": "Box3.equals",
				"expandByObject": "Box3.expandByObject",
				"expandByPoint": "Box3.expandByPoint",
				"expandByScalar": "Box3.expandByScalar",
				"expandByVector": "Box3.expandByVector",
				"getBoundingSphere": "Box3.getBoundingSphere",
				"getCenter": "Box3.getCenter",
				"getParameter": "Box3.getParameter",
				"getSize": "Box3.getSize",
				"intersect": "Box3.intersect",
				"intersectsBox": "Box3.intersectsBox",
				"intersectsPlane": "Box3.intersectsPlane",
				"intersectsSphere": "Box3.intersectsSphere",
				"isEmpty": "Box3.isEmpty",
				"makeEmpty": "Box3.makeEmpty",
				"set": "Box3.set",
				"setFromArray": "Box3.setFromArray",
				"setFromBufferAttribute": "Box3.setFromBufferAttribute",
				"setFromCenterAndSize": "Box3.setFromCenterAndSize",
				"setFromObject": "Box3.setFromObject",
				"setFromPoints": "Box3.setFromPoints",
				"translate": "Box3.translate",
				"union": "Box3.union"

			},

			"Color": {

				"#URL": "api/math/Color",
				"isColor": "Color.isColor",
				"r": "Color.r",
				"g": "Color.g",
				"b": "Color.b",
				"add": "Color.add",
				"addColors": "Color.addColors",
				"addScalar": "Color.addScalar",
				"clone": "Color.clone",
				"copy": "Color.copy",
				"convertGammaToLinear": "Color.convertGammaToLinear",
				"convertLinearToGamma": "Color.convertLinearToGamma",
				"copyGammaToLinear": "Color.copyGammaToLinear",
				"copyLinearToGamma": "Color.copyLinearToGamma",
				"equals": "Color.equals",
				"fromArray": "Color.fromArray",
				"getHex": "Color.getHex",
				"getHexString": "Color.getHexString",
				"getHSL": "Color.getHSL",
				"getStyle": "Color.getStyle",
				"lerp": "Color.lerp",
				"multiply": "Color.multiply",
				"multiplyScalar": "Color.multiplyScalar",
				"offsetHSL": "Color.offsetHSL",
				"set": "Color.set",
				"setHex": "Color.setHex",
				"setHSL": "Color.setHSL",
				"setRGB": "Color.setRGB",
				"setScalar": "Color.setScalar",
				"setStyle": "Color.setStyle",
				"sub": "Color.sub",
				"toArray": "Color.toArray"

			},

			"Cylindrical": {

				"#URL": "api/math/Cylindrical",
				"radius": "Cylindrical.radius",
				"theta": "Cylindrical.theta",
				"y": "Cylindrical.y",
				"clone": "Cylindrical.clone",
				"copy": "Cylindrical.copy",
				"set": "Cylindrical.set",
				"setFromVector3": "Cylindrical.setFromVector3"

			},

			"Euler": {

				"#URL": "api/math/Euler",
				"isEuler": "Euler.isEuler",
				"order": "Euler.order",
				"x": "Euler.x",
				"y": "Euler.y",
				"z": "Euler.z",
				"copy": "Euler.copy",
				"clone": "Euler.clone",
				"equals": "Euler.equals",
				"fromArray": "Euler.fromArray",
				"onChange": "Euler.onChange",
				"onChangeCallback": "Euler.onChangeCallback",
				"reorder": "Euler.reorder",
				"set": "Euler.set",
				"setFromRotationMatrix": "Euler.setFromRotationMatrix",
				"setFromQuaternion": "Euler.setFromQuaternion",
				"setFromVector3": "Euler.setFromVector3",
				"toArray": "Euler.toArray",
				"toVector3": "Euler.toVector3"

			},

			"Frustum": {

				"#URL": "api/math/Frustum",
				"planes": "Frustum.planes",
				"clone": "Frustum.clone",
				"containsPoint": "Frustum.containsPoint",
				"copy": "Frustum.copy",
				"intersectsBox": "Frustum.intersectsBox",
				"intersectsObject": "Frustum.intersectsObject",
				"intersectsSphere": "Frustum.intersectsSphere",
				"intersectsSprite": "Frustum.intersectsSprite",
				"set": "Frustum.set",
				"setFromMatrix": "Frustum.setFromMatrix"

			},

			"Interpolant": {

				"#URL": "api/math/Interpolant",
				"parameterPositions": "Interpolant.parameterPositions",
				"resultBuffer": "Interpolant.resultBuffer",
				"sampleValues": "Interpolant.sampleValues",
				"settings": "Interpolant.settings",
				"valueSize": "Interpolant.valueSize",
				"evaluate": "Interpolant.evaluate"

			},

			"Line3": {

				"#URL": "api/math/Line3",
				"start": "Line3.start",
				"end": "Line3.end",
				"applyMatrix4": "Line3.applyMatrix4",
				"at": "Line3.at",
				"clone": "Line3.clone",
				"closestPointToPoint": "Line3.closestPointToPoint",
				"closestPointToPointParameter": "Line3.closestPointToPointParameter",
				"copy": "Line3.copy",
				"delta": "Line3.delta",
				"distance": "Line3.distance",
				"distanceSq": "Line3.distanceSq",
				"equals": "Line3.equals",
				"getCenter": "Line3.getCenter",
				"set": "Line3.set"

			},

			"Math": {

				"#URL": "api/math/Math",
				"clamp": "Math.clamp",
				"degToRad": "Math.degToRad",
				"euclideanModulo": "Math.euclideanModulo",
				"generateUUID": "Math.generateUUID",
				"isPowerOfTwo": "Math.isPowerOfTwo",
				"lerp": "Math.lerp",
				"mapLinear": "Math.mapLinear",
				"ceilPowerOfTwo": "Math.ceilPowerOfTwo",
				"floorPowerOfTwo": "Math.floorPowerOfTwo",
				"radToDeg": "Math.radToDeg",
				"randFloat": "Math.randFloat",
				"randFloatSpread": "Math.randFloatSpread",
				"randInt": "Math.randInt",
				"smoothstep": "Math.smoothstep",
				"smootherstep": "Math.smootherstep"

			},

			"Matrix3": {

				"#URL": "api/math/Matrix3",
				"elements": "Matrix3.elements",
				"isMatrix3": "Matrix3.isMatrix3",
				"applyToBufferAttribute": "Matrix3.applyToBufferAttribute",
				"clone": "Matrix3.clone",
				"copy": "Matrix3.copy",
				"determinant": "Matrix3.determinant",
				"equals": "Matrix3.equals",
				"fromArray": "Matrix3.fromArray",
				"getInverse": "Matrix3.getInverse",
				"getNormalMatrix": "Matrix3.getNormalMatrix",
				"identity": "Matrix3.identity",
				"multiply": "Matrix3.multiply",
				"multiplyMatrices": "Matrix3.multiplyMatrices",
				"multiplyScalar": "Matrix3.multiplyScalar",
				"set": "Matrix3.set",
				"premultiply": "Matrix3.premultiply",
				"setFromMatrix4": "Matrix3.setFromMatrix4",
				"setUvTransform": "Matrix3.setUvTransform",
				"toArray": "Matrix3.toArray",
				"transpose": "Matrix3.transpose",
				"transposeIntoArray": "Matrix3.transposeIntoArray"

			},

			"Matrix4": {

				"#URL": "api/math/Matrix4",
				"elements": "Matrix4.elements",
				"isMatrix4": "Matrix4.isMatrix4",
				"applyToBufferAttribute": "Matrix4.applyToBufferAttribute",
				"clone": "Matrix4.clone",
				"compose": "Matrix4.compose",
				"copy": "Matrix4.copy",
				"copyPosition": "Matrix4.copyPosition",
				"decompose": "Matrix4.decompose",
				"determinant": "Matrix4.determinant",
				"equals": "Matrix4.equals",
				"extractBasis": "Matrix4.extractBasis",
				"extractRotation": "Matrix4.extractRotation",
				"fromArray": "Matrix4.fromArray",
				"getInverse": "Matrix4.getInverse",
				"getMaxScaleOnAxis": "Matrix4.getMaxScaleOnAxis",
				"identity": "Matrix4.identity",
				"lookAt": "Matrix4.lookAt",
				"makeRotationAxis": "Matrix4.makeRotationAxis",
				"makeBasis": "Matrix4.makeBasis",
				"makePerspective": "Matrix4.makePerspective",
				"makeOrthographic": "Matrix4.makeOrthographic",
				"makeRotationFromEuler": "Matrix4.makeRotationFromEuler",
				"makeRotationFromQuaternion": "Matrix4.makeRotationFromQuaternion",
				"makeRotationX": "Matrix4.makeRotationX",
				"makeRotationY": "Matrix4.makeRotationY",
				"makeRotationZ": "Matrix4.makeRotationZ",
				"makeScale": "Matrix4.makeScale",
				"makeShear": "Matrix4.makeShear",
				"makeTranslation": "Matrix4.makeTranslation",
				"multiply": "Matrix4.multiply",
				"multiplyMatrices": "Matrix4.multiplyMatrices",
				"multiplyScalar": "Matrix4.multiplyScalar",
				"premultiply": "Matrix4.premultiply",
				"scale": "Matrix4.scale",
				"set": "Matrix4.set",
				"setPosition": "Matrix4.setPosition",
				"toArray": "Matrix4.toArray",
				"transpose": "Matrix4.transpose"

			},

			"Plane": {

				"#URL": "api/math/Plane",
				"normal": "Plane.normal",
				"constant": "Plane.constant",
				"applyMatrix4": "Plane.applyMatrix4",
				"clone": "Plane.clone",
				"coplanarPoint": "Plane.coplanarPoint",
				"copy": "Plane.copy",
				"distanceToPoint": "Plane.distanceToPoint",
				"distanceToSphere": "Plane.distanceToSphere",
				"equals": "Plane.equals",
				"intersectLine": "Plane.intersectLine",
				"intersectsBox": "Plane.intersectsBox",
				"intersectsLine": "Plane.intersectsLine",
				"intersectsSphere": "Plane.intersectsSphere",
				"negate": "Plane.negate",
				"normalize": "Plane.normalize",
				"projectPoint": "Plane.projectPoint",
				"set": "Plane.set",
				"setComponents": "Plane.setComponents",
				"setFromCoplanarPoints": "Plane.setFromCoplanarPoints",
				"setFromNormalAndCoplanarPoint": "Plane.setFromNormalAndCoplanarPoint",
				"translate": "Plane.translate"

			},

			"Quaternion": {

				"#URL": "api/math/Quaternion",
				"x": "Quaternion.x",
				"y": "Quaternion.y",
				"z": "Quaternion.z",
				"w": "Quaternion.w",
				"clone": "Quaternion.clone",
				"conjugate": "Quaternion.conjugate",
				"copy": "Quaternion.copy",
				"equals": "Quaternion.equals",
				"dot": "Quaternion.dot",
				"fromArray": "Quaternion.fromArray",
				"inverse": "Quaternion.inverse",
				"length": "Quaternion.length",
				"lengthSq": "Quaternion.lengthSq",
				"normalize": "Quaternion.normalize",
				"multiply": "Quaternion.multiply",
				"multiplyQuaternions": "Quaternion.multiplyQuaternions",
				"onChange": "Quaternion.onChange",
				"onChangeCallback": "Quaternion.onChangeCallback",
				"premultiply": "Quaternion.premultiply",
				"slerp": "Quaternion.slerp",
				"set": "Quaternion.set",
				"setFromAxisAngle": "Quaternion.setFromAxisAngle",
				"setFromEuler": "Quaternion.setFromEuler",
				"setFromRotationMatrix": "Quaternion.setFromRotationMatrix",
				"setFromUnitVectors": "Quaternion.setFromUnitVectors",
				"toArray": "Quaternion.toArray",
				"slerpFlat": "Quaternion.slerpFlat"

			},

			"Ray": {

				"#URL": "api/math/Ray",
				"origin": "Ray.origin",
				"direction": "Ray.direction",
				"applyMatrix4": "Ray.applyMatrix4",
				"at": "Ray.at",
				"clone": "Ray.clone",
				"closestPointToPoint": "Ray.closestPointToPoint",
				"copy": "Ray.copy",
				"distanceSqToPoint": "Ray.distanceSqToPoint",
				"distanceSqToSegment": "Ray.distanceSqToSegment",
				"distanceToPlane": "Ray.distanceToPlane",
				"distanceToPoint": "Ray.distanceToPoint",
				"equals": "Ray.equals",
				"intersectBox": "Ray.intersectBox",
				"intersectPlane": "Ray.intersectPlane",
				"intersectSphere": "Ray.intersectSphere",
				"intersectTriangle": "Ray.intersectTriangle",
				"intersectsBox": "Ray.intersectsBox",
				"intersectsPlane": "Ray.intersectsPlane",
				"intersectsSphere": "Ray.intersectsSphere",
				"lookAt": "Ray.lookAt",
				"recast": "Ray.recast",
				"set": "Ray.set"

			},

			"Sphere": {

				"#URL": "api/math/Sphere",
				"center": "Sphere.center",
				"radius": "Sphere.radius",
				"applyMatrix4": "Sphere.applyMatrix4",
				"clampPoint": "Sphere.clampPoint",
				"clone": "Sphere.clone",
				"containsPoint": "Sphere.containsPoint",
				"copy": "Sphere.copy",
				"distanceToPoint": "Sphere.distanceToPoint",
				"empty": "Sphere.empty",
				"equals": "Sphere.equals",
				"getBoundingBox": "Sphere.getBoundingBox",
				"intersectsBox": "Sphere.intersectsBox",
				"intersectsPlane": "Sphere.intersectsPlane",
				"intersectsSphere": "Sphere.intersectsSphere",
				"set": "Sphere.set",
				"setFromPoints": "Sphere.setFromPoints",
				"translate": "Sphere.translate"

			},

			"Spherical": {

				"#URL": "api/math/Spherical",
				"radius": "Spherical.radius",
				"phi": "Spherical.phi",
				"theta": "Spherical.theta",
				"clone": "Spherical.clone",
				"copy": "Spherical.copy",
				"makeSafe": "Spherical.makeSafe",
				"set": "Spherical.set",
				"setFromVector3": "Spherical.setFromVector3"

			},

			"Triangle": {

				"#URL": "api/math/Triangle",
				"a": "Triangle.a",
				"b": "Triangle.b",
				"c": "Triangle.c",
				"area": "Triangle.area",
				"barycoordFromPoint": "Triangle.barycoordFromPoint",
				"clone": "Triangle.clone",
				"closestPointToPoint": "Triangle.closestPointToPoint",
				"containsPoint": "Triangle.containsPoint",
				"copy": "Triangle.copy",
				"equals": "Triangle.equals",
				"midpoint": "Triangle.midpoint",
				"normal": "Triangle.normal",
				"plane": "Triangle.plane",
				"set": "Triangle.set",
				"setFromPointsAndIndices": "Triangle.setFromPointsAndIndices"

			},

			"Vector2": {

				"#URL": "api/math/Vector2",
				"isVector2": "Vector2.isVector2",
				"height": "Vector2.height",
				"width": "Vector2.width",
				"x": "Vector2.x",
				"y": "Vector2.y",
				"add": "Vector2.add",
				"addScalar": "Vector2.addScalar",
				"addScaledVector": "Vector2.addScaledVector",
				"addVectors": "Vector2.addVectors",
				"angle": "Vector2.angle",
				"applyMatrix3": "Vector2.applyMatrix3",
				"ceil": "Vector2.ceil",
				"clamp": "Vector2.clamp",
				"clampLength": "Vector2.clampLength",
				"clampScalar": "Vector2.clampScalar",
				"clone": "Vector2.clone",
				"copy": "Vector2.copy",
				"distanceTo": "Vector2.distanceTo",
				"manhattanDistanceTo": "Vector2.manhattanDistanceTo",
				"distanceToSquared": "Vector2.distanceToSquared",
				"divide": "Vector2.divide",
				"divideScalar": "Vector2.divideScalar",
				"dot": "Vector2.dot",
				"equals": "Vector2.equals",
				"floor": "Vector2.floor",
				"fromArray": "Vector2.fromArray",
				"fromBufferAttribute": "Vector2.fromBufferAttribute",
				"getComponent": "Vector2.getComponent",
				"length": "Vector2.length",
				"manhattanLength": "Vector2.manhattanLength",
				"lengthSq": "Vector2.lengthSq",
				"lerp": "Vector2.lerp",
				"lerpVectors": "Vector2.lerpVectors",
				"negate": "Vector2.negate",
				"normalize": "Vector2.normalize",
				"max": "Vector2.max",
				"min": "Vector2.min",
				"multiply": "Vector2.multiply",
				"multiplyScalar": "Vector2.multiplyScalar",
				"rotateAround": "Vector2.rotateAround",
				"round": "Vector2.round",
				"roundToZero": "Vector2.roundToZero",
				"set": "Vector2.set",
				"setComponent": "Vector2.setComponent",
				"setLength": "Vector2.setLength",
				"setScalar": "Vector2.setScalar",
				"setX": "Vector2.setX",
				"setY": "Vector2.setY",
				"sub": "Vector2.sub",
				"subScalar": "Vector2.subScalar",
				"subVectors": "Vector2.subVectors",
				"toArray": "Vector2.toArray"

			},

			"Vector3": {

				"#URL": "api/math/Vector3",
				"isVector3": "Vector3.isVector3",
				"x": "Vector3.x",
				"y": "Vector3.y",
				"z": "Vector3.z",
				"add": "Vector3.add",
				"addScalar": "Vector3.addScalar",
				"addScaledVector": "Vector3.addScaledVector",
				"addVectors": "Vector3.addVectors",
				"applyAxisAngle": "Vector3.applyAxisAngle",
				"applyEuler": "Vector3.applyEuler",
				"applyMatrix3": "Vector3.applyMatrix3",
				"applyMatrix4": "Vector3.applyMatrix4",
				"applyQuaternion": "Vector3.applyQuaternion",
				"angleTo": "Vector3.angleTo",
				"ceil": "Vector3.ceil",
				"clamp": "Vector3.clamp",
				"clampLength": "Vector3.clampLength",
				"clampScalar": "Vector3.clampScalar",
				"clone": "Vector3.clone",
				"copy": "Vector3.copy",
				"cross": "Vector3.cross",
				"crossVectors": "Vector3.crossVectors",
				"distanceTo": "Vector3.distanceTo",
				"manhattanDistanceTo": "Vector3.manhattanDistanceTo",
				"distanceToSquared": "Vector3.distanceToSquared",
				"divide": "Vector3.divide",
				"divideScalar": "Vector3.divideScalar",
				"dot": "Vector3.dot",
				"equals": "Vector3.equals",
				"floor": "Vector3.floor",
				"fromArray": "Vector3.fromArray",
				"fromBufferAttribute": "Vector3.fromBufferAttribute",
				"getComponent": "Vector3.getComponent",
				"length": "Vector3.length",
				"manhattanLength": "Vector3.manhattanLength",
				"lengthSq": "Vector3.lengthSq",
				"lerp": "Vector3.lerp",
				"lerpVectors": "Vector3.lerpVectors",
				"negate": "Vector3.negate",
				"normalize": "Vector3.normalize",
				"max": "Vector3.max",
				"min": "Vector3.min",
				"multiply": "Vector3.multiply",
				"multiplyScalar": "Vector3.multiplyScalar",
				"multiplyVectors": "Vector3.multiplyVectors",
				"project": "Vector3.project",
				"projectOnPlane": "Vector3.projectOnPlane",
				"projectOnVector": "Vector3.projectOnVector",
				"reflect": "Vector3.reflect",
				"round": "Vector3.round",
				"roundToZero": "Vector3.roundToZero",
				"set": "Vector3.set",
				"setComponent": "Vector3.setComponent",
				"setFromCylindrical": "Vector3.setFromCylindrical",
				"setFromMatrixColumn": "Vector3.setFromMatrixColumn",
				"setFromMatrixPosition": "Vector3.setFromMatrixPosition",
				"setFromMatrixScale": "Vector3.setFromMatrixScale",
				"setFromSpherical": "Vector3.setFromSpherical",
				"setLength": "Vector3.setLength",
				"setScalar": "Vector3.setScalar",
				"setX": "Vector3.setX",
				"setY": "Vector3.setY",
				"setZ": "Vector3.setZ",
				"sub": "Vector3.sub",
				"subScalar": "Vector3.subScalar",
				"subVectors": "Vector3.subVectors",
				"toArray": "Vector3.toArray",
				"transformDirection": "Vector3.transformDirection",
				"unproject": "Vector3.unproject"

			},

			"Vector4": {

				"#URL": "api/math/Vector4",
				"isVector4": "Vector4.isVector4",
				"x": "Vector4.x",
				"y": "Vector4.y",
				"z": "Vector4.z",
				"w": "Vector4.w",
				"add": "Vector4.add",
				"addScalar": "Vector4.addScalar",
				"addScaledVector": "Vector4.addScaledVector",
				"addVectors": "Vector4.addVectors",
				"applyMatrix4": "Vector4.applyMatrix4",
				"ceil": "Vector4.ceil",
				"clamp": "Vector4.clamp",
				"clampLength": "Vector4.clampLength",
				"clampScalar": "Vector4.clampScalar",
				"clone": "Vector4.clone",
				"copy": "Vector4.copy",
				"divideScalar": "Vector4.divideScalar",
				"dot": "Vector4.dot",
				"equals": "Vector4.equals",
				"floor": "Vector4.floor",
				"fromArray": "Vector4.fromArray",
				"fromBufferAttribute": "Vector4.fromBufferAttribute",
				"getComponent": "Vector4.getComponent",
				"length": "Vector4.length",
				"manhattanLength": "Vector4.manhattanLength",
				"lengthSq": "Vector4.lengthSq",
				"lerp": "Vector4.lerp",
				"lerpVectors": "Vector4.lerpVectors",
				"negate": "Vector4.negate",
				"normalize": "Vector4.normalize",
				"max": "Vector4.max",
				"min": "Vector4.min",
				"multiplyScalar": "Vector4.multiplyScalar",
				"round": "Vector4.round",
				"roundToZero": "Vector4.roundToZero",
				"set": "Vector4.set",
				"setAxisAngleFromQuaternion": "Vector4.setAxisAngleFromQuaternion",
				"setAxisAngleFromRotationMatrix": "Vector4.setAxisAngleFromRotationMatrix",
				"setComponent": "Vector4.setComponent",
				"setLength": "Vector4.setLength",
				"setScalar": "Vector4.setScalar",
				"setX": "Vector4.setX",
				"setY": "Vector4.setY",
				"setZ": "Vector4.setZ",
				"setW": "Vector4.setW",
				"sub": "Vector4.sub",
				"subScalar": "Vector4.subScalar",
				"subVectors": "Vector4.subVectors",
				"toArray": "Vector4.toArray"

			}


		},

		"Math / Interpolants": {

			"CubicInterpolant": {

				"#URL": "api/math/interpolants/CubicInterpolant",
				"parameterPositions": "CubicInterpolant.parameterPositions",
				"resultBuffer": "CubicInterpolant.resultBuffer",
				"sampleValues": "CubicInterpolant.sampleValues",
				"settings": "CubicInterpolant.settings",
				"valueSize": "CubicInterpolant.valueSize",
				"evaluate": "CubicInterpolant.evaluate"

			},

			"DiscreteInterpolant": {

				"#URL": "api/math/interpolants/DiscreteInterpolant",
				"parameterPositions": "DiscreteInterpolant.parameterPositions",
				"resultBuffer": "DiscreteInterpolant.resultBuffer",
				"sampleValues": "DiscreteInterpolant.sampleValues",
				"settings": "DiscreteInterpolant.settings",
				"valueSize": "DiscreteInterpolant.valueSize",
				"evaluate": "DiscreteInterpolant.evaluate"

			},

			"LinearInterpolant": {

				"#URL": "api/math/interpolants/LinearInterpolant",
				"parameterPositions": "LinearInterpolant.parameterPositions",
				"resultBuffer": "LinearInterpolant.resultBuffer",
				"sampleValues": "LinearInterpolant.sampleValues",
				"settings": "LinearInterpolant.settings",
				"valueSize": "LinearInterpolant.valueSize",
				"evaluate": "LinearInterpolant.evaluate"

			},

			"QuaternionLinearInterpolant": {

				"#URL": "api/math/interpolants/QuaternionLinearInterpolant",
				"parameterPositions": "QuaternionLinearInterpolant.parameterPositions",
				"resultBuffer": "QuaternionLinearInterpolant.resultBuffer",
				"sampleValues": "QuaternionLinearInterpolant.sampleValues",
				"settings": "QuaternionLinearInterpolant.settings",
				"valueSize": "QuaternionLinearInterpolant.valueSize",
				"evaluate": "QuaternionLinearInterpolant.evaluate"

			}


		},

		"Objects": {

			"Bone": {

				"#URL": "api/objects/Bone",
				"isBone": "Bone.isBone",
				"type": "Bone.type"

			},

			"Group": {

				"#URL": "api/objects/Group",
				"type": "Group.type"

			},

			"LensFlare": {

				"#URL": "api/objects/LensFlare",
				"isLensFlare": "LensFlare.isLensFlare",
				"lensFlares": "LensFlare.lensFlares",
				"positionScreen": "LensFlare.positionScreen",
				"customUpdateCallback": "LensFlare.customUpdateCallback",
				"add": "LensFlare.add",
				"clone": "LensFlare.clone",
				"copy": "LensFlare.copy",
				"updateLensFlares": "LensFlare.updateLensFlares"

			},

			"Line": {

				"#URL": "api/objects/Line",
				"isLine": "Line.isLine",
				"geometry": "Line.geometry",
				"material": "Line.material",
				"raycast": "Line.raycast",
				"clone": "Line.clone"

			},

			"LineLoop": {

				"#URL": "api/objects/LineLoop",
				"isLineLoop": "LineLoop.isLineLoop"

			},

			"LineSegments": {

				"#URL": "api/objects/LineSegments",
				"isLineSegments": "LineSegments.isLineSegments"

			},

			"LOD": {

				"#URL": "api/objects/LOD",
				"levels": "LOD.levels",
				"addLevel": "LOD.addLevel",
				"clone": "LOD.clone",
				"getObjectForDistance": "LOD.getObjectForDistance",
				"raycast": "LOD.raycast",
				"toJSON": "LOD.toJSON",
				"update": "LOD.update"

			},

			"Mesh": {

				"#URL": "api/objects/Mesh",
				"drawMode": "Mesh.drawMode",
				"isMesh": "Mesh.isMesh",
				"geometry": "Mesh.geometry",
				"material": "Mesh.material",
				"morphTargetInfluences": "Mesh.morphTargetInfluences",
				"morphTargetDictionary": "Mesh.morphTargetDictionary",
				"setDrawMode": "Mesh.setDrawMode",
				"clone": "Mesh.clone",
				"raycast": "Mesh.raycast",
				"updateMorphTargets": "Mesh.updateMorphTargets"

			},

			"Points": {

				"#URL": "api/objects/Points",
				"geometry": "Points.geometry",
				"isPoints": "Points.isPoints",
				"material": "Points.material",
				"raycast": "Points.raycast",
				"clone": "Points.clone"

			},

			"Skeleton": {

				"#URL": "api/objects/Skeleton",
				"bones": "Skeleton.bones",
				"boneInverses": "Skeleton.boneInverses",
				"boneMatrices": "Skeleton.boneMatrices",
				"boneTexture": "Skeleton.boneTexture",
				"clone": "Skeleton.clone",
				"calculateInverses": "Skeleton.calculateInverses",
				"pose": "Skeleton.pose",
				"update": "Skeleton.update"

			},

			"SkinnedMesh": {

				"#URL": "api/objects/SkinnedMesh",
				"bindMode": "SkinnedMesh.bindMode",
				"bindMatrix": "SkinnedMesh.bindMatrix",
				"bindMatrixInverse": "SkinnedMesh.bindMatrixInverse",
				"isSkinnedMesh": "SkinnedMesh.isSkinnedMesh",
				"skeleton": "SkinnedMesh.skeleton",
				"bind": "SkinnedMesh.bind",
				"clone": "SkinnedMesh.clone",
				"normalizeSkinWeights": "SkinnedMesh.normalizeSkinWeights",
				"pose": "SkinnedMesh.pose",
				"updateMatrixWorld": "SkinnedMesh.updateMatrixWorld",
				"initBones": "SkinnedMesh.initBones"

			},

			"Sprite": {

				"#URL": "api/objects/Sprite",
				"isSprite": "Sprite.isSprite",
				"material": "Sprite.material",
				"clone": "Sprite.clone",
				"raycast": "Sprite.raycast"

			}


		},

		"Renderers": {

			"WebGLRenderer": {

				"#URL": "api/renderers/WebGLRenderer",
				"autoClear": "WebGLRenderer.autoClear",
				"autoClearColor": "WebGLRenderer.autoClearColor",
				"autoClearDepth": "WebGLRenderer.autoClearDepth",
				"autoClearStencil": "WebGLRenderer.autoClearStencil",
				"capabilities": "WebGLRenderer.capabilities",
				"floatFragmentTextures": "WebGLRenderer.floatFragmentTextures",
				"floatVertexTextures": "WebGLRenderer.floatVertexTextures",
				"vertexTextures": "WebGLRenderer.vertexTextures",
				"getMaxAnisotropy": "WebGLRenderer.getMaxAnisotropy",
				"getMaxPrecision": "WebGLRenderer.getMaxPrecision",
				"logarithmicDepthBuffer": "WebGLRenderer.logarithmicDepthBuffer",
				"maxAttributes": "WebGLRenderer.maxAttributes",
				"maxCubemapSize": "WebGLRenderer.maxCubemapSize",
				"maxFragmentUniforms": "WebGLRenderer.maxFragmentUniforms",
				"maxTextureSize": "WebGLRenderer.maxTextureSize",
				"maxTextures": "WebGLRenderer.maxTextures",
				"maxVaryings": "WebGLRenderer.maxVaryings",
				"maxVertexTextures": "WebGLRenderer.maxVertexTextures",
				"maxVertexUniforms": "WebGLRenderer.maxVertexUniforms",
				"precision": "WebGLRenderer.precision",
				"clippingPlanes": "WebGLRenderer.clippingPlanes",
				"context": "WebGLRenderer.context",
				"domElement": "WebGLRenderer.domElement",
				"extensions": "WebGLRenderer.extensions",
				"gammaFactor": "WebGLRenderer.gammaFactor",
				"gammaInput": "WebGLRenderer.gammaInput",
				"gammaOutput": "WebGLRenderer.gammaOutput",
				"info": "WebGLRenderer.info",
				"localClippingEnabled": "WebGLRenderer.localClippingEnabled",
				"maxMorphTargets": "WebGLRenderer.maxMorphTargets",
				"maxMorphNormals": "WebGLRenderer.maxMorphNormals",
				"physicallyCorrectLights": "WebGLRenderer.physicallyCorrectLights",
				"properties": "WebGLRenderer.properties",
				"renderLists": "WebGLRenderer.renderLists",
				"shadowMap": "WebGLRenderer.shadowMap",
				"shadowMap.enabled": "WebGLRenderer.shadowMap.enabled",
				"shadowMap.autoUpdate": "WebGLRenderer.shadowMap.autoUpdate",
				"shadowMap.needsUpdate": "WebGLRenderer.shadowMap.needsUpdate",
				"shadowMap.type": "WebGLRenderer.shadowMap.type",
				"shadowMap.renderReverseSided": "WebGLRenderer.shadowMap.renderReverseSided",
				"shadowMap.renderSingleSided": "WebGLRenderer.shadowMap.renderSingleSided",
				"sortObjects": "WebGLRenderer.sortObjects",
				"state": "WebGLRenderer.state",
				"toneMapping": "WebGLRenderer.toneMapping",
				"toneMappingExposure": "WebGLRenderer.toneMappingExposure",
				"toneMappingWhitePoint": "WebGLRenderer.toneMappingWhitePoint",
				"allocTextureUnit": "WebGLRenderer.allocTextureUnit",
				"clear": "WebGLRenderer.clear",
				"clearColor": "WebGLRenderer.clearColor",
				"clearDepth": "WebGLRenderer.clearDepth",
				"clearStencil": "WebGLRenderer.clearStencil",
				"clearTarget": "WebGLRenderer.clearTarget",
				"compile": "WebGLRenderer.compile",
				"dispose": "WebGLRenderer.dispose",
				"extensions.get": "WebGLRenderer.extensions.get",
				"forceContextLoss": "WebGLRenderer.forceContextLoss",
				"getClearAlpha": "WebGLRenderer.getClearAlpha",
				"getClearColor": "WebGLRenderer.getClearColor",
				"getContext": "WebGLRenderer.getContext",
				"getContextAttributes": "WebGLRenderer.getContextAttributes",
				"getCurrentRenderTarget": "WebGLRenderer.getCurrentRenderTarget",
				"getDrawingBufferSize": "WebGLRenderer.getDrawingBufferSize",
				"getPixelRatio": "WebGLRenderer.getPixelRatio",
				"getPrecision": "WebGLRenderer.getPrecision",
				"getSize": "WebGLRenderer.getSize",
				"resetGLState": "WebGLRenderer.resetGLState",
				"readRenderTargetPixels": "WebGLRenderer.readRenderTargetPixels",
				"render": "WebGLRenderer.render",
				"renderBufferDirect": "WebGLRenderer.renderBufferDirect",
				"renderBufferImmediate": "WebGLRenderer.renderBufferImmediate",
				"setClearAlpha": "WebGLRenderer.setClearAlpha",
				"setClearColor": "WebGLRenderer.setClearColor",
				"setFaceCulling": "WebGLRenderer.setFaceCulling",
				"setPixelRatio": "WebGLRenderer.setPixelRatio",
				"setRenderTarget": "WebGLRenderer.setRenderTarget",
				"setScissor": "WebGLRenderer.setScissor",
				"setScissorTest": "WebGLRenderer.setScissorTest",
				"supportsVertexTextures": "WebGLRenderer.supportsVertexTextures",
				"setSize": "WebGLRenderer.setSize",
				"setTexture2D": "WebGLRenderer.setTexture2D",
				"setTexture": "WebGLRenderer.setTexture",
				"setTextureCube": "WebGLRenderer.setTextureCube",
				"setViewport": "WebGLRenderer.setViewport"

			},

			"WebGLRenderTarget": {

				"#URL": "api/renderers/WebGLRenderTarget",
				"uuid": "WebGLRenderTarget.uuid",
				"width": "WebGLRenderTarget.width",
				"height": "WebGLRenderTarget.height",
				"scissor": "WebGLRenderTarget.scissor",
				"scissorTest": "WebGLRenderTarget.scissorTest",
				"viewport": "WebGLRenderTarget.viewport",
				"texture": "WebGLRenderTarget.texture",
				"depthBuffer": "WebGLRenderTarget.depthBuffer",
				"stencilBuffer": "WebGLRenderTarget.stencilBuffer",
				"depthTexture": "WebGLRenderTarget.depthTexture",
				"setSize": "WebGLRenderTarget.setSize",
				"clone": "WebGLRenderTarget.clone",
				"copy": "WebGLRenderTarget.copy",
				"dispose": "WebGLRenderTarget.dispose"

			},

			"WebGLRenderTargetCube": {

				"#URL": "api/renderers/WebGLRenderTargetCube",
				"activeCubeFace": "WebGLRenderTargetCube.activeCubeFace"

			}


		},

		"Renderers / Shaders": {

			"ShaderChunk": {

				"#URL": "api/renderers/shaders/ShaderChunk"

			},

			"ShaderLib": {

				"#URL": "api/renderers/shaders/ShaderLib"

			},

			"UniformsLib": {

				"#URL": "api/renderers/shaders/UniformsLib"

			},

			"UniformsUtils": {

				"#URL": "api/renderers/shaders/UniformsUtils"

			}


		},

		"Scenes": {

			"Fog": {

				"#URL": "api/scenes/Fog",
				"name": "Fog.name",
				"color": "Fog.color",
				"near": "Fog.near",
				"far": "Fog.far",
				"clone": "Fog.clone",
				"toJSON": "Fog.toJSON"

			},

			"FogExp2": {

				"#URL": "api/scenes/FogExp2",
				"name": "FogExp2.name",
				"color": "FogExp2.color",
				"density": "FogExp2.density",
				"clone": "FogExp2.clone",
				"toJSON": "FogExp2.toJSON"

			},

			"Scene": {

				"#URL": "api/scenes/Scene",
				"fog": "Scene.fog",
				"overrideMaterial": "Scene.overrideMaterial",
				"autoUpdate": "Scene.autoUpdate",
				"background": "Scene.background",
				"toJSON": "Scene.toJSON"

			}


		},

		"Textures": {

			"CanvasTexture": {

				"#URL": "api/textures/CanvasTexture",
				"needsUpdate": "CanvasTexture.needsUpdate"

			},

			"CompressedTexture": {

				"#URL": "api/textures/CompressedTexture",
				"flipY": "CompressedTexture.flipY",
				"generateMipmaps": "CompressedTexture.generateMipmaps"

			},

			"CubeTexture": {

				"#URL": "api/textures/CubeTexture"

			},

			"DataTexture": {

				"#URL": "api/textures/DataTexture",
				"image": "DataTexture.image"

			},

			"DepthTexture": {

				"#URL": "api/textures/DepthTexture"

			},

			"Texture": {

				"#URL": "api/textures/Texture",
				"id": "Texture.id",
				"uuid": "Texture.uuid",
				"name": "Texture.name",
				"image": "Texture.image",
				"mipmaps": "Texture.mipmaps",
				"mapping": "Texture.mapping",
				"wrapS": "Texture.wrapS",
				"wrapT": "Texture.wrapT",
				"magFilter": "Texture.magFilter",
				"minFilter": "Texture.minFilter",
				"anisotropy": "Texture.anisotropy",
				"format": "Texture.format",
				"type": "Texture.type",
				"offset": "Texture.offset",
				"repeat": "Texture.repeat",
				"rotation": "Texture.rotation",
				"center": "Texture.center",
				"matrixAutoUpdate": "Texture.matrixAutoUpdate",
				"matrix": "Texture.matrix",
				"generateMipmaps": "Texture.generateMipmaps",
				"premultiplyAlpha": "Texture.premultiplyAlpha",
				"flipY": "Texture.flipY",
				"unpackAlignment": "Texture.unpackAlignment",
				"encoding": "Texture.encoding",
				"version": "Texture.version",
				"needsUpdate": "Texture.needsUpdate",
				"onUpdate": "Texture.onUpdate",
				"clone": "Texture.clone",
				"toJSON": "Texture.toJSON",
				"dispose": "Texture.dispose",
				"transformUv": "Texture.transformUv"

			},

			"VideoTexture": {

				"#URL": "api/textures/VideoTexture",
				"needsUpdate": "VideoTexture.needsUpdate",
				"update": "VideoTexture.update"

			}


		}


	},

	"Examples": {

		"Controls": {

			"OrbitControls": "examples/controls/OrbitControls"

		},

		"Geometries": {

			"ConvexBufferGeometry": "examples/geometries/ConvexBufferGeometry",
			"ConvexGeometry": "examples/geometries/ConvexGeometry",
			"DecalGeometry": "examples/geometries/DecalGeometry"

		},

		"Loaders": {

			"BabylonLoader": "examples/loaders/BabylonLoader",
			"GLTFLoader": "examples/loaders/GLTFLoader",
			"MTLLoader": "examples/loaders/MTLLoader",
			"OBJLoader": "examples/loaders/OBJLoader",
			"OBJLoader2": "examples/loaders/OBJLoader2",
			"LoaderSupport": "examples/loaders/LoaderSupport",
			"PCDLoader": "examples/loaders/PCDLoader",
			"PDBLoader": "examples/loaders/PDBLoader",
			"SVGLoader": "examples/loaders/SVGLoader",
			"TGALoader": "examples/loaders/TGALoader",
			"PRWMLoader": "examples/loaders/PRWMLoader"

		},

		"Exporters": {

			"GLTFExporter": "examples/exporters/GLTFExporter"

		},

		"Plugins": {

			"LookupTable": "examples/Lut",
			"SpriteCanvasMaterial": "examples/SpriteCanvasMaterial"

		},

		"QuickHull": {

			"Face": "examples/quickhull/Face",
			"HalfEdge": "examples/quickhull/HalfEdge",
			"QuickHull": "examples/quickhull/QuickHull",
			"VertexNode": "examples/quickhull/VertexNode",
			"VertexList": "examples/quickhull/VertexList"

		},

		"Renderers": {

			"CanvasRenderer": "examples/renderers/CanvasRenderer"

		}


	},

	"Developer Reference": {

		"Polyfills": {

			"Polyfills": "api/Polyfills"

		},

		"WebGLRenderer": {

			"WebGLProgram": "api/renderers/webgl/WebGLProgram",
			"WebGLShader": "api/renderers/webgl/WebGLShader",
			"WebGLState": "api/renderers/webgl/WebGLState"

		},

		"WebGLRenderer / Plugins": {

			"LensFlarePlugin": "api/renderers/webgl/plugins/LensFlarePlugin",
			"SpritePlugin": "api/renderers/webgl/plugins/SpritePlugin"

		}


	}

}