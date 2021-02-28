<template>
  <div class="video-ctl-rb-real">
    <!-- live -->
    <div v-if="isLive">
      <Icon
        v-if="!isPlaying"
        class="video-ctl-btn"
        type="ios-play"
        :size="22"
        @click.stop="$emit('onPlay', 'live')"
      />
      <Icon
        v-else
        class="video-ctl-btn"
        type="ios-pause"
        :size="22"
        @click.stop="$emit('onPause', 'live')"
      />
      <Icon class="video-ctl-btn" type="md-refresh" :size="22" @click.stop="$emit('onRefresh')" />
      <Icon
        class="video-ctl-btn"
        :class="{ 'video-ctl-btn-selected': ctlPopTypeState === 'ptz' }"
        type="ios-apps"
        :size="22"
        v-show="isCanCloud"
        @click.stop="$emit('popTypeChanged', 'ptz')"
      />
    </div>

    <!-- playback -->
    <div style="display:flex; align-items: center;" v-else>
      <!--进度条-->
      <div class="progress-wrap">
        <ReplayProgress
          class="video-progress"
          min="0"
          max="100"
          :cacheTemp="bufferTemp"
          :currentTemp="videoTemp.currentTimeNum"
          :videoTemp="videoSrcsTemp"
          @progressPerOut="onProgressPer"
          :repId="pbId"
        ></ReplayProgress>
      </div>

      <Tooltip placement="top">
        <Button type="text" size="small" style="font-size:12px; color: #efefef;">
          倍速
          <span style="font-weight: bold;">{{ selectedSpeed }}</span>
        </Button>
        <div slot="content">
          <div
            class="speed-item"
            :class="{ 'speed-item-selected': speed == selectedSpeed }"
            v-for="speed in speeds"
            :key="speed"
            @click.stop="onSpeedChanged(speed)"
          >{{ speed }}</div>
        </div>
      </Tooltip>
      <div class="video-ctl-row">
        <Tooltip content="后退30秒">
          <Icon
            class="video-ctl-btn"
            type="ios-rewind"
            :size="22"
            @click.stop="$emit('backward', backwardNum)"
          />
        </Tooltip>
        <Icon
          v-if="!isPlaying"
          class="video-ctl-btn"
          type="ios-play"
          :size="22"
          @click.stop="$emit('onPlay', 'replay')"
        />
        <Icon
          v-else
          class="video-ctl-btn"
          type="ios-pause"
          :size="22"
          @click.stop="$emit('onPause', 'replay')"
        />
        <Tooltip content="快进30秒">
          <Icon
            class="video-ctl-btn"
            type="ios-fastforward"
            :size="22"
            @click.stop="$emit('forward', forwardNum)"
          />
        </Tooltip>
      </div>
      <div class="video-time">
        <span class="video-time-current">{{ curTimeStr }}</span>&nbsp;/
        <span class="video-time-total">{{ totalTimeStr }}</span>
      </div>
    </div>

    <!-- common -->
    <div>
      <Icon class="video-ctl-btn" type="md-camera" :size="22" @click.stop="$emit('onCapturePic')" />

      <Icon
        class="video-ctl-btn"
        :class="{ 'video-ctl-btn-selected': ctlPopTypeState === 'modeChange' }"
        type="ios-videocam"
        :size="22"
        title="回放/实时"
        @click.stop="$emit('popTypeChanged', 'modeChange')"
      />

      <Icon
        class="video-ctl-btn"
        :class="{ 'video-ctl-btn-selected': ctlPopTypeState === 'bookmark' }"
        type="md-bookmark"
        :size="22"
        title="书签"
        @click.stop="$emit('popTypeChanged', 'bookmark')"
      />

      <Icon
        class="video-ctl-btn"
        :class="{ 'video-ctl-btn-selected': ctlPopTypeState === 'cut' }"
        type="ios-cut"
        :size="22"
        title="剪辑"
        @click.stop="$emit('popTypeChanged', 'cut')"
      />

      <Icon
        class="video-ctl-btn"
        :class="{ 'video-ctl-btn-selected': ctlPopTypeState === 'settings' }"
        type="md-settings"
        :size="22"
        title="设置"
        @click.stop="$emit('popTypeChanged', 'settings')"
      />
      <Icon
        class="video-ctl-btn"
        type="md-expand"
        :size="22"
        @click.stop="$emit('toggleFullscreen')"
      />
    </div>
  </div>
</template>

<script>
import { secondToTime } from "@/utils/timeToString";
import ReplayProgress from "./RePlayProgress";

export default {
  name: "ProgressBar",
  components: {
    ReplayProgress
  },
  props: [
    "isLive",
    "isPlaying",
    "ctlPopType",
    "currentDuration",
    "bufferTemp",
    "videoSrcs",
    "pbId",
    "isCanCloud"
  ],
  data() {
    return {
      selectedSpeed: "1.0x",
      speeds: [
        "0.25x",
        "0.5x",
        "0.75x",
        "1.0x",
        "1.25x",
        "1.5x",
        "2.0x"
        // "5.0x",
        // "10.0x"
      ],
      onMouseTime: "00:00:00",
      tipTimeState: false,
      videoTemp: {
        cacheNum: 0,
        durationNum: 0,
        currentTimeNum: 0
      },
      curTimeStr: "00:00",
      totalTimeStr: "00:00",
      ctlPopTypeState: this.ctlPopType,
      videoSrcsTemp: undefined,
      forwardNum: 30,
      backwardNum: 30
    };
  },
  watch: {
    currentDuration(v) {
      if (v >= this.videoTemp.durationNum) v = this.videoTemp.durationNum;
      this.curTimeStr = secondToTime(v);
      this.videoTemp.currentTimeNum = v;
    },
    bufferTemp(v) {
      this.videoTemp.cacheNum = v;
    },
    videoSrcs(v) {
      this.videoSrcsTemp = v;
      this.videoTemp.durationNum = _.sumBy(v, "duration") / 1000;
      this.totalTimeStr = secondToTime(this.videoTemp.durationNum);
    },
    ctlPopType(v) {
      this.ctlPopTypeState = v;
    }
  },
  mounted() {},
  computed: {},
  methods: {
    onSpeedChanged(speed) {
      this.selectedSpeed = speed;
      speed = speed.substr(0, speed.length - 1);

      this.$emit("speedChanged", parseFloat(speed));
    },

    onProgressPer(data) {
      this.$emit("progressPerOut", data);
    }
  }
};
</script>

<style lang="less" scoped>
.play-progress {
  width: 100%;
  position: absolute;
  bottom: 0;
  height: 3px;
}
.video-progress {
  width: 100%;
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
