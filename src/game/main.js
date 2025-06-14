import { Boot } from './scenes/Boot';
import { Game as MainGame } from './scenes/Game';
import { GameOver } from './scenes/GameOver';
import { Preloader } from './scenes/Preloader';
import { AUTO, Game } from 'phaser';

//  Find out more information about the Game Config at:
//  https://docs.phaser.io/api-documentation/typedef/types-core#gameconfig
const config = {
    type: AUTO,
    width: 768,
    height: 1152,
    parent: 'game-container',
    backgroundColor: '#922fe4',
    pixelArt: true,
    physics: {
        default: 'arcade',
        arcade: {
            //gravity: { y: 200 },
            debug: true
        }
    },
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: [
        Boot,
        Preloader,
        MainGame,
        GameOver
    ]
};

const StartGame = (parent) => {

    return new window.Phaser.Game({ ...config, parent });

}

export default StartGame;
