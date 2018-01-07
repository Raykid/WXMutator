# WXMutator
一个用于优化微信小程序中的绑定功能的插件程序，引入该程序后无需再调用setData来更新ViewModel，只需像普通赋值一样设置属性即可触发ViewModel的更新，且不限深度

#### 安装
使用npm安装，如下：

    npm i wxmutator

#### 使用方法
微信小程序不会编译node_modules下的文件，因此目前需要手动将wxmutator.js文件拷贝到与启动文件同级目录中，然后在启动文件里引用，如下：

    import "wxmutator";

以前的写法：

    new Page({
        data: {
            something: 1
        },
        onLoad: function() {
            // 老的更新逻辑
            this.setData({
                something: 2
            });
        }
    });

现在的写法：

    new Page({
        data: {
            something: 1
        },
        onLoad: function() {
            // 这是新的更新逻辑！
            this.data.something = 2;
        }
    });