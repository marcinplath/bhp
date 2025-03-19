import { Link } from "react-router-dom";

const NotFoundPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold text-red-500 mb-4">
        404 - Nie znaleziono
      </h1>
      <p className="text-lg">
        Przepraszamy, ale strona, której szukasz, nie istnieje.
      </p>
      <Link to="/" className="mt-4 bg-blue-500 text-white px-6 py-2 rounded">
        Powrót do strony głównej
      </Link>
    </div>
  );
};

export default NotFoundPage;
