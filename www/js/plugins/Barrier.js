//=============================================================================
// Barrier.js
//=============================================================================

/*:en
 * @plugindesc Implementing "Barrier" States
 * @author Souji Kenzaki
 *
 * @param BarrierText
 * @desc The text which will be displayed when barrier is not broken when attacked (%1=吸収ダメージ量 %2=残強度)
 * @default The barrier took %1 damage, and is at strength of %2!
 *
 * @param BarrierBreakText
 * @desc Message when barrier is broken
 * @default Barrier has been broken!
 *
 * @param Piercing
 * @desc Whether the damage that exceeds barrier strength will be dealt to it's user.
 * @default true
 *
 * @help 
 * This is a plugin for implementing barrier type of states.
 * in the memo section of state, write in format of <barrier: [Strength]>
 * such as <barrier:300>. It will negate damage in exchange for strength reduction, until it runs out of strength.
 */

/*:ja
 * @plugindesc バリアステートの実装
 * @author 剣崎宗二
 *
 * @param BarrierText
 * @desc バリア発動時の表示テキスト (%1=吸収ダメージ量 %2=残強度) 破壊された際は表示されません。
 * @default 障壁が%1ダメージを吸収し、残量%2となった！
 *
 * @param BarrierBreakText
 * @desc バリア破壊時メッセージ
 * @default 障壁が破壊された！
 *
 * @param Piercing
 * @desc 障壁の体力を超過したダメージが貫通するか否か。falseの場合、如何なる大技でも一発は無効化する。
 * @default true
 *
 * @help 
 * ダメージを軽減するバリアを再現するためのプラグインです。
 * ステートのメモに<barrier:300> (数字は軽減値）を入れると、値がなくなるまで軽減してくれます。
 */
var $BarrierList = [];

(function () {

  var parameters = PluginManager.parameters('Barrier');
  var BarrierText = parameters['BarrierText'];
  var BarrierBreakText = parameters['BarrierBreakText'];
  var Piercing = (parameters['Piercing'] == "true");

  function Barrier() {
    throw new Error('This is a static class');
  }

  //ActionLogs系
  var Game_ActionResult_prototype_clear = Game_ActionResult.prototype.clear;
  Game_ActionResult.prototype.clear = function () {
    Game_ActionResult_prototype_clear.call(this);
    this.barrieredDmg = {};
    this.barrierBreak = false;
  };

  Barrier.findIdIndex = function (array, extid) {
    for (i = 0; i < array.length; i++) {
      if (array[i].id == extid) {
        return i;
      }
    }
    return -1;
  };

  Barrier.findId = function (array, extid) {
    targetIndex = Barrier.findIdIndex(array, extid)
    if (targetIndex != -1) {
      return array[targetIndex];
    }
    return null;
  };

  Barrier.findFromState = function (array) {
    for (i = 0; i < array.length; i++) {
      if ($dataStates[array[i]].meta.barrier) {
        return array[i];
      }
    }
    return null;
  };

  Barrier.getUniqueId = function (battler) {
    if (battler.isActor()) {
      return battler.actorId();
    }
    else {
      return "e" + battler.index();
    }
  }

  //Message系
  Window_BattleLog.prototype.displayBarrier = function (target) {
    processingId = Barrier.getUniqueId(target);
    var targetBarrierDmg = target.result().barrieredDmg;

    var targetBarrierState = Barrier.findId($BarrierList, processingId);
    if (targetBarrierState) {
      barrierLeft = targetBarrierState.value;
    }
    else {
      barrierLeft = 0;
    }
    if (targetBarrierDmg.value) {
      this.push('addText', BarrierText.format(targetBarrierDmg.value, barrierLeft));
    }

    if (target.result().barrierBreak) {
      this.push('addText', BarrierBreakText);
    }
  };

  var Window_BattleLog_prototype_displayHpDamage = Window_BattleLog.prototype.displayHpDamage;
  Window_BattleLog.prototype.displayHpDamage = function (target) {
    this.displayBarrier(target);
    Window_BattleLog_prototype_displayHpDamage.call(this, target);
  }

  //state系
  var Game_Battler_prototype_addState = Game_Battler.prototype.addState;
  Game_Battler.prototype.addState = function (stateId) {
    Game_Battler_prototype_addState.call(this, stateId);
    targetState = $dataStates[stateId];
    processingId = Barrier.getUniqueId(this);
    var targetBarrierState = Barrier.findId($BarrierList, processingId);
    if (targetState && targetState.meta.barrier) {
      if (!targetBarrierState) {
        var barrierStateObject = {};
        barrierStateObject.id = Barrier.getUniqueId(this);
        barrierStateObject.value = parseInt(targetState.meta.barrier);
        $BarrierList.push(barrierStateObject);
      }
      else {
        targetBarrierState.value = parseInt(targetState.meta.barrier);
      }
    }
  };

  var Game_Battler_prototype_removeState = Game_Battler.prototype.removeState;
  Game_Battler.prototype.removeState = function (stateId) {
    Game_Battler_prototype_removeState.call(this, stateId)
    processingId = Barrier.getUniqueId(this);
    targetState = $dataStates[stateId];
    if (targetState && targetState.meta.barrier) {
      var targetId = Barrier.findIdIndex($BarrierList, processingId);
      $BarrierList.splice(targetId, 1);
    }
  };

  //Dmg系
  var Game_Action_prototype_executeHpDamage = Game_Action.prototype.executeHpDamage;
  Game_Action.prototype.executeHpDamage = function (target, value) {
    processingId = Barrier.getUniqueId(target);
    var targetBarrierState = Barrier.findId($BarrierList, processingId);
    var targetBarrierStateIndex = Barrier.findIdIndex($BarrierList, processingId);

    if (targetBarrierState) {
      if (value >= targetBarrierState.value) {
        var state = Barrier.findFromState(target._states);
        target.removeState(state);
        target.result().barrierBreak = true;
        if (Piercing) {
          value -= targetBarrierState.value;
        }
        else {
          value = 0;
        }
      }
      else {
        targetBarrierState.value -= value;
        target.result().barrieredDmg.id = Barrier.getUniqueId(target);
        target.result().barrieredDmg.value = value;
        value = 0;
      }
    }
    Game_Action_prototype_executeHpDamage.call(this, target, value);
  }


  //==============================
  // * Load Img
  //==============================
  Battle_Hud.prototype.load_img = function () {
    this._layout_img = ImageManager.loadBHud("Layout");
    if (String(Moghunter.bhud_layoverlay_visible) == "true") { this._layout2_img = ImageManager.loadBHud("Layout2");; };
    this._turn_img = ImageManager.loadBHud("Turn");
    this._state_img = ImageManager.loadSystem("IconSet");
    if (String(Moghunter.bhud_hp_meter_visible) == "true") { this._hp_meter_img = ImageManager.loadBHud("HP_Meter"); };
    if (String(Moghunter.bhud_hp_meter_visible) == "true") { this._shield_img = ImageManager.loadBHud("HP_Shield"); };
    if (String(Moghunter.bhud_mp_meter_visible) == "true") { this._mp_meter_img = ImageManager.loadBHud("MP_Meter"); };
    if (String(Moghunter.bhud_tp_meter_visible) == "true") { this._tp_meter_img = ImageManager.loadBHud("TP_Meter"); };
    if (String(Moghunter.bhud_at_meter_visible) == "true") { this._at_meter_img = ImageManager.loadBHud("ATB_Meter"); };
    if (String(Moghunter.bhud_hp_number_visible) == "true") { this._hp_number_img = ImageManager.loadBHud("HP_Number"); };
    if (String(Moghunter.bhud_mp_number_visible) == "true") { this._mp_number_img = ImageManager.loadBHud("MP_Number"); };
    if (String(Moghunter.bhud_tp_number_visible) == "true") { this._tp_number_img = ImageManager.loadBHud("TP_Number"); };
    if (String(Moghunter.bhud_maxhp_number_visible) == "true") { this._maxhp_number_img = ImageManager.loadBHud("HP_Number2"); };
    if (String(Moghunter.bhud_maxmp_number_visible) == "true") { this._maxmp_number_img = ImageManager.loadBHud("MP_Number2"); };
    if (String(Moghunter.bhud_maxtp_number_visible) == "true") { this._maxtp_number_img = ImageManager.loadBHud("TP_Number2"); };
  };


  //==============================
  // * Create HP Meter
  //==============================
  Battle_Hud.prototype.create_hp_meter = function () {
    if (String(Moghunter.bhud_hp_meter_visible) != "true") { return };
    this.removeChild(this._hp_meter_blue);
    this.removeChild(this._hp_meter_red);
    this.removeChild(this._hp_meter_white);
    if (!this._battler) { return };
    this._hp_meter_red = new Sprite(this._hp_meter_img);
    this._hp_meter_red.x = this._pos_x + Moghunter.bhud_hp_meter_pos_x;
    this._hp_meter_red.y = this._pos_y + Moghunter.bhud_hp_meter_pos_y;
    this._hp_meter_red.rotation = Moghunter.bhud_hp_meter_rotation * Math.PI / 180;
    this._hp_meter_red.setColorTone([0.5, 0.5, 1, 0]);
    this.addChild(this._hp_meter_red);
    this._hp_meter_blue = new Sprite(this._hp_meter_img);
    this._hp_meter_blue.x = this._hp_meter_red.x;
    this._hp_meter_blue.y = this._hp_meter_red.y;
    this._hp_meter_blue.rotation = this._hp_meter_red.rotation;
    this._hp_meter_blue.setColorTone([0.5, 0.5, 1, 0]);
    this.addChild(this._hp_meter_blue);

    this._hp_meter_white = new Sprite(this._shield_img);
    this._hp_meter_white.x = this._hp_meter_red.x;
    this._hp_meter_white.y = this._hp_meter_red.y;
    this._hp_meter_white.rotation = this._hp_meter_red.rotation;
    this._hp_meter_white.setColorTone([0.5, 0.5, 1, 0]);
    this.addChild(this._hp_meter_white);

    if (String(Moghunter.bhud_hp_meter_flow) === "true") {
      this._hp_flow[0] = true;

      this._hp_flow[2] = this._hp_meter_img.width / 3;
      this._hp_flow[3] = this._hp_flow[2] * 2;
      this._hp_flow[1] = Math.floor(Math.random() * this._hp_flow[2]);
    };
  };

  //==============================
  // * Need Refresh Parameter
  //==============================
  Battle_Hud.prototype.need_refresh_parameter = function (parameter) {
    switch (parameter) {
      case 0:
        if (this._hp_old[0] != this._battler.hp) { return true };
        if (this._hp_old[1] != this._battler.mhp) { return true };

        shield_now = 0;

        processingId = this._battler.actorId();
        var targetBarrierState = Barrier.findId($BarrierList, processingId);
        if (targetBarrierState) {
          if (this._shield_old != targetBarrierState.value) { return true; }
        };

        break;
      case 1:
        if (this._mp_old[0] != this._battler.mp) { return true };
        if (this._mp_old[1] != this._battler.mmp) { return true };
        break;
      case 2:
        if (this._tp_old[0] != this._battler.tp) { return true };
        if (this._tp_old[1] != this._battler.maxTp()) { return true };
        break;
    };
    return false;
  };

  //==============================
  // * Update HP
  //==============================
  Battle_Hud.prototype.update_hp = function () {
    if (this._hp_meter_blue) {
      if (this._hp_flow[0]) {
        this.refresh_meter_flow(this._hp_meter_blue, this._battler.hp, this._battler.mhp, 0, this._hp_flow[1]);
        var dif_meter = this.update_dif(this._hp_old_ani[0], this._battler.hp, 160)
        if (this._hp_old_ani[0] != dif_meter) {
          this._hp_old_ani[0] = dif_meter;
          this.refresh_meter_flow(this._hp_meter_red, this._hp_old_ani[0], this._battler.mhp, 1, this._hp_flow[1]);
        };
        this._hp_flow[1] += 1.5;
        if (this._hp_flow[1] > this._hp_flow[3]) { this._hp_flow[1] = 0 };
      }
      else {


        if (this.need_refresh_parameter(0)) {
          this.refresh_meter(this._hp_meter_blue, this._battler.hp, this._battler.mhp, 0);
          this._hp_old = [this._battler.hp, this._battler.mhp];

          processingId = this._battler.actorId();
          var targetBarrierState = Barrier.findId($BarrierList, processingId);
          var targetBarrierStateIndex = Barrier.findIdIndex($BarrierList, processingId);

          if (targetBarrierState) {
            this._shield_old = targetBarrierState.value;
            this.refresh_meter2(this._hp_meter_white, targetBarrierState.value, this._battler.hp - targetBarrierState.value, this._battler.mhp, 0);

          } else {
            this.refresh_meter(this._hp_meter_white, 0, this._battler.mhp, 0);
          }


        };
        var dif_meter = this.update_dif(this._hp_old_ani[0], this._battler.hp, 160)
        if (this._hp_old_ani[0] != dif_meter) {
          this._hp_old_ani[0] = dif_meter;
          this.refresh_meter(this._hp_meter_red, this._hp_old_ani[0], this._battler.mhp, 1);
        };


      };
    };
    if (this._hp_number) {
      var dif_number = this.update_dif(this._hp_number_old, this._battler.hp, 30)
      if (this._hp_number_old != dif_number) {
        this._hp_number_old = dif_number;
        this.refresh_number(this._hp_number, this._hp_number_old, this._hp_img_data, this._hp_img_data[4], this._hp_img_data[5], 0);
      };
    };
    if (this._maxhp_number) {
      if (this._maxhp_number_old != this._battler.mhp) {
        this._maxhp_number_old = this._battler.mhp;
        this.refresh_number(this._maxhp_number, this._maxhp_number_old, this._maxhp_img_data, this._maxhp_img_data[4], this._maxhp_img_data[5], 0);
      };
    };
  };
  //==============================
  // * Refresh Meter2
  //==============================
  Battle_Hud.prototype.refresh_meter2 = function (sprite, value, value_start, value_max, type) {
    var ch = sprite.bitmap.height / 2;
    var meter_rate = sprite.bitmap.width * value / value_max;
    var meter_start = sprite.bitmap.width * value_start / value_max;
    sprite.setFrame(meter_start, type * ch, meter_rate, ch);
    this._hp_meter_white.x = this._hp_meter_red.x + meter_start;

  };

})();