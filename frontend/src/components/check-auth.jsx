import { Navigate, useLocation } from "react-router-dom";

function CheckAuth({ isAuthenticated, user, children }) {
  const location = useLocation();

  if (location.pathname === "/") {
    if (!isAuthenticated) {
      return <Navigate to="/login" />;
    } else {
      // When authenticated and on "/", render children (HomePage)
      return <>{children}</>;
    }
  }

  if (
    !isAuthenticated &&
    !(
      location.pathname.includes("/login") ||
      location.pathname.includes("/signup")
    )
  ) {
    return <Navigate to="/login" />;
  }

  if (
    isAuthenticated &&
    (location.pathname.includes("/login") ||
      location.pathname.includes("/signup"))
  ) {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
}

export default CheckAuth;
