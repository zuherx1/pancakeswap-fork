import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { PancakeLogo } from '../ui/Icons';
import { Button } from '../ui/Button';
import { useThemeContext } from '../../context/ThemeContext';
import WalletModal from '../wallet/WalletModal';

/* ─── Nav data ─────────────────────────────────────────────────────────────── */
const NAV_ITEMS = [
  {
    label: 'Trade',
    icon: '💱',
    children: [
      { label: 'Swap',        href: '/trade/swap',        icon: '🔄' },
      { label: 'Buy Crypto',  href: '/trade/buy-crypto',  icon: '💳' },
      { label: 'Liquidity',   href: '/trade/liquidity',   icon: '💧' },
    ],
  },
  {
    label: 'Perps',
    icon: '📈',
    href: '/perps',
  },
  {
    label: 'Earn',
    icon: '💰',
    children: [
      { label: 'Farm',        href: '/earn/farms',        icon: '🌾' },
      { label: 'Pools',       href: '/earn/pools',        icon: '🏊' },
    ],
  },
  {
    label: 'Play',
    icon: '🎮',
    children: [
      { label: 'Springboard', href: '/play/springboard',  icon: '🚀' },
      { label: 'Prediction',  href: '/play/prediction',   icon: '🔮' },
      { label: 'Lottery',     href: '/play/lottery',      icon: '🎰' },
      { label: 'CakePad',     href: '/play/cakepad',      icon: '🎂' },
    ],
  },
  {
    label: 'Board',
    icon: '📊',
    children: [
      { label: 'Info',        href: '/board/info',        icon: '📉' },
      { label: 'Burn',        href: '/board/burn',        icon: '🔥' },
      { label: 'Voting',      href: '/board/voting',      icon: '🗳️' },
      { label: 'Blog',        href: '/board/blog',        icon: '📝' },
    ],
  },
];

/* ─── Styled components ─────────────────────────────────────────────────────── */
const HeaderOuter = styled.header`
  position: sticky;
  top: 0;
  z-index: ${({ theme }) => theme.zIndices.sticky};
  width: 100%;
`;

const HeaderInner = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border-bottom: 1px solid ${({ theme }) => theme.colors.cardBorder};
  height: 56px;
  padding: 0 16px;
  backdrop-filter: blur(8px);
`;

const LogoArea = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  cursor: pointer;
`;

const LogoText = styled.span`
  font-size: 20px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  font-family: 'Kanit', sans-serif;
  @media (max-width: 768px) { display: none; }
`;

const NavList = styled.nav`
  display: flex;
  align-items: center;
  gap: 2px;
  @media (max-width: 968px) { display: none; }
`;

const NavItem = styled.div`
  position: relative;
`;

const NavBtn = styled.button<{ active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 12px;
  background: ${({ active, theme }) => active ? theme.colors.input : 'transparent'};
  color: ${({ active, theme }) => active ? theme.colors.primary : theme.colors.textSubtle};
  font-size: 16px;
  font-weight: 600;
  font-family: 'Kanit', sans-serif;
  cursor: pointer;
  border: none;
  transition: all 0.15s;
  white-space: nowrap;

  &:hover {
    background: ${({ theme }) => theme.colors.input};
    color: ${({ theme }) => theme.colors.text};
  }

  svg { transition: transform 0.2s; }
  &:hover svg, &[data-open="true"] svg { transform: rotate(180deg); }
`;

const Dropdown = styled.div<{ open: boolean }>`
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  min-width: 200px;
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  border-radius: 16px;
  padding: 8px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.12);
  z-index: 100;
  display: ${({ open }) => (open ? 'block' : 'none')};
  animation: slideDown 0.15s ease;

  @keyframes slideDown {
    from { opacity: 0; transform: translateY(-8px); }
    to   { opacity: 1; transform: translateY(0); }
  }
`;

const DropdownLink = styled.span<{ active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 12px;
  color: ${({ active, theme }) => active ? theme.colors.primary : theme.colors.text};
  font-size: 15px;
  font-weight: ${({ active }) => (active ? 600 : 400)};
  text-decoration: none;
  transition: background 0.15s;
  background: ${({ active, theme }) => active ? theme.colors.input : 'transparent'};

  &:hover {
    background: ${({ theme }) => theme.colors.input};
    color: ${({ theme }) => theme.colors.primary};
    text-decoration: none;
  }

  span.icon { font-size: 18px; }
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ThemeToggle = styled.button`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: ${({ theme }) => theme.colors.input};
  color: ${({ theme }) => theme.colors.textSubtle};
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s;
  &:hover { background: ${({ theme }) => theme.colors.inputSecondary}; }
`;

const NetworkBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.input};
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  transition: background 0.2s;
  &:hover { background: ${({ theme }) => theme.colors.inputSecondary}; }

  @media (max-width: 576px) { display: none; }
`;

const BnbDot = styled.div`
  width: 8px; height: 8px;
  border-radius: 50%;
  background: #F0B90B;
`;

const HamburgerBtn = styled.button`
  display: none;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: none;
  background: ${({ theme }) => theme.colors.input};
  color: ${({ theme }) => theme.colors.text};
  font-size: 20px;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  @media (max-width: 968px) { display: flex; }
`;

/* ─── Mobile drawer ─────────────────────────────────────────────────────────── */
const MobileDrawer = styled.div<{ open: boolean }>`
  position: fixed;
  inset: 0;
  z-index: ${({ theme }) => theme.zIndices.fixed};
  display: ${({ open }) => (open ? 'flex' : 'none')};
`;

const DrawerOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.5);
`;

const DrawerPanel = styled.div`
  position: relative;
  width: 280px;
  height: 100%;
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border-right: 1px solid ${({ theme }) => theme.colors.cardBorder};
  overflow-y: auto;
  padding: 24px 16px;
  z-index: 1;
`;

const MobileNavSection = styled.div`
  margin-bottom: 8px;
`;

const MobileNavGroup = styled.div`
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: ${({ theme }) => theme.colors.textSubtle};
  padding: 8px 12px 4px;
`;

const MobileNavLink = styled.span<{ active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 12px;
  color: ${({ active, theme }) => active ? theme.colors.primary : theme.colors.text};
  font-size: 16px;
  font-weight: ${({ active }) => (active ? 600 : 400)};
  text-decoration: none;
  background: ${({ active, theme }) => active ? theme.colors.input : 'transparent'};
  transition: background 0.15s;

  &:hover { background: ${({ theme }) => theme.colors.input}; text-decoration: none; }
`;

/* ─── Component ─────────────────────────────────────────────────────────────── */
const Header: React.FC = () => {
  const router = useRouter();
  const { isDark, toggleTheme } = useThemeContext();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [walletOpen, setWalletOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close mobile on route change
  useEffect(() => { setMobileOpen(false); }, [router.pathname]);

  const isActive = (href?: string, children?: any[]) => {
    if (href) return router.pathname === href || router.pathname.startsWith(href);
    if (children) return children.some(c => router.pathname.startsWith(c.href));
    return false;
  };

  return (
    <>
      <HeaderOuter>
        <HeaderInner>
          {/* Logo */}
          <Link href="/" style={{ textDecoration: 'none' }}>
            <LogoArea>
              <PancakeLogo size={36} />
              <LogoText>PancakeSwap</LogoText>
            </LogoArea>
          </Link>

          {/* Desktop Nav */}
          <NavList ref={dropdownRef}>
            {NAV_ITEMS.map((item) => (
              <NavItem key={item.label}>
                {item.href ? (
                  <Link href={item.href} style={{ textDecoration: 'none' }}>
                    <NavBtn active={isActive(item.href)}>
                      {item.icon} {item.label}
                    </NavBtn>
                  </Link>
                ) : (
                  <>
                    <NavBtn
                      active={isActive(undefined, item.children)}
                      data-open={openDropdown === item.label ? 'true' : 'false'}
                      onClick={() => setOpenDropdown(openDropdown === item.label ? null : item.label)}
                    >
                      {item.icon} {item.label}
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </NavBtn>
                    <Dropdown open={openDropdown === item.label}>
                      {item.children?.map((child) => (
                        <Link key={child.href} href={child.href} style={{ textDecoration: 'none' }}>
                          <DropdownLink
                            active={router.pathname === child.href}
                            onClick={() => setOpenDropdown(null)}
                          >
                            <span className="icon">{child.icon}</span>
                            {child.label}
                          </DropdownLink>
                        </Link>
                      ))}
                    </Dropdown>
                  </>
                )}
              </NavItem>
            ))}
          </NavList>

          {/* Right section */}
          <RightSection>
            <NetworkBadge>
              <BnbDot />
              BNB Chain
            </NetworkBadge>
            <ThemeToggle onClick={toggleTheme} title="Toggle theme">
              {isDark ? '☀️' : '🌙'}
            </ThemeToggle>
            <Button scale="sm" onClick={() => setWalletOpen(true)}>
              🔓 Connect Wallet
            </Button>
            <HamburgerBtn onClick={() => setMobileOpen(true)}>☰</HamburgerBtn>
          </RightSection>
        </HeaderInner>
      </HeaderOuter>

      {/* Mobile Drawer */}
      <MobileDrawer open={mobileOpen}>
        <DrawerOverlay onClick={() => setMobileOpen(false)} />
        <DrawerPanel>
          <LogoArea style={{ marginBottom: 24 }}>
            <PancakeLogo size={32} />
            <LogoText style={{ display: 'block' }}>PancakeSwap</LogoText>
          </LogoArea>
          {NAV_ITEMS.map((item) => (
            <MobileNavSection key={item.label}>
              <MobileNavGroup>{item.icon} {item.label}</MobileNavGroup>
              {item.href ? (
                <Link href={item.href} style={{ textDecoration: 'none' }}>
                  <MobileNavLink active={isActive(item.href)}>{item.label}</MobileNavLink>
                </Link>
              ) : (
                item.children?.map((child) => (
                  <Link key={child.href} href={child.href} style={{ textDecoration: 'none' }}>
                    <MobileNavLink active={router.pathname === child.href}>
                      {child.icon} {child.label}
                    </MobileNavLink>
                  </Link>
                ))
              )}
            </MobileNavSection>
          ))}
          <div style={{ marginTop: 24 }}>
            <Button fullWidth onClick={() => { setWalletOpen(true); setMobileOpen(false); }}>
              🔓 Connect Wallet
            </Button>
          </div>
        </DrawerPanel>
      </MobileDrawer>

      {/* Wallet Modal */}
      {walletOpen && <WalletModal onDismiss={() => setWalletOpen(false)} />}
    </>
  );
};

export default Header;
