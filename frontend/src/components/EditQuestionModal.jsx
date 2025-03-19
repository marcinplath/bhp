import { useState } from "react";

const EditQuestionModal = ({ question, onClose, onSave }) => {
  const [editedQuestion, setEditedQuestion] = useState({
    question_text: question?.question_text || "",
    option_a: question?.option_a || "",
    option_b: question?.option_b || "",
    option_c: question?.option_c || "",
    correct_option: question?.correct_option || "A",
  });

  const handleChange = (e) => {
    setEditedQuestion({
      ...editedQuestion,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = () => {
    onSave(question.id, editedQuestion);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white w-full max-w-lg mx-4 p-6 rounded shadow-lg">
        <h3 className="text-xl font-semibold mb-4">Edytuj pytanie</h3>
        <div className="flex flex-col gap-2 mb-4">
          <input
            type="text"
            name="question_text"
            value={editedQuestion.question_text}
            onChange={handleChange}
            placeholder="Treść pytania"
            className="border rounded p-2 w-full"
          />
          <input
            type="text"
            name="option_a"
            value={editedQuestion.option_a}
            onChange={handleChange}
            placeholder="Odpowiedź A"
            className="border rounded p-2 w-full"
          />
          <input
            type="text"
            name="option_b"
            value={editedQuestion.option_b}
            onChange={handleChange}
            placeholder="Odpowiedź B"
            className="border rounded p-2 w-full"
          />
          <input
            type="text"
            name="option_c"
            value={editedQuestion.option_c}
            onChange={handleChange}
            placeholder="Odpowiedź C"
            className="border rounded p-2 w-full"
          />
          <select
            name="correct_option"
            value={editedQuestion.correct_option}
            onChange={handleChange}
            className="border rounded p-2 w-full"
          >
            <option value="A">A</option>
            <option value="B">B</option>
            <option value="C">C</option>
          </select>
        </div>
        <div className="flex justify-end gap-3">
          <button
            onClick={handleSubmit}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            Zapisz
          </button>
          <button
            onClick={onClose}
            className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded"
          >
            Anuluj
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditQuestionModal;
