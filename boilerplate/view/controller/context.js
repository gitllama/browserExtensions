// @ts-check

import { SET_STATE, CLICK_ACTION } from "../../background/action.mjs"
import { messageBus, state, sendMessageLocalhost } from "../../js/helper.mjs"
import { openWorkerView } from "../../js/gui_helper.mjs"

const ID_QR = 'action_qr';
const ID_QR_TAB = 'action_qr_tab';
const SEND_HOST = 'send_to_localhost';
const CAN_CHANGE_CONTEXT = 'can_change_context';
const SELECT_CONTEXT = 'select_context';
const CONTENT_CONTEXT = 'content_context';

// @ts-ignore
const runtime = chrome.runtime;
// @ts-ignore
const contextMenus = chrome.contextMenus;

/******** Init ********/

/******** GUI Build ********/
{
  runtime.onInstalled.addListener(() => {
    contextMenus.create({
      id: ID_QR,
      title: "Read QR",
      contexts: ["action"]
    });
    contextMenus.create({
      id: ID_QR_TAB,
      title: "Read QR on tab",
      contexts: ["action"]
    });
    contextMenus.create({
      id: SEND_HOST,
      title: "Send LocalHost Test",
      contexts: ["action"]
    });

    contextMenus.create({
      id: CONTENT_CONTEXT,
      title: "post content",
      contexts: ["image", "video", "audio", "link"]
    });
    contextMenus.create({
      id: CAN_CHANGE_CONTEXT,
      title: "unknown",
      contexts: ["page"]
    });
    contextMenus.create({
      id: SELECT_CONTEXT,
      title: "post select",
      contexts: ["selection"]
    });
  });
  
  runtime.onStartup.addListener(async () => { });  
}

/******** GUI Event ********/
{
  contextMenus.onClicked.addListener(async (info, _window) => {
    /*
      判別に使いそうなvalue.newValue内の値
      menuItemId, mediaType, pageUrl, linkUrl, srcUrl, etc...

      自動で判別するには
      const target = {
        page: () => new URL(info.pageUrl),
        link: () => new URL(info.linkUrl),
        selection: () => new URL(info.pageUrl),
        content: () => new URL(info.srcUrl),
        icon: () => new URL(info.pageUrl)
      }[info.menuItemId]?.() || undefined;
      など
    */
    switch (info.menuItemId) {
      case ID_QR: 
      {
        openWorkerView('popup', "view/popup/qr.html")
      } break;
      case ID_QR_TAB: 
      {
        openWorkerView('tab', "view/popup/qr.html")
      } break;
      case SEND_HOST: 
      {
        let host = await state.getAsync("host");
        sendMessageLocalhost(host + "api", {
          program : "cmd",
          args : ["/C", "echo", "echo test"]
        })
      } break;
      case SELECT_CONTEXT: 
      {
      } break;
      case CONTENT_CONTEXT: 
      {
      } break;
      default :
        break;
    }
  });
}


/******** Notification / updateGUI ********/
state.addNotification('local', async (key, value)=>{

  switch(key){
    case "activetab":{
      // disableは消えるわけではないので、remove -> createの方がいい
      try{
        const host = (new URL(value.newValue.url)).host;
        contextMenus.update(CAN_CHANGE_CONTEXT,{
          title: host,
        });
      } catch {
        contextMenus.update(CAN_CHANGE_CONTEXT,{
          title: "null",
        });
      }
      contextMenus.update(SELECT_CONTEXT,{
        title: value.newValue.selection,
      });
    } break;
    default:
      break;
  }
})



