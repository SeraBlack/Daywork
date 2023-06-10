// interface MyFunc { 
//   sayHello():void
// }
// function sayHi():void {
 
//  }

// 一种能力/一种规范、也可以用来定义数据的类型
// interface IFly { 
//   fly():void  // 飞的行为
// }
// interface Swim { 
//   swim():void // 游泳
// }
// interface MyInter extends IFly, Swim { 

// }
// // class Person implements IFly,Swim { 
// class Person implements MyInter { 
//   fly(): void { 
//     console.log('飞起来了')
//   }
//   swim(): void { 
//     console.log('游起来')
//   }
// }


// 基类/父类
abstract class Animal { 
  name:'xxx'
  abstract eat(): void  // 抽象方法是不能有具体的实现的
  run () {
    console.log('run()')
  }
}
// 派生类/子类
class Dog extends Animal { 
  eat() {
    console.log('舔着吃') // 重写
  }
}

