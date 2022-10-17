import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';

import yumms from './yumms.json';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit {
  // Proper loading of canvas element from:
  // https://medium.com/angular-in-depth/how-to-get-started-with-canvas-animations-in-angular-2f797257e5b4
  @ViewChild('canvas', { static: true }) canvas!: ElementRef<HTMLCanvasElement>;
  private ctx!: CanvasRenderingContext2D;

  PIXEL_SIZES = [50,40,30,20,10,1];

  yumms: any = {};
  imageObject: {} | null | unknown = null;
  currentImage!: HTMLImageElement;
  currentPixelSize: number = this.PIXEL_SIZES[0];
  guessHistory: Array<string> = [];

  currentIndex = 0;

  constructor() {
  }

  ngOnInit(): void {
    this.ctx = this.canvas.nativeElement.getContext('2d', {willReadFrequently: true})!;
    this.getYumms();
  }

  getYumms() {
    this.yumms = yumms;
    this.loadYummle();
  }

  /**
   * TODO
   * 
   * X Replace current grid image with pixelation
   * X Tie failed guesses to next pixelation level
   * - Limit guesses to only 5
   * - Introduce mobile keyboard (see https://hodgef.com/simple-keyboard/demos/?d=mobile)
   * - Look at blur transition between one pixel size and the next (see https://github.com/hughjdavey/ngx-image-blur)
   * - Add history / state in cookie (will probably want to create a login at some point, maybe with https://supabase.com/)
   */

  /**
   * Pixels the current image, at the current pixel size
   */
  pixelateImage() {
    let w = this.currentImage.width;
    let h = this.currentImage.height;
    this.ctx.drawImage(this.currentImage,0,0);
    let pixelArr = this.ctx.getImageData(0, 0, w, h).data;
    // let sampleSize = 10;
    
    for (let y = 0; y < h; y += this.currentPixelSize) {
      for (let x = 0; x < w; x += this.currentPixelSize) {
        let p = (x + (y*w)) * 4;
        
        let fillStyile = "rgba(" + pixelArr[p] + "," + pixelArr[p + 1] + "," + pixelArr[p + 2] + "," + pixelArr[p + 3];
        this.ctx.fillStyle = fillStyile;    
        this.ctx.fillRect(x, y, this.currentPixelSize, this.currentPixelSize);
      }   
    } 
  }

  /**
   * Loads the yummle at current index, pixelates it, and displays it
   */
  loadYummle() {
    this.getImage('assets/' + this.yumms[this.currentIndex].image).then((image) => {
      this.currentImage = <HTMLImageElement>image;
      this.pixelateImage();
      this.updateScore();
    })
  }

  /**
   * Resets the current game state
   */
  resetGame() {
    this.guessHistory = [];
    this.currentPixelSize = this.PIXEL_SIZES[0];
  }

  /**
   * Updates current guess count and resets the field after a guess is submitted
   */
  updateScore() {
    const totalGuesses = this.guessHistory.length;
    const guessTag = document.getElementById('guess-count');
    guessTag!.innerText = String(totalGuesses);
    const guessInput = document.getElementById('guessInput') as HTMLInputElement;
    guessInput!.value = '';
  }

// Note: logo image - Blonde Font by Billy Argel from fontspace.com

  getImage(path: any) {
    const promise = new Promise((resolve) => {
      const img = new Image();
      img.src = path;
      img.onload = ()=>{
        
        resolve(img);
      }
    })
    return promise;      
  }

  /**
   * Processes guesses typed into the guess input
   * @param event Keyboard event
   */
  guess(event?: KeyboardEvent) {
    var guess = '';
    if (event) {
      if (event.key === 'Enter') {
        // @ts-ignore
        guess = document.getElementById('guessInput').value;
      }
    } else {
      // @ts-ignore
      guess = document.getElementById('guessInput').value;
    }

    if (guess !== '') {
      var validAnswer = false;
      this.guessHistory.push(guess);      

      (this.yumms)[this.currentIndex].guesses.forEach((correctGuess: string) => {
        if (guess === correctGuess) {
          validAnswer = true;
        }
      })
      
      this.updateScore();
      if (validAnswer) {
        this.gameOver();
        this.revealImage();
        this.resetGame();
      } else {
        // @ts-ignore
        this.nextPixelSize();
        this.pixelateImage();
      }
    }
  }

  revealImage() {
    this.currentPixelSize = this.PIXEL_SIZES[5];
    this.pixelateImage();
  }

  /**
   * Sets the current pixelation size to the correlated number of guesses
   */
  nextPixelSize() {
    this.currentPixelSize = this.PIXEL_SIZES[this.guessHistory.length];
  }

  /**
   * Handles game over state after correct guess
   */
  gameOver() {
    const modalGuessScore = document.getElementById('modalGuessScore');
    const modalRevealScore = document.getElementById('modalRevealScore');
    const modalAnswer = document.getElementById('modalAnswer');
    var scoreText = this.guessHistory.length + ' ';
    if (this.guessHistory.length === 1) {
      scoreText += 'guess';
    } else {
      scoreText += 'guesses';
    }
    modalGuessScore!.innerText = scoreText;
    const lastAnswer = (this.guessHistory)[this.guessHistory.length - 1];
    const modalAnswerText = lastAnswer[0].toUpperCase() + lastAnswer.substring(1);
    modalAnswer!.innerText = modalAnswerText;
    // @ts-ignore
    $('#exampleModalCenter').modal('show');
  }

  /**
   * Dev function to load the next yummle
   */
  nextYummle() {
    this.currentIndex++;
    this.resetGame();
    this.loadYummle();
  }

}
