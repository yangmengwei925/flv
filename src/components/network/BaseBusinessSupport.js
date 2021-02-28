/**
 * 业务支持基础类
 * @author Chorin <xiaolinxuan@foxmail.com>
 * @date 2019-09-29
 */
import DataCook from "@/utils/data-cook";
import Vue from "vue";
export default class BaseBusinessSupport{

  constructor(vm) {
    this.vm = vm || Vue.prototype;
  }


  changeVM(vm) {
    this.vm = vm;
  }

  cook(func){
    return func? {
      source: (...args) => DataCook[func](...args)
    }: DataCook;
  }

}