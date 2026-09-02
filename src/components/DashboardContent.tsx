"use client";

import Sidebar from "./dashboard/Sidebar";
import TopBar from "./dashboard/TopBar";
import DisclaimerBanner from "./dashboard/DisclaimerBanner";
import QuickActionsBar from "./dashboard/QuickActionsBar";
import BalanceCard from "./dashboard/BalanceCard";

interface DashboardContentUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  userName: string;
  createdAt: Date | string;
}

interface DashboardContentProps {
  user: DashboardContentUser;
}

const DashboardContent: React.FC<DashboardContentProps> = ({ user }) => {


  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      <Sidebar user={user} />

      <div className="flex-1 flex flex-col">
        <TopBar user={user} />

        <main className="flex-1 px-8 pb-8 space-y-6">
          <DisclaimerBanner>
            This platform provides digital tools for legitimate use only. Users
            are responsible.
          </DisclaimerBanner>

          <QuickActionsBar />

          <BalanceCard name="Ajibola" balance={0} />

          {/* <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <CommunicationToolsCard />
            <SocialMediaMarketplaceCard />
            <BillPaymentsCard />
          </div> */}
        </main>
      </div>
    </div>
  );
};

export default DashboardContent;
