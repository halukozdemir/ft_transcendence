import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useAuth } from "../../context/authContext";

const OAuthCallbackPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setTokensFromOAuth } = useAuth();

  useEffect(() => {
    const access = searchParams.get("access");
    const refresh = searchParams.get("refresh");

    if (access && refresh) {
      setTokensFromOAuth(access, refresh).then(() => {
        navigate("/", { replace: true });
      });
    } else {
      navigate("/auth", { replace: true });
    }
  }, [searchParams, navigate, setTokensFromOAuth]);

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
      <p>Giriş yapılıyor...</p>
    </div>
  );
};

export default OAuthCallbackPage;
