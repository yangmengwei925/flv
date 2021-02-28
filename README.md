# demo

## Project setup
```
yarn install
```

### Compiles and hot-reloads for development
```
yarn serve
```

### Compiles and minifies for production
```
yarn build
```

- 如果需访问接口，请修改根目录下的vue.config.js文件中的 `proxy` 对象为您的服务器地址即可。
- 参数查看在App.vue文件的 `playCameraOption` 对象内

## 播放器组件在components文件夹中
- index为带了直播，回访等一系列完整功能的播放器
- LivePlayer为只负责直播
    - 如果直播需要授权，则请访问该文件找到第 **58** 行，修改您的token即可
- ReplayPlayer为只负责回访
