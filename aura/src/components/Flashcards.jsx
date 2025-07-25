import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import { collection, addDoc, deleteDoc, doc, onSnapshot, query, orderBy, updateDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import styled from "styled-components";

const CardBox = styled.div`
  display: flex; flex-direction: column; align-items: center; gap: 1.5rem;
`;
const Flashcard = styled.div`
  perspective: 1000px; width: 400px; min-height: 110px; position: relative; cursor: pointer; user-select: none; text-align: center;
`;
const FlashcardInner = styled.div`
  position: relative; width: 100%; min-height: 110px; transition: transform 0.5s cubic-bezier(0.4,0.2,0.2,1); transform-style: preserve-3d;
  border-radius: 18px; box-shadow: 0 4px 24px #8B000033; background: linear-gradient(135deg, #23283b 0%, #8B0000 100%); color: #fff; font-size: 1.2rem; font-weight: 600; padding: 1.5rem 1.2rem;
  ${({ $flipped }) => $flipped && `transform: rotateY(180deg);`}
`;
const FlashcardFace = styled.div`
  position: absolute; width: 100%; min-height: 110px; backface-visibility: hidden; display: flex; align-items: center; justify-content: center; border-radius: 18px; left: 0; top: 0;
`;
const FlashcardBack = styled(FlashcardFace)`transform: rotateY(180deg);`;
const Controls = styled.div`display: flex; gap: 1rem; margin-top: 0.5rem;`;
const InputRow = styled.div`display: flex; gap: 0.7rem; margin-bottom: 1.2rem;`;
const FlashInput = styled.input`
  flex: 1; border-radius: 10px; border: 2.5px solid #8B0000; padding: 0.7rem 1rem; font-size: 1.08rem; background: rgba(30,40,60,0.85); color: #fff; box-shadow: 0 2px 8px 0 #8B000033; outline: none;
  &:focus { outline: none; border: 2.5px solid #ff3c00; box-shadow: 0 0 0 4px #ff3c0055; }
`;
const AddBtn = styled.button`
  background: linear-gradient(90deg, #8B0000 0%, #b22222 100%); color: #fff; border: none; border-radius: 10px; padding: 0.7rem 1.2rem; font-weight: 600; font-size: 1rem; cursor: pointer; box-shadow: 0 2px 12px 0 #8B000055; transition: background 0.2s;
  &:hover, &:focus { background: linear-gradient(90deg, #b22222 0%, #8B0000 100%); outline: 2px solid #8B0000; box-shadow: 0 0 0 3px #8B000055; }
`;
const DeleteBtn = styled.button`
  background: none; border: none; color: #ff4d4f; font-size: 1.2rem; cursor: pointer; margin-left: 0.5rem;
  &:focus { outline: 2px solid #ff4d4f; box-shadow: 0 0 0 3px #ff4d4f55; }
`;
const Grid = styled.div`display: flex; flex-wrap: wrap; gap: 1rem; margin-top: 1.5rem; justify-content: center;`;
const MiniCard = styled.div`
  background: linear-gradient(135deg, #23283b 0%, #8B0000 100%); color: #fff; border-radius: 12px; box-shadow: 0 2px 8px #8B000033; width: 120px; min-height: 60px; display: flex; align-items: center; justify-content: center; font-size: 0.95rem; font-weight: 600; cursor: pointer; text-align: center; padding: 0.7rem 0.5rem; border: 2px solid transparent; transition: border 0.2s;
  &:hover, &.active { border: 2px solid #ffe066; }
`;

export default function Flashcards() {
  const [user, setUser] = useState(null);
  const [flashcards, setFlashcards] = useState([]);
  const [form, setForm] = useState({ q: "", a: "" });
  const [current, setCurrent] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ q: "", a: "" });
  const [viewAll, setViewAll] = useState(false);
  const [lastAddedId, setLastAddedId] = useState(null);

  useEffect(() => { const unsub = onAuthStateChanged(auth, setUser); return () => unsub(); }, []);
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "users", user.uid, "flashcards"), orderBy("createdAt"));
    return onSnapshot(q, snap => setFlashcards(snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))));
  }, [user]);

  const handleInput = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  const handleEditInput = e => setEditForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleAdd = async () => {
    if (!form.q.trim() || !form.a.trim() || !user) return;
    const docRef = await addDoc(collection(db, "users", user.uid, "flashcards"), { question: form.q, answer: form.a, createdAt: Date.now() });
    setLastAddedId(docRef.id);
    setForm({ q: "", a: "" });
    setShowAnswer(false);
  };

  useEffect(() => {
    if (lastAddedId && flashcards.length > 0) {
      const idx = flashcards.findIndex(card => card.id === lastAddedId);
      if (idx !== -1) setCurrent(idx);
      setLastAddedId(null);
    }
  }, [flashcards, lastAddedId]);

  const handleDelete = async (id) => { if (!user) return; await deleteDoc(doc(db, "users", user.uid, "flashcards", id)); setCurrent(0); setShowAnswer(false); };
  const handleEdit = () => { setEditForm({ q: flashcards[current].question, a: flashcards[current].answer }); setEditing(true); };
  const handleSave = async () => {
    if (!user) return;
    await updateDoc(doc(db, "users", user.uid, "flashcards", flashcards[current].id), { question: editForm.q, answer: editForm.a });
    setEditing(false); setShowAnswer(false); setEditForm({ q: "", a: "" });
  };
  const handleCancel = () => { setEditing(false); setEditForm({ q: "", a: "" }); };

  if (!user) return <CardBox><div style={{color:'#b6eaff'}}>Sign in to use flashcards.</div></CardBox>;

  return (
    <CardBox>
      <InputRow>
        <FlashInput name="q" value={form.q} onChange={handleInput} placeholder="Question" aria-label="Flashcard question" />
        <FlashInput name="a" value={form.a} onChange={handleInput} placeholder="Answer" aria-label="Flashcard answer" />
        <AddBtn onClick={handleAdd} aria-label="Add flashcard">Add</AddBtn>
        <AddBtn type="button" onClick={() => setViewAll(v => !v)} aria-label={viewAll ? 'Hide all flashcards' : 'View all flashcards'} style={{ marginLeft: 8, background: viewAll ? 'linear-gradient(90deg, #ffe066 0%, #ffb347 100%)' : undefined, color: viewAll ? '#222' : undefined }}>{viewAll ? 'Hide All' : 'View All'}</AddBtn>
      </InputRow>
      {flashcards.length === 0 ? (
        <div style={{color:'#b6eaff',margin:'2rem 0'}}>No flashcards yet. Add your first above!</div>
      ) : editing ? (
        <>
          <Flashcard as="form" onSubmit={e => { e.preventDefault(); handleSave(); }} style={{cursor:'default'}}>
            <div style={{width:'100%'}}>
              <FlashInput name="q" value={editForm.q} onChange={handleEditInput} placeholder="Edit question" style={{marginBottom:12, width:'100%'}} aria-label="Edit flashcard question" />
              <FlashInput name="a" value={editForm.a} onChange={handleEditInput} placeholder="Edit answer" style={{width:'100%'}} aria-label="Edit flashcard answer" />
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
            <FlashcardInner $flipped={showAnswer}>
              <FlashcardFace>{flashcards[current].question}</FlashcardFace>
              <FlashcardBack>{flashcards[current].answer}</FlashcardBack>
            </FlashcardInner>
          </Flashcard>
          <Controls>
            <AddBtn onClick={() => { setCurrent((current-1+flashcards.length)%flashcards.length); setShowAnswer(false); }} aria-label="Previous flashcard">&lt; Prev</AddBtn>
            <AddBtn onClick={() => { setCurrent((current+1)%flashcards.length); setShowAnswer(false); }} aria-label="Next flashcard">Next &gt;</AddBtn>
            <AddBtn onClick={handleEdit} style={{background:'#ffe066', color:'#222'}} aria-label="Edit flashcard">Edit</AddBtn>
            <DeleteBtn onClick={() => handleDelete(flashcards[current].id)} title="Delete" aria-label="Delete flashcard">Delete</DeleteBtn>
          </Controls>
        </>
      )}
      {viewAll && flashcards.length > 0 && (
        <Grid>
          {flashcards.map((card, idx) => (
            <MiniCard key={card.id} className={idx === current ? 'active' : ''} onClick={() => { setCurrent(idx); setShowAnswer(false); }} title={`Go to card ${idx+1}`}>{card.question}</MiniCard>
          ))}
        </Grid>
      )}
      <div style={{color:'#b6eaff',fontSize:'1rem'}}>Card {current+1} of {flashcards.length} (click card to flip)</div>
    </CardBox>
  );
} 