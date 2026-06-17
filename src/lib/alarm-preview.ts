import { Capacitor } from "@capacitor/core";
import { NativeAudio } from "@capacitor-community/native-audio";

let currentTone: string | null = null;
let currentWebAudio: HTMLAudioElement | null = null;

const tones = ["alarma01", "alarma02", "alarma03"];

function getWebTonePath(tone: string) {
  return `/sounds/${tone}.mp3`;
}

function getNativeTonePath(tone: string) {
  return `public/sounds/${tone}.mp3`;
}

export async function preloadAlarmTones() {
  if (!Capacitor.isNativePlatform()) return;

  for (const tone of tones) {
    try {
      await NativeAudio.preload({
        assetId: tone,
        assetPath: getNativeTonePath(tone),
        audioChannelNum: 1,
        isUrl: false,
      });
    } catch (error) {
      console.warn(`No se pudo precargar ${tone}:`, error);
    }
  }
}

async function playNativeTone(tone: string) {
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

    return true;
  } catch (error) {
    console.warn("Falló NativeAudio, usando fallback web:", error);
    return false;
  }
}

async function playWebTone(tone: string) {
  try {
    if (currentWebAudio) {
      currentWebAudio.pause();
      currentWebAudio.currentTime = 0;
    }

    currentWebAudio = new Audio(getWebTonePath(tone));
    currentWebAudio.volume = 1;

    await currentWebAudio.play();

    window.setTimeout(() => {
      try {
        currentWebAudio?.pause();

        if (currentWebAudio) {
          currentWebAudio.currentTime = 0;
        }
      } catch {}
    }, 3000);

    return true;
  } catch (error) {
    console.error("Error reproduciendo preview web:", error);
    return false;
  }
}

export async function playAlarmPreview(tone: string) {
  if (Capacitor.isNativePlatform()) {
    const nativeOk = await playNativeTone(tone);

    if (nativeOk) return;

    await playWebTone(tone);
    return;
  }

  await playWebTone(tone);
}