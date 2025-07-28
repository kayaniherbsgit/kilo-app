import { useEffect } from "react";

const SaveNumber = () => {
  useEffect(() => {
    // Instantly open/download the vCard file
    window.location.replace("/kayanicontact.vcf");
  }, []);

  // Nothing to show (no UI)
  return null;
};

export default SaveNumber;
