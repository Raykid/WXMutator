/// <reference types="weixin-app" />
/**
 * 将用户传进来的数据“变异”成为具有截获数据变更能力的数据
 * @param data 原始数据
 * @returns {any} 变异后的数据
 */
declare function mutate(data: any, page: wx.Page, rootKey?: string, rootData?: any): any;
declare function mutateObject(data: any, key: string, page: wx.Page, rootKey: string, rootData: any): void;
declare var hash: number;
declare var hashTypes: string[];
/**
 * 获取一个对象的对象哈希字符串
 *
 * @param {*} target 任意对象，可以是基础类型或null
 * @returns {string} 哈希值
 */
declare function getObjectHash(target: any): string;
/**
 * 获取多个对象的哈希字符串，会对每个对象调用getObjectHash生成单个哈希值，并用|连接
 *
 * @param {...any[]} targets 希望获取哈希值的对象列表
 * @returns {string} 多个对象共同作用下的哈希值
 */
declare function getObjectHashs(...targets: any[]): string;
