import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import { collection, addDoc, doc, onSnapshot, deleteDoc, query, orderBy } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import styled from "styled-components";

const QuizBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
`;
const QuizCard = styled.div`
  background: linear-gradient(135deg, #23283b 0%, #00c6ff 100%);
  color: #fff;
  border-radius: 18px;
  box-shadow: 0 4px 24px #00c6ff33;
  width: 340px;
  min-height: 160px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  font-weight: 600;
  padding: 1.5rem 1.2rem;
  margin-bottom: 1rem;
`;
const InputRow = styled.div`
  display: flex;
  gap: 0.7rem;
  margin-bottom: 1.2rem;
`;
const QuizInput = styled.input`
  flex: 1;
  border-radius: 10px;
  border: none;
  padding: 0.7rem 1rem;
  font-size: 1.08rem;
  background: rgba(30,40,60,0.85);
  color: #fff;
  box-shadow: 0 2px 8px 0 #00c6ff33;
  outline: none;
  &:focus {
    outline: 2px solid #00c6ff;
    box-shadow: 0 0 0 3px #00c6ff55;
  }
`;
const AddBtn = styled.button`
  background: linear-gradient(90deg, #00c6ff 0%, #0072ff 100%);
  color: #fff;
  border: none;
  border-radius: 10px;
  padding: 0.7rem 1.2rem;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  box-shadow: 0 2px 12px 0 #00c6ff55;
  transition: background 0.2s;
  &:hover, &:focus {
    background: linear-gradient(90deg, #0072ff 0%, #00c6ff 100%);
    outline: 2px solid #00c6ff;
    box-shadow: 0 0 0 3px #00c6ff55;
  }
`;
const DeleteBtn = styled.button`
  background: none;
  border: none;
  color: #ff4d4f;
  font-size: 1.2rem;
  cursor: pointer;
  margin-left: 0.5rem;
  &:focus {
    outline: 2px solid #ff4d4f;
    box-shadow: 0 0 0 3px #ff4d4f55;
  }
`;
const OptionBtn = styled.button`
  background: ${({ selected }) => selected ? '#00c6ff' : '#23283b'};
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.5rem 1.2rem;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  margin: 0.3rem 0.5rem;
  box-shadow: 0 2px 8px 0 #00c6ff33;
  transition: background 0.2s;
  &:hover, &:focus {
    background: #0072ff;
    outline: 2px solid #00c6ff;
    box-shadow: 0 0 0 3px #00c6ff55;
  }
`;

export default function Quiz() {
  const [user, setUser] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [question, setQuestion] = useState("");
  const [type, setType] = useState("mc");
  const [options, setOptions] = useState(["", ""]);
  const [answer, setAnswer] = useState(0);
  const [taking, setTaking] = useState(false);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, setUser);
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "users", user.uid, "quizzes"), orderBy("createdAt"));
    const unsub = onSnapshot(q, (snap) => {
      setQuizzes(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, [user]);

  const handleAdd = async () => {
    if (!question.trim() || (type === "mc" && options.some(o => !o.trim())) || !user) return;
    await addDoc(collection(db, "users", user.uid, "quizzes"), {
      question,
      type,
      options: type === "mc" ? options : ["True", "False"],
      answer,
      createdAt: Date.now(),
    });
    setQuestion("");
    setOptions(["", ""]);
    setAnswer(0);
    setType("mc");
  };

  const handleDelete = async (id) => {
    if (!user) return;
    await deleteDoc(doc(db, "users", user.uid, "quizzes", id));
    setCurrent(0);
  };

  const startQuiz = () => {
    setTaking(true);
    setCurrent(0);
    setScore(0);
    setShowScore(false);
    setSelected(null);
  };

  const handleSelect = (idx) => setSelected(idx);

  const handleNext = () => {
    if (selected === quizzes[current].answer) setScore(s => s+1);
    if (current === quizzes.length-1) setShowScore(true);
    else {
      setCurrent(c => c+1);
      setSelected(null);
    }
  };

  if (!user) {
    return <QuizBox><div style={{color:'#b6eaff'}}>Sign in to use quizzes.</div></QuizBox>;
  }

  return (
    <QuizBox>
      {!taking ? (
        <>
          <InputRow>
            <QuizInput
              value={question}
              onChange={e => setQuestion(e.target.value)}
              placeholder="Quiz question"
              aria-label="Quiz question"
            />
            <select value={type} onChange={e => setType(e.target.value)} style={{borderRadius:8,padding:'0.5rem',fontWeight:600,color:'#111'}} aria-label="Question type">
              <option value="mc">Multiple Choice</option>
              <option value="tf">True/False</option>
            </select>
            <AddBtn onClick={handleAdd}>Add</AddBtn>
          </InputRow>
          {type === "mc" && (
            <InputRow>
              {options.map((opt, i) => (
                <QuizInput
                  key={i}
                  value={opt}
                  onChange={e => setOptions(opts => opts.map((o, idx) => idx===i ? e.target.value : o))}
                  placeholder={`Option ${i+1}`}
                  aria-label={`Option ${i+1}`}
                />
              ))}
              <AddBtn onClick={() => setOptions(opts => [...opts, ""])} aria-label="Add option">+</AddBtn>
            </InputRow>
          )}
          <InputRow>
            <label style={{color:'#b6eaff',fontWeight:600}}>Correct:</label>
            <select value={answer} onChange={e => setAnswer(Number(e.target.value))} style={{borderRadius:8,padding:'0.5rem',fontWeight:600,color:'#111'}} aria-label="Correct answer">
              {(type === "mc" ? options : ["True", "False"]).map((opt, i) => (
                <option key={i} value={i}>{opt}</option>
              ))}
            </select>
          </InputRow>
          <div style={{margin:'1rem 0',width:'100%'}}>
            {quizzes.length === 0 ? <div style={{color:'#b6eaff'}}>No quizzes yet. Add your first above!</div> :
              quizzes.map((qz, i) => (
                <QuizCard key={qz.id}>
                  <div style={{marginBottom:8}}><b>Q{i+1}:</b> {qz.question}</div>
                  <div style={{color:'#b6eaff',fontSize:'0.98rem',marginBottom:8}}>
                    {qz.type === "mc" ? "Multiple Choice" : "True/False"}
                  </div>
                  <DeleteBtn onClick={() => handleDelete(qz.id)} title="Delete" aria-label={`Delete quiz question ${qz.question}`}>✕</DeleteBtn>
                </QuizCard>
              ))}
          </div>
          {quizzes.length > 0 && <AddBtn onClick={startQuiz} aria-label="Start quiz">Start Quiz</AddBtn>}
        </>
      ) : showScore ? (
        <QuizCard>
          <div style={{fontSize:'1.3rem',marginBottom:8}}>Quiz Complete!</div>
          <div style={{color:'#00ffb3',fontWeight:700}}>Score: {score} / {quizzes.length}</div>
          <AddBtn onClick={() => setTaking(false)} style={{marginTop:12}} aria-label="Back to quiz builder">Back to Builder</AddBtn>
        </QuizCard>
      ) : (
        <QuizCard>
          <div style={{marginBottom:8}}><b>Q{current+1}:</b> {quizzes[current].question}</div>
          <div style={{marginBottom:12}}>
            {(quizzes[current].type === "mc" ? quizzes[current].options : ["True", "False"]).map((opt, i) => (
              <OptionBtn key={i} selected={selected===i} onClick={() => handleSelect(i)}>{opt}</OptionBtn>
            ))}
          </div>
          <AddBtn onClick={handleNext} disabled={selected===null} aria-label={current === quizzes.length-1 ? "Finish quiz" : "Next question"}>{current === quizzes.length-1 ? "Finish" : "Next"}</AddBtn>
        </QuizCard>
      )}
    </QuizBox>
  );
} 