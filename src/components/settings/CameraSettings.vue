<template>
  <div class="bookmark" @dblclick.stop="() => {}">
    <Divider style="color: #efefef;">{{item.name||item.label}}</Divider>

    <hyz-v-box>
      <div class="bookmark-flex">
        <hyz-h-box label="摄像头标识">{{item.serial}}</hyz-h-box>
        <hyz-h-box label="IP">{{item.ip}}</hyz-h-box>
      </div>
      <div class="bookmark-flex">
        <hyz-h-box label="归属区域">{{item.regionFullName||item.region_full_name}}</hyz-h-box>
        <hyz-h-box label="归属SRS">{{item.srsUniqueKey||item.srs_unique_key}}</hyz-h-box>
      </div>
      <div class="bookmark-flex">
        <hyz-h-box label="主码流编码">{{item.video_code||item.videoCode}}</hyz-h-box>
        <hyz-h-box label="子码流编码">{{item.child_video_code||item.childVideoCode}}</hyz-h-box>
      </div>

      <!-- <div class="bookmark-flex">
        <hyz-h-box label="主视频编码">{{item.video_code}}</hyz-h-box>
        <hyz-h-box label="主视频路径">{{item.video_path}}</hyz-h-box>
      </div>
      <div class="bookmark-flex">
        <hyz-h-box label="子视频编码">{{item.child_video_code}}</hyz-h-box>
        <hyz-h-box label="子视频路径">{{item.child_video_path}}</hyz-h-box>
      </div>
      <div class="bookmark-flex">
        <hyz-h-box label="发现端口">{{item.find_port}}</hyz-h-box>
        <hyz-h-box label="视频端口">{{item.video_port}}</hyz-h-box>
      </div>
      <div class="bookmark-flex">
        <hyz-h-box label="转发端口">{{item.retransmit_port}}</hyz-h-box>
        <hyz-h-box label="控制端口">{{item.control_port}}</hyz-h-box>
      </div>-->
    </hyz-v-box>
  </div>
</template>

<script>
export default {
  props: ["item"],
  data() {
    return {
      saveLoading: false
    };
  },
  mounted() {
    console.log(this.item);
  },
  methods: {
    save() {
      this.saveLoading = true;
      this.$http({
        method: "put",
        url: "ivmp/camera",
        data: this.item,
        showSpin: false
      })
        .then(result => {
          this.saveLoading = false;
          this.$emit("save", this.item);
        })
        .catch(e => (this.saveLoading = false));
    }
  }
};
</script>

<style lang="less" scoped>
.bookmark {
  padding: 0 16px 12px;
  border-radius: 12px;
  &-row {
    margin-bottom: 12px;
    width: 200px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    &-title {
      text-align: right;
      margin: 8px 0;
      width: 120px;
    }
    &-comp {
      width: 200px;
      text-align: left;
    }
  }
  &-flex {
    display: grid;
    grid-template-columns: 50% 50%;
  }
}
</style>
