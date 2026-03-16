import React, { useState, useEffect, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import { Button } from '../ui/Button';
import { Text, Heading } from '../ui/Typography';
import CurrencySelectModal from './CurrencySelectModal';
import {
  CNcurrency, CNtransaction,
  POPULAR_CRYPTO, FIAT_CURRENCIES,
  getEstimate, createExchange, getMinAmount, getTransactionStatus,
} from '../../utils/changenow';
import { useWeb3 } from '../../context/Web3Context';

/* ─── Animations ─────────────────────────────────────────────────────────── */
const spin = keyframes`from{transform:rotate(0deg)}to{transform:rotate(360deg)}`;
const pulse = keyframes`0%,100%{opacity:1}50%{opacity:0.4}`;

/* ─── Styled ─────────────────────────────────────────────────────────────── */
const Card = styled.div<{ $wide?: boolean }>`
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  border-radius: 24px;
  padding: 0;
  width: 100%;
  max-width: ${({ $wide }) => $wide ? '560px' : '480px'};
  box-shadow: 0 4px 32px rgba(0,0,0,0.06);
  overflow: hidden;
`;

const CardTop = styled.div`
  display: flex; align-items: center; justify-content: space-between;
  padding: 20px 24px 0;
`;

const ModeRow = styled.div`
  display: flex;
  background: ${({ theme }) => theme.colors.input};
  border-radius: 14px;
  padding: 4px;
  gap: 4px;
  margin: 16px 24px 0;
`;

const ModeBtn = styled.button<{ active?: boolean }>`
  flex: 1; padding: 8px;
  border-radius: 10px;
  font-size: 14px; font-weight: 600; font-family: 'Kanit', sans-serif;
  cursor: pointer; border: none;
  background: ${({ active, theme }) => active ? theme.colors.backgroundAlt : 'transparent'};
  color: ${({ active, theme }) => active ? theme.colors.text : theme.colors.textSubtle};
  transition: all 0.15s;
  box-shadow: ${({ active }) => active ? '0 1px 4px rgba(0,0,0,0.1)' : 'none'};
`;

const Body = styled.div`padding: 16px 24px 24px; display: flex; flex-direction: column; gap: 8px;`;

const Panel = styled.div`
  background: ${({ theme }) => theme.colors.input};
  border-radius: 20px; padding: 14px 16px;
  border: 1px solid transparent;
  transition: border-color 0.2s;
  &:focus-within { border-color: ${({ theme }) => theme.colors.primary}; }
`;

const PanelLabel = styled.div`
  display: flex; justify-content: space-between; margin-bottom: 8px;
`;

const PanelRow = styled.div`display: flex; align-items: center; gap: 10px;`;

const AmtInput = styled.input`
  flex: 1; background: transparent; border: none; outline: none;
  font-size: 26px; font-weight: 600; color: ${({ theme }) => theme.colors.text};
  font-family: 'Kanit', sans-serif; min-width: 0;
  &::placeholder { color: ${({ theme }) => theme.colors.textDisabled}; }
`;

const CoinBtn = styled.button`
  display: flex; align-items: center; gap: 8px;
  padding: 8px 12px; border-radius: 14px;
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  cursor: pointer; white-space: nowrap; flex-shrink: 0;
  font-size: 14px; font-weight: 700; font-family: 'Kanit', sans-serif;
  color: ${({ theme }) => theme.colors.text};
  transition: border-color 0.15s;
  &:hover { border-color: ${({ theme }) => theme.colors.primary}; }
`;

const CoinImg = styled.img`
  width: 22px; height: 22px; border-radius: 50%;
  object-fit: contain; background: ${({ theme }) => theme.colors.input};
`;

const FiatEmoji = styled.span`font-size: 18px;`;

const SwitchRow = styled.div`
  display: flex; justify-content: center; position: relative; z-index: 1; margin: -4px 0;
`;

const SwitchBtn = styled.button`
  width: 36px; height: 36px; border-radius: 12px;
  background: ${({ theme }) => theme.colors.input};
  border: 3px solid ${({ theme }) => theme.colors.backgroundAlt};
  color: ${({ theme }) => theme.colors.primary};
  font-size: 18px; display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all 0.2s;
  &:hover { background: ${({ theme }) => theme.colors.primary}; color: white; transform: rotate(180deg); }
`;

const AddressInput = styled.input`
  width: 100%; background: ${({ theme }) => theme.colors.input};
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  border-radius: 16px; padding: 12px 16px;
  font-size: 14px; color: ${({ theme }) => theme.colors.text};
  font-family: 'Kanit', sans-serif; outline: none;
  transition: border-color 0.2s;
  &::placeholder { color: ${({ theme }) => theme.colors.textDisabled}; }
  &:focus { border-color: ${({ theme }) => theme.colors.primary}; }
`;

const EstimateRow = styled.div`
  background: ${({ theme }) => theme.colors.input};
  border-radius: 14px; padding: 12px 16px;
  display: flex; justify-content: space-between; align-items: center;
`;

const Loader = styled.div`
  width: 16px; height: 16px; border-radius: 50%;
  border: 2px solid ${({ theme }) => theme.colors.primary + '40'};
  border-top-color: ${({ theme }) => theme.colors.primary};
  animation: ${spin} 0.7s linear infinite;
`;

const ErrorBox = styled.div`
  background: ${({ theme }) => theme.colors.danger + '15'};
  border-radius: 12px; padding: 10px 14px;
  color: ${({ theme }) => theme.colors.danger};
  font-size: 14px;
`;

const MinNote = styled.div`
  font-size: 12px; color: ${({ theme }) => theme.colors.textSubtle};
  text-align: center;
`;

/* ── Transaction status screen ── */
const TxCard = styled.div`
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  border-radius: 24px; padding: 28px 24px;
  width: 100%; max-width: 480px;
`;

const StatusBadge = styled.div<{ status: string }>`
  display: inline-flex; align-items: center; gap: 6px;
  padding: 6px 14px; border-radius: 20px;
  font-size: 14px; font-weight: 600;
  background: ${({ status, theme }) =>
    status === 'finished'  ? theme.colors.success + '20'  :
    status === 'failed'    ? theme.colors.danger  + '20'  :
    theme.colors.warning   + '20'};
  color: ${({ status, theme }) =>
    status === 'finished'  ? theme.colors.success  :
    status === 'failed'    ? theme.colors.danger   :
    theme.colors.warning};
`;

const TxRow = styled.div`
  display: flex; justify-content: space-between; align-items: center;
  padding: 8px 0; border-bottom: 1px solid ${({ theme }) => theme.colors.cardBorder};
  &:last-of-type { border-bottom: none; }
`;

const PulseDot = styled.div`
  width: 8px; height: 8px; border-radius: 50%;
  background: ${({ theme }) => theme.colors.warning};
  animation: ${pulse} 1.2s ease-in-out infinite;
`;

const STATUS_LABEL: Record<string, string> = {
  new:        '⏳ Awaiting deposit',
  waiting:    '⏳ Waiting for funds',
  confirming: '🔄 Confirming',
  exchanging: '🔄 Exchanging',
  sending:    '📤 Sending',
  finished:   '✅ Complete',
  failed:     '❌ Failed',
  refunded:   '↩️ Refunded',
  expired:    '⏰ Expired',
};

/* ─── Main component ─────────────────────────────────────────────────────── */
type Mode = 'exchange' | 'onramp' | 'offramp';

const BuyCryptoWidget: React.FC = () => {
  const { account } = useWeb3();

  const [mode,       setMode]      = useState<Mode>('exchange');
  const [fromCoin,   setFromCoin]  = useState<CNcurrency>(POPULAR_CRYPTO[1]); // ETH
  const [toCoin,     setToCoin]    = useState<CNcurrency>(POPULAR_CRYPTO[2]); // BNB
  const [fromFiat,   setFromFiat]  = useState<CNcurrency>(FIAT_CURRENCIES[0]); // USD
  const [toFiat,     setToFiat]    = useState<CNcurrency>(FIAT_CURRENCIES[0]); // USD
  const [fromAmt,    setFromAmt]   = useState('');
  const [toAmt,      setToAmt]     = useState('');
  const [address,    setAddress]   = useState(account || '');
  const [minAmt,     setMinAmt]    = useState<number>(0);
  const [estimating, setEstimating]= useState(false);
  const [creating,   setCreating]  = useState(false);
  const [error,      setError]     = useState('');
  const [tx,         setTx]        = useState<CNtransaction | null>(null);
  const [txStatus,   setTxStatus]  = useState('');
  const [selectFrom, setSelectFrom]= useState(false);
  const [selectTo,   setSelectTo]  = useState(false);
  const [pollTimer,  setPollTimer] = useState<any>(null);

  /* Sync wallet address */
  useEffect(() => { if (account) setAddress(account); }, [account]);

  /* Fetch min amount when pair changes */
  useEffect(() => {
    if (mode !== 'exchange') return;
    getMinAmount(fromCoin.ticker, toCoin.ticker)
      .then(setMinAmt)
      .catch(() => setMinAmt(0));
  }, [fromCoin.ticker, toCoin.ticker, mode]);

  /* Debounced estimate */
  useEffect(() => {
    if (mode !== 'exchange') return;
    if (!fromAmt || isNaN(Number(fromAmt)) || Number(fromAmt) <= 0) {
      setToAmt(''); setError(''); return;
    }
    const timer = setTimeout(async () => {
      setEstimating(true); setError('');
      try {
        const est = await getEstimate(fromCoin.ticker, toCoin.ticker, Number(fromAmt));
        setToAmt(String(est.estimatedAmount));
        if (minAmt > 0 && Number(fromAmt) < minAmt) {
          setError(`Minimum amount is ${minAmt} ${fromCoin.ticker.toUpperCase()}`);
        }
      } catch (e: any) {
        setError(e.message || 'Could not estimate');
        setToAmt('');
      } finally { setEstimating(false); }
    }, 600);
    return () => clearTimeout(timer);
  }, [fromAmt, fromCoin.ticker, toCoin.ticker, mode, minAmt]);

  /* Poll transaction status */
  useEffect(() => {
    if (!tx) return;
    const poll = async () => {
      try {
        const s = await getTransactionStatus(tx.id);
        setTxStatus(s.status);
        if (['finished','failed','refunded','expired'].includes(s.status)) {
          clearInterval(pollTimer);
        }
      } catch {}
    };
    poll();
    const t = setInterval(poll, 10_000);
    setPollTimer(t);
    return () => clearInterval(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tx?.id]);

  const handleSwitch = () => {
    const tmp = fromCoin;
    setFromCoin(toCoin);
    setToCoin(tmp);
    setFromAmt(''); setToAmt('');
  };

  const handleExchange = async () => {
    if (!fromAmt || !address) { setError('Enter amount and wallet address'); return; }
    if (Number(fromAmt) < minAmt) { setError(`Min amount: ${minAmt} ${fromCoin.ticker.toUpperCase()}`); return; }
    setCreating(true); setError('');
    try {
      const t = await createExchange({
        fromCurrency: fromCoin.ticker,
        toCurrency:   toCoin.ticker,
        fromAmount:   Number(fromAmt),
        address,
      });
      setTx(t);
    } catch (e: any) {
      setError(e.message || 'Exchange creation failed');
    } finally { setCreating(false); }
  };

  /* ── Active transaction view ── */
  if (tx) {
    return (
      <TxCard>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <Heading scale="md">Exchange in Progress</Heading>
          <StatusBadge status={txStatus}>
            {['finished','failed','refunded','expired'].includes(txStatus)
              ? null : <PulseDot />}
            {STATUS_LABEL[txStatus] || txStatus}
          </StatusBadge>
        </div>

        {['new','waiting'].includes(txStatus) && (
          <div style={{ background: 'rgba(31,199,212,0.1)', borderRadius: 16, padding: '16px', marginBottom: 16 }}>
            <Text small color="textSubtle" style={{ marginBottom: 4 }}>Send your {fromCoin.ticker.toUpperCase()} to:</Text>
            <Text bold style={{ wordBreak: 'break-all', fontSize: 14 }}>{tx.payinAddress}</Text>
            <Text small color="textSubtle" style={{ marginTop: 8 }}>Amount to send: <b>{tx.fromAmount} {fromCoin.ticker.toUpperCase()}</b></Text>
          </div>
        )}

        <TxRow><Text small color="textSubtle">Transaction ID</Text><Text small bold style={{ fontSize: 12 }}>{tx.id}</Text></TxRow>
        <TxRow><Text small color="textSubtle">From</Text><Text small bold>{tx.fromAmount} {fromCoin.ticker.toUpperCase()}</Text></TxRow>
        <TxRow><Text small color="textSubtle">To</Text><Text small bold>≈{toAmt} {toCoin.ticker.toUpperCase()}</Text></TxRow>
        <TxRow><Text small color="textSubtle">Recipient</Text><Text small bold style={{ fontSize: 11, wordBreak: 'break-all' }}>{address}</Text></TxRow>

        <div style={{ marginTop: 20, display: 'flex', gap: 10 }}>
          <Button
            variant="tertiary"
            scale="sm"
            fullWidth
            onClick={() => window.open(`https://changenow.io/exchange/txs/${tx.id}`, '_blank')}
          >
            🔍 Track on ChangeNow
          </Button>
          <Button scale="sm" fullWidth onClick={() => { setTx(null); setFromAmt(''); setToAmt(''); }}>
            New Exchange
          </Button>
        </div>
      </TxCard>
    );
  }

  /* ── Build embedded ChangeNow widget URL ── */
  const buildWidgetUrl = () => {
    const API_KEY = process.env.NEXT_PUBLIC_CHANGENOW_API_KEY || '';
    const base    = 'https://changenow.io/embeds/exchange-widget/v2/widget.html';
    const params  = new URLSearchParams({
      'API_KEY':       API_KEY,
      'from':          mode === 'onramp'  ? (fromFiat.ticker  || 'usd') : (fromCoin.ticker  || 'eth'),
      'to':            mode === 'offramp' ? (toFiat.ticker    || 'usd') : (toCoin.ticker    || 'bnb'),
      'amount':        fromAmt || '100',
      'backgroundColor':'transparent',
      'darkMode':      'false',
      'lang':          'en',
      'link_id':       API_KEY,
      'toWalletAddress': account || '',
    });
    if (mode === 'onramp')  params.set('isFiat', 'true');
    if (mode === 'offramp') params.set('isFiat', 'true');
    return `${base}?${params.toString()}`;
  };

  /* ── Fiat on/offramp — fully embedded, no redirect ── */
  const FiatWidget = (
    <Body style={{ padding: 0 }}>
      <iframe
        key={`${mode}-${fromFiat.ticker}-${toCoin.ticker}-${fromAmt}`}
        src={buildWidgetUrl()}
        style={{
          width:        '100%',
          height:       '420px',
          border:       'none',
          borderRadius: '0 0 24px 24px',
          display:      'block',
        }}
        allow="clipboard-write; payment"
        title="Buy / Sell Crypto"
      />
    </Body>
  );

  return (
    <>
      <Card $wide={mode !== 'exchange'}>
        <CardTop>
          <Heading scale="md">Buy Crypto</Heading>
        </CardTop>

        <ModeRow>
          <ModeBtn active={mode === 'exchange'} onClick={() => setMode('exchange')}>🔄 Exchange</ModeBtn>
          <ModeBtn active={mode === 'onramp'}   onClick={() => setMode('onramp')}>💳 Buy</ModeBtn>
          <ModeBtn active={mode === 'offramp'}  onClick={() => setMode('offramp')}>💵 Sell</ModeBtn>
        </ModeRow>

        {mode !== 'exchange' ? FiatWidget : (
          <Body>
            {/* From */}
            <Panel>
              <PanelLabel>
                <Text small color="textSubtle">You send</Text>
                <Text small color="textSubtle">Min: {minAmt > 0 ? `${minAmt} ${fromCoin.ticker.toUpperCase()}` : '—'}</Text>
              </PanelLabel>
              <PanelRow>
                <AmtInput
                  placeholder="0.0"
                  value={fromAmt}
                  onChange={e => { if (e.target.value === '' || /^\d*\.?\d*$/.test(e.target.value)) setFromAmt(e.target.value); }}
                  type="text" inputMode="decimal"
                />
                <CoinBtn onClick={() => setSelectFrom(true)}>
                  <CoinImg src={fromCoin.image} alt={fromCoin.ticker} onError={e => { (e.target as any).style.opacity = 0; }} />
                  {fromCoin.ticker.toUpperCase()} ▼
                </CoinBtn>
              </PanelRow>
            </Panel>

            <SwitchRow>
              <SwitchBtn onClick={handleSwitch} title="Switch">⇅</SwitchBtn>
            </SwitchRow>

            {/* To */}
            <Panel>
              <PanelLabel><Text small color="textSubtle">You receive</Text></PanelLabel>
              <PanelRow>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <AmtInput
                    placeholder="0.0"
                    value={estimating ? '' : toAmt}
                    readOnly
                    style={{ opacity: estimating ? 0.5 : 1 }}
                  />
                  {estimating && <Loader />}
                </div>
                <CoinBtn onClick={() => setSelectTo(true)}>
                  <CoinImg src={toCoin.image} alt={toCoin.ticker} onError={e => { (e.target as any).style.opacity = 0; }} />
                  {toCoin.ticker.toUpperCase()} ▼
                </CoinBtn>
              </PanelRow>
            </Panel>

            {/* Address */}
            <div>
              <Text small color="textSubtle" style={{ marginBottom: 6, paddingLeft: 4 }}>
                Recipient wallet address ({toCoin.ticker.toUpperCase()})
              </Text>
              <AddressInput
                placeholder={`Enter your ${toCoin.ticker.toUpperCase()} wallet address`}
                value={address}
                onChange={e => setAddress(e.target.value)}
              />
            </div>

            {/* Estimate panel */}
            {toAmt && !error && (
              <EstimateRow>
                <Text small color="textSubtle">Estimated rate</Text>
                <Text small bold>1 {fromCoin.ticker.toUpperCase()} ≈ {fromAmt && toAmt ? (Number(toAmt)/Number(fromAmt)).toFixed(6) : '—'} {toCoin.ticker.toUpperCase()}</Text>
              </EstimateRow>
            )}

            {error && <ErrorBox>⚠️ {error}</ErrorBox>}

            {minAmt > 0 && (
              <MinNote>Minimum: {minAmt} {fromCoin.ticker.toUpperCase()}</MinNote>
            )}

            <Button
              fullWidth scale="lg"
              onClick={handleExchange}
              isLoading={creating}
              disabled={!fromAmt || !toAmt || !address || !!error || creating}
              style={{ marginTop: 4 }}
            >
              {creating ? 'Creating Exchange…' : 'Exchange Now →'}
            </Button>

            <Text small color="textSubtle" textAlign="center">
              Non-custodial · No registration required · 900+ assets
            </Text>
          </Body>
        )}
      </Card>

      {/* Currency selectors */}
      {selectFrom && (
        <CurrencySelectModal
          onDismiss={() => setSelectFrom(false)}
          onSelect={c => { if (mode === 'onramp') setFromFiat(c); else setFromCoin(c); setFromAmt(''); setToAmt(''); }}
          currencies={mode === 'onramp' ? FIAT_CURRENCIES : POPULAR_CRYPTO}
          selected={mode === 'onramp' ? fromFiat : fromCoin}
          title="Select Send Currency"
        />
      )}
      {selectTo && (
        <CurrencySelectModal
          onDismiss={() => setSelectTo(false)}
          onSelect={c => { if (mode === 'offramp') setToFiat(c); else setToCoin(c); setToAmt(''); }}
          currencies={mode === 'offramp' ? FIAT_CURRENCIES : POPULAR_CRYPTO}
          selected={mode === 'offramp' ? toFiat : toCoin}
          title="Select Receive Currency"
        />
      )}
    </>
  );
};

export default BuyCryptoWidget;
