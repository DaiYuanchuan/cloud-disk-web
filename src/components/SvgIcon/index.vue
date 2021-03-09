<template>
  <div v-if="isExternal" :style="styleExternalIcon" class="svg-external-icon svg-icon" v-on="$listeners"/>
  <svg v-else :class="svgClass" aria-hidden="true" v-on="$listeners" :style="styleExternalIcon">
    <use :xlink:href="iconName"/>
  </svg>
</template>

<script>

export default {
  name: 'SvgIcon',
  props: {
    // 目录icons/svg 下的svg文件名(不含后缀)(也可以是https格式的svg文件)
    iconClass: {
      type: String,
      required: true
    },
    // 插入的svg名称
    className: {
      type: String,
      default: ''
    },
    // 宽
    width: {
      type: [Number, String],
      default: ''
    },
    // 高
    height: {
      type: [Number, String],
      default: ''
    },
    // 颜色(默认读取父级颜色)
    color: {
      type: String,
      default: 'currentColor'
    }
  },
  computed: {
    isExternal () {
      return /^(https?:|mailto:|tel:)/.test(this.iconClass)
    },
    iconName () {
      return `#icon-${this.iconClass}`
    },
    svgClass () {
      if (this.className) {
        return 'svg-icon ' + this.className
      } else {
        return 'svg-icon'
      }
    },
    styleExternalIcon () {
      if (this.isExternal) {
        return {
          mask: `url(${this.iconClass}) no-repeat 50% 50%`,
          '-webkit-mask': `url(${this.iconClass}) no-repeat 50% 50%`,
          'width': `${this.width}`,
          'height': `${this.height}`,
          'color': `${this.color}`
        }
      } else {
        return {
          'width': `${this.width}`,
          'height': `${this.height}`,
          'color': `${this.color}`
        }
      }
    }
  }
}
</script>

<style scoped>
.svg-icon {
  width: 1em;
  height: 1em;
  vertical-align: -0.15em;
  fill: currentColor;
  overflow: hidden;
}

.svg-external-icon {
  background-color: currentColor;
  mask-size: cover !important;
  display: inline-block;
}
</style>
