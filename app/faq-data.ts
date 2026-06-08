export type FaqEntry = { q: string; a: string };

export const faqData: FaqEntry[] = [
  {
    q: "What is Azora?",
    a: "Azora is a breathwork companion that uses your phone's camera to measure heart rate in real time, guides you through evidence-based breathing techniques, and reveals patterns in your stress and recovery.",
  },
  {
    q: "How does heart-rate tracking work?",
    a: "Through photoplethysmography (PPG), Azora reads your pulse via the camera and flash during a session. No wearables, no straps — just place your finger over the lens and watch your live BPM, stress index, and recovery metrics unfold.",
  },
  {
    q: "Is Azora free to use?",
    a: "Azora is free to download, with core breathing exercises and basic tracking available at no cost. Advanced analytics, personalized programs, and unlimited history are part of Azora Premium.",
  },
  {
    q: "What devices support Azora?",
    a: "Azora is available on iPhone. For the richest experience, we recommend devices with a rear camera and flash.",
  },
  {
    q: "Is my health data private?",
    a: "Your physiological data never leaves your device unless you choose to enable cloud sync. We do not sell, share, or monetize your health information in any form.",
  },
];
