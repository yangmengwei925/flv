<template>
  <div class="videoClip" @dblclick.stop="() => {}">
    <Divider style="color: #efefef;">添加剪辑</Divider>
    <div class="videoClip-row">
      <h4 style="text-align: left; margin: 8px 0;">剪辑名称：</h4>
      <Input style="width: 280px;" v-model="item.name"></Input>
    </div>
    <div class="videoClip-row">
      <h4 style="text-align: left; margin: 8px 0;">剪辑描述：</h4>
      <Input type="textarea" v-model="item.description"></Input>
    </div>
    <div class="videoClip-row">
      <div style="display:flex; justify-content: space-between;align-items: center;">
        <h4 style="text-align: left; margin: 8px 0;">剪辑操作：</h4>
        <!-- <Icon style="cursor: pointer;" @click="addClip" :size="18" type="md-add" /> -->
      </div>
      <div>
        <div class="cliptime-row" v-for="(clipTime, index) in clipTimes" :key="index">
          <Tag
            style="width: 100%;"
            v-if="clipTime.isFinished"
            color="success"
            closable
            @on-close="removeClip(clipTime)"
          >{{ clipTime.startTime }} - {{ clipTime.endTime }}</Tag>
          <div v-else>{{ clipTime.startTime }} - {{ clipTime.endTime }}</div>
          <Button
            v-show="isCutting && !clipTime.isFinished"
            size="small"
            ghost
            @click="endClip(clipTime)"
          >设定</Button>
        </div>
      </div>
      <Button
        v-show="!isCutting"
        type="primary"
        style="width: 100%;"
        size="small"
        icon="md-add"
        @click="addClip"
      >设定剪辑时间片段</Button>
    </div>
    <div>
      <Button :loading="saveLoading" type="primary" size="small" @click="save">保存</Button>&nbsp;&nbsp;
      <Button size="small" ghost @click="$emit('cancel-videoClip')">取消</Button>
    </div>
  </div>
</template>

<script>
import dayjs from "dayjs";
export default {
  props: ["item", "currentTemp", "videoSrcs"],
  data() {
    return {
      isCutting: false,
      saveLoading: false,
      clipTimes: [],
      currentTime: ""
    };
  },
  computed: {
    cutBtnText() {
      return this.isCutting ? "结束剪辑" : "开始剪辑";
    }
  },
  watch: {
    currentTemp(v) {
      this.currentTime = dayjs(this.videoSrcs[0].begintime)
        .add(v, "seconds")
        .format("YYYY-MM-DD HH:mm:ss");
    }
  },
  mounted() {
    this.currentTime = dayjs(this.videoSrcs[0].begintime).format(
      "YYYY-MM-DD HH:mm:ss"
    );
  },
  methods: {
    addClip() {
      const item = {
        uid: _.uniqueId("ct"),
        startTime: this.currentTime,
        endTime: "结束设定中..."
      };
      this.clipTimes.push(item);
      this.isCutting = true;
      this.$emit("begin-cut");
    },
    endClip(item) {
      item.isFinished = true;
      item.endTime = this.currentTime;
      this.isCutting = false;
      this.$emit("end-cut");
    },
    removeClip(item) {
      this.clipTimes = _.reject(this.clipTimes, { uid: item.uid });
    },
    save() {
      if (this.clipTimes.length === 0) {
        this.$Message.warning("请至少设定一段剪辑时间");
        return false;
      }
      if (this.item.name === "") {
        this.$Message.warning("请输入剪辑名称");
        return false;
      }
      let tmpClip = this.item;
      tmpClip.clipTime = JSON.stringify(this.clipTimes);
      this.saveLoading = true;
      this.$http({
        method: "post",
        url: "ivmp/videoClip",
        data: tmpClip,
        showSpin: false
      })
        .then(result => {
          this.saveLoading = false;
          this.$emit("end-cut");
          this.$emit("save-videoClip", tmpClip);
        })
        .catch(e => (this.saveLoading = false));
    }
  }
};
</script>

<style lang="less" scoped>
.videoClip {
  padding: 0 16px 12px;
  border-radius: 12px;
  &-row {
    margin-bottom: 12px;
    // display: flex;
    // align-items: center;
    // justify-content: space-between;
  }
}
.cliptime-row {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 4px;
}
</style>
