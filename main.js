const electron = require('electron');
const url = require('url');
const path = require('path');

// サーバー立ち上げ
var nodeStatic = require('node-static');
var file = new nodeStatic.Server(path.join(__dirname, 'commentView/'));

const server = require('http').createServer(function (request, response) {
  request.addListener('end', function () {
    file.serve(request, response);
  }).resume();
}).listen(7170); //ポートは空いていそうなところで。

const io = require('socket.io')(server);


// electron初期化
const {
  app,
  BrowserWindow
} = electron;

let mainWindow;

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  };
});

app.on('ready', function () {
  const size = electron.screen.getPrimaryDisplay().size
  mainWindow = new BrowserWindow({
    width: size.width,
    height: size.height,
    transparent: true,
    frame: false,
    resizable: false,
    alwaysOnTop: true,
  });

  // mainWindow.webContents.openDevTools()
  mainWindow.setIgnoreMouseEvents(true)
  // file://dirname/index.html
  // mainWindow.loadURL(url.format({
  //   pathname: path.join(__dirname, 'window/index.html'),
  //   protocol: 'file',
  //   slashes: true
  // }));
  mainWindow.loadURL('http://localhost:7170/')

  mainWindow.on('closed', function () {
    app.quit();
  });
});



const puppeteer = require('puppeteer');

(async function () {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('https://twitcasting.tv/black_ape/windowcomment?embedded=1&auth_user_id=black_ape&auth_key=mu89hz0sbz');
  // await page.screenshot({path: 'example.png'});
  let adddom = await page.evaluate(() => {
    const target = document.querySelector('.tw-comment-list-view__scroller div')
    const observer = new MutationObserver(records => {
      const comment = records[0].addedNodes[0];
      const nameEle = comment.querySelector('.tw-comment-item-name')
      const commentEle = comment.querySelector('.tw-comment-item-comment')
      const resObj = {
        name: nameEle.innerText,
        dataType: comment.getAttribute('data-type'),
        comment: String(commentEle.innerHTML.replace(/&/g, "&amp;")
          .replace(/"/g, "&quot;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")),
        date: commentEle.getAttribute('title')
      }
      console.log(JSON.stringify(resObj))
      // console.log(comment.querySelector('.tw-comment-item'))
      // console.log(comment)
    })
    observer.observe(target, {
      childList: true
    })
  })
  page.on('console', async (msg) => {
    // console.log(msg._text)
    // console.log(mainWindow.webContents)
    // mainWindow.webContents.send('ping', 'whoooooooh!')
    io.emit('comment', msg._text);
  })


  // await browser.close();
})();