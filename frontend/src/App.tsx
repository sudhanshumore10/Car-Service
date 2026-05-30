import { useEffect, useState } from "react";
import AppRoutes from "./routes/AppRoutes";
import "./App.css";



// function App() {
//   return (
//     <>
//     <h1>Hi, Welcome</h1>
//     </>
//   );
// }
type PublicConfig = {
  applicationName?: string;
  brandPrimaryColor?: string;
  readOnlyMode?: boolean;
};

const normalizeStoredUser = () => {
  if (typeof window === "undefined") {
    return;
  }

  const raw = localStorage.getItem("user");
  if (!raw) {
    return;
  }

  try {
    const parsed = JSON.parse(raw) || {};
    const normalized = {
      ...parsed,
      userId: parsed.userId ?? parsed.id ?? null,
      id: parsed.id ?? parsed.userId ?? null,
      userType: parsed.userType ?? parsed.role ?? "",
      role: parsed.role ?? parsed.userType ?? "",
      phone: parsed.phone ?? parsed.phoneNo ?? "",
      phoneNo: parsed.phoneNo ?? parsed.phone ?? "",
    };

    if (JSON.stringify(normalized) !== raw) {
      localStorage.setItem("user", JSON.stringify(normalized));
    }
  } catch (error) {
    console.error("Failed to normalize stored user session", error);
    localStorage.removeItem("user");
  }
};

function App(){
  const [config, setConfig] = useState<PublicConfig | null>(null);
  const [sessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    normalizeStoredUser();
    setSessionReady(true);

    const loadPublicConfig = async () => {
      try {
        const response = await fetch("http://localhost:8765/api/v1/system/public-config");
        if (!response.ok) {
          return;
        }
        const data = await response.json();
        setConfig(data);
        if (data?.applicationName) {
          document.title = data.applicationName;
        }
        if (data?.brandPrimaryColor) {
          document.documentElement.style.setProperty("--brand-primary", data.brandPrimaryColor);
        }
      } catch (error) {
        console.error("Failed to load public config", error);
      }
    };

    loadPublicConfig();
  }, []);

  if (!sessionReady) {
    return null;
  }

  return (
    <>
      {config?.readOnlyMode && (
        <div className="app-read-only-banner">
          Read-only maintenance mode is active. Admin users can still manage the system.
        </div>
      )}
      <AppRoutes></AppRoutes>
    </>
  );
}
export default App;
