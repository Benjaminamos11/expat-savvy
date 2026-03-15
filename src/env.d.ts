/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface Window {
  Cal?: any;
  closeConsultationModal?: () => void;
  openConsultationModal?: () => void;
  showConsultationModal?: () => void;
  showAIChatModal?: () => void;
  trackMetaEvent?: (eventName: string, props?: any) => void;
}