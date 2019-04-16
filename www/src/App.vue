<template>
  <div id="app">
    <el-container style="height:100%;">
      <el-container>
        <el-aside style="width: 65px;height:100%;">
          <el-menu default-active="1" :collapse="true" style="height:100%;">
            <el-menu-item index="1">
              <i class="el-icon-menu"></i>
              <span slot="title">图片压缩</span>
            </el-menu-item>
            <el-menu-item index="2">
              <i class="el-icon-setting"></i>
              <span slot="title">设置</span>
            </el-menu-item>
          </el-menu>
        </el-aside>
        <el-main>
          <upload-view></upload-view>
        </el-main>
      </el-container>
      <!-- <el-footer class="footer">
        <a href="http://www.miitbeian.gov.cn/" target="_blank">浙ICP备19010836号-1</a>
      </el-footer>-->
    </el-container>
  </div>
</template>

<script>
import UploadView from './views/upload'
export default {
  name: "app",
  data() {
    return {
    };
  },
  methods: {
  },
  components: {
    UploadView
  }
};
</script>

<style>

</style>
