//=============================================================================
// BossBar.js
//=============================================================================
//v2.0 
/*:
 * @plugindesc Makes boss hp bar appear in battle if you have note tag on the boss. 
 * @author Jeremy Cannady
 *
 * @param Boss Border X
 * @desc Select x position adjust.Positive to go right, negative to go left.
 * @default 50
 *
 * @param Boss Border Y
 * @desc Select the y position adjust. Poistive to go down, negative to go up.
 * @default 350
 *
 * @param Boss Bar X
 * @desc Select x position adjust.Positive to go right, negative to go left.
 * @default 202
 *
 * @param Boss Bar Y
 * @desc Select the y position adjust. Poistive to go down, negative to go up.
 * @default 400
 *
 * @param Turn Opacity
 * @desc Opacity of the bars when you are attacking, etc. 255 is visible 0 is invisible.
 * @default 255
 *
 * @param Input Opacity
 * @desc Opacity of the bars when you are selcting actions to do. 255 is visible 0 is invisible.
 * @default 100
 *
 * @param Scale
 * @desc Scales both of the images. 1.2 is 20% increase. 0.8 is 80% of original. 1 is no scale.
 * @default 1
 *
 * @help
 * Put <Boss:1> in the enemy note tag to activate. No Spaces.
 *This will get the image BossBar1.png and BossFill1.png from the img/pictures
 *and display this during battle.Please note if you scale the image you need to adjust the x and y values.
 *
*/

(function () {
	//=============================================================================
	// Create variables.
	//=============================================================================
	var parameters = PluginManager.parameters('BossBar');
	var bossbx = Number(parameters['Boss Border X'] || 50);
	var bossby = Number(parameters['Boss Border Y'] || 350);
	var bossbgx = Number(parameters['Boss Bar X'] || 202);
	var bossbgy = Number(parameters['Boss Bar Y'] || 400);
	var inputOpacity = Number(parameters['Input Opacity'] || 255);
	var turnOpacity = Number(parameters['Turn Opacity'] || 255);
	var scale = Number(parameters['Scale'] || 1);
	//=============================================================================
	// Create sprite layer to display boss gauge.
	//=============================================================================
	var alias_BossGauge_createLowerLayer = Spriteset_Battle.prototype.createLowerLayer
	Spriteset_Battle.prototype.createLowerLayer = function () {
		alias_BossGauge_createLowerLayer.call(this);
		this.createBossGauge();
	}
	//=============================================================================
	// Create update function to update the gauge.
	//=============================================================================
	var alias_SSB_update = Spriteset_Battle.prototype.update
	Spriteset_Battle.prototype.update = function () {
		alias_SSB_update.call(this);
		this.updateBossGauge();
	}
	//=============================================================================
	// Create the bitmaps and add them.
	//=============================================================================
	Spriteset_Battle.prototype.createBossGauge = function () {
		this.bitmap1 = new Array($gameTroop._enemies.length);
		this.bitmap2 = new Array($gameTroop._enemies.length);
		this.HPrate = new Array($gameTroop._enemies.length);
		this.bitmap3 = new Array($gameTroop._enemies.length);
		this.bitmap4 = new Array($gameTroop._enemies.length);
		this.MPrate = new Array($gameTroop._enemies.length);
		for (var i = 0; i < $gameTroop._enemies.length; i++) {
			if ($dataEnemies[$gameTroop._enemies[i]._enemyId].meta.Boss) {
				this.bitmap1[i] = new Sprite(ImageManager.loadPicture('bossHP'));
				this.bitmap2[i] = new Sprite(ImageManager.loadPicture('bossHPfill'));
				this.bitmap1[i].x = 30;
				this.bitmap1[i].y = 410;
				this.bitmap2[i].x = this.bitmap1[i].x + 100;
				this.bitmap2[i].y = this.bitmap1[i].y;

				//				this.bitmap1[i].scale.x = 1.5;
				//				this.bitmap2[i].scale.x = 1.5;
				this.HPrate[i] = 1;
				this.addChild(this.bitmap1[i]);
				this.addChild(this.bitmap2[i]);
				this.bitmap1[i].opacity = 0;
				this.bitmap2[i].opacity = 0;
			} else if (!$dataEnemies[$gameTroop._enemies[i]._enemyId].meta.noHP) {
				this.bitmap1[i] = new Sprite(ImageManager.loadPicture('enemyHP'));
				this.bitmap2[i] = new Sprite(ImageManager.loadPicture('enemyHPfill'));
				this.bitmap1[i].x = $gameTroop._enemies[i]._screenX - 50;
				this.bitmap1[i].y = $gameTroop._enemies[i]._screenY - 100;
				this.bitmap2[i].x = $gameTroop._enemies[i]._screenX;
				this.bitmap2[i].y = $gameTroop._enemies[i]._screenY - 100;

				this.bitmap1[i].scale.x = 0.5;
				this.bitmap1[i].scale.y = 0.5;
				this.bitmap2[i].scale.x = 0.5;
				this.bitmap2[i].scale.y = 0.5;

				this.HPrate[i] = 1;
				this.addChild(this.bitmap1[i]);
				this.addChild(this.bitmap2[i]);
				this.bitmap1[i].opacity = 0;
				this.bitmap2[i].opacity = 0;
			}

		}
	}
	//=============================================================================
	// Update the gauge based on boss HP.
	//=============================================================================
	Spriteset_Battle.prototype.updateBossGauge = function () {

		for (var i = 0; i < $gameTroop._enemies.length; i++) {
			if (!$dataEnemies[$gameTroop._enemies[i]._enemyId].meta.noHP) {
				var rate = $gameTroop._enemies[i]._hp / $dataEnemies[$gameTroop._enemies[i]._enemyId].params[0];
				if (rate > 1) { rate = 1 };
				this.HPrate[i] = (this.HPrate[i] * 0.84 + rate * 0.16);
				rate = $gameTroop._enemies[i]._mp / 100;
				if (rate > 1) { rate = 1 };
				this.MPrate[i] = (this.MPrate[i] * 0.84 + rate * 0.16);
				this.bitmap2[i].setFrame(0, 0, this.bitmap2[i].bitmap.width * this.HPrate[i], this.bitmap2[i].bitmap.height);
				//			this.bitmap4[i].setFrame(0, 0, this.bitmap2[i].bitmap.width * this.MPrate[i], this.bitmap2[i].height);
				if ($gameTroop._enemies[i]._hp == 0 || $gameTroop._enemies[i].isHidden()) {
					this.bitmap1[i].opacity -= 5;
					this.bitmap2[i].opacity -= 5;
					//				this.bitmap3[i].opacity -= 5;
					//				this.bitmap4[i].opacity -= 5;
				} else {
					this.bitmap1[i].opacity = 255;
					this.bitmap2[i].opacity = 255;
					//				this.bitmap3[i].opacity = 255;
					//				this.bitmap4[i].opacity = 255;
				}
			}
		}
	}
})();


//				$gameTroop.currentBossTroopID = i;
//				$gameTroop.currentBossID = $gameTroop._enemies[i]._enemyId;
/*
Game_Enemy.prototype.refresh = function() {
	Game_BattlerBase.prototype.refresh.call(this);
//    if (this.hp === 0 || (this.isEnemy && this.mp === 0)) {
	if (this.hp === 0) {
		this.addState(this.deathStateId());
	} else {
		this.removeState(this.deathStateId());
	}
};
*/

