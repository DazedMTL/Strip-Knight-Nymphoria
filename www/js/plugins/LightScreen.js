

/*:
 * @plugindesc 画面を明るくします
 *
 * @help
 * 画面を明るくします。
 *
 */


var Imported = Imported || {};
Imported.LightScreen = true;

var parameters = PluginManager.parameters('LightScreen');



(function () {

	Bitmap.prototype.bltEX = function (source, sx, sy, sw, sh, dx, dy, dw, dh) {
		dw = dw || sw;
		dh = dh || sh;
		if (sx >= 0 && sy >= 0 && sw > 0 && sh > 0 && dw > 0 && dh > 0 &&
			sx + sw <= source.width && sy + sh <= source.height) {
			this._context.globalCompositeOperation = 'screen';
			this._context.drawImage(source._image, sx, sy, sw, sh, dx, dy, dw, dh);
			this._setDirty();
		}
	};

	function Sprite_LightScreen() {
		this.initialize.apply(this, arguments);
	}

	Sprite_LightScreen.prototype = Object.create(Sprite.prototype);
	Sprite_LightScreen.prototype.constructor = Sprite_LightScreen;

	Sprite_LightScreen.prototype.initialize = function () {
		Sprite.prototype.initialize.call(this);


		this.lights = [];

		this.lights.push(ImageManager.loadSystem('TMAnimeLight2'));
		this.lights.push(ImageManager.loadSystem('light1'));
		this.lights.push(ImageManager.loadSystem('light2'));
		this.lights.push(ImageManager.loadSystem('light3'));
		this.lights.push(ImageManager.loadSystem('light4'));
		this.lights.push(ImageManager.loadSystem('light5'));
		this.lights.push(ImageManager.loadSystem('light6'));
		this.lights.push(ImageManager.loadSystem('light7'));

		this.createBitmap();
		this.update();
	};

	Sprite_LightScreen.prototype.createBitmap = function () {
		this.bitmap = new Bitmap(Graphics.width, Graphics.height);
	};

	Sprite_LightScreen.prototype.update = function () {
		Sprite.prototype.update.call(this);
		this.updateBitmap();

		this.x = 0;
		this.y = 0;
		this.z = -1000;
		/*	    if ($gameVariables.value(3) === 0){
					this.opacity = 200;
				}else{
					this.opacity = 255;
				}
		*/
		this.opacity = 200;
		this.blendMode = 1;
		this.visible = true;

	};

	Sprite_LightScreen.prototype.updateBitmap = function () {
		this.redraw();
	};

	Sprite_LightScreen.prototype.redraw = function () {

		this.bitmap.clear();
		this.bitmap.fillAll(0);

		//		this.bitmap.bltEX(this.lights[0],0,0,384,384,$gamePlayer.screenX()-192,$gamePlayer.screenY()-192-16);

		for (ev of $gameMap.events()) {
			var key = [$gameMap.mapId(), ev.eventId(), 'C'];

			if (ev.addlight > 0 && $gameSelfSwitches.value(key) !== true) {
				/*			    switch (ev.direction()) {
								case 2:
									px = 0;
									py = 48;
									break;
								case 4:
									px = -48;
									py = 0;
									break;
								case 6:
									px = 48;
									py = 0;
									break;
								case 8:
									px = 0;
									py = -48;
									break;
								}
				*/
				px = 0;
				py = 0;
				this.bitmap.bltEX(this.lights[ev.addlight], 0, 0, this.lights[ev.addlight].width, this.lights[ev.addlight].height, ev.screenX() - this.lights[ev.addlight].width / 2 + px, ev.screenY() - this.lights[ev.addlight].height / 2 - 16 + py);
			} else {
			}



		}
		//	this.bitmap.blur();
	};

	Sprite_LightScreen.prototype.timerText = function () {
		var min = Math.floor(this._seconds / 60) % 60;
		var sec = this._seconds % 60;
		return min.padZero(2) + ':' + sec.padZero(2);
	};

	Sprite_LightScreen.prototype.updatePosition = function () {
		this.x = Graphics.width - this.bitmap.width;
		this.y = 0;
	};

	Sprite_LightScreen.prototype.updateVisibility = function () {
		this.visible = $gameTimer.isWorking();
	};

	var LS_Game_EventSetupPageSettings = Game_Event.prototype.setupPageSettings;
	Game_Event.prototype.setupPageSettings = function () {
		LS_Game_EventSetupPageSettings.call(this);
		this.setupLight();

	};

	Game_Event.prototype.setupLight = function () {
		var event, pattern, match, note, cnt, i, n, m,
			options, op, value;
		event = this.event();
		pattern = /<(?:addlight)(?:\:)([ 0-9a-z\[\]\\]*)?>/;
		this.addlight = 0;
		if (event.note) {
			note = event.note.toLowerCase();
			note = note.split(/ (?=<)/);
			cnt = note.length;
			for (i = 0; i < cnt; i++) {
				n = note[i].trim();
				if (n.match(pattern)) {
					match = n.match(pattern);
					if (match[0]) {
						this.addlight = match[1];
					}
				}
			}
		}
	}
	var _LIS_Spriteset_Map_createLowerLayer = Spriteset_Map.prototype.createLowerLayer;
	Spriteset_Map.prototype.createLowerLayer = function () {
		_LIS_Spriteset_Map_createLowerLayer.call(this);

		this.createLightSprite();
	}
	Spriteset_Map.prototype.createLightSprite = function () {
		this.LightScreen = new Sprite_LightScreen();
		this.addChild(this.LightScreen);
	};


})();


