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

#ifndef WEBGL_LOADER_MESH_H_
#define WEBGL_LOADER_MESH_H_

#include <float.h>
#include <math.h>
#include <stdio.h>
#include <stdlib.h>

#include <map>
#include <string>
#include <utility>
#include <vector>

typedef unsigned short uint16;
typedef short int16;

typedef std::vector<float> AttribList;
typedef std::vector<int> IndexList;
typedef std::vector<uint16> QuantizedAttribList;

struct DrawMesh {
  // Interleaved vertex format:
  //  3-D Position
  //  3-D Normal
  //  2-D TexCoord
  // Note that these
  AttribList interleaved_attribs;
  // Indices are 0-indexed.
  IndexList triangle_indices;
};

void DumpJsonFromQuantizedAttribs(const QuantizedAttribList& attribs) {
  puts("var attribs = new Uint16Array([");
  for (size_t i = 0; i < attribs.size(); i += 8) {
    printf("%u,%hu,%hu,%hu,%hu,%hu,%hu,%hu,\n",
           attribs[i + 0], attribs[i + 1], attribs[i + 2], attribs[i + 3],
           attribs[i + 4], attribs[i + 5], attribs[i + 6], attribs[i + 7]);
  }
  puts("]);");
}

void DumpJsonFromInterleavedAttribs(const AttribList& attribs) {
  puts("var attribs = new Float32Array([");
  for (size_t i = 0; i < attribs.size(); i += 8) {
    printf("%f,%f,%f,%f,%f,%f,%f,%f,\n",
           attribs[i + 0], attribs[i + 1], attribs[i + 2], attribs[i + 3],
           attribs[i + 4], attribs[i + 5], attribs[i + 6], attribs[i + 7]);
  }
  puts("]);");
}

void DumpJsonFromIndices(const IndexList& indices) {
  puts("var indices = new Uint16Array([");
  for (size_t i = 0; i < indices.size(); i += 3) {
    printf("%d,%d,%d,\n", indices[i + 0], indices[i + 1], indices[i + 2]);
  }
  puts("]);");
}

// A short list of floats, useful for parsing a single vector
// attribute.
class ShortFloatList {
 public:
  static const size_t kMaxNumFloats = 4;
  ShortFloatList()
      : size_(0) { }

  // Parse up to kMaxNumFloats from C string.
  size_t ParseLine(const char* line) {
    for (size_ = 0; size_ != kMaxNumFloats; ++size_) {
      char* endptr = NULL;
      a_[size_] = strtof(line, &endptr);
      if (endptr == NULL || line == endptr) break;
      line = endptr;
    }
    return size_;
  }

  void AppendTo(AttribList* attribs) const {
    attribs->insert(attribs->end(), a_, a_ + size_);
  }

  bool empty() const { return size_ == 0; }

  size_t size() const { return size_; }
 private:
  float a_[kMaxNumFloats];
  size_t size_;
};

class IndexFlattener {
 public:
  explicit IndexFlattener(size_t num_positions)
      : count_(0),
        table_(num_positions) {
  }

  int count() const { return count_; }

  // Returns a pair of: < flattened index, newly inserted >.
  std::pair<int, bool> GetFlattenedIndex(int position_index,
                                         int texcoord_index,
                                         int normal_index) {
    // First, optimistically look up position_index in the table.
    IndexType& index = table_[position_index];
    if (index.position_or_flat == kIndexUnknown) {
      // This is the first time we've seen this position in the table,
      // so fill it. Since the table is indexed by position, we can
      // use the position_or_flat_index field to store the flat index.
      const int flat_index = count_++;
      index.position_or_flat = flat_index;
      index.texcoord = texcoord_index;
      index.normal = normal_index;
      return std::make_pair(flat_index, true);
    } else if (index.position_or_flat == kIndexNotInTable) {
      // There are multiple flattened indices at this position index,
      // so resort to the map.
      return GetFlattenedIndexFromMap(position_index,
                                      texcoord_index,
                                      normal_index);
    } else if (index.texcoord == texcoord_index &&
               index.normal == normal_index) {
      // The other indices match, so we can use the value cached in
      // the table.
      return std::make_pair(index.position_or_flat, false);
    }
    // The other indices don't match, so we mark this table entry,
    // and insert both the old and new indices into the map.
    const IndexType old_index(position_index, index.texcoord, index.normal);
    map_.insert(std::make_pair(old_index, index.position_or_flat));
    index.position_or_flat = kIndexNotInTable;
    const IndexType new_index(position_index, texcoord_index, normal_index);
    const int flat_index = count_++;
    map_.insert(std::make_pair(new_index, flat_index));
    return std::make_pair(flat_index, true);
  }
 private:
  std::pair<int, bool> GetFlattenedIndexFromMap(int position_index,
                                                int texcoord_index,
                                                int normal_index) {
    IndexType index(position_index, texcoord_index, normal_index);
    MapType::iterator iter = map_.lower_bound(index);
    if (iter == map_.end() || iter->first != index) {
      const int flat_index = count_++;
      map_.insert(iter, std::make_pair(index, flat_index));
      return std::make_pair(flat_index, true);
    } else {
      return std::make_pair(iter->second, false);
    }
  }

  static const int kIndexUnknown = -1;
  static const int kIndexNotInTable = -2;

  struct IndexType {
    IndexType()
        : position_or_flat(kIndexUnknown),
          texcoord(kIndexUnknown),
          normal(kIndexUnknown)
    { }

    IndexType(int position_index, int texcoord_index, int normal_index)
        : position_or_flat(position_index),
          texcoord(texcoord_index),
          normal(normal_index)
    { }

    // I'm being tricky/lazy here. The table_ stores the flattened
    // index in the first field, since it is indexed by position. The
    // map_ stores position and uses this struct as a key to lookup the
    // flattened index.
    int position_or_flat;
    int texcoord;
    int normal;

    // An ordering for std::map.
    bool operator<(const IndexType& that) const {
      if (position_or_flat == that.position_or_flat) {
        if (texcoord == that.texcoord) {
          return normal < that.normal;
        } else {
          return texcoord < that.texcoord;
        }
      } else {
        return position_or_flat < that.position_or_flat;
      }
    }

    bool operator==(const IndexType& that) const {
      return position_or_flat == that.position_or_flat &&
          texcoord == that.texcoord && normal == that.normal;
    }

    bool operator!=(const IndexType& that) const {
      return !operator==(that);
    }
  };
  typedef std::map<IndexType, int> MapType;

  int count_;
  std::vector<IndexType> table_;
  MapType map_;
};

// TODO: consider splitting this into a low-level parser and a high-level
// object.
class WavefrontObjFile {
 public:
  struct Group {
    std::string name;
    size_t start, end;
  };

  typedef std::vector<Group> GroupList;

  explicit WavefrontObjFile(FILE* fp) {
    ParseFile(fp);
  };

  const GroupList& groups() const { return groups_; }

  // Populate draw_meshes.
  void CreateDrawMeshes(std::vector<DrawMesh>* draw_meshes) {
    draw_meshes->push_back(DrawMesh());
    DrawMesh& draw_mesh = draw_meshes->back();
    IndexFlattener flattener(positions_.size() / positionDim());
    for (size_t i = 0; i < faces_.size(); i += 3) {
      // .OBJ files use 1-based indexing.
      const int position_index = faces_[i + 0] - 1;
      const int texcoord_index = faces_[i + 1] - 1;
      const int normal_index = faces_[i + 2] - 1;
      const std::pair<int, bool> flattened = flattener.GetFlattenedIndex(
          position_index, texcoord_index, normal_index);
      draw_mesh.triangle_indices.push_back(flattened.first);
      if (flattened.second) {
        for (size_t i = 0; i < positionDim(); ++i) {
          draw_mesh.interleaved_attribs.push_back(
              positions_[positionDim() * position_index + i]);
        }
        for (size_t i = 0; i < texcoordDim(); ++i) {
          draw_mesh.interleaved_attribs.push_back(
              texcoords_[texcoordDim() * texcoord_index + i]);
        }
        for (size_t i = 0; i < normalDim(); ++i) {
          draw_mesh.interleaved_attribs.push_back(
              normals_[normalDim() * normal_index + i]);
        }
      }
    }
  }

  /*
  // %z formatting chokes MinGW compiler on Windows :/
  // using instead unsigned long

  void DumpDebug() const {
    printf("positions size: %zu\ntexcoords size: %zu\nnormals size: %zu"
           "\nfaces size: %zu\n", positions_.size(), texcoords_.size(),
           normals_.size(), faces_.size());
  }
  */

  void DumpDebug() const {
    printf("positions size: %lu\ntexcoords size: %lu\nnormals size: %lu"
           "\nfaces size: %lu\n", (unsigned long)positions_.size(), (unsigned long)texcoords_.size(),
           (unsigned long)normals_.size(), (unsigned long)faces_.size());
  }

 private:
  void ParseFile(FILE* fp) {
    // TODO: don't use a fixed-size buffer.
    const size_t kLineBufferSize = 256;
    char buffer[kLineBufferSize];
    unsigned int line_num = 1;
    while (fgets(buffer, kLineBufferSize, fp) != NULL) {
      const char* stripped = buffer;
      while (isspace(*stripped)) {
        ++stripped;
      }
      ParseLine(stripped, line_num++);
    }
  }

  void ParseLine(const char* line, unsigned int line_num) {
    switch (*line) {
      case 'v':
        ParseAttrib(line + 1, line_num);
        break;
      case 'f':
        ParseFace(line + 1, line_num);
        break;
      case 'g':
        ParseGroup(line + 1, line_num);
        break;
      case '\0':
      case '#':
        break;  // Do nothing for comments or blank lines.
      case 'p':
        WarnLine("point unsupported", line_num);
        break;
      case 'l':
        WarnLine("line unsupported", line_num);
        break;
      case 'u':
        WarnLine("usemtl (?) unsupported", line_num);
        break;
      case 'm':
        WarnLine("mtllib (?) unsupported", line_num);
        break;
      case 's':
        WarnLine("s unsupported", line_num);
        break;
      default:
        WarnLine("unknown keyword", line_num);
        break;
    }
  }

  void ParseAttrib(const char* line, unsigned int line_num) {
    ShortFloatList floats;
    floats.ParseLine(line + 1);
    if (isspace(*line)) {
      ParsePosition(floats, line_num);
    } else if (*line == 't') {
      ParseTexCoord(floats, line_num);
    } else if (*line == 'n') {
      ParseNormal(floats, line_num);
    } else {
      WarnLine("unknown attribute format", line_num);
    }
  }

  void ParsePosition(const ShortFloatList& floats, unsigned int line_num) {
    if (floats.size() != positionDim()) {
      ErrorLine("bad position", line_num);
    }
    floats.AppendTo(&positions_);
  }

  void ParseTexCoord(const ShortFloatList& floats, unsigned int line_num) {
    if (floats.size() != texcoordDim()) {
      ErrorLine("bad texcoord", line_num);
    }
    floats.AppendTo(&texcoords_);
  }

  void ParseNormal(const ShortFloatList& floats, unsigned int line_num) {
    if (floats.size() != normalDim()) {
      ErrorLine("bad normal", line_num);
    }
    floats.AppendTo(&normals_);
  }

  // Parses faces and converts to triangle fans. This is not a
  // particularly good tesselation in general case, but it is really
  // simple, and is perfectly fine for triangles and quads.
  void ParseFace(const char* line, unsigned int line_num) {
    // Also handle face outlines as faces.
    if (*line == 'o') ++line;

    // TODO: instead of storing these indices as-is, it might make
    // sense to flatten them right away. This can reduce memory
    // consumption and improve access locality, especially since .OBJ
    // face indices are so needlessly large.
    int indices[9] = { 0 };
    // The first index acts as the pivot for the triangle fan.
    line = ParseIndices(line, line_num, indices + 0, indices + 1, indices + 2);
    if (line == NULL) {
      ErrorLine("bad first index", line_num);
    }
    line = ParseIndices(line, line_num, indices + 3, indices + 4, indices + 5);
    if (line == NULL) {
      ErrorLine("bad second index", line_num);
    }
    // After the first two indices, each index introduces a new
    // triangle to the fan.
    while ((line = ParseIndices(line, line_num,
                                indices + 6, indices + 7, indices + 8))) {
      faces_.insert(faces_.end(), indices, indices + 9);
      // The most recent vertex is reused for the next triangle.
      indices[3] = indices[6];
      indices[4] = indices[7];
      indices[5] = indices[8];
      indices[6] = indices[7] = indices[8] = 0;
    }
  }

  // Parse a single group of indices, separated by slashes ('/').
  // TODO: convert negative indices (that is, relative to the end of
  // the current vertex positions) to more conventional positive
  // indices.
  const char* ParseIndices(const char* line, unsigned int line_num,
                           int* position_index, int* texcoord_index,
                           int* normal_index) {
    int bytes_consumed = 0;
    int indices_parsed = sscanf(line, "%d/%d/%d%n",
                                position_index, texcoord_index, normal_index,
                                &bytes_consumed);
    if (indices_parsed != 3) {
      return NULL;
    }

    if (*position_index <= 0 || *texcoord_index <= 0 || *normal_index <= 0 ) {
      ErrorLine("bad index format", line_num);
    }

    return line + bytes_consumed;
  }

  void ParseGroup(const char* line, unsigned int line_num) {
    WarnLine("group unsupported", line_num);
  }

  void WarnLine(const char* why, unsigned int line_num) {
    fprintf(stderr, "WARNING: %s at line %u\n", why, line_num);
  }

  void ErrorLine(const char* why, unsigned int line_num) {
    fprintf(stderr, "ERROR: %s at line %u\n", why, line_num);
    exit(-1);
  }

  static size_t positionDim() { return 3; }
  static size_t texcoordDim() { return 2; }
  static size_t normalDim() { return 3; }

  AttribList positions_;
  AttribList texcoords_;
  AttribList normals_;
  // Indices are 1-indexed, and per-attrib.
  IndexList faces_;
  GroupList groups_;
};

// Axis-aligned bounding box
struct AABB {
  float mins[3];
  float maxes[3];
};

void DumpJsonFromAABB(const AABB& aabb) {
  printf("var aabb = { mins: [%f, %f, %f], maxes: [%f, %f, %f] };\n",
         aabb.mins[0], aabb.mins[1], aabb.mins[2],
         aabb.maxes[0], aabb.maxes[1], aabb.maxes[2]);
}

float UniformScaleFromAABB(const AABB& aabb) {
  const float x = aabb.maxes[0] - aabb.mins[0];
  const float y = aabb.maxes[1] - aabb.mins[1];
  const float z = aabb.maxes[2] - aabb.mins[2];
  return (x > y)
      ? ((x > z) ? x : z)
      : ((y > z) ? y : z);
}

void AABBToCenter(const AABB& aabb, float center[3]) {
  for (size_t i = 0; i < 3; ++i) {
    center[i] = 0.5*(aabb.mins[i] + aabb.maxes[i]);
  }
}

AABB AABBFromAttribs(const AttribList& interleaved_attribs) {
  AABB aabb;
  for (size_t i = 0; i < 3; ++i) {
    aabb.mins[i] = FLT_MAX;
    aabb.maxes[i] = -FLT_MAX;
  }
  for (size_t i = 0; i < interleaved_attribs.size(); i += 8) {
    for (size_t j = 0; j < 3; ++j) {
      const float attrib = interleaved_attribs[i + j];
      if (aabb.mins[j] > attrib) {
        aabb.mins[j] = attrib;
      }
      if (aabb.maxes[j] < attrib) {
        aabb.maxes[j] = attrib;
      }
    }
  }
  return aabb;
}

uint16 Quantize(float f, float offset, float range, int bits) {
  const float f_offset = f + offset;
  // Losslessly multiply a float by 1 << bits;
  const float f_scaled = ldexpf(f_offset, bits);
  // static_cast rounds towards zero (i.e. truncates).
  return static_cast<uint16>(f_scaled / range - 0.5f);
}

void AttribsToQuantizedAttribs(const AttribList& interleaved_attribs,
                               QuantizedAttribList* quantized_attribs) {
  const AABB aabb = AABBFromAttribs(interleaved_attribs);
  const float scale = UniformScaleFromAABB(aabb);
  quantized_attribs->resize(interleaved_attribs.size());
  const float offsets[8] = { -aabb.mins[0], -aabb.mins[1], -aabb.mins[2],
                             0.0f, 0.0f, 1.f, 1.f, 1.f };
  const float scales[8] = { scale, scale, scale, 1.f, 1.f, 2.f, 2.f, 2.f };
  const int bits[8] = { 14, 14, 14, 10, 10, 10, 10, 10 };
  for (size_t i = 0; i < interleaved_attribs.size(); i += 8) {
    for (size_t j = 0; j < 8; ++j) {
      quantized_attribs->at(i + j) = Quantize(interleaved_attribs[i + j],
                                              offsets[j], scales[j], bits[j]);
    }
  }

  // dump for reconstruction of real dimensions in JavaScript
  // (probably should be embedded as a part of the UTF8 file)
  fprintf(stderr, "scale: %f, offsetX: %f, offsetY: %f, offsetZ: %f\n", scale, aabb.mins[0], aabb.mins[1], aabb.mins[2] );
}

// Based on:
// http://home.comcast.net/~tom_forsyth/papers/fast_vert_cache_opt.html
class VertexOptimizer {
 public:
  // TODO: this could easily work with non-quantized attribute lists.
  VertexOptimizer(const QuantizedAttribList& attribs, const IndexList& indices)
      : attribs_(attribs),
        indices_(indices),
        per_vertex_data_(attribs_.size() / 8) {
    // The cache has an extra slot allocated to simplify the logic in
    // InsertIndexToCache.
    for (unsigned int i = 0; i <= kCacheSize; ++i) {
      cache_[i] = kUnknownIndex;
    }

    // Loop through the indices, incrementing active triangle counts.
    for (size_t i = 0; i < indices_.size(); ++i) {
      per_vertex_data_[indices_[i]].active_tris++;
    }

    // Compute initial vertex scores.
    for (size_t i = 0; i < per_vertex_data_.size(); ++i) {
      per_vertex_data_[i].UpdateScore();
    }
  }

  void GetOptimizedMesh(QuantizedAttribList* attribs, IndexList* indices) {
    attribs->resize(attribs_.size());
    indices->resize(indices_.size());

    uint16* attribs_out = &attribs->at(0);
    int* indices_out = &indices->at(0);
    int next_unused_index = 0;
    // Consume indices_, one triangle at a time. When a triangle is consumed from
    // the middle of indices_, the last one is copied in to replace it so that we
    // can shrink indices_ from the end.
    while (!indices_.empty()) {
      const size_t best_triangle = FindBestTriangle();
      const size_t last_triangle = indices_.size() - 3;
      // Go through the indices of the best triangle.
      for (size_t i = 0; i < 3; ++i) {
        const int index = indices_[best_triangle + i];
        // After consuming this vertex, copy the corresponding index
        // from the last triangle into this slot.
        indices_[best_triangle + i] = indices_[last_triangle + i];
        per_vertex_data_[index].active_tris--;
        InsertIndexToCache(index);
        const int cached_output_index = per_vertex_data_[index].output_index;
        // Have we seen this index before?
        if (cached_output_index != kUnknownIndex) {
          *indices_out++ = cached_output_index;
          continue;
        }
        // The first time we see an index, not only do we increment
        // next_index counter, but we must also copy the corresponding
        // attributes.
        per_vertex_data_[index].output_index = next_unused_index;
        for (size_t j = 0; j < 8; ++j) {
          *attribs_out++ = attribs_[8*index + j];
        }
        *indices_out++ = next_unused_index++;
      }
      // Remove the last triangle.
      indices_.resize(last_triangle);
    }
  }
 private:
  static const int kUnknownIndex = -1;
  static const uint16 kCacheSize = 32;

  struct VertexData {
    VertexData()
        : active_tris(0),
          cache_tag(kCacheSize),
          output_index(kUnknownIndex),
          score(-1.f)
    { }

    void UpdateScore() {
      if (active_tris <= 0) {
        score = -1.f;
        return;
      }
      // TODO: build initial score table.
      if (cache_tag < 3) {
        // The most recent triangle should has a fixed score to
        // discourage generating nothing but really long strips. If we
        // want strips, we should use a different optimizer.
        const float kLastTriScore = 0.75f;
        score = kLastTriScore;
      } else if (cache_tag < kCacheSize) {
        // Points for being recently used.
        const float kScale = 1.f / (kCacheSize - 3);
        const float kCacheDecayPower = 1.5f;
        score = powf(1.f - kScale * (cache_tag - 3), kCacheDecayPower);
      } else {
        // Not in cache.
        score = 0.f;
      }

      // Bonus points for having a low number of tris still to use the
      // vert, so we get rid of lone verts quickly.
      const float kValenceBoostScale = 2.0f;
      const float kValenceBoostPower = 0.5f;
      const float valence_boost = powf(active_tris, -kValenceBoostPower);  // rsqrt?
      score += valence_boost * kValenceBoostScale;
    };

    int active_tris;
    unsigned int cache_tag;  // == kCacheSize means not in cache.
    int output_index;  // For output remapping.
    float score;
  };

  // This also updates the vertex scores!
  void InsertIndexToCache(int index) {
    // Find how recently the vertex was used.
    const unsigned int cache_tag = per_vertex_data_[index].cache_tag;

    // Don't do anything if the vertex is already at the head of the
    // LRU list.
    if (cache_tag == 0) return;

    // Loop through the cache, inserting the index at the front, and
    // bubbling down to where the index was originally found. If the
    // index was not originally in the cache, then it claims to be at
    // the (kCacheSize + 1)th entry, and we use an extra slot to make
    // that case simpler.
    int to_insert = index;
    for (unsigned int i = 0; i <= cache_tag; ++i) {
      const int current_index = cache_[i];

      // Update cross references between the entry of the cache and
      // the per-vertex data.
      cache_[i] = to_insert;
      per_vertex_data_[to_insert].cache_tag = i;
      per_vertex_data_[to_insert].UpdateScore();

      // No need to continue if we find an empty entry.
      if (current_index == kUnknownIndex) {
        break;
      }

      to_insert = current_index;
    }
  }

  size_t FindBestTriangle() {
    float best_score = -FLT_MAX;
    size_t best_triangle = 0;
    // TODO: without a boundary structure, this performs a linear
    // scan, which makes Tom Forsyth's linear algorithm run in
    // quadratic time!
    for (size_t i = 0; i < indices_.size(); i += 3) {
      const float score =
          per_vertex_data_[indices_[i + 0]].score +
          per_vertex_data_[indices_[i + 1]].score +
          per_vertex_data_[indices_[i + 2]].score;
      if (score > best_score) {
        best_score = score;
        best_triangle = i;
      }
    }
    return best_triangle;
  }

  const QuantizedAttribList& attribs_;
  IndexList indices_;
  std::vector<VertexData> per_vertex_data_;
  int cache_[kCacheSize + 1];
};

uint16 ZigZag(int16 word) {
  return (word >> 15) ^ (word << 1);
}

#define CHECK(PRED) if (!(PRED)) {                              \
    fprintf(stderr, "%d: CHECK failed: " #PRED "\n", __LINE__); \
    exit(-1); } else

bool Uint16ToUtf8(uint16 word, std::vector<char>* utf8) {
  const char kMoreBytesPrefix = static_cast<char>(0x80);
  const uint16 kMoreBytesMask = 0x3F;
  if (word < 0x80) {
    utf8->push_back(static_cast<char>(word));
  } else if (word < 0x800) {
    const char kTwoBytePrefix = static_cast<char>(0xC0);
    utf8->push_back(kTwoBytePrefix + static_cast<char>(word >> 6));
    utf8->push_back(kMoreBytesPrefix +
                    static_cast<char>(word & kMoreBytesMask));
  } else if (word < 0xF800) {
    const char kThreeBytePrefix = static_cast<char>(0xE0);
    // We can only encode 65535 - 2048 values because of illegal UTF-8
    // characters, such as surrogate pairs in [0xD800, 0xDFFF].
    //TODO: what about other characters, like reversed-BOM 0xFFFE?
    if (word >= 0xD800) {
      // Shift the result to avoid the surrogate pair range.
      word += 0x0800;
    }
    utf8->push_back(kThreeBytePrefix + static_cast<char>(word >> 12));
    utf8->push_back(kMoreBytesPrefix +
                    static_cast<char>((word >> 6) & kMoreBytesMask));
    utf8->push_back(kMoreBytesPrefix +
                    static_cast<char>(word & kMoreBytesMask));
  } else {
    return false;
  }
  return true;
}

void CompressIndicesToUtf8(const IndexList& list, std::vector<char>* utf8) {
  // For indices, we don't do delta from the most recent index, but
  // from the high water mark. The assumption is that the high water
  // mark only ever moves by one at a time. Foruntately, the vertex
  // optimizer does that for us, to optimize for per-transform vertex
  // fetch order.
  uint16 index_high_water_mark = 0;
  for (size_t i = 0; i < list.size(); ++i) {
    const int index = list[i];
    CHECK(index >= 0);
    CHECK(index <= index_high_water_mark);
    CHECK(Uint16ToUtf8(index_high_water_mark - index, utf8));
    if (index == index_high_water_mark) {
      ++index_high_water_mark;
    }
  }
}

void CompressQuantizedAttribsToUtf8(const QuantizedAttribList& attribs,
                                    std::vector<char>* utf8) {
  for (size_t i = 0; i < 8; ++i) {
    // Use a transposed representation, and delta compression.
    uint16 prev = 0;
    for (size_t j = i; j < attribs.size(); j += 8) {
      const uint16 word = attribs[j];
      const uint16 za = ZigZag(static_cast<int16>(word - prev));
      prev = word;
      CHECK(Uint16ToUtf8(za, utf8));
    }
  }
}

void CompressMeshToFile(const QuantizedAttribList& attribs,
                        const IndexList& indices,
                        const char* fn) {
  CHECK((attribs.size() & 7) == 0);
  const size_t num_verts = attribs.size() / 8;

  fprintf(stderr, "num_verts: %lu", (unsigned long)num_verts);

  CHECK(num_verts > 0);
  CHECK(num_verts < 65536);
  std::vector<char> utf8;
  CHECK(Uint16ToUtf8(static_cast<uint16>(num_verts - 1), &utf8));
  CompressQuantizedAttribsToUtf8(attribs, &utf8);
  CompressIndicesToUtf8(indices, &utf8);

  FILE* fp = fopen(fn, "wb");
  fwrite(&utf8[0], 1, utf8.size(), fp);
  fclose(fp);
}

#endif  // WEBGL_LOADER_MESH_H_
