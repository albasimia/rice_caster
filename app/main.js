const electron = require('electron');
const path = require('path');
const pie = require("puppeteer-in-electron");
const puppeteer = require("puppeteer-core");
const ElectronPreferences = require('electron-preferences');
const default_config = require('./default_config.json');
const config_template = require('./config_template.json');

// default設定の読み込み
const settings = {
  'dataStore': path.resolve(electron.app.getPath('userData'), 'preferences.json'),
  'webPreferences': {
    'devTools': true
  },
};
settings['defaults'] = default_config;
settings['sections'] = config_template;

const preferences = new ElectronPreferences(settings);

// サーバー立ち上げ
var nodeStatic = require('node-static');
const {
  ipcMain
} = require('electron');
const file = new nodeStatic.Server(path.join(__dirname, 'commentView/'));

const winWidth = 500;
const winHeight = 500;

// electron初期化
class App {
  constructor(electron) {
    this.app = electron.app;
    this.mainView;
    this.commentView;
    this.preferences;
    this.app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        this.quit();
      };
    });
    this.app.addListener('ready', function () {
      this.mainView = new electron.BrowserWindow({
        width: winWidth,
        height: winHeight,
        webPreferences: {
          nodeIntegration: true,
          contextIsolation: false,
        }
      });
      this.mainView.loadURL('file://' + __dirname + '/mainView/index.html');
      mainView = this.mainView;

      this.mainView.on('closed', () =>{
        this.quit();
      });
    });
  }
  openOverlay() {
    // commentView
    const size = electron.screen.getPrimaryDisplay().size
    this.commentView = new electron.BrowserWindow({
      width: size.width,
      height: size.height,
      transparent: true,
      frame: false,
      resizable: false,
      alwaysOnTop: true,
    });
    this.commentView.loadURL('http://localhost:' + preferences.value('basic.port'));
    this.commentView.setIgnoreMouseEvents(true);
    commentView = this.commentView;
  }
  closeOverlay(){
    this.commentView.close();
    commentView = null;
  }
}

let mainView;
let commentView;
let server;
let io;
const commentApp = new App(electron);

// puppeteerの準備
let browser;
(async () => {
  await pie.initialize(electron.app);
  browser = await pie.connect(electron.app, puppeteer);
})();

// 関数実行用のリスナー
ipcMain.on('eval', function (e, arg) {
  eval(arg + '()');
});

// オーバーレイ用ウインドウを開く
const openOverlay = () => {
  commentApp.openOverlay();
  mainView.webContents.send('overlayOpend');
}
const closeOverlay = () => {
  commentApp.closeOverlay();
  mainView.webContents.send('overlayClosed');
}

let twicasView;
const connect = async () => {

  // サーバー初期化
  server = require('http').createServer(function (request, response) {
    request.addListener('end', function () {
      file.serve(request, response);
    }).resume();
  }).listen(preferences.value('basic.port'));
  io = require('socket.io')(server);

  const url = preferences.value('basic.comment_url');
  twicasView = new electron.BrowserWindow({
    width: 0,
    height: 0,
    transparent: true,
    frame: false,
    resizable: false,
  });
  await twicasView.loadURL(url);

  // twicasのコメントを取得
  const page = await pie.getPage(browser, twicasView);

  let adddom = await page.evaluate(() => {
    const target = document.querySelector('.tw-comment-list-view__scroller div')
    const observer = new MutationObserver(records => {
      const comment = records[0].addedNodes[0];
      const nameEle = comment.querySelector('.tw-comment-item-name')
      const commentEle = comment.querySelector('.tw-comment-item-comment')
      const commentUserId = comment.querySelector('.tw-comment-item-screen-id')
      const itemImage = comment.querySelector('.tw-comment-item-attachment img')
      const resObj = {
        userId: commentUserId.innerText,
        name: nameEle.innerText,
        dataType: comment.getAttribute('data-type'),
        comment: String(commentEle.innerHTML.replace(/&/g, "&amp;")
          .replace(/"/g, "&quot;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")),
        date: commentEle.getAttribute('title'),
        itemImage: itemImage ? itemImage.getAttribute('src') : ''
        // itemImage: String(itemImage.innerHTML.replace(/&/g, "&amp;")
        // .replace(/"/g, "&quot;")
        // .replace(/</g, "&lt;")
        // .replace(/>/g, "&gt;")),
      }
      console.log(JSON.stringify(resObj))
    })
    observer.observe(target, {
      childList: true
    })
  })
  page.on('console', async (msg) => {
    io.emit('comment', msg._text);
  })
  mainView.webContents.send("connected");
};

const disconnect = () =>{
  twicasView.destroy();
  if(commentView) {
    commentView.close();
  }
  // TODO:クライアント側でsocketのdiconnect処理
  // io.emit('discconect');
  server.close();
  mainView.webContents.send("disconnected");
}