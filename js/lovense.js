
function LovenseManager() {
    this.onDeviceReady = false;
    this.score = 0;
    this.toyList = []

    this.userInfo = null;

    this.config = {
        serverUrl: 'https://example.com/api/',
    }
}


LovenseManager.prototype.getData = async function (path, query = '', needAuth = true) {
    const authInfo = {}
    if (needAuth) {
        this.getUserInfo();

        if (this.userInfo === null) {
            await lovenseManager.getUserInfoWithLovense()
                .then(data => {
                    authInfo.userId = this.userInfo.userId
                    authInfo.accessToken = this.userInfo.access_token
                })
                .catch(error => {
                    console.error('getUserInfoWithLovense', error)
                });
        } else {
            authInfo.userId = this.userInfo.userId
            authInfo.accessToken = this.userInfo.access_token
        }
    }

    return fetch(`${this.config.serverUrl}${path}${query ? `?${query}` : ''}`, {
            method: 'GET',
            headers: {
                ...authInfo,
            }
        })
        .then(res => res.json())
        .then(res => {
            if (res.error) {
                throw res.error
            }
            return res.data;
        })
}

LovenseManager.prototype.postData = async function (path, data) {
    const userInfo = this.getUserInfo();
    if (!userInfo) await this.getUserInfoWithLovense();
    return fetch(this.config.serverUrl + `${path}`, {
            method: 'POST',
            body: data ? JSON.stringify(data) : null,
            headers: {
                'Content-Type': 'application/json',
                userId: userInfo.userId,
                accessToken: userInfo.access_token,
            },
        })
        .then(res => res.json())
        .then(res => {
            if (res.error) {
                throw Error(res.error)
            }
            return res.data;
        })
}

LovenseManager.prototype.actuate = function (metadata) {
    let difference = metadata.score - this.score;
    this.score = metadata.score;

    if (metadata.score === 0) {
        this.stop();
    }
    if (metadata.over) {
        // win or over, stop command
        this.stop();
    } else if (metadata.won) {
        this.viberate(20, 5, metadata);
    } else {
        let value = 0;
        if (difference > 0) {
            // score increased, viberate
            value = difference / 4;
            if (value > 20) {
                value = 20;
            }
        }
        // continue command
        this.viberate(value, 1);
    }
    let userInfo = this.getUserInfo();
    if (userInfo !== null) {
        const data = {
            "username": userInfo.username,
            "score": metadata.score,
            "time": metadata.totalTime,
            "hasToy": Array.isArray(this.toyList) && !!this.toyList.length
        }
        this.postDataDebounce(data)()
    }

};

LovenseManager.prototype.postDataDebounce = function (data) {
    return utils.debounce(() => {
        this.postData('score/user', data)
    }, 800)
}


LovenseManager.prototype.viberate = function (value, second) {
    var self = this;
    var command = {
        command: "Function",
        action: `All:${value}`,
        timeSec: second,
        stopPrevious: 1,
    }
    console.log("LovenseManager.prototype.viberate - ", command);
    self.sendCommand(command);
};

LovenseManager.prototype.stop = function () {
    var self = this;
    var command = {
        command: "Function",
        action: "stop",
    }
    console.log("LovenseManager.prototype.stop - ", command);
    self.sendCommand(command);
};

LovenseManager.prototype.sendCommand = function (command) {
    if (typeof window.cordova === 'undefined') {
        return;
    }
    if (typeof xremoteToy !== 'undefined') {
        xremoteToy.sendCommand(command,
            function onSuccess(data) {
                console.log("LovenseManager.prototype.sendCommand onSuccess - ", command);
            },
            function onFail(message) {
                console.log("LovenseManager.prototype.sendCommand onFail - ", command);
            });
        return;
    }

    const toyManager = appGallery.getToyManager()
    if (toyManager === 'undefined') {
        return;
    }
    let obj = {
        command: command,
        success: function (data) {
            console.log("LovenseManager.prototype.sendCommand onSuccess - ", command);
        },
        fail: function onFail(message) {
            console.log("LovenseManager.prototype.sendCommand onFail - ", command);
        }
    }
    toyManager.sendCommand(obj);
};

LovenseManager.prototype.getUserInfo = function () {
    if (typeof window.cordova === 'undefined') {
        return null;
    }

    if (this.userInfo) {
        return this.userInfo;
    }

    var username = "";
    var userId = "";
    var access_token = "";
    var arr, reg = new RegExp("(^| )username=([^;]*)(;|$)");
    if (arr = document.cookie.match(reg)) {
        username = unescape(arr[2]);
    }
    reg = new RegExp("(^| )userId=([^;]*)(;|$)");
    if (arr = document.cookie.match(reg)) {
        userId = unescape(arr[2]);
    }
    reg = new RegExp("(^| )access_token=([^;]*)(;|$)");
    if (arr = document.cookie.match(reg)) {
        access_token = unescape(arr[2]);
    }

    if (!userId || !access_token) {
        return null
    }

    const userInfo = {
        username: username,
        userId: userId,
        access_token: access_token
    }
    this.userInfo = userInfo
    return userInfo;
};

LovenseManager.prototype.getUserInfoWithLovense = async function (command) {
    if (typeof window.cordova === 'undefined') {
        console.warn("typeof window.cordova === 'undefined'");
        return;
    }
    const userManager = appGallery.getUserManager()
    if (userManager === 'undefined') {
        console.warn("userManager === 'undefined'");
        return;
    }

    return new Promise((resolve, reject) => {
        userManager.getAuthCode({
            scope: "authUser", // Authorization type
            success: async (res) => {
                const data = await this.getData('auth', 'authCode=' + res.authCode, false)
                    .then(data => {
                        const userInfo = {
                            username: data.name,
                            userId: data.userId,
                            access_token: data.accessToken
                        }
                        this.userInfo = userInfo
                        var exp = new Date();
                        exp.setTime(exp.getTime() + 60 * 60 * 1000 * 96);
                        document.cookie = "username=" + data.name + ";expires=" + exp.toGMTString();
                        document.cookie = "userId=" + data.userId + ";expires=" + exp.toGMTString();
                        document.cookie = "access_token=" + data.accessToken + ";expires=" + exp.toGMTString();

                        resolve(userInfo)
                    })
                    .catch(error => {
                        console.error('getUserInfoWithLovense:', error)
                        reject(error)
                    });
            },
            fail(err) {
                console.error('getAuthCode - fail: ', err)
                reject(err)
            },
        })
    })
};