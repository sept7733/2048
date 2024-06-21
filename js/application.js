
/**
 * Initializes the game when the browser is ready to render.
 * @callback animationCallback
 */

/**
 * Creates a new game manager and starts the game.
 * @param {number} size - The size of the game grid.
 * @param {KeyboardInputManager} inputManager - The input manager for handling keyboard inputs.
 * @param {HTMLActuator} actuator - The actuator for rendering the game on the HTML page.
 * @param {LocalStorageManager} storageManager - The storage manager for saving game state.
 * @param {LovenseManager} lovenseManager - The manager for handling Lovense device inputs.
 * @returns {void}
 */

let lovenseManager = new LovenseManager // null
let gameManager = new GameManager(4, KeyboardInputManager, HTMLActuator, LocalStorageManager, lovenseManager); // null

window.requestAnimationFrame(function () {
  try {
    lovenseManager.onDeviceReady = true;
  } catch (error) {
    console.error(error);
  }
});

// Wait till the browser is ready to render the game (avoids glitches)


const getRank = async () => {
  const userInfo = lovenseManager.getUserInfo();
  const rankList_toy = await lovenseManager.getData('score/world', 'withToy=true')
  const rankList_notoy = await lovenseManager.getData('score/world', 'withToy=false')
  const findIndex_toy = rankList_toy.findIndex(item => item.userId === userInfo.userId)
  const findIndex_notoy = rankList_notoy.findIndex(item => item.userId === userInfo.userId)
  const rankContainer = document.querySelector(".rank-container");
  if (findIndex_toy > -1 && findIndex_notoy > -1) {
    rankContainer.innerHTML = (rankList_toy[findIndex_toy].score >= rankList_notoy[findIndex_notoy].score ? findIndex_toy : findIndex_notoy) + 1
  } else if (findIndex_toy > -1) {
    rankContainer.innerHTML = findIndex_toy + 1
  } else if (findIndex_notoy > -1) {
    rankContainer.innerHTML = findIndex_notoy + 1
  }
}


document.addEventListener("deviceready", async () => {

  const userInfo = lovenseManager.getUserInfo();
  if (userInfo === null) {
    await lovenseManager.getUserInfoWithLovense()
      .then(data => {
        console.info(data)
      })
  }

  getRank()

  toyManager = appGallery.getToyManager()
  if (toyManager === 'undefined') {
    return;
  }
  toyManager.getMyToysInfo({
    success(res) {
      let toyList = res.toyList
      if (!Array.isArray(toyList)) toyList = []
      toyList = toyList.filter(item=>item.status === '1')
      lovenseManager.toyList = toyList
    },
    fail(err) {
    },
  })
  toyManager.onMyToysChange(function (res) {
    let toyList = res.toyList
    if (!Array.isArray(toyList)) toyList = []
    toyList = toyList.filter(item=>item.status === '1')
    lovenseManager.toyList = toyList
  })
})