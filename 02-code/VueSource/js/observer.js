// 数据劫持的构造函数 data形参---value实参---data变量---地址
function Observer (data) {
  // this----劫持实例对象  this.data----劫持实例对象中的data属性----data形参---value实参--data变量---地址
  // this.data---data变量---地址
  this.data = data;
  // data实参--value实参---data变量---地址
  this.walk(data);
}
// 原型对象
Observer.prototype = {
  constructor: Observer, // 构造器
  // 走--开始进行数据劫持的相关操作了. data形参----value实参---data变量---地址
  walk: function (data) {
    var me = this; // me----this----劫持实例对象
    // 遍历外部data变量中存储的地址对应的空间中的对象里面所有的属性,key----'msg'
    Object.keys(data).forEach(function (key) {
      // 进行数据转化，key-----'msg'  data['msg']---'小甜甜'
      me.convert(key, data[key]);
    });
  },
  // 转换数据的方法, key----'msg',val---'小甜甜'
  convert: function (key, val) {
    // 定义响应式数据,this.data---劫持实例对象中的data属性,key----'msg',val---'小甜甜'
    this.defineReactive(this.data, key, val);
  },
  // 定义数据的响应式,data形参----this.data---劫持实例对象中的data属性,key----'msg',val---'小甜甜'
  defineReactive: function (data, key, val) {
    // 每个属性在遍历的时候,都会产生对应的dep对象,id和subs数组
    var dep = new Dep();
    // 要进行深度递归数据劫持,数据劫持的目的是为了定义响应式数据
    var childObj = observe(val);
    // 为当前劫持对象中的data属性对象添加data中的每个属性,重写了get和set
    Object.defineProperty(data, key, {
      enumerable: true, // 可枚举
      configurable: false, // 不能再define
      // 如果外部通过vm.msg或者vm['msg']访问这个属性值的时候,首先会进入到数据代理的get方法中,然后自动的进入到这个get中
      get: function () {
        // 判断watcher是否存在
        if (Dep.target) {
          // 开始建立dep和watcher的关系
          dep.depend();
        }
        return val;
      },
       // 如果外部通过vm.msg=值或者vm['msg']=值设置或者修改这个属性值的时候,首先会进入到数据代理的set方法中,然后自动的进入到这个set中
      set: function (newVal) {
        if (newVal === val) {
          return;
        }
        val = newVal;
        // 新的值是object的话，进行监听
        childObj = observe(newVal);
        // 通知订阅者
        dep.notify();
      }
    });
  }
};
// 要开始进行数据劫持 value---data变量---地址  vm
function observe (value, vm) {
  // 如果value数据有意义,那么才开始进行数据劫持的操作
  if (!value || typeof value !== 'object') {
    return;
  }
  // 开始进行数据劫持操作, value实参----data变量---地址
  return new Observer(value);
};


var uid = 0;
// Dep的构造函数
function Dep () {
  this.id = uid++; // id标识
  this.subs = []; // subs数组,用来存储watcher的
}

Dep.prototype = {
  // sub---watcher实例
  addSub: function (sub) {
    // 把watcher实例添加到dep对象的subs数组中
    this.subs.push(sub);
  },
  // 开始建立dep和watcher的关系
  depend: function () {
    // 调用Dep.target----watcher中的addDep方法,this----dep对象
    Dep.target.addDep(this);
  },

  removeSub: function (sub) {
    var index = this.subs.indexOf(sub);
    if (index != -1) {
      this.subs.splice(index, 1);
    }
  },

  notify: function () {
    this.subs.forEach(function (sub) {
      sub.update();
    });
  }
};

Dep.target = null;