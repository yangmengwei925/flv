<template>
  <div class="bookmark" @dblclick.stop="() => {}">
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
        <Option :value="0.5 * 60 * 1000">1分钟</Option>
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
import EventBus, { PLAYER_EVENT } from "../utils/bus";
export default {
  name: "play-playback-settings",
  props: ["camera", "filePush"],
  data() {
    return {
      playTime: "",
      playDuration: 0.5 * 60 * 1000,
      realDuration: 0,
      playbackLoading: false,

      filesInfo: this.filePush,

      stopPlaybackRequest: false,
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
    this.$bus.$on("request_trans_code", this.onReqTransCode);
  },
  computed: {
    transcodeUrl() {
      return `${this.camera.srsUrl}/agent/api/v1/callback_transcode`;
    },
    ensureTranscodeUrl() {
      return `${this.camera.srsUrl}/agent/api/v1/ensure_transcode_end`;
    }
  },
  methods: {
    backToLive() {
      this.playbackLoading = false;
      this.stopPlaybackRequest = true;
      this.$emit("modeChanged", "live");
      // this.$bus.$emit("videoControl", false);
    },
    onPlayback() {
      if (!this.playTime) {
        this.$Message.info("请选择开始回放时间！");
        return;
      }

      this.$emit("modeChanged", "playback");

      const endTime = new Date();
      endTime.setTime(this.playTime.getTime() + this.playDuration);

      const startTimeStr = dayjs(this.playTime).format("YYYY-MM-DD HH:mm:ss");
      const endTimeStr = dayjs(endTime).format("YYYY-MM-DD HH:mm:ss");
      this.fetchFiles(startTimeStr, endTimeStr);
    },
    fetchFiles(startTime, endTime) {
      this.stopPlaybackRequest = false;
      this.$emit("fetch-files-begin");
      this.playbackLoading = true;
      this.$http({
        method: "POST",
        url: `ivmp/camera/playback`,
        data: {
          cameraId: this.camera.id,
          startTime,
          endTime
        },
        showSpin: false
      }).then(result => {
        console.log("sss");
        console.log(result);
        if (result.filesInfo.length === 0) {
          this.$emit("fetch-files-end");
          this.playbackLoading = false;
          this.$Message.info("该时间段内未找到回放文件！");
          return;
        }
        //补全播放文件的绝对路径
        result.filesInfo.forEach(f => {
          const arr = f.url.split("/");
          const flvarr = f.url.split(".flv");

          const h264 = flvarr[0] + "_h264.flv" + flvarr[1];
          const mp4 = flvarr[0] + "_h264.mp4" + flvarr[1];
          f.srcFile = f.url;
          f.shortUrl = `${arr[arr.length - 5]}/${arr[arr.length - 4]}/${
            arr[arr.length - 3]
          }/${arr[arr.length - 2]}/${arr[arr.length - 1]}`;

          f.url = `${this.camera.srsUrl}/${h264}`;
          f.mp4url = `${this.camera.srsUrl}/${mp4}`;
        });

        this.realDuration = _.sumBy(result.filesInfo, "duration") / 1000;
        this.filesInfo = result.filesInfo;
        //hevc编码需要通知后端取转码
        this.$emit("fetch-files-end", result.filesInfo);
      });
    },
    stop() {
      console.log("TCL: stop -> stop");
      this.stopPlaybackRequest = true;
    },
    onReqTransCode(index) {
      // console.log("TCL: onReqTransCode >> ", this.filePush);
      // console.log("++++++++++++++");
      // console.log(this.filesInfo[index]);
      if (_.get(this.filesInfo, "[" + index + "]"))
        this.transHEVCCode(this.filesInfo[index]);
    },

    transHEVCCode(v, useEventBus) {
      // console.log("TCL: transHEVCCode -> 开始转码", v.url);
      if (this.stopPlaybackRequest) return;
      this.$http({
        method: "POST",
        url: this.transcodeUrl,
        data: {
          srcFile: v.srcFile
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
            // const data = _.take(v, index+1)
            // console.log('TCL: ensureHEVCCodeEnd -> data', data)
            console.log("TCL: ensureHEVCCodeEnd -> 转码已完成", v.url);
            this.$bus.$emit("trans_code_finish", { data: v });

            // if(useEventBus) {
            //   this.$bus.$emit('trans_code_finish', {data: v})
            // } else {
            // this.$emit("to-playback", { type: "hevc", duration: this.realDuration, data: this.filesInfo });
            // }
            //如果还有未转码的文件，通知下一个去转码
            // if(v.length > index+1) {
            //   this.transHEVCCode(v, index+1)
            // }
          } else {
            //未转码完则过1秒再取确认
            // if(!stopPlaybackRequest) {
            setTimeout(() => {
              this.ensureHEVCCodeEnd(v, useEventBus);
            }, 1000);
            // }
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
    // display: flex;
    // align-items: center;
    // justify-content: space-between;
  }
}
</style>
