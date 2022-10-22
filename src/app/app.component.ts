import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Yummle';

  ngOnInit() {
    // Prevent spacebar from scrolling page
    window.addEventListener('keydown', function(e) {
      if(e.code == 'Space' && e.target == document.body) {
        e.preventDefault();
      }
    });  
  }

}
