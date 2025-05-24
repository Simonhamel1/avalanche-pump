
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, Zap, Shield, TrendingUp, Rocket, Star, Globe, Code, Users } from 'lucide-react';

const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-avalanche-red/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-avalanche-red/5 to-blue-500/5 rounded-full blur-3xl animate-spin [animation-duration:60s]"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-avalanche-red to-white mb-6 tracking-tight glow-text">
            ABOUT AVALANCHE
            <br />
            <span className="text-avalanche-red">PUMP</span>
          </h1>
          <div className="flex items-center justify-center space-x-4 mb-6">
            <Globe className="w-8 h-8 text-avalanche-red animate-bounce" />
            <p className="text-xl md:text-2xl text-gray-300 font-bold tracking-wide">
              THE FUTURE OF TOKEN CREATION
            </p>
            <Globe className="w-8 h-8 text-avalanche-red animate-bounce delay-500" />
          </div>
          <p className="text-lg text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Discover the revolutionary platform that's changing how tokens are created, 
            traded, and pumped on the Avalanche blockchain.
          </p>
        </div>

        {/* Main Content Card */}
        <Card className="pump-card group bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border-gray-700/50 hover:border-avalanche-red/50 transition-all duration-500 mb-12">
          <CardHeader>
            <CardTitle className="flex items-center space-x-3 text-2xl font-black text-white glow-text">
              <Rocket className="w-8 h-8 text-avalanche-red" />
              <span>What is AvalanchePump?</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-gray-300 leading-relaxed text-lg">
              AvalanchePump is a decentralized platform that democratizes token creation on the 
              Avalanche blockchain. Inspired by the success of Pump.fun, our platform uses 
              bonding curve technology to ensure fair and transparent pricing for all tokens.
            </p>
            <p className="text-gray-300 leading-relaxed text-lg">
              Our mission is to make token creation accessible to everyone while providing 
              a secure environment for investors. Every token follows a mathematical pricing 
              curve that guarantees liquidity and transparency.
            </p>
          </CardContent>
        </Card>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="pump-card group bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border-gray-700/50 hover:border-green-500/50 transition-all duration-500 transform hover:scale-105">
            <CardHeader>
              <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-3xl flex items-center justify-center mb-4 glow-icon group-hover:animate-pulse">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-xl font-black text-white glow-text">
                BONDING CURVE
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 leading-relaxed">
                Automatic pricing system that adjusts based on supply and demand, 
                ensuring constant liquidity and fair token distribution.
              </p>
            </CardContent>
          </Card>

          <Card className="pump-card group bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border-gray-700/50 hover:border-blue-500/50 transition-all duration-500 transform hover:scale-105">
            <CardHeader>
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-3xl flex items-center justify-center mb-4 glow-icon group-hover:animate-pulse">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-xl font-black text-white glow-text">
                SECURITY FIRST
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 leading-relaxed">
                Audited smart contracts on Avalanche, transparent transactions, 
                and protection mechanisms against market manipulation.
              </p>
            </CardContent>
          </Card>

          <Card className="pump-card group bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border-gray-700/50 hover:border-avalanche-red/50 transition-all duration-500 transform hover:scale-105">
            <CardHeader>
              <div className="w-16 h-16 bg-gradient-to-br from-avalanche-red to-red-600 rounded-3xl flex items-center justify-center mb-4 glow-icon group-hover:animate-pulse">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-xl font-black text-white glow-text">
                LIGHTNING FAST
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 leading-relaxed">
                Ultra-fast and low-cost transactions powered by Avalanche blockchain, 
                perfect for high-frequency trading and token creation.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Technology Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <Card className="pump-card bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border-gray-700/50 hover:border-avalanche-red/50 transition-all duration-500">
            <CardHeader>
              <CardTitle className="text-2xl font-black text-white glow-text flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-avalanche-red to-red-600 rounded-2xl flex items-center justify-center">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <span>AVALANCHE BLOCKCHAIN</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-gray-300 text-lg">
                Avalanche is a next-generation blockchain platform offering:
              </p>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-avalanche-red rounded-full mt-3 animate-pulse"></div>
                  <span className="text-gray-300">Ultra-fast transactions (sub-second finality)</span>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-avalanche-red rounded-full mt-3 animate-pulse"></div>
                  <span className="text-gray-300">Extremely low transaction fees</span>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-avalanche-red rounded-full mt-3 animate-pulse"></div>
                  <span className="text-gray-300">Eco-friendly and sustainable consensus</span>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-avalanche-red rounded-full mt-3 animate-pulse"></div>
                  <span className="text-gray-300">Full Ethereum ecosystem compatibility</span>
                </div>
              </div>
              <Button
                asChild
                className="neon-button bg-gradient-to-r from-avalanche-red to-red-600 hover:from-red-600 hover:to-avalanche-red text-white font-bold px-6 py-3 rounded-2xl transform hover:scale-105 transition-all duration-300"
              >
                <a 
                  href="https://www.avax.network/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2"
                >
                  <span>LEARN MORE ABOUT AVALANCHE</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </Button>
            </CardContent>
          </Card>

          <Card className="pump-card bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border-gray-700/50 hover:border-blue-500/50 transition-all duration-500">
            <CardHeader>
              <CardTitle className="text-2xl font-black text-white glow-text flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center">
                  <Code className="w-6 h-6 text-white" />
                </div>
                <span>CHAINLINK CCIP</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-gray-300 text-lg">
                Coming soon, Chainlink CCIP integration for:
              </p>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-3 animate-pulse"></div>
                  <span className="text-gray-300">Cross-chain interoperability</span>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-3 animate-pulse"></div>
                  <span className="text-gray-300">Cross-chain token transfers</span>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-3 animate-pulse"></div>
                  <span className="text-gray-300">Reliable and decentralized price data</span>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-3 animate-pulse"></div>
                  <span className="text-gray-300">Secure infrastructure for DeFi</span>
                </div>
              </div>
              <Button
                asChild
                className="neon-button bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-cyan-500 hover:to-blue-500 text-white font-bold px-6 py-3 rounded-2xl transform hover:scale-105 transition-all duration-300"
              >
                <a 
                  href="https://chain.link/cross-chain" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2"
                >
                  <span>DISCOVER CHAINLINK CCIP</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Roadmap */}
        <Card className="pump-card bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border-gray-700/50 hover:border-avalanche-red/50 transition-all duration-500">
          <CardHeader>
            <CardTitle className="text-3xl font-black text-white glow-text flex items-center space-x-3">
              <Star className="w-8 h-8 text-avalanche-red animate-spin [animation-duration:3s]" />
              <span>ROADMAP TO THE MOON</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              <div className="flex items-start space-x-4">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <div className="flex-1">
                  <h4 className="font-black text-xl text-green-400 mb-2">PHASE 1 - LAUNCH (CURRENT)</h4>
                  <p className="text-gray-300 text-lg">User interface, bonding curves, token creation system</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center animate-pulse">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <div className="flex-1">
                  <h4 className="font-black text-xl text-yellow-400 mb-2">PHASE 2 - SMART CONTRACTS</h4>
                  <p className="text-gray-300 text-lg">Contract deployment, wallet integration, real transactions</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-6 h-6 bg-gray-500 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <div className="flex-1">
                  <h4 className="font-black text-xl text-gray-400 mb-2">PHASE 3 - CHAINLINK CCIP</h4>
                  <p className="text-gray-300 text-lg">Interoperability, price oracles, advanced features</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default About;
