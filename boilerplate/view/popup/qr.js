import { GET_QR } from '../../background/action.mjs';
import { messageBus } from "../../js/helper.mjs"
import {} from '../../js/jsqr@1.4.0/jsQR.min.js';
/*  <script src="../../js/jsqr@1.4.0/jsQR.min.js" defer></script> でもいい */

const sleep = (time) => new Promise((r) => setTimeout(r, time));

async function runCamera(videoId, canvasId, width, height, callback) {
  try {

    var video = document.getElementById(videoId);
    var canvasElement = document.getElementById(canvasId);
    var canvas = canvasElement.getContext("2d", { willReadFrequently: true });

    // facingMode: "environment" : バックカメラ
    // facingMode: "user"        : フロントカメラ
    const stream = await navigator.mediaDevices.getUserMedia({ audio: false, video: {width:width, height:height} });
    video.srcObject = stream;
    video.setAttribute("playsinline", true); // required to tell iOS safari we don't want fullscreen
    video.play();
    requestAnimationFrame(tick);
    // video.onloadeddata = () => { }

    async function tick() {
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvasElement.hidden = false;
        canvasElement.height = video.videoHeight;
        canvasElement.width = video.videoWidth;
        canvas.drawImage(video, 0, 0, canvasElement.width, canvasElement.height);
        var imageData = canvas.getImageData(0, 0, canvasElement.width, canvasElement.height);

        var code = jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: "dontInvert", });
        if (code) {
          // drawLine...
          callback(code)
          return;
        }
      }
      requestAnimationFrame(tick);
    }

  } catch (error) {
    console.error('Error accessing camera:', error);
  }
} 

document.addEventListener("DOMContentLoaded", async () => {
  await runCamera("video", "canvas", 320, 320, async (code)=>{
    const res = await messageBus.sendMessage({ 
      action : GET_QR,
      payload : code
    });
    console.log("response from background:", res);
    await sleep(1000);
    window.close()
  });
});


