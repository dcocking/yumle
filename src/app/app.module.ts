import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// Angular Material
import { MatCardModule } from "@angular/material/card";
import { MatDialogModule } from '@angular/material/dialog';
import { DialogModule } from '@angular/cdk/dialog';
import { MatButtonModule } from '@angular/material/button';
import { GameComponent } from './game/game.component';
import { HeaderComponent } from "./header/header.component";
import { FooterComponent } from './footer/footer.component';
import { ContentComponent } from './content/content.component';
import { GameOverDialog, WinnerDialog } from "./game/game.component";

@NgModule({
  declarations: [
    AppComponent,
    GameComponent,
    HeaderComponent,
    FooterComponent,
    ContentComponent,
    GameOverDialog,
    WinnerDialog
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MatCardModule,
    MatDialogModule,
    MatButtonModule,
    DialogModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }