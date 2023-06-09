// Watcher的构造函数 vm----vm  expOrFn----exp----'msg'
function Watcher (vm, expOrFn, cb) {
  // this-----Watcher的实例对象
  this.cb = cb; // 存储回调函数
  this.vm = vm; // 存储vm实例
  this.expOrFn = expOrFn; // 存储表达式
  this.depIds = {}; // 定义depIds属性存储的是一个对象
  // 判断传入进来的表达式是不是一个函数
  if (typeof expOrFn === 'function') {
    this.getter = expOrFn; // 如果是函数,直接存储
  } else {
    // 如果不是一个,最终返回来的也是一个函数
    this.getter = this.parseGetter(expOrFn.trim());
  }
  // 总结,getter中存储的是一个函数
  // value存储的是msg表达式的值
  this.value = this.get();
}
// 原型对象
Watcher.prototype = {
  constructor: Watcher, // 构造器
  update: function () {
    this.run();
  },
  run: function () {
    var value = this.get();
    var oldVal = this.value;
    if (value !== oldVal) {
      this.value = value;
      this.cb.call(this.vm, value, oldVal);
    }
  },
  // 真正的开始建立dep和watcher的关系
  addDep: function (dep) {
    // watcher中depIds中是否存在dep的id
    if (!this.depIds.hasOwnProperty(dep.id)) {
      dep.addSub(this);// 把watcher添加到dep对象的subs数组中
      this.depIds[dep.id] = dep;// 把dep的id作为键,dep作为值,以键值对的方式存储watcher对象的depIds属性对象中
    }
  },
  // 用来获取某个数据的值的
  get: function () {
    // this----watcher实例对象
    // 把watcher存储到Dep对象的target属性中
    Dep.target = this;
    var value = this.getter.call(this.vm, this.vm);
      // 干掉Dep对象的target属性中存储的watcher实例
    Dep.target = null;
    return value;
  },
  // 该方法中的返回值是一个函数,目的是为了获取表达式的值,的过程中建立dep和watcher的关系
  parseGetter: function (exp) {
    if (/[^\w.$]/.test(exp)) return;
    var exps = exp.split('.');
    return function (obj) {
      for (var i = 0, len = exps.length; i < len; i++) {
        if (!obj) return;
        // obj=obj[exps[0]]
        // obj=vm[exps[0]]
        // obj = vm['msg']
        // obj 中存储的是vm.msg属性的值
        obj = obj[exps[i]];
      }
      return obj; // 返回来的是vm.msg的值
    }
  }
};