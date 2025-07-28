import { useEffect } from "react";

const SaveNumber = () => {
  useEffect(() => {
    // ✅ Instantly open/download the vCard file (no ./public)
    window.location.replace("/kayanicontact.vcf");
  }, []);

  return null; // No UI, just redirect
};

export default SaveNumber;
