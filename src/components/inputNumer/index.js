import inputNumber from './src/inputNumber'

inputNumber.install = function (Vue) {
  Vue.component(inputNumber.name, inputNumber)
}

export default inputNumber
