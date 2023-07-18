declare module 'rhino3dm' {

	export default function rhino3dm() : Promise<RhinoModule>;

	enum ActiveSpace {
		None,
		ModelSpace,
		PageSpace
	}

	enum BasepointZero {
		GroundLevel,
		MeanSeaLevel,
		CenterOfEarth
	}

	enum ComponentIndexType {
		InvalidType,
		BrepVertex,
		BrepEdge,
		BrepFace,
		BrepTrim,
		BrepLoop,
		MeshVertex,
		MeshTopologyVertex,
		MeshTopologyEdge,
		MeshFace,
		MeshNgon,
		InstanceDefinitionPart,
		PolycurveSegment,
		PointCloudPoint,
		GroupMember,
		ExtrusionBottomProfile,
		ExtrusionTopProfile,
		ExtrusionWallEdge,
		ExtrusionWallSurface,
		ExtrusionCapSurface,
		ExtrusionPath,
		SubdVertex,
		SubdEdge,
		SubdFace,
		DimLinearPoint,
		DimRadialPoint,
		DimAngularPoint,
		DimOrdinatePoint,
		DimTextPoint,
		NoType
	}

	enum CoordinateSystem {
		World,
		Camera,
		Clip,
		Screen
	}

	enum CurvePipingCapTypes {
		None,
		Flat,
		Box,
		Dome
	}

	enum DecalMappings {
		None,
		Planar,
		Cylindrical,
		Spherical,
		UV
	}

	enum DecalProjections {
		None,
		Forward,
		Backward,
		Both
	}

	enum DisplacementSweepResolutionFormulas {
		Default,
		AbsoluteToleranceDependent
	}

	enum DitheringMethods {
		SimpleNoise,
		FloydSteinberg
	}

	enum EnvironmentBackgroundProjections {
		Planar,
		Spherical,
		Emap,
		Box,
		Automatic,
		LightProbe,
		CubeMap,
		VerticalCrossCubeMap,
		HorizontalCrossCubeMap,
		Hemispherical
	}

	enum InstanceDefinitionUpdateType {
		Static,
		Embedded,
		LinkedAndEmbedded,
		Linked
	}

	enum LightStyle {
		None,
		CameraDirectional,
		CameraPoint,
		CameraSpot,
		WorldDirectional,
		WorldPoint,
		WorldSpot,
		Ambient,
		WorldLinear,
		WorldRectangular
	}

	enum LineCircleIntersection {
		None,
		Single,
		Multiple
	}

	enum LineCylinderIntersection {
		None,
		Single,
		Multiple,
		Overlap
	}

	enum LineSphereIntersection {
		None,
		Single,
		Multiple
	}

	enum Mappings {
		None,
		Planar,
		Cylindrical,
		Spherical,
		UV
	}

	enum MeshType {
		Default,
		Render,
		Analysis,
		Preview,
		Any
	}

	enum ObjectColorSource {
		ColorFromLayer,
		ColorFromObject,
		ColorFromMaterial,
		ColorFromParent
	}

	enum ObjectDecoration {
		None,
		StartArrowhead,
		EndArrowhead,
		BothArrowhead
	}

	enum ObjectLinetypeSource {
		LinetypeFromLayer,
		LinetypeFromObject,
		LinetypeFromParent
	}

	enum ObjectMaterialSource {
		MaterialFromLayer,
		MaterialFromObject,
		MaterialFromParent
	}

	enum ObjectMode {
		Normal,
		Hidden,
		Locked,
		InstanceDefinitionObject
	}

	enum ObjectPlotColorSource {
		PlotColorFromLayer,
		PlotColorFromObject,
		PlotColorFromDisplay,
		PlotColorFromParent
	}

	enum ObjectPlotWeightSource {
		PlotWeightFromLayer,
		PlotWeightFromObject,
		PlotWeightFromParent
	}

	enum ObjectType {
		None,
		Point,
		PointSet,
		Curve,
		Surface,
		Brep,
		Mesh,
		Light,
		Annotation,
		InstanceDefinition,
		InstanceReference,
		TextDot,
		Grip,
		Detail,
		Hatch,
		MorphControl,
		SubD,
		BrepLoop,
		PolysrfFilter,
		EdgeFilter,
		PolyedgeFilter,
		MeshVertex,
		MeshEdge,
		MeshFace,
		Cage,
		Phantom,
		ClipPlane,
		Extrusion,
		AnyObject
	}

	enum PlaneSphereIntersection {
		None,
		Point,
		Circle
	}

	enum PostEffectTypes {
		Early,
		ToneMapping,
		Late
	}

	enum Projections {
		None,
		Forward,
		Backward,
		Both
	}

	enum RenderChannelsModes {
		Automatic,
		Custom
	}

	enum SphereSphereIntersection {
		None,
		Point,
		Circle,
		Overlap
	}

	enum TextureType {
		None,
		Bitmap,
		Diffuse,
		Bump,
		Transparency,
		Opacity,
		Emap,
		PBR_BaseColor,
		PBR_Subsurface,
		PBR_SubsurfaceScattering,
		PBR_SubsurfaceScatteringRadius,
		PBR_Metallic,
		PBR_Specular,
		PBR_SpecularTint,
		PBR_Roughness,
		PBR_Anisotropic,
		PBR_Anisotropic_Rotation,
		PBR_Sheen,
		PBR_SheenTint,
		PBR_Clearcoat,
		PBR_ClearcoatRoughness,
		PBR_OpacityIor,
		PBR_OpacityRoughness,
		PBR_Emission,
		PBR_AmbientOcclusion,
		PBR_Displacement,
		PBR_ClearcoatBump
	}

	enum TextureUvwWrapping {
		Repeat,
		Clamp
	}

	enum TransformRigidType {
		RigidReversing,
		NotRigid,
		Rigid
	}

	enum TransformSimilarityType {
		OrientationReversing,
		NotSimilarity,
		OrientationPreserving
	}

	enum UnitSystem {
		None,
		Angstroms,
		Nanometers,
		Microns,
		Millimeters,
		Centimeters,
		Decimeters,
		Meters,
		Dekameters,
		Hectometers,
		Kilometers,
		Megameters,
		Gigameters,
		Microinches,
		Mils,
		Inches,
		Feet,
		Yards,
		Miles,
		PrinterPoints,
		PrinterPicas,
		NauticalMiles,
		AstronomicalUnits,
		LightYears,
		Parsecs,
		CustomUnits,
		Unset
	}

	class RhinoModule {
		ActiveSpace: typeof ActiveSpace
		BasepointZero: typeof BasepointZero
		ComponentIndexType: typeof ComponentIndexType
		CoordinateSystem: typeof CoordinateSystem
		CurvePipingCapTypes: typeof CurvePipingCapTypes
		DecalMappings: typeof DecalMappings
		DecalProjections: typeof DecalProjections
		DisplacementSweepResolutionFormulas: typeof DisplacementSweepResolutionFormulas
		DitheringMethods: typeof DitheringMethods
		EnvironmentBackgroundProjections: typeof EnvironmentBackgroundProjections
		InstanceDefinitionUpdateType: typeof InstanceDefinitionUpdateType
		LightStyle: typeof LightStyle
		LineCircleIntersection: typeof LineCircleIntersection
		LineCylinderIntersection: typeof LineCylinderIntersection
		LineSphereIntersection: typeof LineSphereIntersection
		Mappings: typeof Mappings
		MeshType: typeof MeshType
		ObjectColorSource: typeof ObjectColorSource
		ObjectDecoration: typeof ObjectDecoration
		ObjectLinetypeSource: typeof ObjectLinetypeSource
		ObjectMaterialSource: typeof ObjectMaterialSource
		ObjectMode: typeof ObjectMode
		ObjectPlotColorSource: typeof ObjectPlotColorSource
		ObjectPlotWeightSource: typeof ObjectPlotWeightSource
		ObjectType: typeof ObjectType
		PlaneSphereIntersection: typeof PlaneSphereIntersection
		PostEffectTypes: typeof PostEffectTypes
		Projections: typeof Projections
		RenderChannelsModes: typeof RenderChannelsModes
		SphereSphereIntersection: typeof SphereSphereIntersection
		TextureType: typeof TextureType
		TextureUvwWrapping: typeof TextureUvwWrapping
		TransformRigidType: typeof TransformRigidType
		TransformSimilarityType: typeof TransformSimilarityType
		UnitSystem: typeof UnitSystem
		AnnotationBase: typeof AnnotationBase;
		Arc: typeof Arc;
		ArcCurve: typeof ArcCurve;
		ArchivableDictionary: typeof ArchivableDictionary;
		BezierCurve: typeof BezierCurve;
		Bitmap: typeof Bitmap;
		BoundingBox: typeof BoundingBox;
		Box: typeof Box;
		Brep: typeof Brep;
		BrepEdge: typeof BrepEdge;
		BrepEdgeList: typeof BrepEdgeList;
		BrepFace: typeof BrepFace;
		BrepFaceList: typeof BrepFaceList;
		BrepSurfaceList: typeof BrepSurfaceList;
		BrepVertex: typeof BrepVertex;
		BrepVertexList: typeof BrepVertexList;
		Circle: typeof Circle;
		CommonObject: typeof CommonObject;
		ComponentIndex: typeof ComponentIndex;
		Cone: typeof Cone;
		ConstructionPlane: typeof ConstructionPlane;
		Curve: typeof Curve;
		CurvePiping: typeof CurvePiping;
		CurveProxy: typeof CurveProxy;
		Cylinder: typeof Cylinder;
		Decal: typeof Decal;
		DimensionStyle: typeof DimensionStyle;
		Displacement: typeof Displacement;
		Dithering: typeof Dithering;
		DracoCompression: typeof DracoCompression;
		DracoCompressionOptions: typeof DracoCompressionOptions;
		EarthAnchorPoint: typeof EarthAnchorPoint;
		EdgeSoftening: typeof EdgeSoftening;
		Ellipse: typeof Ellipse;
		EmbeddedFile: typeof EmbeddedFile;
		Environment: typeof Environment;
		Extrusion: typeof Extrusion;
		File3dm: typeof File3dm;
		File3dmBitmapTable: typeof File3dmBitmapTable;
		File3dmDecalTable: typeof File3dmDecalTable;
		File3dmDimStyleTable: typeof File3dmDimStyleTable;
		File3dmEmbeddedFileTable: typeof File3dmEmbeddedFileTable;
		File3dmGroupTable: typeof File3dmGroupTable;
		File3dmInstanceDefinitionTable: typeof File3dmInstanceDefinitionTable;
		File3dmLayerTable: typeof File3dmLayerTable;
		File3dmLinetypeTable: typeof File3dmLinetypeTable;
		File3dmMaterialTable: typeof File3dmMaterialTable;
		File3dmMeshModifiers: typeof File3dmMeshModifiers;
		File3dmObject: typeof File3dmObject;
		File3dmObjectTable: typeof File3dmObjectTable;
		File3dmPlugInData: typeof File3dmPlugInData;
		File3dmPlugInDataTable: typeof File3dmPlugInDataTable;
		File3dmPostEffectTable: typeof File3dmPostEffectTable;
		File3dmRdkDocumentData: typeof File3dmRdkDocumentData;
		File3dmRenderContentTable: typeof File3dmRenderContentTable;
		File3dmSettings: typeof File3dmSettings;
		File3dmShutLiningCurveTable: typeof File3dmShutLiningCurveTable;
		File3dmStringTable: typeof File3dmStringTable;
		File3dmViewTable: typeof File3dmViewTable;
		File3dmWriteOptions: typeof File3dmWriteOptions;
		FileReference: typeof FileReference;
		Font: typeof Font;
		GeometryBase: typeof GeometryBase;
		GroundPlane: typeof GroundPlane;
		Group: typeof Group;
		Hatch: typeof Hatch;
		InstanceDefinition: typeof InstanceDefinition;
		InstanceReference: typeof InstanceReference;
		Intersection: typeof Intersection;
		Layer: typeof Layer;
		Light: typeof Light;
		Line: typeof Line;
		LinearWorkflow: typeof LinearWorkflow;
		LineCurve: typeof LineCurve;
		Linetype: typeof Linetype;
		Material: typeof Material;
		Mesh: typeof Mesh;
		MeshFaceList: typeof MeshFaceList;
		MeshingParameters: typeof MeshingParameters;
		MeshNormalList: typeof MeshNormalList;
		MeshTextureCoordinateList: typeof MeshTextureCoordinateList;
		MeshTopologyEdgeList: typeof MeshTopologyEdgeList;
		MeshVertexColorList: typeof MeshVertexColorList;
		MeshVertexList: typeof MeshVertexList;
		ModelComponent: typeof ModelComponent;
		NurbsCurve: typeof NurbsCurve;
		NurbsCurveKnotList: typeof NurbsCurveKnotList;
		NurbsCurvePointList: typeof NurbsCurvePointList;
		NurbsSurface: typeof NurbsSurface;
		NurbsSurfaceKnotList: typeof NurbsSurfaceKnotList;
		NurbsSurfacePointList: typeof NurbsSurfacePointList;
		ObjectAttributes: typeof ObjectAttributes;
		PhysicallyBasedMaterial: typeof PhysicallyBasedMaterial;
		Plane: typeof Plane;
		PlaneSurface: typeof PlaneSurface;
		Point: typeof Point;
		Point3d: typeof Point3d;
		Point3dList: typeof Point3dList;
		PointCloud: typeof PointCloud;
		PointCloudItem: typeof PointCloudItem;
		PointGrid: typeof PointGrid;
		PolyCurve: typeof PolyCurve;
		Polyline: typeof Polyline;
		PolylineCurve: typeof PolylineCurve;
		PostEffect: typeof PostEffect;
		RenderChannels: typeof RenderChannels;
		RenderContent: typeof RenderContent;
		RenderEnvironment: typeof RenderEnvironment;
		RenderEnvironments: typeof RenderEnvironments;
		RenderMaterial: typeof RenderMaterial;
		RenderSettings: typeof RenderSettings;
		RenderTexture: typeof RenderTexture;
		RevSurface: typeof RevSurface;
		SafeFrame: typeof SafeFrame;
		ShutLining: typeof ShutLining;
		ShutLiningCurve: typeof ShutLiningCurve;
		Skylight: typeof Skylight;
		Sphere: typeof Sphere;
		SubD: typeof SubD;
		Sun: typeof Sun;
		Surface: typeof Surface;
		SurfaceProxy: typeof SurfaceProxy;
		TextDot: typeof TextDot;
		Texture: typeof Texture;
		TextureMapping: typeof TextureMapping;
		Thickening: typeof Thickening;
		Transform: typeof Transform;
		ViewInfo: typeof ViewInfo;
		ViewportInfo: typeof ViewportInfo;
	}

	class AnnotationBase extends GeometryBase {
		/**
		 * Text including additional RTF formatting information
		 */
		richText: string;
		/**
		 * Text stripped of RTF formatting information
		 */
		plainText: string;
	}

	class Arc {
		/**
		 * Gets a value indicating whether or not this arc is valid.
		 * Detail:
		 * Radius>0 and 0<AngleRadians()<=2*Math.Pi.
		 */
		isValid: boolean;
		/**
		 * Gets a value indicating whether or not this arc is a complete circle.
		 */
		isCircle: boolean;
		/**
		 * Gets or sets the radius of this arc.
		 */
		radius: number;
		/**
		 * Gets or sets the Diameter of this arc.
		 */
		diameter: number;
		/**
		 * Gets or sets the plane in which this arc lies.
		 */
		plane: Plane;
		/**
		 * Gets or sets the center point for this arc.
		 */
		center: number[];
		/**
		 * Gets the circumference of the circle that is coincident with this arc.
		 */
		circumference: number;
		/**
		 * Gets the length of the arc. (Length = Radius * (subtended angle in radians)).
		 */
		length: number;
		/**
		 * Gets the start point of the arc.
		 */
		startPoint: number[];
		/**
		 * Gets the mid-point of the arc.
		 */
		midPoint: number[];
		/**
		 * Gets the end point of the arc.
		 */
		endPoint: number[];
		/**
		 * Gets or sets the angle domain (in Radians) of this arc.
		 */
		angleDomain: number[];
		/**
		 * Gets or sets the start angle (in Radians) for this arc segment.
		 */
		startAngle: number;
		/**
		 * Gets or sets the end angle (in Radians) for this arc segment.
		 */
		endAngle: number;
		/**
		 */
		angleRadians: any;
		/**
		 * Gets or sets the start angle (in Degrees) for this arc segment.
		 */
		startAngleDegrees: number;
		/**
		 * Gets or sets the end angle (in Degrees) for this arc segment.
		 */
		endAngleDegrees: number;
		/**
		 * Gets or sets the sweep -or subtended- angle (in Degrees) for this arc segment.
		 */
		angleDegrees: number;

		constructor(circle: Circle, angleRadians: number);

		constructor(center: number[], radius: number, angleRadians: number);
		/** ... */
		static createFromPoints(): void;
		/**
		 * @description Sets arc's angle domain (in Radians) as a sub-domain of the circle.
		 * @param {number[]} domain 0 < domain[1] - domain[0] <= 2.0 * RhinoMath.Pi.
		 * @returns {boolean} true on success, false on failure.
		 */
		trim(domain:number[]): boolean;
		/**
		 * @description Computes the 3D axis aligned bounding box for this arc.
		 * @returns {BoundingBox} Bounding box of arc.
		 */
		boundingBox(): BoundingBox;
		/**
		 * @description Gets the point at the given arc parameter.
		 * @param {number} t Arc parameter to evaluate.
		 * @returns {number[]} The point at the given parameter.
		 */
		pointAt(t:number): number[];
		/**
		 * @description Gets the tangent at the given parameter.
		 * @param {number} t Parameter of tangent to evaluate.
		 * @returns {number[]} The tangent at the arc at the given parameter.
		 */
		tangentAt(t:number): number[];
		/**
		 * @description Gets parameter on the arc closest to a test point.
		 * @param {number[]} testPoint Point to get close to.
		 * @returns {number} Parameter (in radians) of the point on the arc that
		is closest to the test point. If testPoint is the center
		of the arc, then the starting point of the arc is
		(arc.Domain()[0]) returned. If no parameter could be found,
		RhinoMath.UnsetValue is returned.
		 */
		closestParameter(testPoint:number[]): number;
		/**
		 * @description Computes the point on an arc that is closest to a test point.
		 * @param {number[]} testPoint Point to get close to.
		 * @returns {number[]} The point on the arc that is closest to testPoint. If testPoint is
		the center of the arc, then the starting point of the arc is returned.
		UnsetPoint on failure.
		 */
		closestPoint(testPoint:number[]): number[];
		/**
		 * @description Reverses the orientation of the arc. Changes the domain from [a,b]
		to [-b,-a].
		 * @returns {void}
		 */
		reverse(): void;
		/**
		 * @description Transforms the arc using a Transformation matrix.
		 * @param {Transform} xform Transformations to apply.
		Note that arcs cannot handle non-euclidean transformations.
		 * @returns {boolean} true on success, false on failure.
		 */
		transform(xform:Transform): boolean;
		/**
		 * @description Initializes a nurbs curve representation of this arc.
		This amounts to the same as calling NurbsCurve.CreateFromArc().
		 * @returns {NurbsCurve} A nurbs curve representation of this arc or null if no such representation could be made.
		 */
		toNurbsCurve(): NurbsCurve;
	}

	class ArcCurve extends Curve {
		/**
		 * Gets a value indicating whether or not this curve can be represented by a complete circle.
		 */
		isCompleteCircle: boolean;
		/**
		 * Gets the radius of this ArcCurve.
		 */
		radius: number;
		/**
		 * Gets the angles of this arc in radians.
		 */
		angleRadians: number;
		/**
		 * Gets the angles of this arc in degrees.
		 */
		angleDegrees: number;
		/** ... */
		static createFromArc(): void;
		/** ... */
		static createFromArc(): void;
		/** ... */
		static createFromCircle(): void;
		/** ... */
		static createFromCircle(): void;
	}

	class ArchivableDictionary {
		/** ... */
		static encodeDict(): void;
		/** ... */
		static decodeDict(): void;
		/** ... */
		static writeGeometry(): void;
	}

	class BezierCurve {
		/**
		 * Dimension of Bezier
		 */
		dimension: number;
		/**
		 * Tests an object to see if it is valid.
		 */
		isValid: boolean;
		/**
		 * Gets a value indicating whether or not the curve is rational.
		 * Rational curves have control-points with custom weights.
		 */
		isRational: boolean;
		/**
		 * Number of control vertices in this curve
		 */
		controlVertexCount: number;
		/**
		 * @description Evaluates point at a curve parameter.
		 * @param {number} t Evaluation parameter.
		 * @returns {number[]} Point (location of curve at the parameter t).
		 */
		pointAt(t:number): number[];
		/**
		 * @description Evaluates the unit tangent vector at a curve parameter.
		 * @param {number} t Evaluation parameter.
		 * @returns {number[]} Unit tangent vector of the curve at the parameter t.
		 */
		tangentAt(t:number): number[];
		/**
		 * @description Evaluate the curvature vector at a curve parameter.
		 * @param {number} t Evaluation parameter.
		 * @returns {number[]} Curvature vector of the curve at the parameter t.
		 */
		curvatureAt(t:number): number[];
		/**
		 * @description Constructs a NURBS curve representation of this curve.
		 * @returns {NurbsCurve} NURBS representation of the curve on success, null on failure.
		 */
		toNurbsCurve(): NurbsCurve;
		/**
		 * @description Make bezier rational
		 * @returns {boolean} true if successful
		 */
		makeRational(): boolean;
		/**
		 * @description Make bezier non-rational
		 * @returns {boolean} true if successful
		 */
		makeNonRational(): boolean;
		/**
		 * @description Increase degree of bezier
		 * @returns {boolean} true if successful.  false if desiredDegree < current degree.
		 */
		increaseDegree(): boolean;
		/**
		 * @description Change dimension of bezier.
		 * @returns {boolean} true if successful.  false if desired_dimension < 1
		 */
		changeDimension(): boolean;
		/**
		 * @description Divides the Bezier curve at the specified parameter.
		 * @param {number} t parameter must satisfy 0 < t < 1
		 * @returns {boolean} true on success
		 */
		split(t:number): object;
	}

	class Bitmap {
		/**
		 */
		width: any;
		/**
		 */
		height: any;
		/**
		 */
		bitsPerPixel: any;
		/**
		 */
		sizeOfScan: any;
		/**
		 */
		sizeOfImage: any;
	}

	class BoundingBox {
		/**
		 * Gets a value that indicates whether or not this bounding box is valid.
		 * Empty boxes are not valid, and neither are boxes with unset points.
		 */
		isValid: boolean;
		/**
		 * Gets or sets the point in the minimal corner.
		 */
		min: number[];
		/**
		 * Gets or sets the point in the maximal corner.
		 */
		max: number[];
		/**
		 * Gets the point in the center of the bounding box.
		 */
		center: number[];
		/**
		 * Gets the area of this BoundingBox.
		 */
		area: number;
		/**
		 * Gets the volume of this BoundingBox.
		 */
		volume: number;
		/**
		 * Gets the diagonal vector of this BoundingBox.
		 * The diagonal connects the Min and Max points.
		 */
		diagonal: number[];

		constructor(min: number[], max: number[]);

		constructor(minX: number, minY: number, minZ: number, maxX: number, maxY: number, maxZ: number);
		/**
		 * @description Finds the closest point on or in the bounding box.
		 * @param {number[]} point Sample point.
		 * @returns {number[]} The point on or in the box that is closest to the sample point.
		 */
		closestPoint(point:number[]): number[];
		/**
		 * @description Inflates the box with equal amounts in all directions.
		Inflating with negative amounts may result in decreasing boxes.
		Invalid boxes can not be inflated.
		 * @param {number} amount Amount (in model units) to inflate this box in all directions.
		 * @returns {void}
		 */
		inflate(amount:number): void;
		/**
		 * @description Inflates the box with equal amounts in all directions.
		Inflating with negative amounts may result in decreasing boxes.
		Invalid boxes can not be inflated.
		 * @param {number} amount Amount (in model units) to inflate this box in all directions.
		 * @returns {void}
		 */
		inflate(amount:number): void;
		/**
		 * @description Tests a point for bounding box inclusion. This is the same as calling Contains(point, false)
		 * @param {number[]} point Point to test.
		 * @returns {boolean} true if the point is on the inside of or coincident with this bounding box; otherwise false.
		 */
		contains(point:number[]): boolean;
		/**
		 * @description Determines whether a bounding box is degenerate (flat) in one or more directions.
		 * @param {number} tolerance Distances <= tolerance will be considered to be zero.  If tolerance
		is negative (default), then a scale invariant tolerance is used.
		 * @returns {number} 0 = box is not degenerate
		1 = box is a rectangle (degenerate in one direction).
		2 = box is a line (degenerate in two directions).
		3 = box is a point (degenerate in three directions)
		4 = box is not valid.
		 */
		isDegenerate(tolerance:number): number;
		/**
		 * @description Updates this bounding box to be the smallest axis aligned
		bounding box that contains the transformed result of its 8 original corner
		points.
		 * @param {Transform} xform A transform.
		 * @returns {boolean} true if this operation is successful; otherwise false.
		 */
		transform(xform:Transform): boolean;
		/**
		 * @description Constructs a  representation of this bounding box.
		 * @returns {Brep} If this operation is successful, a Brep representation of this box; otherwise null.
		 */
		toBrep(): Brep;
		/**
		 * @description Updates this BoundingBox to represent the union of itself and another box.
		 * @param {BoundingBox} other Box to include in this union.
		 * @returns {void}
		 */
		static union(other:BoundingBox): void;
		/** ... */
		encode(): void;
		/** ... */
		toJSON(): void;
		/** ... */
		static decode(): void;
	}

	class Box {
		/**
		 * Gets the validity of this Box. Boxes are invalid when the base plane or any of
		 * the dimension intervals are invalid or decreasing.
		 */
		isValid: boolean;
		/**
		 * Gets the point that is in the center of the box.
		 */
		center: number[];
		/**
		 * Gets the total surface area of this box.
		 */
		area: number;
		/**
		 * Gets the total volume of this box.
		 */
		volume: number;
		/**
		 * @description Evaluates the box volume at the given unitized parameters.
		The box has idealized side length of 1x1x1.
		 * @param {number} x Unitized parameter (between 0 and 1 is inside the box) along box X direction.
		 * @param {number} y Unitized parameter (between 0 and 1 is inside the box) along box Y direction.
		 * @param {number} z Unitized parameter (between 0 and 1 is inside the box) along box Z direction.
		 * @returns {number[]} The point at (x,y,z).
		 */
		pointAt(x:number,y:number,z:number): number[];
		/**
		 * @description Finds the closest point on or in the Box. The box should be Valid for this to work.
		 * @param {number[]} point Sample point.
		 * @returns {number[]} The point on or in the box that is closest to the sample point.
		 */
		closestPoint(point:number[]): number[];
		/**
		 * @description Transforms this Box using a Transformation matrix. If the Transform does not preserve
		Similarity, the dimensions of the resulting box cannot be trusted.
		 * @param {Transform} xform Transformation matrix to apply to this Box.
		 * @returns {boolean} true if the Box was successfully transformed, false if otherwise.
		 */
		transform(xform:Transform): boolean;
	}

	class Brep extends GeometryBase {
		/**
		 * Determines whether this brep is a solid, or a closed oriented manifold.
		 */
		isSolid: boolean;
		/**
		 * Gets a value indicating whether or not the Brep is manifold.
		 * Non-Manifold breps have at least one edge that is shared among three or more faces.
		 */
		isManifold: boolean;
		/**
		 * Returns true if the Brep has a single face and that face is geometrically the same
		 * as the underlying surface.  I.e., the face has trivial trimming.
		 * In this case, the surface is the first face surface. The flag
		 * Brep.Faces[0].OrientationIsReversed records the correspondence between the surface's
		 * natural parametric orientation and the orientation of the Brep.trivial trimming here means that there is only one loop curve in the brep
		 * and that loop curve is the same as the underlying surface boundary.
		 */
		isSurface: boolean;
		/**
		 * @description Attempts to convert a generic Geometry object into a Brep.
		 * @param {GeometryBase} geometry Geometry to convert, not all types of GeometryBase can be represented by BReps.
		 * @returns {Brep} Brep if a brep form could be created or null if this is not possible. If geometry was of type Brep to
		begin with, the same object is returned, i.e. it is not duplicated.
		 */
		static tryConvertBrep(geometry:GeometryBase): Brep;
		/**
		 * @description Create a brep representation of a mesh
		 * @param {boolean} trimmedTriangles if true, triangles in the mesh will be represented by trimmed planes in
		the brep. If false, triangles in the mesh will be represented by
		untrimmed singular bilinear NURBS surfaces in the brep.
		 * @returns {Brep}
		 */
		static createFromMesh(trimmedTriangles:boolean): Brep;
		/**
		 * @description Constructs new brep that matches a bounding box.
		 * @param {BoundingBox} box A box to use for creation.
		 * @returns {Brep} A new brep; or null on failure.
		 */
		static createFromBox(box:BoundingBox): Brep;
		/**
		 * @description Constructs a Brep definition of a cylinder.
		 * @param {Cylinder} cylinder cylinder.IsFinite() must be true.
		 * @param {boolean} capBottom if true end at cylinder.m_height[0] should be capped.
		 * @param {boolean} capTop if true end at cylinder.m_height[1] should be capped.
		 * @returns {Brep} A Brep representation of the cylinder with a single face for the cylinder,
		an edge along the cylinder seam, and vertices at the bottom and top ends of this
		seam edge. The optional bottom/top caps are single faces with one circular edge
		starting and ending at the bottom/top vertex.
		 */
		static createFromCylinder(cylinder:Cylinder,capBottom:boolean,capTop:boolean): Brep;
		/**
		 * @description Constructs a Brep definition of a sphere.
		 * @param {Sphere} sphere The input sphere provides the orienting plane and radius.
		 * @returns {Brep} A Brep if successful, null on error.
		 */
		static createFromSphere(sphere:Sphere): Brep;
		/**
		 * @description Constructs a Brep definition of a quad sphere.
		 * @param {Sphere} sphere The input sphere provides the orienting plane and radius.
		 * @returns {Brep} A Brep if successful, null on error.
		 */
		static createQuadSphere(sphere:Sphere): Brep;
		/**
		 * @description Constructs a Brep representation of the cone with a single
		face for the cone, an edge along the cone seam,
		and vertices at the base and apex ends of this seam edge.
		The optional cap is a single face with one circular edge
		starting and ending at the base vertex.
		 * @param {Cone} cone A cone value.
		 * @param {boolean} capBottom if true the base of the cone should be capped.
		 * @returns {Brep} A Brep if successful, null on error.
		 */
		static createFromCone(cone:Cone,capBottom:boolean): Brep;
		/**
		 * @description Constructs a brep form of a surface of revolution.
		 * @param {RevSurface} surface The surface of revolution.
		 * @param {boolean} capStart if true, the start of the revolute is not on the axis of revolution,
		and the surface of revolution is closed, then a circular cap will be
		added to close of the hole at the start of the revolute.
		 * @param {boolean} capEnd if true, the end of the revolute is not on the axis of revolution,
		and the surface of revolution is closed, then a circular cap will be
		added to close of the hole at the end of the revolute.
		 * @returns {Brep} A Brep if successful, null on error.
		 */
		static createFromRevSurface(surface:RevSurface,capStart:boolean,capEnd:boolean): Brep;
		/**
		 * @description Constructs a Brep from a surface. The resulting Brep has an outer boundary made
		from four trims. The trims are ordered so that they run along the south, east,
		north, and then west side of the surface's parameter space.
		 * @param {Surface} surface A surface to convert.
		 * @returns {Brep} Resulting brep or null on failure.
		 */
		static createFromSurface(surface:Surface): Brep;
		/**
		 * @description Create a Brep trimmed plane.
		 * @param {Plane} plane Plane that will be trimmed.
		 * @param {Curve} curve A simple (no self intersections) closed curve that defines the outer boundary of the trimmed plane.
		 * @returns {Brep} Resulting brep or null on failure.
		 */
		static createTrimmedPlane(plane:Plane,curve:Curve): Brep;
		/** ... */
		faces(): void;
		/** ... */
		surfaces(): void;
		/** ... */
		edges(): void;
		/** ... */
		vertices(): void;
		/**
		 * @description Reverses entire brep orientation of all faces.
		 * @returns {void}
		 */
		flip(): void;
	}

	class BrepEdge extends CurveProxy {
	}

	class BrepEdgeList {
		/**
		 * Gets the number of brep edges.
		 */
		count: number;
		/** ... */
		get(): void;
	}

	class BrepFace extends SurfaceProxy {
		/**
		 * @description Gets the untrimmed surface that is the base of this face.
		 * @returns {Surface} A surface, or null on error.
		 */
		underlyingSurface(): Surface;
		/**
		 * @description Extrude a face in a Brep.
		 * @param {Curve} pathCurve The path to extrude along. Note, the direction of the extrusion will follow the direction of the curve.
		 * @param {boolean} cap If true, the extrusion is capped with a translation of the face being extruded
		 * @returns {Brep} A Brep on success or null on failure.
		 */
		createExtrusion(pathCurve:Curve,cap:boolean): Brep;
		/**
		 * @description Duplicate a face from the brep to create new single face brep.
		 * @param {boolean} duplicateMeshes If true, shading meshes will be copied as well.
		 * @returns {Brep} A new single-face brep synonymous with the current Face.
		 */
		duplicateFace(duplicateMeshes:boolean): Brep;
		/**
		 * @description Gets a copy to the untrimmed surface that this face is based on.
		 * @returns {Surface} A copy of this face's underlying surface.
		 */
		duplicateSurface(): Surface;
		/**
		 * @description Obtains a reference to a specified type of mesh for this brep face.
		 * @param {MeshType} meshType The mesh type.
		 * @returns {Mesh} A mesh.
		 */
		getMesh(meshType:MeshType): Mesh;
		/**
		 * @description Sets a reference to a specified type of mesh for this brep face.
		 * @param {MeshType} meshType The mesh type.
		 * @param {Mesh} mesh The new mesh.
		 * @returns {boolean} true if the operation succeeded; otherwise false.
		 */
		setMesh(meshType:MeshType,mesh:Mesh): boolean;
	}

	class BrepFaceList {
		/**
		 * Gets the number of brep faces.
		 */
		count: number;
		/** ... */
		get(): void;
	}

	class BrepSurfaceList {
		/**
		 * Gets the number of surfaces in a brep.
		 */
		count: number;
		/** ... */
		get(): void;
	}

	class BrepVertex extends Point {
		/**
		 * Gets the index of this vertex in the Brep.Vertices collection.
		 */
		vertexIndex: number;
		/**
		 */
		edgeCount: any;
		/**
		 */
		edgeIndices: any;
	}

	class BrepVertexList {
		/**
		 * Gets the number of brep vertices.
		 */
		count: number;
		/** ... */
		get(): void;
	}

	class Circle {
		/**
		 * A valid circle has radius larger than 0.0 and a base plane which is must also be valid.
		 */
		isValid: boolean;
		/**
		 * Gets or sets the radius of this circle.
		 * Radii should be positive values.
		 */
		radius: number;
		/**
		 * Gets or sets the diameter (radius * 2.0) of this circle.
		 * Diameters should be positive values.
		 */
		diameter: number;
		/**
		 * Gets or sets the plane of the circle.
		 */
		plane: Plane;
		/**
		 * Gets or sets the center point of this circle.
		 */
		center: number[];
		/**
		 * Gets the circle's 3d axis aligned bounding box.
		 */
		boundingBox: BoundingBox;
		/**
		 * Gets the normal vector for this circle.
		 */
		normal: number[];
		/**
		 * Gets or sets the circumference of this circle.
		 */
		circumference: number;

		constructor(radius: number);

		constructor(center: number[], radius: number);
		/**
		 * @description Evaluates whether or not this circle is co-planar with a given plane.
		 * @param {Plane} plane Plane.
		 * @param {number} tolerance Tolerance to use.
		 * @returns {boolean} true if the circle plane is co-planar with the given plane within tolerance.
		 */
		isInPlane(plane:Plane,tolerance:number): boolean;
		/**
		 * @description Circles use trigonometric parameterization:
		t -> center + cos(t)*radius*xaxis + sin(t)*radius*yaxis.
		 * @param {number} t Parameter of point to evaluate.
		 * @returns {number[]} The point on the circle at the given parameter.
		 */
		pointAt(t:number): number[];
		/**
		 * @description Circles use trigonometric parameterization:
		t -> center + cos(t)*radius*xaxis + sin(t)*radius*yaxis.
		 * @param {number} t Parameter of tangent to evaluate.
		 * @returns {number[]} The tangent at the circle at the given parameter.
		 */
		tangentAt(t:number): number[];
		/**
		 * @description Determines the value of the Nth derivative at a parameter.
		 * @param {number} derivative Which order of derivative is wanted.
		 * @param {number} t Parameter to evaluate derivative. Valid values are 0, 1, 2 and 3.
		 * @returns {number[]} The derivative of the circle at the given parameter.
		 */
		derivativeAt(derivative:number,t:number): number[];
		/**
		 * @description Gets the parameter on the circle which is closest to a test point.
		 * @param {number[]} testPoint Point to project onto the circle.
		 * @returns {Array} [boolean, number]
		 * (boolean) true on success, false on failure.
		 * (number) Parameter on circle closes to testPoint.
		 */
		closestParameter(testPoint:number[]): object;
		/**
		 * @description Gets the point on the circle which is closest to a test point.
		 * @param {number[]} testPoint Point to project onto the circle.
		 * @returns {number[]} The point on the circle that is closest to testPoint or
		Point3d.Unset on failure.
		 */
		closestPoint(testPoint:number[]): number[];
		/**
		 * @description Transforms this circle using an transformation matrix.
		 * @param {Transform} xform Transformation to apply.
		 * @returns {boolean} true on success, false on failure.
		 */
		transform(xform:Transform): boolean;
		/**
		 * @description Moves the circle.
		 * @param {number[]} delta Translation vector.
		 * @returns {boolean} true on success, false on failure.
		 */
		translate(delta:number[]): boolean;
		/**
		 * @description Reverse the orientation of the circle. Changes the domain from [a,b]
		to [-b,-a].
		 * @returns {void}
		 */
		reverse(): void;
		/**
		 * @description Constructs a nurbs curve representation of this circle.
		This amounts to the same as calling NurbsCurve.CreateFromCircle().
		 * @returns {NurbsCurve} A nurbs curve representation of this circle or null if no such representation could be made.
		 */
		toNurbsCurve(): NurbsCurve;
	}

	class CommonObject {
		/**
		 * Tests an object to see if it is valid.
		 */
		isValid: boolean;
		/**
		 */
		userStringCount: any;
		/** ... */
		encode(): void;
		/**
		 * @description Create a JSON string representation of this object
		 * @returns {string}
		 */
		toJSON(): string;
		/** ... */
		static decode(): void;
		/** ... */
		setUserString(): void;
		/** ... */
		getUserString(): void;
		/** ... */
		getUserStrings(): void;
		/** ... */
		rdkXml(): void;
	}

	class ComponentIndex {
		/**
		 * The interpretation of Index depends on the Type value.
		 * Type             m_index interpretation (0 based indices)
		 * no_type            used when context makes it clear what array is being index
		 * brep_vertex        Brep.m_V[] array index
		 * brep_edge          Brep.m_E[] array index
		 * brep_face          Brep.m_F[] array index
		 * brep_trim          Brep.m_T[] array index
		 * brep_loop          Brep.m_L[] array index
		 * mesh_vertex        Mesh.m_V[] array index
		 * meshtop_vertex     MeshTopology.m_topv[] array index
		 * meshtop_edge       MeshTopology.m_tope[] array index
		 * mesh_face          Mesh.m_F[] array index
		 * idef_part          InstanceDefinition.m_object_uuid[] array index
		 * polycurve_segment  PolyCurve::m_segment[] array index
		 * dim_linear_point   LinearDimension2::POINT_INDEX
		 * dim_radial_point   RadialDimension2::POINT_INDEX
		 * dim_angular_point  AngularDimension2::POINT_INDEX
		 * dim_ordinate_point OrdinateDimension2::POINT_INDEX
		 * dim_text_point     TextEntity2 origin point.
		 */
		componentIndexType: ComponentIndexType;
		/**
		 * The interpretation of m_index depends on the m_type value.
		 * m_type             m_index interpretation (0 based indices)
		 * no_type            used when context makes it clear what array is being index
		 * brep_vertex        Brep.m_V[] array index
		 * brep_edge          Brep.m_E[] array index
		 * brep_face          Brep.m_F[] array index
		 * brep_trim          Brep.m_T[] array index
		 * brep_loop          Brep.m_L[] array index
		 * mesh_vertex        Mesh.m_V[] array index
		 * meshtop_vertex     MeshTopology.m_topv[] array index
		 * meshtop_edge       MeshTopology.m_tope[] array index
		 * mesh_face          Mesh.m_F[] array index
		 * idef_part          InstanceDefinition.m_object_uuid[] array index
		 * polycurve_segment  PolyCurve::m_segment[] array index
		 * dim_linear_point   LinearDimension2::POINT_INDEX
		 * dim_radial_point   RadialDimension2::POINT_INDEX
		 * dim_angular_point  AngularDimension2::POINT_INDEX
		 * dim_ordinate_point OrdinateDimension2::POINT_INDEX
		 * dim_text_point     TextEntity2 origin point.
		 */
		index: number;
	}

	class Cone {
		/**
		 * Gets or sets the height of the circular right cone.
		 */
		height: number;
		/**
		 * Gets or sets the radius of the cone.
		 */
		radius: number;
		/**
		 * true if plane is valid, height is not zero and radius is not zero.
		 */
		isValid: boolean;
		/**
		 * Center of base circle.
		 */
		basePoint: number[];
		/**
		 * Point at tip of the cone.
		 */
		apexPoint: number[];
		/**
		 * Unit vector axis of cone.
		 */
		axis: number[];
		/**
		 */
		angleInRadians: any;
		/**
		 */
		angleInDegrees: any;
		/**
		 * @description Constructs a Nurbs surface representation of this Cone.
		This is synonymous with calling NurbsSurface.CreateFromCone().
		 * @returns {NurbsSurface} A Nurbs surface representation of the cone or null.
		 */
		toNurbsSurface(): NurbsSurface;
		/**
		 * @description Gets a Brep representation of the cone with a single
		face for the cone, an edge along the cone seam,
		and vertices at the base and apex ends of this seam edge.
		The optional cap is a single face with one circular edge
		starting and ending at the base vertex.
		 * @param {boolean} capBottom true if the bottom should be filled with a surface. false otherwise.
		 * @returns {Brep} A brep (polysurface) representation of this cone values.
		 */
		toBrep(capBottom:boolean): Brep;
	}

	class ConstructionPlane {
		/**
		 * Gets or sets the geometric plane to use for construction.
		 */
		plane: Plane;
		/**
		 * Gets or sets the distance between grid lines.
		 */
		gridSpacing: number;
		/**
		 * when "grid snap" is enabled, the distance between snap points.
		 * Typically this is the same distance as grid spacing.
		 */
		snapSpacing: number;
		/**
		 * Gets or sets the total amount of grid lines in each direction.
		 */
		gridLineCount: number;
		/**
		 * Gets or sets the recurrence of a wider line on the grid.
		 * 0: No lines are thick, all are drawn thin.1: All lines are thick.2: Every other line is thick.3: One line in three lines is thick (and two are thin).4: ...
		 */
		thickLineFrequency: number;
		/**
		 * Gets or sets whether the grid is drawn on top of geometry.
		 * false=grid is always drawn behind 3d geometrytrue=grid is drawn at its depth as a 3d plane and grid lines obscure things behind the grid.
		 */
		depthBuffered: boolean;
		/**
		 * Gets or sets the name of the construction plane.
		 */
		name: string;
	}

	class Curve extends GeometryBase {
		/**
		 * Gets or sets the domain of the curve.
		 */
		domain: number[];
		/**
		 * Gets the dimension of the object.
		 * The dimension is typically three. For parameter space trimming
		 * curves the dimension is two. In rare cases the dimension can
		 * be one or greater than three.
		 */
		dimension: number;
		/**
		 * Gets the number of non-empty smooth (c-infinity) spans in the curve.
		 */
		spanCount: number;
		/**
		 * Gets the maximum algebraic degree of any span
		 * or a good estimate if curve spans are not algebraic.
		 */
		degree: number;
		/**
		 * Gets a value indicating whether or not this curve is a closed curve.
		 */
		isClosed: boolean;
		/**
		 * Gets a value indicating whether or not this curve is considered to be Periodic.
		 */
		isPeriodic: boolean;
		/**
		 * Evaluates point at the start of the curve.
		 */
		pointAtStart: number[];
		/**
		 * Evaluates point at the end of the curve.
		 */
		pointAtEnd: number[];
		/**
		 * Evaluates the unit tangent vector at the start of the curve.
		 */
		tangentAtStart: number[];
		/**
		 * Evaluate unit tangent vector at the end of the curve.
		 */
		tangentAtEnd: number[];
		/**
		 * @description Changes the dimension of a curve.
		 * @param {number} desiredDimension The desired dimension.
		 * @returns {boolean} true if the curve's dimension was already desiredDimension
		or if the curve's dimension was successfully changed to desiredDimension;
		otherwise false.
		 */
		changeDimension(desiredDimension:number): boolean;
		/**
		 * @description Test a curve to see if it is linear to within RhinoMath.ZeroTolerance units (1e-12).
		 * @returns {boolean} true if the curve is linear.
		 */
		isLinear(): boolean;
		/**
		 * @description Several types of Curve can have the form of a polyline
		including a degree 1 NurbsCurve, a PolylineCurve,
		and a PolyCurve all of whose segments are some form of
		polyline. IsPolyline tests a curve to see if it can be
		represented as a polyline.
		 * @returns {boolean} true if this curve can be represented as a polyline; otherwise, false.
		 */
		isPolyline(): boolean;
		/**
		 * @description Several types of Curve can have the form of a polyline
		including a degree 1 NurbsCurve, a PolylineCurve,
		and a PolyCurve all of whose segments are some form of
		polyline. IsPolyline tests a curve to see if it can be
		represented as a polyline.
		 * @returns {Array} [boolean, Polyline]
		 * (boolean) true if this curve can be represented as a polyline; otherwise, false.
		 * (Polyline) If true is returned, then the polyline form is returned here.
		 */
		tryGetPolyline(): object;
		/**
		 * @description Test a curve to see if it can be represented by an arc or circle within RhinoMath.ZeroTolerance.
		 * @returns {boolean} true if the curve can be represented by an arc or a circle within tolerance.
		 */
		isArc(): boolean;
		/**
		 * @description Try to convert this curve into an Arc using RhinoMath.ZeroTolerance.
		 * @returns {Array} [boolean, Arc]
		 * (boolean) true if the curve could be converted into an arc.
		 * (Arc) On success, the Arc will be filled in.
		 */
		tryGetArc(): object;
		/**
		 * @description Test a curve to see if it can be represented by a circle within RhinoMath.ZeroTolerance.
		 * @returns {boolean} true if the Curve can be represented by a circle within tolerance.
		 */
		isCircle(): boolean;
		/**
		 * @description Try to convert this curve into a circle using RhinoMath.ZeroTolerance.
		 * @returns {Array} [boolean, Circle]
		 * (boolean) true if the curve could be converted into a Circle.
		 * (Circle) On success, the Circle will be filled in.
		 */
		tryGetCircle(): object;
		/**
		 * @description Test a curve to see if it can be represented by an ellipse within RhinoMath.ZeroTolerance.
		 * @returns {boolean} true if the Curve can be represented by an ellipse within tolerance.
		 */
		isEllipse(): boolean;
		/**
		 * @description Test a curve for planarity.
		 * @returns {boolean} true if the curve is planar (flat) to within RhinoMath.ZeroTolerance units (1e-12).
		 */
		isPlanar(): boolean;
		/**
		 * @description If this curve is closed, then modify it so that the start/end point is at curve parameter t.
		 * @param {number} t Curve parameter of new start/end point. The returned curves domain will start at t.
		 * @returns {boolean} true on success, false on failure.
		 */
		changeClosedCurveSeam(t:number): boolean;
		/**
		 * @description Reverses the direction of the curve.
		 * @returns {boolean} true on success, false on failure.
		 */
		reverse(): boolean;
		/**
		 * @description Evaluates point at a curve parameter.
		 * @param {number} t Evaluation parameter.
		 * @returns {number[]} Point (location of curve at the parameter t).
		 */
		pointAt(t:number): number[];
		/**
		 * @description Forces the curve to start at a specified point.
		Not all curve types support this operation.
		 * @param {number[]} point New start point of curve.
		 * @returns {boolean} true on success, false on failure.
		 */
		setStartPoint(point:number[]): boolean;
		/**
		 * @description Forces the curve to end at a specified point.
		Not all curve types support this operation.
		 * @param {number[]} point New end point of curve.
		 * @returns {boolean} true on success, false on failure.
		 */
		setEndPoint(point:number[]): boolean;
		/**
		 * @description Evaluates the unit tangent vector at a curve parameter.
		 * @param {number} t Evaluation parameter.
		 * @returns {number[]} Unit tangent vector of the curve at the parameter t.
		 */
		tangentAt(t:number): number[];
		/**
		 * @description Evaluate the curvature vector at a curve parameter.
		 * @param {number} t Evaluation parameter.
		 * @returns {number[]} Curvature vector of the curve at the parameter t.
		 */
		curvatureAt(t:number): number[];
		/**
		 * @description Returns a 3d frame at a parameter.
		 * @param {number} t Evaluation parameter.
		 * @returns {Array} [boolean, Plane]
		 * (boolean) true on success, false on failure.
		 * (Plane) The frame is returned here.
		 */
		frameAt(t:number): object;
		/**
		 * @description Convert a NURBS curve parameter to a curve parameter.
		 * @param {number} nurbsParameter NURBS form parameter.
		 * @returns {Array} [boolean, number]
		 * (boolean) true on success, false on failure.
		 * (number) Curve parameter.
		 */
		getCurveParameterFromNurbsFormParameter(nurbsParameter:number): object;
		/**
		 * @description Convert a curve parameter to a NURBS curve parameter.
		 * @param {number} curveParameter Curve parameter.
		 * @returns {Array} [boolean, number]
		 * (boolean) true on success, false on failure.
		 * (number) NURBS form parameter.
		 */
		getNurbsFormParameterFromCurveParameter(curveParameter:number): object;
		/**
		 * @description Removes portions of the curve outside the specified interval.
		 * @param {number} t0 Start of the trimming interval. Portions of the curve before curve(t0) are removed.
		 * @param {number} t1 End of the trimming interval. Portions of the curve after curve(t1) are removed.
		 * @returns {Curve} Trimmed portion of this curve is successful, null on failure.
		 */
		trim(t0:number,t1:number): Curve;
		/**
		 * @description Splits (divides) the curve at the specified parameter.
		The parameter must be in the interior of the curve's domain.
		 * @param {number} t Parameter to split the curve at in the interval returned by Domain().
		 * @returns {Curve[]} Two curves on success, null on failure.
		 */
		split(t:number): Curve[];
		/**
		 * @description Constructs a NURBS curve representation of this curve.
		 * @returns {NurbsCurve} NURBS representation of the curve on success, null on failure.
		 */
		toNurbsCurve(): NurbsCurve;
	}

	class CurvePiping {
		/**
		 */
		on: any;
		/**
		 */
		radius: any;
		/**
		 */
		segments: any;
		/**
		 */
		faceted: any;
		/**
		 */
		accuracy: any;
		/**
		 */
		capType: any;
	}

	class CurveProxy extends Curve {
		/**
		 * True if "this" is a curve is reversed from the "real" curve geometry
		 */
		proxyCurveIsReversed: boolean;
	}

	class Cylinder {
		/**
		 * Gets a boolean value indicating whether this cylinder is valid.
		 * A valid cylinder is represented by a valid circle and two valid heights.
		 */
		isValid: boolean;
		/**
		 * true if the cylinder is finite (Height0 != Height1)
		 * false if the cylinder is infinite.
		 */
		isFinite: boolean;
		/**
		 * Gets the center point of the defining circle.
		 */
		center: number[];
		/**
		 * Gets the axis direction of the cylinder.
		 */
		axis: number[];
		/**
		 * Gets the height of the cylinder.
		 * Infinite cylinders have a height of zero, not Double.PositiveInfinity.
		 */
		totalHeight: number;
		/**
		 * Gets or sets the start height of the cylinder.
		 * The center of bottom cap is: BasePlane.Origin + Height1 * BasePlane.ZAxis.
		 */
		height1: number;
		/**
		 * Gets or sets the end height of the cylinder.
		 * If the end height equals the start height, the cylinder is
		 * presumed to be infinite.
		 * The center of top cap is: BasePlane.Origin + Height2 * BasePlane.ZAxis.
		 */
		height2: number;
		/**
		 * Gets or sets the radius of the cylinder.
		 */
		radius: number;

		constructor(baseCircle: Circle);

		constructor(baseCircle: Circle, height: number);
		/**
		 * @description Compute the circle at the given elevation parameter.
		 * @param {number} linearParameter Height parameter for circle section.
		 * @returns {Circle}
		 */
		circleAt(linearParameter:number): Circle;
		/**
		 * @description Constructs a Brep representation of this Cylinder.
		This is synonymous with calling NurbsSurface.CreateFromCylinder().
		 * @param {boolean} capBottom If true, the bottom of the cylinder will be capped.
		 * @param {boolean} capTop If true, the top of the cylinder will be capped.
		 * @returns {Brep} A Brep representation of the cylinder or null.
		 */
		toBrep(capBottom:boolean,capTop:boolean): Brep;
		/**
		 * @description Constructs a Nurbs surface representation of this cylinder.
		This is synonymous with calling NurbsSurface.CreateFromCylinder().
		 * @returns {NurbsSurface} A Nurbs surface representation of the cylinder or null.
		 */
		toNurbsSurface(): NurbsSurface;
	}

	class Decal {
		/**
		 * Gets the texture ID for this decal.
		 */
		textureInstanceId: string;
		/**
		 */
		mapping: any;
		/**
		 */
		projection: any;
		/**
		 * Used only when mapping is cylindrical or spherical.
		 */
		mapToInside: boolean;
		/**
		 * Gets the decal's transparency in the range 0 to 1.
		 */
		transparency: number;
		/**
		 * Gets the origin of the decal in world space.
		 */
		origin: Rhino.Point3d;
		/**
		 * For cylindrical and spherical mapping, the vector is unitized.
		 */
		vectorUp: Rhino.Vector3d;
		/**
		 * Gets the vector across. For cylindrical and spherical mapping, the vector is unitized.
		 */
		vectorAcross: Rhino.Vector3d;
		/**
		 * Gets the height of the decal. Only used when mapping is cylindrical.
		 */
		height: number;
		/**
		 * Gets the radius of the decal. Only used when mapping is cylindrical or spherical.
		 */
		radius: number;
		/**
		 */
		horzSweepStart: any;
		/**
		 */
		horzSweepEnd: any;
		/**
		 */
		vertSweepStart: any;
		/**
		 */
		vertSweepEnd: any;
		/**
		 */
		boundsMinU: any;
		/**
		 */
		boundsMinV: any;
		/**
		 */
		boundsMaxU: any;
		/**
		 */
		boundsMaxV: any;
	}

	class DimensionStyle extends CommonObject {
		/**
		 */
		name: any;
		/**
		 */
		arrowBlockId1: string;
		/**
		 */
		arrowBlockId2: string;
		/**
		 */
		leaderArrowBlockId: string;
		/**
		 */
		suppressExtension1: boolean;
		/**
		 */
		suppressExtension2: boolean;
		/**
		 */
		suppressArrow1: boolean;
		/**
		 */
		suppressArrow2: boolean;
		/**
		 */
		alternateBelowLine: boolean;
		/**
		 */
		drawTextMask: boolean;
		/**
		 */
		leaderHasLanding: boolean;
		/**
		 */
		drawForward: boolean;
		/**
		 */
		textUnderlined: boolean;
		/**
		 */
		arrowLength: number;
		/**
		 */
		leaderArrowLength: number;
		/**
		 */
		centermarkSize: number;
		/**
		 */
		textGap: number;
		/**
		 */
		textHEight: number;
		/**
		 */
		lengthFactor: number;
		/**
		 */
		alternateLengthFactor: number;
		/**
		 */
		toleranceUpperValue: number;
		/**
		 */
		toleranceLowerValue: number;
		/**
		 */
		toleranceHeightScale: number;
		/**
		 */
		baselineSpacing: number;
		/**
		 */
		textRotation: number;
		/**
		 */
		stackHeightScale: number;
		/**
		 */
		leaderLandingLength: number;
		/**
		 * Checks if any fields in this DimensionStyle are overrides
		 */
		hasFieldOverrides: boolean;
		/**
		 * Tests if this DimensionStyle is a child of any other DimensionStyle
		 */
		isChild: boolean;
		/**
		 * Get or Set the Id of this DimensionStyle's parent.
		 * If ParentId is Guid.Empty, this DimensionStyle has no parent
		 */
		parentId: string;
		/** ... */
		getFont(): void;
		/** ... */
		setFont(): void;
		/**
		 * @description Scales all length values by 'scale'
		 * @returns {void}
		 */
		scaleLengthValues(): void;
		/**
		 * @description Sets all the fields in this DimensionStyle to be not overridden
		Does not change any dimstyle_id's or parent_id's
		 * @returns {void}
		 */
		clearAllFieldOverrides(): void;
		/**
		 * @description Tests if this DimensionStyle is a child of a specific DimensionStyle
		 * @returns {boolean} True if this is a child of the DimensionStyle with Parent
		False otherwise.
		 */
		isChildOf(): boolean;
	}

	class Displacement {
		/**
		 */
		on: any;
		/**
		 */
		texture: any;
		/**
		 */
		blackPoint: any;
		/**
		 */
		whitePoint: any;
		/**
		 */
		postWeldAngle: any;
		/**
		 */
		fairingOn: any;
		/**
		 */
		fairing: any;
		/**
		 */
		finalMaxFaces: any;
		/**
		 */
		finalMaxFacesOn: any;
		/**
		 */
		initialQuality: any;
		/**
		 */
		mappingChannel: any;
		/**
		 */
		meshMemoryLimit: any;
		/**
		 */
		refineSteps: any;
		/**
		 */
		refineSensitivity: any;
		/**
		 */
		sweepResolutionFormula: any;
	}

	class Dithering {
		/**
		 */
		enabled: boolean;
		/**
		 */
		method: Methods;
	}

	class DracoCompression {
		/** ... */
		static compress(): void;
		/** ... */
		static compress(): void;
		/** ... */
		static decompressByteArray(): void;
		/** ... */
		static decompressBase64String(): void;
		/** ... */
		toBase64String(): void;
	}

	class DracoCompressionOptions {
		/**
		 */
		compressionLevel: any;
		/**
		 */
		positionQuantizationBits: any;
		/**
		 */
		textureCoordintateQuantizationBits: any;
		/**
		 */
		normalQuantizationBits: any;
		/**
		 */
		includeNormals: any;
		/**
		 */
		includeTextureCoordinates: any;
		/**
		 */
		includeVertexColors: any;
	}

	class EarthAnchorPoint {
		/**
		 * Gets or sets a point latitude on earth, in degrees.
		 * +90 = north pole, 0 = equator, -90 = south pole.
		 */
		earthBasepointLatitude: number;
		/**
		 * Gets or sets the point longitude on earth, in degrees.
		 */
		earthBasepointLongitude: number;
		/**
		 * Gets or sets the point elevation on earth, in meters.
		 */
		earthBasepointElevation: number;
		/**
		 * Gets or sets a value indicating the zero level convention relating to a location on Earth.
		 */
		earthBasepointElevationZero: BasepointZero;
		/**
		 * Corresponding model point in model coordinates.
		 */
		modelBasePoint: number[];
		/**
		 * Earth directions in model coordinates.
		 */
		modelNorth: number[];
		/**
		 * Earth directions in model coordinates.
		 */
		modelEast: number[];
		/**
		 * Gets or sets the short form of the identifying information about this location.
		 */
		name: string;
		/**
		 * Gets or sets the long form of the identifying information about this location.
		 */
		description: string;
		/**
		 * @description Checks if the earth location is set or not.
		 * @returns {boolean} Boolean value, true if set else false
		 */
		earthLocationIsSet(): boolean;
		/**
		 * @description Returns a plane in model coordinates whose X axis points East,
		Y axis points North and Z axis points Up. The origin
		is set to ModelBasepoint.
		 * @returns {Plane} A plane value. This might be invalid on error.
		 */
		getModelCompass(): Plane;
		/**
		 * @description Gets a transformation from model coordinates to earth coordinates.
		This transformation assumes the model is small enough that
		the curvature of the earth can be ignored.
		 * @param {UnitSystem} modelUnitSystem The model unit system.
		 * @returns {Transform} Transform on success. Invalid Transform on error.
		 */
		getModelToEarthTransform(modelUnitSystem:UnitSystem): Transform;
	}

	class EdgeSoftening {
		/**
		 */
		on: any;
		/**
		 */
		softening: any;
		/**
		 */
		chamfer: any;
		/**
		 */
		faceted: any;
		/**
		 */
		edgeAngleThreshold: any;
		/**
		 */
		forceSoftening: any;
	}

	class Ellipse {
	}

	class EmbeddedFile {
		/**
		 */
		length: any;
		/**
		 */
		fileName: any;
		/** ... */
		static read(): void;
		/** ... */
		write(): void;
		/** ... */
		clear(): void;
	}

	class Environment {
		/**
		 * The background color.
		 */
		backgroundColor: number[];
		/**
		 * The background projection.
		 */
		backgroundProjection: BackgroundProjections;
		/** ... */
		getBackgroundImage(): void;
		/** ... */
		setBackgroundImage(): void;
	}

	class Extrusion extends Surface {
		/**
		 * Gets the start point of the path.
		 */
		pathStart: number[];
		/**
		 * Gets the end point of the path.
		 */
		pathEnd: number[];
		/**
		 * Gets the up vector of the path.
		 */
		pathTangent: number[];
		/**
		 * Gets or sets the normal of the miter plane at the start in profile coordinates.
		 * In profile coordinates, 0,0,1 always maps to the extrusion axis
		 */
		miterPlaneNormalAtStart: number[];
		/**
		 * Gets or sets the normal of the miter plane at the end in profile coordinates.
		 * In profile coordinates, 0,0,1 always maps to the extrusion axis
		 */
		miterPlaneNormalAtEnd: number[];
		/**
		 * Returns a value indicating whether a miter plane at start is defined.
		 */
		isMiteredAtStart: boolean;
		/**
		 * Gets a value indicating whether a miter plane at the end is defined.
		 */
		isMiteredAtEnd: boolean;
		/**
		 * Gets a value indicating whether there is no gap among all surfaces constructing this object.
		 */
		isSolid: boolean;
		/**
		 * Gets a value indicating whether the surface that fills the bottom profile is existing.
		 */
		isCappedAtBottom: boolean;
		/**
		 * Gets a value indicating whether the surface that fills the top profile is existing.
		 */
		isCappedAtTop: boolean;
		/**
		 * Gets the amount of capping surfaces.
		 */
		capCount: number;
		/**
		 * Gets the amount of profile curves.
		 */
		profileCount: number;
		/**
		 * @description Creates an extrusion of a 3d curve (which must be planar) and a height.
		 * @param {Curve} planarCurve Planar curve used as profile
		 * @param {number} height If the height > 0, the bottom of the extrusion will be in plane and
		the top will be height units above the plane.
		If the height < 0, the top of the extrusion will be in plane and
		the bottom will be height units below the plane.
		The plane used is the one that is returned from the curve's TryGetPlane function.
		 * @param {boolean} cap If the curve is closed and cap is true, then the resulting extrusion is capped.
		 * @returns {Extrusion} If the input is valid, then a new extrusion is returned. Otherwise null is returned
		 */
		static create(planarCurve:Curve,height:number,cap:boolean): Extrusion;
		/**
		 * @description Gets an extrusion from a box.
		 * @param {Box} box IsValid must be true.
		 * @param {boolean} cap If true, the base and the top of the box will be capped. Defaults to true.
		 * @returns {Extrusion} Extrusion on success. null on failure.
		 */
		static createBoxExtrusion(box:Box,cap:boolean): Extrusion;
		/**
		 * @description Gets an extrusion form of a cylinder.
		 * @param {Cylinder} cylinder IsFinite must be true.
		 * @param {boolean} capBottom If true, the end at cylinder.Height1 will be capped.
		 * @param {boolean} capTop If true, the end at cylinder.Height2 will be capped.
		 * @returns {Extrusion} Extrusion on success. null on failure.
		 */
		static createCylinderExtrusion(cylinder:Cylinder,capBottom:boolean,capTop:boolean): Extrusion;
		/**
		 * @description Gets an extrusion form of a pipe.
		 * @param {Cylinder} cylinder IsFinite must be true.
		 * @param {number} otherRadius If cylinder.Radius is less than other radius, then the cylinder will be the inside
		of the pipe.
		 * @param {boolean} capBottom If true, the end at cylinder.Height1 will be capped.
		 * @param {boolean} capTop If true, the end at cylinder.Height2 will be capped.
		 * @returns {Extrusion} Extrusion on success. null on failure.
		 */
		static createPipeExtrusion(cylinder:Cylinder,otherRadius:number,capBottom:boolean,capTop:boolean): Extrusion;
		/**
		 * @description Constructs a brep form of the extrusion. The outer profile is always the first face of the brep.
		If there are inner profiles, additional brep faces are created for each profile. If the
		outer profile is closed, then end caps are added as the last two faces of the brep.
		 * @param {boolean} splitKinkyFaces If true and the profiles have kinks, then the faces corresponding to those profiles are split
		so they will be G1.
		 * @returns {Brep} A brep with a similar shape like this extrusion, or null on error.
		 */
		toBrep(splitKinkyFaces:boolean): Brep;
		/**
		 * @description Allows to set the two points at the extremes and the up vector.
		 * @param {number[]} a The start point.
		 * @param {number[]} b The end point.
		 * @param {number[]} up The up vector.
		 * @returns {boolean} true if the operation succeeded; otherwise false.
		Setting up=a-b will make the operation fail.
		 */
		setPathAndUp(a:number[],b:number[],up:number[]): boolean;
		/**
		 * @description Gets the transformation that maps the XY profile curve to its 3d location.
		 * @param {number} s 0.0 = starting profile
		1.0 = ending profile.
		 * @returns {Transform} A Transformation. The transform is Invalid on failure.
		 */
		getProfileTransformation(s:number): Transform;
		/**
		 * @description Gets the 3D plane containing the profile curve at a normalized path parameter.
		 * @param {number} s 0.0 = starting profile
		1.0 = ending profile.
		 * @returns {Plane} A plane. The plane is Invalid on failure.
		 */
		getProfilePlane(s:number): Plane;
		/**
		 * @description Gets the 3D plane perpendicular to the path at a normalized path parameter.
		 * @param {number} s 0.0 = starting profile
		1.0 = ending profile.
		 * @returns {Plane} A plane. The plane is Invalid on failure.
		 */
		getPathPlane(s:number): Plane;
		/**
		 * @description Sets the outer profile of the extrusion.
		 * @param {Curve} outerProfile curve in the XY plane or a 2D curve.
		 * @param {boolean} cap If outerProfile is a closed curve, then cap determines if the extrusion
		has end caps. If outerProfile is an open curve, cap is ignored.
		 * @returns {boolean} true if the profile was set. If the outer profile is closed, then the
		extrusion may also have inner profiles. If the outer profile is open,
		the extrusion may not have inner profiles. If the extrusion already
		has a profile, the set will fail.
		 */
		setOuterProfile(outerProfile:Curve,cap:boolean): boolean;
		/**
		 * @description Adds an inner profile.
		 * @param {Curve} innerProfile Closed curve in the XY plane or a 2d curve.
		 * @returns {boolean} true if the profile was set.
		 */
		addInnerProfile(innerProfile:Curve): boolean;
		/**
		 * @description Gets a transversal isocurve of the extruded profile.
		 * @param {number} profileIndex 0 <= profileIndex < ProfileCount
		The outer profile has index 0.
		 * @param {number} s 0.0 <= s <= 1.0
		A relative parameter controlling which profile is returned.
		0 = bottom profile and 1 = top profile.
		 * @returns {Curve} The profile.
		 */
		profile3d(profileIndex:number,s:number): Curve;
		/**
		 * @description Gets the line-like curve that is the conceptual axis of the extrusion.
		 * @returns {LineCurve} The path as a line curve.
		 */
		pathLineCurve(): LineCurve;
		/**
		 * @description Gets one of the longitudinal curves along the beam or extrusion.
		 * @param {ComponentIndex} ci The index of this profile.
		 * @returns {Curve} The profile.
		 */
		wallEdge(ci:ComponentIndex): Curve;
		/**
		 * @description Gets one of the longitudinal surfaces of the extrusion.
		 * @param {ComponentIndex} ci The index specifying which precise item to retrieve.
		 * @returns {Surface} The surface.
		 */
		wallSurface(ci:ComponentIndex): Surface;
		/**
		 * @description Gets the line-like curve that is the conceptual axis of the extrusion.
		 * @returns {LineCurve} The path as a line curve.
		 */
		pathLineCurve(): LineCurve;
		/**
		 * @description Gets the index of the profile curve at a domain related to a parameter.
		 * @param {number} profileParameter Parameter on profile curve.
		 * @returns {number} -1 if profileParameter does not correspond to a point on the profile curve.
		When the profileParameter corresponds to the end of one profile and the
		beginning of the next profile, the index of the next profile is returned.
		 */
		profileIndex(profileParameter:number): number;
		/**
		 * @description Obtains a reference to a specified type of mesh for this extrusion.
		 * @param {MeshType} meshType The mesh type.
		 * @returns {Mesh} A mesh.
		 */
		getMesh(meshType:MeshType): Mesh;
		/** ... */
		setMesh(): void;
	}

	class File3dm {
		/**
		 * Gets or sets the start section comments, which are the comments with which the 3dm file begins.
		 */
		startSectionComments: string;
		/**
		 * Gets or sets the name of the application that wrote this file.
		 */
		applicationName: string;
		/**
		 * Gets or sets a URL for the application that wrote this file.
		 */
		applicationUrl: string;
		/**
		 * Gets or sets details for the application that wrote this file.
		 */
		applicationDetails: string;
		/**
		 * Gets the 3dm file archive version.
		 */
		archiveVersion: number;
		/**
		 * Get the DateTime that this file was originally created. If the
		 * value is not set in the 3dm file, then DateTime.MinValue is returned
		 */
		created: DateTime;
		/**
		 * Gets a string that names the user who created the file.
		 */
		createdBy: string;
		/**
		 * Get the DateTime that this file was last edited. If the
		 * value is not set in the 3dm file, then DateTime.MinValue is returned
		 */
		lastEdited: DateTime;
		/**
		 * Gets a string that names the user who last edited the file.
		 */
		lastEditedBy: string;
		/**
		 * Gets or sets the revision number.
		 */
		revision: number;
		/** ... */
		destroy(): void;
		/**
		 * @description Read a 3dm file from a byte array
		 * @returns {File3dm} New File3dm on success, null on error.
		 */
		static fromByteArray(): File3dm;
		/** ... */
		settings(): void;
		/** ... */
		objects(): void;
		/** ... */
		materials(): void;
		/** ... */
		linetypes(): void;
		/** ... */
		bitmaps(): void;
		/** ... */
		layers(): void;
		/** ... */
		groups(): void;
		/** ... */
		dimstyles(): void;
		/** ... */
		instanceDefinitions(): void;
		/** ... */
		views(): void;
		/** ... */
		namedViews(): void;
		/** ... */
		plugInData(): void;
		/** ... */
		strings(): void;
		/** ... */
		embeddedFiles(): void;
		/** ... */
		renderContent(): void;
		/** ... */
		encode(): void;
		/** ... */
		encode(): void;
		/**
		 * @description Write to an in-memory byte[]
		 * @returns {Uint8Array}
		 */
		toByteArray(): Uint8Array;
		/**
		 * @description Write to an in-memory byte[]
		 * @returns {Uint8Array}
		 */
		toByteArray(): Uint8Array;
		/** ... */
		static decode(): void;
		/** ... */
		embeddedFilePaths(): void;
		/** ... */
		getEmbeddedFileAsBase64(): void;
		/** ... */
		getEmbeddedFileAsBase64(): void;
		/** ... */
		rdkXml(): void;
	}

	class File3dmBitmapTable {
		/**
		 */
		count: any;
		/** ... */
		get(): void;
		/** ... */
		add(): void;
		/** ... */
		findIndex(): void;
		/** ... */
		findId(): void;
	}

	class File3dmDecalTable {
		/**
		 */
		count: any;
		/** ... */
		get(): void;
		/** ... */
		findIndex(): void;
	}

	class File3dmDimStyleTable {
		/**
		 */
		count: any;
		/** ... */
		get(): void;
		/** ... */
		add(): void;
		/**
		 * @description Retrieves a DimensionStyle object based on Index. This search type of search is discouraged.
		We are moving towards using only IDs for all tables.
		 * @param {number} index The index to search for.
		 * @returns {DimensionStyle} A DimensionStyle object, or null if none was found.
		 */
		findIndex(index:number): DimensionStyle;
		/** ... */
		findId(): void;
		/** ... */
		findId(): void;
	}

	class File3dmEmbeddedFileTable {
		/**
		 */
		count: any;
		/** ... */
		get(): void;
		/** ... */
		add(): void;
		/** ... */
		findIndex(): void;
	}

	class File3dmGroupTable {
		/**
		 */
		count: any;
		/** ... */
		get(): void;
		/** ... */
		add(): void;
		/** ... */
		Delete(): void;
		/** ... */
		Delete(): void;
		/** ... */
		Delete(): void;
		/**
		 * @description Retrieves a Group object based on an index. This search type of search is discouraged.
		We are moving towards using only IDs for all tables.
		 * @param {number} groupIndex The index to search for.
		 * @returns {Group} A Group object, or null if none was found.
		 */
		findIndex(groupIndex:number): Group;
		/**
		 * @description Finds a Group given its name.
		 * @param {string} name The name of the Group to be searched.
		 * @returns {Group} A Group, or null on error.
		 */
		findName(name:string): Group;
	}

	class File3dmInstanceDefinitionTable {
		/**
		 */
		count: any;
		/** ... */
		get(): void;
		/**
		 * @description Adds an instance definition to the instance definition table.
		 * @param {string} name The definition name.
		 * @param {string} description The definition description.
		 * @param {string} url A URL or hyperlink.
		 * @param {string} urlTag A description of the URL or hyperlink.
		 * @param {number[]} basePoint A base point.
		 * @param {GeometryBase[]} geometry An array, a list or any enumerable set of geometry.
		 * @param {ObjectAttributes[]} attributes An array, a list or any enumerable set of attributes.
		 * @returns {number} >=0  index of instance definition in the instance definition table. -1 on failure.
		 */
		add(name:string,description:string,url:string,urlTag:string,basePoint:number[],geometry:GeometryBase[],attributes:ObjectAttributes[]): number;
		/** ... */
		findIndex(): void;
		/** ... */
		findId(): void;
	}

	class File3dmLayerTable {
		/**
		 */
		count: any;
		/** ... */
		get(): void;
		/** ... */
		add(): void;
		/**
		 * @description Easy way to add a layer to the model
		 * @param {string} name new layer name
		 * @param {number[]} color new layer color
		 * @returns {number} If layer_name is valid, the layer's index (>=0) is returned. Otherwise,
		RhinoMath.UnsetIntIndex is returned.
		 */
		addLayer(name:string,color:number[]): number;
		/**
		 * @description Finds a Layer given its name.
		 * @param {string} name The name of the Layer to be searched.
		 * @param {string} parentId The id of the parent Layer to be searched.
		 * @returns {Layer} A Layer, or null on error.
		 */
		findName(name:string,parentId:string): Layer;
		/**
		 * @description Retrieves a Layer object based on Index. This search type of search is discouraged.
		We are moving towards using only IDs for all tables.
		 * @param {number} index The index to search for.
		 * @returns {Layer} A Layer object, or null if none was found.
		 */
		findIndex(index:number): Layer;
		/** ... */
		findId(): void;
	}

	class File3dmLinetypeTable {
		/**
		 */
		count: any;
		/** ... */
		get(): void;
		/** ... */
		add(): void;
		/** ... */
		delete(): void;
		/**
		 * @description Retrieves a Linetype object based on Index. This search type of search is discouraged.
		We are moving towards using only IDs for all tables.
		 * @param {number} index The index to search for.
		 * @returns {Linetype} A Linetype, or null if none was found.
		 */
		findIndex(index:number): Linetype;
		/** ... */
		findId(): void;
		/**
		 * @description Finds a Linetype given its name.
		 * @param {string} name The name of the Linetype to be searched.
		 * @returns {Linetype} A Linetype, or null on error.
		 */
		findName(name:string): Linetype;
		/** ... */
		fromAttributes(): void;
		/** ... */
		fromLayerIndex(): void;
	}

	class File3dmMaterialTable {
		/**
		 */
		count: any;
		/** ... */
		get(): void;
		/** ... */
		add(): void;
		/**
		 * @description Retrieves a material based on Index. This search type of search is discouraged.
		We are moving towards using only IDs for all tables.
		 * @param {number} index The index to search for.
		 * @returns {Material} A material, or null if none was found.
		 */
		findIndex(index:number): Material;
		/** ... */
		findId(): void;
		/** ... */
		findFromAttributes(): void;
	}

	class File3dmMeshModifiers {
		/** ... */
		displacement(): void;
		/** ... */
		edgeSoftening(): void;
		/** ... */
		thickening(): void;
		/** ... */
		curvePiping(): void;
		/** ... */
		shutLining(): void;
		/** ... */
		createDisplacement(): void;
		/** ... */
		createEdgeSoftening(): void;
		/** ... */
		createThickening (): void;
		/** ... */
		createCurvePiping(): void;
		/** ... */
		createShutLining (): void;
	}

	class File3dmObject {
		/** ... */
		attributes(): void;
		/** ... */
		geometry(): void;
	}

	class File3dmObjectTable {
		/**
		 * Returns the total amount of items in the object table, including lights.
		 */
		count: number;
		/** ... */
		get(): void;
		/**
		 * @description Adds a point object to the table.
		 * @param {number} x X component of point coordinate.
		 * @param {number} y Y component of point coordinate.
		 * @param {number} z Z component of point coordinate.
		 * @returns {string} id of new object.
		 */
		addPoint(x:number,y:number,z:number): string;
		/**
		 * @description Adds a point object to the table.
		 * @param {number} x X component of point coordinate.
		 * @param {number} y Y component of point coordinate.
		 * @param {number} z Z component of point coordinate.
		 * @returns {string} id of new object.
		 */
		addPoint(x:number,y:number,z:number): string;
		/**
		 * @description Adds a point cloud object to the document.
		 * @param {PointCloud} cloud PointCloud to add.
		 * @returns {string} A unique identifier for the object.
		 */
		addPointCloud(cloud:PointCloud): string;
		/**
		 * @description Adds a line object to Rhino.
		 * @param {number[]} from A line start point.
		 * @param {number[]} to A line end point.
		 * @returns {string} A unique identifier of new rhino object.
		 */
		addLine(from:number[],to:number[]): string;
		/**
		 * @description Adds a curve object to the document representing an arc.
		 * @param {Arc} arc An arc.
		 * @returns {string} A unique identifier for the object.
		 */
		addArc(arc:Arc): string;
		/**
		 * @description Adds a curve object to the document representing a circle.
		 * @param {Circle} circle A circle to add.
		 * @returns {string} A unique identifier for the object.
		 */
		addCircle(circle:Circle): string;
		/**
		 * @description Adds a curve object to the document representing an ellipse.
		 * @param {Ellipse} ellipse An ellipse to add.
		 * @returns {string} A unique identifier for the object.
		 */
		addEllipse(ellipse:Ellipse): string;
		/**
		 * @description Adds a surface object to the document representing a sphere.
		 * @param {Sphere} sphere A sphere to add.
		 * @returns {string} A unique identifier for the object.
		 */
		addSphere(sphere:Sphere): string;
		/**
		 * @description Adds a curve object to the table.
		 * @param {Curve} curve A curve to add.
		 * @returns {string} A unique identifier for the object.
		 */
		addCurve(curve:Curve): string;
		/**
		 * @description Adds a text dot object to the table.
		 * @param {string} text The text.
		 * @param {number[]} location The location.
		 * @returns {string} A unique identifier for the object.
		 */
		addTextDot(text:string,location:number[]): string;
		/**
		 * @description Adds a surface object to Rhino.
		 * @param {Surface} surface A duplicate of this surface is added to Rhino.
		 * @returns {string} A unique identifier for the object.
		 */
		addSurface(surface:Surface): string;
		/**
		 * @description Adds an extrusion object to Rhino.
		 * @param {Extrusion} extrusion A duplicate of this extrusion is added to Rhino.
		 * @returns {string} A unique identifier for the object.
		 */
		addExtrusion(extrusion:Extrusion): string;
		/**
		 * @description Adds a mesh object to Rhino.
		 * @param {Mesh} mesh A duplicate of this mesh is added to Rhino.
		 * @returns {string} A unique identifier for the object.
		 */
		addMesh(mesh:Mesh): string;
		/**
		 * @description Adds a brep object to Rhino.
		 * @param {Brep} brep A duplicate of this brep is added to Rhino.
		 * @returns {string} A unique identifier for the object.
		 */
		addBrep(brep:Brep): string;
		/**
		 * @description Duplicates the object, then adds a copy of the object to the document.
		 * @param {File3dmObject} item The item to duplicate and add.
		 * @returns {void}
		 */
		add(item:File3dmObject): void;
		/**
		 * @description Gets the bounding box containing every object in this table.
		 * @returns {BoundingBox} The computed bounding box.
		 */
		getBoundingBox(): BoundingBox;
		/** ... */
		deleteItem(): void;
		/** ... */
		findId(): void;
	}

	class File3dmPlugInData {
	}

	class File3dmPlugInDataTable {
		/**
		 * Gets the number of  objects in this table.
		 */
		count: number;
		/** ... */
		get(): void;
	}

	class File3dmPostEffectTable {
		/**
		 */
		count: any;
		/** ... */
		get(): void;
		/** ... */
		findIndex(): void;
		/** ... */
		findId(): void;
	}

	class File3dmRdkDocumentData extends File3dmPlugInData {
		/** ... */
		rdkXml(): void;
	}

	class File3dmRenderContentTable {
		/**
		 */
		count: any;
		/** ... */
		add(): void;
		/** ... */
		get(): void;
		/** ... */
		findId(): void;
	}

	class File3dmSettings {
		/**
		 * Gets or sets a Uniform Resource Locator (URL) direction for the model.
		 */
		modelUrl: string;
		/**
		 * Gets or sets the model base point that is used when the file is read as an instance definition.
		 * This point is mapped to the origin in the instance definition.
		 */
		modelBasePoint: number[];
		/**
		 */
		earthAnchorPoint: any;
		/**
		 * Gets or sets the model space absolute tolerance.
		 */
		modelAbsoluteTolerance: number;
		/**
		 * Gets or sets the model space angle tolerance.
		 */
		modelAngleToleranceRadians: number;
		/**
		 * Gets or sets the model space angle tolerance.
		 */
		modelAngleToleranceDegrees: number;
		/**
		 * Gets or sets the model space relative tolerance.
		 */
		modelRelativeTolerance: number;
		/**
		 * Gets or sets the page space absolute tolerance.
		 */
		pageAbsoluteTolerance: number;
		/**
		 * Gets or sets the page space angle tolerance.
		 */
		pageAngleToleranceRadians: number;
		/**
		 * Gets or sets the page space angle tolerance.
		 */
		pageAngleToleranceDegrees: number;
		/**
		 * Gets or sets the page space relative tolerance.
		 */
		pageRelativeTolerance: number;
		/**
		 * Gets or sets the model unit system, using  enumeration.
		 */
		modelUnitSystem: UnitSystem;
		/**
		 * Gets or sets the page unit system, using  enumeration.
		 */
		pageUnitSystem: UnitSystem;
		/** ... */
		renderSettings(): void;
	}

	class File3dmShutLiningCurveTable {
		/**
		 */
		count: any;
		/** ... */
		get(): void;
		/** ... */
		add(): void;
		/** ... */
		findIndex(): void;
		/** ... */
		findId(): void;
	}

	class File3dmStringTable {
		/**
		 * Returns the number of document strings in the 3dm file.
		 */
		count: number;
		/** ... */
		get(): void;
		/**
		 * @description Returns a string value at a given index.
		 * @param {number} i The index at which to get the value.
		 * @returns {string} The string value if successful.
		 */
		getvalue(i:number): string;
		/** ... */
		set(): void;
		/** ... */
		documentUserTextCount(): void;
		/**
		 * @description Removes document strings from the 3dm file.
		 * @param {string} section name of section to delete. If null, all sections will be deleted.
		 * @param {string} entry name of entry to delete. If null, all entries will be deleted for a given section.
		 * @returns {void}
		 */
		delete(section:string,entry:string): void;
	}

	class File3dmViewTable {
		/**
		 * Gets the amount of items in the table.
		 */
		count: number;
		/** ... */
		get(): void;
		/** ... */
		set(): void;
		/**
		 * @description Adds a
		 * @returns {void}
		 */
		add(): void;
	}

	class File3dmWriteOptions {
		/**
		 * File version. Default is major version number of this assembly version.Must be in range [2; current version].Alternatively, 0 is a placeholder for the last valid version.Rhino can read its current version, plus earlier file versions except 1.Use latest version when possible.
		 */
		version: number;
		/**
		 * Include custom user data in the file. Default is true
		 */
		saveUserData: boolean;
	}

	class FileReference {
		/**
		 * Gets the absolute path of this file reference.
		 */
		fullPath: string;
		/**
		 * Gets the relative path of this file reference.
		 */
		relativePath: string;
		/**
		 * @description Returns a new file reference. This returns a new instance even if the path does not exist.
		 * @param {string} fullPath A full path.
		 * @returns {FileReference} A file reference to the specified path.
		 */
		static createFromFullPath(fullPath:string): FileReference;
		/**
		 * @description Returns a new file reference. This returns a new instance even if the path does not exist.
		 * @param {string} fullPath A full path. This parameter cannot be null.
		 * @param {string} relativePath A relative path. This parameter can be null.
		 * @returns {FileReference} A file reference to the specified paths.
		 */
		static createFromFullAndRelativePaths(fullPath:string,relativePath:string): FileReference;
	}

	class Font {
		/**
		 */
		quartetName: string;
		/**
		 * Returns Face name
		 */
		faceName: string;
		/**
		 * Returns the Font PostScriptName - "Apple font name"
		 */
		postScriptName: string;
		/**
		 * Returns the Font RichTextFontName used in RTF strings:
		 * {\\fonttbl...{\\fN RichTextFontName;}...}
		 */
		richTextFontName: string;
		/**
		 */
		bold: boolean;
		/**
		 */
		italic: boolean;
		/**
		 */
		underlined: boolean;
		/**
		 */
		strikeOut: boolean;
		/**
		 */
		isEngravingFont: boolean;
		/**
		 */
		isSymbolFont: boolean;
		/**
		 */
		isSingleStrokeFont: boolean;
		/**
		 */
		isSimulated: boolean;
		/**
		 */
		pointSize: number;
		/**
		 */
		familyName: string;
	}

	class GeometryBase extends CommonObject {
		/**
		 * Useful for switch statements that need to differentiate between
		 * basic object types like points, curves, surfaces, and so on.
		 */
		objectType: ObjectType;
		/**
		 * true if object can be accurately modified with "squishy" transformations like
		 * projections, shears, and non-uniform scaling.
		 */
		isDeformable: boolean;
		/**
		 * Returns true if the Brep.TryConvertBrep function will be successful for this object
		 */
		hasBrepForm: boolean;
		/**
		 * @description Transforms the geometry. If the input Transform has a SimilarityType of
		OrientationReversing, you may want to consider flipping the transformed
		geometry after calling this function when it makes sense. For example,
		you may want to call Flip() on a Brep after transforming it.
		 * @param {Transform} xform Transformation to apply to geometry.
		 * @returns {boolean} true if geometry successfully transformed.
		 */
		transform(xform:Transform): boolean;
		/**
		 * @description Translates the object along the specified vector.
		 * @param {number[]} translationVector A moving vector.
		 * @returns {boolean} true if geometry successfully translated.
		 */
		translate(translationVector:number[]): boolean;
		/**
		 * @description Scales the object by the specified factor. The scale is centered at the origin.
		 * @param {number} scaleFactor The uniform scaling factor.
		 * @returns {boolean} true if geometry successfully scaled.
		 */
		scale(scaleFactor:number): boolean;
		/**
		 * @description Rotates the object about the specified axis. A positive rotation
		angle results in a counter-clockwise rotation about the axis (right hand rule).
		 * @param {number} angleRadians Angle of rotation in radians.
		 * @param {number[]} rotationAxis Direction of the axis of rotation.
		 * @param {number[]} rotationCenter Point on the axis of rotation.
		 * @returns {boolean} true if geometry successfully rotated.
		 */
		rotate(angleRadians:number,rotationAxis:number[],rotationCenter:number[]): boolean;
		/**
		 * @description Bounding box solver. Gets the world axis aligned bounding box for the geometry.
		 * @param {boolean} accurate If true, a physically accurate bounding box will be computed.
		If not, a bounding box estimate will be computed. For some geometry types there is no
		difference between the estimate and the accurate bounding box. Estimated bounding boxes
		can be computed much (much) faster than accurate (or "tight") bounding boxes.
		Estimated bounding boxes are always similar to or larger than accurate bounding boxes.
		 * @returns {BoundingBox} The bounding box of the geometry in world coordinates or BoundingBox.Empty
		if not bounding box could be found.
		 */
		getBoundingBox(accurate:boolean): BoundingBox;
		/**
		 * @description If possible, converts the object into a form that can be accurately modified
		with "squishy" transformations like projections, shears, an non-uniform scaling.
		 * @returns {boolean} false if object cannot be converted to a deformable object. true if object was
		already deformable or was converted into a deformable object.
		 */
		makeDeformable(): boolean;
		/**
		 * @description Constructs a deep (full) copy of this object.
		 * @returns {GeometryBase} An object of the same type as this, with the same properties and behavior.
		 */
		duplicate(): GeometryBase;
	}

	class GroundPlane {
		/**
		 * Determines whether the document ground plane is enabled.
		 */
		enabled: boolean;
		/**
		 * If this is off, the ground plane will not be visible when seen from below.
		 */
		showUnderside: boolean;
		/**
		 * Height above world XY plane in model units. Auto-altitude is computed if enabled.
		 */
		altitude: number;
		/**
		 * Determines whether the ground plane is fixed by the Altitude property, or whether it is automatically placed at the lowest point in the model.
		 */
		autoAltitude: boolean;
		/**
		 * Determines whether the ground plane shows the material assigned, or whether it is transparent, but captures shadows.
		 */
		shadowOnly: boolean;
		/**
		 * Id of material in material table for this ground plane.
		 */
		materialInstanceId: string;
		/**
		 * Texture mapping offset in world units.
		 */
		textureOffset: Rhino.Vector2d;
		/**
		 * Texture offset locked.
		 */
		textureOffsetLocked: boolean;
		/**
		 * Texture size locked.
		 */
		textureSizeLocked: boolean;
		/**
		 * Texture mapping single UV span size in world units.
		 */
		textureSize: Rhino.Vector2d;
		/**
		 * Texture mapping rotation around world origin + offset in degrees.
		 */
		textureRotation: number;
	}

	class Group extends CommonObject {
		/**
		 */
		name: any;
		/**
		 */
		id: any;
		/**
		 */
		index: any;
	}

	class Hatch extends GeometryBase {
		/**
		 * Gets or sets the index of the pattern in the document hatch pattern table.
		 */
		patternIndex: number;
		/**
		 * Gets or sets the relative rotation of the pattern.
		 */
		patternRotation: number;
		/**
		 * Gets or sets the hatch pattern base point
		 */
		basePoint: number[];
		/**
		 * Gets or sets the hatch plane
		 */
		plane: Plane;
		/**
		 * Gets or sets the scaling factor of the pattern.
		 */
		patternScale: number;
		/**
		 * @description Scale the hatch's pattern
		 * @returns {void}
		 */
		scalePattern(): void;
	}

	class InstanceDefinition extends CommonObject {
		/**
		 */
		description: any;
		/**
		 */
		name: any;
		/**
		 */
		id: any;
		/**
		 */
		sourceArchive: any;
		/**
		 */
		updateType: any;
		/** ... */
		getObjectIds(): void;
		/** ... */
		isInstanceGeometryId(): void;
	}

	class InstanceReference extends GeometryBase {
		/**
		 */
		parentIdefId: any;
		/**
		 */
		xform: any;
	}

	class Intersection {
		/**
		 * @description Intersects two lines.
		 * @param {Line} lineA First line for intersection.
		 * @param {Line} lineB Second line for intersection.
		 * @param {number} tolerance If tolerance > 0.0, then an intersection is reported only if the distance between the points is <= tolerance.
		If tolerance <= 0.0, then the closest point between the lines is reported.
		 * @param {boolean} finiteSegments If true, the input lines are treated as finite segments.
		If false, the input lines are treated as infinite lines.
		 * @returns {Array} [boolean, number, number]
		 * (boolean) true if a closest point can be calculated and the result passes the tolerance parameter test; otherwise false.
		 * (number) Parameter on lineA that is closest to LineB.
		The shortest distance between the lines is the chord from lineA.PointAt(a) to lineB.PointAt(b)
		 * (number) Parameter on lineB that is closest to LineA.
		The shortest distance between the lines is the chord from lineA.PointAt(a) to lineB.PointAt(b)
		 */
		static lineLine(lineA:Line,lineB:Line,tolerance:number,finiteSegments:boolean): object;
		/**
		 * @description Intersects two lines.
		 * @param {Line} lineA First line for intersection.
		 * @param {Line} lineB Second line for intersection.
		 * @param {number} tolerance If tolerance > 0.0, then an intersection is reported only if the distance between the points is <= tolerance.
		If tolerance <= 0.0, then the closest point between the lines is reported.
		 * @param {boolean} finiteSegments If true, the input lines are treated as finite segments.
		If false, the input lines are treated as infinite lines.
		 * @returns {Array} [boolean, number, number]
		 * (boolean) true if a closest point can be calculated and the result passes the tolerance parameter test; otherwise false.
		 * (number) Parameter on lineA that is closest to LineB.
		The shortest distance between the lines is the chord from lineA.PointAt(a) to lineB.PointAt(b)
		 * (number) Parameter on lineB that is closest to LineA.
		The shortest distance between the lines is the chord from lineA.PointAt(a) to lineB.PointAt(b)
		 */
		static lineLine(lineA:Line,lineB:Line,tolerance:number,finiteSegments:boolean): object;
		/**
		 * @description Intersects a line and a plane. This function only returns true if the
		intersection result is a single point (i.e. if the line is coincident with
		the plane then no intersection is assumed).
		 * @param {Line} line Line for intersection.
		 * @param {Plane} plane Plane to intersect.
		 * @returns {Array} [boolean, number]
		 * (boolean) true on success, false on failure.
		 * (number) Parameter on line where intersection occurs.
		If the parameter is not within the {0, 1} Interval then the finite segment
		does not intersect the plane.
		 */
		static linePlane(line:Line,plane:Plane): object;
		/**
		 * @description Intersects two planes and return the intersection line. If the planes are
		parallel or coincident, no intersection is assumed.
		 * @param {Plane} planeA First plane for intersection.
		 * @param {Plane} planeB Second plane for intersection.
		 * @returns {Array} [boolean, Line]
		 * (boolean) true on success, false on failure.
		 * (Line) If this function returns true,
		the intersectionLine parameter will return the line where the planes intersect.
		 */
		static planePlane(planeA:Plane,planeB:Plane): object;
		/**
		 * @description Intersects three planes to find the single point they all share.
		 * @param {Plane} planeA First plane for intersection.
		 * @param {Plane} planeB Second plane for intersection.
		 * @param {Plane} planeC Third plane for intersection.
		 * @returns {Array} [boolean, number[]]
		 * (boolean) true on success, false on failure. If at least two out of the three planes
		are parallel or coincident, failure is assumed.
		 * (number[]) Point where all three planes converge.
		 */
		static planePlanePlane(planeA:Plane,planeB:Plane,planeC:Plane): object;
		/**
		 * @description Intersects a plane with a sphere using exact calculations.
		 * @param {Plane} plane Plane to intersect.
		 * @param {Sphere} sphere Sphere to intersect.
		 * @returns {Array} [PlaneSphereIntersection, Circle]
		 * (PlaneSphereIntersection) If  is returned, the intersectionCircle has a radius of zero and the center point
		is the point on the plane closest to the sphere.
		 * (Circle) Intersection result.
		 */
		static planeSphere(plane:Plane,sphere:Sphere): object;
		/**
		 * @description Intersects a line with a circle using exact calculations.
		 * @param {Line} line Line for intersection.
		 * @param {Circle} circle Circle for intersection.
		 * @returns {Array} [LineCircleIntersection, number, number[], number, number[]]
		 * (LineCircleIntersection) If  is returned, only t1 and point1 will have valid values.
		If  is returned, t2 and point2 will also be filled out.
		 * (number) Parameter on line for first intersection.
		 * (number[]) Point on circle closest to first intersection.
		 * (number) Parameter on line for second intersection.
		 * (number[]) Point on circle closest to second intersection.
		 */
		static lineCircle(line:Line,circle:Circle): object;
		/**
		 * @description Intersects a line with a sphere using exact calculations.
		 * @param {Line} line Line for intersection.
		 * @param {Sphere} sphere Sphere for intersection.
		 * @returns {Array} [LineSphereIntersection, number[], number[]]
		 * (LineSphereIntersection) If  is returned, the first point is the point on the line closest to the sphere and
		the second point is the point on the sphere closest to the line.
		If  is returned, the first point is the point on the line and the second point is the
		same point on the sphere.
		 * (number[]) First intersection point.
		 * (number[]) Second intersection point.
		 */
		static lineSphere(line:Line,sphere:Sphere): object;
		/**
		 * @description Intersects a line with a cylinder using exact calculations.
		 * @param {Line} line Line for intersection.
		 * @param {Cylinder} cylinder Cylinder for intersection.
		 * @returns {Array} [LineCylinderIntersection, number[], number[]]
		 * (LineCylinderIntersection) If None is returned, the first point is the point on the line closest
		to the cylinder and the second point is the point on the cylinder closest to
		the line.
		If  is returned, the first point
		is the point on the line and the second point is the  same point on the
		cylinder.
		 * (number[]) First intersection point.
		 * (number[]) Second intersection point.
		 */
		static lineCylinder(line:Line,cylinder:Cylinder): object;
		/**
		 * @description Intersects two spheres using exact calculations.
		 * @param {Sphere} sphereA First sphere to intersect.
		 * @param {Sphere} sphereB Second sphere to intersect.
		 * @returns {Array} [SphereSphereIntersection, Circle]
		 * (SphereSphereIntersection) The intersection type.
		 * (Circle) If intersection is a point, then that point will be the center, radius 0.
		 */
		static sphereSphere(sphereA:Sphere,sphereB:Sphere): object;
		/**
		 * @description Intersects an infinite line and an axis aligned bounding box.
		 * @param {BoundingBox} box BoundingBox to intersect.
		 * @param {Line} line Line for intersection.
		 * @param {number} tolerance If tolerance > 0.0, then the intersection is performed against a box
		that has each side moved out by tolerance.
		 * @returns {Array} [boolean, number[]]
		 * (boolean) true if the line intersects the box, false if no intersection occurs.
		 * (number[]) The chord from line.PointAt(lineParameters.T0) to line.PointAt(lineParameters.T1) is the intersection.
		 */
		static lineBox(box:BoundingBox,line:Line,tolerance:number): object;
	}

	class Layer extends CommonObject {
		/**
		 * Gets or sets the name of this layer.
		 */
		name: string;
		/**
		 * Gets the full path to this layer. The full path includes nesting information.
		 */
		fullPath: string;
		/**
		 * Gets or sets the ID of this layer object.
		 * You typically do not need to assign a custom ID.
		 */
		id: string;
		/**
		 * Gets the ID of the parent layer. Layers can be organized in a hierarchical structure,
		 * in which case this returns the parent layer ID. If the layer has no parent,
		 * Guid.Empty will be returned.
		 */
		parentLayerId: string;
		/**
		 * Gets or sets the IGES level for this layer.
		 */
		igesLevel: number;
		/**
		 * Gets or sets the display color for this layer.
		 */
		color: number[];
		/**
		 * Gets or sets the plot color for this layer.
		 */
		plotColor: number[];
		/**
		 * Gets or sets the weight of the plotting pen in millimeters.
		 * A weight of 0.0 indicates the "default" pen weight should be used.
		 * A weight of -1.0 indicates the layer should not be printed.
		 */
		plotWeight: number;
		/**
		 * Gets or sets the line-type index for this layer.
		 */
		linetypeIndex: number;
		/**
		 * Gets or sets the index of render material for objects on this layer that have
		 * MaterialSource() == MaterialFromLayer.
		 * A material index of -1 indicates no material has been assigned
		 * and the material created by the default Material constructor
		 * should be used.
		 */
		renderMaterialIndex: number;
		/**
		 */
		visible: any;
		/**
		 */
		locked: any;
		/**
		 */
		expanded: any;
		/**
		 * @description Verifies that a layer has per viewport settings.
		 * @param {string} viewportId If not Guid.Empty, then checks for settings for that specific viewport.
		If Guid.Empty, then checks for any viewport settings.
		 * @returns {boolean} True if the layer has per viewport settings, false otherwise.
		 */
		hasPerViewportSettings(viewportId:string): boolean;
		/**
		 * @description Deletes per viewport layer settings.
		 * @param {string} viewportId If not Guid.Empty, then the settings for that viewport are deleted.
		If Guid.Empty, then all per viewport settings are deleted.
		 * @returns {void}
		 */
		deletePerViewportSettings(viewportId:string): void;
		/**
		 * @description Gets the display color for this layer.
		 * @param {string} viewportId If not Guid.Empty, then the setting applies only to the viewport with the specified id.
		 * @returns {number[]} The display color.
		 */
		perViewportColor(viewportId:string): number[];
		/**
		 * @description Sets the display color for this layer.
		 * @param {string} viewportId If not Guid.Empty, then the setting applies only to the viewport with the specified id.
		 * @param {number[]} color The display color.
		 * @returns {void}
		 */
		setPerViewportColor(viewportId:string,color:number[]): void;
		/**
		 * @description Remove any per viewport layer color setting so the layer's overall setting will be used for all viewports.
		 * @param {string} viewportId If not Guid.Empty, then the setting for this viewport will be deleted.
		If Guid.Empty, the all per viewport layer color settings will be removed.
		 * @returns {void}
		 */
		deletePerViewportColor(viewportId:string): void;
		/**
		 * @description The global persistent visibility setting is used for layers whose visibility can
		be changed by a "parent" object. A common case is when a layer is a
		child layer (ParentId is not nil). In this case, when a parent layer is
		turned off, then child layers are also turned off. The persistent
		visibility setting determines what happens when the parent is turned on
		again.
		 * @returns {boolean}
		 */
		getPersistentVisibility(): boolean;
		/**
		 * @description Set the global persistent visibility setting for this layer.
		 * @returns {void}
		 */
		setPersistentVisibility(): void;
		/**
		 * @description Remove any explicit persistent visibility setting from this layer
		 * @returns {void}
		 */
		unsetPersistentVisibility(): void;
		/**
		 * @description The persistent locking setting is used for layers that can be locked by
		a "parent" object. A common case is when a layer is a child layer
		(Layer.ParentI is not nil). In this case, when a parent layer is locked,
		then child layers are also locked. The persistent locking setting
		determines what happens when the parent is unlocked again.
		 * @returns {boolean}
		 */
		getPersistentLocking(): boolean;
		/**
		 * @description Set the persistent locking setting for this layer
		 * @returns {void}
		 */
		setPersistentLocking(): void;
		/**
		 * @description Remove any explicitly persistent locking settings from this layer
		 * @returns {void}
		 */
		unsetPersistentLocking(): void;
	}

	class Light extends GeometryBase {
		/**
		 * Gets or sets a value that defines if the light is turned on (true) or off (false).
		 */
		isEnabled: boolean;
		/**
		 * Gets or sets a light style on this camera.
		 */
		lightStyle: LightStyle;
		/**
		 * Gets a value indicating whether the light style
		 * is  CameraPoint or WorldPoint.
		 */
		isPointLight: boolean;
		/**
		 * Gets a value indicating whether the light style
		 * is  CameraDirectional or WorldDirectional.
		 */
		isDirectionalLight: boolean;
		/**
		 * Gets a value indicating whether the light style
		 * is  CameraSpot or WorldSpot.
		 */
		isSpotLight: boolean;
		/**
		 * Gets a value indicating whether the light style
		 * is  WorldLinear.
		 */
		isLinearLight: boolean;
		/**
		 * Gets a value indicating whether the light style
		 * is  WorldRectangular.
		 */
		isRectangularLight: boolean;
		/**
		 * Gets or sets the light or 3D position or location.
		 */
		location: number[];
		/**
		 * Gets or sets the vector direction of the camera.
		 */
		direction: number[];
		/**
		 * Gets a perpendicular vector to the camera direction.
		 */
		perpendicularDirection: number[];
		/**
		 * Gets or sets the light intensity.
		 */
		intensity: number;
		/**
		 * Gets or sets the light power in watts (W).
		 */
		powerWatts: number;
		/**
		 * Gets or sets the light power in lumens (lm).
		 */
		powerLumens: number;
		/**
		 * Gets or sets the light power in candelas (cd).
		 */
		powerCandela: number;
		/**
		 * Gets or sets the ambient color.
		 */
		ambient: number[];
		/**
		 * Gets or sets the diffuse color.
		 */
		diffuse: number[];
		/**
		 * Gets or sets the specular color.
		 */
		specular: number[];
		/**
		 * Gets or Sets the attenuation vector.
		 */
		attenuationVector: number[];
		/**
		 * Gets or sets the spot angle in radians.
		 * Ignored for non-spot lights.angle = 0 to pi/2  (0 to 90 degrees).
		 */
		spotAngleRadians: number;
		/**
		 * The spot exponent varies from 0.0 to 128.0 and provides
		 * an exponential interface for controlling the focus or
		 * concentration of a spotlight (like the
		 * OpenGL GL_SPOT_EXPONENT parameter).  The spot exponent
		 * and hot spot parameters are linked; changing one will
		 * change the other.
		 * A hot spot setting of 0.0 corresponds to a spot exponent of 128.
		 * A hot spot setting of 1.0 corresponds to a spot exponent of 0.0.
		 */
		spotExponent: number;
		/**
		 * The hot spot setting runs from 0.0 to 1.0 and is used to
		 * provides a linear interface for controlling the focus or
		 * concentration of a spotlight.
		 * A hot spot setting of 0.0 corresponds to a spot exponent of 128.
		 * A hot spot setting of 1.0 corresponds to a spot exponent of 0.0.
		 */
		hotSpot: number;
		/**
		 * Gets or sets the height in linear and rectangular lights.
		 * (ignored for non-linear/rectangular lights.)
		 */
		length: number[];
		/**
		 * Gets or sets the width in linear and rectangular lights.
		 * (ignored for non-linear/rectangular lights.)
		 */
		width: number[];
		/**
		 * Gets or sets the shadow intensity for the light.
		 */
		shadowIntensity: number;
		/**
		 * Gets or sets the spot light name.
		 */
		name: string;
		/**
		 * @description Sets the attenuation settings (ignored for "directional" and "ambient" lights).
		attenuation = 1/(a0 + d*a1 + d^2*a2) where d = distance to light.
		 * @param {number} a0 The new constant attenuation divisor term.
		 * @param {number} a1 The new reverse linear attenuation divisor term.
		 * @param {number} a2 The new reverse quadratic attenuation divisor term.
		 * @returns {void}
		 */
		setAttenuation(a0:number,a1:number,a2:number): void;
		/**
		 * @description Gets the attenuation settings (ignored for "directional" and "ambient" lights).
		attenuation = 1/(a0 + d*a1 + d^2*a2) where d = distance to light.
		 * @param {number} d The distance to evaluate.
		 * @returns {number} 0 if a0 + d*a1 + d^2*a2 <= 0.
		 */
		getAttenuation(d:number): number;
		/**
		 * @description Gets the spot light radii.
		 * @returns {Array} [boolean, number, number]
		 * (boolean) true if operation succeeded; otherwise, false.
		 * (number) The inner radius. This out parameter is assigned during this call.
		 * (number) The outer radius. This out parameter is assigned during this call.
		 */
		getSpotLightRadii(): object;
	}

	class Line {
		/**
		 * Start point of line segment.
		 */
		from: number[];
		/**
		 * End point of line segment.
		 */
		to: number[];
		/**
		 * Gets or sets the length of this line segment.
		 * Note that a negative length will invert the line segment without
		 * making the actual length negative. The line From point will remain fixed
		 * when a new Length is set.
		 */
		length: number;

		constructor(from: number[], to: number[]);
	}

	class LinearWorkflow {
		/**
		 */
		preProcessTexturesOn: any;
		/**
		 */
		preProcessColorsOn: any;
		/**
		 * Linear workflow pre-process gamma value. This is currently the same as the post-process gamma value.
		 */
		preProcessGamma: number;
		/**
		 */
		preProcessGammaOn: any;
		/**
		 * Linear workflow post-process gamma value.
		 */
		postProcessGamma: number;
		/**
		 * Linear workflow post-process gamma enabled state.
		 */
		postProcessGammaOn: boolean;
	}

	class LineCurve extends Curve {
		/**
		 * Gets or sets the Line value inside this curve.
		 */
		line: Line;

		constructor(from: number[], to: number[]);
	}

	class Linetype extends ModelComponent {
		/**
		 * The name of this linetype.
		 */
		name: string;
		/**
		 */
		index: any;
		/**
		 * Total length of one repeat of the pattern.
		 */
		patternLength: number;
		/**
		 * Number of segments in the pattern.
		 */
		segmentCount: number;
		/**
		 * @description Gets the segment information at a index.
		 * @param {number} index Zero based index of the segment.
		 * @returns {Array} [void, number, boolean]
		 * (void)
		 * (number) The length of the segment in millimeters.
		 * (boolean) If the length is interpreted as a line, true is assigned during the call to this out parameter.
		If the length is interpreted as a space, then false is assigned during the call to this out parameter.
		 */
		getSegment(index:number): object;
		/**
		 * @description Sets the length and type of the segment at index.
		 * @param {number} index Zero based index of the segment.
		 * @param {number} length The length of the segment to be added in millimeters.
		 * @param {boolean} isSolid If true, the length is interpreted as a line. If false,
		then the length is interpreted as a space.
		 * @returns {boolean} true if the operation was successful; otherwise false.
		 */
		setSegment(index:number,length:number,isSolid:boolean): boolean;
		/**
		 * @description Adds a segment to the pattern.
		 * @param {number} length The length of the segment to be added.
		 * @param {boolean} isSolid If true, the length is interpreted as a line. If false,
		then the length is interpreted as a space.
		 * @returns {number} Index of the added segment.
		 */
		appendSegment(length:number,isSolid:boolean): number;
		/**
		 * @description Removes a segment in the linetype.
		 * @param {number} index Zero based index of the segment to remove.
		 * @returns {boolean} true if the segment index was removed.
		 */
		removeSegment(index:number): boolean;
		/** ... */
		clearPattern(): void;
		/** ... */
		static border(): void;
		/** ... */
		static byLayer(): void;
		/** ... */
		static byParent(): void;
		/** ... */
		static center(): void;
		/** ... */
		static continuous(): void;
		/** ... */
		static dashdot(): void;
		/** ... */
		static dashed(): void;
		/** ... */
		static dots(): void;
		/** ... */
		static hidden(): void;
	}

	class Material extends ModelComponent {
		/**
		 * The Id of the RenderPlugIn that is associated with this material.
		 */
		renderPlugInId: string;
		/**
		 */
		name: string;
		/**
		 * Gets or sets the shine factor of the material.
		 */
		shine: number;
		/**
		 * Gets or sets the transparency of the material (0.0 = opaque to 1.0 = transparent)
		 */
		transparency: number;
		/**
		 * Gets or sets the index of refraction of the material, generally
		 * >= 1.0 (speed of light in vacuum)/(speed of light in material)
		 */
		indexOfRefraction: number;
		/**
		 * Gets or sets the Fresnel index of refraction of the material,
		 * default is 1.56
		 */
		fresnelIndexOfRefraction: number;
		/**
		 * Gets or sets the refraction glossiness.
		 */
		refractionGlossiness: number;
		/**
		 * Gets or sets the reflection glossiness.
		 */
		reflectionGlossiness: number;
		/**
		 * Gets or sets if Fresnel reflections are used.
		 */
		fresnelReflections: boolean;
		/**
		 */
		disableLighting: boolean;
		/**
		 * Gets or sets how reflective a material is, 0f is no reflection
		 * 1f is 100% reflective.
		 */
		reflectivity: number;
		/**
		 * Very simple preview color function for GUIs.
		 */
		previewColor: number[];
		/**
		 */
		diffuseColor: number[];
		/**
		 */
		ambientColor: number[];
		/**
		 */
		emissionColor: number[];
		/**
		 */
		specularColor: number[];
		/**
		 */
		reflectionColor: number[];
		/**
		 */
		transparentColor: number[];
		/** ... */
		static compareAppearance(): void;
		/**
		 * @description Set material to default settings.
		 * @returns {void}
		 */
		default(): void;
		/**
		 * @description Get the texture that corresponds with the specified texture type for this material.
		 * @returns {Texture}
		 */
		getTexture(): Texture;
		/**
		 * @returns {Texture}
		 */
		getBitmapTexture(): Texture;
		/**
		 * @returns {boolean}
		 */
		setBitmapTexture(): boolean;
		/**
		 * @description Gets the bump texture of this material.
		 * @returns {Texture} A texture; or null if no bump texture has been added to this material.
		 */
		getBumpTexture(): Texture;
		/**
		 * @returns {boolean}
		 */
		setBumpTexture(): boolean;
		/**
		 * @returns {Texture}
		 */
		getEnvironmentTexture(): Texture;
		/**
		 * @returns {boolean}
		 */
		setEnvironmentTexture(): boolean;
		/**
		 * @returns {Texture}
		 */
		getTransparencyTexture(): Texture;
		/**
		 * @returns {boolean}
		 */
		setTransparencyTexture(): boolean;
		/** ... */
		physicallyBased(): void;
		/**
		 * @returns {void}
		 */
		toPhysicallyBased(): void;
	}

	class Mesh extends GeometryBase {
		/**
		 * Returns true if every mesh "edge" has two or more faces.
		 */
		isClosed: boolean;
		/**
		 * Will return true if SetCachedTextureCoordinates has been called;
		 * otherwise will return false.
		 */
		hasCachedTextureCoordinates: boolean;
		/**
		 * HasPrincipalCurvatures
		 */
		hasPrincipalCurvatures: boolean;
		/**
		 * Number of partition information chunks stored on this mesh based
		 * on the last call to CreatePartitions
		 */
		partitionCount: number;
		/**
		 * @description Create a mesh from a SubD control net
		 * @returns {Mesh} mesh representing control net on success, null on failure
		 */
		static createFromSubDControlNet(): Mesh;
		/**
		 * @description Cretes a Three.js bufferGeometry from an array of Rhino meshes.
		 * @param {Mesh[]} meshes The array of Rhino meshes.
		 * @param {boolean} rotateYUp Whether or not to orient the result to Y up.
		 * @returns {object} A Three.js bufferGeometry.
		 */
		static toThreejsJSONMerged(meshes: Mesh[], rotateYUp: boolean ): object;
		/**
		 * @description Returns true if every mesh "edge" has at most two faces.
		 * @returns {boolean} true if the mesh is manifold, false otherwise.
		 */
		isManifold(): boolean;
		/** ... */
		vertices(): void;
		/** ... */
		topologyEdges(): void;
		/** ... */
		faces(): void;
		/** ... */
		normals(): void;
		/** ... */
		vertexColors(): void;
		/** ... */
		textureCoordinates(): void;
		/**
		 * @description Removes all texture coordinate information from this mesh.
		 * @returns {void}
		 */
		clearTextureData(): void;
		/**
		 * @description Removes surface parameters, curvature parameters and surface statistics from the mesh.
		 * @returns {void}
		 */
		clearSurfaceData(): void;
		/**
		 * @description Removes topology data, forcing all topology information to be recomputed.
		 * @returns {void}
		 */
		destroyTopology(): void;
		/**
		 * @description Destroys the mesh vertex access tree.
		 * @returns {void}
		 */
		destroyTree(): void;
		/**
		 * @description Destroys mesh partition.
		 * @returns {void}
		 */
		destroyPartition(): void;
		/**
		 * @description Set texture coordinates using given mapping and applying given transform.
		Set lazy to false to generate texture coordinates right away.
		 * @param {TextureMapping} tm Texture mapping
		 * @param {Transform} xf Transform to apply to the texture mapping
		 * @param {boolean} lazy Whether to generate lazily (true) or right away (false)
		 * @returns {void}
		 */
		setTextureCoordinates(tm:TextureMapping,xf:Transform,lazy:boolean): void;
		/**
		 * @description Removes any unreferenced objects from arrays, re-indexes as needed
		and shrinks arrays to minimum required size.
		 * @returns {boolean} true on success, false on failure.
		 */
		compact(): boolean;
		/**
		 * @description Appends a copy of another mesh to this one and updates indices of appended mesh parts.
		 * @param {Mesh} other Mesh to append to this one.
		 * @returns {void}
		 */
		append(other:Mesh): void;
		/**
		 * @description In ancient times (or modern smart phone times), some rendering engines
		were only able to process small batches of triangles and the
		CreatePartitions() function was provided to partition the mesh into
		subsets of vertices and faces that those rendering engines could handle.
		 * @returns {boolean} true on success
		 */
		createPartitions(): boolean;
		/**
		 * @description Creates a Three.js bufferGeometry from a Rhino mesh. 
		 * @returns {object} A Three.js bufferGeometry.
		 */
		toThreejsJSON(): object;
		/**
		 * @description Creates a Three.js bufferGeometry from a Rhino mesh. 
		 * @param {boolean} rotateToYUp Rotate the result to Y up.
		 * @returns {object} A Three.js bufferGeometry.
		 */
		toThreejsJSON(rotateToYUp: boolean): object;
		/**
		 * @description Creates a Rhino mesh from a Three.js buffer geometry. 
		 * @param {object} object A js object in the form of { data: bufferGeometry }
		 * @returns {Mesh}
		 */
		static createFromThreejsJSON( object: object ): Mesh;
	}

	class MeshFaceList {
		/**
		 * Gets or sets the number of mesh faces. When getting this can includes invalid faces.
		 */
		count: number;
		/**
		 * Gets the number of faces that are valid quads (4 corners).
		 */
		quadCount: number;
		/**
		 * Gets the number of faces that are valid triangles (3 corners).
		 */
		triangleCount: number;
		/**
		 * Gets or sets the total number of mesh triangles and quads the internal data structure can hold without resizing.
		 */
		capacity: number;
		/** ... */
		get(): void;
		/**
		 * @description Gets the 3D location of the vertices forming a face.
		 * @param {number} faceIndex A face index.
		 * @returns {Array} [boolean, Point3f, Point3f, Point3f, Point3f]
		 * (boolean) true if the operation succeeded, otherwise false.
		 * (Point3f) A first point. This out argument is assigned during the call.
		 * (Point3f) A second point. This out argument is assigned during the call.
		 * (Point3f) A third point. This out argument is assigned during the call.
		 * (Point3f) A fourth point. This out argument is assigned during the call.
		 */
		getFaceVertices(faceIndex:number): object;
		/**
		 * @description Gets the center point of a face.
		For a triangular face, this is the centroid or barycenter.For a quad, this is the average of four comer points.
		 * @param {number} faceIndex A face index.
		 * @returns {number[]} The center point.
		 */
		getFaceCenter(faceIndex:number): number[];
		/**
		 * @description Clears the Face list on the mesh.
		 * @returns {void}
		 */
		clear(): void;
		/**
		 * @description Releases all memory allocated to store faces. The list capacity will be 0 after this call.
		Subsequent calls can add new items.
		 * @returns {void}
		 */
		destroy(): void;
		/**
		 * @description Appends a new mesh face to the end of the mesh face list.
		 * @param {any} face Face to add.
		 * @returns {number} The index of the newly added face.
		 */
		addFace(face:any): number;
		/**
		 * @description Appends a new mesh face to the end of the mesh face list.
		 * @param {any} face Face to add.
		 * @returns {number} The index of the newly added face.
		 */
		addFace(face:any): number;
		/**
		 * @description Sets a face at a specific index of the mesh.
		 * @param {number} index A position in the list.
		 * @param {any} face A face.
		 * @returns {boolean} true if the operation succeeded, otherwise false.
		 */
		setFace(index:number,face:any): boolean;
		/**
		 * @description Sets a face at a specific index of the mesh.
		 * @param {number} index A position in the list.
		 * @param {any} face A face.
		 * @returns {boolean} true if the operation succeeded, otherwise false.
		 */
		setFace(index:number,face:any): boolean;
		/**
		 * @description Splits all quads along the short diagonal.
		 * @returns {boolean} true on success, false on failure.
		 */
		convertQuadsToTriangles(): boolean;
		/**
		 * @description Splits non-planar quads into two triangles based on given parameters.
		 * @param {number} planarTolerance If planarTolerance >= 0, then a quad is split if its vertices
		are not coplanar.
		If both planarTolerance = Rhino.RhinoMath.UnsetValue and
		angleToleranceRadians >= 0.0, then the planarity test is skipped.
		 * @param {number} angleToleranceRadians If angleToleranceRadians >= 0.0, then a quad is split if the
		angle between opposite corner normals is > angleToleranceRadians.
		The corner normal is the normal to the triangle formed by two
		adjacent edges and the diagonal connecting their endpoints.
		A quad has four corner normals.
		If both angleToleranceRadians = Rhino.RhinoMath.UnsetValue and planarTolerance >= 0.0,
		then the corner normal angle test is skipped.
		 * @param {number} splitMethod 0 default
		Currently divides along the short diagonal. This may be
		changed as better methods are found or preferences change.
		By passing zero, you let the developers of this code
		decide what's best for you over time.
		1 divide along the short diagonal
		2 divide along the long diagonal
		3 minimize resulting area
		4 maximize resulting area
		5 minimize angle between triangle normals
		6 maximize angle between triangle normals
		 * @returns {number} Number of quads that were converted to triangles.
		 */
		convertNonPlanarQuadsToTriangles(planarTolerance:number,angleToleranceRadians:number,splitMethod:number): number;
		/**
		 * @description Joins adjacent triangles into quads if the resulting quad is 'nice'.
		 * @param {number} angleToleranceRadians Used to compare adjacent triangles' face normals. For two triangles
		to be considered, the angle between their face normals has to
		be <= angleToleranceRadians. When in doubt use RhinoMath.PI/90.0 (2 degrees).
		 * @param {number} minimumDiagonalLengthRatio ( <= 1.0) For two triangles to be considered the ratio of the
		resulting quad's diagonals
		(length of the shortest diagonal)/(length of longest diagonal).
		has to be >= minimumDiagonalLengthRatio. When in doubt us .875.
		 * @returns {boolean} true on success, false on failure.
		 */
		convertTrianglesToQuads(angleToleranceRadians:number,minimumDiagonalLengthRatio:number): boolean;
		/**
		 * @description Attempts to removes degenerate faces from the mesh.
		Degenerate faces are faces that contains such a combination of indices,
		that their final shape collapsed in a line or point.Before returning, this method also attempts to repair faces by juggling
		vertex indices.
		 * @returns {number} The number of degenerate faces that were removed.
		 */
		cullDegenerateFaces(): number;
		/**
		 * @description Gets a value indicating whether a face is hidden.
		A face is hidden if, and only if, at least one of its vertices is hidden.
		 * @param {number} faceIndex A face index.
		 * @returns {boolean} true if hidden, false if fully visible.
		 */
		isHidden(faceIndex:number): boolean;
		/**
		 * @description Returns true if at least one of the face edges are not topologically
		connected to any other faces.
		 * @param {number} faceIndex A face index.
		 * @returns {boolean} true if that face makes the mesh open, otherwise false.
		 */
		hasNakedEdges(faceIndex:number): boolean;
	}

	class MeshingParameters {
		/**
		 * Gets or sets how and if textures will be packed.
		 */
		textureRange: number;
		/**
		 * Gets or sets whether or not the mesh is allowed to have jagged seams.
		 * When this flag is set to true, meshes on either side of a Brep Edge will not match up.
		 */
		jaggedSeams: boolean;
		/**
		 * Gets or sets a value indicating whether or not the sampling grid can be refined
		 * when certain tolerances are not met.
		 */
		refineGrid: boolean;
		/**
		 * Gets or sets a value indicating whether or not planar areas are allowed
		 * to be meshed in a simplified manner.
		 */
		simplePlanes: boolean;
		/**
		 * Gets or sets a value indicating whether or not surface curvature
		 * data will be embedded in the mesh.
		 */
		computeCurvature: boolean;
		/**
		 * Gets or sets a value indicating whether or not to post process non-closed meshes
		 * that should be closed. If the Brep being meshed is closed, JaggedSeams = false,
		 * and ClosedObjectPostProcess = true, and the resulting mesh is not closed, then a
		 * post meshing process is applied to find and close gaps in the mesh. Typically the
		 * resulting mesh is not closed because the input Brep has a geometric flaw, like
		 * loops in trimming curve.
		 */
		closedObjectPostProcess: boolean;
		/**
		 * Gets or sets the minimum number of grid quads in the initial sampling grid.
		 */
		gridMinCount: number;
		/**
		 * Gets or sets the maximum number of grid quads in the initial sampling grid.
		 */
		gridMaxCount: number;
		/**
		 * Gets or sets the maximum allowed angle difference (in radians)
		 * for a single sampling quad. The angle pertains to the surface normals.
		 */
		gridAngle: number;
		/**
		 * Gets or sets the maximum allowed aspect ratio of sampling quads.
		 */
		gridAspectRatio: number;
		/**
		 * Gets or sets the grid amplification factor.
		 * Values lower than 1.0 will decrease the number of initial quads,
		 * values higher than 1.0 will increase the number of initial quads.
		 */
		gridAmplification: number;
		/**
		 * Gets or sets the maximum allowed edge deviation.
		 * This tolerance is measured between the center of the mesh edge and the surface.
		 */
		tolerance: number;
		/**
		 * Gets or sets the minimum tolerance.
		 */
		minimumTolerance: number;
		/**
		 * Gets or sets the relative tolerance.
		 */
		relativeTolerance: number;
		/**
		 * Gets or sets the minimum allowed mesh edge length.
		 */
		minimumEdgeLength: number;
		/**
		 * Gets or sets the maximum allowed mesh edge length.
		 */
		maximumEdgeLength: number;
		/**
		 * Gets or sets the mesh parameter refine angle in radians.
		 */
		refineAngle: number;

		constructor(density: number);

		constructor(density: number, minimumEdgeLength: number);
		/** ... */
		static default(): void;
		/** ... */
		static fastRenderMesh(): void;
		/** ... */
		static qualityRenderMesh(): void;
		/** ... */
		static defaultAnalysisMesh(): void;
		/** ... */
		toJSON(): void;
		/** ... */
		encode(): void;
		/** ... */
		static decode(): void;
	}

	class MeshNormalList {
		/**
		 */
		count: any;
		/** ... */
		get(): void;
		/** ... */
		set(): void;
		/** ... */
		clear(): void;
		/** ... */
		destroy(): void;
		/** ... */
		add(): void;
		/** ... */
		computeNormals(): void;
		/** ... */
		unitizeNormals(): void;
		/** ... */
		flip(): void;
	}

	class MeshTextureCoordinateList {
		/**
		 * Gets or sets the number of texture coordinates.
		 */
		count: number;
		/** ... */
		get(): void;
		/** ... */
		set(): void;
		/**
		 * @description Adds a new texture coordinate to the end of the Texture list.
		 * @param {number} s S component of new texture coordinate.
		 * @param {number} t T component of new texture coordinate.
		 * @returns {number} The index of the newly added texture coordinate.
		 */
		add(s:number,t:number): number;
	}

	class MeshTopologyEdgeList {
		/**
		 * Gets the amount of edges in this list.
		 */
		count: number;
		/**
		 * @description Gets the 3d line along an edge.
		 * @param {number} topologyEdgeIndex The topology edge index.
		 * @returns {Line} Line along edge. If input is not valid, an Invalid Line is returned.
		 */
		edgeLine(topologyEdgeIndex:number): Line;
	}

	class MeshVertexColorList {
		/**
		 * Gets or sets the number of mesh colors.
		 */
		count: number;
		/**
		 * Gets or sets the total number of vertex colors the internal data structure can hold without resizing.
		 */
		capacity: number;
		/** ... */
		get(): void;
		/** ... */
		set(): void;
		/**
		 * @description Clears the vertex color list on the mesh.
		 * @returns {void}
		 */
		clear(): void;
		/**
		 * @description Adds a new vertex color to the end of the color list.
		 * @param {number} red Red component of color, must be in the 0~255 range.
		 * @param {number} green Green component of color, must be in the 0~255 range.
		 * @param {number} blue Blue component of color, must be in the 0~255 range.
		 * @returns {number} The index of the newly added color.
		 */
		add(red:number,green:number,blue:number): number;
	}

	class MeshVertexList {
		/**
		 * Gets or sets the number of mesh vertices.
		 */
		count: number;
		/**
		 * Set to true if the vertices should be stored in double precision
		 */
		useDoublePrecisionVertices: boolean;
		/** ... */
		setCount(): void;
		/** ... */
		get(): void;
		/** ... */
		set(): void;
		/**
		 * @description Clears the Vertex list on the mesh.
		 * @returns {void}
		 */
		clear(): void;
		/**
		 * @description Releases all memory allocated to store faces. The list capacity will be 0 after this call.
		Subsequent calls can add new items.
		 * @returns {void}
		 */
		destroy(): void;
		/**
		 * @description Adds a new vertex to the end of the Vertex list.
		 * @param {number} x X component of new vertex coordinate.
		 * @param {number} y Y component of new vertex coordinate.
		 * @param {number} z Z component of new vertex coordinate.
		 * @returns {number} The index of the newly added vertex.
		 */
		add(x:number,y:number,z:number): number;
		/**
		 * @description Gets a value indicating whether or not a vertex is hidden.
		 * @param {number} vertexIndex Index of vertex to query.
		 * @returns {boolean} true if the vertex is hidden, false if it is not.
		 */
		isHidden(vertexIndex:number): boolean;
		/**
		 * @description Hides the vertex at the given index.
		 * @param {number} vertexIndex Index of vertex to hide.
		 * @returns {void}
		 */
		hide(vertexIndex:number): void;
		/**
		 * @description Shows the vertex at the given index.
		 * @param {number} vertexIndex Index of vertex to show.
		 * @returns {void}
		 */
		show(vertexIndex:number): void;
		/**
		 * @description Hides all vertices in the mesh.
		 * @returns {void}
		 */
		hideAll(): void;
		/**
		 * @description Shows all vertices in the mesh.
		 * @returns {void}
		 */
		showAll(): void;
		/**
		 * @description Removes all vertices that are currently not used by the Face list.
		 * @returns {number} The number of unused vertices that were removed.
		 */
		cullUnused(): number;
		/**
		 * @description Merges identical vertices.
		 * @param {boolean} ignoreNormals If true, vertex normals will not be taken into consideration when comparing vertices.
		 * @param {boolean} ignoreAdditional If true, texture coordinates, colors, and principal curvatures
		will not be taken into consideration when comparing vertices.
		 * @returns {boolean} true if the mesh is changed, in which case the mesh will have fewer vertices than before.
		 */
		combineIdentical(ignoreNormals:boolean,ignoreAdditional:boolean): boolean;
	}

	class ModelComponent extends CommonObject {
		/**
		 * True if this model component is a system constant.
		 * An incomplete list of system constant model components is below:ON_ModelComponent::Unset
		 * ON_InstanceDefinition::Empty
		 * ON_Linetype::UnsetON_Linetype::ContinuousON_Linetype::ByLayerON_Linetype::ByParent
		 * ON_Layer::UnsetON_Layer::Default
		 * ON_TextStyle::UnsetON_TextStyle::DefaultON_TextStyle::ByLayerON_TextStyle::ByParent
		 * ON_DimStyle::UnsetON_DimStyle::DefaultON_DimStyle::DefaultInchDecimalON_DimStyle::DefaultInchFractionalON_DimStyle::DefaultFootInchArchitectureON_DimStyle::DefaultMillimeterSmallON_DimStyle::DefaultMillimeterLargeON_DimStyle::DefaultMillimeterArchitecture
		 */
		isSystemComponent: boolean;
		/**
		 * Gets or sets the ID of the current instance.
		 */
		id: string;
		/**
		 * @description Increments the Cyclic Redundancy Check value by this instance.
		 * @param {number} currentRemainder The current remainder value.
		 * @returns {number} The updated remainder value.
		 */
		dataCRC(currentRemainder:number): number;
		/**
		 * @description Resets the HasId property of the model component to false, if possible.
		 * @returns {void}
		 */
		clearId(): void;
	}

	class NurbsCurve extends Curve {
		/**
		 * Gets the order of the curve. Order = Degree + 1.
		 */
		order: number;
		/**
		 * Gets a value indicating whether or not the curve is rational.
		 * Rational curves have control-points with custom weights.
		 */
		isRational: boolean;
		/**
		 * Returns true if the NURBS curve has Bezier spans (all distinct knots have multiplicity = degree)
		 */
		hasBezierSpans: boolean;

		constructor(degree: number, pointCount: number);

		constructor(dimension: number, rational: boolean, order: number, pointCount: number);
		/**
		 * @description Gets a non-rational, degree 1 NURBS curve representation of the line.
		 * @returns {NurbsCurve} Curve on success, null on failure.
		 */
		static createFromLine(): NurbsCurve;
		/**
		 * @description Gets a rational degree 2 NURBS curve representation
		of the arc. Note that the parameterization of NURBS curve
		does not match arc's transcendental parameterization.
		 * @returns {NurbsCurve} Curve on success, null on failure.
		 */
		static createFromArc(): NurbsCurve;
		/**
		 * @description Gets a rational degree 2 NURBS curve representation
		of the circle. Note that the parameterization of NURBS curve
		does not match circle's transcendental parameterization.
		Use GetRadianFromNurbFormParameter() and
		GetParameterFromRadian() to convert between the NURBS curve
		parameter and the transcendental parameter.
		 * @returns {NurbsCurve} Curve on success, null on failure.
		 */
		static createFromCircle(): NurbsCurve;
		/**
		 * @description Gets a rational degree 2 NURBS curve representation of the ellipse.
		Note that the parameterization of the NURBS curve does not match
		with the transcendental parameterization of the ellipsis.
		 * @returns {NurbsCurve} A NURBS curve representation of this ellipse or null if no such representation could be made.
		 */
		static createFromEllipse(): NurbsCurve;
		/**
		 * @description Constructs a 3D NURBS curve from a list of control points.
		 * @param {boolean} periodic If true, create a periodic uniform curve. If false, create a clamped uniform curve.
		 * @param {number} degree (>=1) degree=order-1.
		 * @param {Point3dList} points control vertex locations.
		 * @returns {NurbsCurve} new NURBS curve on success
		null on error.
		 */
		static create(periodic:boolean,degree:number,points:Point3dList): NurbsCurve;
		/**
		 * @description Increase the degree of this curve.
		 * @param {number} desiredDegree The desired degree.
		Degrees should be number between and including 1 and 11.
		 * @returns {boolean} true on success, false on failure.
		 */
		increaseDegree(desiredDegree:number): boolean;
		/**
		 * @description Clamps ends and adds knots so the NURBS curve has Bezier spans
		(all distinct knots have multiplicity = degree).
		 * @param {boolean} setEndWeightsToOne If true and the first or last weight is not one, then the first and
		last spans are re-parameterized so that the end weights are one.
		 * @returns {boolean} true on success, false on failure.
		 */
		makePiecewiseBezier(setEndWeightsToOne:boolean): boolean;
		/**
		 * @description Use a linear fractional transformation to re-parameterize the NURBS curve.
		This does not change the curve's domain.
		 * @param {number} c re-parameterization constant (generally speaking, c should be > 0). The
		control points and knots are adjusted so that
		output_nurbs(t) = input_nurbs(lambda(t)), where lambda(t) = c*t/( (c-1)*t + 1 ).
		Note that lambda(0) = 0, lambda(1) = 1, lambda'(t) > 0,
		lambda'(0) = c and lambda'(1) = 1/c.
		 * @returns {boolean} true if successful.
		 */
		reparameterize(c:number): boolean;
		/**
		 * @description Gets the greville (edit point) parameter that belongs
		to the control point at the specified index.
		 * @param {number} index Index of Greville (Edit) point.
		 * @returns {number}
		 */
		grevilleParameter(index:number): number;
		/**
		 * @description Gets the Greville parameter that belongs
		to the control point at the specified index.
		 * @param {number} index Index of Greville point.
		 * @returns {number[]}
		 */
		grevillePoint(index:number): number[];
		/**
		 * @description Converts a span of the NURBS curve into a Bezier.
		 * @param {number} spanIndex The span index, where (0 <= spanIndex <= Points.Count - Order).
		 * @returns {BezierCurve} Bezier curve if successful, null otherwise.
		 */
		convertSpanToBezier(spanIndex:number): BezierCurve;
		/** ... */
		points(): void;
		/** ... */
		knots(): void;
	}

	class NurbsCurveKnotList {
		/**
		 * Total number of knots in this curve.
		 */
		count: number;
		/**
		 * Gets a value indicating whether or not the knot vector is clamped at the start of the curve.
		 * Clamped curves start at the first control-point. This requires fully multiple knots.
		 */
		isClampedStart: boolean;
		/**
		 * Gets a value indicating whether or not the knot vector is clamped at the end of the curve.
		 * Clamped curves are coincident with the first and last control-point. This requires fully multiple knots.
		 */
		isClampedEnd: boolean;
		/** ... */
		get(): void;
		/** ... */
		set(): void;
		/**
		 * @description Inserts a knot and update control point locations.
		Does not change parameterization or locus of curve.
		 * @param {number} value Knot value to insert.
		 * @returns {boolean} true on success, false on failure.
		 */
		insertKnot(value:number): boolean;
		/**
		 * @description Get knot multiplicity.
		 * @param {number} index Index of knot to query.
		 * @returns {number} The multiplicity (valence) of the knot.
		 */
		knotMultiplicity(index:number): number;
		/**
		 * @description Compute a clamped, uniform knot vector based on the current
		degree and control point count. Does not change values of control
		vertices.
		 * @param {number} knotSpacing Spacing of subsequent knots.
		 * @returns {boolean} true on success, false on failure.
		 */
		createUniformKnots(knotSpacing:number): boolean;
		/**
		 * @description Compute a clamped, uniform, periodic knot vector based on the current
		degree and control point count. Does not change values of control
		vertices.
		 * @param {number} knotSpacing Spacing of subsequent knots.
		 * @returns {boolean} true on success, false on failure.
		 */
		createPeriodicKnots(knotSpacing:number): boolean;
		/**
		 * @description Computes the knots that are superfluous because they are not used in NURBs evaluation.
		These make it appear so that the first and last curve spans are different from interior spans.
		http://wiki.mcneel.com/developer/onsuperfluousknot
		 * @param {boolean} start true if the query targets the first knot. Otherwise, the last knot.
		 * @returns {number} A component.
		 */
		superfluousKnot(start:boolean): number;
	}

	class NurbsCurvePointList {
		/**
		 * Gets the number of control points in this curve.
		 */
		count: number;
		/**
		 * Gets the length of the polyline connecting all control points.
		 */
		controlPolygonLength: number;
		/** ... */
		get(): void;
		/** ... */
		set(): void;
		/**
		 * @description Use a combination of scaling and reparameterization to change the end weights to the specified values.
		 * @param {number} w0 Weight for first control point.
		 * @param {number} w1 Weight for last control point.
		 * @returns {boolean} true on success, false on failure.
		 */
		changeEndWeights(w0:number,w1:number): boolean;
		/**
		 * @description Converts the curve to a Rational NURBS curve. Rational NURBS curves have weighted control points.
		 * @returns {boolean} true on success, false on failure.
		 */
		makeRational(): boolean;
		/**
		 * @description Converts the curve to a Non-rational NURBS curve. Non-rational curves have unweighted control points.
		 * @returns {boolean} true on success, false on failure.
		 */
		makeNonRational(): boolean;
	}

	class NurbsSurface extends Surface {
		/**
		 * Gets a value indicating whether or not the NURBS surface is rational.
		 */
		isRational: boolean;
		/**
		 * Gets the order in the U direction.
		 */
		orderU: number;
		/**
		 * Gets the order in the V direction.
		 */
		orderV: number;
		/**
		 * @description Constructs a new NURBS surface with internal uninitialized arrays.
		 * @param {number} dimension The number of dimensions.>= 1. This value is usually 3.
		 * @param {boolean} isRational true to make a rational NURBS.
		 * @param {number} order0 The order in U direction.>= 2.
		 * @param {number} order1 The order in V direction.>= 2.
		 * @param {number} controlPointCount0 Control point count in U direction.>= order0.
		 * @param {number} controlPointCount1 Control point count in V direction.>= order1.
		 * @returns {NurbsSurface} A new NURBS surface, or null on error.
		 */
		static create(dimension:number,isRational:boolean,order0:number,order1:number,controlPointCount0:number,controlPointCount1:number): NurbsSurface;
		/**
		 * @description Constructs a new NURBS surfaces from cone data.
		 * @param {Cone} cone A cone value.
		 * @returns {NurbsSurface} A new NURBS surface, or null on error.
		 */
		static createFromCone(cone:Cone): NurbsSurface;
		/**
		 * @description Constructs a new NURBS surfaces from sphere data.
		 * @param {Sphere} sphere A sphere value.
		 * @returns {NurbsSurface} A new NURBS surface, or null on error.
		 */
		static createFromSphere(sphere:Sphere): NurbsSurface;
		/**
		 * @description Constructs a new NURBS surfaces from cylinder data.
		 * @param {Cylinder} cylinder A cylinder value.
		 * @returns {NurbsSurface} A new NURBS surface, or null on error.
		 */
		static createFromCylinder(cylinder:Cylinder): NurbsSurface;
		/**
		 * @description Constructs a ruled surface between two curves. Curves must share the same knot-vector.
		 * @param {Curve} curveA First curve.
		 * @param {Curve} curveB Second curve.
		 * @returns {NurbsSurface} A ruled surface on success or null on failure.
		 */
		static createRuledSurface(curveA:Curve,curveB:Curve): NurbsSurface;
		/**
		 * @description Makes this surface rational.
		 * @returns {boolean} true if the operation succeeded; otherwise, false.
		 */
		makeRational(): boolean;
		/**
		 * @description Makes this surface non-rational.
		 * @returns {boolean} true if the operation succeeded; otherwise, false.
		 */
		makeNonRational(): boolean;
		/**
		 * @description Increase the degree of this surface in U direction.
		 * @param {number} desiredDegree The desired degree.
		Degrees should be number between and including 1 and 11.
		 * @returns {boolean} true on success, false on failure.
		 */
		increaseDegreeU(desiredDegree:number): boolean;
		/**
		 * @description Increase the degree of this surface in V direction.
		 * @param {number} desiredDegree The desired degree.
		Degrees should be number between and including 1 and 11.
		 * @returns {boolean} true on success, false on failure.
		 */
		increaseDegreeV(desiredDegree:number): boolean;
		/** ... */
		knotsU(): void;
		/** ... */
		knotsV(): void;
		/** ... */
		points(): void;
	}

	class NurbsSurfaceKnotList {
		/**
		 * Gets the total number of knots in this curve.
		 */
		count: number;
		/**
		 */
		isClampedStart: any;
		/**
		 */
		isClampedEnd: any;
		/** ... */
		get(): void;
		/** ... */
		set(): void;
		/**
		 * @description Inserts a knot and update control point locations.
		Does not change parameterization or locus of curve.
		 * @param {number} value Knot value to insert.
		 * @returns {boolean} true on success, false on failure.
		 */
		insertKnot(value:number): boolean;
		/**
		 * @description Get knot multiplicity.
		 * @param {number} index Index of knot to query.
		 * @returns {number} The multiplicity (valence) of the knot.
		 */
		knotMultiplicity(index:number): number;
		/**
		 * @description Compute a clamped, uniform knot vector based on the current
		degree and control point count. Does not change values of control
		vertices.
		 * @param {number} knotSpacing Spacing of subsequent knots.
		 * @returns {boolean} true on success, false on failure.
		 */
		createUniformKnots(knotSpacing:number): boolean;
		/**
		 * @description Compute a clamped, uniform, periodic knot vector based on the current
		degree and control point count. Does not change values of control
		vertices.
		 * @param {number} knotSpacing Spacing of subsequent knots.
		 * @returns {boolean} true on success, false on failure.
		 */
		createPeriodicKnots(knotSpacing:number): boolean;
		/**
		 * @description Computes the knots that are superfluous because they are not used in NURBs evaluation.
		These make it appear so that the first and last surface spans are different from interior spans.
		http://wiki.mcneel.com/developer/onsuperfluousknot
		 * @param {boolean} start true if the query targets the first knot. Otherwise, the last knot.
		 * @returns {number} A component.
		 */
		superfluousKnot(start:boolean): number;
	}

	class NurbsSurfacePointList {
		/**
		 */
		count: any;
		/**
		 * Gets the number of control points in the U direction of this surface.
		 */
		countU: number;
		/**
		 * Gets the number of control points in the V direction of this surface.
		 */
		countV: number;
		/** ... */
		get(): void;
		/**
		 * @description Gets a world 3-D, or Euclidean, control point at the given (u, v) index.
		The 4-D representation is (x, y, z, 1.0).
		 * @param {number} u Index of control point in the surface U direction.
		 * @param {number} v Index of control point in the surface V direction.
		 * @returns {Array} [boolean, number[]]
		 * (boolean) true on success, false on failure.
		 * (number[]) Coordinate of control point.
		 */
		getPoint(u:number,v:number): object;
		/** ... */
		set(): void;
		/** ... */
		makeRational(): void;
		/** ... */
		makeNonRational(): void;
	}

	class ObjectAttributes extends CommonObject {
		/**
		 * An object must be in one of three modes: normal, locked or hidden.
		 * If an object is in normal mode, then the object's layer controls visibility
		 * and selectability. If an object is locked, then the object's layer controls
		 * visibility by the object cannot be selected. If the object is hidden, it is
		 * not visible and it cannot be selected.
		 */
		mode: ObjectMode;
		/**
		 * Use this query to determine if an object is part of an instance definition.
		 */
		isInstanceDefinitionObject: boolean;
		/**
		 * Gets or sets an object's visibility.
		 */
		visible: boolean;
		/**
		 * Gets or sets an object optional text name.
		 * More than one object in a model can have the same name and
		 * some objects may have no name.
		 */
		name: string;
		/**
		 * Gets or sets an object's casts shadows property, or whether or not an object casts shadows on other objects and a ground plane.
		 */
		castsShadows: boolean;
		/**
		 * Gets or sets an object's receives shadows property, or whether or not an object receives shadows from other objects.
		 */
		receivesShadows: boolean;
		/**
		 * The Linetype used to display an object is specified in one of two ways.
		 * If LinetypeSource is ON::linetype_from_layer, then the object's layer ON_Layer::Linetype() is used.
		 * If LinetypeSource is ON::linetype_from_object, then value of m_linetype is used.
		 */
		linetypeSource: ObjectLinetypeSource;
		/**
		 * The color used to display an object is specified in one of three ways.
		 * If ColorSource is ON::color_from_layer, then the object's layer ON_Layer::Color() is used.
		 * If ColorSource is ON::color_from_object, then value of m_color is used.
		 * If ColorSource is ON::color_from_material, then the diffuse color of the object's
		 * render material is used.  See ON_3dmObjectAttributes::MaterialSource() to
		 * determine where to get the definition of the object's render material.
		 */
		colorSource: ObjectColorSource;
		/**
		 * The color used to plot an object on paper is specified in one of three ways.
		 * If PlotColorSource is ON::plot_color_from_layer, then the object's layer ON_Layer::PlotColor() is used.
		 * If PlotColorSource is ON::plot_color_from_object, then value of PlotColor() is used.
		 */
		plotColorSource: ObjectPlotColorSource;
		/**
		 */
		plotWeightSource: ObjectPlotWeightSource;
		/**
		 */
		id: any;
		/**
		 * Objects may have an URL. There are no restrictions on what value this
		 * URL may have. As an example, if the object came from a commercial part
		 * library, the URL might point to the definition of that part.
		 */
		url: string;
		/**
		 * Gets or sets an associated layer index.
		 * Layer definitions in an OpenNURBS model are stored in a layer table.
		 * The layer table is conceptually an array of ON_Layer classes.  Every
		 * OpenNURBS object in a model is on some layer.  The object's layer
		 * is specified by zero based indices into the ON_Layer array.
		 */
		layerIndex: number;
		/**
		 * Gets or sets the material index.
		 * If you want something simple and fast, set the index of
		 * the rendering material.
		 */
		materialIndex: number;
		/**
		 * Determines if the simple material should come from the object or from it's layer.
		 * High quality rendering plug-ins should use m_rendering_attributes.
		 */
		materialSource: ObjectMaterialSource;
		/**
		 * If ON::color_from_object == ColorSource, then color is the object's display color.
		 */
		objectColor: number[];
		/**
		 * If plot_color_from_object == PlotColorSource, then PlotColor is the object's plotting color.
		 */
		plotColor: number[];
		/**
		 * Display order used to force objects to be drawn on top or behind each other.
		 * Larger numbers draw on top of smaller numbers.
		 * 0  = draw object in standard depth buffered order<0 = draw object behind "normal" draw order objects>0 = draw object on top of "normal" draw order objects
		 */
		displayOrder: number;
		/**
		 * Plot weight in millimeters.
		 * =0.0 means use the default width
		 * <0.0 means don't plot (visible for screen display, but does not show on plot)
		 */
		plotWeight: number;
		/**
		 * Used to indicate an object has a decoration (like an arrowhead on a curve)
		 */
		objectDecoration: ObjectDecoration;
		/**
		 * When a surface object is displayed in wireframe, this controls
		 * how many isoparametric wires are used.
		 * value    number of isoparametric wires
		 * -1       boundary wires (off)
		 * 0        boundary and knot wires
		 * 1        boundary and knot wires and, if there are no interior knots, a single interior wire.
		 * N>=2     boundary and knot wires and (N+1) interior wires.
		 */
		wireDensity: number;
		/**
		 * If ViewportId is nil, the object is active in all viewports. If ViewportId is not nil, then
		 * this object is only active in a specific view. This field is primarily used to assign page
		 * space objects to a specific page, but it can also be used to restrict model space to a
		 * specific view.
		 */
		viewportId: string;
		/**
		 */
		activeSpace: any;
		/**
		 * number of groups object belongs to.
		 */
		groupCount: number;
		/**
		 * @description Apply a transformation.
		 * @param {Transform} xform The transformation.
		 * @returns {boolean} true if successful, false otherwise.
		 */
		transform(xform:Transform): boolean;
		/**
		 * @description Determines if an object has a display mode override for a given viewport.
		 * @param {string} viewportId Id of a Rhino Viewport.
		 * @returns {boolean} true if the object has a display mode override for the viewport; otherwise, false.
		 */
		hasDisplayModeOverride(viewportId:string): boolean;
		/** ... */
		drawColor(): void;
		/** ... */
		decals(): void;
		/** ... */
		meshModifiers(): void;
		/**
		 * @description Returns an array of GroupCount group indices.  If GroupCount is zero, then GetGroupList() returns null.
		 * @returns {number[]} An array of group indices. null might be returned in place of an empty array.
		 */
		getGroupList(): number[];
		/**
		 * @description Adds object to the group with specified index by appending index to
		group list.
		If the object is already in group, nothing is changed.
		 * @param {number} groupIndex The index that will be added.
		 * @returns {void}
		 */
		addToGroup(groupIndex:number): void;
		/**
		 * @description removes object from the group with specified index.
		If the object is not in the group, nothing is changed.
		 * @param {number} groupIndex The index that will be removed.
		 * @returns {void}
		 */
		removeFromGroup(groupIndex:number): void;
		/**
		 * @description Removes object from all groups.
		 * @returns {void}
		 */
		removeFromAllGroups(): void;
	}

	class PhysicallyBasedMaterial {
		/**
		 */
		supported: any;
		/**
		 */
		subsurface: number;
		/**
		 */
		subsurfaceScatteringRadius: number;
		/**
		 */
		metallic: number;
		/**
		 */
		specular: number;
		/**
		 */
		reflectiveIOR: number;
		/**
		 */
		specularTint: number;
		/**
		 */
		roughness: number;
		/**
		 */
		anisotropic: number;
		/**
		 */
		anisotropicRotation: number;
		/**
		 */
		sheen: number;
		/**
		 */
		sheenTint: number;
		/**
		 */
		clearcoat: number;
		/**
		 */
		clearcoatRoughness: number;
		/**
		 */
		opacityIOR: number;
		/**
		 */
		opacity: number;
		/**
		 */
		opacityRoughness: number;
		/**
		 */
		baseColor: Rhino.Display.Color4f;
		/**
		 */
		emissionColor: any;
		/**
		 */
		subsurfaceScatteringColor: Rhino.Display.Color4f;
	}

	class Plane {
		/** ... */
		static worldXY(): void;
	}

	class PlaneSurface extends Surface {
	}

	class Point extends GeometryBase {
		/**
		 * Gets or sets the location (position) of this point.
		 */
		location: number[];

		constructor(location: number[]);
	}

	class Point3d {
		/**
		 * @description Transforms the present point in place. The transformation matrix acts on the left of the point. i.e.,
		result = transformation*point
		 * @param {Transform} xform Transformation to apply.
		 * @returns {void}
		 */
		static transform(xform:Transform): void;
	}

	class Point3dList {
		/**
		 */
		capacity: any;
		/**
		 */
		count: any;
		/**
		 * Even though this is a property, it is not a "fast" calculation. Every point is
		 * evaluated in order to get the bounding box of the list.
		 */
		boundingBox: BoundingBox;

		constructor(initialCapacity: number);
		/** ... */
		get(): void;
		/** ... */
		set(): void;
		/** ... */
		clear(): void;
		/** ... */
		insert(): void;
		/** ... */
		removeAt(): void;
		/**
		 * @description Adds a Point3d to the end of the list with given x,y,z coordinates.
		 * @param {number} x The X coordinate.
		 * @param {number} y The Y coordinate.
		 * @param {number} z The Z coordinate.
		 * @returns {void}
		 */
		add(x:number,y:number,z:number): void;
		/**
		 * @description Applies a transform to all the points in the list.
		 * @param {Transform} xform Transform to apply.
		 * @returns {void}
		 */
		transform(xform:Transform): void;
		/**
		 * @description Set all the X values for the points to a single value
		 * @returns {void}
		 */
		setAllX(): void;
		/**
		 * @description Set all the Y values for the points to a single value
		 * @returns {void}
		 */
		setAllY(): void;
		/**
		 * @description Set all the Z values for the points to a single value
		 * @returns {void}
		 */
		setAllZ(): void;
	}

	class PointCloud extends GeometryBase {
		/**
		 * Gets the number of points in this point cloud.
		 */
		count: number;
		/**
		 * Gets the number of points that have their Hidden flag set.
		 */
		hiddenPointCount: number;
		/**
		 * Gets a value indicating whether or not the points in this
		 * point cloud have colors assigned to them.
		 */
		containsColors: boolean;
		/**
		 * Gets a value indicating whether or not the points in this
		 * point cloud have normals assigned to them.
		 */
		containsNormals: boolean;
		/**
		 * Gets a value indicating whether or not the points in this
		 * point cloud have hidden flags assigned to them.
		 */
		containsHiddenFlags: boolean;
		/**
		 * @description Destroys the color information in this point cloud.
		 * @returns {void}
		 */
		clearColors(): void;
		/**
		 * @description Destroys the normal vector information in this point cloud.
		 * @returns {void}
		 */
		clearNormals(): void;
		/**
		 * @description Destroys the hidden flag information in this point cloud.
		 * @returns {void}
		 */
		clearHiddenFlags(): void;
		/**
		 * @description Appends a new PointCloudItem to the end of this point cloud.
		 * @returns {PointCloudItem} The newly appended item.
		 */
		appendNew(): PointCloudItem;
		/**
		 * @description Inserts a new  at a specific position of the point cloud.
		 * @param {number} index Index of new item.
		 * @returns {PointCloudItem} The newly inserted item.
		 */
		insertNew(index:number): PointCloudItem;
		/**
		 * @description Copies the point values of another point cloud into this one.
		 * @param {PointCloud} other PointCloud to merge with this one.
		 * @returns {void}
		 */
		merge(other:PointCloud): void;
		/**
		 * @description Append a new point to the end of the list.
		 * @param {number[]} point Point to append.
		 * @returns {void}
		 */
		add(point:number[]): void;
		/**
		 * @description Append a new point to the end of the list.
		 * @param {number[]} point Point to append.
		 * @returns {void}
		 */
		add(point:number[]): void;
		/**
		 * @description Append a new point to the end of the list.
		 * @param {number[]} point Point to append.
		 * @returns {void}
		 */
		add(point:number[]): void;
		/**
		 * @description Append a new point to the end of the list.
		 * @param {number[]} point Point to append.
		 * @returns {void}
		 */
		add(point:number[]): void;
		/**
		 * @description Appends a collection of points to this point cloud.
		 * @param {Point3d[]} points Points to append.
		 * @returns {void}
		 */
		addRange(points:Point3d[]): void;
		/**
		 * @description Appends a collection of points to this point cloud.
		 * @param {Point3d[]} points Points to append.
		 * @returns {void}
		 */
		addRange(points:Point3d[]): void;
		/**
		 * @description Appends a collection of points to this point cloud.
		 * @param {Point3d[]} points Points to append.
		 * @returns {void}
		 */
		addRange(points:Point3d[]): void;
		/**
		 * @description Appends a collection of points to this point cloud.
		 * @param {Point3d[]} points Points to append.
		 * @returns {void}
		 */
		addRange(points:Point3d[]): void;
		/**
		 * @description Inserts a new point into the point list.
		 * @param {number} index Insertion index.
		 * @param {number[]} point Point to append.
		 * @returns {void}
		 */
		insert(index:number,point:number[]): void;
		/**
		 * @description Inserts a new point into the point list.
		 * @param {number} index Insertion index.
		 * @param {number[]} point Point to append.
		 * @returns {void}
		 */
		insert(index:number,point:number[]): void;
		/**
		 * @description Inserts a new point into the point list.
		 * @param {number} index Insertion index.
		 * @param {number[]} point Point to append.
		 * @returns {void}
		 */
		insert(index:number,point:number[]): void;
		/**
		 * @description Inserts a new point into the point list.
		 * @param {number} index Insertion index.
		 * @param {number[]} point Point to append.
		 * @returns {void}
		 */
		insert(index:number,point:number[]): void;
		/**
		 * @description Append a collection of points to this point cloud.
		 * @param {number} index Index at which to insert the new collection.
		 * @param {Point3d[]} points Points to append.
		 * @returns {void}
		 */
		insertRange(index:number,points:Point3d[]): void;
		/**
		 * @description Remove the point at the given index.
		 * @param {number} index Index of point to remove.
		 * @returns {void}
		 */
		removeAt(index:number): void;
		/**
		 * @description Copy all the point coordinates in this point cloud to an array.
		 * @returns {Point3d[]} An array containing all the points in this point cloud.
		 */
		getPoints(): Point3d[];
		/**
		 * @description Returns the location of the point at a specific index.
		 * @param {number} index The index.
		 * @returns {number[]}
		 */
		pointAt(index:number): number[];
		/**
		 * @description Copy all the normal vectors in this point cloud to an array.
		 * @returns {any[]} An array containing all the normals in this point cloud.
		 */
		getNormals(): any[];
		/**
		 * @description Copy all the point colors in this point cloud to an array.
		 * @returns {number[][]} An array containing all the colors in this point cloud.
		 */
		getColors(): number[][];
		/**
		 * @description Returns index of the closest point in the point cloud to a given test point.
		 * @param {number[]} testPoint .
		 * @returns {number} Index of point in the point cloud on success. -1 on failure.
		 */
		closestPoint(testPoint:number[]): number;
		/**
		 * @description Converts a Rhino point cloud to a Three.js bufferGeometry
		 * @returns {object} A Three.js bufferGeometry.
		 */
		toThreejsJSON(): object;
	}

	class PointCloudItem {
		/**
		 * Gets or sets the location of this point cloud item.
		 */
		location: number[];
		/**
		 * Gets or sets the X component of this point cloud item location.
		 */
		x: number;
		/**
		 * Gets or sets the Y component of this point cloud item location.
		 */
		y: number;
		/**
		 * Gets or sets the Z component of this point cloud item location.
		 */
		z: number;
		/**
		 * Gets or sets the normal vector for this point cloud item.
		 * If this point cloud item does not have a normal vector,
		 * Vector3d.Unset is returned.
		 */
		normal: number[];
		/**
		 * Gets or sets the color of this point cloud item.
		 * If this point cloud item does not have a color, System.Drawing.Color.Black is returned.
		 */
		color: number[];
		/**
		 * Gets or sets the hidden flag of this point cloud item.
		 * If this point cloud item does not have a hidden flag, false is returned.
		 */
		hidden: boolean;
		/**
		 * Gets the index of this point cloud item.
		 */
		index: number;
	}

	class PointGrid extends GeometryBase {
	}

	class PolyCurve extends Curve {
		/**
		 * Gets the number of segments that make up this Polycurve.
		 */
		segmentCount: number;
		/**
		 * Gets a value indicating whether or not a PolyCurve contains nested PolyCurves.
		 */
		isNested: boolean;
		/**
		 * This is a quick way to see if the curve has gaps between the sub curve segments.
		 */
		hasGap: boolean;
		/**
		 * @description Gets the segment curve at the given index.
		 * @param {number} index Index of segment to retrieve.
		 * @returns {Curve} The segment at the given index or null on failure.
		 */
		segmentCurve(index:number): Curve;
		/**
		 * @description Explodes nested polycurve segments and reconstructs this curve from the shattered remains.
		The result will have not have any PolyCurves as segments but it will have identical
		locus and parameterization.
		 * @returns {boolean} true if any nested PolyCurve was found and absorbed, false if no PolyCurve segments could be found.
		 */
		removeNesting(): boolean;
		/**
		 * @description Explodes this PolyCurve into a list of Curve segments. This will not explode nested polycurves.
		Call  first if you need all individual segments.
		 * @returns {Curve[]} An array of polycurve segments.
		 */
		explode(): Curve[];
		/**
		 * @description Appends and matches the start of the line to the end of polycurve.
		This function will fail if the polycurve is closed.
		 * @param {Line} line Line segment to append.
		 * @returns {boolean} true on success, false on failure.
		 */
		append(line:Line): boolean;
		/**
		 * @description Appends and matches the start of the line to the end of polycurve.
		This function will fail if the polycurve is closed.
		 * @param {Line} line Line segment to append.
		 * @returns {boolean} true on success, false on failure.
		 */
		append(line:Line): boolean;
		/**
		 * @description Appends and matches the start of the line to the end of polycurve.
		This function will fail if the polycurve is closed.
		 * @param {Line} line Line segment to append.
		 * @returns {boolean} true on success, false on failure.
		 */
		append(line:Line): boolean;
		/**
		 * @description Appends the curve to the polycurve without changing the new segment's geometry.
		This function will fail if the PolyCurve is closed or if SegmentCount > 0 and the new segment is closed.
		 * @param {Curve} curve Segment to append.
		 * @returns {boolean} true on success, false on failure.
		 */
		appendSegment(curve:Curve): boolean;
		/**
		 * @description Converts a polycurve parameter to a segment curve parameter.
		 * @param {number} polycurveParameter Parameter on PolyCurve to convert.
		 * @returns {number} Segment curve evaluation parameter or UnsetValue if the
		segment curve parameter could not be computed.
		 */
		segmentCurveParameter(polycurveParameter:number): number;
		/**
		 * @description Converts a segment curve parameter to a polycurve parameter.
		 * @param {number} segmentIndex Index of segment.
		 * @param {number} segmentCurveParameter Parameter on segment.
		 * @returns {number} Polycurve evaluation parameter or UnsetValue if the polycurve curve parameter could not be computed.
		 */
		polyCurveParameter(segmentIndex:number,segmentCurveParameter:number): number;
		/**
		 * @description Returns the polycurve sub-domain assigned to a segment curve.
		 * @param {number} segmentIndex Index of segment.
		 * @returns {number[]} The polycurve sub-domain assigned to a segment curve.
		Returns Interval.Unset if segment_index < 0 or segment_index >= Count().
		 */
		segmentDomain(segmentIndex:number): number[];
		/**
		 * @description Finds the segment used for evaluation at polycurve_parameter.
		 * @param {number} polycurveParameter Parameter on polycurve for segment lookup.
		 * @returns {number} Index of the segment used for evaluation at polycurve_parameter.
		If polycurve_parameter < Domain.Min(), then 0 is returned.
		If polycurve_parameter > Domain.Max(), then Count()-1 is returned.
		 */
		segmentIndex(polycurveParameter:number): number;
	}

	class Polyline extends Point3dList {
		/**
		 * Gets a value that indicates whether this polyline is valid.
		 * Valid polylines have at least one segment, no Invalid points and no zero length segments.Closed polylines with only two segments are also not considered valid.
		 */
		isValid: boolean;
		/**
		 * Gets the number of segments for this polyline.
		 */
		segmentCount: number;
		/**
		 * Gets a value that indicates whether this polyline is closed.
		 * The polyline is considered to be closed if its start is
		 * identical to its endpoint.
		 */
		isClosed: boolean;
		/**
		 * Gets the total length of the polyline.
		 */
		length: number;

		constructor(initialCapacity: number);
		/**
		 * @description Determines whether the polyline is closed, provided a tolerance value.
		 * @param {number} tolerance If the distance between the start and end point of the polyline
		is less than tolerance, the polyline is considered to be closed.
		 * @returns {boolean} true if the polyline is closed to within tolerance, false otherwise.
		 */
		isClosedWithinTolerance(tolerance:number): boolean;
		/**
		 * @description Gets the point on the polyline at the given parameter.
		The integer part of the parameter indicates the index of the segment.
		 * @param {number} t Polyline parameter.
		 * @returns {number[]} The point on the polyline at t.
		 */
		pointAt(t:number): number[];
		/**
		 * @description Gets the unit tangent vector along the polyline at the given parameter.
		The integer part of the parameter indicates the index of the segment.
		 * @param {number} t Polyline parameter.
		 * @returns {number[]} The tangent along the polyline at t.
		 */
		tangentAt(t:number): number[];
		/** ... */
		closesPoint(): void;
		/**
		 * @description Gets the parameter along the polyline which is closest to a test-point.
		 * @param {number[]} testPoint Point to approximate.
		 * @returns {number} The parameter along the polyline closest to testPoint.
		 */
		closestParameter(testPoint:number[]): number;
		/**
		 * @description Constructs a nurbs curve representation of this polyline.
		 * @returns {NurbsCurve} A Nurbs curve shaped like this polyline or null on failure.
		 */
		toNurbsCurve(): NurbsCurve;
		/**
		 * @description Constructs a polyline curve representation of this polyline.
		 * @returns {PolylineCurve} A curve shaped like this polyline or null on failure.
		 */
		toPolylineCurve(): PolylineCurve;
		/**
		 * @description Constructs an array of line segments that make up the entire polyline.
		 * @returns {Line[]} An array of line segments or null if the polyline contains fewer than 2 points.
		 */
		getSegments(): Line[];
		/**
		 * @description Gets the line segment at the given index.
		 * @param {number} index Index of segment to retrieve.
		 * @returns {Line} Line segment at index or Line.Unset on failure.
		 */
		segmentAt(index:number): Line;
		/**
		 * @description Create a regular polygon inscribed in a circle. The vertices of the polygon will be on the circle.
		 * @param {Circle} circle The circle.
		 * @param {number} sideCount The number of sides
		 * @returns {Polyline} A closed polyline if successful, null otherwise.
		 */
		static createInscribedPolygon(circle:Circle,sideCount:number): Polyline;
		/**
		 * @description Create a regular polygon circumscribe about a circle. The midpoints of the polygon's edges will be tangent to the circle.
		 * @param {Circle} circle The circle.
		 * @param {number} sideCount The number of sides
		 * @returns {Polyline} A closed polyline if successful, null otherwise.
		 */
		static createCircumscribedPolygon(circle:Circle,sideCount:number): Polyline;
		/**
		 * @description Create a regular star polygon. The star begins at circle.PointAt(0) and the vertices
		alternate between being on circle and begin on a concentric circle of other_radius.
		 * @param {Circle} circle The circle.
		 * @param {number} radius The radius of other circle.
		 * @param {number} cornerCount The number of corners on the circle. There will be 2*cornerCount sides and 2*cornerCount vertices.
		 * @returns {Polyline} A closed polyline if successful, null otherwise.
		 */
		static createStarPolygon(circle:Circle,radius:number,cornerCount:number): Polyline;
	}

	class PolylineCurve extends Curve {
		/**
		 * Gets the number of points in this polyline.
		 */
		pointCount: number;
		/**
		 * @description Gets a point at a specified index in the polyline curve.
		 * @param {number} index An index.
		 * @returns {number[]} A point.
		 */
		point(index:number): number[];
		/**
		 * @description Sets a point at a specified index in the polyline curve.
		 * @param {number} index An index.
		 * @param {number[]} point A point location to set.
		 * @returns {void}
		 */
		setPoint(index:number,point:number[]): void;
		/**
		 * @description Returns the underlying Polyline, or points.
		 * @returns {Polyline} The Polyline if successful, null of the curve has no points.
		 */
		ToPolyline(): Polyline;
	}

	class PostEffect {
		/**
		 */
		id: any;
		/**
		 */
		type: any;
		/**
		 */
		localName: any;
		/**
		 */
		listable: any;
		/**
		 */
		on: any;
		/**
		 */
		shown: any;
		/** ... */
		getParameter(): void;
		/** ... */
		setParameter(): void;
	}

	class RenderChannels {
		/**
		 */
		mode: Modes;
		/**
		 */
		customIds: any;
	}

	class RenderContent extends ModelComponent {
		/**
		 */
		kind: any;
		/**
		 */
		isChild: any;
		/**
		 */
		isTopLevel: any;
		/**
		 */
		id: any;
		/**
		 */
		typeName: any;
		/**
		 */
		name: any;
		/**
		 */
		typeId: any;
		/**
		 */
		renderEngineId: any;
		/**
		 */
		plugInId: any;
		/**
		 */
		notes: any;
		/**
		 */
		tags: any;
		/**
		 */
		groupId: any;
		/**
		 */
		hidden: any;
		/**
		 */
		reference: any;
		/**
		 */
		autoDelete: any;
		/**
		 */
		childSlotName: any;
		/** ... */
		getParent(): void;
		/** ... */
		getFirstChild(): void;
		/** ... */
		getNextSibling(): void;
		/** ... */
		getTopLevel(): void;
		/** ... */
		setTypeName(): void;
		/** ... */
		childSlotOn(): void;
		/** ... */
		setChildSlotOn(): void;
		/** ... */
		childSlotAmount(): void;
		/** ... */
		setChildSlotAmount(): void;
		/** ... */
		getXML(): void;
		/** ... */
		setXML(): void;
		/** ... */
		setChild(): void;
		/** ... */
		findChild(): void;
		/** ... */
		deleteChild(): void;
		/** ... */
		getParameter(): void;
		/** ... */
		setParameter(): void;
	}

	class RenderEnvironment extends File3dmRenderContent {
		/** ... */
		toEnvironment(): void;
	}

	class RenderEnvironments {
		/**
		 */
		backgroundId: any;
		/**
		 */
		skylightingId: any;
		/**
		 */
		skylightingOverride: any;
		/**
		 */
		reflectionId: any;
		/**
		 */
		reflectionOverride: any;
	}

	class RenderMaterial extends File3dmRenderContent {
		/** ... */
		toMaterial(): void;
	}

	class RenderSettings extends CommonObject {
		/**
		 * Gets or sets the ambient light color used in rendering.
		 */
		ambientLight: number[];
		/**
		 * Gets or sets the background top color used in rendering.
		 * Sets also the background color if a solid background color is set.
		 */
		backgroundColorTop: number[];
		/**
		 * Gets or sets the background bottom color used in rendering.
		 */
		backgroundColorBottom: number[];
		/**
		 * Gets or sets a value indicating whether to render using lights that are on layers that are off.
		 */
		useHiddenLights: boolean;
		/**
		 * Gets or sets a value indicating whether to render using depth cues.
		 * These are clues to help the perception of position and orientation of objects in the image.
		 */
		depthCue: boolean;
		/**
		 * Gets or sets a value indicating whether to render using flat shading.
		 */
		flatShade: boolean;
		/**
		 * Gets or sets a value indicating whether to render back faces.
		 */
		renderBackFaces: boolean;
		/**
		 * Gets or sets a value indicating whether to instruct the rendering engine to show points.
		 */
		renderPoints: boolean;
		/**
		 * Gets or sets a value indicating whether to instruct the rendering engine to show curves.
		 */
		renderCurves: boolean;
		/**
		 * Gets or sets a value indicating whether to instruct the rendering engine to show isocurves.
		 */
		renderIsoParams: boolean;
		/**
		 * Gets or sets a value indicating whether to instruct the rendering engine to show mesh edges.
		 */
		renderMeshEdges: boolean;
		/**
		 * Gets or sets a value indicating whether to instruct the rendering engine to show annotations,
		 * such as linear dimensions or angular dimensions.
		 */
		renderAnnotations: boolean;
		/**
		 * Gets or sets a value indicating whether to use the resolution of the
		 * viewport being rendered or ImageSize when rendering
		 */
		useViewportSize: boolean;
		/**
		 * Gets or sets a value indicating whether to scale the wallpaper in the
		 * background or not. This is meaningful only if the viewport has a wallpaper
		 * and render settings are set to render Wallpaper into the background.
		 */
		scaleBackgroundToFit: boolean;
		/**
		 * Gets or sets whether rendering should be done with transparent background.
		 */
		transparentBackground: boolean;
		/**
		 * Number of dots/inch (dots=pixels) to use when printing and saving
		 * bitmaps. The default is 72.0 dots/inch.
		 */
		imageDpi: number;
		/**
		 * 0=none, 1=normal, 2=best.
		 */
		shadowMapLevel: number;
		/**
		 * Get or set the given named view
		 */
		namedView: string;
		/**
		 * Set or get the given snapshot view
		 */
		snapShot: string;
		/**
		 * Set or get the given specific viewport
		 */
		specificViewport: string;
		/**
		 * If this object is associated with a document, this gets the document ground plane.
		 * If this object is associated with a File3dm, this gets the File3dm's ground plane.
		 * Otherwise it gets a 'free-floating' ground plane object.
		 */
		groundPlane: GroundPlane;
		/**
		 * If this object is associated with a document, this gets the document safe-frame.
		 * If this object is associated with a File3dm, this gets the File3dm's safe-frame.
		 * Otherwise it gets a 'free-floating' safe-frame object.
		 */
		safeFrame: SafeFrame;
		/**
		 * If this object is associated with a document, this gets the document dithering.
		 * If this object is associated with a File3dm, this gets the File3dm's dithering.
		 * Otherwise it gets a 'free-floating' dithering object.
		 */
		dithering: Dithering;
		/**
		 * If this object is associated with a document, this gets the document skylight.
		 * If this object is associated with a File3dm, this gets the File3dm's skylight.
		 * Otherwise it gets a 'free-floating' skylight object.
		 */
		skylight: Skylight;
		/**
		 * If this object is associated with a document, this gets the document linear workflow.
		 * If this object is associated with a File3dm, this gets the File3dm's linear workflow.
		 * Otherwise it gets a 'free-floating' linear workflow object.
		 */
		linearWorkflow: LinearWorkflow;
		/**
		 * If this object is associated with a document, this gets the document render channels.
		 * Otherwise it gets a 'free-floating' render channels object.
		 */
		renderChannels: RenderChannels;
		/**
		 * If this object is associated with a document, this gets the document sun.
		 * If this object is associated with a File3dm, this gets the File3dm's sun.
		 * Otherwise it gets a 'free-floating' sun object.
		 */
		sun: Sun;
		/**
		 */
		renderEnvironments: any;
		/**
		 * If this object is associated with a document, this gets the document post effect data collection.
		 * If this object is associated with a File3dm, this gets the File3dm's post effect data collection.
		 * Otherwise it gets a 'free-floating' post effect data collection object.
		 */
		postEffects: PostEffectCollection;
	}

	class RenderTexture extends File3dmRenderContent {
		/**
		 */
		fileName: any;
		/** ... */
		toTexture(): void;
		/** ... */
		setFilename(): void;
	}

	class RevSurface extends Surface {
		/**
		 * @description Constructs a new surface of revolution from a generatrix curve and an axis.
		This overload accepts a slice start and end angles.
		 * @param {Curve} revoluteCurve A generatrix.
		 * @param {Line} axisOfRevolution An axis.
		 * @param {number} startAngleRadians An angle in radians for the start.
		 * @param {number} endAngleRadians An angle in radians for the end.
		 * @returns {RevSurface} A new surface of revolution, or null if any of the inputs is invalid or on error.
		 */
		static create(revoluteCurve:Curve,axisOfRevolution:Line,startAngleRadians:number,endAngleRadians:number): RevSurface;
	}

	class SafeFrame {
		/**
		 * Determines whether the safe-frame is enabled.
		 */
		enabled: boolean;
		/**
		 * Show the safe-frame only in perspective views.
		 */
		perspectiveOnly: boolean;
		/**
		 */
		fieldGridOn: any;
		/**
		 * Turn on the live area, which shows the size of the rendered view as a yellow frame
		 * in the viewport.
		 */
		liveFrameOn: boolean;
		/**
		 * Turn on the user specified action area, which shown with blue frames.
		 */
		actionFrameOn: boolean;
		/**
		 * Action Frame Linked, On = Use the same scale for X and Y. Off = use
		 * different scales for X and Y.
		 */
		actionFrameLinked: boolean;
		/**
		 * Action Frame X-scale.
		 * This value should be in the range 0..1 but it is not clamped.
		 * It is displayed in the UI in the range 0..100.
		 */
		actionFrameXScale: number;
		/**
		 * Action Frame Y-scale.
		 * This value should be in the range 0..1 but it is not clamped.
		 * It is displayed in the UI in the range 0..100.
		 */
		actionFrameYScale: number;
		/**
		 * Show a user specified title area frame in orange.
		 */
		titleFrameOn: boolean;
		/**
		 * Title Frame Linked, On = Use the same scale for X and Y. Off = use
		 * different scales for X and Y.
		 */
		titleFrameLinked: boolean;
		/**
		 * Title Frame X-scale.
		 * This value should be in the range 0..1 but it is not clamped.
		 * It is displayed in the UI in the range 0..100.
		 */
		titleFrameXScale: number;
		/**
		 * Title Frame Y-scale.
		 * This value should be in the range 0..1 but it is not clamped.
		 * It is displayed in the UI in the range 0..100.
		 */
		titleFrameYScale: number;
	}

	class ShutLining {
		/**
		 */
		on: any;
		/**
		 */
		faceted: any;
		/**
		 */
		autoUpdate: any;
		/**
		 */
		forceUpdate: any;
		/**
		 */
		curves: any;
		/** ... */
		deleteAllCurves(): void;
	}

	class ShutLiningCurve {
		/**
		 */
		id: any;
		/**
		 */
		radius: any;
		/**
		 */
		profile: any;
		/**
		 */
		enabled: any;
		/**
		 */
		pull: any;
		/**
		 */
		isBump: any;
	}

	class Skylight {
		/**
		 */
		enabled: boolean;
		/**
		 */
		shadowIntensity: number;
	}

	class Sphere {
		/**
		 * Gets a value that indicates whether the sphere is valid.
		 */
		isValid: boolean;
		/**
		 * Gets or sets the diameter for this sphere.
		 */
		diameter: number;
		/**
		 * Gets or sets the Radius for this sphere.
		 */
		radius: number;
		/**
		 * Gets or sets the center point of the sphere.
		 */
		center: number[];
		/**
		 * Gets the point at the North Pole of the sphere.
		 * This is the parameterization singularity that can be obtained,
		 * at V value +Math.Pi/2.
		 */
		northPole: number[];
		/**
		 * Gets the point at the South Pole of the sphere.
		 * This is the parameterization singularity that can be obtained,
		 * at V value -Math.Pi/2.
		 */
		southPole: number[];

		constructor(center: number[], radius: number);
		/**
		 * @description Computes the parallel at a specific latitude angle.
		The angle is specified in radians.
		 * @param {number} radians An angle in radians for the parallel.
		 * @returns {Circle} A circle.
		 */
		latitudeRadians(radians:number): Circle;
		/**
		 * @description Computes the parallel at a specific latitude angle.
		The angle is specified in degrees.
		 * @param {number} degrees An angle in degrees for the meridian.
		 * @returns {Circle} A circle.
		 */
		latitudeDegrees(degrees:number): Circle;
		/**
		 * @description Computes the meridian at a specific longitude angle.
		The angle is specified in radians.
		 * @param {number} radians An angle in radians.
		 * @returns {Circle} A circle.
		 */
		longitudeRadians(radians:number): Circle;
		/**
		 * @description Computes the meridian at a specific longitude angle.
		The angle is specified in degrees.
		 * @param {number} degrees An angle in degrees.
		 * @returns {Circle} A circle.
		 */
		longitudeDegrees(degrees:number): Circle;
		/**
		 * @description Evaluates the sphere at specific longitude and latitude angles.
		 * @param {number} longitudeRadians A number within the interval [0, 2pi].
		 * @param {number} latitudeRadians A number within the interval [-pi/2,pi/2].
		 * @returns {number[]} A point value.
		 */
		pointAt(longitudeRadians:number,latitudeRadians:number): number[];
		/**
		 * @description Computes the normal at a specific angular location on the sphere.
		 * @param {number} longitudeRadians A number within the interval [0, 2pi].
		 * @param {number} latitudeRadians A number within the interval [-pi/2, pi/2].
		 * @returns {number[]} A vector.
		 */
		normalAt(longitudeRadians:number,latitudeRadians:number): number[];
		/**
		 * @description Returns point on sphere that is closest to given point.
		 * @param {number[]} testPoint Point to project onto Sphere.
		 * @returns {number[]} Point on sphere surface closest to testPoint.
		 */
		closestPoint(testPoint:number[]): number[];
		/**
		 * @description Finds the angle parameters on this sphere that are closest to a test point.
		 * @param {number[]} testPoint Point to project onto the sphere.
		 * @returns {Array} [boolean, number, number]
		 * (boolean) true on success, false on failure. This function will fail if the point it coincident with the sphere center.
		 * (number) The longitudinal angle (in radians; 0.0 to 2pi) where the sphere approaches testPoint best.
		 * (number) The latitudinal angle (in radians; -0.5pi to +0.5pi) where the sphere approaches testPoint best.
		 */
		closestParameter(testPoint:number[]): object;
		/**
		 * @description Converts this sphere is it Brep representation
		 * @returns {Brep}
		 */
		toBrep(): Brep;
		/**
		 * @description Converts this sphere to its NurbsSurface representation.
		This is synonymous with calling NurbsSurface.CreateFromSphere().
		 * @returns {NurbsSurface} A nurbs surface representation of this sphere or null.
		 */
		toNurbsSurface(): NurbsSurface;
		/** ... */
		encode(): void;
		/** ... */
		toJSON(): void;
		/** ... */
		static decode(): void;
	}

	class SubD extends GeometryBase {
		/**
		 * Test SubD to see if the active level is a solid.
		 * A "solid" is a closed oriented manifold, or a closed oriented manifold.
		 */
		isSolid: boolean;
		/**
		 * @description Clear cached information that depends on the location of vertex control points
		 * @returns {void}
		 */
		clearEvaluationCache(): void;
		/**
		 * @description Updates vertex tag, edge tag, and edge coefficient values on the active
		level. After completing custom editing operations that modify the
		topology of the SubD control net or changing values of vertex or edge
		tags, the tag and sector coefficients information on nearby components
		in the edited areas need to be updated.
		 * @returns {number} Number of vertices and edges that were changed during the update.
		 */
		updateAllTagsAndSectorCoefficients(): number;
		/**
		 * @description Apply the Catmull-Clark subdivision algorithm and save the results in this SubD.
		 * @returns {boolean} true on success
		 */
		subdivide(): boolean;
	}

	class Sun {
		/**
		 */
		minYear: any;
		/**
		 */
		maxYear: any;
		/**
		 */
		vector: Vector3d;
		/**
		 */
		enableAllowed: any;
		/**
		 */
		enableOn: any;
		/**
		 */
		manualControlAllowed: any;
		/**
		 * Manual control 'on' state. When true, allows the user to set the sun
		 * azimuth and altitude directly. When false, the values are computed.
		 */
		manualControlOn: boolean;
		/**
		 * Angle in degrees on world X-Y plane that should be considered north in the model.
		 * The angle is measured starting at the x-axis and increases anti-clockwise. The y-axis
		 * corresponds to a 'north' angle of 90 degrees.
		 */
		north: number;
		/**
		 * The sun's azimuth in degrees. The value increases Eastwards with North as zero.
		 * Setting this value will also set the sun to manual control mode.
		 * Note: This value is not affected by the direction of north.
		 */
		azimuth: number;
		/**
		 * The sun's altitude above the horizon in degrees in the range -90 to +90.
		 * Setting this value will also set the sun to manual control mode.
		 */
		altitude: number;
		/**
		 * The observer's latitude.
		 */
		latitude: number;
		/**
		 * The observer's longitude.
		 */
		longitude: number;
		/**
		 * The observer's time zone measured in hours relative to UTC.
		 */
		timeZone: number;
		/**
		 * Daylight saving time 'on' state
		 */
		daylightSavingOn: boolean;
		/**
		 * Daylight saving time in minutes
		 */
		daylightSavingMinutes: number;
		/**
		 */
		year: any;
		/**
		 */
		month: any;
		/**
		 */
		day: any;
		/**
		 */
		hours: any;
		/**
		 * Sun intensity.
		 */
		intensity: number;
		/**
		 */
		shadowIntensity: any;
		/**
		 */
		isValid: any;
		/**
		 * Get a Light which represents the sun. If manual control is in effect, no sun calculation
		 * is performed; the function uses the last known values of azimuth and altitude.
		 * If manual control is not in effect, the observer's position, date, time, time zone and
		 * daylight saving values are used to calculate the position of the sun.
		 */
		light: Light;
		/** ... */
		static sunColorFromAltitude(): void;
	}

	class Surface extends GeometryBase {
		/**
		 * Gets a values indicating whether a surface is solid.
		 */
		isSolid: boolean;
		/**
		 * @description Sets the domain in a direction.
		 * @param {number} direction 0 sets first parameter's domain, 1 sets second parameter's domain.
		 * @param {number[]} domain A new domain to be assigned.
		 * @returns {boolean} true if setting succeeded, otherwise false.
		 */
		setDomain(direction:number,domain:number[]): boolean;
		/**
		 * @description Returns the maximum algebraic degree of any span
		(or a good estimate if curve spans are not algebraic).
		 * @param {number} direction 0 gets first parameter's domain, 1 gets second parameter's domain.
		 * @returns {number} The maximum degree.
		 */
		degree(direction:number): number;
		/**
		 * @description Gets number of smooth nonempty spans in the parameter direction.
		 * @param {number} direction 0 gets first parameter's domain, 1 gets second parameter's domain.
		 * @returns {number} The span count.
		 */
		spanCount(direction:number): number;
		/**
		 * @description Evaluates a point at a given parameter.
		 * @param {number} u evaluation parameters.
		 * @param {number} v evaluation parameters.
		 * @returns {number[]} Point3d.Unset on failure.
		 */
		pointAt(u:number,v:number): number[];
		/**
		 * @description Gets the domain in a direction.
		 * @param {number} direction 0 gets first parameter, 1 gets second parameter.
		 * @returns {number[]} An interval value.
		 */
		domain(direction:number): number[];
		/**
		 * @description Gets array of span "knots".
		 * @param {number} direction 0 gets first parameter's domain, 1 gets second parameter's domain.
		 * @returns {number[]} An array with span vectors; or null on error.
		 */
		getSpanVector(direction:number): number[];
		/**
		 * @description Computes the surface normal at a point.
		This is the simple evaluation call - it does not support error handling.
		 * @param {number} u A U parameter.
		 * @param {number} v A V parameter.
		 * @returns {number[]} The normal.
		 */
		normalAt(u:number,v:number): number[];
		/**
		 * @description Computes the orient plane on a surface given a U and V parameter.
		This is the simple evaluation call with no error handling.
		 * @param {number} u A first parameter.
		 * @param {number} v A second parameter.
		 * @returns {Array} [boolean, Plane]
		 * (boolean) true if this operation succeeded; otherwise false.
		 * (Plane) A frame plane that will be computed during this call.
		 */
		frameAt(u:number,v:number): object;
		/**
		 * @description Gets a value indicating if the surface is closed in a direction.
		 * @param {number} direction 0 = U, 1 = V.
		 * @returns {boolean} The indicating boolean value.
		 */
		isClosed(direction:number): boolean;
		/**
		 * @description Gets a value indicating if the surface is periodic in a direction (default is false).
		 * @param {number} direction 0 = U, 1 = V.
		 * @returns {boolean} The indicating boolean value.
		 */
		isPeriodic(direction:number): boolean;
		/**
		 * @description true if surface side is collapsed to a point.
		 * @param {number} side side of parameter space to test
		0 = south, 1 = east, 2 = north, 3 = west.
		 * @returns {boolean} True if this specific side of the surface is singular; otherwise, false.
		 */
		isSingular(side:number): boolean;
		/**
		 * @description Tests if a surface parameter value is at a singularity.
		 * @param {number} u Surface u parameter to test.
		 * @param {number} v Surface v parameter to test.
		 * @param {boolean} exact If true, test if (u,v) is exactly at a singularity.
		If false, test if close enough to cause numerical problems.
		 * @returns {boolean} true if surface is singular at (s,t)
		 */
		isAtSingularity(u:number,v:number,exact:boolean): boolean;
		/**
		 * @description Tests if a surface parameter value is at a seam.
		 * @param {number} u Surface u parameter to test.
		 * @param {number} v Surface v parameter to test.
		 * @returns {number} 0 if not a seam,
		1 if u == Domain(0)[i] and srf(u, v) == srf(Domain(0)[1-i], v)
		2 if v == Domain(1)[i] and srf(u, v) == srf(u, Domain(1)[1-i])
		3 if 1 and 2 are true.
		 */
		isAtSeam(u:number,v:number): number;
		/**
		 * @description Gets isoparametric curve.
		 * @param {number} direction 0 first parameter varies and second parameter is constant
		e.g., point on IsoCurve(0,c) at t is srf(t,c)
		This is a horizontal line from left to right
		1 first parameter is constant and second parameter varies
		e.g., point on IsoCurve(1,c) at t is srf(c,t
		This is a vertical line from bottom to top.
		 * @param {number} constantParameter The parameter that was constant on the original surface.
		 * @returns {Curve} An isoparametric curve or null on error.
		 */
		isoCurve(direction:number,constantParameter:number): Curve;
		/**
		 * @description Gets a NURBS surface representation of this surface. Default
		tolerance of 0.0 is used.
		 * @returns {NurbsSurface} NurbsSurface on success, null on failure.
		 */
		toNurbsSurface(): NurbsSurface;
		/**
		 * @description Tests a surface to see if it is planar to zero tolerance.
		 * @returns {boolean} true if the surface is planar (flat) to within RhinoMath.ZeroTolerance units (1e-12).
		 */
		isPlanar(): boolean;
		/**
		 * @description Determines if the surface is a portion of a sphere within RhinoMath.ZeroTolerance.
		 * @returns {boolean} true if the surface is a portion of a sphere.
		 */
		isSphere(): boolean;
		/**
		 * @description Determines if the surface is a portion of a cylinder within RhinoMath.ZeroTolerance.
		 * @returns {boolean} true if the surface is a portion of a cylinder.
		 */
		isCylinder(): boolean;
		/**
		 * @description Determines if the surface is a portion of a cone within RhinoMath.ZeroTolerance.
		 * @returns {boolean} true if the surface is a portion of a cone.
		 */
		isCone(): boolean;
		/**
		 * @description Determines if the surface is a portion of a torus within RhinoMath.ZeroTolerance.
		 * @returns {boolean} true if the surface is a portion of a torus.
		 */
		isTorus(): boolean;
		/**
		 * @description Translates a parameter from a value on the surface returned by  to the current surface.
		 * @param {number} nurbsS The parameter in the S, or sometimes U, direction of the NURBS form surface.
		 * @param {number} nurbsT The parameter in the T, or sometimes V, direction of the NURBS form surface.
		 * @returns {Array} [boolean, number, number]
		 * (boolean) True if the operation succeeded; otherwise, false.
		 * (number) S on this surface.
		 * (number) T o n this surface.
		 */
		getSurfaceParameterFromNurbsFormParameter(nurbsS:number,nurbsT:number): object;
		/**
		 * @description Translates a parameter from the current surface to the parameter space of the surface returned by .
		 * @param {number} surfaceS The parameter in the S, or sometimes U, direction, of this surface.
		 * @param {number} surfaceT The parameter in the T, or sometimes V, direction of this surface.
		 * @returns {Array} [boolean, number, number]
		 * (boolean) True if the operation succeeded; otherwise, false.
		 * (number) S on the NURBS form.
		 * (number) T on the NURBS form.
		 */
		getNurbsFormParameterFromSurfaceParameter(surfaceS:number,surfaceT:number): object;
	}

	class SurfaceProxy extends Surface {
	}

	class TextDot extends GeometryBase {
		/**
		 * Gets or sets the position of the text dot.
		 */
		point: number[];
		/**
		 * Gets or sets the primary text of the text dot.
		 */
		text: string;
		/**
		 * Gets or sets the secondary text of the text dot.
		 */
		secondaryText: string;
		/**
		 * Height of font used for displaying the dot
		 */
		fontHeight: number;
		/**
		 * Font face used for displaying the dot
		 */
		fontFace: string;
	}

	class Texture {
		/**
		 * Gets or sets a file name that is used by this texture.
		 * NOTE: We are moving away from string-based FileName, and suggest
		 * the usage of the new FileReference class.Also, this filename may well not be a path that makes sense
		 * on a user's computer because it was a path initially set on
		 * a different user's computer. If you want to get a workable path
		 * for this user, use the BitmapTable.Find function using this
		 * property.
		 */
		fileName: string;
		/**
		 * Texture wrapping mode in the U direction
		 */
		wrapU: TextureUvwWrapping;
		/**
		 * Texture wrapping mode in the V direction
		 */
		wrapV: TextureUvwWrapping;
		/**
		 * Texture wrapping mode in the W direction
		 */
		wrapW: TextureUvwWrapping;
		/**
		 * Transform to be applied to each instance of this texture
		 * if ApplyUvw is true
		 */
		uvwTransform: Transform;
		/**
		 * Gets the globally unique identifier of this texture.
		 */
		id: string;
		/**
		 * If the texture is enabled then it will be visible in the rendered
		 * display otherwise it will not.
		 */
		enabled: boolean;
		/**
		 * Controls how the pixels in the bitmap are interpreted
		 */
		textureType: TextureType;
		/** ... */
		fileReference(): void;
	}

	class TextureMapping extends CommonObject {
		/**
		 */
		requiresVertexNormals: any;
		/**
		 */
		isPeriodic: any;
		/**
		 * @description Create a mapping that will convert surface parameters into normalized(0,1)x(0,1) texture coordinates.
		 * @returns {TextureMapping} TextureMapping instance or null if failed.
		 */
		static createSurfaceParameterMapping(): TextureMapping;
		/**
		 * @description Create a planar UV projection texture mapping
		 * @param {Plane} plane A plane to use for mapping.
		 * @param {number[]} dx portion of the plane's x axis that is mapped to [0,1] (can be a decreasing interval)
		 * @param {number[]} dy portion of the plane's y axis that is mapped to [0,1] (can be a decreasing interval)
		 * @param {number[]} dz portion of the plane's z axis that is mapped to [0,1] (can be a decreasing interval)
		 * @returns {TextureMapping} TextureMapping instance if input is valid
		 */
		static createPlaneMapping(plane:Plane,dx:number[],dy:number[],dz:number[]): TextureMapping;
		/**
		 * @description Create a cylindrical projection texture mapping.
		 * @param {Cylinder} cylinder cylinder in world space used to define a cylindrical coordinate system.
		The angular parameter maps (0,2pi) to texture "u" (0,1), The height
		parameter maps (height[0],height[1]) to texture "v" (0,1), and the
		radial parameter maps (0,r) to texture "w" (0,1).
		 * @param {boolean} capped If true, the cylinder is treated as a finite capped cylinder
		 * @returns {TextureMapping} TextureMapping instance if input is valid
		 */
		static createCylinderMapping(cylinder:Cylinder,capped:boolean): TextureMapping;
		/**
		 * @description Create a spherical projection texture mapping.
		 * @param {Sphere} sphere sphere in world space used to define a spherical coordinate system.
		The longitude parameter maps (0,2pi) to texture "u" (0,1).
		The latitude parameter maps (-pi/2,+pi/2) to texture "v" (0,1).
		The radial parameter maps (0,r) to texture "w" (0,1).
		 * @returns {TextureMapping} TextureMapping instance if input is valid
		 */
		static createSphereMapping(sphere:Sphere): TextureMapping;
		/**
		 * @description Create a box projection texture mapping.
		 * @param {Plane} plane The sides of the box the box are parallel to the plane's coordinate
		planes.  The dx, dy, dz intervals determine the location of the sides.
		 * @param {number[]} dx Determines the location of the front and back planes. The vector
		plane.xaxis is perpendicular to these planes and they pass through
		plane.PointAt(dx[0],0,0) and plane.PointAt(dx[1],0,0), respectively.
		 * @param {number[]} dy Determines the location of the left and right planes. The vector
		plane.yaxis is perpendicular to these planes and they pass through
		plane.PointAt(0,dy[0],0) and plane.PointAt(0,dy[1],0), respectively.
		 * @param {number[]} dz Determines the location of the top and bottom planes. The vector
		plane.zaxis is perpendicular to these planes and they pass through
		plane.PointAt(0,0,dz[0]) and plane.PointAt(0,0,dz[1]), respectively.
		 * @param {boolean} capped If true, the box is treated as a finite capped box.
		 * @returns {TextureMapping} TextureMapping instance if input is valid
		 */
		static CreateBoxMapping(plane:Plane,dx:number[],dy:number[],dz:number[],capped:boolean): TextureMapping;
		/**
		 * @description Get a cylindrical projection parameters from this texture mapping.
		 * @returns {boolean} Returns true if a valid cylinder is returned.
		 */
		tryGetMappingCylinder(): object;
		/**
		 * @description Get a spherical projection parameters from this texture mapping.
		 * @returns {boolean} Returns true if a valid sphere is returned.
		 */
		tryGetMappingSphere(): object;
		/** ... */
		reverseTextureCoordinate(): void;
		/** ... */
		swapTextureCoordinate(): void;
		/** ... */
		tileTextureCoordinate(): void;
		/**
		 * @description Evaluate the mapping to get a texture coordinate
		 * @param {number[]} p Vertex location
		 * @param {number[]} n If the mapping projection is ray_projection, then this
		is the vertex unit normal.  Otherwise n is ignored.
		 * @returns {Array} [number, number[]]
		 * (number) Nonzero if evaluation is successful.  When the mapping is a box or
		capped cylinder mapping, the value indicates which side was evaluated.
		Cylinder mapping: 1 = cylinder wall, 2 = bottom cap, 3 = top cap
		Box mapping: 1 = front, 2 = right, 3 = back, 4 = left, 5 = bottom, 6 = top
		 * (number[]) Texture coordinate (u,v,w)
		 */
		evaluate(p:number[],n:number[]): object;
	}

	class Thickening {
		/**
		 */
		on: any;
		/**
		 */
		distance: any;
		/**
		 */
		solid: any;
		/**
		 */
		offsetOnly: any;
		/**
		 */
		bothSides: any;
	}

	class Transform {
		/**
		 * Tests for an affine transformation.
		 * A transformation is affine if it is valid and its last row is [0, 0, 0, 1].
		 * An affine transformation can be broken into a linear transformation and a translation.
		 */
		isAffine: boolean;
		/**
		 * Return true if this Transform is the identity transform
		 */
		isIdentity: boolean;
		/**
		 * Tests for a linear transformation.
		 * A transformation is affine if it is valid and its last row is [0, 0, 0, 1].
		 * If in addition its last column is ( 0, 0, 0, 1)^T then it is linear.
		 * An affine transformation can be broken into a linear transformation and a translation.
		 */
		isLinear: boolean;
		/**
		 * Returns true if this is a proper rotation.
		 */
		isRotation: boolean;
		/**
		 * Gets a value indicating whether or not this Transform is a valid matrix.
		 * A valid transform matrix is not allowed to have any invalid numbers.
		 */
		isValid: boolean;
		/**
		 * True if matrix is Zero4x4, ZeroTransformation, or some other type of
		 * zero. The value xform[3][3] can be anything.
		 */
		isZero: boolean;
		/**
		 * True if all values are 0
		 */
		isZero4x4: boolean;
		/**
		 * True if all values are 0, except for M33 which is 1.
		 */
		isZeroTransformation: boolean;
		/**
		 * Gets a value indicating whether or not the Transform is rigid.
		 * A rigid transformation can be broken into  a proper rotation and a translation,
		 * while an isometry transformation could also include a reflection.
		 */
		rigidType: TransformRigidType;
		/**
		 * Gets a value indicating whether or not the Transform maintains similarity.
		 * The easiest way to think of Similarity is that any circle, when transformed,
		 * remains a circle. Whereas a non-similarity Transform deforms circles into ellipses.
		 */
		similarityType: TransformSimilarityType;
		/**
		 * Gets or sets this[0,0].
		 */
		m00: number;
		/**
		 * Gets or sets this[0,1].
		 */
		m01: number;
		/**
		 * Gets or sets this[0,2].
		 */
		m02: number;
		/**
		 * Gets or sets this[0,3].
		 */
		m03: number;
		/**
		 * Gets or sets this[1,0].
		 */
		m10: number;
		/**
		 * Gets or sets this[1,1].
		 */
		m11: number;
		/**
		 * Gets or sets this[1,2].
		 */
		m12: number;
		/**
		 * Gets or sets this[1,3].
		 */
		m13: number;
		/**
		 * Gets or sets this[2,0].
		 */
		m20: number;
		/**
		 * Gets or sets this[2,1].
		 */
		m21: number;
		/**
		 * Gets or sets this[2,2].
		 */
		m22: number;
		/**
		 * Gets or sets this[2,3].
		 */
		m23: number;
		/**
		 * Gets or sets this[3,0].
		 */
		m30: number;
		/**
		 * Gets or sets this[3,1].
		 */
		m31: number;
		/**
		 * Gets or sets this[3,2].
		 */
		m32: number;
		/**
		 * Gets or sets this[3,3].
		 */
		m33: number;

		constructor(diagonalValue: number);
		/** ... */
		static identity(): void;
		/** ... */
		static zeroTransformation(): void;
		/** ... */
		static unset(): void;
		/**
		 * @description Constructs a new translation (move) transformation.
		 * @param {number[]} motion Translation (motion) vector.
		 * @returns {Transform} A transform matrix which moves geometry along the motion vector.
		 */
		static translation(motion:number[]): Transform;
		/**
		 * @description Constructs a new translation (move) transformation.
		 * @param {number[]} motion Translation (motion) vector.
		 * @returns {Transform} A transform matrix which moves geometry along the motion vector.
		 */
		static translation(motion:number[]): Transform;
		/**
		 * @description Constructs a new uniform scaling transformation with a specified scaling anchor point.
		 * @param {number[]} anchor Defines the anchor point of the scaling operation.
		 * @param {number} scaleFactor Scaling factor in all directions.
		 * @returns {Transform} A transform matrix which scales geometry uniformly around the anchor point.
		 */
		static scale(anchor:number[],scaleFactor:number): Transform;
		/**
		 * @description Constructs a new rotation transformation with specified angle, rotation center and rotation axis.
		 * @param {number} sinAngle Sine of the rotation angle.
		 * @param {number} cosAngle Cosine of the rotation angle.
		 * @param {number[]} rotationAxis 3D unit axis of rotation.
		 * @param {number[]} rotationCenter 3D center of rotation.
		 * @returns {Transform} A rotation transformation matrix.
		 */
		static rotation(sinAngle:number,cosAngle:number,rotationAxis:number[],rotationCenter:number[]): Transform;
		/**
		 * @description Constructs a new rotation transformation with specified angle, rotation center and rotation axis.
		 * @param {number} sinAngle Sine of the rotation angle.
		 * @param {number} cosAngle Cosine of the rotation angle.
		 * @param {number[]} rotationAxis 3D unit axis of rotation.
		 * @param {number[]} rotationCenter 3D center of rotation.
		 * @returns {Transform} A rotation transformation matrix.
		 */
		static rotation(sinAngle:number,cosAngle:number,rotationAxis:number[],rotationCenter:number[]): Transform;
		/**
		 * @description Create mirror transformation matrix
		The mirror transform maps a point Q to
		Q - (2*(Q-P)oN)*N, where
		P = pointOnMirrorPlane and N = normalToMirrorPlane.
		 * @param {number[]} pointOnMirrorPlane Point on the mirror plane.
		 * @param {number[]} normalToMirrorPlane Normal vector to the mirror plane.
		 * @returns {Transform} A transformation matrix which mirrors geometry in a specified plane.
		 */
		static mirror(pointOnMirrorPlane:number[],normalToMirrorPlane:number[]): Transform;
		/**
		 * @description Create mirror transformation matrix
		The mirror transform maps a point Q to
		Q - (2*(Q-P)oN)*N, where
		P = pointOnMirrorPlane and N = normalToMirrorPlane.
		 * @param {number[]} pointOnMirrorPlane Point on the mirror plane.
		 * @param {number[]} normalToMirrorPlane Normal vector to the mirror plane.
		 * @returns {Transform} A transformation matrix which mirrors geometry in a specified plane.
		 */
		static mirror(pointOnMirrorPlane:number[],normalToMirrorPlane:number[]): Transform;
		/**
		 * @description Create a rotation transformation that orients plane0 to plane1. If you want to orient objects from
		one plane to another, use this form of transformation.
		 * @param {Plane} plane0 The plane to orient from.
		 * @param {Plane} plane1 the plane to orient to.
		 * @returns {Transform} The translation transformation if successful, Transform.Unset on failure.
		 */
		static planeToPlane(plane0:Plane,plane1:Plane): Transform;
		/**
		 * @description Constructs a Shear transformation.
		 * @param {Plane} plane Base plane for shear.
		 * @param {number[]} x Shearing vector along plane x-axis.
		 * @param {number[]} y Shearing vector along plane y-axis.
		 * @param {number[]} z Shearing vector along plane z-axis.
		 * @returns {Transform} A transformation matrix which shear geometry.
		 */
		static shear(plane:Plane,x:number[],y:number[],z:number[]): Transform;
		/**
		 * @description Multiplies (combines) two transformations.
		This is the same as the * operator between two transformations.
		 * @param {Transform} a First transformation.
		 * @param {Transform} b Second transformation.
		 * @returns {Transform} A transformation matrix that combines the effect of both input transformations.
		The resulting Transform gives the same result as though you'd first apply B then A.
		 */
		static multiply(a:Transform,b:Transform): Transform;
		/** ... */
		determinant(): void;
		/**
		 * @description Attempts to get the inverse transform of this transform.
		 * @returns {Array} [boolean, Transform]
		 * (boolean) true on success.
		If false is returned and this Transform is Invalid, inserveTransform will be set to this Transform.
		If false is returned and this Transform is Valid, inverseTransform will be set to a pseudo inverse.
		 * (Transform) The inverse transform. This out reference will be assigned during this call.
		 */
		tryGetInverse(): object;
		/**
		 * @description Computes a new bounding box that is the smallest axis aligned
		bounding box that contains the transformed result of its 8 original corner
		points.
		 * @returns {BoundingBox} A new bounding box.
		 */
		transformBoundingBox(): BoundingBox;
		/**
		 * @description Flip row/column values
		 * @returns {Transform}
		 */
		transpose(): Transform;
		/**
		 * @description Return the matrix as a linear array of 16 float values.
		 * @param {boolean} rowDominant If true, returns { M00, M01, M02...}.
		If false, returns { M00, M10, M20...}.
		 * @returns {number[]} An array of 16 floats.
		 */
		toFloatArray(rowDominant:boolean): number[];
	}

	class ViewInfo {
		/**
		 * Gets or sets the name of the view.
		 */
		name: string;
		/**
		 */
		wallpaperName: any;
		/**
		 * True if wallpaper (if any) is to be shown in gray scale in this view.
		 */
		showWallpaperInGrayScale: boolean;
		/**
		 * True if wallpaper (if any) is to be hidden from this view.
		 */
		wallpaperHidden: boolean;
		/**
		 * Gets or sets the Focal blur distance of the active viewport
		 */
		focalBlurDistance: number;
		/**
		 * Gets or sets the Focal blur aperture of the active viewport
		 */
		focalBlurAperture: number;
		/**
		 * Gets or sets the Focal blur jitter of the active viewport
		 */
		focalBlurJitter: number;
		/**
		 * Gets or sets the Focal blur sample count of the active viewport
		 */
		focalBlurSampleCount: number;
	}

	class ViewportInfo extends CommonObject {
		/**
		 */
		isValidCameraFrame: any;
		/**
		 */
		isValidCamer: any;
		/**
		 * Gets a value that indicates whether the frustum is valid.
		 */
		isValidFrustum: boolean;
		/**
		 * Get or set whether this projection is parallel.
		 */
		isParallelProjection: boolean;
		/**
		 * Get or set whether this projection is perspective.
		 */
		isPerspectiveProjection: boolean;
		/**
		 * Gets a value that indicates whether this projection is a two-point perspective.
		 */
		isTwoPointPerspectiveProjection: boolean;
		/**
		 * Gets the camera location (position) point.
		 */
		cameraLocation: number[];
		/**
		 * Gets the direction that the camera faces.
		 */
		cameraDirection: number[];
		/**
		 * Gets the camera up vector.
		 */
		cameraUp: number[];
		/**
		 * Gets the unit "to the right" vector.
		 */
		cameraX: number[];
		/**
		 * Gets the unit "up" vector.
		 */
		cameraY: number[];
		/**
		 * Gets the unit vector in -CameraDirection.
		 */
		cameraZ: number[];
		/**
		 * Get or set the screen port.  and
		 */
		screenPort: number[];
		/**
		 * Gets the screen aspect ratio.
		 * This is width / height.
		 */
		screenPortAspect: number;
		/**
		 * Gets or sets the 1/2 smallest angle. See  for more information.
		 */
		cameraAngle: number;
		/**
		 * This property assumes the camera is horizontal and crop the
		 * film rather than the image when the aspect of the frustum
		 * is not 36/24.  (35mm film is 36mm wide and 24mm high.)
		 * Setting preserves camera location,
		 * changes the frustum, but maintains the frustum's aspect.
		 */
		camera35mmLensLength: number;
		/**
		 * The current value of the target point.  This point does not play
		 * a role in the view projection calculations.  It can be used as a
		 * fixed point when changing the camera so the visible regions of the
		 * before and after frustums both contain the region of interest.
		 * The default constructor sets this point on ON_3dPoint::UnsetPoint.
		 * You must explicitly call one SetTargetPoint() functions to set
		 * the target point.
		 */
		targetPoint: number[];
		/**
		 * Sets the viewport's id to the value used to
		 * uniquely identify this viewport.
		 * There is no approved way to change the viewport
		 * id once it is set in order to maintain consistency
		 * across multiple viewports and those routines that
		 * manage them.
		 */
		id: string;
		/** ... */
		static defaultTop(): void;
		/** ... */
		static defaultPerspective(): void;
		/**
		 * @description Use this function to change projections of valid viewports
		from parallel to perspective.  It will make common additional
		adjustments to the frustum and camera location so the resulting
		views are similar.  The camera direction and target point are
		not be changed.
		If the current projection is parallel and symmetricFrustum,
		FrustumIsLeftRightSymmetric() and FrustumIsTopBottomSymmetric()
		are all equal, then no changes are made and true is returned.
		 * @param {boolean} symmetricFrustum true if you want the resulting frustum to be symmetric.
		 * @returns {boolean} true if the operation succeeded; otherwise, false.
		 */
		changeToParallelProjection(symmetricFrustum:boolean): boolean;
		/**
		 * @description Use this function to change projections of valid viewports
		from parallel to perspective.  It will make common additional
		adjustments to the frustum and camera location so the resulting
		views are similar.  The camera direction and target point are
		not changed.
		If the current projection is perspective and symmetricFrustum,
		IsFrustumIsLeftRightSymmetric, and IsFrustumIsTopBottomSymmetric
		are all equal, then no changes are made and true is returned.
		 * @param {number} targetDistance If RhinoMath.UnsetValue this parameter is ignored.
		Otherwise it must be > 0 and indicates which plane in the current view frustum should be preserved.
		 * @param {boolean} symmetricFrustum true if you want the resulting frustum to be symmetric.
		 * @param {number} lensLength (pass 50.0 when in doubt)
		35 mm lens length to use when changing from parallel
		to perspective projections. If the current projection
		is perspective or lens_length is <= 0.0,
		then this parameter is ignored.
		 * @returns {boolean} true if the operation succeeded; otherwise, false.
		 */
		changeToPerspectiveProjection(targetDistance:number,symmetricFrustum:boolean,lensLength:number): boolean;
		/**
		 * @description Changes projections of valid viewports
		to a two point perspective.  It will make common additional
		adjustments to the frustum and camera location and direction
		so the resulting views are similar.
		If the current projection is perspective and
		IsFrustumIsLeftRightSymmetric is true and
		IsFrustumIsTopBottomSymmetric is false, then no changes are
		made and true is returned.
		 * @param {number} targetDistance If RhinoMath.UnsetValue this parameter is ignored.  Otherwise
		it must be > 0 and indicates which plane in the current
		view frustum should be preserved.
		 * @param {number[]} up The locked up direction. Pass Vector3d.Zero if you want to use the world
		axis direction that is closest to the current up direction.
		Pass CameraY() if you want to preserve the current up direction.
		 * @param {number} lensLength (pass 50.0 when in doubt)
		35 mm lens length to use when changing from parallel
		to perspective projections. If the current projection
		is perspective or lens_length is <= 0.0,
		then this parameter is ignored.
		 * @returns {boolean} true if the operation succeeded; otherwise, false.
		 */
		changeToTwoPointPerspectiveProjection(targetDistance:number,up:number[],lensLength:number): boolean;
		/**
		 * @description Sets the camera location (position) point.
		 * @returns {boolean} true if the operation succeeded; otherwise, false.
		 */
		setCameraLocation(): boolean;
		/**
		 * @description Sets the direction that the camera faces.
		 * @param {number[]} direction A new direction.
		 * @returns {boolean} true if the direction was set; otherwise false.
		 */
		setCameraDirection(direction:number[]): boolean;
		/**
		 * @description Sets the camera up vector.
		 * @param {number[]} up A new direction.
		 * @returns {boolean} true if the direction was set; otherwise false.
		 */
		setCameraUp(up:number[]): boolean;
		/**
		 * @description Sets the view frustum. If FrustumSymmetryIsLocked() is true
		and left != -right or bottom != -top, then they will be
		adjusted so the resulting frustum is symmetric.
		 * @param {number} left A new left value.
		 * @param {number} right A new right value.
		 * @param {number} bottom A new bottom value.
		 * @param {number} top A new top value.
		 * @param {number} nearDistance A new near distance value.
		 * @param {number} farDistance A new far distance value.
		 * @returns {boolean} true if operation succeeded; otherwise, false.
		 */
		setFrustum(left:number,right:number,bottom:number,top:number,nearDistance:number,farDistance:number): boolean;
		/**
		 * @description Gets the view frustum.
		 * @returns {Array} [boolean, number, number, number, number, number, number]
		 * (boolean) true if operation succeeded; otherwise, false.
		 * (number) A left value that will be filled during the call.
		 * (number) A right value that will be filled during the call.
		 * (number) A bottom value that will be filled during the call.
		 * (number) A top value that will be filled during the call.
		 * (number) A near distance value that will be filled during the call.
		 * (number) A far distance value that will be filled during the call.
		 */
		getFrustum(): object;
		/**
		 * @description Computes a transform from a coordinate system to another.
		 * @param {CoordinateSystem} sourceSystem The coordinate system to map from.
		 * @param {CoordinateSystem} destinationSystem The coordinate system to map into.
		 * @returns {Transform} The 4x4 transformation matrix (acts on the left).
		 */
		getXform(sourceSystem:CoordinateSystem,destinationSystem:CoordinateSystem): Transform;
		/**
		 * @description Extends this viewport view to include a bounding box.
		Use Extents() as a quick way to set a viewport to so that bounding
		volume is inside of a viewports frustum.
		The view angle is used to determine the position of the camera.
		 * @param {number} halfViewAngleRadians 1/2 smallest subtended view angle in radians.
		 * @param {BoundingBox} bbox A bounding box in 3d world coordinates.
		 * @returns {boolean} true if the operation succeeded; otherwise, false.
		 */
		extents(halfViewAngleRadians:number,bbox:BoundingBox): boolean;
		/**
		 * @description Dolly the camera location and so that the view frustum contains
		all of the document objects that can be seen in view.
		If the projection is perspective, the camera angle is not changed.
		 * @param {number} border If border > 1.0, then the frustum in enlarged by this factor
		to provide a border around the view.  1.1 works well for
		parallel projections; 0.0 is suggested for perspective projections.
		 * @returns {boolean} True if successful.
		 */
		dollyExtents(border:number): boolean;
		/**
		 * @description Return a point on the central axis of the view frustum.
		This point is a good choice for a general purpose target point.
		 * @param {number} targetDistance If targetDistance > 0.0, then the distance from the returned
		point to the camera plane will be targetDistance. Note that
		if the frustum is not symmetric, the distance from the
		returned point to the camera location will be larger than
		targetDistance.
		If targetDistance == ON_UNSET_VALUE and the frustum
		is valid with near > 0.0, then 0.5*(near + far) will be used
		as the targetDistance.
		 * @returns {number[]} A point on the frustum's central axis.  If the viewport or input
		is not valid, then ON_3dPoint::UnsetPoint is returned.
		 */
		frustumCenterPoint(targetDistance:number): number[];
		/**
		 * @description Gets the distance from the target point to the camera plane.
		Note that if the frustum is not symmetric, then this distance
		is shorter than the distance from the target to the camera location.
		 * @param {boolean} useFrustumCenterFallback If bUseFrustumCenterFallback is false and the target point is
		not valid, then ON_UNSET_VALUE is returned.
		If bUseFrustumCenterFallback is true and the frustum is valid
		and current target point is not valid or is behind the camera,
		then 0.5*(near + far) is returned.
		 * @returns {number} Shortest signed distance from camera plane to target point.
		If the target point is on the visible side of the camera,
		a positive value is returned.  ON_UNSET_VALUE is returned
		when the input of view is not valid.
		 */
		targetDistance(useFrustumCenterFallback:boolean): number;
	}
}
