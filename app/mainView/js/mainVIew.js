const {
  ipcRenderer,
  remote
} = require('electron');

// Fetch the preferences object
const preferences = ipcRenderer.sendSync('getPreferences');
const Toast = require('bootstrap/js/dist/toast')
let isConnect = false;

// btn
const config_btn = document.querySelector('.config_btn');
const connect_btn = document.querySelector('.connect_btn');
const disconnect_btn = document.querySelector('.disconnect_btn');
const open_overlay_btn = document.querySelector('.open_overlay_btn');
const close_overlay_btn = document.querySelector('.close_overlay_btn');
const copy_btn = document.querySelector('.copy_btn');
const copy_target = document.querySelector('#copyTarget');

checkPram(preferences);

// Display the preferences window
config_btn.addEventListener('click', function () {
  ipcRenderer.send('showPreferences');
});

connect_btn.addEventListener('click', function () {
  ipcRenderer.send('eval','connect');
});
disconnect_btn.addEventListener('click', function () {
  ipcRenderer.send('eval','disconnect');
  this.classList.add('d-none');
  connect_btn.classList.remove('d-none');
});

open_overlay_btn.addEventListener('click', function () {
  ipcRenderer.send('eval','openOverlay');
  this.classList.add('d-none');
  close_overlay_btn.classList.remove('d-none');
});
close_overlay_btn.addEventListener('click', function () {
  ipcRenderer.send('eval','closeOverlay');
  this.classList.add('d-none');
  open_overlay_btn.classList.remove('d-none');
});

ipcRenderer.on('preferencesUpdated', (e, preferences) => {
  checkPram(preferences);
});

ipcRenderer.on('connected', function(e, preferences) {
  open_overlay_btn.disabled = false;
  config_btn.disabled = true;
  connect_btn.classList.add('d-none');
  disconnect_btn.classList.remove('d-none');
});

ipcRenderer.on('disconnected', (e, preferences) => {
  open_overlay_btn.disabled = true;
  open_overlay_btn.classList.remove('d-none');
  close_overlay_btn.classList.add('d-none');
  config_btn.disabled = false;
  connect_btn.classList.remove('d-none');
  disconnect_btn.classList.add('d-none');
});


ipcRenderer.on('overlayClosed', (e) => {
  open_overlay_btn.disabled = false;
  open_overlay_btn.classList.remove('d-none');
  close_overlay_btn.classList.add('d-none');
});

copy_btn.addEventListener('click', copyToClipboard);

function checkPram(params) {
  connect_btn.disabled = params.basic.comment_url ? false : true;
  open_overlay_btn.disabled = isConnect ? false : true;
  copy_target.value = 'localhost:' + params.basic.port;
}

function copyToClipboard() {
  // コピー対象をJavaScript上で変数として定義する

  // コピー対象のテキストを選択する
  copy_target.select();

  // 選択しているテキストをクリップボードにコピーする
  document.execCommand("Copy");
  toastList[0].show();
}

var toastElList = [].slice.call(document.querySelectorAll('.toast'))
const option = {
  option : 500
}
var toastList = toastElList.map(function (toastEl) {
  return new Toast(toastEl, option)
})
console.log(toastList)