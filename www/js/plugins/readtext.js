

$cg_picture = 0;
$erace_picture = 0;
$tatie_picture1 = 0;
$tatie_picture2 = 0;
$tatie_picture3 = 0;

(function () {


	//-----------------------------------------------------------------------------
	// Game_Interpreter
	//


	var _rt_Game_Interpreter_executeCommand = Game_Interpreter.prototype.executeCommand;
	Game_Interpreter.prototype.executeCommand = function () {

		var ret = false;

		if ($erace_picture) {
			if ($cg_picture === 1) {
				$gameScreen.movePicture(1, 0, 0, 0, 100, 100, 0, 0, 30);
			} else {
				$gameScreen.movePicture(2, 0, 0, 0, 100, 100, 0, 0, 30);
			}
			$erace_picture = 0;
			return true;
		}
		if ($ScenarioAry) {
			cnt = $ScenarioAry.length;
			console.log(cnt);
			if (cnt && !$gameMessage.isBusy()) {
				console.log($ScenarioAry[0]);

				var txt = $ScenarioAry.shift().split(' ');
				if (txt[0].match("picture")) {
					if ($cg_picture === 1) {
						$cg_picture = 0;

						$gameScreen.showPicture(1, txt[1], 0, 20, 0, 100, 100, 255, 0);
						//					    $gameScreen.movePicture(1, 0,20,0,100,100,255,0,30);
						$gameScreen.movePicture(2, 0, 20, 0, 100, 100, 0, 0, 30);

					} else {
						$cg_picture = 1;

						$gameScreen.showPicture(2, txt[1], 0, 20, 0, 100, 100, 0, 0);
						$gameScreen.movePicture(2, 0, 20, 0, 100, 100, 255, 0, 30);
						$gameScreen.movePicture(1, 0, 20, 0, 100, 100, 0, 0, 0);
					}

					$erace_picture = 1;
					this.wait(30);
					return true;

				}
				else if (txt[0].match("tatie1")) {
					if ($tatie_picture1 === 1) {
						$tatie_picture1 = 0;

						$gameScreen.showPicture(3, txt[1], 0, 0, 0, 100, 100, 255, 0);
						$gameScreen.movePicture(4, 0, 0, 0, 100, 100, 0, 0, 30);

					} else {
						$tatie_picture1 = 1;

						$gameScreen.showPicture(4, txt[1], 0, 0, 0, 100, 100, 0, 0);
						$gameScreen.movePicture(4, 0, 0, 0, 100, 100, 255, 0, 30);
						$gameScreen.movePicture(3, 0, 0, 0, 100, 100, 0, 0, 0);
					}
					this.wait(30);
					return true;
				}
				else if (txt[0].match("tatie2")) {
					if ($tatie_picture2 === 1) {
						$tatie_picture2 = 0;

						$gameScreen.showPicture(5, txt[1], 0, 340, 0, 100, 100, 255, 0);
						$gameScreen.movePicture(6, 0, 340, 0, 100, 100, 0, 0, 30);

					} else {
						$tatie_picture2 = 1;

						$gameScreen.showPicture(6, txt[1], 0, 340, 0, 100, 100, 0, 0);
						$gameScreen.movePicture(6, 0, 340, 0, 100, 100, 255, 0, 30);
						$gameScreen.movePicture(5, 0, 340, 0, 100, 100, 0, 0, 0);
					}
					this.wait(30);
					return true;
				}
				else if (txt[0].match("tatie3")) {
					if ($tatie_picture3 === 1) {
						$tatie_picture3 = 0;

						$gameScreen.showPicture(7, txt[1], 0, 500, 0, 100, 100, 255, 0);
						$gameScreen.movePicture(8, 0, 500, 0, 100, 100, 0, 0, 30);

					} else {
						$tatie_picture3 = 1;

						$gameScreen.showPicture(8, txt[1], 0, 500, 0, 100, 100, 0, 0);
						$gameScreen.movePicture(8, 0, 500, 0, 100, 100, 255, 0, 30);
						$gameScreen.movePicture(7, 0, 500, 0, 100, 100, 0, 0, 0);
					}
					this.wait(30);
					return true;
				}
				else if (txt[0].match("eracetatie1")) {
					if ($tatie_picture1 === 1) {
						$gameScreen.movePicture(3, 0, 0, 0, 100, 100, 0, 0, 30);
					} else {
						$gameScreen.movePicture(4, 0, 0, 0, 100, 100, 0, 0, 30);
					}
				}
				else if (txt[0].match("eracetatie2")) {
					if ($tatie_picture2 === 1) {
						$gameScreen.movePicture(5, 0, 650, 0, 100, 100, 0, 0, 30);
					} else {
						$gameScreen.movePicture(6, 0, 650, 0, 100, 100, 0, 0, 30);
					}
				}
				else if (txt[0].match("eracetatie3")) {
					if ($tatie_picture3 === 1) {
						$gameScreen.movePicture(7, 0, 650, 0, 100, 100, 0, 0, 30);
					} else {
						$gameScreen.movePicture(8, 0, 650, 0, 100, 100, 0, 0, 30);
					}
				}
				else {
					$gameMessage.add(txt[0]);
				}
				this.setWaitMode('message');
				ret = false;
				return ret;
			} else {
				$cg_picture = 0;
				$erace_picture = 0;
				$tatie_picture1 = 0;
				$ScenarioAry = false;
				$gameScreen.movePicture(1, 0, 0, 0, 100, 100, 0, 0, 30);
				$gameScreen.movePicture(2, 0, 0, 0, 100, 100, 0, 0, 30);
				this.wait(30);
				console.log("set $ScenarioAry null");
			}
		}

		ret |= _rt_Game_Interpreter_executeCommand.call(this);


		return ret;

	};


	var _rt_Game_Interpreter_initialize = Game_Interpreter.prototype.initialize;
	Game_Interpreter.prototype.initialize = function (depth) {
		_rt_Game_Interpreter_initialize.call(this, depth);

		$ScenarioAry = null;
		$cg_picture = 0;
		$erace_picture = 0;
		$tatie_picture1 = 0;
	};

	var _rt_Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
	Game_Interpreter.prototype.pluginCommand = function (command, args) {
		_rt_Game_Interpreter_pluginCommand.call(this, command, args);
		if (command === 'readtext') {
			console.log("readtext");

			$cg_picture = 0;
			$erace_picture = 0;
			$tatie_picture1 = 0;
			var path = require('path');
			var filename = args[0];

			var base = path.dirname(process.mainModule.filename);
			var filePath = path.join(base, 'text/') + args[0];

			if (filePath) {

				var data = null;
				var fs = require('fs');
				console.log(filePath);
				if (fs.existsSync(filePath)) {
					data = fs.readFileSync(filePath, { encoding: 'utf8' });
					if (data) {
						//				    	var data1 = ;

						$ScenarioAry = data.replace(/</g, "").replace(/>/g, "\\c").split(/\\c\s+/);
						cnt = $ScenarioAry.length;

						/*						for(i = 0;i < cnt;i++) {
						//				   		    console.log(i+strAry[i]);
						//						    if (!$gameMessage.isBusy()) {
														$gameMessage.add(strAry[i]);
						//						    }
												}
						*/
					}


				}

			}
		}
	};
})();









