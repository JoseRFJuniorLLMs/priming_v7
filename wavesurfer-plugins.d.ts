import 'wavesurfer.js';
import RecordPlugin from 'wavesurfer.js/dist/plugins/record.js';


declare module 'wavesurfer.js' {
  interface WaveSurfer {
    record: RecordPlugin;
  }
}
