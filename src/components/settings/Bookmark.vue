<template>
  <div class="bookmark" @dblclick.stop="() => {}">
    <Divider style="color: #efefef;">添加书签</Divider>
    <div class="bookmark-row">
      <h4 style="text-align: left; margin: 8px 0;">书签名称：</h4>
      <Input style="width: 250px;" v-model="item.name"></Input>
    </div>
    <div class="bookmark-row">
      <h4 style="text-align: left; margin: 8px 0;">书签描述：</h4>
      <Input type="textarea" v-model="item.description"></Input>
    </div>
    <div>
      <Button :loading="saveLoading" type="primary" size="small" @click="save"
        >保存</Button
      >&nbsp;&nbsp;
      <Button size="small" ghost @click="$emit('cancel-bookmark')">取消</Button>
    </div>
  </div>
</template>

<script>
export default {
  props: ["item"],
  data() {
    return {
      saveLoading: false
    };
  },
  methods: {
    save() {
      this.saveLoading = true;
      this.$http({
        method: "post",
        url: "ivmp/bookmark",
        data: this.item,
        showSpin: false
      })
        .then(result => {
          this.saveLoading = false;
          this.$emit("save-bookmark", this.item);
        })
        .catch(e => (this.saveLoading = false));
    }
  }
};
</script>

<style lang="less" scoped>
.bookmark {
  padding: 0 16px 12px;
  border-radius: 12px;
  &-row {
    margin-bottom: 12px;
    // display: flex;
    // align-items: center;
    // justify-content: space-between;
  }
}
</style>
