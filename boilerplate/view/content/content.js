// @ts-check
(async () => {
  // @ts-ignore
  const { ACTIVE_TAB_SELECTION } = await import(chrome.runtime.getURL("background/action.mjs"));
    // @ts-ignore
  const { messageBus, state } = await import(chrome.runtime.getURL("js/helper.mjs"));

  /******** Init ********/
  {
    /* log先の差し替え */
    // attachBackgroundLog();

    /* config */
    // const config = await state.getAsync(null);
    // console.log("[config]", config)
  }
  
  /******** GUI Build ********/
  {
    
  }
  /******** GUI Event ********/
  {
    document.addEventListener("selectionchange", () => {
      const selection = window.getSelection();
      if (selection && selection.toString().length > 0) {
        messageBus.sendMessageAsync({
          action : ACTIVE_TAB_SELECTION,
          payload : selection.toString()
        })
      }
  });
  }

  /******** Notification / updateGUI ********/
  state.addNotification('local', (key, value)=>{

  })

})();