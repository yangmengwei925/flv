/**
 * 增删改查基础类
 * @author Chorin <xiaolinxuan@foxmail.com>
 * @date 2019-09-29
 */
import BaseBusinessSupport from "./BaseBusinessSupport.js";
import WaitFor from "@/utils/wait-for";
export default class BaseRequest extends BaseBusinessSupport{

    /**
     * 连接WS
     * @returns {void}
     * @author Chorin <xiaolinxuan@foxmail.com>
     * @date 2019-12-11
     */
    connectWebSocket(mark, listener){
      let setting =  {
        type: "connect",
        mark: mark,
        responses: 1,
      };
      new WaitFor(() => {
        return this.vm.$ws && this.vm.$ws.isConnected();
      }).then(()=>{
        console.log("#### [BaseRequest] Connect WebSocket => %s", mark);
        this.vm.$ws.send(
          JSON.stringify(setting)
        );
        this.vm.$bus.$on(mark, wsMessage =>{
          let messageBody = wsMessage.message;
          listener(JSON.parse(messageBody));
        });
      });
    }

    /**
     * 关闭WS
     * @returns {void}
     * @author Chorin <xiaolinxuan@foxmail.com>
     * @date 2019-12-11
     */
    closeWebSocket(mark){
      if(this.vm.$ws && this.vm.$ws.isConnected()){
        let setting =  {
          type: "disconnect",
          mark: mark,
          responses: 1,
        };
        this.vm.$ws.send(
          JSON.stringify(setting)
        );
      }
    }


}