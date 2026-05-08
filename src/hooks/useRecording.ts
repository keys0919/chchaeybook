import { useEffect, useRef, useState } from 'react';
import { useAudioRecorder, useAudioRecorderState, AudioModule, RecordingPresets } from 'expo-audio';

const MAX_DURATION_S = 60;
const WARNING_THRESHOLD_S = 50;

export type RecordingStatus = 'idle' | 'recording' | 'done';

export function useRecording() {
  const recorder = useAudioRecorder(
    { ...RecordingPresets.HIGH_QUALITY, isMeteringEnabled: true }
  );
  const state = useAudioRecorderState(recorder, 200);
  const [status, setStatus] = useState<RecordingStatus>('idle');
  const [recordedUri, setRecordedUri] = useState<string | null>(null);
  const stoppedRef = useRef(false);

  const elapsed = Math.floor((state.durationMillis ?? 0) / 1000);
  const metering = state.metering ?? -80;
  const isWarning = elapsed >= WARNING_THRESHOLD_S;

  // 60초 자동 중지
  useEffect(() => {
    if (status === 'recording' && elapsed >= MAX_DURATION_S && !stoppedRef.current) {
      stoppedRef.current = true;
      recorder.stop().then(() => {
        setStatus('done');
        setRecordedUri(recorder.uri ?? null);
      }).catch(() => {});
    }
  }, [elapsed, status]);

  async function startRecording(): Promise<boolean> {
    const { granted } = await AudioModule.requestRecordingPermissionsAsync();
    if (!granted) return false;
    stoppedRef.current = false;
    await recorder.prepareToRecordAsync();
    recorder.record();
    setStatus('recording');
    setRecordedUri(null);
    return true;
  }

  async function stopRecording(): Promise<string | null> {
    stoppedRef.current = true;
    await recorder.stop();
    const uri = recorder.uri ?? null;
    setStatus('done');
    setRecordedUri(uri);
    return uri;
  }

  async function cancelRecording(): Promise<void> {
    stoppedRef.current = true;
    if (state.isRecording) {
      await recorder.stop().catch(() => {});
    }
    setStatus('idle');
    setRecordedUri(null);
  }

  function reset(): void {
    setStatus('idle');
    setRecordedUri(null);
    stoppedRef.current = false;
  }

  return {
    status,
    elapsed,
    metering,
    recordedUri,
    isWarning,
    startRecording,
    stopRecording,
    cancelRecording,
    reset,
  };
}
