import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

// Public Pages
import Home from "@/pages/Home";
import About from "@/pages/About";
import Achievements from "@/pages/Achievements";
import Panels from "@/pages/Panels";
import Departments from "@/pages/Departments";
import Membership from "@/pages/Membership";
import Contact from "@/pages/Contact";
import Search from "@/pages/Search";
import ThankYou from "@/pages/ThankYou";

// Admin Pages
import Dashboard from "@/pages/admin/Dashboard";
import ManageAnnouncements from "@/pages/admin/ManageAnnouncements";
import ManagePanels from "@/pages/admin/ManagePanels";
import ManageAchievements from "@/pages/admin/ManageAchievements";
import ManageDepartments from "@/pages/admin/ManageDepartments";
import ManageRegistrations from "@/pages/admin/ManageRegistrations";
import ManageMedia from "@/pages/admin/ManageMedia";
import Login from "@/pages/Login";

// New Pages
import Media from "@/pages/Media";
import ElectionPanel from "@/pages/ElectionPanel";

function Router() {
  return (
    <Switch>
      {/* Public Routes */}
      <Route path="/" component={Home} />
      <Route path="/about" component={About} />
      <Route path="/achievements" component={Achievements} />
      <Route path="/panels" component={Panels} />
      <Route path="/departments" component={Departments} />
      <Route path="/membership" component={Membership} />
      <Route path="/index.php/new-registration-2/" component={Membership} />
      <Route path="/media" component={Media} />
      <Route path="/election-panel" component={ElectionPanel} />
      <Route path="/contact" component={Contact} />
      <Route path="/search" component={Search} />
      <Route path="/thank-you" component={ThankYou} />

      {/* Admin Routes */}
      <Route path="/admin/dashboard" component={Dashboard} />
      <Route path="/admin/announcements" component={ManageAnnouncements} />
      <Route path="/admin/panels" component={ManagePanels} />
      <Route path="/admin/achievements" component={ManageAchievements} />
      <Route path="/admin/media" component={ManageMedia} />
      <Route path="/admin/departments" component={ManageDepartments} />
      <Route path="/admin/registrations" component={ManageRegistrations} />

      {/* Login Route */}
      <Route path="/login" component={Login} />

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
