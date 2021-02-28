<template>
  <div class="ping-test">
    <Modal v-model="isShow" title="连接测试结果" :footer-hide="true" :draggable="true" class-name="ping-test-modal">
        <div v-html="content"></div>
    </Modal>
  </div>
</template>
<script>
/**
 * ##ping测试##
 * **Props**
 * 
 * **API**
 *  + ping; 开始ping
 * 
 * **Event**

 * @author Chorin <xiaolinxuan@foxmail.com>
 * @date 2019-10-30
 */
import PingConfigBase from './PingConfigBase';
import DataCook from "@/utils/data-cook";
export default {
  name: "PingTest",
  data(){
    return {
      pingConfigBase: new PingConfigBase(this),
      isShow: false,
      content: "",
    }
  },
  methods:{

    /**
     * 进行ping测试
     * @param {Object|String} options 选项，参数为string时直接作为ip进行ping, 只支持单个多个ip和网段、 参数为object时候，根据config进行ping
     * @param {Object} options.config 配置信息对象
     * @param {Number} options.config.interval ping的时间间隔
     * @param {String} options.config.ips ip列表
     * @param {String} options.config.number  每次对每个设备ping的次数
     * @param {String} options.config.type 类型 1=网段 2=多个IP 3=起始IP
     * @returns {void}
     * @author Chorin <xiaolinxuan@foxmail.com>
     * @date 2019-10-30
     */
    ping(options){

      let paramType = DataCook.type(options);
      let config  = {};
      if(paramType === "string"){
        config["ips"]  = options;
        config["type"] = this.isNetworkSegment(options)? "1": "2";

      }else if (paramType == "object"){
        config = options.config || {};
      }

      config = Object.assign({
        type: "2",
        number: 4,
        interval: 0,
        ips: "",
      },config);
      this.openModal("测试中...");
      this.pingConfigBase
        .batchPingTest([config])
        .then((pingResult)=>{
          let result = pingResult[0];
          result = result.replace(/(\r\n|\n|\r)/g,"<br/>");
          this.content = `<div style="max-height: 300px;overflow: scroll;overflow-x: hidden;">${result}</div>`;
        });
    },

    /**
     * 打开对话框
     * @returns {void}
     * @author Chorin <xiaolinxuan@foxmail.com>
     * @date 2019-10-30
     */
    openModal(message){
      this.isShow = true;
      this.content = message;
    },

    /**
     * 判断IP是否是网段
     * ///简单判断一下
     * @returns {void}
     * @author Chorin <xiaolinxuan@foxmail.com>
     * @date 2019-10-30
     */
    isNetworkSegment(ip){
      return ip.indexOf("/") == -1? false: true;
    },
  }
}
</script>
<style lang="less" scoped>
.ping-test{

}
</style>
<style lang="less" >
  .ping-test-modal{
    .ivu-modal{
      backdrop-filter: blur(6px);
    }
    .ivu-modal-content{
      background-color: rgba(0, 0, 0, .8);
      color: #00FF00;
      .ivu-modal-header p, .ivu-modal-header-inner{
        color: #00FF00;
      }
    }

  }
</style>