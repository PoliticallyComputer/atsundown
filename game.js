
var game = new Phaser.Game(800, 600, Phaser.CANVAS, '', {
    preload: preload, create: create, update: update});

function preload() {
    //60, 90 is the frame size in the sheet
    game.load.spritesheet('cowboy1', 'assets/Cowboy Spritesheet.png', 60, 90);
    game.load.spritesheet('cowboy2', 'assets/Cowboy Spritesheet.png', 60, 90);
    game.load.image('back', 'assets/back 210x160.png');
    game.load.image('sky', 'assets/sky.png');
    game.load.image('mountains', 'assets/mountains.png');
    game.load.image('ground', 'assets/ground.png');
    game.load.spritesheet('bulletStream', 'assets/Bullet Spritesheet.png', 45, 45);
    game.load.spritesheet('numbers-high', 'assets/Number Spritesheet High.png', 3, 5);
    game.load.spritesheet('numbers-low', 'assets/Number Spritesheet Low.png', 3, 5);
    game.load.image('sun-high', 'assets/sun high.png');
    game.load.image('sun-low', 'assets/sun low.png');
    game.load.image('horizon', 'assets/horizon.png');
    game.load.image('small-chunk', 'assets/small chunk.png');
    game.load.image('dirt', 'assets/dirt.png');
    game.load.spritesheet('indicator', 'assets/Arrow Spritesheet.png', 24, 24);
    game.load.image('gravestone', 'assets/gravestone.png');
    game.load.image('start', 'assets/start.png');
    game.load.spritesheet('icons', 'assets/Icon Spritesheet.png', 8, 7);
    game.load.spritesheet('tutorial-screen', 'assets/tutorial-screen.png');
}

var cowboy1;
var cowboy2;
var sky, mountains, ground;
var start;
var drawAnim;
var afterDrawAnim;
var idleAnim;
var emitter;
var emitter2;
var gravestone1;
var gravestone2;
var tutorialIcon;
var mute;
var tutorialScreen;
var backOverlay;
var starting = false;
var paused = false;

function setup() {

}

function create() {
    game.scale.pageAlignHorizontally = true;
    game.scale.pageAlignVertically = true;
    game.scale.refresh();

    sky = game.add.image(game.world.centerX, game.world.centerY, 'sky');
    sky.scale.set(4);
    sky.smoothed = false;
    sky.anchor.setTo(0.5, 0.5);

    start = game.add.image(game.world.centerX, 100, 'start');
    start.scale.set(4);
    start.smoothed = false;
    start.anchor.setTo(0.5, 0.5);
    // set onclick function
    start.inputEnabled = true;
    start.events.onInputDown.add(lowerStart, this);

    mountains = game.add.image(game.world.centerX, game.world.centerY, 'mountains');
    mountains.scale.set(4);
    mountains.smoothed = false;
    mountains.anchor.setTo(0.5, 0.5);

    gravestone1 = game.add.image(150 + 10, 800, 'gravestone');
    gravestone1.inputEnabled = false;
    gravestone2 = game.add.image(650 - 10, 800, 'gravestone');
    gravestone2.inputEnabled = false;

    emitter2 = game.add.emitter(0, 0, 100);
    emitter2.makeParticles('dirt');
    emitter2.gravity = 600;
    emitter2.maxParticleScale = 5;

    ground = game.add.image(game.world.centerX, game.world.centerY, 'ground');
    ground.scale.set(4);
    ground.smoothed = false;
    ground.anchor.setTo(0.5, 0.5);

    cowboy1 = new Cowboy(150, 288, 1);
    cowboy2 = new Cowboy(650, 288, 2);
    cowboy1.setOther(cowboy2);
    cowboy2.setOther(cowboy1);

    game.input.keyboard.onDownCallback = handleDirectionPress;

    game.physics.startSystem(Phaser.Physics.ARCADE);

    emitter = game.add.emitter(0, 0, 100);

    emitter.makeParticles('small-chunk');
    emitter.gravity = 200;
    emitter.maxParticleScale = 5;
    emitter.maxParticleSpeed = new Phaser.Point(200, 600);

    tutorialIcon = game.add.sprite(700, 15, 'icons', 0);
    tutorialIcon.scale.set(4);
    tutorialIcon.smoothed = false;
    // set onclick function
    tutorialIcon.inputEnabled = true;
    tutorialIcon.events.onInputDown.add(showTutorialScreen, this);

    // mute = game.add.sprite(745, 15, 'icons', 1);
    // mute.scale.set(4);
    // mute.smoothed = false;
    // // set onclick function
    // mute.inputEnabled = true;
    // mute.events.onInputDown.add(muteSound, this);

    backOverlay = game.add.image(game.world.centerX, game.world.centerY, 'back');
    backOverlay.scale.set(4);
    backOverlay.smoothed = false;
    backOverlay.anchor.setTo(0.5, 0.5);
    backOverlay.alpha = 0;

    tutorialScreen = game.add.image(game.world.centerX, game.world.centerY - game.world.height, 'tutorial-screen');
    tutorialScreen.scale.set(4);
    tutorialScreen.smoothed = false;
    tutorialScreen.anchor.setTo(0.5, 0.5);
}

function showTutorialScreen() {
    if (starting == false) {
        game.add.tween(backOverlay).to({alpha: 1}, 50, null, true);

        game.add.tween(tutorialScreen).to({y: game.world.centerY}, 1500,
            Phaser.Easing.Elastic.Out, true);
        paused = true;

        if (cowboy1.bulletStream.bullets.length > 0) {
            for (var i = cowboy1.bulletStream.bullets.length - 6; i < cowboy1.bulletStream.bullets.length; i++) {
                cowboy1.bulletStream.bullets[i].sprite.alpha = 0;
            }
        }

        if (cowboy2.bulletStream.bullets.length > 0) {
            for (var j = cowboy2.bulletStream.bullets.length - 6; j < cowboy2.bulletStream.bullets.length; j++) {
                cowboy2.bulletStream.bullets[j].sprite.alpha = 0;
            }
        }

        for (var k = 0; k < cowboy1.digits.length; k++) {
            cowboy1.digits[k].low.alpha = 0;
            cowboy1.digits[k].high.alpha = 0;
        }

        for (var h = 0; h < cowboy1.digits.length; h++) {
            cowboy2.digits[h].low.alpha = 0;
            cowboy2.digits[h].high.alpha = 0;
        }

        cowboy1.killDigits();
        cowboy2.killDigits();

        game.input.onDown.add(closeTutorialScreen, this);
        var spacebar = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        spacebar.onDown.add(closeTutorialScreen, this);
    }
}

function closeTutorialScreen() {
    game.input.keyboard.removeKey(Phaser.Keyboard.SPACEBAR);
    game.input.onDown.remove(closeTutorialScreen, this);

    if (game.tweens.isTweening(tutorialScreen)) {
        game.tweens.removeFrom(tutorialScreen);
    }

    game.add.tween(backOverlay).to({alpha: 0}, 50, null, true);

    var tutorialTween = game.add.tween(tutorialScreen).to({y: game.world.centerY - game.world.height}, 1000,
        Phaser.Easing.Elastic.Out, true);
    tutorialTween.onComplete.add(unpauseGame, this);
    // paused = false;

    if (cowboy1.bulletStream.bullets.length > 0) {
        for (var i = cowboy1.bulletStream.bullets.length - 6; i < cowboy1.bulletStream.bullets.length; i++) {
            cowboy1.bulletStream.bullets[i].sprite.alpha = 1;
        }

        for (var j = cowboy2.bulletStream.bullets.length - 6; j < cowboy2.bulletStream.bullets.length; j++) {
            cowboy2.bulletStream.bullets[j].sprite.alpha = 1;
        }
    }

    cowboy1.createDigits();
    cowboy2.createDigits();
}

function unpauseGame() {
    paused = false;
}

function muteSound() {
    if (mute.frame == 1) {
        mute.frame = 2;
    } else {
        mute.frame = 1;
    }

    // actually mute sound later
}

function lowerStart() {
    starting = true;

    var tween = game.add.tween(start).to({y: 288}, 2000, Phaser.Easing.Cubic.In, true);
    tween.onComplete.add(go, this);

    start.events.destroy();

    start.inputEnabled = false;
}

function go() {
    cowboy1.bulletStream.add();
    cowboy2.bulletStream.add();

    start.kill();

    starting = false;
}


function update() {
}

function handleDirectionPress(e) {
    if (e.keyCode == Phaser.Keyboard.SPACEBAR && !paused) {
        if (start.inputEnabled == true) {
            lowerStart();
        } else if (gravestone1.inputEnabled == true || gravestone2.inputEnabled == true) {
            create();
        }
    } else if(((e.keyCode != Phaser.Keyboard.W && e.keyCode != Phaser.Keyboard.A && e.keyCode != Phaser.Keyboard.S &&
        e.keyCode != Phaser.Keyboard.D) || cowboy1.bulletStream.selectedIndex >= cowboy1.bulletStream.length ||
        cowboy1.bulletStream.selectedIndex >= cowboy1.bulletStream.bullets.length) &&
        ((e.keyCode != Phaser.Keyboard.UP && e.keyCode != Phaser.Keyboard.LEFT && e.keyCode != Phaser.Keyboard.DOWN &&
        e.keyCode != Phaser.Keyboard.RIGHT) ||
        cowboy2.bulletStream.selectedIndex >= cowboy2.bulletStream.bullets.length) ||
        paused) {
        return;
    } else if(e.keyCode == Phaser.Keyboard.W) {
        handlePressCorrectness('up', cowboy1);
    } else if(e.keyCode == Phaser.Keyboard.S) {
        handlePressCorrectness('down', cowboy1);
    } else if(e.keyCode == Phaser.Keyboard.A) {
        handlePressCorrectness('left', cowboy1);
    } else if(e.keyCode == Phaser.Keyboard.D) {
        handlePressCorrectness('right', cowboy1);
    } else if(e.keyCode == Phaser.Keyboard.UP) {
        handlePressCorrectness('up', cowboy2);
    } else if(e.keyCode == Phaser.Keyboard.DOWN) {
        handlePressCorrectness('down', cowboy2);
    } else if(e.keyCode == Phaser.Keyboard.LEFT) {
        handlePressCorrectness('left', cowboy2);
    } else if(e.keyCode == Phaser.Keyboard.RIGHT) {
        handlePressCorrectness('right', cowboy2);
    }
}

// determines if the correct direction was pressed and calls the corresponding function
function handlePressCorrectness(direction, cowboy) {
    if (cowboy.bulletStream.bullets[cowboy.bulletStream.selectedIndex].direction == direction) {
        cowboy.pressBulletCorrectly();
    } else {
        cowboy.pressBulletIncorrectly();
    }
}

function createRematchIcon(gravestone) {
    gravestone.scale.set(4);
    gravestone.smoothed = false;
    gravestone.anchor.set(0.5, 0.5);
    gravestone.inputEnabled = true;

    game.add.tween(gravestone).to({y: 405}, 3000, Phaser.Easing.Elastic.InOut, true, 700);

    gravestone.events.onInputDown.add(create, this);

    game.time.events.add(2200, function () {
        // middle
        emitter2.x = gravestone.x;
        emitter2.y = 415;
        emitter2.start(true, 3000, null, 30);

        // left
        emitter2.x = gravestone.x - 40;
        emitter2.y = 415;
        emitter2.start(true, 3000, null, 10);

        // right
        emitter2.x = gravestone.x + 40;
        emitter2.y = 415;
        emitter2.start(true, 3000, null, 10);

        game.camera.shake(0.01, 300, true);
    }, this);
}


// constructor function for the Bullet object
// stores the sprite and direction it is facing
function Bullet(x, y, column) {
    // random number between 0 and 3
    var rowNum = Math.round(Math.random() * 3);
    // gets a random direction
    this.sprite = game.add.sprite(x, y, 'bulletStream', (rowNum * 3) + column);

    // to keep track of where the sprite should be regardless of how it is tweened
    this.yLocation = y + 50;

    if(rowNum == 0) {
        this.direction = 'up';
    } else if(rowNum == 1) {
        this.direction = 'down';
    } else if(rowNum == 2) {
        this.direction = 'left';
    } else {
        this.direction = 'right';
    }
}

// constructor function for the Cowboy object
// stores the sprite and the other Cowboy (when set)
// number is either 1 or 2
function Cowboy(x, y, number) {
    this.sprite = game.add.sprite(x, y, 'cowboy' + number, 0);

    // the position this cowboy's bulletStream should be at
    var bulletStreamPos;
    var sunPos;
    var correctPresses = 0;

    if (number == 1 ) {
        this.sprite.scale.set(4);
        bulletStreamPos = new Phaser.Point(270, 270);
        sunPos = new Phaser.Point(110, 500);
        this.digitPos = new Phaser.Point(165, 490);
    } else { // number is 2
        this.sprite.scale.set(-4, 4);
        bulletStreamPos = new Phaser.Point(485, 270);
        sunPos = new Phaser.Point(589, 500);
        this.digitPos = new Phaser.Point(645, 490);
    }

    this.sprite.smoothed = false;
    this.sprite.anchor.setTo(0.5, 0.5);

    this.bulletStream = new BulletStream(bulletStreamPos.x, bulletStreamPos.y);

    // hp bar
    this.sunLowSprite = game.add.image(sunPos.x, sunPos.y, 'sun-low');
    this.sunLowSprite.scale.set(4);
    this.sunLowSprite.smoothed = false;
    this.sunHighSprite = game.add.image(sunPos.x, sunPos.y, 'sun-high');
    this.sunHighSprite.scale.set(4);
    this.sunHighSprite.smoothed = false;
    this.horizonSprite = game.add.image(sunPos.x, sunPos.y + (12 * 4), 'horizon');
    this.horizonSprite.scale.set(4);
    this.horizonSprite.smoothed = false;

    this.digits = [];

    this.setOther = function (other) {
        this.other = other;
    };

    this.killDigits = function () {
        for (var j = 0; j < this.digits.length; j++) {
            this.digits[j].high.kill();
            this.digits[j].low.kill();
        }

        this.digits = [];
    };

    this.createDigits = function () {
        var healthString = (Math.round(this.sprite.health * 36)).toString();
        var digitX = this.digitPos.x;
        digitX -= (3 * 4) + 5;

        this.killDigits();

        for (var i = 0; i < healthString.length; i++) {
            digitX += (3 * 4) + 5;
            var digitLow = game.add.sprite(digitX, this.digitPos.y, 'numbers-low', parseInt(healthString[i]));
            digitLow.scale.set(3);
            digitLow.smoothed = false;
            var digitHigh = game.add.sprite(digitX, this.digitPos.y, 'numbers-high', parseInt(healthString[i]));
            digitHigh.scale.set(3);
            digitHigh.smoothed = false;
            this.digits.push({low: digitLow, high: digitHigh});

            // change opacity of digits
            this.digits[i].high.alpha = this.sprite.health;
        }
    };

    this.createDigits();

    // sets the position of the sun to the the health of the sprite using the map function
    this.shiftSunDown = function () {
        var previousY = this.sunHighSprite.y;
        // tween instead
        var toY = Math.round(map(this.sprite.health, 0, 1, sunPos.y + (12 * 4), sunPos.y));

        game.add.tween(this.sunHighSprite).to({y: toY}, 250, null, true);
        game.add.tween(this.sunLowSprite).to({y: toY}, 250, null, true);

        var difference = toY - previousY;
        this.digitPos.y += difference;

        // change opacity of sun
        this.sunHighSprite.alpha = this.sprite.health;
    };

    // shake and flash the screen
    // executed when 'draw' animation completes
    this.shoot = function () {
        // intensity, duration, force
        game.camera.shake(0.02, 300, true);
        // colour, duration
        game.camera.flash(0xffffff, 100);

        // checks to see if other is alive before calling damageOther
        if (this.other.sprite.health >= 0.0001) {
            this.damageOther();
        }
    };

    this.jelly = function(delay, initialScale) {
        var strength = 0.1;

        var xTween = game.add.tween(this.other.sprite.scale).to({x: initialScale.x - (initialScale.x * strength)},
            100, Phaser.Easing.Quadratic.InOut, false, delay);
        xTween.to({x: initialScale.x}, 600, Phaser.Easing.Elastic.Out, false, delay);
        xTween.start();

        var yTween = game.add.tween(this.other.sprite.scale).to({y: initialScale.y + (initialScale.y * strength)},
            100, Phaser.Easing.Quadratic.InOut, false, delay + 50);
        yTween.to({y: initialScale.y}, 600, Phaser.Easing.Elastic.Out, false, delay);
        yTween.start();
    };

    this.damageOther = function () {
        var delay = 50;

        var initialPos;

        if(number == 1) {
            initialPos = new Phaser.Point(650, 288);
            this.jelly(delay, new Phaser.Point(-4, 4));
        } else if(number == 2) {
            initialPos = new Phaser.Point(150, 288);
            this.jelly(delay, new Phaser.Point(4, 4));
        }

        var strength = 0.05;
        var xTween = game.add.tween(this.other.sprite).to({x: initialPos.x + (initialPos.x * strength)}, 50,
            Phaser.Easing.Quadratic.InOut, false, delay);
        xTween.to({x: initialPos.x}, 1000, Phaser.Easing.Elastic.Out, false);
        xTween.start();

        var yTween = game.add.tween(this.other.sprite).to({y: initialPos.y + (initialPos.y * strength)}, 50,
            Phaser.Easing.Quadratic.InOut, false, delay);
        yTween.to({y: initialPos.y}, 1000, Phaser.Easing.Elastic.Out, false);
        yTween.start();

        // damage other
        this.other.sprite.health -= (correctPresses) / 36;
        this.other.shiftSunDown();
        this.other.createDigits();

        var offset;

        if (number == 1) {
            offset = -30;
        } else { // number is 2
            offset = 30;
        }

        // show damage on screen
        var damageSprite = game.add.sprite(this.other.sprite.x + offset, this.other.sprite.y - 70, 'numbers-low',
            correctPresses);
        damageSprite.scale.set(4);
        damageSprite.smoothed = false;
        damageSprite.tint = 0x9a0606;

        game.add.tween(damageSprite).to({y: y - 200}, 300,
            Phaser.Easing.Quadratic.In, true, 300);
        var alphaTween = game.add.tween(damageSprite).to({alpha: 0}, 300,
            Phaser.Easing.Quadratic.In, true, 400);
        alphaTween.onComplete.add(damageSprite.kill, this);

        // 0.00001 instead of 0 because of bug where health becomes very very small instead of becoming 0
        if (this.other.sprite.health <= 0.00001) {
        // if (this.other.sprite.health < 1) {
            this.other.sprite.kill();
            this.other.sunHighSprite.kill();
            this.other.sunLowSprite.kill();
            this.other.killDigits();
            this.other.bulletStream.killBullets();

            // head
            emitter.x = this.other.sprite.x;
            emitter.y = this.other.sprite.y - 150;
            emitter.start(true, 3000, null, 20);
            // body
            emitter.x = this.other.sprite.x - 50;
            emitter.y = this.other.sprite.y - (100);
            emitter.start(true, 3000, null, 30);
            emitter.x = this.other.sprite.x - 50;
            emitter.y = this.other.sprite.y;
            emitter.start(true, 3000, null, 30);
            emitter.x = this.other.sprite.x;
            emitter.y = this.other.sprite.y;
            emitter.start(true, 3000, null, 30);
            emitter.x = this.other.sprite.x;
            emitter.y = this.other.sprite.y + 50;
            emitter.start(true, 3000, null, 30);

            if (number == 1) {
                createRematchIcon(gravestone2);
            } else { // number is 2
                createRematchIcon(gravestone1);
            }
        }

        // reset correctPresses for the new round
        correctPresses = 0;
    };

    // plays 'after-draw' animation, after the 'draw' animation completes
    this.playAfterDraw = function () {
        this.sprite.animations.play('after-draw');
    };

    // starts back up cowboy's 'idle' animation and creates the new bullet round
    // executed after the 'after-draw' animation is complete
    // temporary state. ideally each cowboy has a bulletStream attribute
    this.resumeGameplay = function () {
        this.sprite.animations.play('idle');

        //add new bullet round
        this.bulletStream.add();
    };

    this.pressBulletCorrectly = function () {

        // update the selected bullet
        this.bulletStream.bullets[this.bulletStream.selectedIndex].sprite.frame++;

        correctPresses++;

        this.shiftBulletsDown();
    };

    this.shiftBulletsDown = function () {
        // sets up the next selected bullet
        if(this.bulletStream.selectedIndex < this.bulletStream.bullets.length - 1) {
            this.bulletStream.bullets[this.bulletStream.selectedIndex + 1].sprite.frame++;
        }

        // shift the last 6 bullets down by increment
        for(var i = this.bulletStream.bullets.length - 6; i < this.bulletStream.bullets.length; i++) {
            // remove all tweens from the bullet
            if (game.tweens.isTweening(this.bulletStream.bullets[i].sprite)) {
                game.tweens.removeFrom(this.bulletStream.bullets[i].sprite);
            }
            // pop it into the position it should be at
            this.bulletStream.bullets[i].sprite.y = this.bulletStream.bullets[i].yLocation;

            // move the sprite down with tweening
            game.add.tween(this.bulletStream.bullets[i].sprite).to({y: this.bulletStream.bullets[i].sprite.y +
            this.bulletStream.INCREMENT}, 200, Phaser.Easing.Back.Out, true);

            // update yLocation to reflect the current location
            this.bulletStream.bullets[i].yLocation += this.bulletStream.INCREMENT;
        }

        // checks if this was the last bullet
        if(this.bulletStream.selectedIndex == this.bulletStream.bullets.length - 1) {
            this.sprite.animations.play('draw');
        }

        this.bulletStream.selectedIndex++;
    };

    this.pressBulletIncorrectly = function () {
        // update the selected bullet
        this.bulletStream.bullets[this.bulletStream.selectedIndex].sprite.frame--;

        this.shiftBulletsDown();
    };

    // 5 fps, loops
    idleAnim = this.sprite.animations.add('idle', [0, 1, 2, 3], 5, true);
    // 15 fps, no loop
    drawAnim = this.sprite.animations.add('draw', [4, 5, 6, 7, 8, 9], 15, false);
    // 10 fps, no loop
    afterDrawAnim = this.sprite.animations.add('after-draw', [7, 7, 7, 6, 5, 4], 10, false);
    drawAnim.onComplete.add(this.shoot, this);
    drawAnim.onComplete.add(this.playAfterDraw, this);
    afterDrawAnim.onComplete.add(this.resumeGameplay, this);
    this.sprite.animations.play('idle');
}

// constructor function for the BulletStream object
// creates a set of <numBullets> Bullets, at (x, y), stacked vertically
// tweened into place
// stores selected index, bullets
function BulletStream(x, y) {
    this.bullets = [];
    this.selectedIndex = 0;
    // starting position of the bulletStream
    this.x = x;
    this.y = y;

    this.indicatorSprite = game.add.sprite(x - 40, y + 13, 'indicator', 0);
    this.indicatorSprite.animations.add('flashing', [0, 1], 1, true);
    this.indicatorSprite.animations.play('flashing');
    this.indicatorSprite.alpha = 0;

    // the vertical space between bullets
    this.INCREMENT = 50;

    this.add = function () {
        this.indicatorSprite.alpha = 1;

        for (var j = 0; j < this.bullets.length; j++) {
            var offScreen = 900;

            game.add.tween(this.bullets[j].sprite).to({y: offScreen}, 200, null, true);
        }

        // the number of bullets per round
        var NUM_BULLETS = 6;

        // the first bullet
        this.bullets.push(new Bullet(this.x, this.y - 50, 1));

        // simpler tween
        game.add.tween(this.bullets[this.bullets.length - 1].sprite).to({y: this.y}, 600,
            Phaser.Easing.Elastic.Out, true);

        // temporarily store the starting position so we can increment here without changing the real value
        var x = this.x;
        var y = this.y;

        // adding the rest of the bullets
        for(var i = 0; i < NUM_BULLETS - 1; i++) {
            y -= this.INCREMENT;
            this.bullets.push(new Bullet(x, y - 50, 0));

            game.add.tween(this.bullets[this.bullets.length - 1].sprite).to({y: y}, 600,
                Phaser.Easing.Elastic.Out, true);
        }
    };

    this.killBullets = function () {
        for (var i = 0; i < this.bullets.length; i++) {
            this.bullets[i].sprite.kill();
        }

        this.bullets = [];

        // also kill the indicator
        this.indicatorSprite.kill();
    };
}
