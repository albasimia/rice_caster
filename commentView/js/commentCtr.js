const min = 5;
const max = 95;
const socket = io();
const commentsArea = document.getElementById('comments')
const commentsUeArea = document.querySelector('#comments-ue .commentsCtr')
const commentsShitaArea = document.querySelector('#comments-shita .commentsCtr')
const commentsNakaArea = document.querySelector('#comments-naka .commentsCtr')
socket.on('comment', (msg) => {
  const commentObj = JSON.parse(msg)
  console.log(commentObj)
  let comment = commentObj.comment
  const command = comment.match(/\[.*\]/g)
  let replacedCommand = ''
  let commandArray = []
  if (command) {
    replacedCommand = String(command).replace(/\[|\]/g, "")
    commandArray = replacedCommand.split(' ')
    comment = String(comment).replace(/(\[.*\])/g, "")
  }
  if (commandArray.indexOf('invisible') == -1) {
    comment = String(comment)
      .replace(/&amp;nbsp;/g, " ")
      .replace(/&lt;br/g, "<br")
      .replace(/&lt;img/g, "<img")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/src="/g, 'src="https://twitcasting.tv')
    let top = random = Math.floor(Math.random() * max - min) + min;
    const commentDomStr = `<div class='commentWrapper ${replacedCommand}' data-type='${commentObj.dataType}'>
          <div class='commentInner'>
            <div class='name'>${commentObj.name}</div>
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
    console.log((100 - top) / 100 * commentsArea.scrollHeight, commentDomHeight)
    if ((100 - top) / 100 * commentsArea.scrollHeight < commentDomHeight) {
      const deff = commentDomHeight - (100 - top) / 100 * commentsArea.scrollHeight;
      top = top / 100 * commentsArea.scrollHeight - deff
      // top = 0
      console.log('test', top)
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