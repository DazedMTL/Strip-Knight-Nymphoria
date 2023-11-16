(function () {


    var _Game_Interpreter_pluginCommand =
        Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function (command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args);
        if (command === 'PictUtil') {
            switch (args[0]) {
                case 'Number':
                    for (var i = 2; i <= 6; i++) {
                        if (isNaN(args[i])) {
                            var result = args[i].match('V');
                            if (result) {
                                var n = parseInt(args[i]);
                                //			                console.log("n :"+n);
                                args[i] = $gameVariables.value(n);
                                //			                console.log("args"+i+' :'+args[i]);
                            } else {
                                args[i] = Number(args[i]);
                            }
                        } else {
                            args[i] = Number(args[i]);
                        }
                    }
                    var alpha = 255;
                    if (isNaN(args[7])) alpha = 255;
                    else alpha = Number(args[7]);
                    var v = $gameVariables.value(args[2]);
                    do {
                        var v2 = v % 10;
                        var txt = args[1] + ('00' + v2).slice(-2);
                        $gameScreen.showPicture(args[3], txt, 0, args[4], args[5], 100, 100, alpha, 0);
                        args[4] -= args[6];
                        args[3] += 1;
                        v /= 10;
                        v = Math.floor(v);
                    } while (v != 0);
                    break;
                case 'Serial':
                    args[2] = Number(args[2]);
                    args[3] = Number(args[3]);
                    args[4] = Number(args[4]);
                    args[5] = Number(args[5]);
                    args[6] = Number(args[6]);
                    args[7] = Number(args[7]);
                    args[8] = Number(args[8]);
                    for (i = args[3]; i <= args[4]; i++) {
                        var txt = args[1] + ('00' + i).slice(-2);
                        $gameScreen.showPicture(args[2] + i - args[3], txt, 0, args[5] + (i - args[3]) * args[7], args[6] + (i - args[3]) * args[8], 100, 100, 255, 0);
                    }
                    break;
                case 'SerialMove':
                    args[1] = Number(args[1]);
                    args[2] = Number(args[2]);
                    args[3] = Number(args[3]);
                    args[4] = Number(args[4]);
                    args[5] = Number(args[5]);
                    args[6] = Number(args[6]);
                    args[7] = Number(args[7]);
                    args[8] = Number(args[8]);
                    for (i = args[2]; i <= args[3]; i++) {
                        $gameScreen.movePicture(args[1] + i - args[2], 0, args[4] + (i - args[2]) * args[6], args[5] + (i - args[2]) * args[7], 100, 100, args[8], 0, 8);
                    }
                    break;
                case 'SerialItems':
                    args[3] = Number(args[3]);
                    args[4] = Number(args[4]);
                    args[5] = Number(args[5]);
                    args[6] = Number(args[6]);
                    args[7] = Number(args[7]);
                    args[8] = Number(args[8]);
                    args[9] = Number(args[9]);
                    args[10] = Number(args[10]);
                    for (i = args[5]; i <= args[6]; i++) {
                        if ($gameVariables.value(args[4] + i) > 0) {
                            var txt = args[1] + ('00' + i).slice(-2);
                        } else {
                            var txt = args[2];
                        }
                        $gameScreen.showPicture(args[3] + i - args[5], txt, 0, args[7] + (i - args[5]) * args[9], args[8] + (i - args[5]) * args[10], 100, 100, 255, 0);
                    }
                    break;
            }

        }
    };


})();