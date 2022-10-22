import {Component, ElementRef, OnInit, ViewChild, Inject, HostListener} from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import Keyboard from "simple-keyboard";

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
  @HostListener('document:keydown', ['$event'])
  handleKeypressEvent(event: KeyboardEvent) { 
    if (event.key === "Backspace" || event.key === "Delete") {
      this.value = this.value.slice(0, -1);
    }
    if (event.code === "Space") {
      this.value += ' ';
    }
  }

  @HostListener('document:keypress', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) { 
    if (event.key === 'Enter') {
      this.guess();  
    } else {
      this.value += event.key;
    }
  }

  // Proper loading of canvas element from:
  // https://medium.com/angular-in-depth/how-to-get-started-with-canvas-animations-in-angular-2f797257e5b4
  @ViewChild('canvas', { static: true }) canvas!: ElementRef<HTMLCanvasElement>;
  private ctx!: CanvasRenderingContext2D;
  keyboard!: Keyboard;
  value = "";

  PIXEL_SIZES = [50,40,30,20,10,1];

  yumms: any = {};
  imageObject: {} | null | unknown = null;
  currentImage!: HTMLImageElement;
  currentPixelSize: number = this.PIXEL_SIZES[0];
  guessHistory: Array<string> = [];
  canvasWidth: number = 500;

  currentIndex = 0;
  inputDisabled = false;
  guessDisabled = false;

  constructor(public dialog: MatDialog) {
  }

  ngOnInit(): void {
    this.ctx = this.canvas.nativeElement.getContext('2d', {willReadFrequently: true})!;
    this.getYumms();
  }

  ngAfterViewInit() {
    this.keyboard = new Keyboard({
      onChange: input => this.onChange(input),
      onKeyPress: (button:any) => this.onKeyPress(button),
      mergeDisplay: true,
      layoutName: "default",
      layout: {
        default: [
          "q w e r t y u i o p",
          "a s d f g h j k l",
          "{ent} z x c v b n m {backspace}",
          "{space}"
        ],
        numbers: ["1 2 3", "4 5 6", "7 8 9", "{abc} 0 {backspace}"]
      },
      display: {
        "{numbers}": "123",
        "{ent}": "return",
        "{escape}": "esc ⎋",
        "{tab}": "tab ⇥",
        "{backspace}": "⌫",
        "{capslock}": "caps lock ⇪",
        "{shift}": "⇧",
        "{controlleft}": "ctrl ⌃",
        "{controlright}": "ctrl ⌃",
        "{altleft}": "alt ⌥",
        "{altright}": "alt ⌥",
        "{metaleft}": "cmd ⌘",
        "{metaright}": "cmd ⌘",
        "{abc}": "ABC"
      }
    });
  }  

  onChange = (input: string) => {
    this.value = input;
  };

  onKeyPress = (button: string) => {
    if (button === "{ent}") {
      this.guess();
    }
  };

  onInputChange = (event: any) => {
    this.keyboard.setInput(event.target.value);
  };

  getYumms() {
    this.yumms = yumms;
    this.loadYummle();
  }

  /**
   * Sets the canvas proportionally to the window size, and adjusts the
   * pixelation ratio based on the size
   */
  prepareCanvas() {
    this.resetPixelSteps();

    if (window.innerWidth < 500) {
      this.canvasWidth = window.innerWidth - 26;
    }

    // TODO: Rewrite to use certain number of squares vs pixelation ratio
    // Also, likely need to adjust canvas width to evenly divisible sizes
    // 10 12 16 25 50

    const pixelationRatio = this.canvasWidth / 500;
    console.log(`Window Width: ${window.innerWidth}`)
    console.log(`Canvas Width: ${this.canvasWidth}`)
    console.log(`Pixel Ratio: ${pixelationRatio}`)

    // If canvas is less than 500px thick, adjust pixelation sizes so they fit
    if (pixelationRatio != 1) {
      this.PIXEL_SIZES.forEach((size,index) => {
        if (size !== 1) {
          this.PIXEL_SIZES[index] = Math.floor(size * pixelationRatio);
        }
      })
    }
    this.currentPixelSize = this.PIXEL_SIZES[0];
    console.log(this.PIXEL_SIZES);
  }

  resetPixelSteps() {
    this.PIXEL_SIZES = [50,40,30,20,10,1];
  }

  /**
   * TODO
   * 
   * - Look at blur transition between one pixel size and the next (see https://github.com/hughjdavey/ngx-image-blur)
   * - Add history / state in cookie (will probably want to create a login at some point, maybe with https://supabase.com/)
   */

  /**
   * Pixels the current image, at the current pixel size
   */
  pixelateImage() {
    console.log('pixelate');
    this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasWidth);
    let w = this.currentImage.width;
    let h = this.currentImage.height;

    this.ctx.canvas.width = this.canvasWidth;
    this.ctx.canvas.height = this.canvasWidth;
    this.ctx.drawImage(this.currentImage,0,0,this.canvasWidth,this.canvasWidth);
    let pixelArr = this.ctx.getImageData(0, 0, w, h).data;
    // let sampleSize = 10;

    console.log(`Current pixel size: ${this.currentPixelSize}`);

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
      this.prepareCanvas();
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
    // const guessInput = document.getElementById('guessInput') as HTMLInputElement;
    // guessInput!.value = '';
    this.value = '';
    this.keyboard.setInput('');
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
        console.log(guess);
      }
    } else {
      // @ts-ignore
      guess = document.getElementById('guessInput').value;
      console.log(guess);
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
        this.revealImage();
      } else {
        if (this.guessHistory.length >= 5) {
          let dialogRef = this.openGameOverDialog();
            dialogRef.afterClosed().subscribe(result => {
              this.inputDisabled = true;
              this.guessDisabled = true;
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
      if (result === true) {
        this.nextYummle();
      }
      console.log('closed');
    })
  }

  /**
   * Dev function to load the next yummle
   */
  nextYummle() {
    this.currentIndex++;
    this.currentPixelSize = this.PIXEL_SIZES[0];
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