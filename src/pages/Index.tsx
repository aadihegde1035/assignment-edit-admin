import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const adminUser = localStorage.getItem('admin_user');
    if (adminUser) {
      // If we have an admin user in local storage, redirect to dashboard
      navigate("/dashboard");
    } else {
      // Otherwise redirect to login
      navigate("/login");
    }
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-admin-background">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Loading...</h1>
      </div>
    </div>
  );
};

export default Index;
