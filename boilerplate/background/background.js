// @ts-check

import { messageBus, state } from "../js/helper.mjs"
import * as Action from "./action.mjs"
import { } from "../view/controller/favicon.js"
import { } from "../view/controller/context.js"
import _jsYaml from "../js/js-yaml@4.1.0/js-yaml.mjs"

//@ts-ignore
const runtime = chrome.runtime;

/******** onInstalled / onStartup ********/
runtime.onInstalled.addListener(async () => { 
  // const res = await fetch(runtime.getURL("default.yaml"));
  // const resdata = await res.text();
  // let base = jsYaml.load(resdata);
  // await state.initAsync(base); 

  await state.initAsync(null); 
});
runtime.onStartup.addListener(async () => {
  const obj = await state.getAsync(null);
  // 強制的にnotificationChangedで強制的に発火
  for(const [key,value] of Object.entries(obj)){
    state.notificationChanged(key)
  }
});


/******** onSuspend ********/
runtime.onSuspend.addListener(async () => { console.log("onSuspend") });


/******** from content.js ********/
messageBus.addListener(async (message) => {
  try {
    console.log("[toAction]", message)
    switch(message.action){
      case Action.LOG: {
        console.log(`[LOG from ${message.script}]`, message.payload)
      } break;
      case Action.SLEEP: {
        await new Promise((resolve) => setTimeout(resolve, message.payload));
        return "sleep"
      } break;
      case Action.CLICK_CONFIRM: {
        console.log(`[CLICK_CONFIRM]`, message.payload)
      } break;
      case Action.SET_STATE: {
        const [[key, value]] = Object.entries(message.payload);
        await state.setAsync(key, value)
      } break;
      case Action.CLICK_ACTION: {
        const flag = await state.getAsync("flag");
        await state.setAsync("flag", !flag )
      } break;
      case Action.GET_QR: {
        console.log("qr", message.payload)
      } break;
      case Action.ACTIVE_TAB: {
        const hoge = message.payload;
        await state.setAsync("activetab", {
          id : hoge.id,
          url : hoge.url,
        } )
      } break;
      case Action.ACTIVE_TAB_SELECTION: {
        let base = await state.getAsync("activetab");
        await state.setAsync("activetab", { ...base, selection : message.payload })
      } break;
      default : {
        console.warn("[unknown action]", message)
      } break;
    }
  } catch (error) {
    console.error("[action]", error)
  }
  return true;
});