// @ts-check
(async () => {
  // @ts-ignore
  const { state } = await import(chrome.runtime.getURL("js/helper.mjs"));
  // @ts-ignore
  const _ = await import(chrome.runtime.getURL("js/hammer.js@2.0.8/hammer.min.js"));

  // @ts-ignore
  if (navigator.userAgentData && navigator.userAgentData.mobile) {
    console.log("mobile")
  }else{
    console.log("PC")
  }

  /******** Init ********/
  {
  }
  
  /******** GUI Build ********/
  {
    
  }
  /******** GUI Event ********/
  {
    // @ts-ignore
    const Hammer = window.Hammer;
    const manager = new Hammer.Manager(document.documentElement,{ touchAction: 'auto' });

    /* Press Event */
    manager.add( new Hammer.Press({ time: 500 }) );
    manager.add( new Hammer.Swipe({  }) );

    // let flag = null
    manager.on('press', (e) => {
      console.log("press", e)
    });

    manager.on('swipe', async (e) => {
      /*
        DIRECTION_NONE       : 1
        DIRECTION_LEFT       : 2
        DIRECTION_RIGHT      : 4
        DIRECTION_UP         : 8  e.deltaY < 0
        DIRECTION_DOWN       : 16 e.deltaY > 0
        DIRECTION_HORIZONTAL : 6
        DIRECTION_VERTICAL   : 24
        DIRECTION_ALL        : 30
      */
      switch(e.offsetDirection){
        case 8:
          console.log("swipeup", e)
          break;
        case 4:
          console.log("swiperight", e)
          break;
        default:
          console.log("swipe", e)
          break;
      }
    });

  }

  /******** Notification / updateGUI ********/
  state.addNotification('local', (key, value)=>{ })

})();


  // manager.on('pinchout', (e) => {
  //   const flg = confirm(`pinchout center:${e.center} overallVelocity:${e.overallVelocity}`);
  // });

  // manager.on('press', (e) => {
  //   // sendLog([`press`, JSON.stringify(e.target), e.target.closest("[role]")])
  //   const element = e.target.closest("[role='link']");
  //   if (element) {
  //     let href = element.getAttribute("href"); // 直接 `href` を持つ場合
  //     if (!href) {
  //       // `aria-labelledby` を参照している可能性がある場合
  //       const labeledElement = document.getElementById(element.getAttribute("aria-labelledby"));
  //       if (labeledElement && labeledElement.tagName === "A") {
  //         href = labeledElement.getAttribute("href");
  //       }
  //     }
  //     if(href === "#") {
  //       const realLink = element.querySelector("[href]:not([href='#'])");
  //       sendLog(`リンク先 : ${ realLink }`)
  //     }else{
  //       sendLog(`リンク先 : ${ href }`)
  //     }
  //   } else {
  //     sendLog(`リンク先 : null`)
  //   }
  // });

  // manager.on("twofingerpress", async (event) => {
  //   const response = await sendAction("call_dl", { url : location.href });
  // });

 

  // manager.on("twofingertap", async (event) => {
  //   const dst = await callConfirm("test twofingertap")
  // });



    // contexts : all, page, selection, image, link, frame, editable etc...
  // https://github.com/yt-dlp/yt-dlp/blob/master/supportedsites.md
  // "onclick" : getClickHandler(), Service Worker 内では使用できません
  // "targetUrlPatterns" : ["*://*.google.co.jp/*"]


    // urlが一致するものを登録
    // config.data.map(async (data)=>{
    //   const regex = new RegExp(data.target);
    //   if(regex.test(tab.url)){
    //     await Chrome.contextMenus.create({ });
    //   }
    //   /*
    //     chrome.contextMenus.update("page", {
    //       visible : false
    //     });
    //   */
    // })
