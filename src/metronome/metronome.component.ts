import { Component, OnInit } from '@angular/core';
import { Metronome } from 'src/lib/classes/metronome';

@Component({
  selector: 'app-metronome',
  templateUrl: './metronome.component.html',
  styleUrls: ['./metronome.component.css'],
})
export class MetronomeComponent implements OnInit {
  worker: Worker;
  metronome: Metronome;

  constructor() {
    this.worker = new Worker(
      new URL('src/lib/worker/metronome.worker', import.meta.url)
    );
    const metronomeObj = new Metronome(30, this.worker);
    this.metronome = metronomeObj;
    this.worker.onmessage = function (e) {
      if (e.data == 'tick') {
        // console.log("tick!");
        metronomeObj.scheduler();
      } else console.log('message: ' + e.data);
    };
  }

  ngOnInit() {}

  buttonHandler() {
    this.metronome.play();
  }
}
