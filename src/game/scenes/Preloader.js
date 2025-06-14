import { Scene } from 'phaser';

export class Preloader extends Scene
{
    constructor ()
    {
        super('Preloader');
    }

    init ()
    {
        //  We loaded this image in our Boot Scene, so we can display it here
        //this.add.image(512, 384, 'background');
        const X = 380;
        //  A simple progress bar. This is the outline of the bar.
        this.add.rectangle(X, 384, 468, 32).setStrokeStyle(1, 0xffffff);

        //  This is the progress bar itself. It will increase in size from the left based on the % of progress.
        const bar = this.add.rectangle(X-230, 384, 4, 28, 0xffffff);

        //  Use the 'progress' event emitted by the LoaderPlugin to update the loading bar
        this.load.on('progress', (progress) => {

            //  Update the progress bar (our bar is 464px wide, so 100% = 464px)
            bar.width = 4 + (460 * progress);

        });
    }

    preload ()
    {
        //  Load the assets for the game - Replace with your own assets

        //this.load.image('logo', 'assets/logo.png');
        this.load.image('background', 'assets/bg.png');

        // add spritesheet
        this.load.spritesheet('playerface', 'assets/player-full.png', { frameWidth: 138, frameHeight: 138 });
        this.load.spritesheet('rocket', 'assets/player-rocket.png', { frameWidth: 138, frameHeight: 138 });

        this.load.image('player', 'assets/player-body.png');
        this.load.image('line', 'assets/line.png');
        this.load.image('cube', 'assets/cube.png');
        this.load.image('pixel', 'assets/pixel.png');
        this.load.bitmapFont("font", "assets/fonts/font.png", "assets/fonts/font.fnt");

        this.load.audio('music', 'music.mp3');
        this.load.audio('rocket', 'rocket.wav');
        this.load.audio('hit', 'hit.wav');

    }

    create ()
    {
        //  When all the assets have loaded, it's often worth creating global objects here that the rest of the game can use.
        //  For example, you can define global animations here, so we can use them in other scenes.

        //  Move to the MainMenu. You could also swap this for a Scene Transition, such as a camera fade.
        this.scene.start('Game');
    }
}
