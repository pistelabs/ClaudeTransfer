import { Header } from "./components/Header";
import { Board } from "./components/board/Board";
import { JobDetailsSheet } from "./components/detail/JobDetailsSheet";
import { CheckInSheet } from "./components/checkin/CheckInSheet";
import { CustomerDialog } from "./components/customer/CustomerDialog";
import { NoServicesModal } from "./components/NoServicesModal";
import { DamagePhotoModal } from "./components/DamagePhotoModal";

function App() {
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
