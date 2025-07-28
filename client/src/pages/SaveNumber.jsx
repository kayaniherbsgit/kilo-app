import { useEffect } from "react";

const SaveNumber = () => {
  useEffect(() => {
    // Instantly redirect to the vCard file
    window.location.href = "/kayanicontact.vcf";
  }, []);

  return null; // Nothing shows, just redirects
};

export default SaveNumber;
