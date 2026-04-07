import { useState } from "react";

function ExerciseForm() {
  // State for each input field
  const [exercise, setExercise] = useState("");
  const [reps, setReps] = useState("");
  const [exsets, setExsets] = useState("");

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent page reload

    const data = {
      exercise,
      reps,
      exsets
    };

    try {
      const response = await fetch("http://localhost:8080/api/AddExercise", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();
      console.log("Saved:", result);

      // Optionally clear form
      setExercise("");
      setReps("");
      setExsets("");
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Exercise"
        value={exercise}
        onChange={(e) => setExercise(e.target.value)}
        required
      />
      <input
        type="text"
        placeholder="Reps"
        value={reps}
        onChange={(e) => setReps(e.target.value)}
        required
      />
      <input
        type="text"
        placeholder="Sets"
        value={exsets}
        onChange={(e) => setExsets(e.target.value)}
        required
      />
      <button type="submit">Add Exercise</button>
    </form>
  );
}

export default ExerciseForm;
