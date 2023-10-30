import { NoteTracker } from './noteTracker';

export class Metronome {
  ac: AudioContext;
  current16thNote: NoteTracker;
  tempo: number; // bpm
  isPlaying: boolean = false;
  isUnlocked: boolean = false;
  notesQueue: { note: number; time: number }[] = [];
  nextNotePlayTime: number = 0.0;
  noteResolution = 0; // 0 == 16th, 1 == 8th, 2 == quarter note TODO Enum
  noteLength = 0.05; // length of "beep" (in seconds)
  scheduleAheadTime = 0.1; // How far ahead to schedule audio (sec)
  worker: Worker;

  tick: OscillatorNode;
  tickVolume: GainNode;
  soundHz: number = 1000;

  constructor(tempo: number, worker: Worker, ticks = 1000) {
    this.ac = new AudioContext();
    this.current16thNote = new NoteTracker();

    this.worker = worker;
    this.worker.postMessage({ interval: 25.0 });

    this.tick = this.ac.createOscillator();
    this.tickVolume = this.ac.createGain();
    this.tempo = tempo;

    this.tick.type = 'sine';
    this.tick.frequency.value = this.soundHz;
    this.tickVolume.gain.value = 0;
  }

  play() {
    if (!this.isUnlocked) {
      this.unlock();
    }
    this.isPlaying = !this.isPlaying;
    if (this.isPlaying) {
      // start playing
      this.current16thNote.setValue(0);
      this.nextNotePlayTime = this.ac.currentTime;
      this.worker.postMessage('start');
      return 'stop';
    } else {
      this.worker.postMessage('stop');
      return 'play';
    }
  }

  private nextNote() {
    const secPerBeat = 60 / this.tempo;
    this.nextNotePlayTime += 0.25 * secPerBeat;
    this.current16thNote.increment();
  }

  scheduleNote(beatNumber: number, time: number) {
    // push the note on the queue, even if we're not playing.
    this.notesQueue.push({ note: beatNumber, time: time });

    if (this.noteResolution == 1 && beatNumber % 2) return; // we're not playing non-8th 16th notes
    if (this.noteResolution == 2 && beatNumber % 4) return; // we're not playing non-quarter 8th notes

    const tick = this.ac.createOscillator();
    tick.connect(this.ac.destination);
    if (beatNumber % 16 === 0)
      // beat 0 == high pitch
      tick.frequency.value = 880.0;
    else if (beatNumber % 4 === 0)
      // quarter notes = medium pitch
      tick.frequency.value = 440.0;
    // other 16th notes = low pitch
    else tick.frequency.value = 220.0;

    tick.start(time);
    tick.stop(time + this.noteLength);
  }

  scheduler() {
    // while there are notes that will need to play before the next interval,
    // schedule them and advance the pointer.
    while (
      this.nextNotePlayTime <
      this.ac.currentTime + this.scheduleAheadTime
    ) {
      this.scheduleNote(this.current16thNote.getValue(), this.nextNotePlayTime);
      this.nextNote();
    }
  }

  private unlock() {
    const buffer = this.ac.createBuffer(1, 1, 22050);
    const node = this.ac.createBufferSource();
    node.buffer = buffer;
    node.start(0);
    this.isUnlocked = true;
  }
}
