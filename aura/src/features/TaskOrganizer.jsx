import React, { useState, useEffect } from "react";
import styled, { keyframes } from "styled-components";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { collection, query, orderBy, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebase";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";

const gradientMove = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const Container = styled.div`
  max-width: 900px;
  width: 100%;
  margin: 2rem auto;
  background: linear-gradient(135deg, #181c24 0%, #23283b 40%, #8B0000 100%);
  background-size: 200% 200%;
  animation: ${gradientMove} 12s ease-in-out infinite;
  border-radius: 28px;
  box-shadow: 0 8px 32px 0 #8B000044, 0 0 24px 0 #8B000033;
  border: 1.5px solid rgba(139,0,0,0.18);
  backdrop-filter: blur(16px);
  padding: 2rem 1.5rem 1.5rem 1.5rem;
`;

const Title = styled.h2`
  color: #fff;
  text-align: center;
  margin-bottom: 1.5rem;
  letter-spacing: 1px;
  position: relative;
  &::after {
    content: '';
    display: block;
    height: 4px;
    width: 60px;
    margin: 0.5rem auto 0 auto;
    border-radius: 2px;
    background: linear-gradient(90deg, #8B0000 0%, #b22222 100%);
    box-shadow: 0 0 12px #8B000099;
    animation: ${gradientMove} 4s linear infinite;
  }
`;

const TaskInputRow = styled.div`
  display: flex;
  gap: 0.7rem;
  margin-bottom: 1.5rem;
`;

const TaskInput = styled.input`
  flex: 2;
  border-radius: 10px;
  border: none;
  padding: 0.7rem 1rem;
  font-size: 1.08rem;
  background: rgba(30,40,60,0.85);
  color: #fff;
  box-shadow: 0 2px 8px 0 rgba(0, 198, 255, 0.08);
  outline: none;
  &:focus {
    outline: 2px solid #00c6ff;
    box-shadow: 0 0 0 3px #00c6ff55;
  }
`;

const DateInput = styled.input`
  flex: 1;
  border-radius: 10px;
  border: none;
  padding: 0.7rem 0.5rem;
  font-size: 1.08rem;
  background: rgba(30,40,60,0.85);
  color: #fff;
  box-shadow: 0 2px 8px 0 rgba(0, 198, 255, 0.08);
  outline: none;
  &:focus {
    outline: 2px solid #00c6ff;
    box-shadow: 0 0 0 3px #00c6ff55;
  }
`;

const AddButton = styled.button`
  background: linear-gradient(90deg, #4b1c1c 0%, #8B0000 60%, #b22222 100%);
  color: #fff;
  border: none;
  border-radius: 10px;
  padding: 0.7rem 1.2rem;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  box-shadow: 0 2px 12px 0 #8B000055;
  transition: background 0.2s;
  &:hover, &:focus {
    background: linear-gradient(90deg, #b22222 0%, #8B0000 60%, #4b1c1c 100%);
    filter: brightness(1.08);
    outline: 2px solid #8B0000;
    box-shadow: 0 0 0 3px #8B000055;
  }
`;

const TaskList = styled.div`
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const TaskCard = styled.div`
  display: flex;
  align-items: center;
  background: rgba(30,40,60,0.92);
  border-radius: 14px;
  padding: 0.8rem 1rem;
  box-shadow: 0 2px 12px 0 #8B000033;
  border: 1px solid #8B0000;
  gap: 0.7rem;
`;

const Checkbox = styled.input`
  width: 1.2rem;
  height: 1.2rem;
`;

const TaskText = styled.span`
  flex: 1;
  font-size: 1.08rem;
  color: ${props => props.completed ? "#aaa" : "#fff"};
  text-decoration: ${props => props.completed ? "line-through" : "none"};
`;

const DueDate = styled.span`
  font-size: 0.95rem;
  color: #00c6ff;
  margin-left: 0.5rem;
`;

const DeleteButton = styled.button`
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

const Spinner = styled.div`
  border: 4px solid #00c6ff33;
  border-top: 4px solid #00c6ff;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 2rem auto;
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const ProgressBarContainer = styled.div`
  margin: 2rem 0 1rem 0;
  background: rgba(30,40,60,0.85);
  border-radius: 10px;
  height: 18px;
  width: 100%;
  box-shadow: 0 2px 8px 0 #8B000033;
`;

const ProgressBar = styled.div`
  height: 100%;
  border-radius: 10px;
  background: linear-gradient(90deg, #8B0000 0%, #b22222 100%);
  width: ${props => props.percent}%;
  transition: width 0.4s;
`;

function getCurrentWeekDates() {
  const now = new Date();
  const first = now.getDate() - now.getDay();
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now);
    d.setDate(first + i);
    d.setHours(0,0,0,0);
    return d.toISOString().slice(0, 10);
  });
}

const TaskOrganizer = () => {
  const [tasks, setTasks] = useState([]);
  const [input, setInput] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, setUser);
    return () => unsubAuth();
  }, []);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    setError("");
    const q = query(collection(db, "users", user.uid, "tasks"), orderBy("createdAt"));
    const unsub = onSnapshot(q, (snap) => {
      setTasks(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (err) => {
      setError("Failed to load tasks. Please try again later.");
      setLoading(false);
    });
    return () => unsub();
  }, [user]);

  // Add new task
  const handleAdd = async () => {
    if (!input.trim() || !user) return;
    setError("");
    try {
      await addDoc(collection(db, "users", user.uid, "tasks"), {
        text: input,
        completed: false,
        dueDate: dueDate || null,
        createdAt: Date.now(),
      });
      setInput("");
      setDueDate("");
    } catch (e) {
      setError("Failed to add task. Please try again.");
    }
  };

  // Toggle complete
  const handleComplete = async (id, completed) => {
    if (!user) return;
    setError("");
    try {
      await updateDoc(doc(db, "users", user.uid, "tasks", id), { completed: !completed });
    } catch (e) {
      setError("Failed to update task. Please try again.");
    }
  };

  // Delete task
  const handleDelete = async (id) => {
    if (!user) return;
    setError("");
    try {
      await deleteDoc(doc(db, "users", user.uid, "tasks", id));
    } catch (e) {
      setError("Failed to delete task. Please try again.");
    }
  };

  // Drag and drop
  const onDragEnd = (result) => {
    if (!result.destination) return;
    const reordered = Array.from(tasks);
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);
    setTasks(reordered);
  };

  // Weekly progress
  const weekDates = getCurrentWeekDates();
  const weekTasks = tasks.filter(t => t.dueDate && weekDates.includes(t.dueDate));
  const completedWeek = weekTasks.filter(t => t.completed).length;
  const percentWeek = weekTasks.length ? (completedWeek / weekTasks.length) * 100 : 0;

  // All tasks progress
  const completedAll = tasks.filter(t => t.completed).length;
  const percentAll = tasks.length ? (completedAll / tasks.length) * 100 : 0;

  if (!user) {
    return <Container><Title>Task Organizer</Title><div style={{textAlign:'center',color:'#b6eaff'}}>Please sign in to manage your tasks.</div></Container>;
  }

  return (
    <Container>
      <Title>Task Organizer</Title>
      <TaskInputRow>
        <TaskInput
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Add a new task..."
          aria-label="Task description"
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
        />
        <DateInput
          type="date"
          value={dueDate}
          onChange={e => setDueDate(e.target.value)}
          aria-label="Due date"
        />
        <AddButton onClick={handleAdd} aria-label="Add task">Add</AddButton>
      </TaskInputRow>
      {loading ? (
        <Spinner />
      ) : error ? (
        <div style={{color:'#ff4d4f',textAlign:'center',margin:'2rem 0'}}>{error}</div>
      ) : tasks.length === 0 ? (
        <div style={{textAlign:'center',color:'#b6eaff',margin:'2rem 0'}}>
          <div style={{fontSize:'2.5rem',marginBottom:'1rem'}}>📝</div>
          <div>No tasks yet! Add your first task above.</div>
        </div>
      ) : (
        <>
          <div style={{ fontSize: '1.25rem', color: '#fff', fontWeight: 600, marginBottom: '0.5rem', textAlign: 'center' }}>
            Overall Progress: {completedAll} / {tasks.length} tasks completed
          </div>
          <ProgressBarContainer>
            <ProgressBar percent={percentAll} />
          </ProgressBarContainer>
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="tasks">
              {(provided) => (
                <TaskList ref={provided.innerRef} {...provided.droppableProps}>
                  {tasks.map((task, idx) => (
                    <Draggable key={task.id} draggableId={task.id} index={idx}>
                      {(provided) => (
                        <TaskCard ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                          <Checkbox
                            type="checkbox"
                            checked={task.completed}
                            onChange={() => handleComplete(task.id, task.completed)}
                            aria-label={task.completed ? `Mark task '${task.text}' as incomplete` : `Mark task '${task.text}' as complete`}
                          />
                          <TaskText completed={task.completed}>{task.text}</TaskText>
                          {task.dueDate && <DueDate>{task.dueDate}</DueDate>}
                          <DeleteButton onClick={() => handleDelete(task.id)} title="Delete" aria-label={`Delete task '${task.text}'`}>✕</DeleteButton>
                        </TaskCard>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </TaskList>
              )}
            </Droppable>
          </DragDropContext>
        </>
      )}
    </Container>
  );
};

export default TaskOrganizer; 