'use client';

import { useState, Suspense } from 'react';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import dynamic from 'next/dynamic';
import { useDeFiToken } from '@/hooks/useDeFiToken';
import { useDeFiBank } from '@/hooks/useDeFiBank';
import { useIdentityRegistry } from '@/hooks/useIdentityRegistry';
import { useVoting } from '@/hooks/useVoting';
import { formatEther } from 'viem';
import { FaWallet, FaSpinner } from 'react-icons/fa';
import { AnimatePresence } from 'framer-motion';
import { BankPanel } from '@/components/modules/BankPanel';

// Dynamic import for 3D scene (client-side only)
const CityScene3D = dynamic(
  () => import('@/components/CityScene3D').then((mod) => ({ default: mod.CityScene3D })),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-screen bg-gradient-to-b from-slate-900 to-blue-900">
        <FaSpinner className="text-6xl text-blue-400 animate-spin" />
      </div>
    ),
  }
);

type BuildingType = 'bank' | 'voting' | 'identity' | 'grievance' | 'healthcare' | 'supply' | 'traffic' | 'token';

export default function Home() {
  const { address, isConnected } = useAccount();
  const [activeModal, setActiveModal] = useState<BuildingType | null>(null);
  const [hoveredBuilding, setHoveredBuilding] = useState<BuildingType | null>(null);

  // Hooks
  const { useBalance } = useDeFiToken();
  const { useDeposit, deposit, withdraw } = useDeFiBank();
  const { useIsVerified } = useIdentityRegistry();
  const { useProposalCount } = useVoting();

  // Data
  const { data: balance } = useBalance(address);
  const { data: bankDeposit } = useDeposit(address);
  const { data: isVerified } = useIsVerified(address);
  const { data: proposalCount } = useProposalCount();

  // Wallet not connected view
  if (!isConnected) {
    return (
      <main className="relative h-screen w-screen overflow-hidden bg-gradient-to-b from-slate-900 via-blue-900 to-purple-900">
        {/* Animated background */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10 animate-pulse" />
        
        {/* Stars */}
        <div className="absolute inset-0">
          {[...Array(100)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                opacity: Math.random() * 0.7 + 0.3,
                animation: `pulse ${Math.random() * 3 + 2}s ease-in-out infinite`,
              }}
            />
          ))}
        </div>

        {/* Connect Wallet Prompt */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full">
          <div className="text-center bg-white/5 backdrop-blur-2xl p-12 rounded-3xl border-2 border-blue-400/50 shadow-2xl shadow-blue-500/50">
            <div className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-8 shadow-2xl shadow-blue-500/50 animate-pulse">
              <FaWallet className="w-16 h-16 text-white drop-shadow-lg" />
            </div>
            <h1 className="text-7xl font-black mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
              🏙️ NeoCity
            </h1>
            <p className="text-2xl text-gray-300 mb-12 font-semibold">
              Your Immersive 3D Smart City
            </p>
            <div className="flex justify-center mb-8">
              <ConnectButton />
            </div>
            <div className="mt-8 text-sm text-gray-400">
              <p>🏦 DeFi Banking • 🗳️ Governance • 🆔 Identity</p>
              <p>🏥 Healthcare • 🚚 Supply Chain • 🚦 Traffic Control</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-black">{
    <main className="relative h-screen w-screen overflow-hidden custom-cursor bg-gradient-to-b from-sky-300 via-blue-200 to-green-100">
      {/* Anime-style sky with beautiful gradient */}
      <div className="absolute inset-0">
        {/* Sun/light source */}
        <div className="absolute top-20 right-32 w-32 h-32 bg-yellow-200 rounded-full blur-3xl opacity-60" />
        
        {/* Fluffy anime clouds */}
        {[...Array(6)].map((_, i) => (
          <div
            key={`cloud-${i}`}
            className="absolute animate-cloud"
            style={{
              top: `${8 + i * 10}%`,
              left: `${-30 + i * 20}%`,
              animationDelay: `${i * 5}s`,
              animationDuration: `${50 + i * 10}s`,
            }}
          >
            <div className="relative opacity-90">
              <div className="w-20 h-14 bg-white rounded-full blur-sm shadow-lg" />
              <div className="absolute top-1 left-6 w-28 h-18 bg-white rounded-full blur-sm shadow-lg" />
              <div className="absolute top-3 left-14 w-18 h-12 bg-white rounded-full blur-sm shadow-lg" />
            </div>
          </div>
        ))}
      </div>

      {/* Sakura petals falling */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <div
            key={`sakura-${i}`}
            className="absolute animate-sakura"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 10}s`,
              animationDuration: `${10 + Math.random() * 5}s`,
            }}
          >
            <div className="w-3 h-3 bg-pink-300 rounded-full opacity-70 shadow-lg" 
                 style={{ 
                   clipPath: 'polygon(50% 0%, 80% 30%, 100% 50%, 80% 70%, 50% 100%, 20% 70%, 0% 50%, 20% 30%)'
                 }}
            />
          </div>
        ))}
      </div>

      {/* Ground/City base */}
      <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-gray-300 via-gray-200 to-transparent">
        {/* Roads */}
        <div className="absolute bottom-32 left-0 right-0 h-16 bg-gray-400/60 shadow-inner" />
        <div className="absolute bottom-48 left-0 right-0 h-12 bg-gray-400/40 shadow-inner" />
        
        {/* Road markings */}
        {[...Array(20)].map((_, i) => (
          <div
            key={`road-mark-${i}`}
            className="absolute bottom-36 h-2 w-12 bg-white/80"
            style={{ left: `${i * 5}%` }}
          />
        ))}
      </div>

      {/* Trees and nature elements */}
      {[...Array(15)].map((_, i) => (
        <div
          key={`tree-${i}`}
          className="absolute"
          style={{
            bottom: `${10 + Math.random() * 25}%`,
            left: `${Math.random() * 100}%`,
            zIndex: Math.random() > 0.5 ? 1 : 40,
          }}
        >
          {/* Tree trunk */}
          <div className="flex flex-col items-center">
            <div className="w-8 h-12 bg-gradient-to-b from-amber-700 to-amber-900 rounded-sm" />
            {/* Tree foliage */}
            <div className="absolute -top-8 flex flex-col items-center">
              <div className="w-16 h-16 bg-green-500 rounded-full opacity-90 shadow-lg" />
              <div className="absolute top-2 w-14 h-14 bg-green-600 rounded-full opacity-80" />
              <div className="absolute top-4 w-12 h-12 bg-green-700 rounded-full opacity-70" />
            </div>
          </div>
        </div>
      ))}

      {/* Realistic anime-style buildings */}
      {cityBuildings.map((building) => {
        const Icon = building.icon;
        const isHovered = hoveredBuilding === building.id;
        
        return (
          <div
            key={building.id}
            className="absolute custom-cursor-pointer transition-all duration-300"
            style={{
              top: building.position.top,
              left: building.position.left,
              transform: isHovered ? 'scale(1.08) translateY(-8px)' : 'scale(1)',
              zIndex: building.style === 'skyscraper' ? 30 : 20,
            }}
            onMouseEnter={() => setHoveredBuilding(building.id)}
            onMouseLeave={() => setHoveredBuilding(null)}
            onClick={() => setActiveModal(building.id)}
          >
            {/* Realistic anime-style building */}
            <div className="relative" style={{ width: `${building.size.width}px` }}>
              {/* Building shadow */}
              <div 
                className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-black/30 rounded-full blur-xl"
                style={{
                  width: `${building.size.width * 0.8}px`,
                  height: '20px',
                }}
              />

              {/* Main building body */}
              <div
                className={`relative bg-gradient-to-br ${building.gradient} rounded-t-lg shadow-2xl border-4 border-white/30 overflow-hidden ${isHovered ? 'shadow-yellow-400/50' : ''}`}
                style={{
                  width: `${building.size.width}px`,
                  height: `${building.size.height}px`,
                }}
              >
                {/* Building details based on style */}
                {building.style === 'skyscraper' && (
                  <>
                    {/* Modern skyscraper windows */}
                    <div className="grid grid-cols-4 gap-2 p-3 h-full">
                      {[...Array(building.floors * 4)].map((_, i) => (
                        <div
                          key={i}
                          className="bg-gradient-to-b from-cyan-100 to-blue-200 rounded-sm shadow-inner"
                          style={{
                            opacity: Math.random() > 0.2 ? 0.9 : 0.4,
                            boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.3)',
                          }}
                        />
                      ))}
                    </div>
                    {/* Antenna */}
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-1 h-8 bg-red-500 shadow-lg">
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-red-600 rounded-full animate-pulse" />
                    </div>
                  </>
                )}

                {building.style === 'tower' && (
                  <>
                    {/* Classic tower design */}
                    <div className="grid grid-cols-3 gap-2 p-2 h-full">
                      {[...Array(building.floors * 3)].map((_, i) => (
                        <div
                          key={i}
                          className="bg-amber-100 rounded-sm border border-amber-300/50"
                          style={{
                            opacity: Math.random() > 0.3 ? 0.95 : 0.5,
                          }}
                        />
                      ))}
                    </div>
                  </>
                )}

                {building.style === 'dome' && (
                  <>
                    {/* Domed building */}
                    <div className="grid grid-cols-5 gap-1 p-2 h-3/4">
                      {[...Array(20)].map((_, i) => (
                        <div
                          key={i}
                          className="bg-purple-100 rounded"
                          style={{ opacity: 0.8 }}
                        />
                      ))}
                    </div>
                    {/* Dome top */}
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-24 h-12 bg-gradient-to-b from-purple-300 to-purple-500 rounded-t-full border-2 border-white/40 shadow-xl" />
                  </>
                )}

                {building.style === 'modern' && (
                  <>
                    {/* Modern office building */}
                    <div className="grid grid-cols-3 gap-3 p-3 h-full">
                      {[...Array(building.floors * 3)].map((_, i) => (
                        <div
                          key={i}
                          className="bg-gradient-to-br from-green-50 to-emerald-100 rounded border border-white/40"
                          style={{ opacity: 0.9 }}
                        />
                      ))}
                    </div>
                  </>
                )}

                {building.style === 'classical' && (
                  <>
                    {/* Classical government building */}
                    <div className="flex flex-col h-full">
                      {/* Columns */}
                      <div className="flex justify-around px-2 py-2">
                        {[...Array(5)].map((_, i) => (
                          <div key={i} className="w-3 h-full bg-white/80 rounded-t shadow-md" />
                        ))}
                      </div>
                      {/* Windows */}
                      <div className="grid grid-cols-4 gap-2 p-2 flex-1">
                        {[...Array(12)].map((_, i) => (
                          <div key={i} className="bg-orange-100 rounded" style={{ opacity: 0.9 }} />
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {building.style === 'hospital' && (
                  <>
                    {/* Hospital building */}
                    <div className="grid grid-cols-4 gap-2 p-2 h-full">
                      {[...Array(building.floors * 4)].map((_, i) => (
                        <div
                          key={i}
                          className="bg-red-50 rounded"
                          style={{ opacity: 0.85 }}
                        />
                      ))}
                    </div>
                    {/* Red cross */}
                    <div className="absolute top-4 left-1/2 -translate-x-1/2">
                      <div className="relative w-8 h-8">
                        <div className="absolute top-0 left-3 w-2 h-8 bg-white rounded" />
                        <div className="absolute top-3 left-0 w-8 h-2 bg-white rounded" />
                      </div>
                    </div>
                  </>
                )}

                {building.style === 'warehouse' && (
                  <>
                    {/* Warehouse/logistics building */}
                    <div className="grid grid-cols-3 gap-3 p-3 h-full">
                      {[...Array(6)].map((_, i) => (
                        <div
                          key={i}
                          className="bg-indigo-100 rounded-lg border-2 border-indigo-300"
                          style={{ opacity: 0.8 }}
                        />
                      ))}
                    </div>
                  </>
                )}

                {building.style === 'tech' && (
                  <>
                    {/* Tech/control center */}
                    <div className="grid grid-cols-3 gap-2 p-2 h-full">
                      {[...Array(building.floors * 3)].map((_, i) => (
                        <div
                          key={i}
                          className="bg-gradient-to-br from-teal-100 to-cyan-200 rounded"
                          style={{ opacity: Math.random() > 0.2 ? 0.9 : 0.5 }}
                        />
                      ))}
                    </div>
                  </>
                )}

                {/* Glowing effect when hovered */}
                {isHovered && (
                  <div className="absolute inset-0 bg-white/20 animate-pulse rounded-t-lg" />
                )}
              </div>

              {/* Building rooftop */}
              <div className={`absolute -top-2 left-0 right-0 h-2 bg-gradient-to-r ${building.gradient} opacity-80 rounded-t`} />

              {/* Icon badge */}
              <div className={`absolute -top-12 left-1/2 -translate-x-1/2 w-14 h-14 bg-gradient-to-br ${building.gradient} rounded-full flex items-center justify-center border-3 border-white shadow-2xl ${isHovered ? 'animate-float scale-110' : ''}`}>
                <Icon className="text-white text-xl drop-shadow-lg" />
              </div>

              {/* Building name label */}
              <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 whitespace-nowrap">
                <div className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-xl border-2 border-gray-200 shadow-lg">
                  <p className="text-gray-800 text-xs font-bold">{building.name}</p>
                  <p className="text-gray-500 text-[10px]">{building.floors} floors</p>
                </div>
              </div>

              {/* Hover tooltip */}
              {isHovered && (
                <div className="absolute -top-24 left-1/2 -translate-x-1/2 whitespace-nowrap animate-fadeIn z-50">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-500 px-4 py-2 rounded-xl shadow-2xl border-2 border-white/50">
                    <p className="text-white text-sm font-semibold">{building.description}</p>
                    <p className="text-white/90 text-xs mt-1">✨ Click to explore</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Top status bar with anime style */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-40">
        <div className="flex gap-3">
          <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl border-2 border-blue-300 shadow-lg">
            <span className="text-blue-600 text-sm font-bold">
              💰 {balance ? `${formatEther(balance as bigint).slice(0, 8)} NEO` : '0 NEO'}
            </span>
          </div>
          <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl border-2 border-green-300 shadow-lg">
            <span className={`text-sm font-bold ${isVerified ? 'text-green-600' : 'text-orange-600'}`}>
              {isVerified ? '✓ Verified Citizen' : '⚠ Register ID'}
            </span>
          </div>
        </div>
        <div className="bg-white/90 backdrop-blur-md rounded-xl border-2 border-purple-300 shadow-lg">
          <ConnectButton />
        </div>
      </div>

      {/* City title with anime style */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 text-center pointer-events-none z-10">
        <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 drop-shadow-2xl animate-gradient">
          🏙️ NEOCITY 🏙️
        </h1>
        <p className="text-xl text-gray-700 font-semibold mt-2 drop-shadow-lg">Your Anime Smart City</p>
      </div>

      {/* Modals for each building */}
      {activeModal && (() => {
        const building = cityBuildings.find(b => b.id === activeModal);
        if (!building) return null;

        return (
          <Modal
            isOpen={true}
            onClose={() => setActiveModal(null)}
            title={building.name}
            color={building.color}
          >
            {activeModal === 'token' && (
              <TokenModal balance={balance} useMint={useMint} address={address} />
            )}
            {activeModal === 'bank' && (
              <BankModal 
                balance={balance} 
                deposit={deposit} 
                withdraw={withdraw} 
                bankDeposit={bankDeposit}
              />
            )}
            {activeModal === 'identity' && (
              <IdentityModal isVerified={isVerified} register={register} />
            )}
            {activeModal === 'voting' && (
              <VotingModal proposalCount={proposalCount} />
            )}
            {activeModal === 'grievance' && (
              <ComingSoonModal name="Justice Court" />
            )}
            {activeModal === 'healthcare' && (
              <ComingSoonModal name="Health Records" />
            )}
            {activeModal === 'supply' && (
              <ComingSoonModal name="Supply Chain" />
            )}
            {activeModal === 'traffic' && (
              <ComingSoonModal name="Traffic Control" />
            )}
          </Modal>
        );
      })()}
    </main>
  );
}

// Modal Components
function TokenModal({ balance, useMint, address }: any) {
  const [amount, setAmount] = useState('');
  const { data: mintData, isLoading, writeContract } = useMint();

  const handleMint = () => {
    if (!amount || !address) return;
    writeContract({
      args: [address, parseEther(amount)],
    });
  };

  return (
    <div className="space-y-6 text-white">
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
        <h3 className="text-xl font-bold mb-2">Your Balance</h3>
        <p className="text-4xl font-bold text-yellow-400">
          {balance ? `${formatEther(balance as bigint).slice(0, 10)} NEO` : '0 NEO'}
        </p>
      </div>

      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
        <h3 className="text-xl font-bold mb-4">Mint Tokens</h3>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount to mint"
          className="w-full px-4 py-3 bg-black/30 border border-white/30 rounded-lg text-white placeholder-gray-400 mb-4"
        />
        <button
          onClick={handleMint}
          disabled={isLoading}
          className="w-full px-6 py-3 bg-gradient-to-r from-yellow-500 to-amber-600 text-white font-bold rounded-lg hover:from-yellow-600 hover:to-amber-700 transition-all disabled:opacity-50 custom-cursor-pointer"
        >
          {isLoading ? 'Minting...' : 'Mint NEO Tokens'}
        </button>
      </div>
    </div>
  );
}

function BankModal({ balance, deposit, withdraw, bankDeposit }: any) {
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');

  const handleDeposit = () => {
    if (!depositAmount) return;
    deposit?.({ args: [parseEther(depositAmount)] });
  };

  const handleWithdraw = () => {
    if (!withdrawAmount) return;
    withdraw?.({ args: [parseEther(withdrawAmount)] });
  };

  return (
    <div className="space-y-6 text-white">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
          <h3 className="text-sm mb-1 text-gray-300">Wallet Balance</h3>
          <p className="text-2xl font-bold text-blue-400">
            {balance ? `${formatEther(balance as bigint).slice(0, 8)} NEO` : '0 NEO'}
          </p>
        </div>
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
          <h3 className="text-sm mb-1 text-gray-300">Bank Deposit</h3>
          <p className="text-2xl font-bold text-green-400">
            {bankDeposit && Array.isArray(bankDeposit) && bankDeposit[0]
              ? `${formatEther(bankDeposit[0] as bigint).slice(0, 8)} NEO`
              : '0 NEO'}
          </p>
        </div>
      </div>

      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
        <h3 className="text-xl font-bold mb-4">Deposit Funds</h3>
        <input
          type="number"
          value={depositAmount}
          onChange={(e) => setDepositAmount(e.target.value)}
          placeholder="Amount to deposit"
          className="w-full px-4 py-3 bg-black/30 border border-white/30 rounded-lg text-white placeholder-gray-400 mb-4"
        />
        <button
          onClick={handleDeposit}
          className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-bold rounded-lg hover:from-blue-600 hover:to-cyan-700 transition-all custom-cursor-pointer"
        >
          Deposit
        </button>
      </div>

      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
        <h3 className="text-xl font-bold mb-4">Withdraw Funds</h3>
        <input
          type="number"
          value={withdrawAmount}
          onChange={(e) => setWithdrawAmount(e.target.value)}
          placeholder="Amount to withdraw"
          className="w-full px-4 py-3 bg-black/30 border border-white/30 rounded-lg text-white placeholder-gray-400 mb-4"
        />
        <button
          onClick={handleWithdraw}
          className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all custom-cursor-pointer"
        >
          Withdraw
        </button>
      </div>
    </div>
  );
}

function IdentityModal({ isVerified, register }: any) {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');

  const handleRegister = () => {
    if (!name || !age) return;
    register?.({ args: [name, parseInt(age)] });
  };

  return (
    <div className="space-y-6 text-white">
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
        <h3 className="text-xl font-bold mb-2">Identity Status</h3>
        <div className={`text-3xl font-bold ${isVerified ? 'text-green-400' : 'text-orange-400'}`}>
          {isVerified ? '✓ Verified Citizen' : '⚠ Unverified'}
        </div>
      </div>

      {!isVerified && (
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <h3 className="text-xl font-bold mb-4">Register Identity</h3>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full Name"
            className="w-full px-4 py-3 bg-black/30 border border-white/30 rounded-lg text-white placeholder-gray-400 mb-4"
          />
          <input
            type="number"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            placeholder="Age"
            className="w-full px-4 py-3 bg-black/30 border border-white/30 rounded-lg text-white placeholder-gray-400 mb-4"
          />
          <button
            onClick={handleRegister}
            className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all custom-cursor-pointer"
          >
            Register
          </button>
        </div>
      )}
    </div>
  );
}

function VotingModal({ proposalCount }: any) {
  return (
    <div className="space-y-6 text-white">
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
        <h3 className="text-xl font-bold mb-2">Active Proposals</h3>
        <p className="text-4xl font-bold text-purple-400">
          {proposalCount?.toString() || '0'}
        </p>
      </div>

      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
        <h3 className="text-xl font-bold mb-4">Recent Proposals</h3>
        <p className="text-gray-400">No proposals found. Create the first one!</p>
      </div>
    </div>
  );
}

function ComingSoonModal({ name }: { name: string }) {
  return (
    <div className="space-y-6 text-white text-center py-12">
      <div className="text-6xl mb-4">🚧</div>
      <h3 className="text-3xl font-bold mb-4">{name}</h3>
      <p className="text-xl text-gray-300">Coming Soon to NeoCity!</p>
      <p className="text-gray-400">This feature is currently under development.</p>
    </div>
  );
}
