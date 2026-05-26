import { Capacitor } from "@capacitor/core";
import { NativeAudio } from "@capacitor-community/native-audio";

let currentTone: string | null = null;
let currentWebAudio: HTMLAudioElement | null = null;

const tones = ["alarma01", "alarma02", "alarma03"];

export async function preloadAlarmTones() {
  if (!Capacitor.isNativePlatform()) return;

  for (const tone of tones) {
    try {
      await NativeAudio.preload({
        assetId: tone,
        assetPath: `${tone}.mp3`,
        audioChannelNum: 1,
        isUrl: false,
      });
    } catch {
      // Ya estaba cargado.
    }
  }
}

export async function playAlarmPreview(tone: string) {
  if (Capacitor.isNativePlatform()) {
    try {
      if (currentTone) {
        await NativeAudio.stop({ assetId: currentTone });
      }

      currentTone = tone;

      await NativeAudio.play({
        assetId: tone,
      });

      window.setTimeout(async () => {
        try {
          await NativeAudio.stop({ assetId: tone });
        } catch {}
      }, 3000);
    } catch (error) {
      console.error("Error reproduciendo preview nativo:", error);
    }

    return;
  }

  try {
    if (currentWebAudio) {
      currentWebAudio.pause();
      currentWebAudio.currentTime = 0;
    }

    currentWebAudio = new Audio(`/sounds/${tone}.mp3`);
    currentWebAudio.volume = 1;
    await currentWebAudio.play();

    window.setTimeout(() => {
      currentWebAudio?.pause();
      currentWebAudio!.currentTime = 0;
    }, 3000);
  } catch (error) {
    console.error("Error reproduciendo preview web:", error);
  }
}