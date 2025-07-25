import React, { useState, useEffect } from "react";
import styled, { keyframes } from "styled-components";
import { db, auth } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import Flashcards from "../components/Flashcards";
import Quiz from "../components/Quiz";

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
  padding: 2.5rem 2rem 2rem 2rem;
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
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

const Section = styled.div`
  background: rgba(30,40,60,0.92);
  border-radius: 18px;
  padding: 1.5rem 1.2rem;
  box-shadow: 0 2px 12px 0 #8B000033;
  border: 1px solid #8B0000;
  margin-bottom: 1.5rem;
`;

const PlanGrid = styled.div`
  display: flex;
  flex-wrap: nowrap;
  gap: 1.5rem;
  justify-content: flex-start;
  overflow-x: auto;
  padding-bottom: 0.5rem;
  scrollbar-width: thin;
  &::-webkit-scrollbar {
    height: 8px;
    background: #23283b;
  }
  &::-webkit-scrollbar-thumb {
    background: #8B000055;
    border-radius: 8px;
  }
`;

const PlanCard = styled.div`
  background: rgba(139,0,0,0.13);
  border-radius: 16px;
  padding: 1.2rem 1rem;
  min-width: 220px;
  max-width: 260px;
  box-shadow: 0 2px 12px 0 #8B000033;
  border: 1px solid #8B0000;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  color: #fff;
  text-align: center;
`;

const PlanTitle = styled.h3`
  color: #fff;
  margin-bottom: 0.5rem;
  font-size: 1.15rem;
`;

const PlanDesc = styled.p`
  color: #fff;
  font-size: 0.98rem;
  margin-bottom: 0.7rem;
`;

const ResourceList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const ResourceItem = styled.li`
  margin-bottom: 0.7rem;
  font-size: 1.02rem;
  color: #fff;
`;

const FlashcardBox = styled.div`
  background: rgba(139,0,0,0.08);
  border-radius: 12px;
  padding: 1rem 1.2rem;
  min-height: 90px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 1.1rem;
`;

const plans = [
  {
    title: "Learn DSA in 30 Days",
    desc: "A daily roadmap to master Data Structures & Algorithms for interviews.",
  },
  {
    title: "Web Dev Bootcamp",
    desc: "From HTML/CSS basics to React and backend in 6 weeks.",
  },
  {
    title: "AI/ML Starter Plan",
    desc: "Kickstart your journey into AI and Machine Learning in 21 days.",
  },
];

const resources = [
  { type: "YouTube", label: "DSA Crash Course", url: "https://www.youtube.com/watch?v=8hly31xKli0" },
  { type: "Blog", label: "React Guide", url: "https://beta.reactjs.org/learn" },
  { type: "GitHub", label: "Awesome ML Repos", url: "https://github.com/rasbt/deeplearning-models" },
];

const planSteps = [
  [
    "Day 1-5: Arrays, Strings, Linked Lists",
    "Day 6-10: Stacks, Queues, Trees",
    "Day 11-15: Graphs, Recursion, Sorting",
    "Day 16-20: Searching, Hashing, Heaps",
    "Day 21-25: Dynamic Programming, Greedy",
    "Day 26-30: Practice & Mock Interviews"
  ],
  [
    "Week 1: HTML, CSS, Responsive Design",
    "Week 2: JavaScript Basics, DOM",
    "Week 3: React Fundamentals",
    "Week 4: State Management, Routing",
    "Week 5: Backend (Node, Express)",
    "Week 6: Fullstack Project"
  ],
  [
    "Day 1-3: Python & Math Refresher",
    "Day 4-7: Numpy, Pandas, Data Prep",
    "Day 8-12: ML Algorithms, Scikit-learn",
    "Day 13-16: Deep Learning, TensorFlow",
    "Day 17-19: Projects & Practice",
    "Day 20-21: Review & Quiz"
  ]
];

const resourceIcons = {
  YouTube: "▶️",
  Blog: "📝",
  GitHub: "💻"
};

const ModalOverlay = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.45);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
`;
const ModalBox = styled.div`
  background: #181c24;
  border-radius: 18px;
  padding: 2rem 2.5rem;
  min-width: 320px;
  max-width: 95vw;
  box-shadow: 0 8px 32px 0 #8B000055;
  border: 1.5px solid #8B000033;
  color: #fff;
  position: relative;
`;
const CloseBtn = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  color: #fff;
  font-size: 1.5rem;
  cursor: pointer;
  &:focus {
    outline: 2px solid #8B0000;
    box-shadow: 0 0 0 3px #8B000055;
  }
`;
const StepList = styled.ul`
  margin: 1.2rem 0 0 0;
  padding: 0 0 0 1.2rem;
  color: #fff;
`;
const ProgressBtn = styled.button`
  margin-top: 1.2rem;
  background: linear-gradient(90deg, #8B0000 0%, #b22222 100%);
  color: #fff;
  border: none;
  border-radius: 10px;
  padding: 0.6rem 1.3rem;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  box-shadow: 0 2px 12px 0 #8B000055;
  transition: background 0.2s;
  &:hover, &:focus {
    background: linear-gradient(90deg, #b22222 0%, #8B0000 100%);
    outline: 2px solid #8B0000;
    box-shadow: 0 0 0 3px #8B000055;
  }
`;

const SectionHeader = styled.h3`
  font-size: 2rem;
  font-weight: 800;
  text-align: center;
  margin-bottom: 2rem;
  color: #fff;
  text-shadow: 0 2px 32px #8B000099;
  letter-spacing: 1px;
  position: relative;
  &::after {
    content: '';
    display: block;
    height: 4px;
    width: 80px;
    margin: 0.7rem auto 0 auto;
    border-radius: 2px;
    background: linear-gradient(90deg, #8B0000 0%, #b22222 100%);
    box-shadow: 0 0 16px #8B000099;
    animation: ${gradientMove} 4s linear infinite;
  }
`;

const LearningSpace = () => {
  const [modalIdx, setModalIdx] = useState(null);
  const [planStatus, setPlanStatus] = useState(["not started", "not started", "not started"]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, setUser);
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!user) return;
    const fetchProgress = async () => {
      const ref = doc(db, "users", user.uid, "learning", "planProgress");
      const snap = await getDoc(ref);
      if (snap.exists()) {
        setPlanStatus(snap.data().status || ["not started", "not started", "not started"]);
      }
    };
    fetchProgress();
  }, [user]);

  const handleProgress = async (idx) => {
    setPlanStatus(status => {
      const next = [...status];
      if (next[idx] === "not started") next[idx] = "in progress";
      else if (next[idx] === "in progress") next[idx] = "completed";
      else next[idx] = "not started";
      // Save to Firestore
      if (user) {
        setDoc(doc(db, "users", user.uid, "learning", "planProgress"), { status: next });
      }
      return next;
    });
  };

  return (
    <Container>
      <Title>Learning Space</Title>
      <Section>
        <SectionHeader>Personalized Study Plans</SectionHeader>
        <PlanGrid>
          {plans.map((plan, i) => (
            <PlanCard key={i}>
              <PlanTitle>{plan.title}</PlanTitle>
              <PlanDesc>{plan.desc}</PlanDesc>
              <div style={{marginTop:8, marginBottom:8}}>
                <ProgressBtn onClick={() => handleProgress(i)} aria-label={planStatus[i]==="not started" ? `Start ${plan.title}` : planStatus[i]==="in progress" ? `Mark ${plan.title} as completed` : `Reset ${plan.title}` }>
                  {planStatus[i] === "not started" && "Start Plan"}
                  {planStatus[i] === "in progress" && "Mark as Completed"}
                  {planStatus[i] === "completed" && "Reset Plan"}
                </ProgressBtn>
                <ProgressBtn style={{marginLeft:8, background:'#23283b'}} onClick={() => setModalIdx(i)} aria-label={`View steps for ${plan.title}`}>
                  View Plan
                </ProgressBtn>
              </div>
              <div style={{fontSize:'0.98rem', color: planStatus[i]==="completed" ? '#00ffb3' : planStatus[i]==="in progress" ? '#ffe066' : '#b6eaff', fontWeight:600}}>
                {planStatus[i] === "not started" && "Not started"}
                {planStatus[i] === "in progress" && "In progress"}
                {planStatus[i] === "completed" && "Completed!"}
              </div>
            </PlanCard>
          ))}
        </PlanGrid>
      </Section>
      <Section>
        <SectionHeader>Embedded Resources</SectionHeader>
        <ResourceList>
          {resources.map((res, i) => (
            <ResourceItem key={i}>
              <span style={{fontSize:'1.2rem',marginRight:6}}>{resourceIcons[res.type]}</span>
              <b>{res.type}:</b> <a
                href={res.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: '#fff',
                  fontWeight: 700,
                  textDecoration: 'underline',
                  textDecorationColor: '#b22222',
                  textUnderlineOffset: '4px',
                  textDecorationThickness: '3px',
                  filter: 'drop-shadow(0 0 6px #b22222cc)',
                  transition: 'filter 0.2s, color 0.2s'
                }}
                onMouseOver={e => {
                  e.currentTarget.style.filter = 'drop-shadow(0 0 12px #b22222), drop-shadow(0 0 2px #fff)';
                  e.currentTarget.style.color = '#ffe066';
                }}
                onMouseOut={e => {
                  e.currentTarget.style.filter = 'drop-shadow(0 0 6px #b22222cc)';
                  e.currentTarget.style.color = '#fff';
                }}
                aria-label={`Open ${res.label} ${res.type} resource in new tab`}
              >
                {res.label}
              </a>
            </ResourceItem>
          ))}
        </ResourceList>
      </Section>
      <Section>
        <SectionHeader>Flashcards & Quiz Builder</SectionHeader>
        <Flashcards />
        <Quiz />
      </Section>
      {modalIdx !== null && (
        <ModalOverlay onClick={() => setModalIdx(null)}>
          <ModalBox onClick={e => e.stopPropagation()}>
            <CloseBtn onClick={() => setModalIdx(null)} title="Close" aria-label="Close plan steps modal">×</CloseBtn>
            <h2 style={{color:'#00c6ff',marginBottom:8}}>{plans[modalIdx].title}</h2>
            <div style={{color:'#b6eaff',marginBottom:12}}>{plans[modalIdx].desc}</div>
            <h4 style={{color:'#fff',margin:'1rem 0 0.5rem 0'}}>Plan Steps:</h4>
            <StepList>
              {planSteps[modalIdx].map((step, idx) => (
                <li key={idx}>{step}</li>
              ))}
            </StepList>
          </ModalBox>
        </ModalOverlay>
      )}
    </Container>
  );
};

export default LearningSpace; 