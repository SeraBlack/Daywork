// 构造函数，options是一个配置对象
function MVVM (options) {
  // this是MVVM的实例对象---vm
  // 把传入进来的配置对象存储到vm实例对象中的$options属性中
  this.$options = options || {};
  // 从配置对象中取出data属性存储到_data属性中和data变量中
  var data = this._data = this.$options.data;
  // 变量me---this----vm实例对象
  var me = this;
  // 遍历data中的每个属性,key---'msg'
  Object.keys(data).forEach(function (key) {
    me._proxyData(key); // 实现数据代理的方法
  });
  // 初始化计算属性操作
  this._initComputed();
  // 数据劫持
  observe(data, this);
  // 模版解析，产生一个编译的实例对象(模版解析的实例对象),传入el或者body,和this---vm实例
  this.$compile = new Compile(options.el || document.body, this)
}
// MVVM构造函数的原型对象
MVVM.prototype = {
  constructor: MVVM, // 构造器
  $watch: function (key, cb, options) {
    new Watcher(this, key, cb);
  },
  // 数据代理的方法, key----'msg' 
  _proxyData: function (key, setter, getter) {
    var me = this; // me----this----vm实例
    setter = setter ||
      // 为vm实例对象添加msg属性,并且重写了set和get方法
      Object.defineProperty(me, key, {
        configurable: false,
        enumerable: true,
        // 如果外部通过vm.msg或者vm['msg']访问这个属性的时候,会自动的进入到get方法
        get: function proxyGetter () {
          // 返回的是data中msg属性的值
          return me._data[key];
        },
        // 如果外部通过vm.msg=值或者vm['msg']=值进行属性值的设置或者修改的时候,会自动的进入到set方法
        set: function proxySetter (newVal) {
          // 给data中的msg属性赋值
          me._data[key] = newVal;
        }
      });
  },

  _initComputed: function () {
    var me = this;
    var computed = this.$options.computed;
    if (typeof computed === 'object') {
      Object.keys(computed).forEach(function (key) {
        Object.defineProperty(me, key, {
          get: typeof computed[key] === 'function'
            ? computed[key]
            : computed[key].get,
          set: function () { }
        });
      });
    }
  }
};