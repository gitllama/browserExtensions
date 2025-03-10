import { messageBus } from "../../js/helper.mjs"

async function showFilePicker(){
  try {
    const [handle] = await window.showOpenFilePicker({
      types: [
        {
          description: "Config File",
          accept: { "text/plain": [".json", ".yaml", ".yml"], },
        },
      ],
    });
    const file = await handle.getFile();
    const text = await file.text();
    const res = await messageBus.sendMessage({ 
      action : "log",
      payload : text
    });

  } catch (err) {
    const res = await messageBus.sendMessage({ 
      action : "log",
      payload : err
    });
    window.close()
  }
}

document.addEventListener("DOMContentLoaded", () => { });

const fileInput = document.getElementById('file_upload');
fileInput.addEventListener('change', async (e) => {
  console.log(e)
  const [file] = fileInput.files;
  const text = await file.text();
});

