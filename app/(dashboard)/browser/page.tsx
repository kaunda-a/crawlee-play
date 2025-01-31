import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import BrowserProfileLauncher from "@/components/BrowserProfile/profile";

export const metadata: Metadata = {
  title: "Next.js Browser Profiles | TailAdmin - Next.js Dashboard Template",
  description:
    "This is Next.js Browser Profiles page for TailAdmin  Tailwind CSS Admin Dashboard Template",
};

const BrowserProfilesPage = () => {
  return (
    <DefaultLayout>
      <BrowserProfileLauncher />
    </DefaultLayout>
  );
};

export default BrowserProfilesPage;