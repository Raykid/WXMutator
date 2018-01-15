/// <reference types="weixin-app"/>

/**
 * @author Raykid
 * @email initial_r@qq.com
 * @create date 2018-01-07
 * @modify date 2018-01-07
 * 
 * 用于将Page的data属性变异，使之直接设置值便可启动更新，而不需要设置setData
*/
if(Page)
{
    let OriPage:wx.PageConstructor = Page;
    Page = function Page(options:wx.PageOptions):void
    {
        // 篡改onLoad方法
        let oriOnLoad:(this:wx.Page, options:any)=>void = options.onLoad;
        options.onLoad = function onLoad():any
        {
            // 变异原始options中的data属性
            mutate(options.data, this);
            // 还要额外变异经过微信小程序处理过的data属性，否则通过this.data赋值不会触发更新
            mutate(this["data"], this);
            // 调用原始onLoad方法
            return oriOnLoad && oriOnLoad.apply(this, arguments);
        };
        // 执行原始方法
        OriPage.apply(this, arguments);
    };
}

/**
 * 将用户传进来的数据“变异”成为具有截获数据变更能力的数据
 * @param data 原始数据
 * @returns {any} 变异后的数据
 */
function mutate(data:any, page:wx.Page, rootKey?:string, rootData?:any):any
{
    // 如果是简单类型，则啥也不做
    if(!data || typeof data != "object") return data;
    // 递归变异所有内部变量，及其__proto__下的属性，因为getter/setter会被定义在__proto__上，而不是当前对象上
    var keys:string[] = Object.keys(data).concat(Object.keys(data.__proto__));
    // 去重
    var temp:any = {};
    for(var key of keys)
    {
        if(!temp[key])
        {
            temp[key] = key;
            mutateObject(data, key, page, rootKey || key, rootData || data[key]);
        }
    }
    return data;
}

function mutateObject(data:any, key:string, page:wx.Page, rootKey:string, rootData:any):void
{
    var depKey:string = getObjectHashs(data, key);
    // 对每个复杂类型对象都要有一个对应的依赖列表
    if(data[depKey] != "mutated")
    {
        // 判断本来这个属性是值属性还是getter/setter属性，要有不同的操作方式
        var desc:PropertyDescriptor = Object.getOwnPropertyDescriptor(data, key) || Object.getOwnPropertyDescriptor(data.__proto__, key);
        if(desc)
        {
            if(desc.hasOwnProperty("value"))
            {
                let setting:boolean = false;
                // 值属性的变异过程
                Object.defineProperty(data, key, {
                    enumerable: true,
                    configurable: false,
                    get: ()=>{
                        // 利用闭包保存原始值
                        return desc.value;
                    },
                    set: v=>{
                        if(!desc.writable || v === desc.value || setting) return;
                        desc.value = v;
                        mutate(v, page, rootKey, rootData);
                        // 间接调用setData方法
                        let temp:any = {};
                        temp[rootKey] = rootData;
                        setting = true;
                        page.setData(temp);
                        setting = false;
                    }
                });
            }
            else
            {
                let setting:boolean = false;
                // getter/setter属性的变异过程
                Object.defineProperty(data, key, {
                    enumerable: true,
                    configurable: false,
                    get: ()=>{
                        if(!desc.get) return;
                        // 返回get方法结果
                        return desc.get.call(data);
                    },
                    set: v=>{
                        if(!desc.set || setting) return;
                        // 设置
                        desc.set.call(data, v);
                        mutate(v, page, rootKey, rootData);
                        // 间接调用setData方法
                        let temp:any = {};
                        temp[rootKey] = rootData;
                        setting = true;
                        page.setData(temp);
                        setting = false;
                    }
                });
            }
        }
        // 打一个标记表示已经变异过了
        Object.defineProperty(data, depKey, {
            value: "mutated",
            writable: false,
            enumerable: false,
            configurable: false
        });
    }
    // 递归子属性
    mutate(data[key], page, rootKey, rootData);
}

var hash:number = 0;
var hashTypes:string[] = ["object", "function"];
/**
 * 获取一个对象的对象哈希字符串
 * 
 * @param {*} target 任意对象，可以是基础类型或null
 * @returns {string} 哈希值
 */
function getObjectHash(target:any):string
{
    if(target == null) return "__object_hash_0__";
    var key:string = "__object_hash__";
    var value:string;
    // 只有当前对象上有key才算
    if(target.hasOwnProperty(key)) value = target[key];
    // 如果已经有哈希值则直接返回
    if(value) return value;
    // 如果是基础类型则直接返回对应字符串
    var type:string = typeof target;
    if(hashTypes.indexOf(type) < 0) return type + ":" + target;
    // 如果是复杂类型则返回计算的哈希值并打上标签
    var value:string = "__object_hash_" + (++hash) + "__";
    Object.defineProperty(target, key, {
        configurable: true,
        enumerable: false,
        writable: false,
        value: value
    });
    return value;
}

/**
 * 获取多个对象的哈希字符串，会对每个对象调用getObjectHash生成单个哈希值，并用|连接
 * 
 * @param {...any[]} targets 希望获取哈希值的对象列表
 * @returns {string} 多个对象共同作用下的哈希值
 */
function getObjectHashs(...targets:any[]):string
{
    var values:string[] = targets.map(target=>getObjectHash(target));
    return values.join("|");
}