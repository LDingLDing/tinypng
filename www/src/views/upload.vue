<template>
  <div>
    <!-- 上传可拖拽块 -->
    <el-upload
      class="upload-wrap"
      drag
      action="https://jsonplaceholder.typicode.com/posts/"
      :auto-upload="false"
      multiple
      :fileList="uploadFiles"
      :show-file-list="false"
      :on-change="handleUploadChange"
      :on-progress="hanleFileProgress"
    >
      <i class="el-icon-upload"></i>
      <div class="el-upload__text">
        将文件拖到此处，或
        <em>点击上传</em>
      </div>
      <div class="el-upload__tip" slot="tip">只能上传jpg/png文件</div>
    </el-upload>
    <!-- 操作设置块 -->
    <el-row class="op-wrap" v-show="fileList && fileList.length">
      <el-button size="mini" type="success" :disabled="!(selectFiles && selectFiles.length)">执行压缩</el-button>
      <el-button size="mini" type="success" :disabled="!(selectFiles && selectFiles.length)">下载</el-button>
      <div
        v-show="selectFiles && selectFiles.length"
        class="op-maxcount-wrap"
        style="width:150px;margin: 0 20px;"
      >
        <el-input size="mini"
          v-model="op.expectSize"
          @keyup.enter.native="setExpectSize"
          @input="onInputExpectSize"
          @click="setExpectSize">
          <template slot="prepend">期望大小</template>
          <template slot="suffix">KB</template>
          <el-button slot="append" icon="el-icon-check"></el-button>
        </el-input>
      </div>
      <div v-show="selectFiles && selectFiles.length" class="op-maxcount-wrap" style="width:80px;">
        <el-input
          size="mini"
          v-model="op.maxCompressCount"
          @keyup.enter.native="setCompressCount"
          @input="onInputCompressCount"
          @click="setCompressCount"
        >
          <template slot="prepend">压次</template>
          <el-button slot="append" icon="el-icon-check"></el-button>
        </el-input>
      </div>
    </el-row>
    <!-- 表格 -->
    <el-table
      v-show="fileList && fileList.length"
      ref="multipleTable"
      :data="fileList"
      :cellClassName="cellClassName"
      style="width: 100%"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" :reserve-selection="true" row-key="uid"></el-table-column>
      <el-table-column label="文件名" width="200" show-overflow-tooltip>
        <template slot-scope="{ row: uid }">{{ fileDict[uid]['name'] }}</template>
      </el-table-column>
      <el-table-column label="大小" width="120">
        <template slot-scope="{ row: uid }">{{ calFileSize(fileDict[uid]['size']) }}</template>
      </el-table-column>
      <el-table-column label="状态">
        <template slot-scope="{ row: uid }">
          <span v-if="fileDict[uid]['status'] === 'ready'">ready</span>
          <el-progress
            :percentage="fileDict[uid]['progress']"
            v-else-if="fileDict[uid]['status'] === 'uploading'"
          ></el-progress>
          <el-progress
            :percentage="100"
            v-else-if="fileDict[uid]['status'] === 'success'"
            status="exception"
          ></el-progress>
          <el-progress
            :percentage="fileDict[uid]['progress']"
            v-else-if="fileDict[uid]['status'] === 'fail'"
            status="exception"
          ></el-progress>
        </template>
      </el-table-column>
      <el-table-column label="压次限制" width="100">
        <template slot-scope="{ column }" slot="header">
          {{column.label}}
          <el-tooltip placement="top">
            <div slot="content">
              一次压缩有限，可以指定压缩次数。
              <br>由于tinypng每月有次数限制，请合理使用。
            </div>
            <i class="el-icon-question"></i>
          </el-tooltip>
        </template>
        <template
          slot-scope="{ row: uid }"
        >{{fileDict[uid]['compressCount'] || 0}} / {{fileDict[uid]['maxCompressCount'] || 1}}</template>
      </el-table-column>
      <el-table-column label="期望大小" width="100">
        <template slot-scope="{ column }" slot="header">
          {{column.label}}
          <el-tooltip placement="top">
            <div slot="content">
              配合"压次"使用。
              <br>在压缩次数限制内反复压缩至你期望的大小。
            </div>
            <i class="el-icon-question"></i>
          </el-tooltip>
        </template>
        <template slot-scope="{ row: uid }">{{fileDict[uid]['expectSize'] ? fileDict[uid]['expectSize'] + 'KB' : 'Inf'}}</template>
      </el-table-column>
      <el-table-column label="OP" width="100" class="cel-op">
        <template slot-scope="{ row: uid, $index }">
          <div class="op-btn">
            <i class="el-icon-download"></i>
          </div>
          <div class="op-btn" @click="removeFile($index, uid)">
            <i class="el-icon-close"></i>
          </div>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import _ from "../components/util.js";
export default {
  name: "upload",
  data() {
    return {
      op: {
        maxCompressCount: 1,
        expectSize: 100
      },
      maxCompressCount: 10, // TODO 接入设置
      fileDict: {}, // 文件信息字典
      selectFiles: [], // 选中的文件 uid
      fileList: [], // 展示的文件 uid
      uploadFiles: [] // 上传的文件：全部信息
    };
  },
  methods: {
    onInputExpectSize (n) {
      const s = this;
      n = parseInt(n) || "";
      s.op.expectSize = n;
    },
    setExpectSize () {
      const s = this;
      for (let uid of s.selectFiles) {
        let tmp = s.fileDict[uid];
        tmp["expectSize"] = s.op.expectSize;
        s.fileDict[uid] && s.$set(s.fileDict, uid, tmp);
      }
      // ! $forceUpdate无效,鼠标滑过节点数据会更新
      s.fileList = s.fileList.concat([]);
    },
    onInputCompressCount(n) {
      const s = this;
      n = parseInt(n) || "";
      if (n > s.maxCompressCount) {
        this.$notify.close();
        this.$notify.warning({
          title: "操作警告",
          message: `“压缩次数”超出最大限制“${s.maxCompressCount}次”，请前往【设置】调整`,
          showClose: false
        });
      }
      s.op.maxCompressCount = n;
    },
    setCompressCount() {
      const s = this;
      s.op.maxCompressCount =s.op.maxCompressCount > s.maxCompressCount ? s.maxCompressCount: s.op.maxCompressCount;
      for (let uid of s.selectFiles) {
        let tmp = s.fileDict[uid];
        tmp["maxCompressCount"] = s.op.maxCompressCount;
        s.fileDict[uid] && s.$set(s.fileDict, uid, tmp);
      }
      // ! $forceUpdate无效,鼠标滑过节点数据会更新
      s.fileList = s.fileList.concat([]);
    },
    removeFile(index, uid) {
      const s = this;
      s.fileList.splice(index, 1);
      delete s.fileDict[uid];
    },
    handleUploadChange(file, fileList) {
      const s = this;
      // elementui onStart事件没有钩子可注册
      if (file.status === "ready") {
        file && s.fileList.push(file.uid);
      }
      s.fileDict[file.uid] = file;
    },
    hanleFileProgress(event, file, fileList) {
      const s = this;
      s.fileDict[file.uid].progress = parseInt(event.percent);
    },
    cellClassName({ row, column, rowIndex, columnIndex }) {
      if (column.label === "OP") {
        return "column-op";
      }
    },
    handleSelectionChange(selection) {
      const s = this;
      let arr = []
      for (let uid of selection) {
        s.fileDict[uid] && arr.push(uid)
      }
      s.selectFiles = arr;
      let sumSize = 0
      for (let uid of selection) {
        sumSize += s.fileDict[uid] && s.fileDict[uid]['size'] || 0
      }
      s.op.expectSize = parseInt(s.calFileSize(sumSize / s.selectFiles.length, {to: 'KB'}))
    },
    calFileSize: _.calFileSize
  },
  components: {}
};
</script>

<style>
.op-wrap {
  display: flex;
}
.upload-wrap {
  width: 360px;
  margin: 0 auto;
  margin-bottom: 30px;
}
.column-op .cell {
  display: flex;
}
.op-btn {
  padding: 0 3px;
  cursor: pointer;
}
.op-maxcount-wrap .el-input__suffix {
  line-height: 30px;
}
.op-maxcount-wrap .el-button {
  padding: 0;
  margin: 0;
}
.op-maxcount-wrap .el-input-group__prepend,
.op-maxcount-wrap .el-input-group__append,
.op-maxcount-wrap .el-input__inner {
  padding: 0 3px;
}
</style>