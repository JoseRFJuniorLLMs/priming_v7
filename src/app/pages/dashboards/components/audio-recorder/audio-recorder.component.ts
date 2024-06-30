import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';

import WaveSurfer from 'wavesurfer.js';
import RecordPlugin from 'wavesurfer.js/dist/plugins/record.js';

@Component({
  selector: 'app-audio-recorder',
  templateUrl: './audio-recorder.component.html',
  styleUrls: ['./audio-recorder.component.scss'],

})
export class AudioRecorderComponent implements OnInit {

  @ViewChild('mic') micElement!: ElementRef;
  wavesurfer!: WaveSurfer;
  isRecording: boolean = false;

    ngOnInit(): void {
      this.createWaveSurfer();
    }

    createWaveSurfer(): void {
      this.wavesurfer = WaveSurfer.create({
        container: this.micElement.nativeElement,
        waveColor: 'violet',
        progressColor: 'purple',
        plugins: [
          RecordPlugin.create({})
        ]
      });

      this.wavesurfer.on('ready', () => {
        console.log('WaveSurfer is ready.');
      });

      this.wavesurfer.on('record:start' as any, () => {
        console.log('Recording started');
        this.isRecording = true;
      });

      this.wavesurfer.on('record:stop' as any, () => {
        console.log('Recording stopped');
        this.isRecording = false;
      });

      this.wavesurfer.on('record:pause' as any, () => {
        console.log('Recording paused');
      });
    }

    startRecording(): void {
      if (!this.isRecording) {
        this.wavesurfer.record.start();
      }
    }

    pauseRecording(): void {
      if (this.isRecording) {
        this.wavesurfer.record.pause();
      }
    }

    stopRecording(): void {
      if (this.isRecording) {
        this.wavesurfer.record.stop();
      }
    }

  }
