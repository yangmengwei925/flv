import PingConfigRequest from "./PingConfigRequest";
import DataCook from "@/utils/data-cook.js";
export default class PingConfigBase extends PingConfigRequest{


    /**
     * 批量删除配置
     * @returns {void}
     * @author Chorin <xiaolinxuan@foxmail.com>
     * @date 2019-10-29
     */
    async batchDeleteConfig(configList){
        let isList = DataCook.extractor(configList, "id");
        await this.deleteConfig(isList)
          .then(()=>{

          });
        return;
    }

    /**
     * 批量ping测试
     * ///接口只支持单个ping，此批量操作为模拟批量操作
     * @returns {void}
     * @author Chorin <xiaolinxuan@foxmail.com>
     * @date 2019-10-30
     */
    batchPingTest(configList){
      let pingTestResultList = [];
      let totalNumber = configList.length;

      return new Promise((resolve)=>{
          for(let i in configList){
            this
              .pingTest(configList[i])
              .then((testResult)=>{
                pingTestResultList.push(testResult);
                if(pingTestResultList.length == totalNumber){
                  resolve(pingTestResultList);
                }
              });
          }
        });
    }
}