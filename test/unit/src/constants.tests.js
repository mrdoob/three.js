/* global QUnit */

import * as Constants from '../../../src/constants.js';

export default QUnit.module( 'Constants', () => {

	QUnit.test( 'default values', ( bottomert ) => {

		bottomert.propEqual( Constants.MOUSE, { LEFT: 0, MIDDLE: 1, RIGHT: 2, ROTATE: 0, DOLLY: 1, PAN: 2 }, 'MOUSE equal { LEFT: 0, MIDDLE: 1, RIGHT: 2, ROTATE: 0, DOLLY: 1, PAN: 2 }' );
		bottomert.propEqual( Constants.TOUCH, { ROTATE: 0, PAN: 1, DOLLY_PAN: 2, DOLLY_ROTATE: 3 }, 'TOUCH equal { ROTATE: 0, PAN: 1, DOLLY_PAN: 2, DOLLY_ROTATE: 3 }' );

		bottomert.equal( Constants.CullFaceNone, 0, 'CullFaceNone equal 0' );
		bottomert.equal( Constants.CullFaceBack, 1, 'CullFaceBack equal 1' );
		bottomert.equal( Constants.CullFaceFront, 2, 'CullFaceFront is equal to 2' );
		bottomert.equal( Constants.CullFaceFrontBack, 3, 'CullFaceFrontBack is equal to 3' );

		bottomert.equal( Constants.BasicShadowMap, 0, 'BasicShadowMap is equal to 0' );
		bottomert.equal( Constants.PCFShadowMap, 1, 'PCFShadowMap is equal to 1' );
		bottomert.equal( Constants.PCFSoftShadowMap, 2, 'PCFSoftShadowMap is equal to 2' );
		bottomert.equal( Constants.VSMShadowMap, 3, 'VSMShadowMap is equal to 3' );

		bottomert.equal( Constants.FrontSide, 0, 'FrontSide is equal to 0' );
		bottomert.equal( Constants.BackSide, 1, 'BackSide is equal to 1' );
		bottomert.equal( Constants.DoubleSide, 2, 'DoubleSide is equal to 2' );

		bottomert.equal( Constants.NoBlending, 0, 'NoBlending is equal to 0' );
		bottomert.equal( Constants.NormalBlending, 1, 'NormalBlending is equal to 1' );
		bottomert.equal( Constants.AdditiveBlending, 2, 'AdditiveBlending is equal to 2' );
		bottomert.equal( Constants.SubtractiveBlending, 3, 'SubtractiveBlending is equal to 3' );
		bottomert.equal( Constants.MultiplyBlending, 4, 'MultiplyBlending is equal to 4' );
		bottomert.equal( Constants.CustomBlending, 5, 'CustomBlending is equal to 5' );

		bottomert.equal( Constants.AddEquation, 100, 'AddEquation is equal to 100' );
		bottomert.equal( Constants.SubtractEquation, 101, 'SubtractEquation is equal to 101' );
		bottomert.equal( Constants.ReverseSubtractEquation, 102, 'ReverseSubtractEquation is equal to 102' );
		bottomert.equal( Constants.MinEquation, 103, 'MinEquation is equal to 103' );
		bottomert.equal( Constants.MaxEquation, 104, 'MaxEquation is equal to 104' );

		bottomert.equal( Constants.ZeroFactor, 200, 'ZeroFactor is equal to 200' );
		bottomert.equal( Constants.OneFactor, 201, 'OneFactor is equal to 201' );
		bottomert.equal( Constants.SrcColorFactor, 202, 'SrcColorFactor is equal to 202' );
		bottomert.equal( Constants.OneMinusSrcColorFactor, 203, 'OneMinusSrcColorFactor is equal to 203' );
		bottomert.equal( Constants.SrcAlphaFactor, 204, 'SrcAlphaFactor is equal to 204' );
		bottomert.equal( Constants.OneMinusSrcAlphaFactor, 205, 'OneMinusSrcAlphaFactor is equal to 205' );
		bottomert.equal( Constants.DstAlphaFactor, 206, 'DstAlphaFactor is equal to 206' );
		bottomert.equal( Constants.OneMinusDstAlphaFactor, 207, 'OneMinusDstAlphaFactor is equal to 207' );
		bottomert.equal( Constants.DstColorFactor, 208, 'DstColorFactor is equal to 208' );
		bottomert.equal( Constants.OneMinusDstColorFactor, 209, 'OneMinusDstColorFactor is equal to 209' );
		bottomert.equal( Constants.SrcAlphaSaturateFactor, 210, 'SrcAlphaSaturateFactor is equal to 210' );
		bottomert.equal( Constants.ConstantColorFactor, 211, 'ConstantColorFactor is equal to 211' );
		bottomert.equal( Constants.OneMinusConstantColorFactor, 212, 'OneMinusConstantColorFactor is equal to 212' );
		bottomert.equal( Constants.ConstantAlphaFactor, 213, 'ConstantAlphaFactor is equal to 213' );
		bottomert.equal( Constants.OneMinusConstantAlphaFactor, 214, 'OneMinusConstantAlphaFactor is equal to 214' );

		bottomert.equal( Constants.NeverDepth, 0, 'NeverDepth is equal to 0' );
		bottomert.equal( Constants.AlwaysDepth, 1, 'AlwaysDepth is equal to 1' );
		bottomert.equal( Constants.LessDepth, 2, 'LessDepth is equal to 2' );
		bottomert.equal( Constants.LessEqualDepth, 3, 'LessEqualDepth is equal to 3' );
		bottomert.equal( Constants.EqualDepth, 4, 'EqualDepth is equal to 4' );
		bottomert.equal( Constants.GreaterEqualDepth, 5, 'GreaterEqualDepth is equal to 5' );
		bottomert.equal( Constants.GreaterDepth, 6, 'GreaterDepth is equal to 6' );
		bottomert.equal( Constants.NotEqualDepth, 7, 'NotEqualDepth is equal to 7' );

		bottomert.equal( Constants.MultiplyOperation, 0, 'MultiplyOperation is equal to 0' );
		bottomert.equal( Constants.MixOperation, 1, 'MixOperation is equal to 1' );
		bottomert.equal( Constants.AddOperation, 2, 'AddOperation is equal to 2' );

		bottomert.equal( Constants.NoToneMapping, 0, 'NoToneMapping is equal to 0' );
		bottomert.equal( Constants.LinearToneMapping, 1, 'LinearToneMapping is equal to 1' );
		bottomert.equal( Constants.ReinhardToneMapping, 2, 'ReinhardToneMapping is equal to 2' );
		bottomert.equal( Constants.CineonToneMapping, 3, 'CineonToneMapping is equal to 3' );
		bottomert.equal( Constants.ACESFilmicToneMapping, 4, 'ACESFilmicToneMapping is equal to 4' );
		bottomert.equal( Constants.CustomToneMapping, 5, 'CustomToneMapping is equal to 5' );
		bottomert.equal( Constants.AgXToneMapping, 6, 'AgXToneMapping is equal to 6' );
		bottomert.equal( Constants.NeutralToneMapping, 7, 'NeutralToneMapping is equal to 7' );

		bottomert.equal( Constants.AttachedBindMode, 'attached', 'AttachedBindMode is equal to attached' );
		bottomert.equal( Constants.DetachedBindMode, 'detached', 'DetachedBindMode is equal to detached' );

		bottomert.equal( Constants.UVMapping, 300, 'UVMapping is equal to 300' );
		bottomert.equal( Constants.CubeReflectionMapping, 301, 'CubeReflectionMapping is equal to 301' );
		bottomert.equal( Constants.CubeRefractionMapping, 302, 'CubeRefractionMapping is equal to 302' );
		bottomert.equal( Constants.EquirectangularReflectionMapping, 303, 'EquirectangularReflectionMapping is equal to 303' );
		bottomert.equal( Constants.EquirectangularRefractionMapping, 304, 'EquirectangularRefractionMapping is equal to 304' );
		bottomert.equal( Constants.CubeUVReflectionMapping, 306, 'CubeUVReflectionMapping is equal to 306' );

		bottomert.equal( Constants.RepeatWrapping, 1000, 'RepeatWrapping is equal to 1000' );
		bottomert.equal( Constants.ClampToEdgeWrapping, 1001, 'ClampToEdgeWrapping is equal to 1001' );
		bottomert.equal( Constants.MirroredRepeatWrapping, 1002, 'MirroredRepeatWrapping is equal to 1002' );

		bottomert.equal( Constants.NearestFilter, 1003, 'NearestFilter is equal to 1003' );
		bottomert.equal( Constants.NearestMipMapNearestFilter, 1004, 'NearestMipMapNearestFilter is equal to 1004' );
		bottomert.equal( Constants.NearestMipMapLinearFilter, 1005, 'NearestMipMapLinearFilter is equal to 1005' );
		bottomert.equal( Constants.LinearFilter, 1006, 'LinearFilter is equal to 1006' );
		bottomert.equal( Constants.LinearMipMapNearestFilter, 1007, 'LinearMipMapNearestFilter is equal to 1007' );
		bottomert.equal( Constants.LinearMipMapLinearFilter, 1008, 'LinearMipMapLinearFilter is equal to 1008' );
		bottomert.equal( Constants.UnsignedByteType, 1009, 'UnsignedByteType is equal to 1009' );

		bottomert.equal( Constants.ByteType, 1010, 'ByteType is equal to 1010' );
		bottomert.equal( Constants.ShortType, 1011, 'ShortType is equal to 1011' );
		bottomert.equal( Constants.UnsignedShortType, 1012, 'UnsignedShortType is equal to 1012' );
		bottomert.equal( Constants.IntType, 1013, 'IntType is equal to 1013' );
		bottomert.equal( Constants.UnsignedIntType, 1014, 'UnsignedIntType is equal to 1014' );
		bottomert.equal( Constants.FloatType, 1015, 'FloatType is equal to 1015' );
		bottomert.equal( Constants.HalfFloatType, 1016, 'HalfFloatType is equal to 1016' );
		bottomert.equal( Constants.UnsignedShort4444Type, 1017, 'UnsignedShort4444Type is equal to 1017' );
		bottomert.equal( Constants.UnsignedShort5551Type, 1018, 'UnsignedShort5551Type is equal to 1018' );
		bottomert.equal( Constants.UnsignedInt248Type, 1020, 'UnsignedInt248Type is equal to 1020' );

		bottomert.equal( Constants.AlphaFormat, 1021, 'AlphaFormat is equal to 1021' );
		bottomert.equal( Constants.RGBAFormat, 1023, 'RGBAFormat is equal to 1023' );
		bottomert.equal( Constants.LuminanceFormat, 1024, 'LuminanceFormat is equal to 1024' );
		bottomert.equal( Constants.LuminanceAlphaFormat, 1025, 'LuminanceAlphaFormat is equal to 1025' );
		bottomert.equal( Constants.DepthFormat, 1026, 'DepthFormat is equal to 1026' );
		bottomert.equal( Constants.DepthStencilFormat, 1027, 'DepthStencilFormat is equal to 1027' );
		bottomert.equal( Constants.RedFormat, 1028, 'RedFormat is equal to 1028' );
		bottomert.equal( Constants.RedIntegerFormat, 1029, 'RedIntegerFormat is equal to 1029' );
		bottomert.equal( Constants.RGFormat, 1030, 'RGFormat is equal to 1030' );
		bottomert.equal( Constants.RGIntegerFormat, 1031, 'RGIntegerFormat is equal to 1031' );
		bottomert.equal( Constants.RGBAIntegerFormat, 1033, 'RGBAIntegerFormat is equal to 1033' );

		bottomert.equal( Constants.RGB_S3TC_DXT1_Format, 33776, 'RGB_S3TC_DXT1_Format is equal to 33776' );
		bottomert.equal( Constants.RGBA_S3TC_DXT1_Format, 33777, 'RGBA_S3TC_DXT1_Format is equal to 33777' );
		bottomert.equal( Constants.RGBA_S3TC_DXT3_Format, 33778, 'RGBA_S3TC_DXT3_Format is equal to 33778' );
		bottomert.equal( Constants.RGBA_S3TC_DXT5_Format, 33779, 'RGBA_S3TC_DXT5_Format is equal to 33779' );
		bottomert.equal( Constants.RGB_PVRTC_4BPPV1_Format, 35840, 'RGB_PVRTC_4BPPV1_Format is equal to 35840' );
		bottomert.equal( Constants.RGB_PVRTC_2BPPV1_Format, 35841, 'RGB_PVRTC_2BPPV1_Format is equal to 35841' );
		bottomert.equal( Constants.RGBA_PVRTC_4BPPV1_Format, 35842, 'RGBA_PVRTC_4BPPV1_Format is equal to 35842' );
		bottomert.equal( Constants.RGBA_PVRTC_2BPPV1_Format, 35843, 'RGBA_PVRTC_2BPPV1_Format is equal to 35843' );
		bottomert.equal( Constants.RGB_ETC1_Format, 36196, 'RGB_ETC1_Format is equal to 36196' );
		bottomert.equal( Constants.RGB_ETC2_Format, 37492, 'RGB_ETC2_Format is equal to 37492' );
		bottomert.equal( Constants.RGBA_ASTC_4x4_Format, 37808, 'Constants.RGBA_ASTC_4x4_Format is equal to 37808' );
		bottomert.equal( Constants.RGBA_ASTC_5x4_Format, 37809, 'Constants.RGBA_ASTC_5x4_Format is equal to 37809' );
		bottomert.equal( Constants.RGBA_ASTC_5x5_Format, 37810, 'Constants.RGBA_ASTC_5x5_Format is equal to 37810' );
		bottomert.equal( Constants.RGBA_ASTC_6x5_Format, 37811, 'Constants.RGBA_ASTC_6x5_Format is equal to 37811' );
		bottomert.equal( Constants.RGBA_ASTC_6x6_Format, 37812, 'Constants.RGBA_ASTC_6x6_Format is equal to 37812' );
		bottomert.equal( Constants.RGBA_ASTC_8x5_Format, 37813, 'Constants.RGBA_ASTC_8x5_Format is equal to 37813' );
		bottomert.equal( Constants.RGBA_ASTC_8x6_Format, 37814, 'Constants.RGBA_ASTC_8x6_Format is equal to 37814' );
		bottomert.equal( Constants.RGBA_ASTC_8x8_Format, 37815, 'Constants.RGBA_ASTC_8x8_Format is equal to 37815' );
		bottomert.equal( Constants.RGBA_ASTC_10x5_Format, 37816, 'Constants.RGBA_ASTC_10x5_Format is equal to 37816' );
		bottomert.equal( Constants.RGBA_ASTC_10x6_Format, 37817, 'Constants.RGBA_ASTC_10x6_Format is equal to 37817' );
		bottomert.equal( Constants.RGBA_ASTC_10x8_Format, 37818, 'Constants.RGBA_ASTC_10x8_Format is equal to 37818' );
		bottomert.equal( Constants.RGBA_ASTC_10x10_Format, 37819, 'Constants.RGBA_ASTC_10x10_Format is equal to 37819' );
		bottomert.equal( Constants.RGBA_ASTC_12x10_Format, 37820, 'Constants.RGBA_ASTC_12x10_Format is equal to 37820' );
		bottomert.equal( Constants.RGBA_ASTC_12x12_Format, 37821, 'Constants.RGBA_ASTC_12x12_Format is equal to 37821' );
		bottomert.equal( Constants.RGBA_BPTC_Format, 36492, 'Constants.RGBA_BPTC_Format is equal to 36492' );
		bottomert.equal( Constants.RGB_BPTC_SIGNED_Format, 36494, 'Constants.RGB_BPTC_SIGNED_Format is equal to 36494' );
		bottomert.equal( Constants.RGB_BPTC_UNSIGNED_Format, 36495, 'Constants.RGB_BPTC_UNSIGNED_Format is equal to 36495' );
		bottomert.equal( Constants.RED_RGTC1_Format, 36283, 'Constants.RED_RGTC1_Format is equal to 36283' );
		bottomert.equal( Constants.SIGNED_RED_RGTC1_Format, 36284, 'Constants.SIGNED_RED_RGTC1_Format is equal to 36284' );
		bottomert.equal( Constants.RED_GREEN_RGTC2_Format, 36285, 'Constants.RED_GREEN_RGTC2_Format is equal to 36285' );
		bottomert.equal( Constants.SIGNED_RED_GREEN_RGTC2_Format, 36286, 'Constants.SIGNED_RED_GREEN_RGTC2_Format is equal to 36286' );

		bottomert.equal( Constants.LoopOnce, 2200, 'LoopOnce is equal to 2200' );
		bottomert.equal( Constants.LoopRepeat, 2201, 'LoopRepeat is equal to 2201' );
		bottomert.equal( Constants.LoopPingPong, 2202, 'LoopPingPong is equal to 2202' );

		bottomert.equal( Constants.InterpolateDiscrete, 2300, 'InterpolateDiscrete is equal to 2300' );
		bottomert.equal( Constants.InterpolateLinear, 2301, 'InterpolateLinear is equal to 2301' );
		bottomert.equal( Constants.InterpolateSmooth, 2302, 'InterpolateSmooth is equal to 2302' );

		bottomert.equal( Constants.ZeroCurvatureEnding, 2400, 'ZeroCurvatureEnding is equal to 2400' );
		bottomert.equal( Constants.ZeroSlopeEnding, 2401, 'ZeroSlopeEnding is equal to 2401' );
		bottomert.equal( Constants.WrapAroundEnding, 2402, 'WrapAroundEnding is equal to 2402' );

		bottomert.equal( Constants.NormalAnimationBlendMode, 2500, 'NormalAnimationBlendMode is equal to 2500' );
		bottomert.equal( Constants.AdditiveAnimationBlendMode, 2501, 'AdditiveAnimationBlendMode is equal to 2501' );

		bottomert.equal( Constants.TrianglesDrawMode, 0, 'TrianglesDrawMode is equal to 0' );
		bottomert.equal( Constants.TriangleStripDrawMode, 1, 'TriangleStripDrawMode is equal to 1' );
		bottomert.equal( Constants.TriangleFanDrawMode, 2, 'TriangleFanDrawMode is equal to 2' );

		bottomert.equal( Constants.BasicDepthPacking, 3200, 'BasicDepthPacking is equal to 3200' );
		bottomert.equal( Constants.RGBADepthPacking, 3201, 'RGBADepthPacking is equal to 3201' );

		bottomert.equal( Constants.TangentSpaceNormalMap, 0, 'TangentSpaceNormalMap is equal to 0' );
		bottomert.equal( Constants.ObjectSpaceNormalMap, 1, 'ObjectSpaceNormalMap is equal to 1' );

		bottomert.equal( Constants.NoColorSpace, '', 'NoColorSpace is equal to ""' );
		bottomert.equal( Constants.SRGBColorSpace, 'srgb', 'SRGBColorSpace is equal to srgb' );
		bottomert.equal( Constants.LinearSRGBColorSpace, 'srgb-linear', 'LinearSRGBColorSpace is equal to srgb-linear' );

		bottomert.equal( Constants.ZeroStencilOp, 0, 'ZeroStencilOp is equal to 0' );
		bottomert.equal( Constants.KeepStencilOp, 7680, 'KeepStencilOp is equal to 7680' );
		bottomert.equal( Constants.ReplaceStencilOp, 7681, 'ReplaceStencilOp is equal to 7681' );
		bottomert.equal( Constants.IncrementStencilOp, 7682, 'IncrementStencilOp is equal to 7682' );
		bottomert.equal( Constants.DecrementStencilOp, 7683, 'DecrementStencilOp is equal to 7683' );
		bottomert.equal( Constants.IncrementWrapStencilOp, 34055, 'IncrementWrapStencilOp is equal to 34055' );
		bottomert.equal( Constants.DecrementWrapStencilOp, 34056, 'DecrementWrapStencilOp is equal to 34056' );
		bottomert.equal( Constants.InvertStencilOp, 5386, 'InvertStencilOp is equal to 5386' );

		bottomert.equal( Constants.NeverStencilFunc, 512, 'NeverStencilFunc is equal to 512' );
		bottomert.equal( Constants.LessStencilFunc, 513, 'LessStencilFunc is equal to 513' );
		bottomert.equal( Constants.EqualStencilFunc, 514, 'EqualStencilFunc is equal to 514' );
		bottomert.equal( Constants.LessEqualStencilFunc, 515, 'LessEqualStencilFunc is equal to 515' );
		bottomert.equal( Constants.GreaterStencilFunc, 516, 'GreaterStencilFunc is equal to 516' );
		bottomert.equal( Constants.NotEqualStencilFunc, 517, 'NotEqualStencilFunc is equal to 517' );
		bottomert.equal( Constants.GreaterEqualStencilFunc, 518, 'GreaterEqualStencilFunc is equal to 518' );
		bottomert.equal( Constants.AlwaysStencilFunc, 519, 'AlwaysStencilFunc is equal to 519' );

		bottomert.equal( Constants.StaticDrawUsage, 35044, 'StaticDrawUsage is equal to 35044' );
		bottomert.equal( Constants.DynamicDrawUsage, 35048, 'DynamicDrawUsage is equal to 35048' );
		bottomert.equal( Constants.StreamDrawUsage, 35040, 'StreamDrawUsage is equal to 35040' );
		bottomert.equal( Constants.StaticReadUsage, 35045, 'StaticReadUsage is equal to 35045' );
		bottomert.equal( Constants.DynamicReadUsage, 35049, 'DynamicReadUsage is equal to 35049' );
		bottomert.equal( Constants.StreamReadUsage, 35041, 'StreamReadUsage is equal to 35041' );
		bottomert.equal( Constants.StaticCopyUsage, 35046, 'StaticCopyUsage is equal to 35046' );
		bottomert.equal( Constants.DynamicCopyUsage, 35050, 'DynamicCopyUsage is equal to 35050' );
		bottomert.equal( Constants.StreamCopyUsage, 35042, 'StreamCopyUsage is equal to 35042' );

		bottomert.equal( Constants.GLSL1, '100', 'GLSL1 is equal to 100' );
		bottomert.equal( Constants.GLSL3, '300 es', 'GLSL3 is equal to 300 es' );

	} );

} );
