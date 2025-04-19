import { useEffect, useRef, useState } from "react";
import { Box, Typography, CircularProgress } from "@mui/material";

interface CircularCountdownOverlayProps {
  seconds: number;
  onComplete?: () => void;
}

const CircularCountdownOverlay: React.FC<CircularCountdownOverlayProps> = ({
  seconds,
  onComplete,
}) => {
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (seconds <= 0) return;

    setTimeLeft(seconds);
    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          setTimeout(() => {
            onComplete?.();
          }, 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [seconds, onComplete]);

  const progress = ((seconds - timeLeft) / seconds) * 100;

  if (timeLeft <= 0) return null;

  return (
    <Box
      position="absolute"
      top={0}
      left={0}
      width="100%"
      height="100%"
      bgcolor="rgba(0,0,0,0.5)"
      zIndex={10}
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <Box position="relative" width={120} height={120}>
        <CircularProgress
          variant="determinate"
          value={100}
          size={120}
          sx={{ color: "grey.300", position: "absolute" }}
        />
        <CircularProgress
          variant="determinate"
          value={100 - progress}
          size={120}
          sx={{
            color: timeLeft <= 3 ? "error.main" : "primary.main",
            transition: "all 0.3s ease",
          }}
        />
        <Box
          top={0}
          left={0}
          bottom={0}
          right={0}
          position="absolute"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Typography
            variant="h4"
            fontWeight="bold"
            color={timeLeft <= 3 ? "error.main" : "white"}
          >
            {timeLeft}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default CircularCountdownOverlay;
