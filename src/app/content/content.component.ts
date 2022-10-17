import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-content',
  templateUrl: './content.component.html',
  styleUrls: ['./content.component.scss']
})
export class ContentComponent implements OnInit {
  density: number = 20;
  total: number = this.density * this.density;

  gridTemplate: string = '';
  filterMap: Array<string> = [];

  constructor() {
  }

  ngOnInit(): void {
    this.getFilter();
    this.getGridTemplate()

    setTimeout(() => {
      console.log(this.filterMap[1]);
    }, 2000)
  }

  setArray(i: number) {
    return new Array(i)
  }

  getGridTemplate(): void {
    this.gridTemplate = `repeat(${this.density}, 1fr)`
  }

  getFilter(): void {
    for (let x = 0; x < this.total; x++) {
      const random = Math.floor(Math.random() * this.density);
      this.filterMap.push(`blur(${random}px)`)
    }
  }

}
