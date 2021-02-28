<template>
  <div>
    <!-- video status -->
    <div
      class="video-status"
      v-if="status"
      :style="{ background: status == '回放' ? '#f00' : 'rgba(0,0,0,0.5)' }"
      @click.stop
    >
      <h4>{{ status }}</h4>
    </div>

    <!-- cut status -->
    <div v-if="showCutStatus" class="cut-status">
      <h4 class="animated infinite flash">剪辑中...</h4>
    </div>

    <!-- controller -->
    <div class="video-ctl-rb" @dblclick.stop="() => {}">
      <transition
        name="flv-fade"
        enter-active-class="animated fadeIn"
        leave-active-class="animated fadeOut"
      >
        <ProgressBar
          v-show="showCtlBar"
          :isLive="isLiveState"
          :isPlaying="isPlayingState"
          :ctlPopType="ctlPopTypeState"
          @onPlay="onPlay"
          @onPause="onPause"
          @onRefresh="onRefresh"
          @popTypeChanged="popTypeChanged"
          @onCapturePic="onCapturePic"
          @toggleFullscreen="$emit('toggleFullscreen')"
          @modeChanged="$emit('modeChanged')"
          :currentDuration="currentTemp"
          :bufferTemp="bufferTotalTemp"
          :videoSrcs="videoSrcsTemp"
          @progressPerOut="onProgressPer"
          @forward="onForward"
          @backward="onBackward"
          @speedChanged="onSpeedChanged"
          :pbId="id"
          :isCanCloud="isCanCloud"
        />
      </transition>
    </div>

    <!-- 云台控制面板 -->
    <transition
      name="flv-fade"
      enter-active-class="animated fadeInLeft"
      leave-active-class="animated fadeOutLeft"
    >
      <div
        :class="{
          'video-control': !isFullScreen,
          'video-control-full': isFullScreen,
        }"
        v-if="ctlPopTypeState === 'ptz'"
      >
        <CloudTerraceGB28181 v-if="isGb28181" :camera="option.data" />
        <CloudTerrace v-else :camera="option.data" />
      </div>
    </transition>

    <!-- 回放面板 -->
    <transition
      name="flv-fade"
      enter-active-class="animated fadeInRight"
      leave-active-class="animated fadeOutRight"
    >
      <div
        class="video-bookmark"
        v-show="ctlPopTypeState === 'modeChange'"
        style="width: 210px"
      >
        <ReplaySettings
          ref="playbackSettings"
          :isScene="isScene"
          :option="option"
          :camera="option.data"
          :playLoadingState="loadingState"
          @modeChanged="modeChange"
          @fetch-files="onFetchFiles"
        ></ReplaySettings>
      </div>
    </transition>

    <!-- 书签面板 -->
    <transition
      name="flv-fade"
      enter-active-class="animated fadeInRight"
      leave-active-class="animated fadeOutRight"
    >
      <div
        class="video-bookmark"
        v-if="ctlPopTypeState === 'bookmark'"
        style="width: 280px"
      >
        <Bookmark
          :item="bookmark"
          @cancel-bookmark="ctlPopTypeState = ''"
          @save-bookmark="ctlPopTypeState = ''"
        ></Bookmark>
      </div>
    </transition>

    <!-- 剪辑面板 -->
    <transition
      name="flv-fade"
      enter-active-class="animated fadeInRight"
      leave-active-class="animated fadeOutRight"
    >
      <div
        class="video-bookmark"
        v-if="ctlPopTypeState === 'cut'"
        style="width: 310px"
      >
        <CutSettings
          v-if="isLive"
          :item="videoClip"
          @begin-cut="onBeginCut"
          @end-cut="showCutStatus = false"
          @cancel-videoClip="onCancelVideoClip"
          @save-videoClip="onSaveVideoClip"
        ></CutSettings>
        <CutSettingsReplay
          v-else
          :item="videoClip"
          :currentTemp="currentTemp"
          :videoSrcs="videoSrcsTemp"
          @begin-cut="onBeginCut"
          @end-cut="showCutStatus = false"
          @cancel-videoClip="onCancelVideoClip"
          @save-videoClip="onSaveVideoClip"
        ></CutSettingsReplay>
      </div>
    </transition>

    <!-- 设置面板 -->
    <transition
      name="flv-fade"
      enter-active-class="animated fadeInRight"
      leave-active-class="animated fadeOutRight"
    >
      <div
        class="video-bookmark"
        v-if="ctlPopTypeState === 'settings'"
        style="width: 450px"
      >
        <CameraSettings
          :item="option.data"
          @cancel="ctlPopTypeState = ''"
          @save="ctlPopTypeState = ''"
        ></CameraSettings>
      </div>
    </transition>
  </div>
</template>

<script>
import dayjs from "dayjs";
import Bookmark from "./settings/Bookmark";
import CameraSettings from "./settings/CameraSettings";
import ReplaySettings from "./settings/ReplaySettings";
import CutSettings from "./settings/CutSettings";
import CutSettingsReplay from "./settings/CutSettingsReplay";

import ProgressBar from "./comps/ProgressBar";

export default {
  props: [
    "showCtlBar",
    "isScene",
    "isLive",
    "isPlaying",
    "ctlPopType",
    "option",
    "id",
    "reqTransCodeIn",
    "currDuration",
    "bufferDuration",
    "bufferTemp",
    "videoTemp",
    "loadingState",
    "isFullScreen",
    "isCanCloud",
    "timeData",
  ],
  components: {
    CloudTerrace: () => import("./settings/CloudTerrace"),
    CloudTerraceGB28181: () => import("./settings/CloudTerraceGB28181"),
    Bookmark,
    CameraSettings,
    ReplaySettings,
    CutSettings,
    CutSettingsReplay,
    ProgressBar,
  },
  data() {
    return {
      isLiveState: this.isLive,
      isPlayingState: this.isPlaying,

      isGb28181: this.$config.isCloudTerraceGB28181,

      //控制栏弹出框类型
      ctlPopTypeState: "",

      //控制条是否显示
      showVideoCtlBar: false,

      bookmark: undefined,

      bookmarks: [],

      //剪辑
      showCutStatus: false,
      cutStatus: "",
      videoClip: {},
      hideLoadingMask: true,
      playOption: undefined,
      reqTransCode: undefined,
      currentTemp: undefined,
      bufferTotalTemp: undefined,
      videoSrcsTemp: undefined,
    };
  },
  mounted() {
    document.addEventListener("visibilitychange", this.onVisibilitychange);

    this.playerDom = document.getElementById(this.id);
    this.ctlPopTypeState = this.ctlPopType;
  },
  computed: {
    status() {
      let result = "";
      if (this.isLive) {
        if (!this.isPlaying) {
          result = "暂停";
        }
      } else {
        result = "回放";
      }
      return result;
    },
  },
  watch: {
    option(v) {
      // console.log(v);
    },
    isLive(v) {
      this.isLiveState = v;
      if (v) this.clearState();
    },
    isPlaying(v) {
      this.isPlayingState = v;
    },
    reqTransCodeIn(v) {
      this.reqTransCode = v;
    },
    currDuration(v) {
      this.currentTemp = v;
    },
    bufferTemp(v) {
      this.bufferTotalTemp = v;
    },
    videoTemp(v) {
      this.videoSrcsTemp = v;
    },
    isFullScreen(v) {
      if (!v) {
        this.ctlPopType = "";
        this.showVideoCtlBar = false;
      }
    },
  },
  methods: {
    onPlay(data) {
      this.$emit("playPauseChanged", { type: data, state: true });
    },
    onPause(data) {
      this.$emit("playPauseChanged", { type: data, state: false });
    },
    onRefresh() {
      this.$emit("refreshNow");
    },
    onForward(data) {
      this.$emit("forward", data);
    },
    onBackward(data) {
      this.$emit("backward", data);
    },
    onSpeedChanged(data) {
      this.$emit("speedChanged", data);
    },
    modeChange(type) {
      this.ctlPopTypeState = "";
      return this.$emit("modeChanged", type);
    },

    onProgressPer(data) {
      return this.$emit("progressPerOut", data);
    },
    //响应控制条的弹出框事件
    popTypeChanged(type) {
      // console.log(type);
      this.ctlPopTypeState = this.ctlPopTypeState === type ? "" : type;
      this.$emit("on-ctl-pop", type, this.ctlPopTypeState);

      switch (this.ctlPopTypeState) {
        case "bookmark":
          this.addBookmark();
          break;
        case "cut":
          this.addVideoCut();
          break;
        case "modeChange":
          break;
        case "ptz":
          break;
        default:
          this.showCutSettings = this.showSettings = this.showPlaybackSettings = this.showBookmark = false;
          break;
      }
    },
    //截图
    onCapturePic() {
      let elem = document.getElementById(this.id);
      const rect = elem.getBoundingClientRect();
      const canvas = document.createElement("canvas");
      canvas.width = rect.width;
      canvas.height = rect.height;
      canvas
        .getContext("2d")
        .drawImage(elem, 0, 0, canvas.width, canvas.height);
      const name =
        _.get(this.option, "data.name", "未命名") +
        "_" +
        dayjs(new Date()).format("YYYYMMDDHHmmss");
      let dataURL;
      return canvas.toBlob((blob) => {
        dataURL = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = dataURL;
        link.download = name + "_截图.png";
        link.style.display = "none";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(dataURL);
      });
    },
    //添加书签
    addBookmark() {
      const time = dayjs(new Date()).format("YYYY-MM-DD HH:mm:ss");
      const name = _.get(this.option, "data.name", "未命名摄像头");
      if (this.isLiveState)
        return (this.bookmark = {
          bookTime: time,
          cameraId: this.option.id,
          cameraName: name,
          name: name + "_" + time + "_书签",
          description: "",
        });

      console.log("replay ->", this.currentTemp, this.timeData);

      let backTime = "";
      backTime = _.get(
        this.timeData,
        "startTime",
        dayjs(new Date()).format("YYYY-MM-DD HH:mm:ss")
      );
      if (this.currentTemp && this.currentTemp != undefined)
        backTime = dayjs(backTime)
          .add(this.currentTemp, "second")
          // .add(parseInt(this.currentTemp), "second")
          .format("YYYY-MM-DD HH:mm:ss");

      return (this.bookmark = {
        bookTime: backTime,
        cameraId: this.option.id,
        cameraName: name,
        name: name + "_" + backTime + "_书签",
        description: "",
      });
    },

    onBeginCut() {
      if (!this.isLive) {
        this.onPlay("replay");
        this.addVideoCutReplay();
      }

      return (this.showCutStatus = true);
    },

    addVideoCut() {
      this.showSettings = this.showPlaybackSettings = this.showBookmark = false;

      this.showCutSettings = !this.showCutSettings;
      if (this.showCutSettings) {
        const time = dayjs(new Date()).format("YYYYMMDDHHmmss");
        const name = _.get(this.option, "data.name", "未命名摄像头");
        return (this.videoClip = {
          cameraId: this.option.id,
          cameraUniqueKey: this.option.data.uniqueKey,
          srsUniqueKey: this.option.data.srsServerName,
          cameraName: name,
          name: name + "_" + time + "_剪辑",
          clipTime: "",
          description: "",
          status: 0,
        });
      } else {
        return (this.videoClip = {});
      }
    },
    addVideoCutReplay() {
      this.showSettings = this.showPlaybackSettings = this.showBookmark = false;

      this.showCutSettings = !this.showCutSettings;
      // if (this.showCutSettings) {
      const time = dayjs(new Date()).format("YYYYMMDDHHmmss");
      const name = _.get(this.option, "data.name", "未命名摄像头");
      return (this.videoClip = {
        cameraId: this.option.id,
        cameraUniqueKey: this.option.data.uniqueKey,
        srsUniqueKey: this.option.data.srsServerName,
        cameraName: name,
        name: name + "_" + time + "_剪辑",
        clipTime: "",
        description: "",
        status: 0,
      });
      // } else {
      //   return (this.videoClip = {});
      // }
    },

    //触发反向回放
    onReplayBack(startTimeStr, endTimeStr) {
      return this.$refs.playbackSettings.scenePlayback(
        startTimeStr,
        endTimeStr
      );
    },

    onFetchFiles({ startTime, endTime }) {
      this.$emit("fetch-files", { startTime, endTime });
    },

    onSaveVideoClip() {
      this.ctlPopTypeState = "";
      this.showCutSettings = !this.showCutSettings;

      if (!this.isLive) this.addVideoCutReplay();
    },
    onCancelVideoClip() {
      this.showCutStatus = false;
      this.showCutSettings = !this.showCutSettings;
      this.ctlPopTypeState = "";
    },
    clearState() {
      this.bufferTotalTemp = undefined;
      this.currentTemp = 0;
      this.videoSrcsTemp = undefined;
    },
  },
};
</script>

<style lang="less" scoped>
.video-ctl-rb {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 100%;
  height: 36px;
  z-index: 1000;
  &-real {
    display: flex;
    height: 100%;
    justify-content: space-between;
    padding: 8px;
    background-color: rgba(0, 0, 0, 0.2);
  }
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
.video-bookmark {
  position: absolute;
  right: 0;
  bottom: 40px;
  background-color: rgba(68, 68, 68, 0.8);
  z-index: 800;
}
.video-control {
  position: absolute;
  width: 240px;
  height: 100%;
  background-color: rgba(68, 68, 68, 0.4);
  top: 0;
  // left: 0;
  left: -230px;
  bottom: 0;
  overflow: auto;
}
.video-control-full {
  position: absolute;
  width: 240px;
  height: 100%;
  background-color: rgba(68, 68, 68, 0.4);
  top: 0;
  left: 0;
  bottom: 0;
  overflow: auto;
  z-index: 999;
}
.video-control::-webkit-scrollbar {
  width: 8px;
  height: 10px;
  background-color: #f5f5f5;
}
.video-control::-webkit-scrollbar-track {
  border-radius: 10px;
  background-color: #f5f5f5;
}
.video-control::-webkit-scrollbar-thumb {
  border-radius: 10px;
  background-color: rgb(173, 173, 173);
}

.speed-item {
  padding: 4px 8px;
  cursor: pointer;
  &:hover {
    background: #0cbabd;
  }
  &-selected {
    background: #0cbabd;
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
  background: #0cbabd;
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
</style>
