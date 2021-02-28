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
              @mousedown.stop="move($event, 'zoomOn-')"
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
              @mousedown.stop="move($event, 'zoomOn+')"
              @mouseup.stop="stop"
              src="static/imgs/controller/zoom+.svg"
            />
          </Tooltip>
        </div>
        <div class="zoom">
          <Tooltip class="toolTip" :tranfer="true" content="光圈-" placement="top" :draggable="false">
            <img
              width="25px"
              :draggable="false"
              height="25px"
              src="static/imgs/controller/aperture-.svg"
            />
          </Tooltip>
          <Divider type="vertical" style="height:97%;margin-top:2px;" :draggable="false" />
          <Tooltip class="toolTip" :tranfer="true" content="光圈+" placement="top" :draggable="false">
            <img
              width="25px"
              :draggable="false"
              height="25px"
              src="static/imgs/controller/aperture+.svg"
            />
          </Tooltip>
        </div>
        <div class="zoom">
          <Tooltip class="toolTip" :tranfer="true" content="聚焦-" placement="top" :draggable="false">
            <img
              width="25px"
              :draggable="false"
              height="25px"
              src="static/imgs/controller/focus-.svg"
              @mousedown.stop="focusOn($event, 'focusOn+')"
              @mouseup.stop="stopFocusOn"
            />
          </Tooltip>
          <Divider type="vertical" style="height:97%;margin-top:2px;" :draggable="false" />
          <Tooltip class="toolTip" :tranfer="true" content="聚焦+" placement="top" :draggable="false">
            <img
              width="25px"
              :draggable="false"
              height="25px"
              src="static/imgs/controller/focus+.svg"
              @mousedown.stop="focusOn($event, 'focusOn-')"
              @mouseup.stop="stopFocusOn"
            />
          </Tooltip>
        </div>
      </div>
    </div>
    <div class="slide" style="width:90%;marginLeft:5%;">
      <Slider v-model="value1" :max="10" :show-input="true"></Slider>
    </div>
    <div class="controllerPad">
      <Tooltip class="toolTip" :tranfer="true" content="灯光" placement="top">
        <img
          style="marginLeft:0.5vw"
          width="25px"
          height="25px"
          src="static/imgs/controller/灯光.svg"
          :draggable="false"
        />
      </Tooltip>
      <Divider type="vertical" style="height:95%;margin-top:3px;" />
      <Tooltip class="toolTip" :tranfer="true" content="雨刷" placement="top">
        <img width="25px" :draggable="false" height="25px" src="static/imgs/controller/雨刷.svg" />
      </Tooltip>
      <Divider type="vertical" style="height:95%;margin-top:3px;" />
      <Tooltip class="toolTip" :tranfer="true" content="镜头翻转" placement="top">
        <img width="25px" :draggable="false" height="25px" src="static/imgs/controller/镜头翻转.svg" />
      </Tooltip>
      <Divider type="vertical" style="height:95%;margin-top:3px;" />
      <Tooltip class="toolTip" :draggable="false" :tranfer="true" content="辅助焦距" placement="top">
        <img width="25px" height="25px" src="static/imgs/controller/焦距.svg" />
      </Tooltip>
      <Divider type="vertical" style="height:95%;margin-top:3px;" />
      <Tooltip class="toolTip" :tranfer="true" content="定位" placement="top">
        <img
          style="marginRight:0.5vw"
          width="25px"
          height="25px"
          :draggable="false"
          src="static/imgs/controller/定位.svg"
        />
      </Tooltip>
    </div>
    <div class="tabs">
      <Tabs type="card" style="width:90%;marginLeft:5%;">
        <TabPane label="预置位" icon="md-flag">
          <div class="presets">
            <div class="preset" v-for="(item, index) in presetsList" :key="index">
              <div class="presetName">{{ item.label }}</div>
              <Icon class="presetIcon" type="ios-redo" @click.stop="gotoPreset(item.name)" />
              <Icon class="presetIcon" type="ios-settings" @click.stop="setPreset(item.name)" />
              <Icon class="presetIcon" type="ios-trash" @click.stop="removePreset(item.name)" />
            </div>
          </div>
        </TabPane>
        <TabPane label="巡航" icon="md-ionic">标签二的内容</TabPane>
      </Tabs>
    </div>
  </div>
</template>
<script>
// import API from "@/api";
// import { REST_API } from "@/config";
export default {
  props: ["camera"],
  data() {
    return {
      value1: 7,
      presets: undefined,
      typeData: [
        "leftUp",
        "up",
        "rightUp",
        "left",
        "",
        "right",
        "leftDown",
        "down",
        "rightDown"
      ],
      presets: [],
      presetsList: [],
      ptzMoveCmd: undefined,
      stopPtzMoveCmd: undefined,
      stopFocusMoveCmd: undefined,
      stopFocusMoveCmd: undefined,
      gotoPresetCmd: undefined,
      removePresetCmd: undefined,
      setPresetCmd: undefined
    };
  },

  mounted() {
    let resClassId =
      _.get(this.camera, "resource_class_id", "") ||
      _.get(this.camera, "resourceClassId", "");
    if (resClassId) this.fetchResource(resClassId);
  },
  methods: {
    onController(event) {
      event.stopPropagation();
    },
    getCmd() {
      if (!_.isEmpty(this.camera) && !_.isEmpty(this.camera.commandList)) {
        this.camera.commandList.map(obj => {
          if (obj.enName === "ptzMove") {
            this.ptzMoveCmd = obj;
          }
          if (obj.enName === "stopPTZMove") {
            this.stopPtzMoveCmd = obj;
          }
          if (obj.enName === "focusMove") {
            this.focusMoveCmd = obj;
          }
          if (obj.enName === "stopFocusMove") {
            this.stopFocusMoveCmd = obj;
          }
          if (obj.enName === "getPresets") {
            this.getPresets(obj);
          }
          if (obj.enName === "gotoPreset") {
            this.gotoPresetCmd = obj;
          }
          if (obj.enName === "removePreset") {
            this.removePresetCmd = obj;
          }
          if (obj.enName === "setPreset") {
            this.setPresetCmd = obj;
          }
          if (obj.enName === "connectCamera") {
            this.connectCamera(obj);
          }
        });
      } else {
        this.$Message.warning("摄像机云台控制列表获取失败");
      }
    },
    fetchResource(v) {
      this.$http({
        method: "POST",
        url: "resource/v1/resource/commandTemplates/list",
        data: {
          searchParas: {
            conditions: [
              {
                name: "resourceClassId",
                op: "eq",
                value: v
              }
            ]
          }
        }
      })
        .then(res => {
          this.camera.commandList = res.list;
          if (!_.isEmpty(res.list)) this.getCmd();
        })
        .catch(() => {
          this.$Message.error("获取云台控制信息失败");
        });
    },
    connectCamera(obj) {
      const data = {};
      obj.commandTemplateParamList.map(item => {
        // console.log("item", item);
        data[item.enName] = this.camera[item.enName];
      });
      if (!_.isEmpty(data))
        this.$http({
          method: "POST",
          url: `${this.$config.http.baseURL}${obj.command}`,
          data: data,
          showSpin: false
        }).then();
    },
    getPresets(obj) {
      const data = {};
      obj.commandTemplateParamList.map(item => {
        data[item.enName] = this.camera[item.enName];
      });
      if (!_.isEmpty(data))
        this.$http({
          method: "POST",
          url: `${this.$config.http.baseURL}${obj.command}`,
          data: data,
          showSpin: false
        }).then(result => {
          console.log(result);
          this.presets = result;
          this.presetsList = [];
          //console.log("this.presets :", v);
          for (let index = 1; index < 256; index++) {
            this.presetsList.push({
              label: index + "号预置位",
              name: index + ""
            });
          }
        });
    },
    focusOn(e, type) {
      if (this.focusMoveCmd) {
        e.currentTarget.style.backgroundColor = "#ccc";
        //this.$emit("focusOnfather", { type: type, speed: this.value1 / 10 });
        const v = { type: type, speed: this.value1 / 10 };
        const data = {};
        this.focusMoveCmd.commandTemplateParamList.map(item => {
          data[item.enName] = this.camera[item.enName];
          data.operationType = v.type;
          data.speed = v.speed;
        });
        this.$http({
          method: "POST",
          url: `${this.$config.http.baseURL}${this.focusMoveCmd.command}`,
          data: data,
          showSpin: false
        }).then();
      }
    },
    stopFocusOn(e) {
      if (this.stopFocusMoveCmd) {
        e.currentTarget.style.backgroundColor = "#222";
        const data = {};
        this.stopFocusMoveCmd.commandTemplateParamList.map(item => {
          data[item.enName] = this.camera[item.enName];
        });
        this.$http({
          method: "POST",
          url: `${this.$config.http.baseURL}${this.stopFocusMoveCmd.command}`,
          data: data,
          showSpin: false
        }).then();
      } else {
        this.$Message.warning("无停止聚焦指令");
      }
    },
    move(e, type) {
      if (this.ptzMoveCmd) {
        e.currentTarget.style.backgroundColor = "#ccc";
        const v = { type: type, speed: this.value1 / 10 };
        const data = {};
        // cmdParamDefineList
        // cmdInterface
        this.ptzMoveCmd.commandTemplateParamList.map(item => {
          data[item.enName] = this.camera[item.enName];
          data.operationType = v.type;
          data.speed = v.speed;
        });
        this.$http({
          method: "POST",
          url: `${this.$config.http.baseURL}${this.ptzMoveCmd.command}`,
          data: data,
          showSpin: false
        }).then();
      } else {
        this.$Message.warning("无移动指令");
      }
    },
    stop(e) {
      if (this.stopPtzMoveCmd) {
        e.currentTarget.style.backgroundColor = "#222";
        const data = {};
        this.stopPtzMoveCmd.commandTemplateParamList.map(item => {
          data[item.enName] = this.camera[item.enName];
        });
        this.$http({
          method: "POST",
          url: `${this.$config.http.baseURL}${this.stopPtzMoveCmd.command}`,
          data: data,
          showSpin: false
        }).then();
      } else {
        this.$Message.warning("无停止指令");
      }
    },
    gotoPreset(preset) {
      if (this.gotoPresetCmd) {
        //this.$emit("gotoPresetfather", { preset: preset });
        const data = {};
        this.gotoPresetCmd.commandTemplateParamList.map(item => {
          data[item.enName] = this.camera[item.enName];
        });
        data.name = preset;
        this.$http({
          method: "POST",
          url: `${this.$config.http.baseURL}${this.gotoPresetCmd.command}`,
          data: data,
          showSpin: false
        }).then(result => {
          // console.log("gotoPresetCmd", result);
        });
      } else {
        this.$Message.warning("无移动指令");
      }
    },
    setPreset(preset) {
      if (this.setPresetCmd) {
        const data = {};
        this.setPresetCmd.commandTemplateParamList.map(item => {
          data[item.enName] = this.camera[item.enName];
        });
        data.name = preset;
        this.$http({
          method: "POST",
          url: `${this.$config.http.baseURL}${this.setPresetCmd.command}`,
          data: data,
          showSpin: false
        }).then(result => {
          // console.log("setPresetCmd", result);
        });
      }
    },
    removePreset(preset) {
      if (this.removePresetCmd) {
        const data = {};
        this.removePresetCmd.commandTemplateParamList.map(item => {
          data[item.enName] = this.camera[item.enName];
        });
        data.name = preset;
        this.$http({
          method: "POST",
          url: `${this.$config.http.baseURL}${this.removePresetCmd.command}`,
          data: data,
          showSpin: false
        }).then(result => {
          // console.log("removePresetCmd", result);
        });
      }
    }
  }
};
</script>
<style lang="less" scoped>
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
