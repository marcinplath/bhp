import React from "react";

const GuestLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="p-4 bg-blue-600 text-white text-center font-bold">
        Test BHP
      </header>
      <main className="p-4">{children}</main>
    </div>
  );
};

export default GuestLayout;
