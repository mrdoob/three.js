import {AnimationClip, Bone, Matrix4, Object3D, Skeleton, SkeletonHelper} from "../../..";

export class SkeletonUtils {
	retarget(target: Object3D | Skeleton,
					 source: Object3D | Skeleton,
					 options: {})

	retargetClip(target: Skeleton | Object3D,
							 source: Skeleton | Object3D,
							 clip: AnimationClip,
							 options: {}): AnimationClip;

	getHelperFromSkeleton(skeleton: Skeleton): SkeletonHelper;

	getSkeletonOffsets(target: Object3D | Skeleton,
										 source: Object3D | Skeleton,
										 options: {}): Matrix4[];

	renameBones(skeleton: Skeleton, names: {}): any;

	getBones(skeleton: Skeleton | Bone[]): Bone[];

	getBoneByName(name: string, skeleton: Skeleton): Bone;

	getNearestBone(bone: Bone, names: {}): Bone;

	findBoneTrackData(name: string, tracks: any[]): {};

	getEqualsBonesNames(skeleton: Skeleton, targetSkeleton: Skeleton);

	clone(source: Skeleton): Skeleton;
}
