
var game = new Phaser.Game(800, 600, Phaser.CANVAS, '', {
    preload: preload, create: create, update: update});

function preload() {
    //60, 90 is the frame size in the sheet
    game.load.spritesheet('cowboy1', 'assets/Cowboy Spritesheet.png', 60, 90);
    game.load.spritesheet('cowboy2', 'assets/Cowboy Spritesheet.png', 60, 90);
    game.load.image('back', 'assets/back 210x160.png');
    game.load.spritesheet('bulletStream', 'assets/Bullet Spritesheet.png', 45, 45);
    game.load.spritesheet('numbers', 'assets/Number Spritesheet.png', 3, 5);
    game.load.image('sun', 'assets/sun.png');
    game.load.image('horizon', 'assets/horizon.png');
}

var cowboy1;
var cowboy2;
var back;
var drawAnim;
var afterDrawAnim;
var idleAnim;
// Juicy plugin
var juicy;

function setup() {

}

function create() {
    juicy = game.plugins.add(new Phaser.Plugin.Juicy(this.game));

    back = game.add.image(game.world.centerX, game.world.centerY, 'back');
    back.scale.set(4);
    back.smoothed = false;
    back.anchor.setTo(0.5, 0.5);

    cowboy1 = new Cowboy(150, 288, 1);
    cowboy2 = new Cowboy(650, 288, 2);
    cowboy1.setOther(cowboy2);
    cowboy2.setOther(cowboy1);

    game.input.keyboard.onDownCallback = handleDirectionPress;
}

function update() {
}

function handleDirectionPress(e) {
    if(((e.keyCode != Phaser.Keyboard.W && e.keyCode != Phaser.Keyboard.A && e.keyCode != Phaser.Keyboard.S &&
        e.keyCode != Phaser.Keyboard.D) || cowboy1.bulletStream.selectedIndex >= cowboy1.bulletStream.length ||
        cowboy1.bulletStream.selectedIndex >= cowboy1.bulletStream.bullets.length) &&
        ((e.keyCode != Phaser.Keyboard.UP && e.keyCode != Phaser.Keyboard.LEFT && e.keyCode != Phaser.Keyboard.DOWN &&
        e.keyCode != Phaser.Keyboard.RIGHT) || cowboy2.bulletStream.selectedIndex >= cowboy2.bulletStream.bullets.length)) {
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
    if(cowboy.bulletStream.bullets[cowboy.bulletStream.selectedIndex].direction == direction) {
        cowboy.pressBulletCorrectly();
    } else {
        cowboy.pressBulletIncorrectly();
    }
}


// constructor function for the Bullet object
// stores the sprite and direction it is facing
function Bullet(x, y, column) {
    // random number between 0 and 3
    var rowNum = Math.round(Math.random() * 3);
    // gets a random direction
    this.sprite = game.add.sprite(x, y, 'bulletStream', (rowNum * 3) + column);

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
        // tweak positioning
        this.digitPos = new Phaser.Point(165, 490); // 109
    } else if (number == 2) {
        this.sprite.scale.set(-4, 4);
        bulletStreamPos = new Phaser.Point(485, 270);
        sunPos = new Phaser.Point(589, 500); //634
        this.digitPos = new Phaser.Point(645, 490); //690
    }

    this.sprite.smoothed = false;
    this.sprite.anchor.setTo(0.5, 0.5);

    this.bulletStream = new BulletStream(bulletStreamPos.x, bulletStreamPos.y, 5);

    // hp bar
    this.sunSprite = game.add.image(sunPos.x, sunPos.y, 'sun');
    this.sunSprite.scale.set(4);
    this.sunSprite.smoothed = false;
    // implement dynamic tint change later
    // this.sunSprite.tint = 0x000000;
    this.horizonSprite = game.add.image(sunPos.x, sunPos.y + (12 * 4), 'horizon');
    this.horizonSprite.scale.set(4);
    this.horizonSprite.smoothed = false;

    this.digits = [];

    this.setOther = function (other) {
        this.other = other;
    };

    this.killDigits = function () {
        for (var j = 0; j < this.digits.length; j++) {
            this.digits[j].kill();
            console.log(this.digits[j]);
        }

        this.digits = [];
    };

    this.createDigits = function () {
        var healthString = (Math.round(this.sprite.health * 100)).toString();
        console.log("++++++++++++" + healthString);
        var digitX = this.digitPos.x;
        digitX -= (3 * 4) + 5;

        this.killDigits();

        for (var i = 0; i < healthString.length; i++) {
            digitX += (3 * 4) + 5;
            var digit = game.add.sprite(digitX, this.digitPos.y, 'numbers', parseInt(healthString[i])); //465
            digit.scale.set(3);
            digit.smoothed = false;
            this.digits.push(digit);
        }
    };

    this.createDigits();

    // sets the position of the sun to the the health of the sprite using the map function
    this.shiftSunDown = function () {
        var previousY = this.sunSprite.y;
        // tween instead
        this.sunSprite.y = Math.round(map(this.sprite.health, 0, 1, sunPos.y + (12 * 4), sunPos.y));
        var difference = this.sunSprite.y - previousY;

        this.digitPos.y += difference;
    };

    // shake and flash the screen, tween this.other getting shot
    // executed when 'draw' animation completes
    this.shootOther = function () {
        //duration, strength
        juicy.shake(20, 40);
        // colour, duration
        game.camera.flash(0xffffff, 100);

        var delay = 50;

        var initialPos;

        // this shouldn't be hard coded
        if(number == 1) {
             initialPos = new Phaser.Point(650, 288);
            juicy.jelly(this.other.sprite, 0.1, delay, new Phaser.Point(-4, 4));
        } else if(number == 2) {
            initialPos = new Phaser.Point(150, 288);
            juicy.jelly(this.other.sprite, 0.1, delay, new Phaser.Point(4, 4));
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
        console.log(this.other.sprite.health);
        console.log(correctPresses);
        this.other.sprite.health -= (correctPresses * 2) / 100;
        console.log(this.other.sprite.health);
        this.other.shiftSunDown();
        this.other.createDigits();

        if (this.other.sprite.health <= 0) {
            this.other.sprite.kill();
            this.other.killDigits();
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

        // shifts all bullets down by increment
        for(var i = 0; i < this.bulletStream.bullets.length; i++) {
            game.add.tween(this.bulletStream.bullets[i].sprite).to({y: this.bulletStream.bullets[i].sprite.y +
                this.bulletStream.INCREMENT}, 1000, Phaser.Easing.Elastic.Out, true);
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
    drawAnim.onComplete.add(this.shootOther, this);
    drawAnim.onComplete.add(this.playAfterDraw, this);
    afterDrawAnim.onComplete.add(this.resumeGameplay, this);
    this.sprite.animations.play('idle');
}

// constructor function for the BulletStream object
// creates a set of <numBullets> Bullets, at (x, y), stacked vertically
// tweened into place
// stores selected index, bullets, and INCREMENT
function BulletStream(x, y) {
    this.bullets = [];
    this.selectedIndex = 0;
    // starting position of the bulletStream
    this.x = x;
    this.y = y;

    // the vertical space between bullets
    this.INCREMENT = 50; // 63

    var tween;

    this.add = function () {
        // the number of bullets per round
        var NUM_BULLETS = 6;

        // the first bullet
        this.bullets.push(new Bullet(this.x, 0, 1));

        // tween past this.y
        tween = game.add.tween(this.bullets[this.bullets.length - 1].sprite).to({y: this.y + 20}, 300,
            Phaser.Easing.Quadratic.InOut, false);
        // bounce back elastic
        tween.to({y: this.y}, 600, Phaser.Easing.Elastic.Out, false);
        tween.start();

        // temporarily store the starting position so we can increment here without changing the real value
        var x = this.x;
        var y = this.y;

        // adding the rest of the bullets
        for(var i = 0; i < NUM_BULLETS - 1; i++) {
            y -= this.INCREMENT;
            this.bullets.push(new Bullet(x, 0, 0));
            // tween past this.y
            tween = game.add.tween(this.bullets[this.bullets.length - 1].sprite).to({y: y + 20}, 300,
                Phaser.Easing.Quadratic.InOut, false);
            // bounce back elastic
            tween.to({y: y}, 600, Phaser.Easing.Elastic.Out, false);
            tween.start();
        }
    };

    this.add();
}
