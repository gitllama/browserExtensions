// @ts-check


// @ts-ignore
const runtime = chrome.runtime;
// @ts-ignore
const storage = chrome.storage;

class MessageBus {

  constructor() {
    this.listeners = [];
    if(typeof window !== 'undefined' && window.document){
      console.log('MessageBus in content');
      // MessageBus.addListenerの登録
      this.addListener(async (message) => {
        return new Promise((resolve, reject) => {
          const a = {
            script : this.getCurrentScriptFilename(),
            url : location.href,
          }
          runtime.sendMessage({ ...a, ...message }).then(resolve).catch(reject);
        })
      });
    }else{
      console.log('MessageBus in background');
      // onMessage.addListenerの登録
      runtime.onMessage.addListener((message, sender, sendResponse) => {
        (async ()=>{
          let dst = await this.sendMessageAsync(message);
          sendResponse(dst);
        } )();
        return true;
      });
    }
  }

  addListener(callback) { 
    this.listeners.push(callback); 
  }

  sendMessage(message, sender = null, sendResponse = null) {
    for(const callback of this.listeners){
      const result = callback(message, sender, sendResponse);
      if (result === true) {
        return true;
      }
    }
  }

  sendMessageAsync(message, sender = null) {
    const promises = this.listeners.map(callback => {
      return new Promise((resolve, reject) => {
        try {
          const res = callback(message, sender);
          if (res instanceof Promise) {
            res.then(resolve).catch(reject);
          } else {
            resolve(res);
          }
        } catch (err) {
          reject(err);
        }
      });
    });
    return Promise.allSettled(promises);
  }

  getCurrentScriptFilename(index) {
    try {
      throw new Error();
    } catch (e) {
      try{
        const stackLines = e.stack.split("\n");
        // const callerLine = stackLines[index] || "";
        const callerLine = stackLines.pop();
        const match = callerLine.match(/chrome-extension?:\/\/[^\/]+\/([^\s)]+)/);
        return match ? match[1] : undefined;
      } catch {
        return "unknown"
      }
  
    }
  }
}

class State {

  constructor() {
    // this.listeners = [];
  }

  /**
   * get status, background / content 共通
   * newValueが存在しないのとnullは明確に区別
   * @param {string} storageName
   * @param {Function} callback
   */
  addNotification(storageName, callback) {
    storage.onChanged.addListener((changes, areaName) =>{
      if(areaName != storageName) return;
      // changes : 変更になった項目だけ流れてくる
      for (const [key, value] of Object.entries(changes)) {
        if(value.hasOwnProperty('newValue')) {
          callback(key, value)
        }else{
          // console.log(`${key} is not have newValue`)
        }
      }
    })
  }

  /**
   * init status, background Only
   */
  async initAsync(object) {
    if(typeof window !== 'undefined' && window.document) {
      throw new Error("not work inside content");
    }
    await storage.local.clear();
    if(object){
      await storage.local.set(object);
    }else{
      const response = await fetch(runtime.getURL("background/default.json"));
      const defaultvalue = await response.json();
      // Object.assign(defaultvalue, obj);
      await storage.local.set(defaultvalue);
    }
    // if (runtime.lastError) {
    //   console.error("Error setting storage:", runtime.lastError);
    // }
  }

  /**
   * get status, background / content 共通
   * @param {string|null} key
   * @return {Promise<any>}
   */
  async getAsync(key) {
    /*
      set Config, local or sync
      chrome.storage.local.get(null, ((config) => { setConfig(JSON.stringify(config)) }));
    */
    if(key) {
      const dst = await storage.local.get(null);
      return dst[key];
    } else {
      return storage.local.get(null);
    }

  }

  /**
   * set status, background Only
   * @param {string} key
   * @param {any} value
   */
  async setAsync(key, value){
    if(typeof window !== 'undefined' && window.document) {
      throw new Error("not work inside content");
    }
    await storage.local.set({[key]: value});
  }

  /**
   * 強制的にEvent発火
   * @param {string} key
   * @return {Promise<any>}
   */
  async notificationChanged(key) {
    const dst = await this.getAsync(key);
    // newValue存在なしはaddNotificationで無視
    storage.local.remove(key, () => {
      storage.local.set({ [key] : dst });
    });
  }
  
}

export const messageBus = new MessageBus();
export const state = new State();


/**
 * メッセージの送信
 * @param {string} url
 * @param {object} message
 * @param {string} message.program
 * @param {string[]} message.args
 * @param {boolean|undefined} [message.option]
 */
export async function sendMessageLocalhost(url, message){
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(message)
  });
  const resdata = await res.json();
  console.log({ success: true, resdata })
}


