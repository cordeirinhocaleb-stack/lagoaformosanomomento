
import React from 'react';
import { ContentBlock } from '../../../../types';

interface TableBlockProps {
  block: ContentBlock;
  isSelected: boolean;
  onUpdate: (content: any) => void;
  onSelect: () => void;
}

const TableBlock: React.FC<TableBlockProps> = ({ block, isSelected, onUpdate, onSelect }) => {
  const content = block.content || { rows: [['Item', 'Valor'], ['-', '-']] };

  const updateCell = (rIdx: number, cIdx: number, val: string) => {
    const newRows = [...content.rows];
    newRows[rIdx][cIdx] = val;
    onUpdate({ ...content, rows: newRows });
  };

  return (
    <div 
      onClick={onSelect}
      className={`p-4 transition-all ${isSelected ? 'ring-4 ring-blue-500/20 bg-blue-50/10 rounded-3xl' : ''}`}
    >
      <div className="overflow-x-auto rounded-3xl border border-zinc-200 shadow-xl bg-white">
        <table className="w-full text-left border-collapse">
            <tbody>
                {content.rows.map((row: string[], rIdx: number) => (
                    <tr key={rIdx} className={rIdx === 0 ? 'bg-zinc-900 text-white' : 'border-b border-zinc-100'}>
                        {row.map((cell, cIdx) => (
                            <td key={cIdx} className="p-0">
                                <input 
                                    type="text" 
                                    value={cell} 
                                    onChange={(e) => updateCell(rIdx, cIdx, e.target.value)}
                                    className={`w-full px-5 py-4 bg-transparent outline-none font-bold text-sm uppercase tracking-tight focus:bg-red-50/30 transition-colors ${rIdx === 0 ? 'placeholder-zinc-400' : 'text-zinc-700'}`}
                                />
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
      </div>
      <p className="text-[8px] font-black uppercase text-zinc-300 mt-4 tracking-widest text-center">Clique nas células para editar os dados da tabela</p>
    </div>
  );
};

export default TableBlock;
