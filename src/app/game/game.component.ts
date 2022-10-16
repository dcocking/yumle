import {Component, OnInit} from '@angular/core';

import yumms from './yumms.json';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit {
  grid!: HTMLElement | null;

  INTERVAL_X = 10;
  INTERVAL_Y = 10;
  POSITIONS = this.INTERVAL_X * this.INTERVAL_Y;

  yumms: any = {};
  imageObject: {} | null | unknown = null;
  guessHistory: Array<string> = [];
  reveals = 0;

  gridArray = [];
  currentIndex = 0;

  constructor() {
  }

  ngOnInit(): void {
    this.grid = document.getElementById('yummle')
    this.getYumms();
  }

  getYumms() {
    this.yumms = yumms;
    this.loadYummle();
  }

  loadYummle() {
    this.getImage('assets/' + this.yumms[this.currentIndex].image).then((image) => {
      this.imageObject = image;

      // Build table and update html
      var imageGridHTML = this.buildTable();
      if(this.grid) {
        this.grid.innerHTML = imageGridHTML;

        // Apply the image to the table
        this.applyImage();

        // Reveal the first image
        this.nextReveal();

        this.updateScore();

      }
    })

  }

  resetScores() {
    this.guessHistory = [];
    this.reveals = 0;
  }

  updateScore() {
    const totalGuesses = this.guessHistory.length;
    const guessTag = document.getElementById('guess-count');
    guessTag!.innerText = String(totalGuesses);
    const guessInput = document.getElementById('guessInput') as HTMLInputElement;
    guessInput!.value = '';
  }

//logo - Blonde by Billy Argel from fontspace.com

  getImage(path: any) {
    const promise = new Promise((resolve) => {
      var imageObject = {};
      var image = new Image();
      image.onload = () => {
        imageObject = {
          image: image,
          xInterval: Math.round(image.width / this.INTERVAL_X),
          yInterval: Math.round(image.height / this.INTERVAL_Y),
        }
        resolve(imageObject);
      }
      image.src = path;
    })
    return promise;
  }

  buildTable() {
    var table = '';
    for (let y = 0; y < this.INTERVAL_Y; y++) {
      table += '<div class="row">';
      for (let x = 0; x < this.INTERVAL_X; x++) {
        table += '<div class="cell">';
        // table += `<img class="yummle-img" id='yummle-${y}-${x}' width="1" height="1" src="./white1x1.jpg"/>`;
        table += `<div class="yummle-img" id='yummle-${y}-${x}'></div>`;
        table += '</div>';
      }
      table += '</div>';
    }

    // console.log(table);

    return table;
  }

  applyImage() {
    for (let y = 0; y < this.INTERVAL_Y; y++) {
      for (let x = 0; x < this.INTERVAL_X; x++) {
        // console.log(`${y}, ${x} - ${imageObject.xInterval}, ${imageObject.yInterval}`)
        const currentImage = document.getElementById(`yummle-${y}-${x}`);
        // @ts-ignore
        const positionX = -(x * this.imageObject.xInterval);
        // @ts-ignore
        const positionY = -(y * this.imageObject.yInterval);
        // console.log(positionX,positionY)
        // @ts-ignore
        currentImage!.style.width = `${this.imageObject.xInterval}px`;
        // @ts-ignore
        currentImage!.style.height = `${this.imageObject.yInterval}px`;
        // @ts-ignore
        currentImage!.style.background = `url('${this.imageObject.image.src}') no-repeat 0 0`;
        currentImage!.style.backgroundPosition = `${positionX}px ${positionY}px`;
        currentImage!.style.visibility = 'hidden';
        const index = this.gridArray.length;

        // Push image piece into array
        // @ts-ignore
        this.gridArray.push({position: `${y}-${x}`, visible: false,})
      }
    }
  }

  nextReveal() {
    this.reveals++;
    const revealCount = document.getElementById('reveal-count');
    revealCount!.innerText = String(this.reveals);
    const index = this.generateRandomIndex();
    this.revealIndex(index);
  }

  generateRandomIndex(maxLimit = this.POSITIONS) {
    let nextIndex = -1;

    let count = 0;
    while (nextIndex === -1 && count <= this.POSITIONS + 1) {
      let rand = Math.random() * maxLimit;
      rand = Math.floor(rand); // 99

      if (this.checkIndex(rand) === false) {
        nextIndex = rand;
      }
      count++;
    }

    return nextIndex;
  }

  checkIndex(index: number) {
    // @ts-ignore
    return (this.gridArray)[index].visible;
  }

  revealIndex(index: number) {
    // @ts-ignore
    (this.gridArray)[index].visible = true;
    // @ts-ignore
    const position = (this.gridArray)[index].position;
    let gridItem = document.getElementById(`yummle-${position}`);
    // @ts-ignore
    gridItem.style.visibility = 'visible';
  }

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

      (this.yumms)[this.currentIndex].guesses.forEach((correctGuess: string) => {
        if (guess === correctGuess) {
          validAnswer = true;
          this.gameOver();
        }
      })

      // @ts-ignore
      this.guessHistory.push(guess);
      this.updateScore();
    }
  }

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
    var revealText = this.reveals + ' ';
    if (this.reveals === 1) {
      revealText += 'reveal';
    } else {
      revealText += 'reveals';
    }
    const lastAnswer = (this.guessHistory)[this.guessHistory.length - 1];
    const modalAnswerText = lastAnswer[0].toUpperCase() + lastAnswer.substring(1);
    modalRevealScore!.innerText = revealText;
    modalAnswer!.innerText = modalAnswerText;
    // @ts-ignore
    $('#exampleModalCenter').modal('show');
  }

  nextYummle() {
    this.currentIndex++;
    while (this.gridArray.length > 0) {
      this.gridArray.pop();
    }
    this.resetScores();
    this.loadYummle();
  }

}
