
import { useState, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
}

const AdminLayout = ({ children, title }: AdminLayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = () => {
    // This will be replaced with actual Supabase logout logic
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    });
    navigate("/login");
  };

  return (
    <div className="h-screen flex bg-admin-background text-gray-800">
      {/* Sidebar */}
      <div
        className={`bg-admin-primary text-white ${
          isSidebarOpen ? "w-64" : "w-20"
        } transition-all duration-300 flex flex-col`}
      >
        <div className="p-4 flex items-center justify-between">
          {isSidebarOpen ? (
            <h1 className="font-bold text-xl">Admin Portal</h1>
          ) : (
            <h1 className="font-bold text-xl">AP</h1>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="text-white hover:bg-admin-secondary"
          >
            {isSidebarOpen ? "←" : "→"}
          </Button>
        </div>
        <Separator />
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            <li>
              <Button
                variant="ghost"
                className={`w-full justify-start text-white hover:bg-admin-secondary ${
                  isSidebarOpen ? "" : "justify-center"
                }`}
                onClick={() => navigate("/dashboard")}
              >
                <span className="mr-2">📋</span>
                {isSidebarOpen && "Dashboard"}
              </Button>
            </li>
          </ul>
        </nav>
        <div className="p-4">
          <Button
            variant="ghost"
            className={`w-full justify-start text-white hover:bg-admin-secondary ${
              isSidebarOpen ? "" : "justify-center"
            }`}
            onClick={handleLogout}
          >
            <span className="mr-2">🚪</span>
            {isSidebarOpen && "Logout"}
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="px-6 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-admin-primary">{title}</h1>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="rounded-full h-10 w-10">
                  👤
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
