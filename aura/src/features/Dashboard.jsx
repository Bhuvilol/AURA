import React, { useEffect, useState, Suspense } from "react";
import styled, { keyframes } from "styled-components";
import { Link } from "react-router-dom";
import Spline from '@splinetool/react-spline';
const gradientMove = keyframes`0%{background-position:0% 50%;}50%{background-position:100% 50%;}100%{background-position:0% 50%;}`;
const DashboardFlex = styled.div`display:flex;flex-direction:row;align-items:flex-start;justify-content:center;width:100%;gap:2.5rem;@media(max-width:900px){flex-direction:column;align-items:center;gap:1.5rem;}`;
const DashboardPageContainer = styled.div`max-width:900px;width:100%;margin:0 auto;`;
const DashboardContainer = styled.div`position:relative;z-index:1;display:flex;flex-direction:column;align-items:flex-start;min-height:80vh;padding:2rem 1rem;background:linear-gradient(135deg,#181c24cc 0%,#23283bcc 40%,#8B0000cc 100%);background-size:200% 200%;animation:${gradientMove} 12s ease-in-out infinite;border-radius:28px;box-shadow:0 8px 32px 0 rgba(80,0,0,0.45),0 0 24px 0 #8B000033;border:1.5px solid rgba(139,0,0,0.18);backdrop-filter:blur(16px);margin-top:2rem;min-width:320px;width:425px;max-width:425px;height:650px;box-sizing:border-box;@media(max-width:900px){align-items:center;min-width:0;max-width:100vw;width:100%;height:auto;}`;
const SplineWrapper = styled.div`width:425px;max-width:425px;height:600px;min-width:320px;margin-top:2rem;border-radius:32px;overflow:hidden;box-shadow:0 8px 32px 0 #8B000033,0 0 24px #8B000022;background:#181c24;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;@media(max-width:900px){width:100vw;max-width:100vw;height:400px;margin-top:0;padding-left:0;}`;
const WelcomeHeading = styled.h1`font-size:2.6rem;font-weight:800;margin-bottom:1.2rem;margin:2rem 0 1.2rem 0;text-align:center;color:#fff;text-shadow:0 2px 32px rgba(0,0,0,0.25),0 0 2px #fff;letter-spacing:1px;`;
const CardsColumn = styled.div`display:flex;flex-direction:column;gap:2rem;width:100%;`;
const GlassCard = styled(Link)`min-width:220px;min-height:90px;background:rgba(30,40,60,0.85);border-radius:20px;box-shadow:0 8px 32px 0 #8B000044,0 0 16px 0 #8B000055;border:1.5px solid #8B0000;backdrop-filter:blur(8px);color:#fff;text-shadow:0 1px 8px #000,0 0 2px #fff;text-decoration:none;display:flex;flex-direction:row;align-items:center;justify-content:flex-start;font-size:1.2rem;font-weight:500;transition:transform 0.2s,box-shadow 0.2s,border 0.2s;cursor:pointer;padding:1.2rem 1.5rem;gap:1.2rem;&:hover{transform:translateY(-8px) scale(1.04);box-shadow:0 12px 40px 0 #8B000099,0 0 32px #8B0000cc;border:1.5px solid #fff;background:rgba(139,0,0,0.18);}`;
const QuoteBox = styled.div`margin-top:2rem;padding:1.5rem 2rem;background:rgba(30,40,60,0.85);border-radius:18px;box-shadow:0 4px 24px 0 #8B000033,0 0 8px #8B000055;border:1px solid #8B0000;max-width:500px;color:#fff;text-shadow:0 1px 8px #000,0 0 2px #fff;font-size:1.1rem;text-align:center;min-height:80px;overflow:visible;white-space:pre-line;word-break:break-word;`;
const QuoteButton = styled.button`margin-top:1rem;padding:0.5rem 1.2rem;border-radius:12px;border:none;background:linear-gradient(90deg,#4b1c1c 0%,#8B0000 60%,#b22222 100%);color:#fff;font-weight:600;font-size:1rem;cursor:pointer;box-shadow:0 2px 12px 0 #8B000055;transition:background 0.2s,box-shadow 0.2s;&:hover{background:linear-gradient(90deg,#b22222 0%,#8B0000 60%,#4b1c1c 100%);filter:brightness(1.08);box-shadow:0 0 24px #8B0000cc;}`;
const cards=[{label:"Ask a Doubt",to:"/chat",emoji:"💬"},{label:"Organize Schedule",to:"/tasks",emoji:"🗓️"},{label:"Start Learning",to:"/learning",emoji:"🚀"}];
const SPLINE_SCENE_URL="https://prod.spline.design/B8p0y-zV8dbt5249/scene.splinecode";
export default function Dashboard(){
  const [quote,setQuote]=useState("Loading a motivational quote...");
  const [loading,setLoading]=useState(false);
  const fetchQuote=async()=>{setLoading(true);let attempts=0;let data={quote:''};try{do{const res=await fetch(`${import.meta.env.VITE_BACKEND_URL.replace(/\/$/,'')}/api/quote`);data=await res.json();attempts++;}while(data.quote&&data.quote.split(' ').length>14&&attempts<5);setQuote(!data.quote||data.quote.split(' ').length>14?"Stay positive, work hard, and make it happen! — AURA":data.quote);}catch{setQuote("Stay positive, work hard, and make it happen! — AURA");}setLoading(false);};
  useEffect(()=>{fetchQuote();},[]);
  return(
    <DashboardPageContainer>
      <DashboardFlex>
        <DashboardContainer>
          <CardsColumn>
            {cards.map(card=>(<GlassCard key={card.label} to={card.to}><span style={{fontSize:'2rem',marginRight:12}}>{card.emoji}</span>{card.label}</GlassCard>))}
          </CardsColumn>
          <QuoteBox style={{display:'flex',flexDirection:'column',alignItems:'center'}}>
            <div style={{marginBottom:16}}>{loading?'Fetching a new quote...':quote}</div>
            <QuoteButton onClick={fetchQuote} disabled={loading}>{loading?'Loading...':'New Quote'}</QuoteButton>
          </QuoteBox>
        </DashboardContainer>
        <SplineWrapper>
          <WelcomeHeading>Welcome to AURA</WelcomeHeading>
          <Suspense fallback={<div>Loading 3D...</div>}>
            <div style={{display:'flex',justifyContent:'flex-end',width:'100%',height:'100%',marginLeft:'40px'}}>
              <Spline scene={SPLINE_SCENE_URL} style={{width:'100%',height:'100%'}} />
            </div>
          </Suspense>
        </SplineWrapper>
      </DashboardFlex>
    </DashboardPageContainer>
  );
}