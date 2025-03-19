import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchTest, submitTestAnswers } from "../api/tests";

const TestPage = () => {
  const { link } = useParams();
  const [testData, setTestData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Przechowujemy odpowiedzi w obiekcie: { [questionId]: "A" | "B" | "C" }
  const [answers, setAnswers] = useState({});
  // Wynik przesłania testu – komunikat oraz lista błędnych pytań (jeśli test niezaliczony)
  const [submissionResult, setSubmissionResult] = useState(null);
  const [incorrectQuestions, setIncorrectQuestions] = useState([]);

  useEffect(() => {
    const loadTest = async () => {
      const data = await fetchTest(link);
      if (data.error) {
        setError(data.error);
      } else {
        setTestData(data.test);
      }
      setLoading(false);
    };
    loadTest();
  }, [link]);

  const handleOptionChange = (questionId, selectedOption) => {
    setAnswers((prev) => ({ ...prev, [questionId]: selectedOption }));
  };

  const handleSubmit = async () => {
    // Resetujemy poprzedni wynik
    setSubmissionResult(null);
    setIncorrectQuestions([]);

    // 1. Walidacja lokalna – czy na pewno każda odpowiedź została wybrana?
    const totalQuestions = testData.length;
    const answeredCount = Object.keys(answers).length; // ile pytań ma w ogóle zaznaczone odpowiedzi

    if (answeredCount < totalQuestions) {
      // Wyświetlamy osobny komunikat o brakujących odpowiedziach
      setSubmissionResult({
        error: `Nie zaznaczono odpowiedzi na wszystkie pytania (odpowiedzi: ${answeredCount}/${totalQuestions}).`,
      });
      return;
    }

    // 2. Wysyłamy żądanie do backendu
    const result = await submitTestAnswers(link, answers);

    if (result.error) {
      setSubmissionResult({ error: result.error });
    } else if (
      result.incorrectQuestions &&
      result.incorrectQuestions.length > 0
    ) {
      setSubmissionResult({ message: result.message });
      setIncorrectQuestions(result.incorrectQuestions);
    } else {
      setSubmissionResult({
        message: result.message,
        accessCode: result.accessCode,
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-lg">
        Ładowanie testu...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen text-lg text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-center">Test BHP</h1>

      {submissionResult && submissionResult.error && (
        <div className="bg-red-200 text-red-800 p-2 mb-4 text-center rounded">
          {submissionResult.error}
        </div>
      )}

      {submissionResult && submissionResult.message && (
        <div
          className={`p-2 mb-4 text-center rounded ${
            incorrectQuestions.length === 0
              ? "bg-green-200 text-green-800"
              : "bg-yellow-200 text-yellow-800"
          }`}
        >
          {submissionResult.message}
          {submissionResult.accessCode && (
            <div className="mt-2 font-semibold">
              Kod dostępu: {submissionResult.accessCode}
            </div>
          )}
        </div>
      )}

      <form>
        {testData.map((question, index) => (
          <div
            key={question.id}
            className={`mb-6 p-4 border rounded ${
              incorrectQuestions.includes(question.id)
                ? "border-red-500"
                : "border-gray-300"
            }`}
          >
            <div className="mb-2">
              <span className="font-bold mr-2">{index + 1}.</span>
              <span>{question.question_text}</span>
            </div>
            <div className="flex flex-col space-y-2">
              {["A", "B", "C"].map((option) => (
                <label key={option} className="flex items-center">
                  <input
                    type="radio"
                    name={`question-${question.id}`}
                    value={option}
                    checked={answers[question.id] === option}
                    onChange={() => handleOptionChange(question.id, option)}
                    className="mr-2"
                  />
                  <span>
                    {option}. {question[`option_${option.toLowerCase()}`]}
                  </span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </form>

      {/* Wyświetlamy przycisk tylko, jeśli test nie został zaliczony (brak accessCode) */}
      {(!submissionResult || !submissionResult.accessCode) && (
        <button
          type="button"
          onClick={handleSubmit}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
        >
          Zatwierdź test
        </button>
      )}
    </div>
  );
};

export default TestPage;
