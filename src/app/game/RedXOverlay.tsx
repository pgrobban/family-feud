import { Box, Typography } from "@mui/material";

export default function RedXOverlay({ count }: { count: number }) {
  return (
    <Box
      sx={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        display: count > 0 ? "flex" : "none",
        justifyContent: "center",
        alignItems: "center",
        gap: "2vw",
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        zIndex: 10,
        animation: count > 0 ? "fadeInOut 1.8s ease-in-out" : "none",
        pointerEvents: "none",
      }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <Typography
          key={i}
          sx={{
            fontSize: "20vw",
            fontWeight: "bold",
            color: "red",
            textShadow: "2px 2px 8px black",
          }}
        >
          X
        </Typography>
      ))}

      <style>
        {`
          @keyframes fadeInOut {
            0% { opacity: 0; }
            10% { opacity: 1; }
            80% { opacity: 1; }
            100% { opacity: 0; }
          }
          `}
      </style>
    </Box>
  );
}
