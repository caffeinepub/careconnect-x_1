import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import AppLayout from "./components/layout/AppLayout";
import AdminPage from "./pages/AdminPage";
import AuthPage from "./pages/AuthPage";
import CommunityPage from "./pages/CommunityPage";
import CostComparisonPage from "./pages/CostComparisonPage";
import DashboardPage from "./pages/DashboardPage";
import DoctorBookingPage from "./pages/DoctorBookingPage";
import EmergencyPage from "./pages/EmergencyPage";
import FirstAidPage from "./pages/FirstAidPage";
import MedicalRecordsPage from "./pages/MedicalRecordsPage";
import MedicineDeliveryPage from "./pages/MedicineDeliveryPage";
import SymptomCheckerPage from "./pages/SymptomCheckerPage";

const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

const authRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: AuthPage,
});

const layoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "app-layout",
  component: AppLayout,
});

const dashboardRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/dashboard",
  component: DashboardPage,
});

const symptomsRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/symptoms",
  component: SymptomCheckerPage,
});

const costsRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/costs",
  component: CostComparisonPage,
});

const doctorsRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/doctors",
  component: DoctorBookingPage,
});

const communityRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/community",
  component: CommunityPage,
});

const emergencyRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/emergency",
  component: EmergencyPage,
});

const recordsRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/records",
  component: MedicalRecordsPage,
});

const firstAidRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/first-aid",
  component: FirstAidPage,
});

const medicineRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/medicine",
  component: MedicineDeliveryPage,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: AdminPage,
});

const routeTree = rootRoute.addChildren([
  authRoute,
  layoutRoute.addChildren([
    dashboardRoute,
    symptomsRoute,
    costsRoute,
    doctorsRoute,
    communityRoute,
    emergencyRoute,
    recordsRoute,
    firstAidRoute,
    medicineRoute,
  ]),
  adminRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <div style={{ minHeight: "100vh" }}>
      <RouterProvider router={router} />
    </div>
  );
}
