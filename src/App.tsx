import { useEffect } from "react";
import { Header } from "./components/Header";
import { Board } from "./components/board/Board";
import { JobDetailsSheet } from "./components/detail/JobDetailsSheet";
import { CheckInSheet } from "./components/checkin/CheckInSheet";
import { CustomerDialog } from "./components/customer/CustomerDialog";
import { NoServicesModal } from "./components/NoServicesModal";
import { DamagePhotoModal } from "./components/DamagePhotoModal";
import { useAppStore } from "./store/useAppStore";

function App() {
  const tickClock = useAppStore((s) => s.tickClock);

  // Drives the collected-item lock: once an item's grace period elapses the UI has to
  // re-render to disable it, even though nothing else changed.
  useEffect(() => {
    const id = setInterval(tickClock, 1000);
    return () => clearInterval(id);
  }, [tickClock]);

  return (
    <div className="flex h-screen flex-col bg-app-bg font-sans text-ink antialiased">
      <Header />
      <Board />
      <JobDetailsSheet />
      <CheckInSheet />
      <CustomerDialog />
      <NoServicesModal />
      <DamagePhotoModal />
    </div>
  );
}

export default App;
