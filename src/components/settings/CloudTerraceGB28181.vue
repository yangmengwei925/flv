<template>
  <div class="cloudTerrace" id="cloudTerrace" @dblclick.stop="onController($event)">
    <Divider style="color:#efefef">云台</Divider>
    <div class="frames">
      <ul class="flex">
        <li
          v-for="index in 9"
          :key="index"
          @mousedown.stop="move($event, typeData[index - 1])"
          @mouseup.stop="stop"
          :draggable="false"
        >
          <img
            :style="
              index === 6 || index === 7 ? `transform:rotate(180deg)` : ''
            "
            width="25px"
            height="100%"
            :draggable="false"
            :src="`static/imgs/controller/direction${index}.svg`"
          />
        </li>
      </ul>
      <div class="yuntaiRight">
        <div class="zoom" :draggable="false">
          <Tooltip class="toolTip" content="调焦-" placement="top" :draggable="false">
            <img
              class="images"
              :draggable="false"
              width="25px"
              height="25px"
              @mousedown.stop="move($event, 'zoomIn')"
              @mouseup.stop="stop"
              src="static/imgs/controller/zoom-.svg"
            />
          </Tooltip>

          <Divider type="vertical" style="height:97%;margin-top:2px;" :draggable="false" />

          <Tooltip class="toolTip" :tranfer="true" content="调焦+" placement="top" :draggable="false">
            <img
              width="25px"
              :draggable="false"
              height="25px"
              @mousedown.stop="move($event, 'zoomOut')"
              @mouseup.stop="stop"
              src="static/imgs/controller/zoom+.svg"
            />
          </Tooltip>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  props: ["camera"],
  data() {
    return {
      speed: 137,
      typeData: [
        "leftTop",
        "top",
        "rightTop",
        "left",
        "",
        "right",
        "leftBottom",
        "bottom",
        "rightBottom"
      ]
    };
  },

  methods: {
    onController(event) {
      event.stopPropagation();
    },
    move(e, type) {
      e.currentTarget.style.backgroundColor = "#ccc";
      this.$http({
        method: "post",
        url:
          this.$config.url +
          "/" +
          this.camera.srsUniqueKey +
          "/agent/api/v1/camptz",
        data: {
          camUk: this.camera.uniqueKey,
          cmd: type
        },
        showSpin: false
      }).then();
    },
    stop(e) {
      e.currentTarget.style.backgroundColor = "#222";
    }
  }
};
</script>
<style lang="less" scoped>
.cloudTerrace {
}
.slide {
  margin: 2vw 0.4vw;
}
.tabs {
  margin: 0.3vw;
}
.controllerPad {
  display: flex;
  justify-content: space-around;
  background-color: #222;
  box-shadow: 2px 2px 2px #000;
  border-radius: 5px;
  margin: 3px;
  margin-bottom: 25px;
  height: 36px;
  padding-top: 5px;
  padding-bottom: 2px;
  width: 90%;
  margin-left: 5%;
}
.toolTip {
  display: flex;
  align-items: center;
}
.zoom {
  display: flex;
  justify-content: center;
  background-color: #222;
  box-shadow: 2px 2px 2px #000;
  border-radius: 5px;
  width: 80px;
  margin: 2px;
  height: 36px;
  padding-top: 3px;
  //margin-left: 0.4vw;
}
.images {
  z-index: 10;
  user-select: none;
}
.frames {
  display: flex;
  justify-content: center;
}
.flex {
  margin-left: 10px;
  display: flex;
  //width: 27px;
  height: 100px;
  //margin: 50px;
  flex-wrap: wrap;
  /*align-content: flex-start;      */
  box-sizing: border-box;
}
.flex > li {
  box-sizing: border-box;
  height: 36px;
  width: 36px;
  margin: 2px;
  text-align: center;
  list-style: none;
  background-color: #222;
  box-shadow: 2px 2px 2px #000;
  user-select: none;
  //border: 0.5px solid rgb(140, 140, 214);
  border-radius: 5px;
}

.flex > li:hover {
  border-color: red;
  position: relative;

  /*z-index:2;*/
}
flex > li:pressed {
  background-color: red;
}
.yuntaiRight {
  display: flex;
  //margin-top: 1px;
  //width: 27px;
  /*height: 300px;*/
  //margin: 50px;
  flex-wrap: wrap;
}
.presets {
  padding: 10px;
  margin-top: -18px;
  border: 1px solid #bbb;
  height: 54vh;
  overflow: auto;
  .preset {
    line-height: 20px;
    display: flex;
    justify-content: space-around;
    border-bottom: 0.5px solid #5cd;
    height: 30px;
    padding-top: 10px;
    .presetName {
      padding-left: 15px;
      font-size: 1.4vh;
      color: #eee;
      width: 60%;
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
    }
    .presetIcon {
      font-size: 16px;
      color: #eee;
      width: 20%;
      cursor: pointer;
    }
  }
}
</style>
