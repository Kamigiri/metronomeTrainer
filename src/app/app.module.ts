import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MetronomeModule } from 'src/metronome/metronome.module';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, AppRoutingModule, MetronomeModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
