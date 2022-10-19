import {Component, ElementRef, OnInit, ViewChild, Inject} from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { StatsService, StatsData } from '../services/stats.service';

import yumms from './yumms.json';

export interface DialogData {
  score: number,
  answer: string
}

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
  inputDisabled = false;
  guessDisabled = false;

  constructor(public dialog: MatDialog, public statsService: StatsService) {
    
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
    this.inputDisabled = false;
    this.guessDisabled = false;
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
        this.inputDisabled = true;
        this.guessDisabled = true;
        this.gameOver();
        this.statsService.update(this.guessHistory.length, true);
        this.revealImage();
      } else {
        if (this.guessHistory.length >= 5) {
          let dialogRef = this.openGameOverDialog();
            dialogRef.afterClosed().subscribe(result => {
              this.inputDisabled = true;
              this.guessDisabled = true;
              this.statsService.update(this.guessHistory.length);
            if(result === true) {
              this.nextYummle();
            }
          });
        }
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
    var scoreText = this.guessHistory.length + ' ';
    if (this.guessHistory.length === 1) {
      scoreText += 'guess';
    } else {
      scoreText += 'guesses';
    }
    const lastAnswer = (this.guessHistory)[this.guessHistory.length - 1];
    const modalAnswerText = lastAnswer[0].toUpperCase() + lastAnswer.substring(1);

    let dialogRef = this.openWinnerDialog(modalAnswerText, scoreText);
    dialogRef.afterClosed().subscribe((result) => {
      console.log('closed');
    })
  }

  /**
   * Dev function to load the next yummle
   */
  nextYummle() {
    this.currentIndex++;
    this.resetGame();
    this.loadYummle();
  }

  openGameOverDialog(): MatDialogRef<any> {
    const dialogRef = this.dialog.open(GameOverDialog, {
      width: '300px',
      data: {},
    });

    return dialogRef;
  }  

  openWinnerDialog(modalAnswerText: string, scoreText: string): MatDialogRef<any> {
    const dialogRef = this.dialog.open(WinnerDialog, {
      width: '300px',
      data: {
        score: scoreText,
        answer: modalAnswerText,
      },
    });

    return dialogRef;
  }    

  openStatsdialog(): MatDialogRef<any> {
    const stats = this.statsService.get();
    const dialogRef = this.dialog.open(StatsDialog, {
      width: '300px',
      data: stats
    });

    return dialogRef;
  }

}

@Component({
  selector: 'app-dialog',
  templateUrl: 'gameover-dialog.component.html',
})
export class GameOverDialog {
  constructor(
    public dialogRef: MatDialogRef<GameOverDialog>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
  ) {}

  onNoClick(): void {
    this.dialogRef.close();
  }
}

@Component({
  selector: 'app-dialog-win',
  templateUrl: 'winner-dialog.component.html',
})
export class WinnerDialog {
  guesses: number = 0;
  answer: string = '';
  constructor(
    public dialogRef: MatDialogRef<WinnerDialog>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
  ) {
    this.guesses = data.score;
    this.answer = data.answer;
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}

@Component({
  selector: 'app-stats-win',
  templateUrl: 'stats-dialog.component.html',
  styleUrls: ['./stats-dialog.component.css']
})
export class StatsDialog {

  maxGuesses: number = 0;

  constructor(
    public dialogRef: MatDialogRef<StatsDialog>,
    @Inject(MAT_DIALOG_DATA) public data: StatsData,
  ) {
    this.processStats();
  }

  /**
   * Get the highest number of guesses to properly
   * format the meters
   */
  processStats() {
    this.maxGuesses = this.data.winDistribution[1];
    Object.keys(this.data.winDistribution).forEach((key) => {
      if (this.data.winDistribution[Number(key)] > this.maxGuesses) {
        this.maxGuesses = this.data.winDistribution[Number(key)];
      }
    })
  }
}