import React, { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { useStreak } from "@/hooks/useStreak";
import { useGoals } from "@/hooks/useGoals";
import { toast } from "react-toastify";
import Sidebar from "@/components/organisms/Sidebar";
import Header from "@/components/organisms/Header";
import CheckInModal from "@/components/molecules/CheckInModal";
import { notificationService } from "@/services/api/notificationService";
import { checkInService } from "@/services/api/checkInService";

const CelebrationModal = React.lazy(() => import('@/components/molecules/CelebrationModal'));
const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [checkInModalOpen, setCheckInModalOpen] = useState(false);
  const [checkInLoading, setCheckInLoading] = useState(false);
  const [celebrationModalOpen, setCelebrationModalOpen] = useState(false);
  const [celebrationData, setCelebrationData] = useState(null);
  
  const { streak, updateStreak } = useStreak();
  const { goals, loading: goalsLoading } = useGoals();
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  const handleCheckIn = () => {
    setCheckInModalOpen(true);
  };
  
  const handleCheckInSubmit = async (checkInData) => {
    try {
      setCheckInLoading(true);
      await checkInService.create(checkInData);
      updateStreak();
      setCheckInModalOpen(false);
      toast.success('Daily check-in completed! 🎉');
    } catch (error) {
      toast.error('Failed to complete check-in. Please try again.');
} finally {
      setCheckInLoading(false);
    }
  };
  
  const handleCelebration = (data) => {
    setCelebrationData(data);
    setCelebrationModalOpen(true);
  };
  
// Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, []);
  
  return (
    <div className="flex h-screen bg-background text-white overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />
      
      <div className="flex-1 flex flex-col min-w-0">
        <Header 
          onMenuToggle={toggleSidebar} 
          onCheckIn={handleCheckIn}
          streak={streak}
        />
        
<main className="flex-1 overflow-auto">
          <div className="h-full">
            <Outlet context={{ onCelebration: handleCelebration }} />
          </div>
        </main>
      </div>
      
<CheckInModal
        isOpen={checkInModalOpen}
        onClose={() => setCheckInModalOpen(false)}
        goals={goals}
        streak={streak}
        onSubmit={handleCheckInSubmit}
        isLoading={checkInLoading}
      />
      {celebrationModalOpen && (
        <CelebrationModal
          isOpen={celebrationModalOpen}
          onClose={() => setCelebrationModalOpen(false)}
          data={celebrationData}
        />
      )}
    </div>
  );
};

export default Layout;