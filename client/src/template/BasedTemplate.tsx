import React, { useEffect } from "react";
import {
  motion,
  AnimatePresence,
  useViewportScroll,
  useAnimation,
} from "framer-motion";
import styled from "styled-components";
import { useRecoilValue } from "recoil";
import { darkModeState } from "../states/darkmode";
interface IBasedTemplate {
  header: object;
  container: object;
}

function BasedTemplate({ header, container }: IBasedTemplate) {
  const headerAnimation = useAnimation();
  const { scrollY } = useViewportScroll();
  const isDark = useRecoilValue(darkModeState);
  useEffect(() => {
    scrollY.onChange(() => {
      if (scrollY.get() < 50) {
        headerAnimation.start("init");
      } else {
        headerAnimation.start("scroll");
      }
    });
  }, [scrollY, headerAnimation]);
  const headerVariants = {
    init: {
      backgroundColor: "rgba(0, 0, 0, 0)",
      boxShadow: "0px 2px 2px rgba(0, 0, 0, 0)",
    },
    scroll: {
      boxShadow: "0px 2px 2px rgba(0, 0, 0, 0.1)",
      backgroundColor: isDark ? "rgba(0, 0, 0, 1)" : "rgba(255, 255, 255, 1)",
      transition: {
        duration: 0.3,
        type: "linear",
      },
    },
  };
  return (
    <AnimatePresence>
      <STemplate
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <SHeader variants={headerVariants} animate={headerAnimation}>
          {header}
        </SHeader>
        <SContainer>{container}</SContainer>
      </STemplate>
    </AnimatePresence>
  );
}

export default BasedTemplate;

export const STemplate = styled(motion.div)`
  padding-inline: 1rem;
  @media screen and (min-width: 1100px) {
    padding-inline: 5rem;
  }
`;
export const SContainer = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-inline: 1rem;
  @media screen and (min-width: 1100px) {
    padding: 2rem 20rem;
  }
  margin-top: 15vh;
`;
export const SHeader = styled(motion.div)`
  display: flex;
  flex-direction: row;
  align-items: center;
  position: fixed;
  padding-inline: 3rem;
  background-color: transparent;
  left: 0;
  top: 0;
  height: 10vh;
  width: 100vw;
  z-index: 1;

  justify-content: space-between;
  span,
  div {
    background-color: transparent;
  }
`;
