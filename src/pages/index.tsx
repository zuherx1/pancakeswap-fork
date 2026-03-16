import React from 'react';
import styled, { keyframes } from 'styled-components';
import Link from 'next/link';
import { Button } from '../components/ui/Button';
import { BunnyIcon } from '../components/ui/Icons';

const float = keyframes`
  0%,100% { transform: translateY(0); }
  50% { transform: translateY(-12px); }
`;

const Hero = styled.section`
  background: ${({ theme }) => theme.colors.gradientBubblegum};
  padding: 80px 24px 60px;
  text-align: center;
  position: relative;
  overflow: hidden;
`;

const HeroTitle = styled.h1`
  font-size: clamp(36px, 6vw, 72px);
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  margin: 0 0 16px;
  line-height: 1.1;
  font-family: 'Kanit', sans-serif;
`;

const HeroSub = styled.p`
  font-size: 20px;
  color: ${({ theme }) => theme.colors.textSubtle};
  margin: 0 0 40px;
`;

const HeroButtons = styled.div`
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
`;

const BunnyFloat = styled.div`
  animation: ${float} 3s ease-in-out infinite;
  display: inline-block;
  margin-bottom: 24px;
`;

const StatsRow = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  max-width: 800px;
  margin: 60px auto 0;
  gap: 24px;

  @media (max-width: 576px) { grid-template-columns: 1fr; }
`;

const StatCard = styled.div`
  background: ${({ theme }) => theme.colors.backgroundAlt2};
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  border-radius: 24px;
  padding: 24px;
  backdrop-filter: blur(8px);
`;

const StatValue = styled.div`
  font-size: 32px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  font-family: 'Kanit', sans-serif;
`;

const StatLabel = styled.div`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textSubtle};
  margin-top: 4px;
`;

const Section = styled.section`
  padding: 80px 24px;
  max-width: 1200px;
  margin: 0 auto;
`;

const SectionTitle = styled.h2`
  font-size: 40px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  margin: 0 0 8px;
`;

const SectionSub = styled.p`
  font-size: 16px;
  color: ${({ theme }) => theme.colors.textSubtle};
  margin: 0 0 48px;
`;

const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
`;

const FeatureCard = styled.div`
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  border-radius: 24px;
  padding: 32px;
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 32px rgba(0,0,0,0.1);
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const FeatureIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
`;

const FeatureTitle = styled.h3`
  font-size: 20px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin: 0 0 8px;
`;

const FeatureDesc = styled.p`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textSubtle};
  margin: 0 0 20px;
  line-height: 1.6;
`;

const FEATURES = [
  { icon: '🔄', title: 'Trade', desc: 'Swap tokens instantly on BNB Chain with low fees and deep liquidity.', href: '/trade/swap' },
  { icon: '📈', title: 'Perps', desc: 'Trade perpetual futures with up to 150x leverage.', href: '/perps' },
  { icon: '🌾', title: 'Farm', desc: 'Provide liquidity and earn CAKE rewards from our yield farms.', href: '/earn/farms' },
  { icon: '🏊', title: 'Pools', desc: 'Stake CAKE to earn other tokens. Simple staking for passive income.', href: '/earn/pools' },
  { icon: '🔮', title: 'Prediction', desc: 'Predict BNB price movement and earn. Up or down — you decide!', href: '/play/prediction' },
  { icon: '🎰', title: 'Lottery', desc: 'Win millions in CAKE with the PancakeSwap Lottery. Buy tickets &amp; win!', href: '/play/lottery' },
];

export default function Home() {
  return (
    <>
      <Hero>
        <BunnyFloat>
          <BunnyIcon size={100} />
        </BunnyFloat>
        <HeroTitle>The #1 DEX on BNB Chain</HeroTitle>
        <HeroSub>Trade, earn, and win crypto on the most popular decentralized exchange</HeroSub>
        <HeroButtons>
          <Link href="/trade/swap">
            <Button scale="xl">Trade Now</Button>
          </Link>
          <Link href="/earn/farms">
            <Button scale="xl" variant="secondary">Earn Yield</Button>
          </Link>
        </HeroButtons>
        <StatsRow>
          <StatCard>
            <StatValue>$4.2B</StatValue>
            <StatLabel>Total Value Locked</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>$1.8B</StatValue>
            <StatLabel>24h Trading Volume</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>2.8M+</StatValue>
            <StatLabel>Active Users</StatLabel>
          </StatCard>
        </StatsRow>
      </Hero>

      <Section>
        <SectionTitle>Everything you need to DeFi</SectionTitle>
        <SectionSub>PancakeSwap offers a comprehensive DeFi ecosystem on BNB Chain.</SectionSub>
        <FeatureGrid>
          {FEATURES.map((f) => (
            <Link key={f.href} href={f.href} style={{ textDecoration: 'none' }}>
              <FeatureCard>
                <FeatureIcon>{f.icon}</FeatureIcon>
                <FeatureTitle>{f.title}</FeatureTitle>
                <FeatureDesc>{f.desc}</FeatureDesc>
                <Button variant="tertiary" scale="sm">Go →</Button>
              </FeatureCard>
            </Link>
          ))}
        </FeatureGrid>
      </Section>
    </>
  );
}
