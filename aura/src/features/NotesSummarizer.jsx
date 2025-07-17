import React, { useRef, useState } from "react";
import styled, { keyframes } from "styled-components";
import jsPDF from 'jspdf';
import Papa from 'papaparse';

const gradientMove = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const Container = styled.div`
  max-width: 800px;
  margin: 2rem auto;
  background: linear-gradient(135deg, #181c24 0%, #23283b 40%, #0072ff 100%);
  background-size: 200% 200%;
  animation: ${gradientMove} 12s ease-in-out infinite;
  border-radius: 28px;
  box-shadow: 0 8px 32px 0 #00c6ff44, 0 0 24px 0 #00c6ff33;
  border: 1.5px solid rgba(0,198,255,0.18);
  backdrop-filter: blur(16px);
  padding: 2.5rem 2rem 2rem 2rem;
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
`;

const Title = styled.h2`
  color: #00c6ff;
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
    background: linear-gradient(90deg, #00c6ff 0%, #0072ff 100%);
    box-shadow: 0 0 12px #00c6ff99;
    animation: ${gradientMove} 4s linear infinite;
  }
`;

const Section = styled.div`
  background: rgba(30,40,60,0.85);
  border-radius: 18px;
  padding: 1.5rem 1.2rem;
  box-shadow: 0 2px 12px 0 rgba(0, 198, 255, 0.10);
  border: 1px solid rgba(0,198,255,0.13);
  margin-bottom: 1.5rem;
`;

const UploadBox = styled.div`
  border: 2px dashed #00c6ff;
  border-radius: 12px;
  padding: 1.2rem;
  text-align: center;
  color: #00c6ff;
  background: rgba(0,198,255,0.08);
  margin-bottom: 1rem;
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 90px;
  border-radius: 10px;
  border: none;
  padding: 0.8rem 1rem;
  font-size: 1.08rem;
  background: rgba(30,40,60,0.85);
  color: #fff;
  box-shadow: 0 2px 8px 0 rgba(0, 198, 255, 0.08);
  outline: none;
  margin-bottom: 1rem;
`;

const Button = styled.button`
  background: linear-gradient(90deg, #00c6ff 0%, #0072ff 100%);
  color: #fff;
  border: none;
  border-radius: 10px;
  padding: 0.7rem 1.2rem;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  box-shadow: 0 2px 12px 0 rgba(0, 198, 255, 0.12);
  transition: background 0.2s;
  margin-right: 1rem;
  &:hover {
    background: linear-gradient(90deg, #0072ff 0%, #00c6ff 100%);
    filter: brightness(1.15);
  }
`;

const SummaryBox = styled.div`
  background: rgba(0,198,255,0.08);
  border-radius: 12px;
  padding: 1rem 1.2rem;
  min-height: 90px;
  color: #00c6ff;
  font-size: 1.08rem;
  margin-bottom: 1rem;
`;

const FlashcardBox = styled.div`
  background: rgba(0,198,255,0.08);
  border-radius: 12px;
  padding: 1rem 1.2rem;
  min-height: 90px;
  color: #00c6ff;
  font-size: 1.08rem;
  margin-bottom: 1rem;
`;

const ExportRow = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`;

const NotesSummarizer = () => {
  const [text, setText] = useState("");
  const [summary, setSummary] = useState("");
  const [flashcards, setFlashcards] = useState([]);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [summarizing, setSummarizing] = useState(false);
  const [error, setError] = useState("");
  const [flashLoading, setFlashLoading] = useState(false);
  const [flashError, setFlashError] = useState("");
  const fileInputRef = useRef();

  // PDF extraction handler (now uses backend)
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      alert('Please upload a PDF file.');
      return;
    }
    setPdfLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/pdf-extract`, {
        method: 'POST',
        body: formData
      });
      if (!response.ok) throw new Error('Failed to extract text from PDF.');
      const data = await response.json();
      setText(data.text.trim());
    } catch (err) {
      alert('Failed to extract text from PDF.');
    }
    setPdfLoading(false);
  };
  const handleSummarize = async () => {
    setSummarizing(true);
    setError("");
    setSummary("");
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: `Summarize the following notes:\n\n${text}` })
      });
      if (!response.ok) throw new Error("Failed to get summary");
      const data = await response.json();
      setSummary(data.reply);
    } catch (err) {
      setError("Failed to summarize notes. Please try again.");
    }
    setSummarizing(false);
  };
  const handleFlashcards = async () => {
    setFlashLoading(true);
    setFlashError("");
    setFlashcards([]);
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: `Generate 5 flashcards (question and answer pairs) from the following notes. Respond in JSON array format: [{\"q\":\"question\",\"a\":\"answer\"}, ...]\n\n${summary || text}` })
      });
      if (!response.ok) throw new Error("Failed to generate flashcards");
      const data = await response.json();
      // Try to parse JSON from the AI's response
      let cards = [];
      try {
        const match = data.reply.match(/\[.*\]/s);
        cards = JSON.parse(match ? match[0] : data.reply);
      } catch (e) {
        throw new Error("Could not parse flashcards from AI response.");
      }
      setFlashcards(cards);
    } catch (err) {
      setFlashError("Failed to generate flashcards. Please try again.");
    }
    setFlashLoading(false);
  };

  // Export handlers
  const handleExportPDF = () => {
    const doc = new jsPDF();
    let y = 10;
    doc.setFontSize(16);
    doc.text('Notes', 10, y);
    y += 10;
    doc.setFontSize(12);
    doc.text(text || 'No notes.', 10, y, { maxWidth: 180 });
    y += 20;
    if (summary) {
      doc.setFontSize(16);
      doc.text('Summary', 10, y);
      y += 10;
      doc.setFontSize(12);
      doc.text(summary, 10, y, { maxWidth: 180 });
      y += 20;
    }
    if (flashcards.length > 0) {
      doc.setFontSize(16);
      doc.text('Flashcards', 10, y);
      y += 10;
      doc.setFontSize(12);
      flashcards.forEach((fc, i) => {
        doc.text(`Q${i+1}: ${fc.q}`, 10, y, { maxWidth: 180 });
        y += 7;
        doc.text(`A${i+1}: ${fc.a}`, 10, y, { maxWidth: 180 });
        y += 10;
      });
    }
    doc.save('notes_and_flashcards.pdf');
  };

  const handleExportCSV = () => {
    if (flashcards.length === 0) return;
    const csv = Papa.unparse(flashcards.map(fc => ({ Question: fc.q, Answer: fc.a })));
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'flashcards.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Container>
      <Title>Notes & Summarizer</Title>
      <Section>
        <h3>Upload PDF or Paste Text</h3>
        <UploadBox onClick={() => fileInputRef.current.click()} style={{cursor:'pointer'}}>
          Drag & drop PDF here or <b>click to upload</b>
          <input type="file" accept="application/pdf" style={{display:'none'}} ref={fileInputRef} onChange={handleFileUpload} />
        </UploadBox>
        {pdfLoading && <div style={{color:'#00c6ff',marginBottom:8}}>Extracting text from PDF...</div>}
        <TextArea
          placeholder="Paste your notes or text here..."
          value={text}
          onChange={e => setText(e.target.value)}
        />
        <Button onClick={handleSummarize} disabled={summarizing || !text.trim()}>
          {summarizing ? "Summarizing..." : "Summarize"}
        </Button>
        {error && <div style={{color:'#ff4d4f',marginTop:8}}>{error}</div>}
      </Section>
      <Section>
        <h3>Summary</h3>
        <SummaryBox>
          {summary || (summarizing ? "Summarizing..." : "Your summary will appear here.")}
        </SummaryBox>
        <Button onClick={handleFlashcards} disabled={flashLoading || !(summary || text).trim()}>
          {flashLoading ? "Generating..." : "Convert to Flashcards"}
        </Button>
        {flashError && <div style={{color:'#ff4d4f',marginTop:8}}>{flashError}</div>}
      </Section>
      <Section>
        <h3>Flashcards</h3>
        <FlashcardBox>
          {flashLoading ? "Generating flashcards..." : flashcards.length === 0 ? (
            "Your flashcards will appear here."
          ) : (
            <ul style={{margin:0,padding:0}}>
              {flashcards.map((fc, i) => (
                <li key={i} style={{marginBottom:8}}>
                  <b>Q:</b> {fc.q}<br/><b>A:</b> {fc.a}
                </li>
              ))}
            </ul>
          )}
        </FlashcardBox>
        <ExportRow>
          <Button onClick={handleExportPDF} disabled={!(text || summary || flashcards.length)}>Export as PDF</Button>
          <Button onClick={handleExportCSV} disabled={flashcards.length === 0}>Export as CSV</Button>
        </ExportRow>
      </Section>
    </Container>
  );
};

export default NotesSummarizer; 