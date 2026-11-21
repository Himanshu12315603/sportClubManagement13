import { Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from './Navbar';
import Footer from './Footer';

/** Public marketing shell: sticky navbar + animated page region + footer. */
export default function PublicLayout() {
  const { pathname } = useLocation();
  return (
    <>
      <Navbar />
      <motion.main key={pathname} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.32 }}>
        <Outlet />
      </motion.main>
      <Footer />
    </>
  );
}
