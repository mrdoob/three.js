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

#include "bounds.h"
#include "compress.h"
#include "mesh.h"
#include "optimize.h"
#include "stream.h"

int main(int argc, const char* argv[]) {
  if (argc != 3) {
    fprintf(stderr, "Usage: %s in.obj out.utf8\n\n"
            "\tCompress in.obj to out.utf8 and writes JS to STDOUT.\n\n",
            argv[0]);
    return -1;
  }
  FILE* fp = fopen(argv[1], "r");
  WavefrontObjFile obj(fp);
  fclose(fp);

  printf("MODELS[\'%s\'] = {\n", StripLeadingDir(argv[1]));
  puts("  materials: {");
  const MaterialList& materials = obj.materials();
  for (size_t i = 0; i < materials.size(); ++i) {
    materials[i].DumpJson();
  }
  puts("  },");
  
  const MaterialBatches& batches = obj.material_batches();

  // Pass 1: compute bounds.
  webgl_loader::Bounds bounds;
  bounds.Clear();
  for (MaterialBatches::const_iterator iter = batches.begin();
       iter != batches.end(); ++iter) {
    const DrawBatch& draw_batch = iter->second;
    bounds.Enclose(draw_batch.draw_mesh().attribs);
  }
  webgl_loader::BoundsParams bounds_params = 
    webgl_loader::BoundsParams::FromBounds(bounds);
  printf("  decodeParams: ");
  bounds_params.DumpJson();

  puts("  urls: {");
  std::vector<char> utf8;
  webgl_loader::VectorSink sink(&utf8);
  // Pass 2: quantize, optimize, compress, report.
  for (MaterialBatches::const_iterator iter = batches.begin();
       iter != batches.end(); ++iter) {
    size_t offset = 0;
    utf8.clear();
    const DrawMesh& draw_mesh = iter->second.draw_mesh();
    if (draw_mesh.indices.empty()) continue;
    
    QuantizedAttribList quantized_attribs;
    webgl_loader::AttribsToQuantizedAttribs(draw_mesh.attribs, bounds_params,
					    &quantized_attribs);
    VertexOptimizer vertex_optimizer(quantized_attribs);
    const std::vector<GroupStart>& group_starts = iter->second.group_starts();
    WebGLMeshList webgl_meshes;
    std::vector<size_t> group_lengths;
    for (size_t i = 1; i < group_starts.size(); ++i) {
      const size_t here = group_starts[i-1].offset;
      const size_t length = group_starts[i].offset - here;
      group_lengths.push_back(length);
      vertex_optimizer.AddTriangles(&draw_mesh.indices[here], length,
                                    &webgl_meshes);
    }
    const size_t here = group_starts.back().offset;
    const size_t length = draw_mesh.indices.size() - here;
    const bool divisible_by_3 = length % 3 == 0;
    CHECK(divisible_by_3);
    group_lengths.push_back(length);
    vertex_optimizer.AddTriangles(&draw_mesh.indices[here], length,
                                  &webgl_meshes);

    std::vector<std::string> material;
    std::vector<size_t> attrib_start, attrib_length, index_start, index_length;
    for (size_t i = 0; i < webgl_meshes.size(); ++i) {
      const size_t num_attribs = webgl_meshes[i].attribs.size();
      const size_t num_indices = webgl_meshes[i].indices.size();
      const bool kBadSizes = num_attribs % 8 || num_indices % 3;
      CHECK(!kBadSizes);
      webgl_loader::CompressQuantizedAttribsToUtf8(webgl_meshes[i].attribs, 
						   &sink);
      webgl_loader::CompressIndicesToUtf8(webgl_meshes[i].indices, &sink);
      material.push_back(iter->first);
      attrib_start.push_back(offset);
      attrib_length.push_back(num_attribs / 8);
      index_start.push_back(offset + num_attribs);
      index_length.push_back(num_indices / 3);
      offset += num_attribs + num_indices;
    }
    const uint32 hash = SimpleHash(&utf8[0], utf8.size());
    char buf[9] = { '\0' };
    ToHex(hash, buf);
    // TODO: this needs to handle paths.
    std::string out_fn = std::string(buf) + "." + argv[2];
    FILE* out_fp = fopen(out_fn.c_str(), "wb");
    printf("    \'%s\': [\n", out_fn.c_str());
    size_t group_index = 0;
    for (size_t i = 0; i < webgl_meshes.size(); ++i) {
      printf("      { material: \'%s\',\n"
             "        attribRange: [" PRIuS ", " PRIuS "],\n"
             "        indexRange: [" PRIuS ", " PRIuS "],\n"
             "        bboxes: " PRIuS ",\n"
             "        names: [",
             material[i].c_str(),
             attrib_start[i], attrib_length[i],
             index_start[i], index_length[i],
             offset);
      std::vector<size_t> buffered_lengths;
      size_t group_start = 0;
      while (group_index < group_lengths.size()) {
        printf("\'%s\', ",
               obj.LineToGroup(group_starts[group_index].group_line).c_str());
        const size_t group_length = group_lengths[group_index];
        const size_t next_start = group_start + group_length;
        const size_t webgl_index_length = webgl_meshes[i].indices.size();
        // TODO: bbox info is better placed at the head of the file,
        // perhaps transposed. Also, when a group gets split between
        // batches, the bbox gets stored twice.
	webgl_loader::CompressAABBToUtf8(group_starts[group_index].bounds,
					 bounds_params, &sink);
        offset += 6;
        if (next_start < webgl_index_length) {
          buffered_lengths.push_back(group_length);
          group_start = next_start;
          ++group_index;
        } else {
          const size_t fits = webgl_index_length - group_start;
          buffered_lengths.push_back(fits);
          group_start = 0;
          group_lengths[group_index] -= fits;
          break;
        }
      }
      printf("],\n        lengths: [");
      for (size_t k = 0; k < buffered_lengths.size(); ++k) {
        printf(PRIuS ", ", buffered_lengths[k]);
      }
      puts("],\n      },");
    }
    fwrite(&utf8[0], 1, utf8.size(), out_fp);
    fclose(out_fp);
    puts("    ],");
  }
  puts("  }\n};");
  return 0;
}
