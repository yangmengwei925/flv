/**
 * 数据大厨，满足挑食的你
 * @version v0.1.1
 * @author Chorin <xiaolinxuan@foxmail.com>
 * @date 2019-10-12	
 */	
// import Expressions from "angular-expressions";
import {compile, filters} from "./expressions.js";

///预处理
let class2Type = {};
let objectToString = class2Type.toString;
let slotExp = /\\?{{([^{}]+)}}/gm; 
let singleSlotExp = /\\?{{([^{}]+)}}/;
var isSingleSlotExp = /^{{[^{}]*}}$/;

"Boolean Number String Function Array Date RegExp Object Error Symbol"
  .split(" ")
  .forEach((name)=>{
    class2Type[`[object ${name}]`] = name.toLowerCase();
});

class DataCook{
  constructor(){
  }

  /**
   * 判断数据类型
   * 可判断：Boolen Number String Function Array Date RegExp Object Error Symbol
   * @example 
   *   type(new Number()); // "number"
   *   type(1);  // "number"
   *   type(null);  // "null"
   *   type(undefined); // "undefined"
   * @returns {void}
   * @author Chorin <xiaolinxuan@foxmail.com>
   * @date 2019-10-13
   */
  type(object){
    if(object == null){
      return String(object)
    }
    return typeof object === "object" || typeof object == "function"? 
      class2Type[objectToString.call(object)] || "object": typeof object;
  }


  /**
   * 将list转为map
   * 行为：
   *  1. 不指定map的key 则使用元素的id作为key，
   *  2. 若元素没有id则以"__${'data_cook_' + 索引 }__"作为key. 
   *  3. 若元素中 keyField指定的字段的值为 "__${'data_cook_' + 索引 }__"形式，则可能会被覆盖。 
   *      如： [{id: "__data_cook_1__",age: 23},{name: "t2"}] 
   *      结果为：{"__data_cook_1__": {name: "t2"}};
   * @param {*[]} list
   * @param {String} [keyField='id'] 指定list的元素中作为map的key的字段，默认为ID
   * @returns {Object}
   * @author Chorin <xiaolinxuan@foxmail.com>
   * @date 2019-10-12
   */
  listToMap(list = [], keyField = "id"){
    let map = {};
    for(let i in list){
      let item = list[i];
      if(this.type(item) !== "object"){
        map[item] = item;
      }else{
        let id = item[keyField];
        let key = this.type(id) !== "undefined"? id : `__${'data_cook_' + i}__`;
        map[key] = item;;
      }
    }
    return map;
  }

  /**
   * 将map转为list
   * 转化时，将舍弃map的key
   * @param {Object} map
   * @returns {*[]}
   * @author Chorin <xiaolinxuan@foxmail.com>
   * @date 2019-10-12
   */
  mapToList(map = {}){
    return Object.values(map);
  }

  /**
   * map转key=value形式的字符串
   * @returns {void}
   * @author Chorin <xiaolinxuan@foxmail.com>
   * @date 2019-12-12
   */
  mapToKVString(map = {}){
    let mapString = "";
    for(let k in map){
      mapString = mapString + k + "=" + map[k] + ";";
    }
    return mapString;
  }

  /**
   * 浅拷贝， 
   * //FIXME:目前只支持拷贝对象，需要优化。
   * @returns {void}
   * @author Chorin <xiaolinxuan@foxmail.com>
   * @date 2019-10-13
   */
  shallowCopy(value){
    return Object.assign({}, value);
  }
  
  /**
   * 将来源列表的元素合并到与目标列表相关联的元素
   * @param {Object[]} targetList 目标列表
   * @param {Object[]} sourceList 来源列表
   * @param {Object} options 合并选项
   * @param {String} [options.targetKeyField = 'id'] 指定目标list的元素中关联字段
   * @param {String} [options.sourceKeyField = options.targetKeyField] 指定源list的元素中的关联字段，默认与targetKeyField相同
   * @param {Object[]} [options.keyValueList = []] 指定哪些值需要被合并
   * @param {Object[]} [options.mergeFieldList = []] 目标字段，不传则默认全部
   * @param {Function} [options.handler]  对每次匹配到的值进行处理，由调用者处理合并逻辑，此字段存在时，将忽略 mergeFieldList
   * @returns {Object[]}
   * @author Chorin <xiaolinxuan@foxmail.com>
   * @date 2019-10-12
   */
  mergeObjectList(targetList, sourceList,  options = {}){

    let mergeFieldList =  options.mergeFieldList || [];
    let targetKeyField =  options.targetKeyField || "id";
    let sourceKeyField =  options.sourceKeyField || targetKeyField;
    let keyValueList = options.keyValueList || [];
    let keyValueMap = this.listToMap(keyValueList, );
    let sourceMap = this.listToMap(sourceList, sourceKeyField);
    let isHandleWithCustom = this.type(options.handler) == "function";
    let minLength = targetList.length < sourceList.length? targetList.length: sourceList.length;
    let count = 0;  //处理个数计数

    for(let i in targetList){
      let targetItem = targetList[i]; 
      let sourceItem = sourceMap[targetItem[targetKeyField]];      
      let source = {};
      if(isHandleWithCustom){
        targetList[i] = options.handler(targetItem, sourceItem || {});
      }else{

        if(this.type(sourceItem) !== "object"){
          continue;
        }
        if(keyValueList.length > 0 && !(targetItem[targetKeyField] in keyValueMap)){
          continue;
        }
        if(mergeFieldList.length == 0){
          source = sourceItem;
        }else{
          for(let fi in mergeFieldList){
            let targetField = mergeFieldList[fi];
            source[targetField] = sourceItem[targetField] || "";
          }
        }
        targetList[i] = Object.assign(targetItem, source);
        count ++;
        if(count == minLength){
          break;
        }
      }

    }
  }

  /**
   * 为对象列表设置默认值
   * @param {Object} options 
   * @param {Object} options.defaultValue  列表元素的默认值
   * @param {Function} [options.after]  设置后回调
   * @returns {void}
   * @author Chorin <xiaolinxuan@foxmail.com>
   * @date 2019-10-13
   */
  setDefaultValueToObjectList(targetList, options = {}){

    let defaultValue = options.defaultValue || {};
    let after = options.after;

    for(let i in targetList){
      let targetItem = targetList[i];
      let defaultValueCopy =  this.shallowCopy(defaultValue);
      targetList[i] = Object.assign(defaultValueCopy, targetItem);
      this.type(after) == "function"  && after(targetList[i]);
    }
  }

  /**
   * 对象列表数据分类
   * 根据列表元素的某个键对应的值进行分类
   * @param {Object[]} list
   * @param {Object} options 合并选项
   * @param {String} options.targetKeyField 指定目标list的元素中进行分类的字段
   * @param {Object} [options.defaultValue = {}] 对象列表设置默认值
   * @param {Function} [options.before=]
   * @param {Function} [options.after=]  
   * @returns {Object}
   * @author Chorin <xiaolinxuan@foxmail.com>
   * @date 2019-10-13
   */
  objectListClassification(list, options = {}){
    let defaultValue = options.defaultValue || {};
    let targetKeyField = options.targetKeyField || "";
    let map = {};
    this.setDefaultValueToObjectList(list, {
      defaultValue,
      after(item){
        if (!(item[targetKeyField] in map)) {
          map[item[targetKeyField]] = [];
        }
        map[item[targetKeyField]].push(item);
      }
    });
    return map;
  }

  /**
   * 格式化对象列表
   * @see objectFormat
   * @param {Object[]} list 
   * @param {Object} options 格式选项
   * @param {Object} options.rule 格式规则. rule元素以key-value形式保存，value为字符串模板
   * @param {Object} options.inject 注入数据
   * @param {Function} options.filter 过滤方法
   * @returns {Object[]} 
   * @author Chorin <xiaolinxuan@foxmail.com>
   * @date 2019-10-13
   */
  objectListFormat(list, options = {}){
    let resultList = [];
    let rule = options.rule || {};
    let inject = options.inject || {};
    let isEmptyRule = Object.keys(rule).length === 0;
    for(let i in list){
      if(this.type(options.filter) === "function" && !options.filter({...list[i], ... inject})){
          continue;
      }
      let item;
      if(isEmptyRule){
        item = list[i];
      }else{
        item = this.objectFormat(list[i], {rule, inject});
      }
      resultList.push(item);
    }
    return resultList;
  }

  /**
   * 格式化对象
   * @example
   *  objectFormat(object, {
   *    rule: {
   *      id: "{{id}}",
   *      name: "{{firstName}}-{{lastName}}",
   *      age: "{{info.age}}",
   *      sex: "{{sex[0].value}}",
   *      headImage: "{{url}}/{{headImage}}",
   *  }});
   * @param {Object} object 需要格式化的对象
   * @param {Object} options 格式选项
   * @param {Object} options.rule 格式规则. rule元素以key-value形式保存，value为字符串模板，支持插值表达式
   * @param {Object} options.inject 注入数据， 通过$符号访问
   * @returns {Object}
   * @author Chorin <xiaolinxuan@foxmail.com>
   * @date 2019-10-15
   */  
  objectFormat(object, options = {}){
    let resultObject = {};
    let rule = options.rule || {};
    let inject = options.inject || {};
    for(let k in rule){
      let ruleType = this.type(rule[k]);
      switch(ruleType){
        case "string":
          resultObject[k] = this.parseTemplate(rule[k], {...object, ... inject});
          break;

        case "object":
          resultObject[k] = this.objectFormat(object, {
            rule: rule[k],
            inject
          });
          break;

        case "array":
          resultObject[k] = [];
          for(let i in  rule[k]){
            resultObject[k].push(this.objectFormat(object, {
              rule: rule[k][i],
              inject,
            }));
          }
          break;
        case "function":
          resultObject[k] = rule[k](object);
          break;
        /// boolean number symbol date regexp  error
        default:
          resultObject[k] = rule[k];
          break;
      }  
    }
    return resultObject;
  }


  /**
   * 解析模板
   * @param {String} templateString 模板字符串, 支持插值表达式
   * @param {Object} map 模板数据
   * @returns {*}
   * @author Chorin <xiaolinxuan@foxmail.com>
   * @date 2019-10-15
   */
  parseTemplate(templateString, map){
    let parseResult = undefined;
    let isSingleComamnd = isSingleSlotExp.test(templateString)
    if(isSingleComamnd){
      let r = singleSlotExp.exec(templateString);
      parseResult = compile(r? r[1] : "")(map);
    }else{
      parseResult = templateString.replace(slotExp, (slot, value)=>{
        return compile(value)(map);
      });
    }
    return parseResult;
  }
  

  /**
   * 列表结构转化成树结构
   * @param {Object[]} list 
   * @param {Object} options 转化选项
   * @param {String} options.keyField 主键字段
   * @param {String} options.parentKeyField 父主键字段
   * @param {String} [options.childrenListKeyField="childrenList"] 子列表字段
   * @returns {Object[]} 树结构数据
   * @author Chorin <xiaolinxuan@foxmail.com>
   * @date 2019-10-18
   */
  objectListToTreeList(list, options = {}){

    let keyField = options.keyField || "";
    let parentKeyField = options.parentKeyField || "";
    let childrenListKeyField = options.childrenListKeyField || "childrenList";
    let map = this.listToMap(list, keyField);
    let rootTree = [];

    for(let i in list){
      let item = list[i];
      let parentKey= item[parentKeyField];
      let parentItem =  map[parentKey];
      if(parentItem){
        parentItem[childrenListKeyField] =  parentItem[childrenListKeyField] || [];
        parentItem[childrenListKeyField].push(item);
      }else{
        rootTree.push(item);
      }
    }
    return rootTree;
  }

  /**
   * 列表映射 
   * 映射一对多，一对一的关系 ///思想参考Mybatis 的resultMap
   * 将简单的列表结果，根据一定的规则，映射成一定的数据结构
   * @param {Object[]} list 
   * @param {Object} options 转化选项
   * @param {Object} options.rule 映射规则
   * @param {String} [options.foreignKeyField="id"] 指定外键表示字段
   * @returns {void}
   * @author Chorin <xiaolinxuan@foxmail.com>
   * @date 2019-10-19
   */
  objectListMap(list = [], options = {}){
    let rule = options.rule || {};
    let inject = options.inject || {};
    let foreignKeyField = options.foreignKeyField || "id";
    let map = {};

    for(let i in list){
      let item = list[i];
      let foreignKeyValue = item[foreignKeyField];
      let resultObject = map[foreignKeyValue] || {};

      for(let k in rule){
        let type = this.type(rule[k]);
        switch(type){
          case "string":
             resultObject[k] = this.parseTemplate(rule[k], {...item, ... inject});
             break;
          case "object":
              resultObject[k] = this.objectFormat(item, {rule: rule[k], inject});
             break;
          case "array":
              resultObject[k]  = resultObject[k] || [];
              resultObject[k].push(this.objectFormat(item, {rule: rule[k][0] || {}, inject}));
            break;
          default:
            resultObject[k] = rule[k];
            break;
        }
      }
      map[foreignKeyValue] = resultObject;
    }
    return this.mapToList(map);
  }

  /**
   * 从对象列表中提取对象的某个元素，
   * 1. 当结果为数组列表时忽略undefined元素
   * @param {Object[]} list 对象列表
   * @param {String | String[] | Object} targetField 当为字符串时，提取为数组列表，当为对象时，按规则进行提取
   * @returns {Array | Object[]}
   * @author Chorin <xiaolinxuan@foxmail.com>
   * @date 2019-10-24
   */
  extractor(list = [], targetField = ""){
    let result = [];
    let paramType = this.type(targetField);
    
    if(paramType === "object"){
      result = this.objectListFormat(list, {rule: targetField})
    }else if(paramType === "array"){
      let rule = {};
      for(let i in targetField){
        rule[targetField[i]] = `{{${targetField[i]}}}`;
      }
      result = this.objectListFormat(list, {rule})
    }else{
      for(let i in list){
        let value = list[i][targetField];
        if(this.type(value) !== "undefined"){
          result.push(value);
        }
      }
    }

    return result;
  }

  /**
   * 下划线风格转小驼峰风格
   * @param {String} str需要转化字符串
   * @returns {String}
   * @author Chorin <xiaolinxuan@foxmail.com>
   * @date 2019-11-07
   */
  underScoreToSmallCamel(str = ""){
    var regExp = /_(\w)/g;
    return str.replace(regExp,function (value, slot){
        return slot.toUpperCase();
    });
  }

  /**
   * 下划线风格转小驼峰风格
   * @param {Object | Object []} object 目标
   * @returns {*}
   * @author Chorin <xiaolinxuan@foxmail.com>
   * @date 2019-11-07
   */
  keyToSmallCamelCase(object){
    let type = this.type(object);
    let result = null;
    switch(type){
      case "object":
        result = {};
        for(let k in object){
          result[this.underScoreToSmallCamel(k)] = this.keyToSmallCamelCase(object[k]);
        }
        break;
      case "array":
        result = [];
        for(let k in object){
          result.push(this.keyToSmallCamelCase(object[k]));
        }
        break;

      default:
        result  = object;
    }
    return result;
  }
  
  /**
   * 按参数顺序依次获取，直到获取到非空值或判断完毕才结束
   * null undefined NaN "" 都认为是空值
   * @param {*} 判断值 
   * @returns {*}
   * @author Chorin <xiaolinxuan@foxmail.com>
   * @date 2019-11-19
   */
  getNonNull(...args){
    let result = args[args.length - 1];
    for(let i in args){
      let arg = args[i];
      let type = this.type(arg);
      if(type !== "null" && type !== "undefined" && arg !== ""){
        if(type === "number" && isNaN(arg)) continue;
        result = arg;
        break;
      }
    }
    return result;
  }

  /**
   * 获取A中B的相对补集
   * @param {Array} a
   * @param {Array} b
   * @returns {void}
   * @author Chorin <xiaolinxuan@foxmail.com>
   * @date 2019-12-05
   */
  getRelativeComplement(a, b){
    let aSet = this.listToMap(a);
    let bSet = this.listToMap(b);
    let relativeComplement = [];
    for(let i in aSet){
      !(i in bSet) && relativeComplement.push(i);
    }
    return relativeComplement;
  }
  
  /**
   * 遍历树, 采用先序遍历方式
   * @returns {void}
   * @author Chorin <xiaolinxuan@foxmail.com>
   * @date 2019-12-10
   */
  treeListForEach(tree, cb, childrenListKeyField = "childrenList"){
    tree.forEach(node => {
      this.type(cb) === "function" && cb(node);
      node[childrenListKeyField] && this.treeListForEach(node[childrenListKeyField], cb, childrenListKeyField);
    });
  }


  /**
   * 获取节点路径
   * @param {Object[]} treeList
   * @param {String} treeList[].id
   * @param {Object | String} params 配置参数或子列表字段
   * @param {String} params.childrenListKeyField 子列表字段
   * @param {String} params.keyField 关键字
   * @returns {Array} 节点路径
   * @author Chorin
   * @date 2019-09-12
   */
  findTreePath(treeList, id, params){
    let childrenListKeyField, keyField = "id", paramsType = this.type(params);
    if(paramsType === "string" || paramsType === "undefined"){
      childrenListKeyField =  params || "childrenList";
    }else{
      childrenListKeyField = params.childrenListKeyField || "childrenList";
      keyField = params.keyField || "id";
    }
    function bindTreePath(treeList, id,  path, childrenListKeyField){
      for (let i in treeList) {
        if (treeList[i][keyField] == id) {
          path.push(id);
          return true;
        }
        if (treeList[i][childrenListKeyField] && treeList[i][childrenListKeyField].length > 0) {
          let isFind = bindTreePath(treeList[i][childrenListKeyField], id, path, childrenListKeyField);
          if (isFind) {
            path.unshift(treeList[i][keyField]);
            return isFind;
          }
        }
      }
    }
    let path = [];
    bindTreePath(treeList, id,  path, childrenListKeyField);
    return path;
  }

  /**
   * 获取最低最高值成员
   * @param {Object[] | Array} list
   * @param {Object} options 选项
   * @param {Object} [options.keyField=] 比较字段，list为对象列表时有效，默认为value
   * @returns {void}
   * @author Chorin <xiaolinxuan@foxmail.com>
   * @date 2020-03-26
   */
  getMinMaxItem(list, options = {}){
    let firstItem = list[0] || 0;
    let itemType = this.type(firstItem);
    let keyField = options.keyField || "value"
    let minItem = firstItem, maxItem = firstItem;
    for(let i in list){
      let item = list[i];
      if(itemType === "object"){
        if(item[keyField] < minItem[keyField]){
          minItem = item;
        }
        if(item[keyField] > maxItem[keyField]){
          maxItem = item;
        }
      }else{
        if(item < minItem){
          minItem = item;
        }     
        if(item > minItem){
          maxItem = item;
        }
      }
    }
    return {minItem, maxItem};
  }

  /**
   * 设置表达式过滤器
   * @param {String} 过滤器名称
   * @param {Function} 过滤器主方法
   * @returns {void}
   * @author Chorin <xiaolinxuan@foxmail.com>
   * @date 2020-03-30
   */
  setParseFilter(name, func){
    if(!(name in filters)){
      filters[name] = func;
    }
  }

  /**
   * @description 裁剪树的列表的度
   * @author Chorin <xiaolinxuan@foxmail.com>
   * @date 2020-08-03
   * @static
   * @param {Array<KVObject>} treeList 树列表
   * @param {number} depth 指定深度，首层为1
   * @param {string} [childrenListKeyField="childrenList"] 指定子列表字段
   * @returns {Array<KVObject>}
   * @memberof DataCook
   */
  tailorTheTreeList(treeList, depth, childrenListKeyField = "childrenList") {
    let rootTree = [];
    if (depth === 0) {
        return rootTree;
    }
    for (let i = 0; i < treeList.length; i++) {
        let node = Object.assign({}, treeList[i]);
        rootTree.push(node);
        node[childrenListKeyField] = this.tailorTheTreeList(treeList[i][childrenListKeyField] || [], depth - 1, childrenListKeyField);
    }
    return rootTree;
  }
}
let dataCookInstance = new DataCook();
///定义过滤器
dataCookInstance.setParseFilter("parseInt", input => parseInt(input) || 0);
dataCookInstance.setParseFilter("keyToSmallCamelCase", input => dataCookInstance.keyToSmallCamelCase(input));


export default dataCookInstance;