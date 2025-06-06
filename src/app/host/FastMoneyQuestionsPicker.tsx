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

export default function FastMoneyQuestionsPicker() {
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

  const checkBoxesDisabled = pickedQuestions.length === FAST_MONEY_QUESTIONS;
  const submitDisabled = pickedQuestions.length !== FAST_MONEY_QUESTIONS;

  return (
    <Box>
      <Box>
        <Typography>Pick {FAST_MONEY_QUESTIONS} questions...</Typography>
        {storedQuestions.map(({ questionText, answers, comment }) => {
          const checked = pickedQuestions.includes(questionText);
          return (
            <Box
              key={questionText}
              display="flex"
              alignItems="center"
              gap={2}
              mb={1}
            >
              <Box flex={4}>
                <Typography>{questionText}</Typography>
              </Box>
              <Box
                flex={1}
                sx={{ fontSize: "small", "& > *": { fontSize: "inherit" } }}
              >
                <Typography>({comment})</Typography>
                <Typography>{answers.length} answers</Typography>
              </Box>
              <Box>
                <FormControlLabel
                  disabled={checkBoxesDisabled && !checked}
                  control={
                    <Checkbox
                      checked={checked}
                      onChange={(e) =>
                        onQuestionChecked(questionText, e.target.checked)
                      }
                    />
                  }
                  label="Pick"
                />
              </Box>
            </Box>
          );
        })}
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
