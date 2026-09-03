"use client";

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
    <main className="space-y-6">
      <DisclaimerBanner>
        This platform provides digital tools for legitimate use only. Users are
        responsible.
      </DisclaimerBanner>

      <QuickActionsBar />

      <BalanceCard name={user.firstName} balance={0} />

      {/* <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <CommunicationToolsCard />
            <SocialMediaMarketplaceCard />
            <BillPaymentsCard />
          </div> */}
    </main>
  );
};

export default DashboardContent;
