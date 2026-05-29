import { useEffect, useState } from "react";
import { BellRing, Power } from "lucide-react";
import { stopCurrentWebAlarm } from "@/lib/native-notifications";
import { Button } from "@/components/ui/button";

type RingingAlarm = {
  alarmId: string;
  label: string;
  toneMode: string;
};

export default function WebAlarmBanner() {
  const [ringingAlarm, setRingingAlarm] = useState<RingingAlarm | null>(null);

  useEffect(() => {
    const handleRinging = (event: Event) => {
      const customEvent = event as CustomEvent<RingingAlarm>;
      setRingingAlarm(customEvent.detail);
    };

    const handleStopped = () => {
      setRingingAlarm(null);
    };

    window.addEventListener("tocktock-alarm-ringing", handleRinging);
    window.addEventListener("tocktock-alarm-stopped", handleStopped);

    return () => {
      window.removeEventListener("tocktock-alarm-ringing", handleRinging);
      window.removeEventListener("tocktock-alarm-stopped", handleStopped);
    };
  }, []);

  if (!ringingAlarm) return null;

  return (
    <div className="fixed inset-x-4 bottom-5 z-[9999] mx-auto max-w-md rounded-2xl border bg-background p-4 shadow-2xl">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500 text-white">
          <BellRing className="h-6 w-6 animate-pulse" />
        </div>

        <div className="flex-1">
          <p className="text-sm font-black">Alarma sonando</p>
          <p className="text-xs text-muted-foreground">
            {ringingAlarm.label}
          </p>
        </div>

        <Button
          variant="destructive"
          size="sm"
          className="gap-2"
          onClick={stopCurrentWebAlarm}
        >
          <Power className="h-4 w-4" />
          Apagar
        </Button>
      </div>
    </div>
  );
}