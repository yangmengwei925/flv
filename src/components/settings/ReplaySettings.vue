<template>
  <div :class="{'bookmark':true,'bookDark':theme}">
    <Divider style="color: #efefef;">实时/回放</Divider>
    <div class="bookmark-row">
      <h4 style="text-align: left; margin: 8px 0;">回放开始时间：</h4>
      <DatePicker
        size="small"
        v-model="playTime"
        type="datetime"
        :options="dateOption"
        format="yyyy-MM-dd HH:mm:ss"
        placeholder="回放开始时间"
        style="width: 180px; color: #444;"
      ></DatePicker>
    </div>
    <div class="bookmark-row">
      <h4 style="text-align: left; margin: 8px 0;">回放时长：</h4>
      <Select size="small" v-model="playDuration">
        <Option :value="1 * 60 * 1000">1分钟</Option>
        <Option :value="5 * 60 * 1000">5分钟</Option>
        <Option :value="30 * 60 * 1000">半小时</Option>
        <Option :value="60 * 60 * 1000">1小时</Option>
        <Option :value="2 * 60 * 60 * 1000">2小时</Option>
        <Option :value="6 * 60 * 60 * 1000">6小时</Option>
        <Option :value="24 * 60 * 60 * 1000">1天</Option>
      </Select>
    </div>
    <div>
      <Button :loading="playbackLoading" type="primary" size="small" @click="onPlayback">开始回放</Button>&nbsp;&nbsp;
      <Button type="primary" size="small" @click="backToLive">切回实时</Button>
    </div>
  </div>
</template>

<script>
import dayjs from "dayjs";
export default {
  name: "play-playback-settings",
  props: ["isScene", "camera", "option", "playLoadingState"],
  data() {
    return {
      theme: this.$ls.get("THEME") === "dark",
      playTime: "",
      playDuration: 1 * 60 * 1000,
      playbackLoading: this.playLoadingState,

      dateOption: {
        shortcuts: [
          {
            text: "5分钟前",
            value() {
              const start = new Date();
              start.setTime(start.getTime() - 300 * 1000);
              return start;
            }
          },
          {
            text: "半小时前",
            value() {
              const start = new Date();
              start.setTime(start.getTime() - 1800 * 1000);
              return start;
            }
          },
          {
            text: "1小时前",
            value() {
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000);
              return start;
            }
          },
          {
            text: "2小时前",
            value() {
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 2);
              return start;
            }
          },
          {
            text: "6小时前",
            value() {
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 5);
              return start;
            }
          },
          {
            text: "1天前",
            value() {
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24);
              return start;
            }
          }
        ]
      }
    };
  },
  mounted() {
    const start = new Date();
    start.setTime(start.getTime() - 3600 * 1000);
    this.playTime = start;
  },
  computed: {},
  watch: {
    playLoadingState(v) {
      this.playbackLoading = v;
    }
  },
  methods: {
    backToLive() {
      this.$emit("modeChanged", "live");
    },
    scenePlayback(startTime, endTime) {
      if (!this.playTime) {
        this.$Message.info("请选择开始回放时间！");
        return;
      }

      this.$emit("modeChanged", "replay");
      this.$emit("fetch-files", { startTime, endTime });
    },
    onPlayback() {
      if (!this.playTime) {
        this.$Message.info("请选择开始回放时间！");
        return;
      }

      let endTime = new Date();
      endTime.setTime(this.playTime.getTime() + this.playDuration);

      const startTime = dayjs(this.playTime).format("YYYY-MM-DD HH:mm:ss");
      endTime = dayjs(endTime).format("YYYY-MM-DD HH:mm:ss");

      this.$emit("modeChanged", "replay");
      this.$emit("fetch-files", { startTime, endTime });
    },
    stop() {
      console.log("TCL: stop -> stop");
      this.stopPlaybackRequest = true;
    },
    onReqTransCode({ option, index }) {
      // console.log("TCL: onReqTransCode >> ", index);
      if (this.filesInfo) return this.transHEVCCode(this.filesInfo[index]);
      // console.log("filesInfo数据异常");
    },

    transHEVCCode(v, useEventBus) {
      // console.log("TCL: transHEVCCode -> 开始转码", v.url);
      if (this.stopPlaybackRequest) return;
      this.$http({
        method: "POST",
        url: this.transcodeUrl,
        data: {
          srcFile: v.srcFile,
          duration: v.duration
        },
        showSpin: false,
        showMsg: false
      })
        .then(result => {
          //过3秒请去确认文件是否转码完，
          //h265现在5秒粒度存，大概3秒转码，这里延迟3秒再取确认可以少一次请求
          setTimeout(() => {
            // console.log('TCL: transHEVCCode -> 去确认下')
            this.ensureHEVCCodeEnd(v, useEventBus);
          }, 2000);
        })
        .catch(e => {
          //重新请求
          this.transHEVCCode(v, useEventBus);
        });
    },

    ensureHEVCCodeEnd(v, useEventBus) {
      if (this.stopPlaybackRequest) return;
      this.$http({
        method: "POST",
        url: this.ensureTranscodeUrl,
        data: {
          srcFile: v.srcFile
        },
        showSpin: false,
        showMsg: false,
        timeout: 3000
      })
        .then(result => {
          // console.log('TCL: ensureHEVCCodeEnd -> result', result)
          if (result === "OK") {
            this.playbackLoading = false;
            //返回已转码好的文件
            this.$emit("trans-code-finish", { data: v });
          } else {
            //未转码完则过1秒再取确认
            setTimeout(() => {
              this.ensureHEVCCodeEnd(v, useEventBus);
            }, 1000);
          }
        })
        .catch(e => {
          this.ensureHEVCCodeEnd(v, useEventBus);
        });
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
  }
}
</style>
<style lang="less">
.bookDark {
  .ivu-date-picker {
    color: #fff !important;
  }
}
</style>
