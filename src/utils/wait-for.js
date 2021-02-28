/**
 * 等待工具
 * new WaitFor(Condition, Interval).then(()=>{ //TODO  });
 * 当Condition() 结果的布尔值为false时将会以时间间隔为Interval的频率持续调用当Condition方法，直到结果为true为止，
 * @author Chorin
 * @date 2019-09-03
 */
export default class WaitFor{


    /**
     * 轮询检测
     * @param {Function} resolve 
     * @param {Function} reject 
     */
    wait(resolve, reject){
      if(this.condition()){
        resolve(this.condition);
      }else{
        setTimeout(()=>{
            this.wait(resolve, reject);
        }, this.interval);
      }
    }

    /**
     * 构造方法
     * @param {Number} interval 时间间隔，单位ms
     * @param {Function} condition 判断条件
     */
    constructor(condition, interval = 10){

      this.condition = condition;
      this.interval = interval;

      return new Promise((resolve, reject) => {
          this.wait(resolve, reject);
      });

    }
  
}

