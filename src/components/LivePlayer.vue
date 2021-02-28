<template>
  <video
    @dblclick="$emit('on-dblclick')"
    :id="id"
    style="object-fit: fill; width: 100%; height: 100%"
    autoplay
    muted
  ></video>
</template>

<script>
// import flvjs from "flv.js";
import flvjs from "./flv/flv";
export default {
  name: "LivePlayer",
  props: {
    id: {
      type: String,
      default: ""
    },
    option: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      flvplayer: null,
      playerDom: null
    };
  },
  watch: {
    option(v) {
      this.init(this.option);
    }
  },
  mounted() {
    this.playerDom = document.getElementById(this.id);
    if (!_.isEmpty(this.option)) this.init(this.option);

    flvjs.LoggingControl.enableAll = false;
  },
  methods: {
    onRefresh() {
      this.init(this.option);
    },
    init(mediaDataSource) {
      if (this.flvplayer) {
        this.destroy();
      }

      this.flvplayer = flvjs.createPlayer(mediaDataSource, {
        enableStashBuffer: false,
        stashInitialSize: 16,
        headers: {
          // 如需授权，请修改这里
          
          // Authorization: "Bearer " + this.$ls.get("TOKEN")
        }
      });

      this.flvplayer.attachMediaElement(this.playerDom);
      this.flvplayer.load();
      this.flvplayer.play();
      const that = this;
      this.flvplayer.on("loading_complete", () => {
        // console.log("loading_complete");
      });
      this.flvplayer.on("metadata_arrived", () => {
        // console.log("metadata_arrived");
        that.$emit("on-metadata-arrived", that.option);
      });
      this.flvplayer.on("demux_error", () => {
        console.log("demux_error");
      });
      this.flvplayer.on("io_error", () => {
        console.log("io_error");
      });
      this.flvplayer.on("error", e => {
        //无权限时，报错e是NetworkError
        that.$emit("on-error", e);
        console.log("error", e);
      });
    },
    play() {
      this.flvplayer && this.flvplayer.play();
    },
    pause() {
      this.flvplayer && this.flvplayer.pause();
    },
    destroy() {
      if (!this.flvplayer) return;
      this.flvplayer.pause();
      this.flvplayer.unload();
      this.flvplayer.detachMediaElement();
      this.flvplayer.destroy();
      this.flvplayer = null;
    }
  }
};
</script>

<style></style>
