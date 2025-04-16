"use client";
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Typography,
} from "@mui/material";
import questions from "@/shared/questions.json";
import type { StoredQuestion } from "@/shared/types";
import useSocket from "@/hooks/useSocket";
import { useState } from "react";
import { FAST_MONEY_QUESTIONS } from "@/shared/utils";
const storedQuestions: StoredQuestion[] = questions;

export default function GameModePicker() {
  const socket = useSocket();
  const [pickedQuestions, setPickedQuestions] = useState<string[]>([]);

  const onSubmit = () =>
    socket?.emit("fastMoney:questionsPicked", pickedQuestions);

  const onQuestionChecked = (questionText: string, checked: boolean) => {
    if (checked) {
      setPickedQuestions((prev) => [...prev, questionText]);
    } else {
      setPickedQuestions((prev) => prev.filter((q) => q !== questionText));
    }
  };

  const submitDisabled = pickedQuestions.length !== FAST_MONEY_QUESTIONS;

  return (
    <Box>
      <Box>
        <Typography>Pick 5 questions...</Typography>
        {storedQuestions.map(({ questionText, answers }) => (
          <Box
            key={questionText}
            display="flex"
            alignItems="center"
            gap={2}
            mb={1}
          >
            <Box flex={4}>{questionText}</Box>
            <Box flex={1}>{answers.length} answers</Box>
            <Box>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={pickedQuestions.includes(questionText)}
                    onChange={(e) =>
                      onQuestionChecked(questionText, e.target.checked)
                    }
                  />
                }
                label="Pick"
              />
            </Box>
          </Box>
        ))}
      </Box>
      <Box pt={2}>
        <Button
          variant="contained"
          color="primary"
          onClick={onSubmit}
          disabled={submitDisabled}
        >
          Submit
        </Button>
      </Box>
    </Box>
  );
}
