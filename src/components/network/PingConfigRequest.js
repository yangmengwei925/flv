import BaseRequest from "./BaseRequest";
import Constant from "./PingConfigConstant";
export default class PingConfigRequest extends BaseRequest{

  /**
   * 请求异常处理器
   * @returns {void}
   * @author Chorin <xiaolinxuan@foxmail.com>
   * @date 2019-10-29
   */
  requestFailHandler(errorMessage){
    this.vm.$Spin.hide();
    this.vm.$Message.error("网络异常");
  }

  /**
   * 获取配置列表
   * @param {Number} pageNo 页码 0开始
   * @param {Number} pageSize 页数
   * @param {Object} options 筛选选项，不同条件之间是与逻辑
   * @param {String} options.name 名称
   * @param {String} options.ip IP
   * @param {String} options.businessKey 业务标志
   * @returns {Promise <<Object[]>, total>} 返回配置列表和总数
   * @author Chorin <xiaolinxuan@foxmail.com>
   * @date 2019-10-29
   */
  async getConfigList(pageNo, pageSize, options){
    let configList = [], total = 0;
    let conditions = [];

    for(let k in options){
      options[k] && conditions.push({
        name: k, op: "like", value: options[k]
      })
    }

    await this.vm.$http({
      method: 'post',
      url: Constant.API.GET_CONFIG_LIST,
      data: {
        page: pageNo,
        pageSize: pageSize,
        sortDirection: 'desc',
        sortProperties: 'updateTime',
        searchParas: {
          conditions: conditions,
          logic: "AND",
        }
      },
      onFail: e => this.requestFailHandler(e),
      showSpin: false,
    }).then(result => {
      if(result){
        configList =  result.list || [];
        total =  result.totalNum || 0;
      }
   
    });
    return {configList, total};
  }

  /**
   * 新增配置
   * @param {Object} config 配置信息对象
   * @param {String} config.businessKey 配置信息对象
   * @param {Number} config.interval ping的时间间隔
   * @param {String} config.ips ip列表
   * @param {String} config.name 每次对每个设备ping的次数
   * @param {String} config.number 配置信息对象
   * @param {String} config.type 类型 1=网段 2=多个IP 3=起始IP
   * @returns {Promise <Object>}
   * @author Chorin <xiaolinxuan@foxmail.com>
   * @date 2019-10-29
   */
  async insertConfig(config = {}){
    config.type = config.type || "";
    config.typeName = Constant.CONFIG_TYPE[config.type] || "";
    await this.vm.$http({
      method: "post",
      url: Constant.API.INSERT_CONFIG,
      data: config,
      onFail: e => this.requestFailHandler(e),
      showSpin: false,
    }).then(result => {
      if(result) {
      }
    });

    return config;
  }



  /**
   * 更新配置
   * @param {Object} config 配置信息对象
   * @param {String} config.businessKey keyName
   * @param {Number} config.interval ping的时间间隔
   * @param {String} config.ips ip列表
   * @param {String} config.name 名称
   * @param {String} config.number  每次对每个设备ping的次数
   * @param {String} config.type 类型 1=网段 2=多个IP 3=起始IP
   * @returns {Promise <Object>}
   * @author Chorin <xiaolinxuan@foxmail.com>
   * @date 2019-10-29
   */  
  async updateConfig(config = {}){
    config.type = config.type || "";
    config.typeName = Constant.CONFIG_TYPE[config.type] || "";
    await this.vm.$http({
      method: "put",
      url: Constant.API.INSERT_CONFIG,
      data: config,
      showSpin: false,
      onFail: e => this.requestFailHandler(e),
    }).then(result => {
      if(result) {
      }
    });
    return config;
  }

  /**
   * 删除配置
   * @param {Array|String} 将被删除的ID或ID数组
   * @returns {Promis} 完成后回调
   * @author Chorin <xiaolinxuan@foxmail.com>
   * @date 2019-10-29
   */
  async deleteConfig(idList = []){ 
    await this.vm.$http({
      method: "delete",
      url: Constant.API.DELETE_CONFIG,
      data: idList,
      onFail: e => this.requestFailHandler(e),
      showSpin: false,
    }).then(result => {
      if(result) {
      }
    });
    return; 
  }

  /**
   * 获取配置
   * @returns {Promis<Object>} 配置信息
   * @author Chorin <xiaolinxuan@foxmail.com>
   * @date 2019-10-29
   */
  async getConfig(id = ""){
    let config = {};
    await this.vm.$http({
      method: "delete",
      url: Constant.API.SELECT_CONFIG,
      data: {
        id: id,
      },
      onFail: e => this.requestFailHandler(e),
      showSpin: false,

    }).then(result => {
      config = result || {};
    });
    return config; 
  }

  /**
   * ping 测试
   * @param {Object} config 配置信息对象
   * @param {String} config.businessKey keyName
   * @param {Number} config.interval ping的时间间隔
   * @param {String} config.ips ip列表
   * @param {String} config.name 名称
   * @param {String} config.number  每次对每个设备ping的次数
   * @param {String} config.type 类型 1=网段 2=多个IP 3=起始IP
   * @returns {Promise <Object>}
   * @author Chorin <xiaolinxuan@foxmail.com>
   * @date 2019-10-30
   */
  async pingTest(config = {}){
    let pingResult = {};
    await this.vm.$http({
      method: "post",
      url: Constant.API.PING_TEST,
      data: config,
      onFail: e => this.requestFailHandler(e),
      showSpin: false,

    }).then(result => {
      pingResult = result || {};
    });

    return pingResult;
  }

  /**
   * 获取ping配置业务标志字典
   * @returns {void}
   * @author Chorin <xiaolinxuan@foxmail.com>
   * @date 2019-11-01
   */
  async getPingConfigBKDictionary(){
    let dictionaryList = [];
    await this.vm.$http({
      method: "post",
      url: Constant.API.PING_CONFIG_DICT,
      data: {
        searchParas: {
          conditions: [
            { name: "parentInstanceName", op: "eq", value: "ipConfigBiz" }
          ]
        }
      },
      onFail: e => this.requestFailHandler(e),
      showSpin: false,

    }).then(result => {
      if(result){
        dictionaryList = result.list || [];
      }
    });

    return dictionaryList;
  }

  /**
   * 通过文件导入ping配置
   * @returns {void}
   * @author Chorin <xiaolinxuan@foxmail.com>
   * @date 2019-11-01
   */
  async importPingConfig(formData){

    await this.vm.$http({
      method: 'post',
      url: Constant.API.IMPORT_CONFIG,
      data: formData,
      showSpin: false,
    }).then(result => {
      if(result) {
      }
    });

    return;
  }

  


}