
//大きすぎるボスの消滅演出を高速化
Sprite_Enemy.prototype.startBossCollapse = function () {
    this._effectDuration = 120;
    this._appeared = false;
};
Sprite_Enemy.prototype.updateFrame = function () {
    Sprite_Battler.prototype.updateFrame.call(this);
    var frameHeight = this.bitmap.height;
    if (this._effectType === 'bossCollapse') {
        frameHeight = this.bitmap.height - 120 + this._effectDuration;
    }
    this.setFrame(0, 0, this.bitmap.width, frameHeight);
};


//アクター間でEXP、HPを共有
(function () {
    var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function (command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args);

        if (command === 'shareExp') {
            var maxexp = 0;
            //			if ($gameSwitches.value(245)){
            var alllist = [1, 6, 11, 14, 18, 20, 21, 28, 29, 30];

            alllist.forEach(function (n) {
                var actor = $gameActors.actor(n);
                if (actor && actor.currentExp() > maxexp) maxexp = actor.currentExp();
            });
            alllist.forEach(function (n) {
                var actor = $gameActors.actor(n);
                if (actor) actor.changeExp(maxexp);
            });
            /*			}else{
                            var nimpholist = [1,6,11,18,20,21];
                            var mazolist = [14,28,30];
                        	
                            nimpholist.forEach(function(n){
                                var actor = $gameActors.actor(n);
                                if (actor && actor.currentExp() > maxexp)maxexp = actor.currentExp();
                            });
                            nimpholist.forEach(function(n){
                                var actor = $gameActors.actor(n);
                                if(actor)actor.changeExp(maxexp);
                            });
            
                            maxexp = 0;
                            mazolist.forEach(function(n){
                                var actor = $gameActors.actor(n);
                                if (actor && actor.currentExp() > maxexp)maxexp = actor.currentExp();
                            });
                            mazolist.forEach(function(n){
                                var actor = $gameActors.actor(n);
                                if(actor)actor.changeExp(maxexp);
                            });
                        }
            */
        }
        if (command === 'shareStates') {
            args[0] = Number(args[0]);
            args[1] = Number(args[1]);

            $gameActors.actor(args[0]).setHp($gameActors.actor(args[1]).hp);
            $gameActors.actor(args[0]).setMp($gameActors.actor(args[1]).mp);
            $gameActors.actor(args[0]).setTp($gameActors.actor(args[1]).tp);

            $gameActors.actor(args[0])._states = $gameActors.actor(args[1])._states;
            $gameActors.actor(args[0])._statesTurns = $gameActors.actor(args[1])._statesTurns;

        }

    };


})();

//スイッチ146がONの時、移動はリピート入力に
(function () {
    'use strict';

    delete Input.keyMapper[18];
})();

Game_Player.prototype.getInputDirection = function () {
    if ($gameSwitches.value(146) &&
        !Input.isRepeated('down') && !Input.isRepeated('up') &&
        !Input.isRepeated('right') && !Input.isRepeated('left')) {
        return 0
    } else {
        return Input.dir4;
    }

};

//獲得金額2倍はやりすぎなので1.25倍に
Game_Troop.prototype.goldRate = function () {
    return $gameParty.hasGoldDouble() ? 1.25 : 1;
};
//金額を整数に
Game_Troop.prototype.goldTotal = function () {
    money = this.deadMembers().reduce(function (r, enemy) {
        return r + enemy.gold();
    }, 0) * this.goldRate();
    money = Math.floor(money);
    return money;
};

Window_BattleLog.prototype.displayActionResults = function (subject, target) {
    if (target.result().used) {
        this.displayCritical(target);
        this.push('popupDamage', target);
        this.push('popupDamage', subject);
        this.displayDamage(target);
        this.displayAffectedStatus(target);
        this.displayFailure(target);
    }
};
Game_CharacterBase.prototype.straighten = function () {
    if (this.hasWalkAnime() || this.hasStepAnime()) {
        if (this.isJumping()) {
            this._pattern = 0;
        } else {
            this._pattern = 1;
        }
    }
    this._animationCount = 0;
};
Game_CharacterBase.prototype.updatePattern = function () {
    if (!this.hasStepAnime() && this._stopCount > 0) {
        this.resetPattern();
    } else if (this.isJumping()) {
        this._pattern = (this._pattern + 2) % this.maxPattern();
    } else {
        this._pattern = (this._pattern + 1) % this.maxPattern();
    }
};
Game_CharacterBase.prototype.animationWait = function () {
    if (this.isJumping()) {
        return (11 - this.realMoveSpeed()) * 3;
    } else {
        return (9 - this.realMoveSpeed()) * 3;
    }
};
Game_Action.prototype.itemEffectRecoverMp = function (target, effect) {
    var value = (target.mmp * effect.value1 + effect.value2);
    if (this.isItem()) {
        value *= this.subject().pha;
    }
    value = Math.floor(value);
    if (value !== 0) {
        target.gainMp(value);
        this.makeSuccess(target);
    }
};
Game_Action.prototype.makeDamageValue = function (target, critical) {
    var item = this.item();
    var baseValue = this.evalDamageFormula(target);
    var value = baseValue * this.calcElementRate(target);
    if (this.isPhysical()) {
        value *= target.pdr;
    }
    if (this.isMagical()) {
        value *= target.mdr;
    }
    if (baseValue < 0) {
        //        value *= target.rec;
    }
    if (critical) {
        value = this.applyCritical(value);
    }
    value = this.applyVariance(value, item.damage.variance);
    value = this.applyGuard(value, target);
    value = Math.round(value);
    return value;
};

// Enemy Appear
Game_Interpreter.prototype.command335 = function () {
    this.iterateEnemyIndex(this._params[0], function (enemy) {
        enemy.appear();
        //        $gameTroop.makeUniqueNames();
    }.bind(this));
    return true;
};


Game_Actor.prototype.levelUp = function () {
    oldmhp = this.mhp;
    this._level++;
    this.gainHp(this.mhp - oldmhp);
    this.currentClass().learnings.forEach(function (learning) {
        if (learning.level === this._level) {
            this.learnSkill(learning.skillId);
        }
    }, this);
};