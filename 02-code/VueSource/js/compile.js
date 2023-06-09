// 编译的构造函数,el----'#app',vm----vm实例
function Compile (el, vm) {
  // this-----编译实例对象
  this.$vm = vm;
  // 如果el中是标签,直接获取并保存,如果是选择器,就根据选择器获取对应的标签节点
  // 获取el对应的dom标签
  // 获取模版容器---$el----div容器
  this.$el = this.isElementNode(el) ? el : document.querySelector(el);
  // 判断模版容器是否存在,如果存在才有解析的意义,如果不存在就没有必要解析了
  if (this.$el) {
    // 把模版容器中所有的节点放在文档碎片对象中
    this.$fragment = this.node2Fragment(this.$el);
    this.init(); // 进行模版解析
    // 把解析后的文档碎片对象重新的放进div模版容器中
    this.$el.appendChild(this.$fragment);
  }
}
// 原型对象
Compile.prototype = {
  constructor: Compile, // 构造器
  // el-----div模版
  node2Fragment: function (el) {
    // 创建文档碎片对象
    var fragment = document.createDocumentFragment(),
      child;
    // 把div中的节点放在文档碎片对象中
    while (child = el.firstChild) {
      fragment.appendChild(child);
    }
    // 返回文档碎片对象
    return fragment;
  },
  // 模版解析方法,啥也没干,调用的是别的方法来实现的模版解析
  init: function () {
    this.compileElement(this.$fragment);
  },
  // 真正的模版解析的方法,el-----文档碎片对象
  compileElement: function (el) {
    // 获取所有的节点
    var childNodes = el.childNodes,
      me = this;
    // 遍历每个节点，node----每个节点
    [].slice.call(childNodes).forEach(function (node) {
      // 节点的文本内容
      var text = node.textContent;
      var reg = /\{\{(.*)\}\}/; // 插值的正则
      // 判断当前的节点是不是标签
      if (me.isElementNode(node)) {
        me.compile(node); // 开始解析标签节点
        // 判断当前的节点是不是文本,并且是不是符合插值语法的正则
      } else if (me.isTextNode(node) && reg.test(text)) {
        // node-----'{{ msg }}'   RegExp.$1.trim()-----'msg'
        me.compileText(node, RegExp.$1.trim());
      }
      // 节点中如果还有子节点,要进行深度递归模版解析
      if (node.childNodes && node.childNodes.length) {
        me.compileElement(node);
      }
    });
  },
  // 解析标签节点的方法, node------p
  compile: function (node) {
    // 获取节点中所有的属性
    var nodeAttrs = node.attributes,
      me = this; // me----this---编译实例对象
    // 遍历所有的属性 attr----'v-text'
    [].slice.call(nodeAttrs).forEach(function (attr) {
      // attrName ------v-text---获取属性的名字
      var attrName = attr.name;
      // 判断这个属性是不是指令
      if (me.isDirective(attrName)) {
        // exp----'msg'----表达式---获取属性的值
        var exp = attr.value;
        // 干掉v-开头 dir----'text'
        var dir = attrName.substring(2);
        // 判断这个去掉v-的指令是不是一个事件=指令
        if (me.isEventDirective(dir)) {

          // node---button  me.$vm----vm  exp----'showMsg'  dir----'on:click'
          compileUtil.eventHandler(node, me.$vm, exp, dir);
          // 普通指令
        } else {
          // dir------'text'  
          // compileUtil['text'](p,vm,'msg')
          compileUtil[dir] && compileUtil[dir](node, me.$vm, exp);
        }
        // 当指令解析后,把标签节点中的指令属性删除掉
        node.removeAttribute(attrName);
      }
    });
  },
  // 解析文本,node----'{{ msg }}' exp------'msg'
  compileText: function (node, exp) {
    // node----'{{ msg }}'  this.$vm----vm实例 exp------'msg'
    compileUtil.text(node, this.$vm, exp);
  },

  isDirective: function (attr) {
    return attr.indexOf('v-') == 0;
  },

  isEventDirective: function (dir) {
    return dir.indexOf('on') === 0;
  },

  isElementNode: function (node) {
    return node.nodeType == 1;
  },

  isTextNode: function (node) {
    return node.nodeType == 3;
  }
};

// 指令处理集合
var compileUtil = {
  // 针对插值进行解析
  // v-text指令解析的方法
  text: function (node, vm, exp) {
    this.bind(node, vm, exp, 'text');
  },
  // v-html指令的解析方法
  html: function (node, vm, exp) {
    this.bind(node, vm, exp, 'html');
  },
  // v-model指令解析的方法
  model: function (node, vm, exp) {
    this.bind(node, vm, exp, 'model');

    var me = this,
      val = this._getVMVal(vm, exp);
    node.addEventListener('input', function (e) {
      var newValue = e.target.value;
      if (val === newValue) {
        return;
      }

      me._setVMVal(vm, exp, newValue);
      val = newValue;
    });
  },
  // v-class指令解析的方法
  class: function (node, vm, exp) {
    this.bind(node, vm, exp, 'class');
  },
  // bind方法, node-----'{{ msg }}' vm---vm  exp----'msg'   dir----'text'
  bind: function (node, vm, exp, dir) {
    //  var updaterFn = updater['textUpdater'];
    // updaterFn------updater对象中的textUpdater函数
    var updaterFn = updater[dir + 'Updater'];
    // 判断函数如果在的情况下,直接调用, node-----'{{ msg }}'
    updaterFn && updaterFn(node, this._getVMVal(vm, exp));

    new Watcher(vm, exp, function (value, oldValue) {
      updaterFn && updaterFn(node, value, oldValue);
    });
  },

  // 事件指令的解析方法,node----button  vm--vm   exp---'showMsg'  dir----'on:click'
  eventHandler: function (node, vm, exp, dir) {
    // eventType----'click'
    var eventType = dir.split(':')[1],
      // fn----showMsg
      fn = vm.$options.methods && vm.$options.methods[exp];
     // 判断事件名字(类型)和回调函数是否都存在
    if (eventType && fn) {
      // 为按钮绑定事件监听及对应的回调函数
      node.addEventListener(eventType, fn.bind(vm), false);
    }
  },
 // 根据vm获取msg属性的值
  _getVMVal: function (vm, exp) {
    var val = vm;
    exp = exp.split('.');
    exp.forEach(function (k) {
      val = val[k];
    });
    return val;
  },

  _setVMVal: function (vm, exp, value) {
    var val = vm;
    exp = exp.split('.');
    exp.forEach(function (k, i) {
      // 非最后一个key，更新val的值
      if (i < exp.length - 1) {
        val = val[k];
      } else {
        val[k] = value;
      }
    });
  }
};

// 更新节点相关的方法
var updater = {
  // 插值的解析方法或者是v-text
  textUpdater: function (node, value) {
    node.textContent = typeof value == 'undefined' ? '' : value;
  },
  // v-html的解析方法
  htmlUpdater: function (node, value) {
    node.innerHTML = typeof value == 'undefined' ? '' : value;
  },
  // v-class解析的方法
  classUpdater: function (node, value, oldValue) {
    // 获取节点已经存在的class的名字
    var className = node.className;
    // 替换无用的控制
    className = className.replace(oldValue, '').replace(/\s$/, '');
    // 产生一个空格
    var space = className && String(value) ? ' ' : '';
    // className---'cls2' + ' ' + 'cls'
    node.className = className + space + value;
  },
  // v-model指令的解析方法
  modelUpdater: function (node, value, oldValue) {
    node.value = typeof value == 'undefined' ? '' : value;
  }
};