<template>
  <div class="re-player">
    <video
      ref="vidplayer"
      :id="id"
      style="object-fit: fill; width: 100%; height: 100%"
      class="re-player-video"
    ></video>
    <!-- loading mask  -->
    <div class="loading-pane">
      <div v-show="loadingMask" class="loding-mask">
        <div class="loading-txt">
          <div class="animated infinite rotateOut" v-show="maskType === 'loading'">
            <Icon class="loading-icon spin-icon-load" type="ios-loading" />
          </div>
          <div v-show="maskType === 'pause'" @click="onMaskPlay">
            <Icon class="loading-icon" type="ios-play" />
          </div>
          <div v-show="maskType === 'refresh'" @click="onMaskRePlay">
            <Icon class="loading-icon" type="md-refresh" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    id: {
      type: String,
      default: ""
    },
    optionData: {
      type: Object,
      default: () => {}
    },
    timeData: {
      type: Object,
      default: () => {}
    },
    perData: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      mediaSource: undefined,
      mediaPlayer: undefined,
      sourceBuffer: undefined,

      mimeCodec: 'video/mp4; codecs="avc1.42c01f"',

      fetchFiles: [],
      playBufferArr: [],
      eventQueen: [],

      nextPlayIndex: 0,
      nextBufferIndex: 0,
      jumpIndex: 0,

      currTime: 0,
      totalTime: 0,
      jumpTime: 0,

      fetchState: false,
      bufferState: false,

      loadingMask: true,
      maskType: "loading",
      initFinishState: false
    };
  },
  watch: {
    optionData(v) {
      this.destroyLeave();
      this.init();
    },
    timeData(v) {
      this.destroyLeave();
      this.init();
    },
    nextPlayIndex() {
      if (this.fetchFiles && this.nextBufferIndex >= this.fetchFiles.length) {
        this.nextPlayIndex = this.fetchFiles.length - 1;
      }
    },
    nextBufferIndex() {
      if (this.fetchFiles && this.nextBufferIndex >= this.fetchFiles.length) {
        this.nextBufferIndex = this.fetchFiles.length - 1;
      }
    },
    perData(v) {
      this.perRateEnter(v);
    }
  },
  computed: {
    transcodeUrl() {
      return `${this.$config.url}/${this.optionData.data.srs_unique_key ||
        this.optionData.data.srsUniqueKey}/agent/api/v1/callback_transcode`;
    },
    ensureTranscodeUrl() {
      return `${this.$config.url}/${this.optionData.data.srs_unique_key ||
        this.optionData.data.srsUniqueKey}/agent/api/v1/ensure_transcode_end`;
    }
  },
  mounted() {
    this.init();
  },
  methods: {
    init() {
      this.maskType = "loading";
      this.loadingMask = true;

      this.mediaSource = new MediaSource();
      this.mediaSource.addEventListener("sourceopen", this.onSourceOpen);
      this.mediaPlayer = this.$refs.vidplayer;
      this.mediaPlayer.src = URL.createObjectURL(this.mediaSource);

      this.initPlayerListener();
      this.onEventQueen();
    },
    onSourceOpen() {
      this.sourceBuffer = this.mediaSource.addSourceBuffer(this.mimeCodec);
      //   this.sourceBuffer.addEventListener("updateend", this.onBufferUpdate);
      this.sourceBuffer.addEventListener("error", () => {});
      this.sourceBuffer.addEventListener("abort", () => {});

      this.beforeFetchFiles();
    },
    initPlayerListener() {
      this.mediaPlayer.addEventListener("durationchange", () => {});
      this.mediaPlayer.addEventListener("loadedmetadata", () => {});
      this.mediaPlayer.addEventListener("error", () => {});
      this.mediaPlayer.addEventListener("stalled", () => {});
      this.mediaPlayer.addEventListener("waiting", this.onWaiting);
      this.mediaPlayer.addEventListener("canplay", this.onCanPlay);
      this.mediaPlayer.addEventListener("canplaythrough", () => {});
      this.mediaPlayer.addEventListener("timeupdate", this.onTimeUpdate);
      this.mediaPlayer.addEventListener("ended", () => {});
    },
    initIndex() {
      this.nextPlayIndex = 0;
      this.nextBufferIndex = 0;
      this.jumpIndex = 0;
    },
    beforeFetchFiles() {
      let stime = _.get(this.timeData, "startTime", "");
      let etime = _.get(this.timeData, "endTime", "");
      // console.log(stime, etime);
      if (stime && etime && _.get(this.optionData, "data.id", "")) {
        // this.$http({
        //   method: "POST",
        //   url: `ivmp/camera/playback`,
        //   data: {
        //     cameraId: _.get(this.optionData, "data.id", ""),
        //     startTime: stime,
        //     endTime: etime
        //   },
        //   showSpin: false
        // }).then(result => {
        let camOp = _.get(this.optionData, "data");
        let unKey = camOp.srs_unique_key || camOp.srsUniqueKey;
        let camObj = {
          flowId: camOp.unique_key || camOp.uniqueKey || camOp.serial,
          startTime: stime,
          endTime: etime
        };

        this.$http({
          method: "POST",
          url: this.$config.url + `/` + unKey + `/agent/api/v1/camhistory`,
          data: camObj,
          showSpin: false
        }).then(result => {
          let resTmp = _.get(result, "filesInfo", []);
          if (resTmp.length === 0) {
            this.fetchFilesEnd();
            this.$Message.info("该时间段内未找到回放文件！");
            return;
          }

          resTmp.forEach(f => {
            const arr = f.url.split("/");
            const flvarr = f.url.split(".flv");

            const h264 = flvarr[0] + "_h264.flv" + flvarr[1];
            const mp4 = flvarr[0] + "_h264.mp4" + flvarr[1];
            f.srcFile = f.url;
            f.shortUrl = `${arr[arr.length - 5]}/${arr[arr.length - 4]}/${
              arr[arr.length - 3]
            }/${arr[arr.length - 2]}/${arr[arr.length - 1]}`;

            f.url = `${this.optionData.data.srsUrl}/${h264}`;
            f.mp4url = `${this.optionData.data.srsUrl}/${mp4}`;
          });

          this.fetchFilesEnd(resTmp);
        });
      }
    },
    fetchFilesEnd(res) {
      if (res) {
        this.initFinishState = true;
        this.fetchFiles = res;
        this.$emit("back-media-res", res);
        this.initIndex();
        return this.$nextTick(() => this.initFiles(res));
      }
    },
    initFiles() {
      this.fetchFiles.forEach((file, i) => {
        file.isCached = false;
        file.isBuffered = false;
        file.buffer = null;
        if (i === 0) {
          file.range = [0, file.duration / 1000];
        } else {
          file.range = [
            this.fetchFiles[i - 1].range[1],
            this.fetchFiles[i - 1].range[1] + file.duration / 1000
          ];
        }
      });

      this.totalTime = _.sumBy(this.fetchFiles, "duration") / 1000;
      this.$emit("total-time", this.totalTime);
      this.transHEVCCode(this.nextBufferIndex);
    },
    onWaiting() {
      let curTime = parseInt(this.mediaPlayer.currentTime);
      this.$emit("play-state", false);
      if (curTime != 0 && curTime >= parseInt(this.totalTime - 0.5)) {
        this.maskType = "refresh";
        this.loadingMask = true;
        this.$emit("playPasueState", false);

        // console.log("完成播放");
      } else {
        this.maskType = "loading";
        this.loadingMask = true;
      }
    },
    onCanPlay() {
      this.maskType = "loading";
      this.loadingMask = false;
      this.$emit("play-state", true);
      this.mediaPlayer.play();
    },
    onTimeUpdate() {
      if (!this.jumpState) {
        this.currTime = this.mediaPlayer.currentTime;
        this.$emit("current-time", this.currTime);
      }

      if (!_.isEmpty(this.fetchFiles) && this.playBufferArr.length >= 1) {
        const endTime = this.fetchFiles[this.playBufferArr[0]].range[1];

        if (
          this.mediaPlayer.currentTime > endTime &&
          !_.includes(this.eventQueen, "cleanQ")
        ) {
          this.eventQueen.push("cleanQ");
        }
      }
    },
    onEventQueen() {
      setInterval(() => {
        if (this.initFinishState) {
          let bufLen = this.playBufferArr.length;
          let bufLast = this.playBufferArr[bufLen - 1];
          let perChangedState = _.includes(this.eventQueen, "perChanged");
          let transState = _.includes(this.eventQueen, "transbuf");
          let cleanState = _.includes(this.eventQueen, "cleanQ");
          let startTimeState = _.includes(this.eventQueen, "start-time-init");
          let idxToBufState = _.includes(this.eventQueen, "indexPlayToBuffer");

          if (bufLen < 4 && !transState)
            this.eventQueen.push("indexPlayToBuffer");

          if (
            perChangedState &&
            !this.bufferState &&
            !this.sourceBuffer.updating
          ) {
            if (bufLen >= 1) {
              this.mediaPlayer.pause();

              let startTime = this.fetchFiles[this.playBufferArr[0]].range[0];
              let endTime = this.fetchFiles[bufLast].range[1];
              this.playBufferArr = [];
              this.cleanUsedBuffer(startTime, endTime);
            }

            this.pullEveQueen("perChanged");
          } else {
            if (idxToBufState && !this.fetchState) this.indexPlayToBuffer();

            if (transState && !this.fetchState && bufLen < 4)
              this.transHEVCCode(this.nextBufferIndex);

            if (
              cleanState &&
              !this.bufferState &&
              bufLen > 0 &&
              !this.sourceBuffer.updating
            ) {
              this.cleanQueen();
            }

            if (startTimeState && bufLen > 0) {
              this.mediaPlayer.currentTime = this.jumpTime;
              this.mediaPlayer.startTime = this.jumpTime;

              this.pullEveQueen("start-time-init");
              this.jumpState = false;
              this.$emit("play-state", true);
              this.onCanPlay();
            }
          }
        }
      }, 200);
    },
    pullEveQueen(v) {
      _.pullAt(this.eventQueen, _.indexOf(this.eventQueen, v));
    },
    destroyEventQueen() {
      this.eventQueen = [];
    },
    cleanQueen() {
      const [startTime, endTime] = this.fetchFiles[this.playBufferArr[0]].range;
      this.cleanUsedBuffer(startTime, endTime);
      this.playBufferArr.shift();
      this.pullEveQueen("cleanQ");
    },
    cleanUsedBuffer(startTime, endTime) {
      return this.sourceBuffer.remove(startTime, endTime);
    },
    sourceBufferClean() {
      if (this.sourceBuffer && this.sourceBuffer.buffered.length > 0)
        return this.sourceBuffer.remove(0, this.mediaPlayer.duration);
    },
    indexPlayToBuffer() {
      if (!_.isEmpty(this.fetchFiles) && this.initFinishState) {
        const maxlength = this.fetchFiles.length - 1;
        this.nextBufferIndex = this.nextPlayIndex;
        if (this.fetchFiles[this.nextPlayIndex].isCached) {
          this.appendPlayBuffer();
        } else if (
          !_.includes(this.eventQueen, "transbuf") &&
          this.nextBufferIndex <= maxlength
        ) {
          this.eventQueen.push("transbuf");
        }
      }
    },
    appendPlayBuffer() {
      if (this.fetchFiles && this.fetchFiles[this.nextPlayIndex].isCached) {
        let buffer = this.fetchFiles[this.nextPlayIndex].buffer;
        if (buffer != null) {
          try {
            // if (!this.sourceBuffer.updating) {
            const [startTime, endTime] = this.fetchFiles[
              this.nextBufferIndex
            ].range;
            this.sourceBuffer.timestampOffset = startTime;
            this.sourceBuffer.appendBuffer(new Uint8Array(buffer));
            this.playBufferArr.push(this.nextPlayIndex);
            this.bufferState = false;
            this.nextPlayIndex++;
            this.nextBufferIndex++;
            this.$emit("cache-time", endTime);
            this.pullEveQueen("indexPlayToBuffer");
            // }
          } catch (error) {
            // console.log("append Buffer failed ->", error);
          }
        }
      } else {
        if (!_.includes(this.eventQueen, "indexPlayToBuffer")) {
          this.eventQueen.push("indexPlayToBuffer");
        }
      }
    },
    transHEVCCode(v) {
      if (
        !this.fetchState &&
        !_.isEmpty(this.fetchFiles) &&
        this.initFinishState
      ) {
        this.fetchState = true;
        this.$http({
          method: "POST",
          url: this.transcodeUrl,
          data: {
            srcFile: this.fetchFiles[v].srcFile,
            duration: this.fetchFiles[v].duration
          },
          showSpin: false,
          showMsg: false
        })
          .then(() => {
            setTimeout(() => {
              this.ensureHEVCCodeEnd(v);
            }, 1000);
          })
          .catch(() => {
            this.fetchState = false;
            this.transHEVCCode(v);
          });
      } else {
        if (!_.includes(this.eventQueen, "transbuf"))
          this.eventQueen.push("transbuf");
      }
    },
    ensureHEVCCodeEnd(v) {
      if (this.initFinishState) {
        this.$http({
          method: "POST",
          url: this.ensureTranscodeUrl,
          data: {
            srcFile: this.fetchFiles[v].srcFile
          },
          showSpin: false,
          showMsg: false,
          timeout: 3000
        })
          .then(res => {
            if (res === "OK") {
              this.fetch(this.fetchFiles[v].mp4url, this.appendCacheBuffer);
            } else {
              setTimeout(() => {
                this.ensureHEVCCodeEnd(v);
              }, 1000);
            }
          })
          .catch(() => {
            this.ensureHEVCCodeEnd(v);
          });
      }
    },
    appendCacheBuffer(buffer) {
      const curFile = this.fetchFiles[this.nextBufferIndex];
      if (curFile && !curFile.isCached) {
        this.fetchFiles[this.nextPlayIndex].buffer = buffer;
        this.$set(curFile, "isCached", true);
        this.fetchState = false;
        this.bufferState = false;
        this.$emit("cache-time", curFile.range[1]);
        this.nextBufferIndex++;
        this.pullEveQueen("transbuf");
      }
    },
    fetch(url, cb) {
      const xhr = new XMLHttpRequest();
      xhr.open("get", `${url}&token=${this.$ls.get("TOKEN")}`);
      xhr.responseType = "arraybuffer";
      xhr.onload = function() {
        cb(xhr.response);
      };
      xhr.send();
    },
    perRateEnter(v) {
      this.$emit("play-state", false);
      this.maskType = "loading";
      this.loadingMask = true;

      this.mediaPlayer.pause();
      this.jumpTime = this.fetchFiles[this.fetchFiles.length - 1].range[1];
      this.jumpTime = this.jumpTime * v;
      v = parseInt(this.fetchFiles.length * v);

      this.jumpState = true;
      this.destroyEventQueen();
      if (!_.includes(this.eventQueen, "perChanged"))
        this.eventQueen.push("perChanged");

      this.nextPlayIndex = v;
      if (!_.includes(this.eventQueen, "indexPlayToBuffer"))
        this.eventQueen.push("indexPlayToBuffer");

      this.transState = false;
      this.bufferState = false;
      this.$emit("cache-time", this.jumpTime);
      this.$emit("current-time", this.jumpTime);
      this.eventQueen.push("start-time-init");
    },

    onForward(v) {
      this.currTime += v;
      if (this.currTime >= this.totalTime) this.currTime = this.totalTime - 0.5;

      this.perRateEnter(this.currTime / this.totalTime);
    },
    onBackward(v) {
      this.currTime -= v;
      if (this.currTime < 0) this.currTime = 0;

      return this.perRateEnter(this.currTime / this.totalTime);
    },
    onSpeedChanged(v) {
      this.mediaPlayer.playbackRate = parseFloat(v);
    },
    onMaskPlay() {
      this.$emit("play-state", true);
      this.play();
    },
    onMaskRePlay() {
      this.$emit("play-state", true);
      this.maskType = "loading";
      this.loadingMask = false;
      this.perRateEnter(0);
    },
    pause() {
      this.maskType = "pause";
      this.loadingMask = true;
      this.mediaPlayer.pause();
    },
    play() {
      this.maskType = "loading";
      this.loadingMask = false;
      this.mediaPlayer.play();
    },
    destroy() {
      this.destroyLeave();
      if (this.mediaSource.readyState === "open") {
        this.mediaSource.endOfStream();
      }
      this.mediaSource.removeEventListener("sourceopen", this.onSourceOpen);
      this.sourceBuffer = null;
      this.mediaSource = null;
      this.mediaPlayer.removeEventListener("timeupdate", this.onTimeUpdate);
      if (!this.mediaPlayer) return;
      this.mediaPlayer = null;
    },
    destroyLeave() {
      this.initFinishState = false;
      this.fetchState = false;
      this.bufferState = false;

      this.currTime = 0;
      this.totalTime = 0;

      this.playBufferArr = [];
      this.eventQueen = [];
      this.fetchFiles = [];
    }
  },
  beforeDestroy() {
    this.destroyLeave();
  }
};
</script>

<style lang="less" scoped>
.re-player {
  height: 100%;
  width: 100%;
  overflow: hidden;
  &-video {
    height: 100%;
    width: 100%;
    object-fit: fill;
  }
}
.loading-pane {
  position: absolute;
  width: 100%;
  height: calc(100% - 39px);
  overflow: hidden;
  background: none;
  z-index: 6;
  left: 0;
  top: 0;
}
.loding-mask {
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: none;
}
.loading-txt {
  text-align: center;
  margin: 26% auto;
}
.loading-icon {
  font-size: 40px;
}
.spin-icon-load {
  animation: ani-demo-spin 1s linear infinite;
}
@keyframes ani-demo-spin {
  from {
    transform: rotate(0deg);
  }
  50% {
    transform: rotate(180deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
