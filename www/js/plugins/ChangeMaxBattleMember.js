//=============================================================================
// ChangeMaxBattleMembers.js
//
// ----------------------------------------------------------------------------
// by ecf5DTTzl6h6lJj02
// 2021/06/05
// ----------------------------------------------------------------------------
// Copyright (C) 2021 ecf5DTTzl6h6lJj02
//	This software is released under the MIT lisence.
//	http://opensource.org/licenses/mit-license.php
//=============================================================================

/*:
 * @plugindesc 
 * 戦闘参加人数の変更をするコマンドを提供するプラグイン
 * @author ecf5DTTzl6h6lJj02
 *
 *
 * @help
 * ゲーム中に戦闘参加人数を変更するプラグインコマンドを追加するプラグインです。
 *
 * 【プラグインコマンドについて】 
 * 
 *  ・ CHANGE_MAX_BATTLEMEMBER 人数
 *     戦闘参加人数を変更することができます。
 * 　　(人数 のところは任意の数値に変換してください)
 * 　　人数は 1 から 現在のパーティ人数 までを指定できます。
 * 　　範囲外の数字を指定してもこの範囲内に丸められますのでご注意ください。
 * 　　戦闘中にも変更することができますが、
 * 　　戦闘中に変更した場合は、戦闘中にしか有効になりません。
 * 　　戦闘が終了すると、戦闘前に指定されていた参加人数に戻ります。
 * 
 *  ・ ADD_TEMPMEMBERS アクターID
 *     戦闘中のみ有効なコマンドです。
 *     戦闘中のみの一時的なアクター追加を行ないます。
 * 　　アクターIDは複数指定可能です。
 * 　　ADD_TEMPMEMBERS のコマンドの後に、一時追加したいアクターのIDをスペース区切りで
 * 　　必要なだけ指定してください。
 *     追加するアクターは、メンバー外である必要があります。
 *     メンバー内のアクターのIDが指定された場合、そのアクターは追加されません。
 * 　　追加したアクターは戦闘終了時に取り除かれます。
 * 
 *  ・ REMOVE_TEMPMEMBERS アクターID
 *     戦闘中のみ有効なコマンドです。
 *  　 追加した一時メンバーから、指定したアクターIDのアクターを取り除きます。
 *  　 アクターIDは複数指定可能です。
 *  　 REMOVE_TEMPMEMBERS のコマンドの後に、削除したい一時メンバーのIDをスペース区切りで
 *  　 必要なだけ指定してください。
 *     指定したアクターIDのアクターが、一時メンバーにいない場合、
 *  　 そのID無効化されます。
 * 
 *  ・ REMOVE_TEMPMEMBERS_ALL
 * 　　戦闘中のみ有効なコマンドです。
 *  　 追加した一時メンバーをすべて取り除きます。
 * 
 * バトラーの位置を調整するようには作っておりませんので、
 * 人数が多いとバトラーが画面からはみ出ます。
 * ご注意ください。
 * 
 */

(() => {
    'use strict'

    const FTKR_CSS_BS_Valid = $plugins.some(plugin => plugin.name === 'FTKR_CSS_BattleStatus' && plugin.status);

    // 再定義
    // 最大戦闘参加人数を変更できるように、プロパティを追加
    const _Game_Party_initialize = Game_Party.prototype.initialize;
    Game_Party.prototype.initialize = function () {
        _Game_Party_initialize.call(this);
        this._maxBattleMembers = 4;
        this._tempMembers = [];
    };

    // 戦闘参加人数を変更する関数。
    // 戦闘中に変更する場合は、スプライトを追加したり、親子関係を設定する必要があるので、
    // そちらの処理もしている。
    Game_Party.prototype.setMaxBattleMembers = function (num, numChangeOnly = false, temp = null) {
        num = temp ? num : num.clamp(1, this.allMembers().length);
        let maxBattleMembers_Old = this._maxBattleMembers;
        if ($gameParty.inBattle() && !numChangeOnly) {
            if (num > maxBattleMembers_Old) {
                this._maxBattleMembers = num;
                for (let i = maxBattleMembers_Old; i < num; i++) {
                    BattleManager.addBattleMembers(i);
                }
            } else {
                if (temp) {
                    temp.forEach(id => {
                        BattleManager.startTempMemberRemove(id);
                        let index = this._tempMembers.findIndex(value => value === id);
                        this._tempMembers.splice(index, 1);
                    });
                } else {
                    for (let i = maxBattleMembers_Old; i > num; i--) {
                        BattleManager.startBattleMemberRemove(i)
                    }
                }
            }
            // BattleManager.setActorHomeAll();
            if (FTKR_CSS_BS_Valid) {
                SceneManager._scene._statusWindow._customMaxCols = num;
                SceneManager._scene._actorWindow._customMaxCols = num;
                SceneManager._scene._statusWindow.refresh();
                FTKR.CSS.BS.window.maxCols = num;
            }
        } else {
            this._maxBattleMembers = num;
            if (FTKR_CSS_BS_Valid) {
                FTKR.CSS.BS.window.maxCols = num;
            }
        }
    };

    // 最大戦闘参加人数を返却する関数の再定義
    Game_Party.prototype.maxBattleMembers = function () {
        return this._maxBattleMembers;
    };

    Game_Party.prototype.addTempMembers = function (actorIds) {
        actorIds.reverse().forEach(id => {
            if (!this._actors.includes(id)) {
                this._actors.splice(this.maxBattleMembers(), 0, id);
                if (!this._tempMembers.includes(id)) {
                    this._tempMembers.push(id);
                }
            }
        });
        this.setMaxBattleMembers(this.maxBattleMembers() + this._tempMembers.length);
    };

    Game_Party.prototype.removeTempMembers = function (actorIds) {
        const removeMembers = [];
        actorIds.forEach(id => {
            if (this._tempMembers.includes(id)) {
                removeMembers.push(id);
            }
        });
        this.setMaxBattleMembers(this.maxBattleMembers() - removeMembers.length, false, removeMembers);
    }

    Game_Party.prototype.removeTempMembersAll = function () {
        this.setMaxBattleMembers(this.maxBattleMembers() - this._tempMembers.length, false, this._tempMembers.clone());
    };

    Game_Party.prototype.resetMembers = function () {
        this._tempMembers.forEach(id => this.removeActor(id));
        this._tempMembers = [];
    };


    // プラグインコマンドに、戦闘参加人数を変更するコマンドを追加
    const _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function (command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args);
        if (command === "CHANGE_MAX_BATTLEMEMBER") {
            $gameParty.setMaxBattleMembers(Number(args[0]));
        }
        if (command === "ADD_TEMPMEMBERS") {
            if ($gameParty.inBattle()) {
                $gameParty.addTempMembers(args.num());
            } else {
                console.error(`戦闘中のみ呼び出せるプラグインコマンドです: ${command}`);
            }
        }
        if (command === "REMOVE_TEMPMEMBERS") {
            if ($gameParty.inBattle()) {
                $gameParty.removeTempMembers(args.num());
            } else {
                console.error(`戦闘中のみ呼び出せるプラグインコマンドです: ${command}`);
            }
        }
        if (command === "REMOVE_TEMPMEMBERS_ALL") {
            if ($gameParty.inBattle()) {
                $gameParty.removeTempMembersAll();
            } else {
                console.error(`戦闘中のみ呼び出せるプラグインコマンドです: ${command}`);
            }
        }
    };

    // ------------------------------------------------------------------------------------
    // 戦闘中に、戦闘参加人数を減らすとき用に、startMove をオーバーライド
    // 及び、 onMoveEnd を再定義
    // ------------------------------------------------------------------------------------
    Sprite_Actor.prototype.startMove = function (x, y, duration, mode = 0) {
        Sprite_Battler.prototype.startMove.call(this, x, y, duration);
        this._mode = mode;
    };

    Sprite_Actor.prototype.onMoveEnd = function () {
        Sprite_Battler.prototype.onMoveEnd.call(this);
        if (this._mode === 1) {
            BattleManager.removeBattleMembers(this);
            $gameParty.setMaxBattleMembers($gameParty.maxBattleMembers() - 1, true);
            BattleManager.setActorHomeAll();
        } else if (this._mode === 2) {
            BattleManager.removeBattleMembers(this);
            $gameParty.setMaxBattleMembers($gameParty.maxBattleMembers() - 1, true);
            $gameParty.removeActor(this._actor.actorId());
            $gameParty.setMaxBattleMembers($gameParty.maxBattleMembers(), false, []);
            BattleManager.setActorHomeAll();
        } else if (this._mode === 3) {
            const index = $gameParty.members().findIndex(actor => actor === this._actor);
            this.startMove(0, 0, 0);
            this.setActorHome(index);
        } else if (!BattleManager.isBattleEnd()) {
            this.refreshMotion();
        }
    };
    // ------------------------------------------------------------------------------------

    // 再定義
    // 戦闘後に参加人数を元に戻すので、戦闘突入時の最大参加人数を取得しておく
    const _BattleManager_initMembers = BattleManager.initMembers;
    BattleManager.initMembers = function () {
        _BattleManager_initMembers.call(this);
        this._maxBattleMembersAtStart = $gameParty.maxBattleMembers();
    };

    // スプライトセットへの追加と、親子関係の設定、
    BattleManager.addBattleMembers = function (index) {
        const Sprite_Add = new Sprite_Actor;
        const Sprite_End = this._spriteset._actorSprites[index - 1];
        Sprite_Add.setBattler($gameParty.battleMembers()[index]);
        Sprite_Add._battler.makeActions();
        this._spriteset._actorSprites.push(Sprite_Add);
        const AddChildIndex = this._spriteset.children[0].children[2].getChildIndex(Sprite_End) + 1;
        this._spriteset.children[0].children[2].addChildAt(Sprite_Add, AddChildIndex);
    };

    // バトルメンバーの撤退開始(通常)
    BattleManager.startBattleMemberRemove = function (index) {
        const removeActorSprite = this._spriteset._actorSprites[index - 1];
        removeActorSprite.startMove(300, 0, 30, 1);
    };

    // バトルメンバーの撤退開始(一時追加メンバー)
    BattleManager.startTempMemberRemove = function (actorId) {
        const removeActorSprite = this._spriteset._actorSprites.find(actorSprite => actorSprite._actor.actorId() === actorId);
        removeActorSprite.startMove(300, 0, 30, 2);
    };

    // アクターをホームへ移動させる
    BattleManager.setActorHomeAll = function () {
        this._spriteset._actorSprites.forEach((sprite, index) => {
            if (FTKR_CSS_BS_Valid) {
                if (this._spriteset._actorSprites.every(sprite => sprite._mode !== 1 && sprite._mode !== 2)) {
                    let targetX = sprite.partyPositionX(index);
                    let targetY = sprite.partyPositionY(index);
                    targetX -= sprite.x;
                    targetY -= sprite.y;
                    sprite.startMove(targetX, targetY, 10, 3);
                }
            } else {
                if (sprite._mode !== 1 && sprite.mode !== 2) {
                    let targetX = 600 + index * 32;
                    let targetY = 280 + index * 48;
                    targetX -= sprite.x;
                    targetY -= sprite.y;
                    sprite.startMove(targetX, targetY, 30, 3);
                }
            }
        });
    };

    // スプライトセットからの削除と、親子関係の解消
    BattleManager.removeBattleMembers = function (actorSprite) {
        let index = this._spriteset._actorSprites.findIndex(sprite => sprite === actorSprite);
        this._spriteset.children[0].children[2].removeChild(actorSprite);
        if (actorSprite._mode > 1) {
            this._spriteset._actorSprites.splice(index, 1);
        } else {
            this._spriteset._actorSprites.pop();
        }
        this.setActorHomeAll();
    };

    // 再定義
    // 最大戦闘参加人数を元に戻す
    const _BattleManager_updateBattleEnd = BattleManager.updateBattleEnd;
    BattleManager.updateBattleEnd = function () {
        _BattleManager_updateBattleEnd.call(this);
        $gameParty.setMaxBattleMembers(this._maxBattleMembersAtStart, true);
        $gameParty.resetMembers();
    };

})();