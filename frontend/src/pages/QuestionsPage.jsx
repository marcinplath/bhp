import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchQuestions,
  addQuestion,
  editQuestion,
  deleteQuestion,
} from "../api/questions";
import { useAuth } from "../context/AuthContext";
import EditQuestionModal from "../components/EditQuestionModal";
import ConfirmModal from "../components/ConfirmModal";

const AdminQuestions = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [newQuestion, setNewQuestion] = useState({
    question_text: "",
    option_a: "",
    option_b: "",
    option_c: "",
    correct_option: "A",
  });

  useEffect(() => {
    if (user && user.role !== "admin") {
      navigate("/unauthorized");
    }
  }, [user, navigate]);

  const loadQuestions = async () => {
    const data = await fetchQuestions();
    setQuestions(data.questions || []);
  };

  useEffect(() => {
    if (user) {
      loadQuestions();
    }
  }, [user]);

  const handleAddQuestion = async () => {
    const { question_text, option_a, option_b, option_c } = newQuestion;
    if (
      !question_text.trim() ||
      !option_a.trim() ||
      !option_b.trim() ||
      !option_c.trim()
    ) {
      alert("Wszystkie pola są wymagane!");
      return;
    }
    const success = await addQuestion(newQuestion);
    if (success) {
      setNewQuestion({
        question_text: "",
        option_a: "",
        option_b: "",
        option_c: "",
        correct_option: "A",
      });
      loadQuestions();
    } else {
      alert("Błąd dodawania pytania.");
    }
  };

  const handleSaveEdit = async (id, updatedQuestion) => {
    const success = await editQuestion(id, updatedQuestion);
    if (success) {
      setShowEditModal(false);
      loadQuestions();
    }
  };

  const handleDelete = async (id) => {
    const success = await deleteQuestion(id);
    if (success) {
      setShowDeleteModal(false);
      loadQuestions();
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
        <h2 className="text-2xl font-bold mb-2 sm:mb-0">Panel pytań</h2>
        <button
          className="border border-gray-300 px-4 py-1 rounded hover:bg-gray-100"
          onClick={() => navigate("/admin")}
        >
          ⬅ Powrót
        </button>
      </div>
      <div className="bg-white p-4 shadow rounded mb-6">
        <h3 className="text-lg font-semibold mb-2">Dodaj nowe pytanie</h3>
        <div className="flex flex-col sm:flex-row gap-2 mb-2">
          <input
            type="text"
            placeholder="Treść pytania"
            value={newQuestion.question_text}
            onChange={(e) =>
              setNewQuestion({ ...newQuestion, question_text: e.target.value })
            }
            className="border rounded p-2 flex-1"
          />
          <input
            type="text"
            placeholder="Odpowiedź A"
            value={newQuestion.option_a}
            onChange={(e) =>
              setNewQuestion({ ...newQuestion, option_a: e.target.value })
            }
            className="border rounded p-2 flex-1"
          />
          <input
            type="text"
            placeholder="Odpowiedź B"
            value={newQuestion.option_b}
            onChange={(e) =>
              setNewQuestion({ ...newQuestion, option_b: e.target.value })
            }
            className="border rounded p-2 flex-1"
          />
          <input
            type="text"
            placeholder="Odpowiedź C"
            value={newQuestion.option_c}
            onChange={(e) =>
              setNewQuestion({ ...newQuestion, option_c: e.target.value })
            }
            className="border rounded p-2 flex-1"
          />
        </div>
        <div className="flex items-center gap-2 mb-4">
          <span>Poprawna odpowiedź:</span>
          <select
            value={newQuestion.correct_option}
            onChange={(e) =>
              setNewQuestion({ ...newQuestion, correct_option: e.target.value })
            }
            className="border rounded p-1"
          >
            <option value="A">A</option>
            <option value="B">B</option>
            <option value="C">C</option>
          </select>
        </div>
        <button
          onClick={handleAddQuestion}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
        >
          Dodaj pytanie
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2">ID</th>
              <th className="border p-2">Treść pytania</th>
              <th className="border p-2">Odp. A</th>
              <th className="border p-2">Odp. B</th>
              <th className="border p-2">Odp. C</th>
              <th className="border p-2">Poprawna</th>
              <th className="border p-2">Akcje</th>
            </tr>
          </thead>
          <tbody>
            {questions.map((q) => (
              <tr key={q.id} className="text-center">
                <td className="border p-2">{q.id}</td>
                <td className="border p-2">{q.question_text}</td>
                <td className="border p-2">{q.option_a}</td>
                <td className="border p-2">{q.option_b}</td>
                <td className="border p-2">{q.option_c}</td>
                <td className="border p-2">{q.correct_option}</td>
                <td className="border p-2">
                  <div className="flex flex-col sm:flex-row gap-2 items-center justify-center">
                    <button
                      className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors"
                      onClick={() => {
                        setSelectedQuestion(q);
                        setShowEditModal(true);
                      }}
                    >
                      Edytuj
                    </button>
                    <button
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-colors"
                      onClick={() => {
                        setSelectedQuestion(q);
                        setShowDeleteModal(true);
                      }}
                    >
                      Usuń
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {questions.length === 0 && (
              <tr>
                <td colSpan="7" className="p-4 text-gray-500">
                  Brak pytań w bazie.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {showEditModal && selectedQuestion && (
        <EditQuestionModal
          question={selectedQuestion}
          onClose={() => setShowEditModal(false)}
          onSave={handleSaveEdit}
        />
      )}
      {showDeleteModal && selectedQuestion && (
        <ConfirmModal
          onConfirm={() => handleDelete(selectedQuestion.id)}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}
    </div>
  );
};

export default AdminQuestions;
