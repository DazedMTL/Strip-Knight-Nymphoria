// --------------------------------------------------------------------------
// 
// CounterAnimation
//
// Copyright (c) kotonoha*
// This software is released under the MIT License.
// http://opensource.org/licenses/mit-license.php
//
// 2016/05/18 ver1.1 アニメーションにウェイト時間を追加
// 2016/04/06 ver1.0 プラグイン公開
// 
// --------------------------------------------------------------------------
/*:
 * @plugindesc 反撃時に戦闘アニメーションを流すプラグイン
 * @author kotonoha (http://ktnh5108.pw/)
 *
 * @help
 * 反撃時に戦闘アニメーションを流す演出を加えます。
 * 
 * @param AnimationID
 * @desc 反撃時に流す戦闘アニメーションのIDです。
 * @default 0
 * 
 * @param AnimationWait
 * @desc 反撃時に流す戦闘アニメーションの遅延時間です。
 * @default 60
 *
*/

(function () {

	var parameters = PluginManager.parameters('CounterAnimation');
	var AnimationID = Number(parameters['AnimationID']);
	var AnimationWait = Number(parameters['AnimationWait']);

	BattleManager.invokeCounterAttack = function (subject, target) {
		var action = new Game_Action(target);
		if (AnimationID !== 0) {
			target.startAnimation(AnimationID, false, 0);
			this._logWindow.push('wait');
			if (AnimationWait !== 0) {
				this._logWindow._waitCount = AnimationWait;
			}
			action.setAttack();
			action.apply(subject);
			this._logWindow.displayCounter(target);
			this._logWindow.displayActionResults(subject, subject);
		}
	};

})();