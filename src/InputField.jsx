import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import ExerciseForm from "./ExerciseForm";

function InputField() {
  return (
    <Router>
      <nav>
        <Link to="/addExercise">Add Exercise</Link>
      </nav>

      <Routes>
        <Route path="/addExercise" element={<ExerciseForm />} />
        <Route path="*" element={<h2>Page Not Found</h2>} />
      </Routes>
    </Router>
  );
}

export default InputField;
