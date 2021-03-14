<template>
  <!-- 文件预览组件 -->
  <div class="file-preview" v-if="showPreviewPanel">
    <slot :show-preview-panel="showPreviewPanel">

    </slot>
  </div>
</template>

<script>
export default {
  name: 'preview',
  props: {
    showPreviewPanel: {
      type: Boolean,
      default () {
        return false
      }
    }
  }
}
</script>

<style scoped lang="scss">

</style>
