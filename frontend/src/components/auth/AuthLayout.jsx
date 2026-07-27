import { useLocation, Outlet } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

export default function AuthLayout() {
  const location = useLocation();

  // Determina a direção do efeito de slide (Login -> Registar: slide para a esquerda; Registar -> Login: slide para a direita)
  const isRegistering = location.pathname === '/registar';

  const slideVariants = {
    initial: {
      opacity: 0,
      x: isRegistering ? 40 : -40,
      scale: 0.98
    },
    animate: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: [0.25, 0.8, 0.25, 1]
      }
    },
    exit: {
      opacity: 0,
      x: isRegistering ? -40 : 40,
      scale: 0.98,
      transition: {
        duration: 0.25,
        ease: [0.25, 0.8, 0.25, 1]
      }
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        variants={slideVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
      >
        <Outlet />
      </motion.div>
    </AnimatePresence>
  );
}
