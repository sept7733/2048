
let lovenseManager = new LovenseManager // null
let rankList = []

back = async function () {
  // window.history.back()
  fetch('./index.html')
    .then(response => {
      if (response.ok) {
        window.location.href = './index.html';
      } else {
        console.error('index resource not exist or can not access rank');
      }
    })
    .catch(error => {
      console.error('index back fetch:' + error);
    });
}


showWorldRankWithToy = async function () {
  const tabs = document.querySelectorAll('.tab-wrap .tab')
  tabs.forEach(item => item.classList.remove('active'))
  tabs[0].classList.add('active')
  rankList = []
  showRankList()
  showMyRankNumber()
  rankList = await lovenseManager.getData('score/world', 'withToy=true')
  showRankList()
  showMyRankNumber()
  showMyRank(true)
}

showRegionRankWithToy = async function () {
  const tabs = document.querySelectorAll('.tab-wrap .tab')
  tabs.forEach(item => item.classList.remove('active'))
  tabs[1].classList.add('active')
  rankList = []
  showRankList()
  showMyRankNumber()
  rankList = await lovenseManager.getData('score/region', 'withToy=true')
  showRankList()
  showMyRankNumber()
  showMyRank(true)
}

showWorldRankWithoutToy = async function () {
  const tabs = document.querySelectorAll('.tab-wrap .tab')
  tabs.forEach(item => item.classList.remove('active'))
  tabs[1].classList.add('active')
  rankList = []
  showRankList()
  showMyRankNumber()
  rankList = await lovenseManager.getData('score/world', 'withToy=false')
  showRankList()
  showMyRankNumber()
  showMyRank(false)
}


showRegionRankWithoutToy = async function () {
  const tabs = document.querySelectorAll('.tab-wrap .tab')
  tabs.forEach(item => item.classList.remove('active'))
  tabs[3].classList.add('active')
  rankList = []
  showRankList()
  showMyRankNumber()
  rankList = await lovenseManager.getData('score/region', 'withToy=false')
  showRankList()
  showMyRankNumber()
  showMyRank(false)
}

const showRankList = function () {
  const tableBody = document.querySelector('.table-body')
  let rows = ''
  if (Array.isArray(rankList) && rankList.length) {
    rankList.forEach((item, row) => {
      const rank = row + 1
      rows += `
        <div class="table-row">
          <div class="table-column">${rank < 4 ? `<img src="./images/rank_${rank}.svg" />` : `<div>${rank}</div>`}</div>
          <div class="table-column">${item.username}</div>
          <div class="table-column">${utils.toHHmmss(item.time)}</div>
          <div class="table-column">${item.score}</div>
        </div>
        `
    })
    tableBody.innerHTML = rows
  } else {
    tableBody.innerHTML = `
        <div class="table-row">
          <div class="table-column">-</div>
          <div class="table-column">-</div>
          <div class="table-column">-</div>
          <div class="table-column">-</div>
        </div>
      `
  }
}

const showMyRankNumber = function () {
  const userInfo = lovenseManager.getUserInfo()
  if (!userInfo || !userInfo.userId) return
  const findIndex = rankList.findIndex(item => item.userId === userInfo.userId)
  const myRankDom = document.querySelector('footer')
  if (!myRankDom) return
  if (findIndex === -1) {
    myRankDom.querySelector('.rank').innerHTML = '-'
    myRankDom.querySelector('.player').innerHTML = lovenseManager.getUserInfo().username
    myRankDom.querySelector('.time').innerHTML = '-'
    myRankDom.querySelector('.points').innerHTML = '-'
  } else {
    const item = rankList[findIndex]
    const rank = findIndex + 1
    myRankDom.querySelector('.rank').innerHTML = `${rank < 4 ? `<img src="./images/rank_${rank}.svg" />` : `<div>${rank}</div>`}`
    myRankDom.querySelector('.player').innerHTML = lovenseManager.getUserInfo().username
    myRankDom.querySelector('.time').innerHTML = utils.toHHmmss(item.time)
    myRankDom.querySelector('.points').innerHTML = item.score
    const tableRows = document.querySelectorAll('.table-body .table-row')
    tableRows[findIndex].classList.add('active')
  }
}

const showMyRank = async function (withToy) {
  let item = {}
  try {
    item = await lovenseManager.getData('score/user', `withToy=${withToy}`)
  } catch (error) {
    console.error(error);
  }
  const myRankDom = document.querySelector('footer')
  myRankDom.querySelector('.player').innerHTML = lovenseManager.getUserInfo().username
  myRankDom.querySelector('.time').innerHTML = item.time ? utils.toHHmmss(item.time) : '-'
  myRankDom.querySelector('.points').innerHTML = item.score ? item.score : '-'
}

document.addEventListener("deviceready", async () => {
  lovenseManager = new LovenseManager()
  const userInfo = lovenseManager.getUserInfo();
  if (userInfo === null) {
    await lovenseManager.getUserInfoWithLovense();
  }
  document.querySelector('footer .player').innerHTML = userInfo.username
  await showWorldRankWithToy();
})
