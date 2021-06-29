const min = 5;
const max = 95;
const socket = io();
const cssTarget = document.querySelector(':root')
const commentsArea = document.getElementById('comments')
const commentsUeArea = document.querySelector('#comments-ue .commentsCtr')
const commentsShitaArea = document.querySelector('#comments-shita .commentsCtr')
const commentsNakaArea = document.querySelector('#comments-naka .commentsCtr')
let preferenses = {};
let useCommand = [];
let isDisplayName = false;

socket.on('comment', (msg) => {
  const commentObj = JSON.parse(msg)
  let comment = commentObj.comment
  const command = comment.match(/\[.*\]/g)
  let replacedCommand = ''
  let commandArray = []
  if (command) {
    replacedCommand = String(command).replace(/\[|\]/g, "")
    tempCommandArray = replacedCommand.split(' ')
    tempCommandArray.forEach(com => {
      if (useCommand.includes(com)) {
        commandArray.push(com);
      }
    });
    comment = String(comment).replace(/(\[.*\])/g, "")
  }
  if (commandArray.indexOf('invisible') == -1) {
    comment = String(comment)
      .replace(/&amp;/g, "&")
      .replace(/&lt;span class=&quot;tw-reply-id&quot;&gt;/g, "")
      .replace(/&lt;\/span&gt;/g, "")
      .replace(/&nbsp;/g, " ")
      // .replace(/&lt;br/g, "<br")
      // .replace(/&amp;lt;img/g, "<img")
      .replace(/&gt;/g, ">")
      .replace(/&lt;/g, "<")
      .replace(/&quot;/g, '"')
      .replace(/src="/g, 'src="https://twitcasting.tv')
    let top = random = Math.floor(Math.random() * max - min) + min;
    const commentDomStr = `<div class='commentWrapper ${commandArray.join(' ')}' data-type='${commentObj.dataType}'>
          <div class='commentInner'>
            <div class='name' ${isDisplayName ? 'style="display:block"': ""}>${commentObj.name}</div>
            <div class='comment'>${comment}</div>
          </div>
          </>`
    const commentDom = createElementFromHTML(commentDomStr)
    // const commentDomHeight = commentDom.scrollHeight
    // console.log((100 - top) / 100 * window.outerHeight, commentDomHeight)
    // if((100 - top) / 100 * window.outerHeight < commentDomHeight){
    //   top = top - commentDomHeight
    // }
    // commentDom.style.top = `${top}%`

    commentDom.addEventListener('animationend', function () {
      this.parentNode.removeChild(this);
    });

    if (commandArray.indexOf("ue") != -1) {
      commentsUeArea.appendChild(commentDom)
    } else if (commandArray.indexOf('shita') != -1) {
      commentsShitaArea.appendChild(commentDom)
    } else if (commandArray.indexOf('naka') != -1) {
      commentsNakaArea.appendChild(commentDom)
    } else {
      commentsArea.appendChild(commentDom)
    }
    const commentDomHeight = commentDom.scrollHeight
    // console.log((100 - top) / 100 * commentsArea.scrollHeight, commentDomHeight)
    if ((100 - top) / 100 * commentsArea.scrollHeight < commentDomHeight) {
      const deff = commentDomHeight - (100 - top) / 100 * commentsArea.scrollHeight;
      top = top / 100 * commentsArea.scrollHeight - deff
      if (top < 0) {
        top = 0
      }
      commentDom.style.top = `${top}`
    } else {
      commentDom.style.top = `${top}%`
    }
  }

  // counter.innerText = Number(counter.innerText) + 1

})

function createElementFromHTML(html) {
  const tempEl = document.createElement('div');
  tempEl.innerHTML = html;
  return tempEl.firstElementChild;
}

function disconnectSocket() {
  console.log('disconnect');
  socket.disconnect();
}

socket.on('disconnect', () => {
  disconnectSocket();
})
socket.on('toDiscconect', () => {
  disconnectSocket();
})

socket.on('changePreferenses', (pram) => {
  preferenses = pram;

  console.log(pram)
  // コメント設定の反映
  for (const key in pram.comment) {
    switch (key) {
      case 'font-size':
        cssTarget.style.setProperty('--' + key, pram.comment[key] + 'px');
        break;
      case 'scroll-time':
        cssTarget.style.setProperty('--' + key, pram.comment[key] + 's');
        break;
      case 'text-opacity':
        cssTarget.style.setProperty('--' + key, pram.comment[key] / 100);
        break;
      case 'display':
        pram.comment[key].forEach(prop => {
          switch (prop) {
            case "br-style":
              cssTarget.style.setProperty('--' + prop, 'none');
              break;
            case "display-name":
              isDisplayName = true;
              break;
            default:
              break;
          }
        });
        break;
      default:
          cssTarget.style.setProperty('--' + key, pram.comment[key]);
        break;
    }
  }

  // コマンド設定の反映
  let coms = [];
  for (const key in pram.command) {
    coms = coms.concat(pram.command[key]);
  }
  useCommand = coms;
})