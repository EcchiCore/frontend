"use client";

import NavbarLinks from "../../components/Navbar/NavbarLinks";

export default function NavbarWrapper() {
  return (
    <div className="fixed top-0 right-0 w-full flex justify-end p-4 bg-gradient-to-b from-black/50 to-transparent backdrop-blur-sm z-50">
      <NavbarLinks section="right" />
    </div>
  );
}