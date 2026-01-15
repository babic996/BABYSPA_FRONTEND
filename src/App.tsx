import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout/Layout";
import HomePage from "./pages/HomePage/HomePage";
import BabyPage from "./pages/BabyPage/BabyPage";
import ArrangementPage from "./pages/ArrangementPage/ArrangementPage";
import { ToastContainer } from "react-toastify";
import ServicePackagePage from "./pages/ServicePackagePage/ServicePackagePage";
import { FilterProvider } from "./context/Filter/FilterProvider";
import ReportPage from "./pages/ReportPage/ReportPage";
import { AuthProvider } from "./context/Auth/AuthProvider";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginComponent from "./components/LoginComponent/LoginComponent";
import { ROLES } from "./util/const";
import NotAuthorizedPage from "./pages/NotAuthorizedPage/NotAuthorizedPage";
import PageNotFound from "./pages/PageNotFound/PageNotFound";
import { ConfigProvider as ConfigProviderMobile } from "antd-mobile";
import enUS from "antd-mobile/es/locales/en-US";
import SettingsPage from "./pages/SettingsPage/SettingsPage";
import { ConfigProvider as AntdConfigProvider } from "antd";
import srRS from "antd/es/locale/sr_RS";
import enUSAntd from "antd/es/locale/en_US";
import { useTranslation } from "react-i18next";

function App() {
  const { i18n } = useTranslation();
  const currentLocale = i18n.language === "en" ? enUSAntd : srRS;

  return (
    <AntdConfigProvider locale={currentLocale}>
      <ConfigProviderMobile locale={enUS}>
        <AuthProvider>
          <ToastContainer />
          <FilterProvider>
            <Router>
              <Routes>
                <Route path="/login" element={<LoginComponent />} />

                {/* ProtectedRoute samo za token / autentikaciju */}
                <Route
                  path="/*"
                  element={
                    <ProtectedRoute allowedRoles={[]}>
                      <Layout />
                    </ProtectedRoute>
                  }
                >
                  <Route
                    index
                    element={
                      <ProtectedRoute
                        allowedRoles={[
                          ROLES.ADMIN,
                          ROLES.SUPER_ADMIN,
                          ROLES.RESERVATION_MAINTAINER,
                        ]}
                      >
                        <HomePage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="baby"
                    element={
                      <ProtectedRoute
                        allowedRoles={[
                          ROLES.ADMIN,
                          ROLES.SUPER_ADMIN,
                          ROLES.BABY_MAINTAINER,
                        ]}
                      >
                        <BabyPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="service-package"
                    element={
                      <ProtectedRoute
                        allowedRoles={[
                          ROLES.ADMIN,
                          ROLES.SUPER_ADMIN,
                          ROLES.SERVICE_PACKAGE_MAINTAINER,
                        ]}
                      >
                        <ServicePackagePage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="arrangement"
                    element={
                      <ProtectedRoute
                        allowedRoles={[
                          ROLES.ADMIN,
                          ROLES.SUPER_ADMIN,
                          ROLES.ARRANGEMENT_MAINTAINER,
                        ]}
                      >
                        <ArrangementPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="report"
                    element={
                      <ProtectedRoute
                        allowedRoles={[
                          ROLES.ADMIN,
                          ROLES.SUPER_ADMIN,
                          ROLES.REPORT_OVERVIEW,
                        ]}
                      >
                        <ReportPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="settings"
                    element={
                      <ProtectedRoute
                        allowedRoles={[ROLES.ADMIN, ROLES.SUPER_ADMIN]}
                      >
                        <SettingsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="not-authorized" element={<NotAuthorizedPage />} />
                  <Route path="*" element={<PageNotFound />} />
                </Route>
              </Routes>
            </Router>
          </FilterProvider>
        </AuthProvider>
      </ConfigProviderMobile>
    </AntdConfigProvider>
  );
}

export default App;
