#if 0  // A cute trick to making this .cc self-building from shell.
g++ $0 -O2 -Wall -Werror -o `basename $0 .cc`;
exit;
#endif
// Copyright 2011 Google Inc. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License"); you
// may not use this file except in compliance with the License. You
// may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
// implied. See the License for the specific language governing
// permissions and limitations under the License.

#include "mesh.h"

const bool kQuantize = true;
const bool kOptimize = true;

int main(int argc, char* argv[]) {
  if (argc < 2 || argc > 3) {
    fprintf(stderr, "Usage: %s in.obj [out.utf8]\n\n"
            "\tIf 'out' is specified, then attempt to write out a compressed,\n"
            "\tUTF-8 version to 'out.'\n\n"
            "\tIf not, write a JSON version to STDOUT.\n\n",
            argv[0]);
    return -1;
  }
  FILE* fp = fopen(argv[1], "r");
  WavefrontObjFile obj(fp);
  fclose(fp);
  std::vector<DrawMesh> meshes;
  obj.CreateDrawMeshes(&meshes);
  if (kQuantize) {
    QuantizedAttribList attribs;
    AttribsToQuantizedAttribs(meshes[0].interleaved_attribs, &attribs);
    if (kOptimize) {
      QuantizedAttribList optimized_attribs;
      IndexList optimized_indices;
      VertexOptimizer vertex_optimizer(attribs, meshes[0].triangle_indices);
      vertex_optimizer.GetOptimizedMesh(&optimized_attribs, &optimized_indices);
      if (argc == 3) {
        CompressMeshToFile(optimized_attribs, optimized_indices, argv[2]);
      } else {
        DumpJsonFromQuantizedAttribs(optimized_attribs);
        DumpJsonFromIndices(optimized_indices);
      }
      return 0;
    } else {
      DumpJsonFromQuantizedAttribs(attribs);
    }
  } else {
    DumpJsonFromInterleavedAttribs(meshes[0].interleaved_attribs);
  }
  DumpJsonFromIndices(meshes[0].triangle_indices);
  return 0;
}
