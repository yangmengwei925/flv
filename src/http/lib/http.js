/**
 * Created by liekkas on 2017/6/11.
 */
import axios from "axios";

class http {
  static HYZ_HTTP_RESPONSE_MSG = "$hyz_http_response_msg";
  static HYZ_TOKEN_CHANGED = "$hyz_token_changed";
  constructor(Vue, opts) {
    this.Vue = Vue;
    this.instance = axios.create();

    if (opts) {
      Object.keys(opts).forEach((key) => {
        this.instance.defaults[key] = opts[key];
      });
    }
    this.token = this.Vue.ls.get("TOKEN");
    // this.Vue.bus.$on(http.HYZ_TOKEN_CHANGED, (v) => this.onTokenChanged(v));
    this.configRequest();
    this.configResponse();
  }

  onTokenChanged(v) {
    this.token = v;
    this.configRequest();
  }

  toggleLoading(show) {
    const dom = document.querySelector("#global-spin");
    if (dom) {
      dom.style.display = show ? "block" : "none";
    }
  }

  configRequest() {
    if (this.requestInterceptor) {
      this.instance.interceptors.request.eject(this.requestInterceptor);
    }
    this.requestInterceptor = this.instance.interceptors.request.use(
      (config) => {
        if (!config.noToken) {
          config.headers["Authorization"] = "Bearer " + this.token;
        }
        if (config.showSpin) {
          this.toggleLoading(true);
        }
        return config;
      },
      (error) => {
        if (error.config.showSpin) {
          this.toggleLoading(false);
        }
        if (error.config.onFail) {
          error.config.onFail();
        }
        document.querySelector("#global-spin").style.display = "none";
        return Promise.reject(error);
      }
    );
  }

  configResponse() {
    this.instance.interceptors.response.use(
      (response) => {
        if (response.config.showSpin) {
          this.toggleLoading(false);
        }
        //假如有hyz_code，解析后端约定数据包，结果存在hyz_result
        if (response.data && response.data.hyz_code) {
          const { hyz_code, hyz_message, hyz_result } = response.data;
          let payload = {
            msg: hyz_message,
            code: hyz_code,
            type: hyz_code === 20000 ? "success" : "error",
            isOk: hyz_code === 20000 ? true : false,
          };
          //后端内部调token过期 或者 设置为信息提示则派发响应事件
          if (
            (response.config.showMsg || response.config.showFailMsg) &&
            hyz_code !== 20000
          ) {
            payload.msg = response.config.failMsg || hyz_message;
            this.Vue.bus.$emit(http.HYZ_HTTP_RESPONSE_MSG, payload);
          }

          if (hyz_code !== 20000) {
            return Promise.reject(payload);
          }

          if (
            (response.config.showMsg || response.config.showOkMsg) &&
            hyz_code === 20000
          ) {
            payload.msg = response.config.okMsg || hyz_message;
            this.Vue.bus.$emit(http.HYZ_HTTP_RESPONSE_MSG, payload);
          }

          if (hyz_code === 50000 && response.config.onFail) {
            response.config.onFail();
          }
          return hyz_result;
        } else {
          if (response.config.showMsg || response.config.showOkMsg) {
            let payload = {
              msg: response.config.okMsg || "请求成功:" + response.statusText,
              code: status,
              type: "success",
            };
            this.Vue.bus.$emit(http.HYZ_HTTP_RESPONSE_MSG, payload);
          }
          return response.data;
        }
      },
      (error) => {
        if (error.config.showSpin) {
          this.toggleLoading(false);
        }

        if (error.config.onFail) {
          response.config.onFail();
        }

        let payload = {
          msg: "服务连接失败！",
          code: 0,
          type: "error",
        };
        if (error.response) {
          payload.code = error.response.status;
          switch (error.response.status) {
            case 400:
              payload.msg = "请求错误(400)";
              if (error.response.data.error_description === "Bad credentials") {
                payload.msg = "账号密码不对";
              }
              break;
            case 401:
              payload.msg = "未授权，请重新登录(401)";
              break;
            case 403:
              payload.msg = "无权限访问(403)";
              break;
            case 404:
              payload.msg = "请求资源不存在(404)";
              break;
            case 500:
              payload.msg = "服务器错误(500)";
              break;
            case 503:
              payload.msg = "服务升级维护中(503)";
              break;
            default:
              payload.msg = `请求失败${error.response.status}`;
              break;
          }
        }
        if (
          error.config.showMsg ||
          error.config.showFailMsg ||
          payload.code === 401
        ) {
          payload.msg = error.config.failMsg || payload.msg;
          this.Vue.bus.$emit(http.HYZ_HTTP_RESPONSE_MSG, payload);
        }

        return Promise.reject(error);
      }
    );
  }

  get() {
    return this.instance;
  }
}

export default http;
