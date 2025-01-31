import DefaultLayout from "@/components/Layouts/DefaultLayout";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import Analytics from "@/components/Automation/Analytics";
import CrawlForm from "@/components/Automation/CrawlForm";

const AutomationPage = () => {
  return (
    <DefaultLayout>
      <Breadcrumb pageName="Automation" />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Crawl Form Section */}
        <div className="rounded-sm border border-stroke bg-white p-4 shadow-default dark:border-strokedark dark:bg-boxdark">
          <h2 className="mb-4 text-xl font-semibold text-black dark:text-white">
            Start a New Crawl
          </h2>
          <CrawlForm />
        </div>

        {/* Analytics Section */}
        <div className="rounded-sm border border-stroke bg-white p-4 shadow-default dark:border-strokedark dark:bg-boxdark">
          <h2 className="mb-4 text-xl font-semibold text-black dark:text-white">
            Crawl Analytics
          </h2>
          <Analytics />
        </div>
      </div>
    </DefaultLayout>
  );
};

export default AutomationPage;