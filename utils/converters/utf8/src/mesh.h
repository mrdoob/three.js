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
#include <limits.h>
#include <math.h>
#include <stdio.h>
#include <stdlib.h>

#include <map>
#include <string>
#include <utility>
#include <vector>

#include "base.h"
#include "bounds.h"
#include "stream.h"
#include "utf8.h"

// A short list of floats, useful for parsing a single vector
// attribute.
class ShortFloatList {
 public:
  // MeshLab can create position attributes with
  // color coordinates like: v x y z r g b
  static const size_t kMaxNumFloats = 6;
  ShortFloatList()
      : size_(0)
  {
    clear();
  }

  void clear() {
    for (size_t i = 0; i < kMaxNumFloats; ++i) {
      a_[i] = 0.f;
    }
  }

  // Parse up to kMaxNumFloats from C string.
  // TODO: this should instead return endptr, since size
  // is recoverable.
  size_t ParseLine(const char* line) {
    for (size_ = 0; size_ != kMaxNumFloats; ++size_) {
      char* endptr = NULL;
      a_[size_] = strtof(line, &endptr);
      if (endptr == NULL || line == endptr) break;
      line = endptr;
    }
    return size_;
  }

  float operator[](size_t idx) const {
    return a_[idx];
  }

  void AppendTo(AttribList* attribs) const {
    AppendNTo(attribs, size_);
  }

  void AppendNTo(AttribList* attribs, const size_t sz) const {
    attribs->insert(attribs->end(), a_, a_ + sz);
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

  void reserve(size_t size) {
    table_.reserve(size);
  }

  // Returns a pair of: < flattened index, newly inserted >.
  std::pair<int, bool> GetFlattenedIndex(int position_index,
                                         int texcoord_index,
                                         int normal_index) {
    if (position_index >= static_cast<int>(table_.size())) {
      table_.resize(position_index + 1);
    }
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

static inline size_t positionDim() { return 3; }
static inline size_t texcoordDim() { return 2; }
static inline size_t normalDim() { return 3; }

// TODO(wonchun): Make a c'tor to properly initialize.
struct GroupStart {
  size_t offset;  // offset into draw_mesh_.indices.
  unsigned int group_line;
  int min_index, max_index;  // range into attribs.
  webgl_loader::Bounds bounds;
};

class DrawBatch {
 public:
  DrawBatch()
      : flattener_(0),
        current_group_line_(0xFFFFFFFF) {
  }

  const std::vector<GroupStart>& group_starts() const {
    return group_starts_;
  }

  void Init(AttribList* positions, AttribList* texcoords, AttribList* normals) {
    positions_ = positions;
    texcoords_ = texcoords;
    normals_ = normals;
    flattener_.reserve(1024);
  }

  void AddTriangle(unsigned int group_line, int* indices) {
    if (group_line != current_group_line_) {
      current_group_line_ = group_line;
      GroupStart group_start;
      group_start.offset = draw_mesh_.indices.size();
      group_start.group_line = group_line;
      group_start.min_index = INT_MAX;
      group_start.max_index = INT_MIN;
      group_start.bounds.Clear();
      group_starts_.push_back(group_start);
    }
    GroupStart& group = group_starts_.back();
    for (size_t i = 0; i < 9; i += 3) {
      // .OBJ files use 1-based indexing.
      const int position_index = indices[i + 0] - 1;
      const int texcoord_index = indices[i + 1] - 1;
      const int normal_index = indices[i + 2] - 1;
      const std::pair<int, bool> flattened = flattener_.GetFlattenedIndex(
          position_index, texcoord_index, normal_index);
      const int flat_index = flattened.first;
      CHECK(flat_index >= 0);
      draw_mesh_.indices.push_back(flat_index);
      if (flattened.second) {
        // This is a new index. Keep track of index ranges and vertex
        // bounds.
        if (flat_index > group.max_index) {
          group.max_index = flat_index;
        }
        if (flat_index < group.min_index) {
          group.min_index = flat_index;
        }
        const size_t new_loc = draw_mesh_.attribs.size();
        CHECK(8*size_t(flat_index) == new_loc);
        for (size_t i = 0; i < positionDim(); ++i) {
          draw_mesh_.attribs.push_back(
              positions_->at(positionDim() * position_index + i));
        }
        if (texcoord_index == -1) {
          for (size_t i = 0; i < texcoordDim(); ++i) {
            draw_mesh_.attribs.push_back(0);
          }
        } else {
          for (size_t i = 0; i < texcoordDim(); ++i) {
            draw_mesh_.attribs.push_back(
                texcoords_->at(texcoordDim() * texcoord_index + i));
          }
        }
        if (normal_index == -1) {
          for (size_t i = 0; i < normalDim(); ++i) {
            draw_mesh_.attribs.push_back(0);
          }
        } else {
          for (size_t i = 0; i < normalDim(); ++i) {
            draw_mesh_.attribs.push_back(
                normals_->at(normalDim() * normal_index + i));
          }
        }
        // TODO: is the covariance body useful for anything?
        group.bounds.EncloseAttrib(&draw_mesh_.attribs[new_loc]);
      }
    }
  }

  const DrawMesh& draw_mesh() const {
    return draw_mesh_;
  }
 private:
  AttribList* positions_, *texcoords_, *normals_;
  DrawMesh draw_mesh_;
  IndexFlattener flattener_;
  unsigned int current_group_line_;
  std::vector<GroupStart> group_starts_;
};

struct Material {
  std::string name;
  float Kd[3];
  std::string map_Kd;
  std::string d;
  

  void DumpJson(FILE* out = stdout) const {
    fprintf(out, "    \"%s\": { ", name.c_str());
    if (!d.empty()) {
      fprintf(out, "\"d\": %s ,", d.c_str());
    }    
    if (map_Kd.empty()) {
      fprintf(out, "\"Kd\": [%hu, %hu, %hu] }",
              Quantize(Kd[0], 0, 1, 255),
              Quantize(Kd[1], 0, 1, 255),
              Quantize(Kd[2], 0, 1, 255));
    } else {
      fprintf(out, "\"map_Kd\": \"%s\" }", map_Kd.c_str());
    }
  }
};

typedef std::vector<Material> MaterialList;

class WavefrontMtlFile {
 public:
  explicit WavefrontMtlFile(FILE* fp) {
    ParseFile(fp);
  }

  const MaterialList& materials() const {
    return materials_;
  }

 private:
  // TODO: factor this parsing stuff out.
  void ParseFile(FILE* fp) {
    // TODO: don't use a fixed-size buffer.
    const size_t kLineBufferSize = 256;
    char buffer[kLineBufferSize];
    unsigned int line_num = 1;
    while (fgets(buffer, kLineBufferSize, fp) != NULL) {
      char* stripped = StripLeadingWhitespace(buffer);
      TerminateAtNewlineOrComment(stripped);
      ParseLine(stripped, line_num++);
    }
  }

  void ParseLine(const char* line, unsigned int line_num) {
    switch (*line) {
      case 'K':
        ParseColor(line + 1, line_num);
        break;
      case 'd':
        ParseD(line + 1, line_num);
        break;
      case 'm':
        if (0 == strncmp(line + 1, "ap_Kd", 5)) {
          ParseMapKd(line + 6, line_num);
        }
        break;
      case 'n':
        if (0 == strncmp(line + 1, "ewmtl", 5)) {
          ParseNewmtl(line + 6, line_num);
        }
      default:
        break;
    }
  }

  void ParseColor(const char* line, unsigned int line_num) {
    switch (*line) {
      case 'd': {
        ShortFloatList floats;
        floats.ParseLine(line + 1);
        float* Kd = current_->Kd;
        Kd[0] = floats[0];
        Kd[1] = floats[1];
        Kd[2] = floats[2];
        break;
      }
      default:
        break;
    }
  }
  void ParseD(const char* line, unsigned int line_num) {
      current_->d = StripLeadingWhitespace(line);
  }

  void ParseMapKd(const char* line, unsigned int line_num) {
    current_->map_Kd = StripLeadingWhitespace(line);
  }

  void ParseNewmtl(const char* line, unsigned int line_num) {
    materials_.push_back(Material());
    current_ = &materials_.back();
    ToLower(StripLeadingWhitespace(line), &current_->name);
  }

  Material* current_;
  MaterialList materials_;
};

typedef std::map<std::string, DrawBatch> MaterialBatches;

// TODO: consider splitting this into a low-level parser and a high-level
// object.
class WavefrontObjFile {
 public:
  explicit WavefrontObjFile(FILE* fp) {
    current_batch_ = &material_batches_[""];
    current_batch_->Init(&positions_, &texcoords_, &normals_);
    current_group_line_ = 0;
    line_to_groups_.insert(std::make_pair(0, "default"));
    ParseFile(fp);
  }

  const MaterialList& materials() const {
    return materials_;
  }

  const MaterialBatches& material_batches() const {
    return material_batches_;
  }

  const std::string& LineToGroup(unsigned int line) const {
    typedef LineToGroups::const_iterator Iterator;
    typedef std::pair<Iterator, Iterator> EqualRange;
    EqualRange equal_range = line_to_groups_.equal_range(line);
    const std::string* best_group = NULL;
    int best_count = 0;
    for (Iterator iter = equal_range.first; iter != equal_range.second;
         ++iter) {
      const std::string& group = iter->second;
      const int count = group_counts_.find(group)->second;
      if (!best_group || (count < best_count)) {
        best_group = &group;
        best_count = count;
      }
    }
    if (!best_group) {
      ErrorLine("no suitable group found", line);
    }
    return *best_group;
  }

  void DumpDebug() const {
    printf("positions size: " PRIuS "\n"
	   "texcoords size: " PRIuS "\n"
	   "normals size: " PRIuS "\n",
           positions_.size(), texcoords_.size(), normals_.size());
  }
 private:
  WavefrontObjFile() { }  // For testing.

  void ParseFile(FILE* fp) {
    // TODO: don't use a fixed-size buffer.
    const size_t kLineBufferSize = 256;
    char buffer[kLineBufferSize] = { 0 };
    unsigned int line_num = 1;
    while (fgets(buffer, kLineBufferSize, fp) != NULL) {
      char* stripped = StripLeadingWhitespace(buffer);
      TerminateAtNewlineOrComment(stripped);
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
        if (isspace(line[1])) {
          ParseGroup(line + 2, line_num);
        } else {
          goto unknown;
        }
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
        if (0 == strncmp(line + 1, "semtl", 5)) {
          ParseUsemtl(line + 6, line_num);
        } else {
          goto unknown;
        }
        break;
      case 'm':
        if (0 == strncmp(line + 1, "tllib", 5)) {
          ParseMtllib(line + 6, line_num);
        } else {
          goto unknown;
        }
        break;
      case 's':
        ParseSmoothingGroup(line + 1, line_num);
        break;
      unknown:
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
    if (floats.size() != positionDim() &&
        floats.size() != 6) {  // ignore r g b for now.
      ErrorLine("bad position", line_num);
    }
    floats.AppendNTo(&positions_, positionDim());
  }

  void ParseTexCoord(const ShortFloatList& floats, unsigned int line_num) {
    if ((floats.size() < 1) || (floats.size() > 3)) {
      // TODO: correctly handle 3-D texcoords intead of just
      // truncating.
      ErrorLine("bad texcoord", line_num);
    }
    floats.AppendNTo(&texcoords_, texcoordDim());
  }

  void ParseNormal(const ShortFloatList& floats, unsigned int line_num) {
    if (floats.size() != normalDim()) {
      ErrorLine("bad normal", line_num);
    }
    // Normalize to avoid out-of-bounds quantization. This should be
    // optional, in case someone wants to be using the normal magnitude as
    // something meaningful.
    const float x = floats[0];
    const float y = floats[1];
    const float z = floats[2];
    const float scale = 1.0/sqrt(x*x + y*y + z*z);
    if (isfinite(scale)) {
      normals_.push_back(scale * x);
      normals_.push_back(scale * y);
      normals_.push_back(scale * z);
    } else {
      normals_.push_back(0);
      normals_.push_back(0);
      normals_.push_back(0);
    }
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
      current_batch_->AddTriangle(current_group_line_, indices);
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
    const char* endptr = NULL;
    *position_index = strtoint(line, &endptr);
    if (*position_index == 0) {
      return NULL;
    }
    if (endptr != NULL && *endptr == '/') {
      *texcoord_index = strtoint(endptr + 1, &endptr);
    } else {
      *texcoord_index = *normal_index = 0;
    }
    if (endptr != NULL && *endptr == '/') {
      *normal_index = strtoint(endptr + 1, &endptr);
    } else {
      *normal_index = 0;
    }
    return endptr;
  }

  // .OBJ files can specify multiple groups for a set of faces. This
  // implementation finds the "most unique" group for a set of faces
  // and uses that for the batch. In the first pass, we use the line
  // number of the "g" command to tag the faces. Afterwards, after we
  // collect group populations, we can go back and give them real
  // names.
  void ParseGroup(const char* line, unsigned int line_num) {
    std::string token;
    while ((line = ConsumeFirstToken(line, &token))) {
      ToLowerInplace(&token);
      group_counts_[token]++;
      line_to_groups_.insert(std::make_pair(line_num, token));
    }
    current_group_line_ = line_num;
  }

  void ParseSmoothingGroup(const char* line, unsigned int line_num) {
    static bool once = true;
    if (once) {
      WarnLine("s ignored", line_num);
      once = false;
    }
  }

  void ParseMtllib(const char* line, unsigned int line_num) {
    FILE* fp = fopen(StripLeadingWhitespace(line), "r");
    if (!fp) {
      WarnLine("mtllib not found", line_num);
      return;
    }
    WavefrontMtlFile mtlfile(fp);
    fclose(fp);
    materials_ = mtlfile.materials();
    for (size_t i = 0; i < materials_.size(); ++i) {
      DrawBatch& draw_batch = material_batches_[materials_[i].name];
      draw_batch.Init(&positions_, &texcoords_, &normals_);
    }
  }

  void ParseUsemtl(const char* line, unsigned int line_num) {
    std::string usemtl;
    ToLower(StripLeadingWhitespace(line), &usemtl);
    MaterialBatches::iterator iter = material_batches_.find(usemtl);
    if (iter == material_batches_.end()) {
      ErrorLine("material not found", line_num);
    }
    current_batch_ = &iter->second;
  }

  void WarnLine(const char* why, unsigned int line_num) const {
    fprintf(stderr, "WARNING: %s at line %u\n", why, line_num);
  }

  void ErrorLine(const char* why, unsigned int line_num) const {
    fprintf(stderr, "ERROR: %s at line %u\n", why, line_num);
    exit(-1);
  }

  AttribList positions_;
  AttribList texcoords_;
  AttribList normals_;
  MaterialList materials_;

  // Currently, batch by texture (i.e. map_Kd).
  MaterialBatches material_batches_;
  DrawBatch* current_batch_;

  typedef std::multimap<unsigned int, std::string> LineToGroups;
  LineToGroups line_to_groups_;
  std::map<std::string, int> group_counts_;
  unsigned int current_group_line_;
};

#endif  // WEBGL_LOADER_MESH_H_
