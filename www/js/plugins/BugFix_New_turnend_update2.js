//=============================================================================
// BugFix_New_turnend_update.js
// ----------------------------------------------------------------------------
// Version
// 1.0.0 2017/09/01 初版
//=============================================================================

/*:
 * @plugindesc BugFix_New_Turnend_UpdatePlugin
 * @author 剣崎宗二
 *
 * @help BugFix_New_turnend_update.js
 * 公式アップデートVer.1.5.0にて
 * ターン終了時に行われるHP,MP,TPの再生、ステートや能力上昇・弱体のターン経過などが
 * ターン終了時バトルイベント中の「戦闘行動の強制」により
 * 再び実行されてしまう問題を防ぎます。
 *
 * このプラグインはMITライセンスです。
 */
/*:ja
 * @plugindesc ターンエンド時アップデート修正プラグイン
 * @author 剣崎宗二
 *
 * @help BugFix_New_turnend_update.js
 * 公式アップデートVer.1.5.0にて
 * ターン終了時に行われるHP,MP,TPの再生、ステートや能力上昇・弱体のターン経過などが
 * ターン終了時バトルイベント中の「戦闘行動の強制」により
 * 再び実行されてしまう問題を防ぎます。
 *
 * このプラグインにはプラグインコマンドはありません。
 *
 * このプラグインはMITライセンスです。
 */
(function () {

    var BattleManager_startTurn = BattleManager.startTurn;
    BattleManager.startTurn = function () {
        this._newturn = true;
        BattleManager_startTurn.call(this);
    };

    var BattleManager_endTurn = BattleManager.endTurn;
    BattleManager.endTurn = function () {
        this._phase = 'turnEnd';
        this._preemptive = false;
        this._surprise = false;
        if (this._newturn) {
            this._newturn = false;
            BattleManager_endTurn.call(this);
        }
    };

})();