import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "cl.tocktockalarm.app",
  appName: "TockTockAlarm",
  webDir: "dist",
  plugins: {
    FirebaseAuthentication: {
      providers: ["google.com"],
    },
  },
};

export default config;