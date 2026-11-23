import { Navigate, Route, Routes } from "react-router-dom"

import { AppLayout } from "@/layouts/AppLayout"
import { SettingsLayout } from "@/layouts/SettingsLayout"
import { AccountPage } from "@/pages/account"
import { ForgotPage } from "@/pages/forgot"
import { GithubSettingsPage } from "@/pages/github"
import { GithubCallbackPage } from "@/pages/github-callback"
import { HomePage } from "@/pages/home"
import { LoginPage } from "@/pages/login"
import { NotFound } from "@/pages/not-found"
import { ProjectPage } from "@/pages/project"
import { ProjectSettingsPage } from "@/pages/project-settings"
import { RegisterPage } from "@/pages/register"
import { ResetPage } from "@/pages/reset"
import { TicketPage } from "@/pages/ticket"
import { VerifyPage } from "@/pages/verify"

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/verify" element={<VerifyPage />} />
      <Route path="/forgot" element={<ForgotPage />} />
      <Route path="/reset" element={<ResetPage />} />
      <Route element={<AppLayout />}>
        <Route index element={<HomePage />} />
        <Route path="account" element={<Navigate to="/settings/account" replace />} />
        <Route path="settings" element={<SettingsLayout />}>
          <Route index element={<Navigate to="account" replace />} />
          <Route path="account" element={<AccountPage />} />
          <Route path="github" element={<GithubSettingsPage />} />
          <Route path="github/callback" element={<GithubCallbackPage />} />
        </Route>
        <Route path="projects/:slug" element={<ProjectPage view="board" />} />
        <Route path="projects/:slug/settings" element={<ProjectSettingsPage />} />
        <Route path="projects/:slug/t/:key" element={<ProjectPage view="board" />} />
        <Route path="projects/:slug/tickets/:key" element={<TicketPage />} />
        <Route path="projects/:slug/list" element={<ProjectPage view="list" />} />
        <Route path="projects/:slug/list/t/:key" element={<ProjectPage view="list" />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
