// @ts-check

import { SET_STATE, CLICK_ACTION, ACTIVE_TAB } from "../../background/action.mjs"
import { messageBus, state } from "../../js/helper.mjs"
import { multiClick, callView } from "../../js/gui_helper.mjs"

// @ts-ignore
const action = chrome.action;
// @ts-ignore
const runtime = chrome.runtime;
// @ts-ignore
const tabs = chrome.tabs;


async function openNewTab(target) {
  const [firsttab] = await tabs.query({ url : target });
  if(firsttab) {
    /* 既に存在 > active化 */
    await tabs.update(firsttab.id, { active: true })
  } else {
    /* 存在しない > create */
    const _newtab = await tabs.create({ url: target });
  }
}

/******** Init ********/

/******** GUI Build ********/
{
  runtime.onInstalled.addListener(async () => { });
  runtime.onStartup.addListener(async () => { }); 

  tabs.onActivated.addListener((info) => {
    tabs.get(info.tabId, (tab) => {
      messageBus.sendMessageAsync({
        action : ACTIVE_TAB,
        payload : tab
      })
    });
  });
  tabs.onUpdated.addListener((id, info, tab) => {
    if(tab.active){
      messageBus.sendMessageAsync({
        action : ACTIVE_TAB,
        payload : tab
      })
    }
  });
}

/******** GUI Event ********/
{
  //onClicked icon
  multiClick.addListener(async (cnt, event)=>{
    console.log(cnt);
    switch (cnt) {
      case 1:
        messageBus.sendMessage({
          action: CLICK_ACTION, 
          payload: null
        });
        messageBus.sendMessage({
          action: SET_STATE, 
          payload: {
            count : null
          }
        });
        break;
      case 2:
        // chrome.windows.create({
        //   url: "https://qiita.com/hukurouo/items/961575f00b4363df0b16",
        //   type: 'popup',
        //   // Youtubeで丁度よく窓化できるサイズ
        //   width: 650, height: 450,
        //   focused: true
        // }, (window) => {
        //   if (window && window.id) {
        //       // ウィンドウを最小化する
        //       chrome.windows.update(window.id, { state: "minimized" });
        //   }
        // });
        callView("view/popup/filepicker.html")
        messageBus.sendMessage({
          action: SET_STATE, 
          payload: {
            count : null
          }
        });
      
        break;
      default:
        messageBus.sendMessage({
          action: SET_STATE, 
          payload: {
            count : cnt
          }
        });
        break;
    }
  })


}

/******** Notification / updateGUI ********/
state.addNotification('local', async (key, value)=>{
  const cfg = await state.getAsync(null);
  console.log(`[notification] ${key} isChange ${value.oldValue != value.newValue}`, value, cfg)
  switch(key){
    case "flag" : {
      const flag = value.newValue ?  "active" : "static";
      await action.setIcon({
        path: { 
          "48": runtime.getURL(`icon/${flag}_48.png`)
        }
      });
      await action.setTitle({ title: `boilerplate\r\n${flag}` });
    } break;
    case "count" : {
      if(value?.newValue && value?.newValue > 1){
        await action.setBadgeText({ text : `${value.newValue}` });
      } else {
        await action.setBadgeText({ text : "" });
      }
    } break;
    default:
      break;
  }
})
