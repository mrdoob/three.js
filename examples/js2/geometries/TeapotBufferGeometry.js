"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
THREE.TeapotBufferGeometry = void 0;

var TeapotBufferGeometry = function TeapotBufferGeometry(size, segments, bottom, lid, body, fitLid, blinn) {
  var teapotPatches = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 3, 16, 17, 18, 7, 19, 20, 21, 11, 22, 23, 24, 15, 25, 26, 27, 18, 28, 29, 30, 21, 31, 32, 33, 24, 34, 35, 36, 27, 37, 38, 39, 30, 40, 41, 0, 33, 42, 43, 4, 36, 44, 45, 8, 39, 46, 47, 12, 12, 13, 14, 15, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 15, 25, 26, 27, 51, 60, 61, 62, 55, 63, 64, 65, 59, 66, 67, 68, 27, 37, 38, 39, 62, 69, 70, 71, 65, 72, 73, 74, 68, 75, 76, 77, 39, 46, 47, 12, 71, 78, 79, 48, 74, 80, 81, 52, 77, 82, 83, 56, 56, 57, 58, 59, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 59, 66, 67, 68, 87, 96, 97, 98, 91, 99, 100, 101, 95, 102, 103, 104, 68, 75, 76, 77, 98, 105, 106, 107, 101, 108, 109, 110, 104, 111, 112, 113, 77, 82, 83, 56, 107, 114, 115, 84, 110, 116, 117, 88, 113, 118, 119, 92, 120, 121, 122, 123, 124, 125, 126, 127, 128, 129, 130, 131, 132, 133, 134, 135, 123, 136, 137, 120, 127, 138, 139, 124, 131, 140, 141, 128, 135, 142, 143, 132, 132, 133, 134, 135, 144, 145, 146, 147, 148, 149, 150, 151, 68, 152, 153, 154, 135, 142, 143, 132, 147, 155, 156, 144, 151, 157, 158, 148, 154, 159, 160, 68, 161, 162, 163, 164, 165, 166, 167, 168, 169, 170, 171, 172, 173, 174, 175, 176, 164, 177, 178, 161, 168, 179, 180, 165, 172, 181, 182, 169, 176, 183, 184, 173, 173, 174, 175, 176, 185, 186, 187, 188, 189, 190, 191, 192, 193, 194, 195, 196, 176, 183, 184, 173, 188, 197, 198, 185, 192, 199, 200, 189, 196, 201, 202, 193, 203, 203, 203, 203, 204, 205, 206, 207, 208, 208, 208, 208, 209, 210, 211, 212, 203, 203, 203, 203, 207, 213, 214, 215, 208, 208, 208, 208, 212, 216, 217, 218, 203, 203, 203, 203, 215, 219, 220, 221, 208, 208, 208, 208, 218, 222, 223, 224, 203, 203, 203, 203, 221, 225, 226, 204, 208, 208, 208, 208, 224, 227, 228, 209, 209, 210, 211, 212, 229, 230, 231, 232, 233, 234, 235, 236, 237, 238, 239, 240, 212, 216, 217, 218, 232, 241, 242, 243, 236, 244, 245, 246, 240, 247, 248, 249, 218, 222, 223, 224, 243, 250, 251, 252, 246, 253, 254, 255, 249, 256, 257, 258, 224, 227, 228, 209, 252, 259, 260, 229, 255, 261, 262, 233, 258, 263, 264, 237, 265, 265, 265, 265, 266, 267, 268, 269, 270, 271, 272, 273, 92, 119, 118, 113, 265, 265, 265, 265, 269, 274, 275, 276, 273, 277, 278, 279, 113, 112, 111, 104, 265, 265, 265, 265, 276, 280, 281, 282, 279, 283, 284, 285, 104, 103, 102, 95, 265, 265, 265, 265, 282, 286, 287, 266, 285, 288, 289, 270, 95, 94, 93, 92];
  var teapotVertices = [1.4, 0, 2.4, 1.4, -0.784, 2.4, 0.784, -1.4, 2.4, 0, -1.4, 2.4, 1.3375, 0, 2.53125, 1.3375, -0.749, 2.53125, 0.749, -1.3375, 2.53125, 0, -1.3375, 2.53125, 1.4375, 0, 2.53125, 1.4375, -0.805, 2.53125, 0.805, -1.4375, 2.53125, 0, -1.4375, 2.53125, 1.5, 0, 2.4, 1.5, -0.84, 2.4, 0.84, -1.5, 2.4, 0, -1.5, 2.4, -0.784, -1.4, 2.4, -1.4, -0.784, 2.4, -1.4, 0, 2.4, -0.749, -1.3375, 2.53125, -1.3375, -0.749, 2.53125, -1.3375, 0, 2.53125, -0.805, -1.4375, 2.53125, -1.4375, -0.805, 2.53125, -1.4375, 0, 2.53125, -0.84, -1.5, 2.4, -1.5, -0.84, 2.4, -1.5, 0, 2.4, -1.4, 0.784, 2.4, -0.784, 1.4, 2.4, 0, 1.4, 2.4, -1.3375, 0.749, 2.53125, -0.749, 1.3375, 2.53125, 0, 1.3375, 2.53125, -1.4375, 0.805, 2.53125, -0.805, 1.4375, 2.53125, 0, 1.4375, 2.53125, -1.5, 0.84, 2.4, -0.84, 1.5, 2.4, 0, 1.5, 2.4, 0.784, 1.4, 2.4, 1.4, 0.784, 2.4, 0.749, 1.3375, 2.53125, 1.3375, 0.749, 2.53125, 0.805, 1.4375, 2.53125, 1.4375, 0.805, 2.53125, 0.84, 1.5, 2.4, 1.5, 0.84, 2.4, 1.75, 0, 1.875, 1.75, -0.98, 1.875, 0.98, -1.75, 1.875, 0, -1.75, 1.875, 2, 0, 1.35, 2, -1.12, 1.35, 1.12, -2, 1.35, 0, -2, 1.35, 2, 0, 0.9, 2, -1.12, 0.9, 1.12, -2, 0.9, 0, -2, 0.9, -0.98, -1.75, 1.875, -1.75, -0.98, 1.875, -1.75, 0, 1.875, -1.12, -2, 1.35, -2, -1.12, 1.35, -2, 0, 1.35, -1.12, -2, 0.9, -2, -1.12, 0.9, -2, 0, 0.9, -1.75, 0.98, 1.875, -0.98, 1.75, 1.875, 0, 1.75, 1.875, -2, 1.12, 1.35, -1.12, 2, 1.35, 0, 2, 1.35, -2, 1.12, 0.9, -1.12, 2, 0.9, 0, 2, 0.9, 0.98, 1.75, 1.875, 1.75, 0.98, 1.875, 1.12, 2, 1.35, 2, 1.12, 1.35, 1.12, 2, 0.9, 2, 1.12, 0.9, 2, 0, 0.45, 2, -1.12, 0.45, 1.12, -2, 0.45, 0, -2, 0.45, 1.5, 0, 0.225, 1.5, -0.84, 0.225, 0.84, -1.5, 0.225, 0, -1.5, 0.225, 1.5, 0, 0.15, 1.5, -0.84, 0.15, 0.84, -1.5, 0.15, 0, -1.5, 0.15, -1.12, -2, 0.45, -2, -1.12, 0.45, -2, 0, 0.45, -0.84, -1.5, 0.225, -1.5, -0.84, 0.225, -1.5, 0, 0.225, -0.84, -1.5, 0.15, -1.5, -0.84, 0.15, -1.5, 0, 0.15, -2, 1.12, 0.45, -1.12, 2, 0.45, 0, 2, 0.45, -1.5, 0.84, 0.225, -0.84, 1.5, 0.225, 0, 1.5, 0.225, -1.5, 0.84, 0.15, -0.84, 1.5, 0.15, 0, 1.5, 0.15, 1.12, 2, 0.45, 2, 1.12, 0.45, 0.84, 1.5, 0.225, 1.5, 0.84, 0.225, 0.84, 1.5, 0.15, 1.5, 0.84, 0.15, -1.6, 0, 2.025, -1.6, -0.3, 2.025, -1.5, -0.3, 2.25, -1.5, 0, 2.25, -2.3, 0, 2.025, -2.3, -0.3, 2.025, -2.5, -0.3, 2.25, -2.5, 0, 2.25, -2.7, 0, 2.025, -2.7, -0.3, 2.025, -3, -0.3, 2.25, -3, 0, 2.25, -2.7, 0, 1.8, -2.7, -0.3, 1.8, -3, -0.3, 1.8, -3, 0, 1.8, -1.5, 0.3, 2.25, -1.6, 0.3, 2.025, -2.5, 0.3, 2.25, -2.3, 0.3, 2.025, -3, 0.3, 2.25, -2.7, 0.3, 2.025, -3, 0.3, 1.8, -2.7, 0.3, 1.8, -2.7, 0, 1.575, -2.7, -0.3, 1.575, -3, -0.3, 1.35, -3, 0, 1.35, -2.5, 0, 1.125, -2.5, -0.3, 1.125, -2.65, -0.3, 0.9375, -2.65, 0, 0.9375, -2, -0.3, 0.9, -1.9, -0.3, 0.6, -1.9, 0, 0.6, -3, 0.3, 1.35, -2.7, 0.3, 1.575, -2.65, 0.3, 0.9375, -2.5, 0.3, 1.125, -1.9, 0.3, 0.6, -2, 0.3, 0.9, 1.7, 0, 1.425, 1.7, -0.66, 1.425, 1.7, -0.66, 0.6, 1.7, 0, 0.6, 2.6, 0, 1.425, 2.6, -0.66, 1.425, 3.1, -0.66, 0.825, 3.1, 0, 0.825, 2.3, 0, 2.1, 2.3, -0.25, 2.1, 2.4, -0.25, 2.025, 2.4, 0, 2.025, 2.7, 0, 2.4, 2.7, -0.25, 2.4, 3.3, -0.25, 2.4, 3.3, 0, 2.4, 1.7, 0.66, 0.6, 1.7, 0.66, 1.425, 3.1, 0.66, 0.825, 2.6, 0.66, 1.425, 2.4, 0.25, 2.025, 2.3, 0.25, 2.1, 3.3, 0.25, 2.4, 2.7, 0.25, 2.4, 2.8, 0, 2.475, 2.8, -0.25, 2.475, 3.525, -0.25, 2.49375, 3.525, 0, 2.49375, 2.9, 0, 2.475, 2.9, -0.15, 2.475, 3.45, -0.15, 2.5125, 3.45, 0, 2.5125, 2.8, 0, 2.4, 2.8, -0.15, 2.4, 3.2, -0.15, 2.4, 3.2, 0, 2.4, 3.525, 0.25, 2.49375, 2.8, 0.25, 2.475, 3.45, 0.15, 2.5125, 2.9, 0.15, 2.475, 3.2, 0.15, 2.4, 2.8, 0.15, 2.4, 0, 0, 3.15, 0.8, 0, 3.15, 0.8, -0.45, 3.15, 0.45, -0.8, 3.15, 0, -0.8, 3.15, 0, 0, 2.85, 0.2, 0, 2.7, 0.2, -0.112, 2.7, 0.112, -0.2, 2.7, 0, -0.2, 2.7, -0.45, -0.8, 3.15, -0.8, -0.45, 3.15, -0.8, 0, 3.15, -0.112, -0.2, 2.7, -0.2, -0.112, 2.7, -0.2, 0, 2.7, -0.8, 0.45, 3.15, -0.45, 0.8, 3.15, 0, 0.8, 3.15, -0.2, 0.112, 2.7, -0.112, 0.2, 2.7, 0, 0.2, 2.7, 0.45, 0.8, 3.15, 0.8, 0.45, 3.15, 0.112, 0.2, 2.7, 0.2, 0.112, 2.7, 0.4, 0, 2.55, 0.4, -0.224, 2.55, 0.224, -0.4, 2.55, 0, -0.4, 2.55, 1.3, 0, 2.55, 1.3, -0.728, 2.55, 0.728, -1.3, 2.55, 0, -1.3, 2.55, 1.3, 0, 2.4, 1.3, -0.728, 2.4, 0.728, -1.3, 2.4, 0, -1.3, 2.4, -0.224, -0.4, 2.55, -0.4, -0.224, 2.55, -0.4, 0, 2.55, -0.728, -1.3, 2.55, -1.3, -0.728, 2.55, -1.3, 0, 2.55, -0.728, -1.3, 2.4, -1.3, -0.728, 2.4, -1.3, 0, 2.4, -0.4, 0.224, 2.55, -0.224, 0.4, 2.55, 0, 0.4, 2.55, -1.3, 0.728, 2.55, -0.728, 1.3, 2.55, 0, 1.3, 2.55, -1.3, 0.728, 2.4, -0.728, 1.3, 2.4, 0, 1.3, 2.4, 0.224, 0.4, 2.55, 0.4, 0.224, 2.55, 0.728, 1.3, 2.55, 1.3, 0.728, 2.55, 0.728, 1.3, 2.4, 1.3, 0.728, 2.4, 0, 0, 0, 1.425, 0, 0, 1.425, 0.798, 0, 0.798, 1.425, 0, 0, 1.425, 0, 1.5, 0, 0.075, 1.5, 0.84, 0.075, 0.84, 1.5, 0.075, 0, 1.5, 0.075, -0.798, 1.425, 0, -1.425, 0.798, 0, -1.425, 0, 0, -0.84, 1.5, 0.075, -1.5, 0.84, 0.075, -1.5, 0, 0.075, -1.425, -0.798, 0, -0.798, -1.425, 0, 0, -1.425, 0, -1.5, -0.84, 0.075, -0.84, -1.5, 0.075, 0, -1.5, 0.075, 0.798, -1.425, 0, 1.425, -0.798, 0, 0.84, -1.5, 0.075, 1.5, -0.84, 0.075];
  BufferGeometry.call(this);
  size = size || 50;
  segments = segments !== undefined ? Math.max(2, Math.floor(segments) || 10) : 10;
  bottom = bottom === undefined ? true : bottom;
  lid = lid === undefined ? true : lid;
  body = body === undefined ? true : body;
  fitLid = fitLid === undefined ? true : fitLid;
  var blinnScale = 1.3;
  blinn = blinn === undefined ? true : blinn;
  var maxHeight = 3.15 * (blinn ? 1 : blinnScale);
  var maxHeight2 = maxHeight / 2;
  var trueSize = size / maxHeight2;
  var numTriangles = bottom ? (8 * segments - 4) * segments : 0;
  numTriangles += lid ? (16 * segments - 4) * segments : 0;
  numTriangles += body ? 40 * segments * segments : 0;
  var indices = new Uint32Array(numTriangles * 3);
  var numVertices = bottom ? 4 : 0;
  numVertices += lid ? 8 : 0;
  numVertices += body ? 20 : 0;
  numVertices *= (segments + 1) * (segments + 1);
  var vertices = new Float32Array(numVertices * 3);
  var normals = new Float32Array(numVertices * 3);
  var uvs = new Float32Array(numVertices * 2);
  var ms = new THREE.Matrix4();
  ms.set(-1.0, 3.0, -3.0, 1.0, 3.0, -6.0, 3.0, 0.0, -3.0, 3.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0);
  var g = [];
  var i, r, c;
  var sp = [];
  var tp = [];
  var dsp = [];
  var dtp = [];
  var mgm = [];
  var vert = [];
  var sdir = [];
  var tdir = [];
  var norm = new THREE.Vector3();
  var tcoord;
  var sstep, tstep;
  var vertPerRow;
  var s, t, sval, tval, p;
  var dsval = 0;
  var dtval = 0;
  var normOut = new Vector3();
  var v1, v2, v3, v4;
  var gmx = new Matrix4();
  var tmtx = new Matrix4();
  var vsp = new THREE.Vector4();
  var vtp = new Vector4();
  var vdsp = new Vector4();
  var vdtp = new Vector4();
  var vsdir = new Vector3();
  var vtdir = new Vector3();
  var mst = ms.clone();
  mst.transpose();

  var notDegenerate = function notDegenerate(vtx1, vtx2, vtx3) {
    return !(vertices[vtx1 * 3] === vertices[vtx2 * 3] && vertices[vtx1 * 3 + 1] === vertices[vtx2 * 3 + 1] && vertices[vtx1 * 3 + 2] === vertices[vtx2 * 3 + 2] || vertices[vtx1 * 3] === vertices[vtx3 * 3] && vertices[vtx1 * 3 + 1] === vertices[vtx3 * 3 + 1] && vertices[vtx1 * 3 + 2] === vertices[vtx3 * 3 + 2] || vertices[vtx2 * 3] === vertices[vtx3 * 3] && vertices[vtx2 * 3 + 1] === vertices[vtx3 * 3 + 1] && vertices[vtx2 * 3 + 2] === vertices[vtx3 * 3 + 2]);
  };

  for (i = 0; i < 3; i++) {
    mgm[i] = new Matrix4();
  }

  var minPatches = body ? 0 : 20;
  var maxPatches = bottom ? 32 : 28;
  vertPerRow = segments + 1;
  var surfCount = 0;
  var vertCount = 0;
  var normCount = 0;
  var uvCount = 0;
  var indexCount = 0;

  for (var surf = minPatches; surf < maxPatches; surf++) {
    if (lid || surf < 20 || surf >= 28) {
      for (i = 0; i < 3; i++) {
        for (r = 0; r < 4; r++) {
          for (c = 0; c < 4; c++) {
            g[c * 4 + r] = teapotVertices[teapotPatches[surf * 16 + r * 4 + c] * 3 + i];

            if (fitLid && surf >= 20 && surf < 28 && i !== 2) {
              g[c * 4 + r] *= 1.077;
            }

            if (!blinn && i === 2) {
              g[c * 4 + r] *= blinnScale;
            }
          }
        }

        gmx.set(g[0], g[1], g[2], g[3], g[4], g[5], g[6], g[7], g[8], g[9], g[10], g[11], g[12], g[13], g[14], g[15]);
        tmtx.multiplyMatrices(gmx, ms);
        mgm[i].multiplyMatrices(mst, tmtx);
      }

      for (sstep = 0; sstep <= segments; sstep++) {
        s = sstep / segments;

        for (tstep = 0; tstep <= segments; tstep++) {
          t = tstep / segments;

          for (p = 4, sval = tval = 1.0; p--;) {
            sp[p] = sval;
            tp[p] = tval;
            sval *= s;
            tval *= t;

            if (p === 3) {
              dsp[p] = dtp[p] = 0.0;
              dsval = dtval = 1.0;
            } else {
              dsp[p] = dsval * (3 - p);
              dtp[p] = dtval * (3 - p);
              dsval *= s;
              dtval *= t;
            }
          }

          vsp.fromArray(sp);
          vtp.fromArray(tp);
          vdsp.fromArray(dsp);
          vdtp.fromArray(dtp);

          for (i = 0; i < 3; i++) {
            tcoord = vsp.clone();
            tcoord.applyMatrix4(mgm[i]);
            vert[i] = tcoord.dot(vtp);
            tcoord = vdsp.clone();
            tcoord.applyMatrix4(mgm[i]);
            sdir[i] = tcoord.dot(vtp);
            tcoord = vsp.clone();
            tcoord.applyMatrix4(mgm[i]);
            tdir[i] = tcoord.dot(vdtp);
          }

          vsdir.fromArray(sdir);
          vtdir.fromArray(tdir);
          norm.crossVectors(vtdir, vsdir);
          norm.normalize();

          if (vert[0] === 0 && vert[1] === 0) {
            normOut.set(0, vert[2] > maxHeight2 ? 1 : -1, 0);
          } else {
            normOut.set(norm.x, norm.z, -norm.y);
          }

          vertices[vertCount++] = trueSize * vert[0];
          vertices[vertCount++] = trueSize * (vert[2] - maxHeight2);
          vertices[vertCount++] = -trueSize * vert[1];
          normals[normCount++] = normOut.x;
          normals[normCount++] = normOut.y;
          normals[normCount++] = normOut.z;
          uvs[uvCount++] = 1 - t;
          uvs[uvCount++] = 1 - s;
        }
      }

      for (sstep = 0; sstep < segments; sstep++) {
        for (tstep = 0; tstep < segments; tstep++) {
          v1 = surfCount * vertPerRow * vertPerRow + sstep * vertPerRow + tstep;
          v2 = v1 + 1;
          v3 = v2 + vertPerRow;
          v4 = v1 + vertPerRow;

          if (notDegenerate(v1, v2, v3)) {
            indices[indexCount++] = v1;
            indices[indexCount++] = v2;
            indices[indexCount++] = v3;
          }

          if (notDegenerate(v1, v3, v4)) {
            indices[indexCount++] = v1;
            indices[indexCount++] = v3;
            indices[indexCount++] = v4;
          }
        }
      }

      surfCount++;
    }
  }

  this.setIndex(new THREE.BufferAttribute(indices, 1));
  this.setAttribute('position', new BufferAttribute(vertices, 3));
  this.setAttribute('normal', new BufferAttribute(normals, 3));
  this.setAttribute('uv', new BufferAttribute(uvs, 2));
  this.computeBoundingSphere();
};

THREE.TeapotBufferGeometry = TeapotBufferGeometry;
TeapotBufferGeometry.prototype = Object.create(THREE.BufferGeometry.prototype);
TeapotBufferGeometry.prototype.constructor = TeapotBufferGeometry;