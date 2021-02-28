export default class PingConfigConstant{

  static API = {
    /** 获取配置列表 */
    GET_CONFIG_LIST: "/netmonitor/fpingIpConfig/list",
    /** 更新配置信息 */
    UPDATE_CONFIG: "/netmonitor/fpingIpConfig",
    /** 添加配置信息 */
    INSERT_CONFIG: "/netmonitor/fpingIpConfig",
    /** 删除配置信息 */
    DELETE_CONFIG: "/netmonitor/fpingIpConfig",
    /** 查询单个配置 */
    SELECT_CONFIG: "/netmonitor/fpingIpConfig",
    /** Ping测试 */
    PING_TEST: "/netmonitor/fpingTest",
    /** 字典 */
    PING_CONFIG_DICT: "resource/v1/resource/dictionaryInstances/list",
    /** 导入配置 */
    IMPORT_CONFIG: "netmonitor/fpingIpConfig/import",
  }

  /**
   * 配置类型
   */
  static CONFIG_TYPE = {
    "1": "网段",
    "2": "多个IP",
    "3": "起始IP",
  }
}