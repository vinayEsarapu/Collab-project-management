import {
  BrowserRouter,
  Routes,
  Route,
  Outlet,
} from "react-router-dom";

import Navbar from "./components/Navbar";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import CreateProject from "./pages/Createprojects";
import ProtectedRoute from "./components/ProtectedRoute";
import GuestRoute from "./pages/GuestRoute";
import ProjectDetails from "./pages/Projectdetails";
import Issues from "./pages/issues";
import IssueDetails from "./pages/issueDetails";
import Projects from "./pages/Projects";
import Home from "./pages/Home";
import Activity from "./pages/Activity";
import Comments from "./pages/Comments";
import ProjectActivity from "./pages/ProjectActivity";
import ProjectComments from "./pages/ProjectComments";
import Tasks from "./pages/Tasks";
import TaskDetails from "./pages/TaskDetails";
import TaskIssues from "./Pages/TaskIssues";
import Profile from "./pages/Profile";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import VerifyEmail from "./pages/VerifyEmail";

function ProtectedLayout() {
  return (
    <>
      <Navbar />

      <main>
        <Outlet />
      </main>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* =========================
            PUBLIC ROUTES
        ========================= */}

        <Route path="/" element={<Home />} />

        {/* =========================
            GUEST-ONLY ROUTES
        ========================= */}

        <Route element={<GuestRoute />}>
          <Route
            path="/register"
            element={<Register />}
          />

          <Route
            path="/login"
            element={<Login />}
          />
        </Route>

         <Route
    path="/forgot-password"
    element={<ForgotPassword />}
  />

  <Route
  path="/reset-password/:token"
  element={<ResetPassword />}
/>

<Route
  path="/verify-email/:token"
  element={<VerifyEmail />}
/>


        {/* =========================
            PROTECTED ROUTES
        ========================= */}

        <Route element={<ProtectedRoute />}>

          {/* Protected Layout */}
          <Route element={<ProtectedLayout />}>

            <Route
              path="/dashboard"
              element={<Dashboard />}
            />

            <Route
              path="/projects"
              element={<Projects />}
            />

            <Route
              path="/projects/new"
              element={<CreateProject />}
            />

            {/* =========================
                PROFILE
            ========================= */}

            <Route
              path="/profile"
              element={<Profile />}
            />

            {/* =========================
                PROJECT
            ========================= */}

            <Route
              path="/projects/:id"
              element={<ProjectDetails />}
            />

            {/* =========================
                TASKS
            ========================= */}

            <Route
              path="/projects/:id/tasks"
              element={<Tasks />}
            />

            <Route
              path="/projects/:id/tasks/:taskId"
              element={<TaskDetails />}
            />

            {/* =========================
                TASK ISSUES
            ========================= */}

            <Route
              path="/projects/:id/tasks/:taskId/issues"
              element={<TaskIssues />}
            />

            <Route
              path="/projects/:id/tasks/:taskId/issues/new"
              element={<TaskIssues />}
            />

            <Route
              path="/projects/:id/tasks/:taskId/issues/:issueId"
              element={<IssueDetails />}
            />

            <Route
              path="/projects/:id/tasks/:taskId/issues/:issueId/comments"
              element={<Comments />}
            />

            <Route
              path="/projects/:id/tasks/:taskId/issues/:issueId/activity"
              element={<Activity />}
            />

            <Route
              path="/projects/:id/tasks/:taskId/comments"
              element={<Comments />}
            />

            <Route
              path="/projects/:id/tasks/:taskId/activity"
              element={<Activity />}
            />

            {/* =========================
                PROJECT ACTIVITY
            ========================= */}

            <Route
              path="/projects/:id/activity"
              element={<ProjectActivity />}
            />

            {/* =========================
                PROJECT ISSUES
            ========================= */}

            <Route
              path="/projects/:id/issues"
              element={<Issues />}
            />

            <Route
              path="/projects/:id/issues/:issueId"
              element={<IssueDetails />}
            />

            <Route
              path="/projects/:id/issues/:issueId/activity"
              element={<Activity />}
            />

            <Route
              path="/projects/:id/issues/:issueId/comments"
              element={<Comments />}
            />

            {/* =========================
                PROJECT COMMENTS
            ========================= */}

            <Route
              path="/projects/:id/comments"
              element={<ProjectComments />}
            />

          </Route>
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;