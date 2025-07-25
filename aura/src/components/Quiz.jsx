import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import { collection, addDoc, doc, onSnapshot, deleteDoc, query, orderBy } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import styled from "styled-components";

const QuizBox = styled.div`display: flex; flex-direction: column; align-items: center; gap: 1.5rem;`;
const QuizCard = styled.div`background: linear-gradient(135deg, #23283b 0%, #8B0000 100%); color: #fff; border-radius: 18px; box-shadow: 0 4px 24px #8B000033; width: 340px; min-height: 160px; display: flex; flex-direction: column; align-items: center; justify-content: center; font-size: 1.1rem; font-weight: 600; padding: 1.5rem 1.2rem; margin-bottom: 1rem;`;
const InputRow = styled.div`display: flex; gap: 0.7rem; margin-bottom: 1.2rem;`;
const QuizInput = styled.input`flex: 1; border-radius: 10px; border: 2.5px solid #8B0000; padding: 0.7rem 1rem; font-size: 1.08rem; background: rgba(30,40,60,0.85); color: #fff; box-shadow: 0 2px 8px 0 #8B000033; outline: none; &:focus { outline: none; border: 2.5px solid #ff3c00; box-shadow: 0 0 0 4px #ff3c0055; }`;
const AddBtn = styled.button`background: linear-gradient(90deg, #8B0000 0%, #b22222 100%); color: #fff; border: none; border-radius: 10px; padding: 0.7rem 1.2rem; font-weight: 600; font-size: 1rem; cursor: pointer; box-shadow: 0 2px 12px 0 #8B000055; transition: background 0.2s; &:hover, &:focus { background: linear-gradient(90deg, #b22222 0%, #8B0000 100%); outline: 2px solid #8B0000; box-shadow: 0 0 0 3px #8B000055; }`;
const DeleteBtn = styled.button`background: none; border: none; color: #ff4d4f; font-size: 1.2rem; cursor: pointer; margin-left: 0.5rem; &:focus { outline: 2px solid #ff4d4f; box-shadow: 0 0 0 3px #ff4d4f55; }`;
const OptionBtn = styled.button`background: ${({ selected }) => selected ? 'linear-gradient(90deg, #8B0000 0%, #b22222 100%)' : '#23283b'}; color: #fff; border: none; border-radius: 8px; padding: 0.5rem 1.2rem; font-weight: 600; font-size: 1rem; cursor: pointer; margin: 0.3rem 0.5rem; box-shadow: 0 2px 8px 0 #8B000033; transition: background 0.2s; &:hover, &:focus { background: linear-gradient(90deg, #b22222 0%, #8B0000 100%); outline: 2px solid #8B0000; box-shadow: 0 0 0 3px #8B000055; }`;

export default function Quiz() {
  const [user, setUser] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [form, setForm] = useState({ question: "", type: "mc", options: ["", ""], answer: 0 });
  const [taking, setTaking] = useState(false);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);

  useEffect(() => { const unsub = onAuthStateChanged(auth, setUser); return () => unsub(); }, []);
  useEffect(() => { if (!user) return; const q = query(collection(db, "users", user.uid, "quizzes"), orderBy("createdAt")); return onSnapshot(q, snap => setQuizzes(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })))); }, [user]);

  const handleInput = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  const handleOption = (i, v) => setForm(f => ({ ...f, options: f.options.map((o, idx) => idx === i ? v : o) }));
  const handleAdd = async () => {
    if (!form.question.trim() || (form.type === "mc" && form.options.some(o => !o.trim())) || !user) return;
    await addDoc(collection(db, "users", user.uid, "quizzes"), { question: form.question, type: form.type, options: form.type === "mc" ? form.options : ["True", "False"], answer: form.answer, createdAt: Date.now() });
    setForm({ question: "", type: "mc", options: ["", ""], answer: 0 });
  };
  const handleDelete = async (id) => { if (!user) return; await deleteDoc(doc(db, "users", user.uid, "quizzes", id)); setCurrent(0); };
  const startQuiz = () => { setTaking(true); setCurrent(0); setScore(0); setShowScore(false); setSelected(null); };
  const handleSelect = idx => setSelected(idx);
  const handleNext = () => { if (selected === quizzes[current].answer) setScore(s => s+1); if (current === quizzes.length-1) setShowScore(true); else { setCurrent(c => c+1); setSelected(null); } };

  if (!user) return <QuizBox><div style={{color:'#b6eaff'}}>Sign in to use quizzes.</div></QuizBox>;

  return (
    <QuizBox>
      {!taking ? <>
        <InputRow>
          <QuizInput name="question" value={form.question} onChange={handleInput} placeholder="Quiz question" aria-label="Quiz question" />
          <select name="type" value={form.type} onChange={handleInput} style={{borderRadius:8,padding:'0.5rem',fontWeight:600,color:'#111'}} aria-label="Question type">
            <option value="mc">Multiple Choice</option>
            <option value="tf">True/False</option>
          </select>
          <AddBtn onClick={handleAdd}>Add</AddBtn>
        </InputRow>
        {form.type === "mc" && <InputRow>
          {form.options.map((opt, i) => <QuizInput key={i} value={opt} onChange={e => handleOption(i, e.target.value)} placeholder={`Option ${i+1}`} aria-label={`Option ${i+1}`} />)}
          <AddBtn onClick={() => setForm(f => ({ ...f, options: [...f.options, ""] }))} aria-label="Add option">+</AddBtn>
        </InputRow>}
        <InputRow>
          <label style={{color:'#b6eaff',fontWeight:600}}>Correct:</label>
          <select name="answer" value={form.answer} onChange={e => setForm(f => ({ ...f, answer: Number(e.target.value) }))} style={{borderRadius:8,padding:'0.5rem',fontWeight:600,color:'#111'}} aria-label="Correct answer">
            {(form.type === "mc" ? form.options : ["True", "False"]).map((opt, i) => <option key={i} value={i}>{opt}</option>)}
          </select>
        </InputRow>
        <div style={{margin:'1rem 0',width:'100%'}}>
          {quizzes.length === 0 ? <div style={{color:'#b6eaff'}}>No quizzes yet. Add your first above!</div> : quizzes.map((qz, i) => <QuizCard key={qz.id}><div style={{marginBottom:8}}><b>Q{i+1}:</b> {qz.question}</div><div style={{color:'#b6eaff',fontSize:'0.98rem',marginBottom:8}}>{qz.type === "mc" ? "Multiple Choice" : "True/False"}</div><DeleteBtn onClick={() => handleDelete(qz.id)} title="Delete" aria-label={`Delete quiz '${qz.question}'`}>Delete</DeleteBtn></QuizCard>)}
        </div>
        {quizzes.length > 0 && <AddBtn onClick={startQuiz} aria-label="Start quiz">Start Quiz</AddBtn>}
      </> : showScore ? <QuizCard><div style={{fontSize:'1.3rem',marginBottom:8}}>Quiz Complete!</div><div style={{color:'#00ffb3',fontWeight:700}}>Score: {score} / {quizzes.length}</div><AddBtn onClick={() => setTaking(false)} style={{marginTop:12}} aria-label="Back to quiz builder">Back to Builder</AddBtn></QuizCard> : <QuizCard><div style={{marginBottom:8}}><b>Q{current+1}:</b> {quizzes[current].question}</div><div style={{marginBottom:12}}>{(quizzes[current].type === "mc" ? quizzes[current].options : ["True", "False"]).map((opt, i) => <OptionBtn key={i} selected={selected===i} onClick={() => handleSelect(i)}>{opt}</OptionBtn>)}</div><AddBtn onClick={handleNext} disabled={selected===null} aria-label={current === quizzes.length-1 ? "Finish quiz" : "Next question"}>{current === quizzes.length-1 ? "Finish" : "Next"}</AddBtn></QuizCard>}
    </QuizBox>
  );
} 