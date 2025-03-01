// @ts-check

// @ts-ignore
const action = chrome.action;
// @ts-ignore
const runtime = chrome.runtime;
// @ts-ignore
const tabs = chrome.tabs;

/**
 * favicon event
 * mouseup等は取得できないので複数クリックまで
 * android Edgeではsingle clickしか認識しないので使いどころがない
 */
class MultiClick {

  constructor() {
    this.CLICK_INTERVAL_TIME = 200;
    this.clickCount = 0;
    this.clickTimer = null;
  }

  addListener(callback) {
    action.onClicked.addListener((event) => {
      const now = Date.now();
      this.clickCount++;
      if (this.clickTimer) { 
        clearTimeout(this.clickTimer);
      }
      this.clickTimer = setTimeout(() => {
        callback(this.clickCount, event);
        this.clickCount = 0;
      }, this.CLICK_INTERVAL_TIME);
    });
  }

}
export const multiClick = new MultiClick();

export async function callView(type, url) {
  if(type == 'tab'){
    const extensionId = runtime.id;
    const [firsttab] = await tabs.query({ url : `chrome-extension://${extensionId}/${url}` });
    if(firsttab){
      tabs.update(firsttab.id, { active: true })
    }else{
      tabs.create({ url: url });
    }
  } else {
    action.setPopup({popup: url});
    action.openPopup();
    action.setPopup({popup: ''});
  }
}


/* not use */
export function inputDOM(message){
  for (const [id, value] of Object.entries(message.payload)) {
    // const input = document.querySelector(`[data-testaria="${key}"]`);
    const input = document.getElementById(id);
    if (input instanceof HTMLInputElement) {
      input.value = value;
      console.log(`OK : ${id}: ${value}`);
    } else {
      console.log(`not found : ${id}: ${value}`);
    }
  }
  const button = document.getElementById("sf_submit");
  if (button) { button.click(); }
}
