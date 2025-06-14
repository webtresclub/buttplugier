import {
    Scene
} from 'phaser';


const obstacles = {};
const LANES = [
  { yMin: 200, yMax: 411 },
  { yMin: 580, yMax: 790 },
  { yMin: 948, yMax: 1149 }
];


export class Game extends Scene {
    constructor() {
        super('Game');
    }

    addLine(ypos) {
        // line
        const line = this.physics.add.sprite(100, ypos, 'line');
        line.setOrigin(0.5).setScale(4, 1).setImmovable(true);
        line.body.allowGravity = false;

        this.physics.add.collider(this.player, line);
    }
    getMap(){
        let _map = [];
            Object.keys(obstacles).forEach(row => {
                Object.keys(obstacles[row] || {}).forEach(col => {
                    if(obstacles[row][col]){
                        _map.push(`${row}-${col}`);
                    }
                });
            });
        return _map;
    }
    create() {
        window.obstacles = obstacles;
        window.showMap = () => {
            console.log(JSON.stringify(this.getMap()));
        }
        
        this.soundPlayed = false;
        this.sound.setVolume(0);
        this.graphics = this.add.graphics();
        this.graphics.fillStyle(0x0c284a, 1);
        this.graphics.fillRect(0, 0, 768, 1300);



        // Add tiling background
        this.background = this.add.tileSprite(0, 0, 768, 300, 'background');
        this.background.setOrigin(0);
        //this.background.tilePositionY = 40;

        this.music = this.sound.add('music');
        this.music.play({ loop: true });


        this.jumpSound = this.sound.add('rocket');
        this.hitSound = this.sound.add('hit');


        //this.physics.world.setBounds(0, 0, 768, 1152); // Width and height of your world

        this.player = this.physics.add.sprite(60, 370, 'playerface');
        this.player.body.bounce.y = 0;
        this.player.level = 0;
        this.player.setGravityY(1000 * 2);
        this.player.body.setSize(176 / 2, 176 / 2);
        this.player.body.setOffset(27, 22);
        // this.player.setScale(0.44);
        this.player.setOrigin(0.5);
        //this.player.setCollideWorldBounds(true);
        this.player.body.enable = true; // Ensure physics body is enabled
        window.player = this.player;

        this.anims.create({
            key: 'face_idle',
            frames: this.anims.generateFrameNumbers('playerface', {
                start: 0,
                end: 15
            }),
            //frameRate: 8,
            repeat: -1
        });

        this.anims.create({
            key: 'rocket',
            frames: this.anims.generateFrameNumbers('rocket', {
                start: 0,
                end: 15
            }),
            //frameRate: 8,
            repeat: -1
        });


        this.player.play('face_idle');

        // cube
        this.cubes = this.physics.add.group({
            immovable: true,          // behaves like static for collisions
            allowGravity: false,
            maxSize: 2000
          });



        this.addLine(411);
        this.addLine(790);
        this.addLine(1148);



        //this.cameras.main.startFollow(this.player, true, 0.1, 0);
        //this.cameras.main.setZoom(2);
        //this.cameras.main.setBounds(0, 0, 1068*4, 152*2);
        //this.cameras.main.setScroll(-250, -300);


        // emitter
        this.emitter = this.add.particles(0, 0, 'pixel', {
            speed: {
                min: -200,
                max: 200
            },
            scale: {
                start: 0.5,
                end: 0
            },
            alpha: {
                start: 1,
                end: 0
            },
            lifespan: 1000,
            gravityY: 0,
            quantity: 20,
            emitting: false
        });

        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        this.level = 0;

        //this.loadLevel();

        this.physics.add.overlap(this.player, this.cubes, this.playerHit, null, this);
        this.player.alive = true;

        this.scoreText = this.add.bitmapText(60, 500, "font", "hello world", 20);
        this.scoreText.setOrigin(0);
        this.scoreText.setText("hello world");


        // sound on/off button
        this.soundButton = this.add.bitmapText(400, 50, "font", "sound off", 20);
        this.soundButton.setInteractive();
        this.soundButton.on('pointerdown', () => {
            if (this.sound.volume === 0) {
                this.sound.setVolume(1);
                this.soundButton.setText("sound on");
            } else {
                this.sound.setVolume(0);
                this.soundButton.setText("sound off");
            }
        });


        this.editCube = this.add.sprite(0, 0, 'cube');
        this.editCube.setAlpha(0.7);
        // put on top of the other cubes
        this.editCube.setDepth(1000);


        this.input.on('pointerdown', this.onPointerDown, this);

        this.map = JSON.parse(localStorage.getItem('map') || '[]');
        this.map.forEach(item => {
            const [row, col] = item.split('-').map(Number);
            if(!obstacles[row]){
                obstacles[row] = {};
            }
            obstacles[row][col] = this.cubes.get(col * 20, row * 20, 'cube');
            obstacles[row][col].setActive(true).setVisible(true);
            obstacles[row][col].refreshBody();
        });

    }

    initPlayer() {
        this.player.level = 0;

        this.player.body.bounce.y = 0;
        this.player.level = 0;
        this.player.setGravityY(1000 * 2);
        this.player.body.setSize(176 / 2, 176 / 2);
        this.player.body.setOffset(27, 22);

        // this.player.setScale(0.44);
        this.player.setOrigin(0.5);
        this.player.setPosition(60, 320);


        this.player.setVelocityY(0);


        this.player.play('face_idle');
        this.player.alive = true;
        this.player.setVelocityX(170 * 3);

    }

    playerHit(player, hit) {
        //console.log('Player hit detected!', player.x, player.y, hit.x, hit.y);
        //if (this.player.alive) {
        //this.hitSound.play('', 0, 0.2);

        this.deaths = (this.deaths || 0) + 1;

        this.emitter.setPosition(player.x, player.y);
        this.emitter.explode();
        this.hitSound.rate = 1.5; // Play 50% faster

        this.hitSound.play('', 0, 0.2);

        //this.labelDeath.setText(DEATH);
        this.initPlayer();
        // }
    }
/*
    drawLevel(level) {
        var h = 600;
        this.cubes.getChildren().forEach(cube => {
            cube.disableBody(true, true);
            cube.destroy();
        });

        var cube;
        var height;
        for (var i = 0; i < level.length; i++) {

            cube = this.cubes.getFirstDead();

            // If no dead cubes available, create a new one
            if (!cube) {
                cube = this.physics.add.sprite(0, 0, 'cube');
                this.cubes.add(cube);
                cube.setActive(false).setVisible(false)
            }

            const startX = 60;

            cube.x = startX + i * cube.width * 4 + 90;
            cube.y = 410;
            cube.setScale(4, 0);


            if (level[i] == 1) {
                cube.setActive(true).setVisible(true);
                height = 0.3;
            } else if (level[i] == 2) {
                cube.setActive(true).setVisible(true);
                height = 1;

            } else if (level[i] == 3) {
                cube.setActive(true).setVisible(true);
                height = 1.5;

            } else if (level[i] == 4) {
                cube.setActive(true).setVisible(true);
                cube.x = 100 + i * cube.width;
                cube.y = h * 2 / 3;
                height = 1.8;

            } else if (level[i] == 5) {
                cube.setActive(true).setVisible(true);
                cube.x = startX + i * cube.width;
                cube.y = h * 2 / 3 - 22;
                height = 0.5;
            }


            if (level[i] != 0) {
                cube.setScale(4, 0);
                cube.setOrigin(0, 1);
                //cube.setDepth(1000);

                // animate when init cube
                this.tweens.add({
                    targets: cube,
                    scaleY: height * 4,
                    duration: 300 * height,
                    ease: 'Linear'
                });
            }
        }
    }
        */


    /*
    loadLevel() {
        if (map.length == this.level) {
            game.state.start('End');

        } else {
            this.level++;
            //this.labelLevel.setText(this.level + '/' + map.length);
            // this.initPlayer();

            //if (this.level == 2) {
            //  this.labelTuto.setText('');
            //}
        }

        
    }
        */

    update() {

        // Or get world position
        const worldX = Math.round(this.input.activePointer.worldX);
        const worldY = Math.round(this.input.activePointer.worldY);
        
        //this.addLine(411);
        //    this.addLine(780);
        //    this.addLine(1148);


        const h = this.editCube.height;
        let _worldXSnap = Math.floor(worldX/ h);
        let _worldYSnap = Math.floor(worldY/ h);
        let cubeX = _worldXSnap * h;
        let cubeY = _worldYSnap * h;


        let blockInRange = false;
        if (worldY < 411 && worldY > 200) {
            this.editCube.setPosition(cubeX, cubeY);
            blockInRange = true;
        } else if (worldY < 791 && worldY > 580) {
            this.editCube.setPosition(cubeX, cubeY);
            blockInRange = true;
        } else if (worldY < 1149 && worldY > 948) {
            this.editCube.setPosition(cubeX, cubeY);
            blockInRange = true;
        }else{
            this.editCube.setPosition(-1000, -1000);
        }

        if(blockInRange){
            if (!obstacles[_worldYSnap]) {
                obstacles[_worldYSnap] = {}
            }
            if (!obstacles[_worldYSnap][_worldXSnap]) {
                this.editCube.setTint(0xffffff);
            } else {
                this.editCube.setTint(0xff0000);
            }
        }
/*
        let skip = true &&  (this.lastAdded && this.lastAdded == `[${_worldYSnap},${_worldXSnap}]` && Date.now() - this.lastAddedTime < 400);
        if (blockInRange && !skip && this.input.activePointer.isDown) {
            this.lastAdded = `[${_worldYSnap},${_worldXSnap}]`;
            console.log('lastAdded', this.lastAdded);
            this.lastAddedTime = Date.now();
            if(obstacles[_worldYSnap][_worldXSnap]) {
                obstacles[_worldYSnap][_worldXSnap].destroy();
                delete obstacles[_worldYSnap][_worldXSnap];
                console.log('cube destroy');
               // this.physics.add.overlap(this.player, this.cubes, this.playerHit, null, this);
            } else {
                let cube = this.cubes.getFirstDead();
 
                // If no dead cubes available, create a new one
                if (!cube) {
                    cube = this.physics.add.sprite(0, 0, 'cube');
                    this.cubes.add(cube);
                } else {
                console.log('got death cube');
                }
                cube.setActive(true).setVisible(true);
                cube.setPosition(cubeX, cubeY);
                console.log('cube position', cubeX, cubeY);
                console.log('world position', worldX, worldY);
                console.log('pointer position', this.input.activePointer.worldX, this.input.activePointer.worldY);
                cube.setDepth(999);
                obstacles[_worldYSnap][_worldXSnap] = cube;
                console.log('cube add');
                cube.refreshBody();
            }
        }
*/


        if (this.player.body.blocked.down) {
            this.player.play('face_idle');
            this.player.setAngle(0);
            this.jumpSound.stop();
        }

        this.player.setScale(1, 1);
        this.player.body.setSize(176 / 2, 176 / 2);
        this.player.body.setOffset(27, 14);
        this.player.setOrigin(0.5);
        this.player.setFlipX(false);  // f


        if (this.player.x > 768 && this.player.level == 0) {
            this.player.level = 1;
            this.player.setVelocityX(Math.abs(this.player.body.velocity.x) * -1);
            this.player.y += 400
            this.player.setScale(-1, 1);
        } else if (this.player.x < 0 && this.player.level == 1) {
            this.player.level = 2;
            this.player.setVelocityX(Math.abs(this.player.body.velocity.x));
            this.player.y += 400
        }

        if (this.player.x > 768 && this.player.level == 2) {
            this.initPlayer();
        }

        if (this.spaceKey.isDown || this.input.activePointer.isDown) {
            if (!this.isStarted) {
                this.isStarted = true;
                this.player.setVelocityX(170 * 3);
                this.tweens.add({
                    targets: this.player,
                    angle: 20,
                    duration: 200,
                    yoyo: true,
                    repeat: 0,
                    ease: 'Linear'
                });
            } else {
                if (this.player.body.blocked.down) {
                    this.player.play('rocket');
                    this.jumpSound.play('', 0, 0.2);
                    this.player.setVelocityY(-290 * 2.5);
                    this.tweens.add({
                        targets: this.player,
                        angle: 20,
                        duration: 200,
                        yoyo: true,
                        repeat: 0,
                        ease: 'Linear'
                    });
                }
            }
        }
        if (this.player.level == 0) {
            this.player.y = Math.min(this.player.y, 378);
        } else if (this.player.level == 1) {
            this.player.y = Math.min(this.player.y, 756);
        } else if (this.player.level == 2) {
            this.player.y = Math.min(this.player.y, 1114);
        }
    }

      /* ─────────  EVENTOS  ───────── */
  onPointerDown (pointer) {
    const { worldX, worldY } = pointer;
    const lane = LANES.find((l) => worldY >= l.yMin && worldY <= l.yMax);
    if (!lane) return;                               // clic fuera del editor

    // 20 is the cube size
    const col = Math.floor(worldX / 20);
    const row = Math.floor(worldY / 20);
    const x   =  col * 20;
    const y   =  row * 20; 

    if (!obstacles[row]) obstacles[row] = {};

    if (obstacles[row][col]) {
      obstacles[row][col].destroy();                 // eliminar bloque
      delete obstacles[row][col];
      if (!Object.keys(obstacles[row]).length) delete obstacles[row];
    } else {
      const cube = this.cubes.get(x, y, 'cube');     // crear bloque
      cube.setActive(true).setVisible(true);
      cube.refreshBody();                            // ← importante, staticGroup
      obstacles[row][col] = cube;
    }
    localStorage.setItem('map', JSON.stringify(this.getMap()));
  }

}