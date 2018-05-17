'use strict';

var MGame = function() {
    LocalContractStorage.defineProperty(this, {
        "MountainWeight" : 100,
        "currentControlName" : '',
        "currentControlTime" : 0,
        "currentState" : '',  // ON OVER
        "currentGameNum" : 0
    });

    LocalContractStorage.defineMapProperty(this, "UserNameMap");
    LocalContractStorage.defineMapProperty(this, "NameUserMap");
    LocalContractStorage.defineMapProperty(this, "NameScoreMap");
    LocalContractStorage.defineMapProperty(this, "TimeNameList");//每次玩家 {1 ==> []} includes
};

MGame.prototype = {

    init: function() {
        this.currentState = 'ON',
        this.TimeNameList.set(this.currentGameNum, [])
    },

    dug: function() {
        if(this.UserNameMap.get(Blockchain.transaction.from)) {
            return 'Please set a name' 
        } else if(this.currentControlName != '') {
            return this.currentControlName + ' is DUGing'
        } else{
            this.currentControlName = this.UserNameMap.get(Blockchain.transaction.from) 
            this.currentControlTime = Blockchain.block.timestamp
            return 'Fool Old Man is Working Now'
        }
    },

    _oldManWorkDone: function() {
        this.MountainWeight -= 1

        const score = this.NameScoreMap.get(`${this.currentControlTime}_${this.currentControlName}`) || 0
        this.NameScoreMap.set(`${this.currentControlTime}_${this.currentControlName}`, score+1)

        const gamers = this.TimeNameList.get(this.currentGameNum) || []
        if(!gamers.includes(this.currentControlName)) {
            this.TimeNameList.set(this.currentGameNum, gamers.concat(this.currentControlName))
        }

        this.currentControlName = ''
        this.currentControlTime = 0
        this.MountainWeight == 0 && _gameOver()
    },

    _gameOver: function() {
        this.currentControlTime = Date.now()
        this.currentState = 'OVER'
    },

    _resetGame: function() {
        this.MountainWeight = 100
        this.currentControlTime = 0
        this.currentState = 'ON'
        this.currentGameNum += 1
    },

    getState: function() {
        if(this.currentState == 'ON'
                && this.currentControlName != '' 
                && Blockchain.block.timestamp - 2000 > this.currentControlTime ) {
            this._oldManWorkDone()
        } else if(Blockchain.block.timestamp - 200000 > this.currentControlTime
                && this.currentState == 'OVER' ) {
            this._resetGame()
        } 
        return {
            MountainWeight: this.MountainWeight,
            currentControlName: this.currentControlName,
            currentControlTime: this.currentControlTime,
            currentState: this.currentState,
            NameScoreMap: this.NameScoreMap,
            TimeNameList: this.TimeNameList
        }
    },

    canIUseName: function(name) {
        return isNaN(this.NameUserMap.get(name))
    },

    setName: function(name) {
        if(isNaN(this.NameUserMap.get(name))) {
            this.NameUserMap.set(name, Blockchain.transaction.from)
            this.UserNameMap.set(Blockchain.transaction.from, name)
            this.NameScoreMap.set(name, 0)
            return 'Success'
        } else {
            throw new Error('Name has been used')
        }
    }
};

module.exports = MGame;
