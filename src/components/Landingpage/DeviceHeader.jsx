// // DeviceHeader.jsx
// import React from 'react';
// import { Search } from 'lucide-react';
// import { useTheme } from "../../hooks/useThemeContext";

// export default function DeviceHeader({ searchTerm, onSearchChange }) {
//   const { isDark } = useTheme();

//   return (
//     <div className="px-4 py-3">
//       <div className={`
//         relative rounded-xl overflow-hidden
       
//         ${isDark ? 'bg-gray-800' : 'bg-white border border-gray-200'}
//       `}>
//         <div className="flex items-center px-4">
//           <Search className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
//           <input
//             type="text"
//             value={searchTerm}
//             onChange={(e) => onSearchChange(e.target.value)}
//             placeholder="Search devices..."
//             className={`
//               w-full px-3 py-3 bg-transparent outline-none text-base
//               ${isDark ? 'text-white placeholder-gray-500' : 'text-gray-900 placeholder-gray-400'}
//             `}
//           />
//         </div>
//       </div>
//     </div>
//   );
// }



// components/DeviceHeader.jsx
import React from 'react';
import { Search } from 'lucide-react';
import { useTheme } from '../../hooks/useThemeContext';

export default function DeviceHeader({ searchTerm, onSearchChange }) {
  const { themeColors, isDark } = useTheme();

  return (
    <div className="px-4 py-3">
      <div 
        className={`
          relative rounded-xl overflow-hidden transition-all
          ${isDark ? 'bg-gray-800' : 'bg-white border border-gray-200'}
        `}
        style={{
          backgroundColor: isDark ? themeColors.surface : '#ffffff',
          borderColor: isDark ? 'transparent' : themeColors.border
        }}
      >
        <div className="flex items-center px-4">
          <Search 
            className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} 
          />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search devices..."
            className={`
              w-full px-3 py-3 bg-transparent outline-none text-base
              ${isDark ? 'text-white placeholder-gray-500' : 'text-gray-900 placeholder-gray-400'}
            `}
            style={{
              color: themeColors.text,
              '::placeholder': {
                color: isDark ? '#6B7280' : '#9CA3AF'
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}