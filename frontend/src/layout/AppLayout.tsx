import { SidebarProvider, useSidebar } from "@/context/SidebarContext";
import { cn } from "@/utils";
import { Outlet } from "react-router";
import AppHeader from "./AppHeader";
import AppSidebar from "./AppSidebar";
import Backdrop from "./Backdrop";

const LayoutContent: React.FC = () => {
  const { isExpanded, isHovered } = useSidebar();

  const sidebarWidthClass = isExpanded || isHovered ? "xl:pl-72" : "xl:pl-20";

  return (
    <div className="min-h-screen w-full bg-gray-50 dark:bg-gray-900 overflow-x-hidden">
      <AppSidebar />
      <Backdrop />

      <div
        className={cn(
          "flex flex-col min-h-screen w-full min-w-0 transition-all duration-300 ease-in-out",
          sidebarWidthClass
        )}
      >
        <AppHeader />
        <main className="flex-1 w-full min-w-0 p-4 sm:p-6 lg:p-7 transition-all duration-300 ease-in-out">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

const AppLayout: React.FC = () => {
  return (
    <SidebarProvider>
      <LayoutContent />
    </SidebarProvider>
  );
};

export default AppLayout;
