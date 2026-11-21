import HeroSection from './home/HeroSection';
import AboutSection from './home/AboutSection';
import FacilitiesSection from './home/FacilitiesSection';
import CafeSection from './home/CafeSection';
import MembershipPreview from './home/MembershipPreview';
import TrialSection from './home/TrialSection';

/**
 * Public landing page. Composed from focused section components — the page file
 * itself stays small and easy to reorder.
 */
export default function Home() {
  return (
    <>
      <HeroSection />
      <AboutSection />
      <FacilitiesSection limit={6} />
      <CafeSection />
      <MembershipPreview />
      <TrialSection />
    </>
  );
}
