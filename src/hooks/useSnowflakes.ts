import { useEffect } from "react";

export default function useSnowflakes() {
  useEffect(() => {
    const styleElement = document.createElement("style");
    styleElement.textContent = `
      @keyframes snowfall {
        0% {
          transform: translateY(-10vh) translateX(-20px) rotate(0deg);
        }
        50% {
          transform: translateY(50vh) translateX(20px) rotate(180deg);
        }
        100% {
          transform: translateY(100vh) translateX(-20px) rotate(360deg);
        }
      }

      .snow {
        animation: snowfall 5s linear infinite;
        clip-path: polygon(
          50% 0%,
          65% 25%,
          100% 50%,
          65% 75%,
          50% 100%,
          35% 75%,
          0% 50%,
          35% 25%
        );
      }

      .snow-container {
        perspective: 50px;
      }
    `;

    document.head.appendChild(styleElement);

    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);
}
