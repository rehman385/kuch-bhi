import { useCallback } from "react";
import Particles from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import { Box } from "@chakra-ui/react";

const FloatingHearts = () => {
  const particlesInit = useCallback(async (engine) => {
    await loadSlim(engine);
  }, []);

  const particlesLoaded = useCallback(async (container) => {
    // console.log(container);
  }, []);

  return (
    <Box
      position="absolute"
      top={0}
      left={0}
      w="100%"
      h="100%"
      zIndex={0}
      pointerEvents="none"
    >
      <Particles
        id="tsparticles"
        init={particlesInit}
        loaded={particlesLoaded}
        options={{
          fullScreen: { enable: false, zIndex: 0 },
          particles: {
            number: {
              value: 20,
              density: {
                enable: true,
                value_area: 800,
              },
            },
            color: {
              value: ["#ff6b9d", "#ff8e53", "#a78bfa"],
            },
            shape: {
              type: ["circle", "star"],
            },
            opacity: {
              value: 0.6,
              random: true,
            },
            size: {
              value: { min: 3, max: 8 },
              random: true,
            },
            move: {
              enable: true,
              speed: 1,
              direction: "top",
              random: false,
              straight: false,
              out_mode: "out",
              bounce: false,
              attract: {
                enable: false,
                rotateX: 600,
                rotateY: 1200,
              },
            },
          },
          interactivity: {
            detect_on: "canvas",
            events: {
              onhover: {
                enable: true,
                mode: "bubble",
              },
              resize: true,
            },
            modes: {
              bubble: {
                distance: 200,
                size: 24,
                duration: 2,
                opacity: 0.8,
                speed: 3,
              },
            },
          },
          retina_detect: true,
        }}
        style={{ width: "100%", height: "100%" }}
      />
    </Box>
  );
};

export default FloatingHearts;

