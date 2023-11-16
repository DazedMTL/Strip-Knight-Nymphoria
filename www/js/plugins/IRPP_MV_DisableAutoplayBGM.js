//=============================================================================
// IRPP_MV_DisableAutoplayBGM.js
//=============================================================================

/*:
 * @plugindesc (※下部)指定のスイッチがONの時、BGMやMEの自動再生を禁止します。
 * @author イロスマRPG制作委員会
 *
 * @param MapBgm Switch
 * @desc マップのBGMの自動再生を禁止するスイッチのIDです。
 * @default 7
 * @type switch
 *
 * @param VehicleBgm Switch
 * @desc 乗り物のBGMの自動再生を禁止するスイッチのIDです。
 * @default 8
 * @type switch
 *
 * @param BattleBgm Switch
 * @desc 戦闘BGMの自動再生を禁止するスイッチのIDです。
 * @default 9
 * @type switch
 *
 * @param VictoryMe Switch
 * @desc 勝利MEの自動再生を禁止するスイッチのIDです。
 * @default 10
 * @type switch
 *
 * @help 指定のスイッチがONの時、BGMやMEの自動再生を禁止します。
 * また、スイッチがOFFの時は通常通りBGMやMEを再生します。
 */

var Imported = Imported || {};
Imported.IRPP_MV_DisableAutoplayBGM = true;
(function () {
  var Parameters = PluginManager.parameters('IRPP_MV_DisableAutoplayBGM');
  var mapBgmSwitch = Number(Parameters['MapBgm Switch'] || 7);
  var vehicleBgmSwitch = Number(Parameters['VehicleBgm Switch'] || 8);
  var battleBgmSwitch = Number(Parameters['BattleBgm Switch'] || 9);
  var victoryMeSwitch = Number(Parameters['VictoryMe Switch'] || 10);

  var _Game_System_saveWalkingBgm = Game_System.prototype.saveWalkingBgm;
  Game_System.prototype.saveWalkingBgm = function () {
    if (!$gameSwitches.value(vehicleBgmSwitch)) {
      _Game_System_saveWalkingBgm.call(this);
    }
  };

  var _Game_System_replayWalkingBgm = Game_System.prototype.replayWalkingBgm;
  Game_System.prototype.replayWalkingBgm = function () {
    if (!$gameSwitches.value(vehicleBgmSwitch)) {
      _Game_System_replayWalkingBgm.call(this);
    }
  };

  var _Game_Map_autoplay = Game_Map.prototype.autoplay;
  Game_Map.prototype.autoplay = function () {
    if (!$gameSwitches.value(mapBgmSwitch)) {
      _Game_Map_autoplay.call(this);
    }
  };

  var _Scene_Map_stopAudioOnBattleStart = Scene_Map.prototype.stopAudioOnBattleStart;
  Scene_Map.prototype.stopAudioOnBattleStart = function () {
    if ($gameSwitches.value(battleBgmSwitch)) {
      AudioManager.stopBgs();
      AudioManager.stopMe();
      AudioManager.stopSe();
    } else {
      _Scene_Map_stopAudioOnBattleStart.call(this);
      AudioManager.playBgm($gameSystem.battleBgm());
    }
  };

  var _Game_Vehicle_playBgm = Game_Vehicle.prototype.playBgm;
  Game_Vehicle.prototype.playBgm = function () {
    if (!$gameSwitches.value(vehicleBgmSwitch)) {
      _Game_Vehicle_playBgm.call(this);
    }
  };

  var _BattleManager_playBattleBgm = BattleManager.playBattleBgm;
  BattleManager.playBattleBgm = function () {
    if (!$gameSwitches.value(battleBgmSwitch)) {
      _BattleManager_playBattleBgm.call(this);
    }
  };

  var _BattleManager_playVictoryMe = BattleManager.playVictoryMe;
  BattleManager.playVictoryMe = function () {
    if (!$gameSwitches.value(victoryMeSwitch)) {
      _BattleManager_playVictoryMe.call(this);
    }
  };
})();