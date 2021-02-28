<template>
  <div
    :id="id + 'root'"
    :ref="id + 'root'"
    class="hyz-video"
    style="width: 100%;height: 100%;"
    @mouseenter="showVideoCtlBar = true"
    @mouseleave="showVideoCtlBar = false"
    @dblclick="toggleFullscreen"
  >
    <transition
      name="flv-fade"
      enter-active-class="animated fadeIn"
      leave-active-class="animated fadeOut"
    >
      <!-- v-show="videoPlaying && !isFullScreen && isShowPop && (isGrid || !showVideoCtlBar)" -->
      <div class="video-pop">
        <div class="video-pop-pane">
          <div class="video-pop-pane-item">
            <span
              v-if="!$config.hideCameraIp"
              class="video-pop-pane-item-info ping-box"
              @click="pingCamera(option.data.ip)"
            >
              {{
              option.data.ip || "-"
              }}
            </span>
          </div>
          <div class="video-pop-pane-item">
            <span class="video-pop-pane-item-info">
              {{
              $config.showCameraLabel ? option.data.name : option.data.uniqueKey
              }}
            </span>
          </div>
        </div>
      </div>
    </transition>
    <div class="video-info" v-show="!videoPlaying">
      <div class="video-info-pane" v-if="isShowPingTest && !$config.hideIPCameraTest">
        <a class="video-info-handle" @click="openDeviceInfoHandler(option)">
          {{
          option.data.label || option.data.name || ""
          }}
        </a>
        <a class="video-info-item" v-if="option.data.ip">
          {{
          option.data.ip || ""
          }}
        </a>
        <span v-else class="video-info-item">未监测到IP</span>
        <!-- <Button
          v-show="option.data.ip"
          type="primary"
          class="video-info-btn"
          ghost
          @click="pingCamera(option.data.ip)"
        >连接测试</Button> -->
      </div>
      <div class="video-info-pane" v-else>
        <!-- 暂无画面 -->
      </div>
      <div
        style="background: red; position: absolute; right: 0px; top: 0px;padding: 2px;"
        v-if="showNoPermission"
      >流推送异常(无权限或网络导致)！</div>
    </div>

    <LivePlayer
      v-if="isLive"
      ref="livePlayer"
      :id="id"
      :option="optionTemp"
      @on-metadata-arrived="onMetadataArrived"
      @on-error="onError"
    />

    <ReplayPlayer
      v-else
      ref="replayPlayer"
      :optionData="option"
      :timeData="timeOption"
      :id="id"
      :perData="progressPerNum"
      @cache-time="bufferTimeChange"
      @current-time="currentDurationGot"
      @total-time="onTotalTime"
      @back-media-res="videoTempGot"
      @play-state="onplayPasueState"
    ></ReplayPlayer>

    <Controller
      ref="replayController"
      class="replayer-control"
      v-if="!isOnlyReplay && (!isGrid || isFullScreen)"
      :showCtlBar="showVideoCtlBar"
      :isScene="isSceneState"
      :isLive="isLive"
      :isPlaying="isPlaying"
      :ctlPopType="ctlPopTypeData"
      :currDuration="currentDuration"
      :totalDuration="totalDuration"
      :bufferTemp="bufferTemp"
      :videoTemp="videoSrcs"
      :id="id"
      :option="optionTemp"
      :reqTransCodeIn="reqTransCodeIn"
      :loadingState="playLoadingState"
      :isFullScreen="isFullScreen"
      :isCanCloud="isCanCloud"
      :timeData="timeOption"
      @modeChanged="onModeChanged"
      @progressPerOut="onProgressPer"
      @playPauseChanged="onplayPauseChanged"
      @refreshNow="onRefresh"
      @forward="onForward"
      @backward="onBackward"
      @speedChanged="onSpeedChanged"
      @toggleFullscreen="toggleFullscreen"
      @fetch-files="onFetchFiles"
      @on-ctl-pop="onCtlPop"
      @dblclick.stop="onController($event)"
    ></Controller>

    <!-- PingTest -->
    <!-- <PingTest ref="pingTest" /> -->
    <!-- PingTest-END -->
  </div>
</template>

<script>
import LivePlayer from "./LivePlayer";
import ReplayPlayer from "./ReplayPlayer";
import Controller from "./Controller";
// import PingTest from "./network/PingTest";
export default {
  props: {
    isScene: {
      type: Boolean,
      default: false,
    },
    option: {
      type: Object,
      default: () => {},
    },
    id: {
      type: String,
      default: "",
    },
    isOnlyReplay: {
      type: Boolean,
      default: false,
    },
    isGrid: {
      type: Boolean,
      default: false,
    },
    isShowPop: {
      //是否显示播放时IP/编码信息
      type: Boolean,
      default: true,
    },
    isShowPingTest: {
      type: Boolean,
      default: true,
    },
  },
  components: {
    LivePlayer,
    ReplayPlayer,
    Controller,
    // PingTest,
  },
  data() {
    return {
      isSceneState: this.isScene || false,
      isLive: this.option.isLive || true,
      isPlaying: true,
      isFullScreen: false,

      //控制栏弹出框类型
      ctlPopTypeData: "",
      //控制条是否显示
      showVideoCtlBar: false,

      //剪辑
      showCutStatus: false,
      playbackRate: 1,
      optionTemp: this.option,
      reqTransCodeIn: undefined,
      currentDuration: undefined,
      totalDuration: undefined,
      bufferTemp: undefined,
      videoSrcs: undefined,
      progressPerNum: undefined,

      //文件数据
      filesInfo: undefined,
      playLoadingState: false,

      timeOption: {},
      videoPlaying: false,
      fullEle: null,
      isCanCloud: false,

      //是否呈现无权限
      showNoPermission: false,
    };
  },

  watch: {
    option: {
      handler(v) {
        this.videoPlaying = false;
        this.isLive = true;
        //控制栏弹出框类型
        this.ctlPopTypeData = "";
        //控制条是否显示
        this.showVideoCtlBar = false;

        //剪辑
        this.showCutStatus = false;
        this.playbackRate = 1;
        this.optionTemp = v;
        this.isCanCloud = false;

        this.showNoPermission = false;

        if (
          _.get(this.option, "data.resourceClassKeyname", "") == "ball_camera"
        )
          this.isCanCloud = true;

        return this.onRefresh();
      },
      deep: true,
    },
    isFullScreen(v) {
      if (!v) {
        this.ctlPopTypeData = "";
        this.showVideoCtlBar = false;
        if (this.isLive) {
          this.videoPlaying = true;
        } else if (this.isGrid) {
          this.initLive();
        }
      }
    },
  },
  created() {
    let _this = this;
    document.addEventListener("fullscreenchange", function (e) {
      if (document.fullscreenElement) {
        _this.fullEle = document.fullscreenElement;
      } else {
        if (_this.fullEle) {
          let id = _this.fullEle.id;
          if (_this.$refs[id]) _this.isFullScreen = false;
        }
      }
    });
  },
  mounted() {
    if (_.get(this.option, "data.resourceClassKeyname", "") == "ball_camera")
      this.isCanCloud = true;
  },
  methods: {
    //初始化回放
    initReplay({ startTimeStr, endTimeStr }) {
      this.onModeChanged("replay");
      let startTime = startTimeStr;
      let endTime = endTimeStr;
      this.timeOption = {
        startTime: startTimeStr,
        endTime: endTimeStr,
      };
    },
    //初始化直播
    initLive() {
      return this.onModeChanged("live");
    },
    //销毁回放
    destroyReplay() {
      if (this.$refs.replayPlayer) {
        this.$refs.replayPlayer.destroy();
      }
    },
    //销毁直播
    destroyLive() {
      if (this.$refs.livePlayer) {
        this.$refs.livePlayer.pause();
        this.$refs.livePlayer.destroy();
      }
    },
    //销毁全部
    destroyAll() {
      this.destroyLive();
      this.destroyReplay();
    },
    //切换模式：直播/回放
    onModeChanged(type) {
      this.isPlaying = true;
      if (type === "live") {
        this.videoPlaying = false;
        this.isLive = true;
        this.destroyReplay();
        this.onplayPasueState(true);
      } else {
        this.isLive = false;
        this.destroyLive();
      }
    },
    //直播模式下刷新
    onRefresh() {
      this.onModeChanged("live");

      if (this.$refs.livePlayer) {
        this.$refs.livePlayer.onRefresh();
        this.destroyReplay();
        return this.$refs.livePlayer.play();
      }
    },
    //全屏/退出全屏切换
    toggleFullscreen(event) {
      if (_.get(event, "target.id", "") == "cloudTerrace") return;
      if (_.get(event, "target.children[0].id", "") == "cloudTerrace") return;
      let elem = document.getElementById(this.id + "root");
      if (!document.fullscreenElement) {
        //跨浏览器发动全屏
        if (elem.requestFullscreen) {
          elem.requestFullscreen();
        } else if (elem.mozRequestFullScreen) {
          elem.mozRequestFullScreen();
        } else if (elem.msRequestFullscreen) {
          elem.msRequestFullscreen();
        } else if (elem.webkitRequestFullscreen) {
          elem.webkitRequestFullScreen();
        }
        this.isFullScreen = true;
      } else {
        this.isFullScreen = false;
        document.exitFullscreen();
      }
    },

    //缓存进度获取
    bufferTimeChange(data) {
      return (this.bufferTemp = data);
    },
    onTotalTime(v) {
      this.totalDuration = v;
    },

    //当前播放时间获取
    currentDurationGot(data) {
      return (this.currentDuration = data);
    },
    //视频数据获取
    videoTempGot(data) {
      return (this.videoSrcs = data);
    },
    //进度比例获取
    onProgressPer(data) {
      return (this.progressPerNum = data);
    },
    //快进
    onForward(data) {
      return this.$refs.replayPlayer.onForward(data);
    },
    //快退
    onBackward(data) {
      return this.$refs.replayPlayer.onBackward(data);
    },
    //播放速度改变
    onSpeedChanged(data) {
      return this.$refs.replayPlayer.onSpeedChanged(data);
    },
    //播放器播放状态改变
    onplayPasueState(data) {
      return (this.isPlaying = data);
    },
    //控制器播放暂停切换
    onplayPauseChanged(data) {
      this.isPlaying = data.state;
      if (data.type === "live") {
        if (this.$refs.livePlayer) {
          if (this.isPlaying) return this.$refs.livePlayer.play();

          return this.$refs.livePlayer.pause();
        }
      } else {
        if (this.$refs.replayPlayer) {
          if (this.isPlaying) return this.$refs.replayPlayer.play();

          return this.$refs.replayPlayer.pause();
        }
      }
    },
    onFetchFiles({ startTime, endTime }) {
      this.timeOption = {
        startTime,
        endTime,
      };
    },
    //回放文件获取
    onFetchFilesEnd(data) {
      this.playLoadingState = false;
      this.ctlPopTypeData = "";
      return this.$nextTick(() => this.$refs.replayPlayer.initFiles(data));
    },
    onCtlPop(v, state) {
      if (v == "ptz" && v == state) return this.$emit("on-ptz", false);
      return this.$emit("on-ptz", true);
    },
    onController(event) {
      this.event.stopPropagation();
    },
    onMetadataArrived(v) {
      if (this.option.id == v.id) this.videoPlaying = true;
    },

    /**
     * 播放异常一般两种：无权限、网络异常(指后端srs服务连接异常)。
     * 但是这两种捕获的异常都是NetworkError，没法区分暂用无权限处理。
     * ping不通反到不会抛异常。
     * @returns {void}
     * @author liekkas
     * @date 2020-07-17
     */
    onError(v) {
      this.showNoPermission = true;
    },

    openDeviceInfoHandler(obj) {
      let resourceId = obj.data.id;
      let resourceClassId =
        obj.data.resource_class_id || obj.data.resourceClassId;
      window.open(
        `${location.protocol}//${location.hostname}:${location.port}/ibms#/resDetail?id=${resourceId}&&resClassId=${resourceClassId}`,
        "_blank"
      );
    },
    pingCamera(ip) {
      // this.$refs.pingTest.ping(ip);
    },
  },
  beforeDestroy() {
    this.destroyAll();
  },
};
</script>

<style lang="less" scoped>
@import "~@/styles/index.less";
.hyz-video {
  width: 100%;
  height: 100%;
  position: relative;
  color: #efefef;
}
.video-info {
  position: absolute;
  height: 100%;
  width: 100%;
  text-align: center;
  color: #fff;
  z-index: 10;
  display: flex;
  align-items: center;
  &-pane {
    margin: auto;
    display: flex;
    flex-direction: column;
  }
  &-item {
    cursor: auto;
    text-decoration: none;
    color: #0097a7;
    margin: 5px 0;
  }
  &-handle {
    cursor: pointer;
    cursor: hand;
    text-decoration: none;
    color: #0cbabd;
    margin: 5px 0;
  }
  &-btn {
    margin: 5px auto;
  }
  &-handle:hover {
    color: #0cbabd;
  }
}
.video-pop {
  position: absolute;
  bottom: 0;
  left: 0;
  z-index: 10;
  &-pane {
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    min-width: 100px;
    background: rgba(0, 0, 0, 0.2);
    padding: 4px 5px;
    &-item {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      font-size: 10px;
      color: rgba(239, 239, 239, 0.7);
      &-info {
        margin-left: 5px;
      }
    }
  }
}
.replay-player {
  width: 100%;
  height: 100%;
  overflow: hidden;
}
.video-ctl {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 200px;
  height: 100px;
  background: wheat;
  &:hover {
    background: green;
  }
}
.video-ctl-close {
  position: absolute;
  bottom: 40px;
  right: 0;
}

.video-status {
  position: absolute;
  right: 0;
  top: 0;
  padding: 4px 6px;
  user-select: none;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 8;
}
.cut-status {
  position: absolute;
  left: 0;
  top: 0;
  padding: 4px 6px;
  user-select: none;
  background-color: rgba(255, 0, 0, 0.8);
  z-index: 8;
}

.speed-item {
  padding: 4px 8px;
  cursor: pointer;
  &:hover {
    background: @primary-color;
  }
  &-selected {
    background: @primary-color;
  }
}

.video-time {
  font-weight: bold;
}

.progress-wrap {
  width: 100%;
  padding: 0;
  position: absolute;
  bottom: 36px;
  left: 0;
}
.progress-bar {
  width: 100%;
  height: 4px;
  background: rgba(255, 255, 255, 0.6);
  position: relative;
  cursor: pointer;
}
.current-bar {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 0;
  background: @primary-color;
  border-top-right-radius: 6px;
  border-bottom-right-radius: 6px;
  z-index: 5;
  cursor: pointer;
}
.progress-tooltip {
  position: absolute;
  left: 0;
  top: -30px;
  padding: 4px 8px;
  border-radius: 7px;
  background: rgba(0, 0, 0, 0.6);
}
.ping-box {
  cursor: pointer;
}
</style>
