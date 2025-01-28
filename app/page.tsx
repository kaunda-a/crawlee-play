import { Metadata } from "next";
import Platform from "@/components/Dashboard/Platform";
import DefaultLayout from "@/components/Layouts/DefaultLayout";


export const metadata: Metadata = {
  title: "Crawlee",
  description: "Automation platform",
};

export default function Home() {
  return (
    <>
      <DefaultLayout>
        <Platform />
      </DefaultLayout>
    </>
  );
}
