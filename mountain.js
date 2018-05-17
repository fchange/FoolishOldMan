'use strict';

var MGame = function() {
    LocalContractStorage.defineProperty(this, "MountainWeight");
    LocalContractStorage.defineProperty(this, "currentControlName");
    LocalContractStorage.defineProperty(this, "currentControlTime");
    LocalContractStorage.defineProperty(this, "GameOver");
    LocalContractStorage.defineMapProperty(this, "UserNameMap");
    LocalContractStorage.defineMapProperty(this, "NameScoreMap");//Todo: 历史纪录Map
    LocalContractStorage.defineProperty(this, "NamekeyList");
};

MGame.prototype = {

    init: function() {
        this.MountainWeight = 100
        this.currentControlName = ''
        this.currentControlTime = 0
        this.GameOver =false
    },

    dug: function() {
        if(this.UserNameMap.get(Blockchain.transaction.from)) {
            return 'Please set a name' 
        } else if(this.currentControlName != '') {
            return this.currentControlName + ' is working'
        } else{
            this.currentControlName = this.UserNameMap.get(Blockchain.transaction.from) 
            this.currentControlTime = Date.now()
            return 'Fool Old Man is Working Now'
        }
    },

    _oldManWorkDone: function() {
        this.MountainWeight -= 1
        const score = this.NameScoreMap.get(this.currentControlName)
        this.NameScoreMap.set(this.currentControlName, score+1)
        this.currentControlName = ''
        this.MountainWeight == 0 && _gameOver()
    },

    _gameOver: function() {
        this.GameOver = true
        this.currentControlTime = Date.now()
    },

    _reset: function() {
        this.GameOver = false

        this.MountainWeight = 100
        this.currentControlName = ''
        this.currentControlTime = 0
        this.GameOver =false
    }

    getState: function() {
        if(Date.now() - 2000 > this.currentControlTime && this.currentControlName != '') {
            this._oldManWorkDone()
            this.currentControlTime = 0
        } else if(this.GameOver && Date.now() - 200000 < this.currentControlTime) {
            return {
                GameOver: this.GameOver,
                currentControlTime: this.currentControlTime,
                NameScoreMap: NameScoreMap,
            }
        } else if(this.GameOver && Date.now() - 200000 >= this.currentControlTime) {
            this._reset()
        }
        return {
            MountainWeight: this.MountainWeight,
            currentControlName: this.currentControlName,
            currentControlTime: this.currentControlTime,
            NameScoreMap: this.NameScoreMap,
        }
    },

    canIUseName: function(name) {
        return isNaN(this.UserNameMap.get(name))
    },

    setName: function(name) {
        if(isNaN(this.UserNameMap.get(name))) {
            this.UserNameMap.set(Blockchain.transaction.from, name)
            this.NameScoreMap.set(name, 0)
            return 'Success'
        } else {
            return 'Name has been used'
        }
    }
};

module.exports = MGame;
