import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../store/hooks";
import { toast } from "react-hot-toast";

const LoginRedirectHandler = () => {
  const navigate = useNavigate();
  const { user, isCheckingAuth } = useAppSelector((state) => state.auth);
  const toastShown = useRef(false); // prevent infinite toast loops

  useEffect(() => {
    if (isCheckingAuth || !user) return;

    // show toast once
    if (!toastShown.current) {
      toast.success(`Welcome back, ${user.name}`);
      toastShown.current = true;
    }

    // redirect based on role
    switch (user.role.toLowerCase()) {
      case "superadmin":
        navigate("/super-admin", { replace: true });
        break;
      case "admin":
        navigate("/admin/dashboard", { replace: true });
        break;
      default:
        navigate("/user/dashboard", { replace: true });
    }
  }, [user, isCheckingAuth, navigate]);

  return null;
};

export default LoginRedirectHandler;
