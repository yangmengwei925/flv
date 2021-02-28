<template>
  <div id="app">
    <div>flv-player-demo</div>
    <HyzPlayer
      ref="cameraPlayer"
      :isScene="isScene"
      :option="playCameraOption"
      id="view-setting-video-demo"
    ></HyzPlayer>
  </div>
</template>

<script>
import HyzPlayer from "./components/index.vue";
export default {
  name: "App",
  components: {
    HyzPlayer,
  },
  data: () => ({
    isScene: false,
    playCameraOption: {
      hasAudio: false,
      hasVideo: true,
      id: "7f4599a907a51669e2471a65a18932e9",
      isLive: true,
      type: "flv",
      url:
        "https://ibms.tiandecentre.com.cn:443/srs2/live/T1_R2_LIFT1_CAM1.flv?key=T1_R2_LIFT1_CAM1",
      data: {
        id: "7f4599a907a51669e2471a65a18932e9",
        base_object_id: "7f4599a907a51669e2471a65a18932e9",
        resource_class_id: 7046,
        create_time: "2019-11-06 09:41:49",
        update_time: "2020-04-21 15:00:06",
        resource_class_keyname: "tst_m130_camera_f",
        parent_resource_class_id: 6640,
        parent_resource_class_keyname: "normal_camera",
        region: "33027a3c73494cb99925cfb776161bec",
        region_name: "R2",
        region_full_id:
          "103a625812e2494e906dc7eda8ecf069,477602ad4c8a4b59be9762e00654e08b,33027a3c73494cb99925cfb776161bec",
        region_full_name: "天德广场T1/R2/东侧消防电梯1",
        business_sys_id: 297,
        name: "1#楼东侧_1#消防梯安防摄像头",
        serial: "T1_R2_LIFT1_CAM1",
        type: "tst_m130_camera_f",
        domain: "security",
        soft_identifi_code: "172.100.17.101",
        design_serial: "T1_R2_LIFT1_CAM1",
        label: "T1_东侧1号消防电梯监控",
        unique_key: "T1_R2_LIFT1_CAM1",
        ip: "172.100.17.101",
        video_code: "hevc",
        child_video_code: "h264",
        area_id: "33027a3c73494cb99925cfb776161bec",
        srs_server_id: "8aaa7bc86ca89474016ca89e31ad0000",
        protocol: "rtsp",
        control_port: 80,
        find_port: 80,
        retransmit_port: 40004,
        video_port: 554,
        video_path: "/mpeg4",
        child_video_path: "/mpeg4cif",
        password: "123456",
        user_name: "admin",
        building_id: "103a625812e2494e906dc7eda8ecf069",
        floor_id: "477602ad4c8a4b59be9762e00654e08b",
        srs_unique_key: "srs2",
        title: "1#楼东侧_1#消防梯安防摄像头",
        uniqueKey: "T1_R2_LIFT1_CAM1",
        srsUrl: "https://ibms.tiandecentre.com.cn:443/srs2",
        srsUniqueKey: "srs2",
        resourceClassKeyname: "tst_m130_camera_f",
      },
    },
  }),
  methods: {},
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
