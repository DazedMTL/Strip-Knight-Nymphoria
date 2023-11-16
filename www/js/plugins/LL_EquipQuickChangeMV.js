//=============================================================================
// RPGツクールMZ - LL_EquipQuickChangeMV.js v1.2.0
//-----------------------------------------------------------------------------
// ルルの教会 (Lulu's Church)
// https://nine-yusha.com/
//
// URL below for license details.
// https://nine-yusha.com/plugin/
//=============================================================================

/*:
 * @target MV
 * @plugindesc 「今すぐ装備」コマンドを実装します。
 * @author ルルの教会
 * @url https://nine-yusha.com/plugin-quickequip/
 *
 * @help LL_EquipQuickChangeMV.js
 *
 * 対象の装備品を誰に装備するか選択するウィンドウを表示します。
 * 装備品入手時に、いわゆる「今すぐ装備する」コマンドを実装できます。
 * プラグインコマンドで実行してください。
 *
 * プラグインコマンド:
 *   LL_EquipQuickChangeMV changeWeapon [武器ID] [質問メッセージ]
 *   LL_EquipQuickChangeMV changeArmor [防具ID] [質問メッセージ]
 *   ※対象の装備品を所持していない場合、プラグインコマンドは無視されます。
 *
 * 利用規約:
 *   ・著作権表記は必要ございません。
 *   ・利用するにあたり報告の必要は特にございません。
 *   ・商用・非商用問いません。
 *   ・R18作品にも使用制限はありません。
 *   ・ゲームに合わせて自由に改変していただいて問題ございません。
 *   ・プラグイン素材としての再配布（改変後含む）は禁止させていただきます。
 *
 * 作者: ルルの教会
 * 作成日: 2022/8/18
 *
 * @param shopSettings
 * @text ショップ連動設定
 * @desc ※この項目は使用しません
 *
 * @param shopEnabled
 * @text 装備品購入時に自動表示
 * @desc ショップで装備品を購入した時に装備切替画面を表示します。
 * @default true
 * @type boolean
 * @parent shopSettings
 *
 * @param shopDisabledswitchId
 * @text 購入時無効化スイッチID
 * @desc ショップで装備品を購入した時、
 * このスイッチがONの時は装備切替画面を一時的に表示しません。
 * @type switch
 * @parent shopSettings
 *
 * @param shopMultipleEquip
 * @text 複数購入時に連続選択
 * @desc ショップで装備品を複数購入した場合に、
 * 購入数分選択画面を繰り返し表示します。
 * @default false
 * @type boolean
 * @parent shopSettings
 *
 * @param iniInfoText
 * @text 質問メッセージ
 * @desc 「質問メッセージ」の文言設定です。
 * @default 装備しますか？
 * @type string
 *
 * @param iniEquipNgText
 * @text 装備不可メッセージ
 * @desc 「装備不可」の文言設定です。
 * @default 装備できません。
 * @type string
 *
 * @param iniCancelText
 * @text キャンセルコマンド名
 * @desc 「キャンセル」コマンドの文言設定です。
 * @default 装備しない
 * @type string
 */

(function () {
    "use strict";
    var pluginName = "LL_EquipQuickChangeMV";

    var parameters = PluginManager.parameters(pluginName);
    var shopEnabled = eval(parameters["shopEnabled"] || "true");
    var shopDisabledswitchId = Number(parameters["shopDisabledswitchId"] || 0);
    var shopMultipleEquip = eval(parameters["shopMultipleEquip"] || "false");
    var iniInfoText = String(parameters["iniInfoText"] || "装備しますか？");
    var iniEquipNgText = String(parameters["iniEquipNgText"] || "装備できません。");
    var iniCancelText = String(parameters["iniCancelText"] || "装備しない");


    // 独自変数定義
    var infoText = "";
    var exGoods = null;
    var exPurchaseOnly = null;
    var exBuyWindowLastIndex = 0;
    var exBuyCount = 1;


    //-----------------------------------------------------------------------------
    // PluginCommand (for MV)
    //

    var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function (command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args);
        if (command === pluginName) {
            switch (args[0]) {
                case "changeWeapon":  // 武器の装備変更
                    var weaponId = Number(args[1] || null);
                    if (weaponId) {
                        // 対象装備品を所持しているか？
                        if ($gameParty.hasItem($dataWeapons[weaponId], true)) {
                            // 武器情報を取得
                            ExEquipTargetItem.set($dataWeapons[weaponId]);
                            // 文言をセット
                            infoText = String(args[2] || "");
                            // ショップ判定オフ
                            exGoods = null;
                            exPurchaseOnly = null;
                            exBuyWindowLastIndex = 0;
                            exBuyCount = 1;
                            // 装備選択画面へ
                            SceneManager.push(Scene_EquipQuickChange);
                        } else {
                            console.log(pluginName + ": 対象の装備品を所持していなかったため、コマンドがスキップされました");
                        }
                    }
                    return;
                case "changeArmor":  // 防具の装備変更
                    var armorId = Number(args[1] || null);
                    if (armorId) {
                        // 対象装備品を所持しているか？
                        if ($gameParty.hasItem($dataArmors[armorId], true)) {
                            // 防具情報を取得
                            ExEquipTargetItem.set($dataArmors[armorId]);
                            // 文言をセット
                            infoText = String(args[2] || "");
                            // ショップ判定オフ
                            exGoods = null;
                            exPurchaseOnly = null;
                            exBuyWindowLastIndex = 0;
                            exBuyCount = 1;
                            // 装備選択画面へ
                            SceneManager.push(Scene_EquipQuickChange);
                        } else {
                            console.log(pluginName + ": 対象の装備品を所持していなかったため、コマンドがスキップされました");
                        }
                    }
                    return;
            }
        }
    };

    //-----------------------------------------------------------------------------
    // ExEquipTargetItem
    //

    class ExEquipTargetItem {

        constructor() {
            this.item = null;
        }

        static get() {
            return this.item;
        }

        static set(item) {
            this.item = item;
        }

        static getSlotId() {
            return this.item.etypeId - 1;
        }

        static getEtypeId() {
            return this.item.etypeId;
        }

    }

    //-----------------------------------------------------------------------------
    // Scene_EquipQuickChange
    //
    // 対象の装備品と変更する独自のシーンを追加定義します。

    function Scene_EquipQuickChange() {
        this.initialize.apply(this, arguments);
    }

    Scene_EquipQuickChange.prototype = Object.create(Scene_MenuBase.prototype);
    Scene_EquipQuickChange.prototype.constructor = Scene_EquipQuickChange;

    Scene_EquipQuickChange.prototype.initialize = function () {
        Scene_MenuBase.prototype.initialize.call(this);
        this._equipCount = $gameParty.size() < exBuyCount ? $gameParty.size() : exBuyCount;
    };

    Scene_EquipQuickChange.prototype.start = function () {
        Scene_MenuBase.prototype.start.call(this);
        this._statusWindow.refresh();
    };

    Scene_EquipQuickChange.prototype.helpAreaHeight = function () {
        return this.calcWindowHeight(2, false);
    };

    Scene_EquipQuickChange.prototype.create = function () {
        Scene_MenuBase.prototype.create.call(this);
        this.createHelpWindow();
        this.createInfoWindow();
        this.createStatusWindow();
        this.createCommandWindow();
        this._helpWindow.setText(this.helpWindowText());
        this.infoWindowSetText();
    };

    Scene_EquipQuickChange.prototype.createHelpWindow = function () {
        this._helpWindow = new Window_Help(2);
        this._helpWindow.y = Graphics.boxHeight - this._helpWindow.height;
        this.addWindow(this._helpWindow);
    };

    Scene_EquipQuickChange.prototype.createInfoWindow = function () {
        this._infoWindow = new Window_Help(2);
        this._infoWindow.x = this.statusWidth();
        this._infoWindow.y = 0;
        this._infoWindow.width = Graphics.boxWidth - this.statusWidth();
        this.addWindow(this._infoWindow);
    };

    Scene_EquipQuickChange.prototype.createStatusWindow = function () {
        this._statusWindow = new Window_EquipStatusQuickChange();
        this._statusWindow.reserveFaceImages();
        this.addWindow(this._statusWindow);
    };

    Scene_EquipQuickChange.prototype.createCommandWindow = function () {
        var commandWindow = new Window_EquipQuickActor();
        commandWindow.setHandler("ok", this.checkPopScene.bind(this));
        commandWindow.setHandler("cancel", this.popScene.bind(this));
        commandWindow.setStatusWindow(this._statusWindow);
        this.addWindow(commandWindow);

        this._commandWindow = commandWindow;
    };

    Scene_EquipQuickChange.prototype.helpWindowText = function () {
        var targetItem = ExEquipTargetItem.get();
        return targetItem.description;
    };

    Scene_EquipQuickChange.prototype.infoWindowSetText = function () {
        var targetItem = ExEquipTargetItem.get();
        var width = this._infoWindow.contentsWidth();
        var y2 = this._infoWindow.lineHeight();

        var numberWidth = this._infoWindow.textWidth(":00");
        var equipCount = this._equipCount;

        this._infoWindow.drawItemName(targetItem, 0, 0, width - numberWidth);
        this._infoWindow.drawText(":", width - numberWidth, 0, this._infoWindow.textWidth(":"), "right");
        this._infoWindow.drawText(equipCount, width - numberWidth + this._infoWindow.textWidth(":"), 0, this._infoWindow.textWidth("00"), "right");

        this._infoWindow.drawText(infoText, 0, y2, width);
    };

    Scene_EquipQuickChange.prototype.statusWidth = function () {
        return 312;
    };

    Scene_EquipQuickChange.prototype.popScene = function () {
        SceneManager.pop();
        // ショップ判定
        if (exGoods !== null) {
            SceneManager.prepareNextScene(exGoods, exPurchaseOnly);
            SceneManager._nextScene.buyWindowFocusOn();
        }
    };

    Scene_EquipQuickChange.prototype.checkPopScene = function () {
        // 装備回数が0になったら終了
        this._equipCount -= 1;
        if (this._equipCount > 0) {
            this._commandWindow.activate();
            this._commandWindow.refresh();
            this._statusWindow.refresh();
            this._infoWindow.refresh();
            this.infoWindowSetText();
        } else {
            this.popScene();
        }
    };


    //-----------------------------------------------------------------------------
    // Window_EquipStatusQuickChange
    //
    // The window for displaying parameter changes on the equipment screen.

    function Window_EquipStatusQuickChange() {
        this.initialize.apply(this, arguments);
    }

    Window_EquipStatusQuickChange.prototype = Object.create(Window_EquipStatus.prototype);
    Window_EquipStatusQuickChange.prototype.constructor = Window_EquipStatusQuickChange;

    Window_EquipStatusQuickChange.prototype.initialize = function () {
        Window_EquipStatus.prototype.initialize.call(this, 0, 0);
    };

    Window_EquipStatusQuickChange.prototype.windowHeight = function () {
        return 516;
    };

    Window_EquipStatusQuickChange.prototype.refresh = function () {
        this.contents.clear();
        if (this._actor) {
            this.drawActorName(this._actor, this.textPadding(), 0);
            this.drawActorFace(this._actor, this.textPadding(), this.lineHeight());
            for (var i = 0; i < 6; i++) {
                this.drawItem(0, this.lineHeight() * (6 + i), 2 + i);
            }
        }
    };

    Window_EquipStatusQuickChange.prototype.refreshDisabled = function () {
        this.contents.clear();
        if (this._actor) {
            this.drawActorName(this._actor, this.textPadding(), 0);
            this.drawActorFace(this._actor, this.textPadding(), this.lineHeight());

            this.drawAllParamsDisabled();
        }
    };

    Window_EquipStatusQuickChange.prototype.drawAllParamsDisabled = function () {
        var x = this.textPadding();
        var y = this.lineHeight() * 6;
        var width = this.width - this.textPadding() * 2;
        this.changeTextColor(this.powerDownColor());
        // 装備不可
        this.drawText(iniEquipNgText, x, y, width);
    };


    //-----------------------------------------------------------------------------
    // Window_EquipQuickActor
    //
    // 装備を変更する対象アクターを選択するウィンドウです。

    function Window_EquipQuickActor() {
        this.initialize.apply(this, arguments);
    }

    Window_EquipQuickActor.prototype = Object.create(Window_Command.prototype);
    Window_EquipQuickActor.prototype.constructor = Window_EquipQuickActor;

    Window_EquipQuickActor.prototype.initialize = function () {
        var x = 312;
        var y = 108;
        Window_Command.prototype.initialize.call(this, x, y);
    };

    Window_EquipQuickActor.prototype.windowWidth = function () {
        return Graphics.boxWidth - 312;
    };

    Window_EquipQuickActor.prototype.windowHeight = function () {
        return 408;
    };

    Window_EquipQuickActor.prototype.makeCommandList = function () {
        this.addPartyMembers();
    };

    Window_EquipQuickActor.prototype.addPartyMembers = function () {
        var _this = this;
        var targetItem = ExEquipTargetItem.get();
        var slotId = ExEquipTargetItem.getSlotId();
        this.addCommand(iniCancelText, "cancel");
        $gameParty.members().forEach(function (item) {
            if (item.canEquip(targetItem) && item.isEquipChangeOk(slotId)) {
                _this.addCommand(item._name, item._actorId, true);
            } else {
                _this.addCommand(item._name, item._actorId, false);
            }
        });
    };

    Window_EquipQuickActor.prototype.drawItem = function (index) {
        var actorName = this.commandName(index);
        var equippedName = this.equippedName(index);
        var rect = this.itemRectForText(index);
        var equippedWidth = this.equippedWidth();
        var actorNameWidth = rect.width - equippedWidth;
        this.resetTextColor();
        this.changePaintOpacity(this.isCommandEnabled(index));
        this.drawText(actorName, rect.x, rect.y, actorNameWidth, "left");
        this.drawItemName(equippedName, rect.x + actorNameWidth, rect.y, equippedWidth);
    };

    Window_EquipQuickActor.prototype.equippedWidth = function () {
        return 240;
    };

    Window_EquipQuickActor.prototype.equippedName = function (index) {
        var symbol = this.commandSymbol(index);
        var value = this.getEquippedItem(symbol);
        return value ? value : null;
    };

    Window_EquipQuickActor.prototype.getEquippedItem = function (symbol) {
        var actor = $gameActors.actor(symbol);
        var slotId = ExEquipTargetItem.getSlotId();
        return actor ? actor.equips()[slotId] : null;
    };

    Window_EquipQuickActor.prototype.setStatusWindow = function (statusWindow) {
        this._statusWindow = statusWindow;
        this.refreshActor();
    };

    Window_EquipQuickActor.prototype.cursorUp = function (wrap) {
        Window_Selectable.prototype.cursorUp.call(this, wrap);
        this.refreshActor();
    };

    Window_EquipQuickActor.prototype.cursorDown = function (wrap) {
        Window_Selectable.prototype.cursorDown.call(this, wrap);
        this.refreshActor();
    };

    Window_EquipQuickActor.prototype.onTouch = function (triggered) {
        Window_Selectable.prototype.onTouch.call(this, triggered);
        this.refreshActor();
    };

    Window_EquipQuickActor.prototype.refreshActor = function () {
        var index = this.index();
        var symbol = this.commandSymbol(index);
        if (this._statusWindow) {
            // キャンセルの場合
            if (symbol === "cancel") {
                this._statusWindow.contents.clear();
                return;
            }
            var actor = $gameActors.actor(symbol);
            var targetItem = ExEquipTargetItem.get();
            var slotId = ExEquipTargetItem.getSlotId();
            this._statusWindow.setActor(actor);
            // 装備後のパラメータを表示
            if (actor.canEquip(targetItem) && actor.isEquipChangeOk(slotId)) {
                var actorTmp = JsonEx.makeDeepCopy(actor);
                actorTmp.forceChangeEquip(slotId, targetItem);
                this._statusWindow.setTempActor(actorTmp);
            } else {
                this._statusWindow.refreshDisabled();
            }
        }
    };

    Window_EquipQuickActor.prototype.processOk = function () {
        if (this.isCurrentItemEnabled()) {
            this.playOkSound();
            this.equipChange();
            this.deactivate();
            this.callOkHandler();
        } else {
            this.playBuzzerSound();
        }
    };

    Window_EquipQuickActor.prototype.equipChange = function () {
        var index = this.index();
        var symbol = this.commandSymbol(index);
        // キャンセルの場合
        if (symbol === "cancel") return;
        var targetItem = ExEquipTargetItem.get();
        var etypeId = ExEquipTargetItem.getEtypeId();
        $gameActors.actor(symbol).changeEquipById(etypeId, targetItem.id);
    };

    Window_EquipQuickActor.prototype.playOkSound = function () {
        var index = this.index();
        var symbol = this.commandSymbol(index);
        // 決定音 or 装備音
        symbol === "cancel" ? SoundManager.playOk() : SoundManager.playEquip();
    };


    //-----------------------------------------------------------------------------
    // Scene_Shop を拡張
    //

    var _Scene_Shop_initialize = Scene_Shop.prototype.initialize;
    Scene_Shop.prototype.initialize = function () {
        _Scene_Shop_initialize.apply(this, arguments);
        this._buyWindowFocus = false;
    };

    var _Scene_Shop_create = Scene_Shop.prototype.create;
    Scene_Shop.prototype.create = function () {
        _Scene_Shop_create.apply(this, arguments);
        this.buyWindowFocus();
    };

    Scene_Shop.prototype.buyWindowFocusOn = function () {
        this._buyWindowFocus = true;
    };

    Scene_Shop.prototype.buyWindowFocus = function () {
        if (!this._buyWindowFocus) return;
        this._commandWindow.deactivate();
        this._buyWindow.setMoney(this.money());
        this._buyWindow.show();
        this._buyWindow.activate();
        this._statusWindow.show();
        // カーソルを合わせる
        if (exBuyWindowLastIndex > 0) {
            this._buyWindow.select(exBuyWindowLastIndex);
        }
    };

    var _Scene_Shop_onNumberOk = Scene_Shop.prototype.onNumberOk;
    Scene_Shop.prototype.onNumberOk = function () {
        // 購入かつ装備品の場合
        if (this._commandWindow.currentSymbol() === "buy" && this._item.etypeId) {
            // ショップ連動設定が有効の場合
            if (shopEnabled && !$gameSwitches.value(shopDisabledswitchId)) {
                this.gotoEquipQuickChange();
                return;
            }
        }
        _Scene_Shop_onNumberOk.apply(this, arguments);
    }

    Scene_Shop.prototype.gotoEquipQuickChange = function () {
        SoundManager.playShop();
        this.doBuy(this._numberWindow.number());
        // 装備情報を取得
        var targetItem = this._item;
        ExEquipTargetItem.set(targetItem);
        // 文言をセット
        infoText = iniInfoText;
        // ショップ情報を保持
        exGoods = this._goods;
        exPurchaseOnly = this._purchaseOnly;
        exBuyWindowLastIndex = this._buyWindow.index();
        exBuyCount = shopMultipleEquip ? this._numberWindow.number() : 1;
        // 装備選択画面へ
        SceneManager.push(Scene_EquipQuickChange);
    }
})();
