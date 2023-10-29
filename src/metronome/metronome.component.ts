import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-metronome',
  templateUrl: './metronome.component.html',
  styleUrls: ['./metronome.component.css'],
})
export class MetronomeComponent implements OnInit {
  ac: AudioContext;
  source: AudioBufferSourceNode;
  frequency: number = 330;
  phase: number = 0;
  amp: number = 1;
  input: string = '133';
  btnLabel: string = 'Start';
  constructor() {
    this.ac = new AudioContext();
    this.source = this.ac.createBufferSource();
  }

  ngOnInit() {
    const buffer: AudioBuffer = this.ac.createBuffer(
      1,
      this.ac.sampleRate * 2,
      this.ac.sampleRate
    );
    const channel: Float32Array = buffer.getChannelData(0);
    const duration_frames: number = this.ac.sampleRate / 50;

    for (var i = 0; i < duration_frames; i++) {
      channel[i] = Math.sin(this.phase) * this.amp;
      this.phase += (2 * Math.PI * this.frequency) / this.ac.sampleRate;
      if (this.phase > 2 * Math.PI) {
        this.phase -= 2 * Math.PI;
      }
      this.amp -= 1 / duration_frames;
    }

    this.source.buffer = buffer;
    this.source.loop = true;
    this.source.loopEnd = 1 / (this.getTempo() / 60);

    this.source.connect(this.ac.destination);
    this.source.start(0);
  }
  changeInputValue(event: Event) {
    this.input = (event.target as HTMLInputElement).value;
    this.source.loopEnd = 1 / (this.getTempo() / 60);
  }

  buttonHandler() {
    if (this.ac.state == 'running') {
      this.ac.suspend();
      this.btnLabel = 'Start';
    } else {
      this.ac.resume();
      this.btnLabel = 'Stop';
    }
  }

  private getTempo() {
    return this.clamp(parseFloat(this.input));
  }

  private clamp(input: number, min: number = 30, max: number = 300) {
    return Math.min(max, Math.max(min, input));
  }
}
