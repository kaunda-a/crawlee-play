'use client';

import React, { useState } from "react";
import Breadcrumb from "../Breadcrumbs/Breadcrumb";

const BrowserProfile = () => {
  const [profiles, setProfiles] = useState([]);
  const [selectedProfile, setSelectedProfile] = useState(null);

  const handleCreateProfile = async () => {
    // Implement the logic to create a new browser profile
    // Example:
    // const newProfile = await createBrowserProfile();
    // setProfiles([...profiles, newProfile]);
  };

  return (
    <div className="mx-auto max-w-7xl">
      <Breadcrumb pageName="Browser Profiles" />

      <div className="w-full max-w-full rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="p-4">
          <button
            onClick={handleCreateProfile}
            className="mb-4 rounded bg-primary px-4 py-2 text-white hover:bg-primary-dark"
          >
            Create New Profile
          </button>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {profiles.map((profile) => (
              <div
                key={profile}
                className="cursor-pointer rounded border border-stroke p-4 transition duration-500 hover:bg-gray dark:border-strokedark dark:hover:bg-meta-4"
                onClick={() => (profile)}
              >
                <h3 className="text-lg font-semibold text-black dark:text-white">
                  {profile}
                </h3>
                <p className="text-sm text-black dark:text-white">
                  {profile}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrowserProfile;