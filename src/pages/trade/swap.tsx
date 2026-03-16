import React, { useState } from 'react';
import styled from 'styled-components';
import SwapCard from '../../components/trade/SwapCard';
import LiquidityCard from '../../components/trade/LiquidityCard';

const PageWrapper = styled.div`
  min-height: calc(100vh - 56px);
  background: ${({ theme }) => theme.colors.gradientBubblegum};
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px 16px 64px;
`;

const TopTabs = styled.div`
  display: flex;
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  border-radius: 16px;
  padding: 4px;
  margin-bottom: 24px;
  gap: 4px;
`;

const TopTab = styled.button<{ active?: boolean }>`
  padding: 8px 24px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  font-family: 'Kanit', sans-serif;
  cursor: pointer;
  border: none;
  background: ${({ active, theme }) => active ? theme.colors.primary : 'transparent'};
  color: ${({ active, theme }) => active ? 'white' : theme.colors.textSubtle};
  transition: all 0.15s;
  &:hover { color: ${({ theme }) => theme.colors.text}; }
`;

export default function SwapPage() {
  const [tab, setTab] = useState<'swap' | 'liquidity'>('swap');

  return (
    <PageWrapper>
      <TopTabs>
        <TopTab active={tab === 'swap'} onClick={() => setTab('swap')}>🔄 Swap</TopTab>
        <TopTab active={tab === 'liquidity'} onClick={() => setTab('liquidity')}>💧 Liquidity</TopTab>
      </TopTabs>
      {tab === 'swap' ? <SwapCard /> : <LiquidityCard />}
    </PageWrapper>
  );
}
