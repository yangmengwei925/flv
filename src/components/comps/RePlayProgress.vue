<template>
  <div class="slider" ref="slider" @click.stop="startCurrDown">
    <div class="cache-progress" ref="cachepro"></div>
    <div class="curr-progress" :style="{ width }">
      <div class="thunk-mark" v-for="(itpos,key) in mkPosArr" :key="key" :style="{ left:itpos }">
        <div class="thunk-mark-block"></div>
      </div>
      <div class="thunk" ref="trunk" :style="{ left }">
        <div class="block"></div>
      </div>
    </div>
    <span class="tipspro" id="tipspro" ref="tipspro" v-show="onProgressTip">
      {{
      timeTxt
      }}
    </span>
  </div>
</template>
<script>
import dayjs from "dayjs";
export default {
  name: "ReplayProgress",
  props: [
    "min",
    "max",
    "progressPer",
    "cacheTemp",
    "currentTemp",
    "videoTemp",
    "repId"
  ],
  data() {
    return {
      slider: null, //滚动条DOM元素
      thunk: null, //拖拽DOM元素,
      cachePro: null,
      per: 0, //当前值
      onProgressTip: false,
      timeTxt: "00:00",
      totalDuration: 0,
      videoSrcs: undefined,
      beginTime: 0,
      mkPosArr: []
    };
  },
  watch: {
    cacheTemp(v) {
      this.cachePro.style.width =
        (parseFloat(v) / parseFloat(this.totalDuration)) * 100 + "%";
    },
    currentTemp(v) {
      if (v >= this.totalDuration) v = this.totalDuration;
      this.per = (v / this.totalDuration) * 100;
    },
    videoTemp(v) {
      this.totalDuration = _.sumBy(v, "duration") / 1000;
      this.videoSrcs = v;
      this.beginTime = v[0].begintime;

      this.fetchMark(v[0].begintime, v[v.length - 1].endtime);
    }
  },
  //渲染到页面的时候
  mounted() {
    this.slider = this.$refs.slider;
    this.thunk = this.$refs.trunk;
    this.tipspro = this.$refs.tipspro;
    this.cachePro = this.$refs.cachepro;

    var _this = this;
    //拖动进度条
    this.thunk.onmousedown = function(e) {
      var width = parseInt(_this.width);
      var disX = e.clientX;
      document.onmousemove = function(e) {
        // 拖拽的时候获取的新width
        var newWidth = e.clientX - disX + width;
        // 拖拽的时候得到新的百分比
        var scale = newWidth / _this.slider.offsetWidth;
        _this.per = Math.ceil((_this.max - _this.min) * scale + _this.min);
        _this.per = Math.max(_this.per, _this.min);
        _this.per = Math.min(_this.per, _this.max);

        _this.$emit("progressPerOut", scale);
      };
      document.onmouseup = function() {
        document.onmousemove = document.onmouseup = null;
      };
      return false;
    };

    this.slider.onmouseover = function(e) {
      _this.posMoveMouse(e);
    };
    this.slider.onmousemove = function(e) {
      _this.posMoveMouse(e);
    };
    this.slider.onmouseleave = function() {
      _this.onProgressTip = false;
      document.onmousemove = document.onmouseup = null;
    };
  },
  computed: {
    scale() {
      return (this.per - this.min) / (this.max - this.min);
    },
    width() {
      if (this.slider) {
        return this.slider.offsetWidth * this.scale + "px";
      } else {
        return 0 + "px";
      }
    },
    left() {
      if (this.slider) {
        return (
          this.slider.offsetWidth * this.scale -
          this.thunk.offsetWidth / 2 +
          "px"
        );
      } else {
        return 0 + "px";
      }
    }
  },
  methods: {
    posMoveMouse(e) {
      this.onProgressTip = true;

      var maxLeft = this.slider.offsetWidth;
      var minLeft = 120;
      var disX = e.clientX;
      var tipsPos = 0;

      if (disX >= maxLeft) {
        tipsPos = maxLeft - 80 + "px";
      } else if (disX <= minLeft) {
        tipsPos = "10px";
      } else {
        tipsPos = disX - 250 + "px";
      }

      if (this.beginTime)
        this.timeTxt = dayjs(this.beginTime)
          .add(this.scaleSub(e) * this.totalDuration, "seconds")
          .format("HH:mm:ss");

      return (this.tipspro.style.left = tipsPos);
    },
    startCurrDown(e) {
      let scale = this.scaleSub(e);
      this.$emit("progressPerOut", scale);

      if (scale >= 1) return (this.per = 100);

      return (this.per = scale * 100);
    },
    scaleSub(e) {
      var mouseX = event.clientX + document.body.scrollLeft;
      var objX =
        mouseX -
        document.getElementById(this.repId + "root").getBoundingClientRect().x;

      return objX / this.slider.offsetWidth;
    },
    fetchMark(starttime, endtime) {
      this.$http({
        method: "POST",
        url: "ivmp/bookmark/list",
        data: {
          searchParas: {
            conditions: [
              {
                name: "bookTime",
                op: "ge",
                type: "date",
                value: dayjs(starttime).format("YYYY-MM-DD HH:mm:ss")
              },
              {
                name: "bookTime",
                op: "le",
                type: "date",
                value: dayjs(endtime).format("YYYY-MM-DD HH:mm:ss")
              }
            ],
            logic: "and"
          }
        }
      }).then(result => {
        let res = result.list.reverse();

        this.mkPosArr = [];
        res.forEach(ele => {
          let scp =
            (dayjs(ele.bookTime) - dayjs(starttime)) /
            (dayjs(endtime) - dayjs(starttime));

          let tmp = this.slider.offsetWidth * scp - 2 + "px";
          this.mkPosArr.push(tmp);
        });
      });
    }
  }
};
</script>
<style scoped>
.box {
  width: 100%;
}
.clear:after {
  content: "";
  display: block;
  clear: both;
}
.slider {
  position: relative;
  width: 100%;
  height: 3px;
  background: rgba(0, 0, 0, 0.5);
  cursor: pointer;
}
.cache-progress {
  position: absolute;
  width: 0%;
  height: 3px;
  z-index: 8;
  background: rgba(255, 255, 255, 0.6);
}
.slider .curr-progress {
  position: absolute;
  left: 0;
  top: 0;
  width: 112px;
  height: 3px;
  z-index: 10;
  background: rgb(20, 171, 241);
}
.slider .thunk {
  position: absolute;
  left: 100px;
  top: -4px;
  width: 10px;
  height: 10px;
}
.slider .thunk-mark {
  position: absolute;
  left: 100px;
  /* top: -2px; */
  width: 4px;
  height: 4px;
}
.thunk-mark-block {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  opacity: 0.6;
  background: rgb(241, 164, 20);
  transition: 0.2s all;
}

.slider .block {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: rgb(20, 171, 241);
  transition: 0.2s all;
}
.slider .block:hover {
  transform: scale(1.1);
  opacity: 0.6;
}
.slider .tipspro {
  position: absolute;
  left: 20px;
  bottom: 30px;
  min-width: 15px;
  text-align: center;
  padding: 4px 8px;
  background: #000;
  border-radius: 5px;
  height: 24px;
  color: #fff;
}
.slider .tipspro i {
  position: absolute;
  margin-left: -5px;
  left: 50%;
  bottom: -9px;
  font-size: 16px;
  color: #000;
}
</style>
