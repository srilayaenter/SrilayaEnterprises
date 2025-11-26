import React, { useState, useCallback } from 'react';
import { EyeIcon, RefreshCcw, Copy, Palette } from 'lucide-react';

function App() {
  const [color1, setColor1] = useState('#FFFFFF');
  const [color2, setColor2] = useState('#000000');

  const calculateContrastRatio = useCallback((c1: string, c2: string) => {
    const getLuminance = (hex: string) => {
      const rgb = parseInt(hex.slice(1), 16);
      const r = (rgb >> 16) & 0xff;
      const g = (rgb >> 8) & 0xff;
      const b = rgb & 0xff;

      const [rs, gs, bs] = [r / 255, g / 255, b / 255].map(val => {
        return val <= 0.03928
          ? val / 12.92
          : Math.pow((val + 0.055) / 1.055, 2.4);
      });

      return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    };

    const l1 = getLuminance(c1);
    const l2 = getLuminance(c2);
    const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
    return Math.round(ratio * 100) / 100;
  }, []);

  const getWCAGLevel = useCallback((ratio: number) => {
    if (ratio >= 7) return 'AAA';
    if (ratio >= 4.5) return 'AA';
    if (ratio >= 3) return 'AA Large';
    return 'Fail';
  }, []);

  const swapColors = () => {
    setColor1(color2);
    setColor2(color1);
  };

  const contrastRatio = calculateContrastRatio(color1, color2);
  const wcagLevel = getWCAGLevel(contrastRatio);

  const copyToClipboard = (colors: string) => {
    navigator.clipboard.writeText(colors);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 backdrop-blur-sm">
              <Palette className="w-10 h-10 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600" />
            </div>
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 ml-3">
              对比色生成器
            </h1>
          </div>
          <p className="text-gray-700 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 bg-clip-text">
            创建完美的色彩组合，确保最佳的可读性和可访问性
          </p>
        </div>
        
        <div className="bg-gradient-to-br from-white/95 to-white/90 rounded-2xl shadow-2xl p-8 mb-8 backdrop-blur-sm border border-white/20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <label className="block text-sm font-medium bg-gradient-to-r from-gray-800 to-gray-700 bg-clip-text text-transparent">
                颜色 1
              </label>
              <div className="relative">
                <input
                  type="color"
                  value={color1}
                  onChange={(e) => setColor1(e.target.value)}
                  className="h-16 w-full rounded-xl cursor-pointer border-2 border-gray-300 focus:border-blue-500 transition-colors bg-gradient-to-br from-white to-gray-50"
                />
                <input
                  type="text"
                  value={color1.toUpperCase()}
                  onChange={(e) => setColor1(e.target.value)}
                  className="mt-2 w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none bg-gradient-to-br from-white to-gray-50 shadow-sm"
                  placeholder="输入十六进制颜色值"
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <label className="block text-sm font-medium bg-gradient-to-r from-gray-800 to-gray-700 bg-clip-text text-transparent">
                颜色 2
              </label>
              <div className="relative">
                <input
                  type="color"
                  value={color2}
                  onChange={(e) => setColor2(e.target.value)}
                  className="h-16 w-full rounded-xl cursor-pointer border-2 border-gray-300 focus:border-blue-500 transition-colors bg-gradient-to-br from-white to-gray-50"
                />
                <input
                  type="text"
                  value={color2.toUpperCase()}
                  onChange={(e) => setColor2(e.target.value)}
                  className="mt-2 w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none bg-gradient-to-br from-white to-gray-50 shadow-sm"
                  placeholder="输入十六进制颜色值"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-center mt-8">
            <button
              onClick={swapColors}
              className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white rounded-xl hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 shadow-lg"
            >
              <RefreshCcw className="w-5 h-5 mr-2" />
              交换颜色
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div 
            style={{ backgroundColor: color1, color: color2 }}
            className="p-8 rounded-2xl shadow-2xl flex items-center justify-center text-center min-h-[200px] transform hover:scale-[1.02] transition-transform border border-gray-200/20 backdrop-blur-sm"
          >
            <div>
              <p className="text-2xl font-medium mb-2">示例文本</p>
              <p className="opacity-90">这是一段更小的文字示例</p>
            </div>
          </div>
          
          <div 
            style={{ backgroundColor: color2, color: color1 }}
            className="p-8 rounded-2xl shadow-2xl flex items-center justify-center text-center min-h-[200px] transform hover:scale-[1.02] transition-transform border border-gray-200/20 backdrop-blur-sm"
          >
            <div>
              <p className="text-2xl font-medium mb-2">示例文本</p>
              <p className="opacity-90">这是一段更小的文字示例</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-white/95 to-white/90 rounded-2xl shadow-2xl p-8 backdrop-blur-sm border border-white/20">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10">
                <EyeIcon className="w-6 h-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600" />
              </div>
              <h2 className="text-2xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 ml-3">
                对比度分析
              </h2>
            </div>
            <button
              onClick={() => copyToClipboard(`${color1} ${color2}`)}
              className="flex items-center px-4 py-2 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg hover:from-gray-100 hover:to-gray-200 transition-colors shadow-sm border border-gray-200"
            >
              <Copy className="w-4 h-4 mr-2" />
              复制颜色
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <p className="text-lg bg-gradient-to-r from-gray-800 to-gray-700 bg-clip-text text-transparent">对比度比率</p>
              <p className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
                {contrastRatio}:1
              </p>
            </div>
            
            <div className="space-y-2">
              <p className="text-lg bg-gradient-to-r from-gray-800 to-gray-700 bg-clip-text text-transparent">WCAG 2.1 等级</p>
              <div className="flex items-center space-x-3">
                <span className={`inline-block px-4 py-2 rounded-lg font-medium text-lg shadow-sm ${
                  wcagLevel === 'Fail' ? 'bg-gradient-to-r from-red-100 to-red-50 text-red-900 border border-red-200' :
                  wcagLevel === 'AA Large' ? 'bg-gradient-to-r from-yellow-100 to-yellow-50 text-yellow-900 border border-yellow-200' :
                  wcagLevel === 'AA' ? 'bg-gradient-to-r from-green-100 to-green-50 text-green-900 border border-green-200' :
                  'bg-gradient-to-r from-blue-100 to-blue-50 text-blue-900 border border-blue-200'
                }`}>
                  {wcagLevel}
                </span>
                <span className="text-sm bg-gradient-to-r from-gray-700 to-gray-600 bg-clip-text text-transparent font-medium">
                  {wcagLevel === 'Fail' ? '不符合标准' :
                   wcagLevel === 'AA Large' ? '适合大号文字' :
                   wcagLevel === 'AA' ? '符合一般标准' :
                   '符合最高标准'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;