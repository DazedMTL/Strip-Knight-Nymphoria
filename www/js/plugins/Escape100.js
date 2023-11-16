//=============================================================================
// Escape100.js
//=============================================================================
/*:
 * @plugindesc 逃げる成功率を100%にする
 * @author みこと
 * 
 * @param escapeSwitche
 * @desc 逃げる成功率を100%にするスイッチの番号
 * @default 10
 * 
 * @help 指定のスイッチがONになっている間、戦闘コマンド『逃げる』を必ず成功させます。
 * ただしバトルの処理で『逃走可能』にチェックが入っていない場合は逃げられません。
 * 
 * このプラグインには、プラグインコマンドはありません。
 */

(function () {
    var parameters = PluginManager.parameters('Escape100');
    BattleManager.processEscape = function () {
        $gameParty.performEscape();
        SoundManager.playEscape();
        this.displayEscapeSuccessMessage();
        this._escaped = true;
        this.processAbort();
        return success;
    };
})();
