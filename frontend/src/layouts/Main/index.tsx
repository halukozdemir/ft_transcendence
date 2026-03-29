import type { ReactNode } from "react";
import { dashboardThemeVars } from "../../constants/appColors";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <div
      className="flex h-screen flex-col overflow-hidden bg-bg text-slate-100"
      style={dashboardThemeVars}
    >
      <Navbar />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto h-full w-full max-w-360">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
