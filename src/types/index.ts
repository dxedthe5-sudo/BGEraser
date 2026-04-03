export type ProcessingStep = 'idle' | 'uploading' | 'detecting' | 'removing' | 'upscaling' | 'done' | 'error';

export interface DetectedObject {
  label: string;
  confidence: number;
}

export interface ProcessingState {
  step: ProcessingStep;
  progress: number;
  message: string;
}

export interface ImageResult {
  originalUrl: string;
  processedUrl: string | null;
  fileName: string;
  detectedObjects: DetectedObject[];
  originalSize: { width: number; height: number };
  processedSize: { width: number; height: number } | null;
}

export type UpscaleLevel = '1x' | '2x' | '4x';
