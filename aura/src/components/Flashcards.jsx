import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import { collection, addDoc, deleteDoc, doc, onSnapshot, query, orderBy, updateDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import styled from "styled-components";

const CardBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
`;
const Flashcard = styled.div`
  background: linear-gradient(135deg, #23283b 0%, #00c6ff 100%);
  color: #fff;
  border-radius: 18px;
  box-shadow: 0 4px 24px #00c6ff33;
  width: 320px;
  min-height: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  font-weight: 600;
  cursor: pointer;
  position: relative;
  transition: transform 0.2s;
  user-select: none;
  text-align: center;
  padding: 1.5rem 1.2rem;
`;
const Controls = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 0.5rem;
`;
const InputRow = styled.div`
  display: flex;
  gap: 0.7rem;
  margin-bottom: 1.2rem;
`;
const FlashInput = styled.input`
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

export default function Flashcards() {
  const [user, setUser] = useState(null);
  const [flashcards, setFlashcards] = useState([]);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [current, setCurrent] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editQ, setEditQ] = useState("");
  const [editA, setEditA] = useState("");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, setUser);
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "users", user.uid, "flashcards"), orderBy("createdAt"));
    const unsub = onSnapshot(q, (snap) => {
      setFlashcards(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, [user]);

  const handleAdd = async () => {
    if (!question.trim() || !answer.trim() || !user) return;
    await addDoc(collection(db, "users", user.uid, "flashcards"), {
      question,
      answer,
      createdAt: Date.now(),
    });
    setQuestion("");
    setAnswer("");
    setCurrent(flashcards.length); // go to new card
    setShowAnswer(false);
  };

  const handleDelete = async (id) => {
    if (!user) return;
    await deleteDoc(doc(db, "users", user.uid, "flashcards", id));
    setCurrent(0);
    setShowAnswer(false);
  };

  const handleEdit = () => {
    setEditQ(flashcards[current].question);
    setEditA(flashcards[current].answer);
    setEditing(true);
  };

  const handleSave = async () => {
    if (!user) return;
    try {
      await updateDoc(doc(db, "users", user.uid, "flashcards", flashcards[current].id), {
        question: editQ,
        answer: editA,
      });
      setEditing(false);
      setShowAnswer(false);
      setEditQ("");
      setEditA("");
      // Optionally, set current to the edited card to ensure it appears
      setCurrent(current);
    } catch (e) {
      alert("Failed to save changes: " + e.message);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    setEditQ("");
    setEditA("");
  };

  if (!user) {
    return <CardBox><div style={{color:'#b6eaff'}}>Sign in to use flashcards.</div></CardBox>;
  }

  return (
    <CardBox>
      <InputRow>
        <FlashInput
          value={question}
          onChange={e => setQuestion(e.target.value)}
          placeholder="Question"
          aria-label="Flashcard question"
        />
        <FlashInput
          value={answer}
          onChange={e => setAnswer(e.target.value)}
          placeholder="Answer"
          aria-label="Flashcard answer"
        />
        <AddBtn onClick={handleAdd} aria-label="Add flashcard">Add</AddBtn>
      </InputRow>
      {flashcards.length === 0 ? (
        <div style={{color:'#b6eaff',margin:'2rem 0'}}>No flashcards yet. Add your first above!</div>
      ) : (
        <>
          {editing ? (
            <>
              <Flashcard as="form" onSubmit={e => { e.preventDefault(); handleSave(); }} style={{cursor:'default'}}>
                <div style={{width:'100%'}}>
                  <FlashInput
                    value={editQ}
                    onChange={e => setEditQ(e.target.value)}
                    placeholder="Edit question"
                    style={{marginBottom:12, width:'100%'}}
                    aria-label="Edit flashcard question"
                  />
                  <FlashInput
                    value={editA}
                    onChange={e => setEditA(e.target.value)}
                    placeholder="Edit answer"
                    style={{width:'100%'}}
                    aria-label="Edit flashcard answer"
                  />
                </div>
              </Flashcard>
              <Controls>
                <AddBtn type="button" onClick={handleSave} aria-label="Save flashcard edits">Save</AddBtn>
                <AddBtn type="button" onClick={handleCancel} style={{background:'#23283b'}} aria-label="Cancel flashcard edits">Cancel</AddBtn>
              </Controls>
            </>
          ) : (
            <>
              <Flashcard onClick={() => setShowAnswer(a => !a)} title="Click to flip" tabIndex={0} aria-label={showAnswer ? "Show question" : "Show answer"} onKeyDown={e => { if(e.key==='Enter'||e.key===' '){ setShowAnswer(a=>!a); }}}>
                {showAnswer ? flashcards[current].answer : flashcards[current].question}
              </Flashcard>
              <Controls>
                <AddBtn onClick={() => { setCurrent((current-1+flashcards.length)%flashcards.length); setShowAnswer(false); }} aria-label="Previous flashcard">&lt; Prev</AddBtn>
                <AddBtn onClick={() => { setCurrent((current+1)%flashcards.length); setShowAnswer(false); }} aria-label="Next flashcard">Next &gt;</AddBtn>
                <AddBtn onClick={handleEdit} style={{background:'#ffe066', color:'#222'}} aria-label="Edit flashcard">Edit</AddBtn>
                <DeleteBtn onClick={() => handleDelete(flashcards[current].id)} title="Delete" aria-label="Delete flashcard">✕</DeleteBtn>
              </Controls>
            </>
          )}
          <div style={{color:'#b6eaff',fontSize:'1rem'}}>Card {current+1} of {flashcards.length} (click card to flip)</div>
        </>
      )}
    </CardBox>
  );
} 