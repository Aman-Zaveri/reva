interface DiffWord {
  value: string;
  type: "added" | "removed" | "unchanged";
}

export function getWordDiff(oldText: string, newText: string): DiffWord[] {
  const oldWords = oldText.split(/(\s+)/);
  const newWords = newText.split(/(\s+)/);
  const result: DiffWord[] = [];
  
  // Simple word-by-word comparison
  const maxLength = Math.max(oldWords.length, newWords.length);
  
  for (let i = 0; i < maxLength; i++) {
    const oldWord = oldWords[i];
    const newWord = newWords[i];
    
    if (oldWord === newWord) {
      if (oldWord) {
        result.push({ value: oldWord, type: "unchanged" });
      }
    } else {
      if (oldWord && !newWord) {
        result.push({ value: oldWord, type: "removed" });
      } else if (!oldWord && newWord) {
        result.push({ value: newWord, type: "added" });
      } else if (oldWord && newWord) {
        result.push({ value: oldWord, type: "removed" });
        result.push({ value: newWord, type: "added" });
      }
    }
  }
  
  return result;
}

interface WordDiffDisplayProps {
  diff: DiffWord[];
}

export function WordDiffDisplay({ diff }: WordDiffDisplayProps) {
  return (
    <div className="leading-relaxed">
      {diff.map((word, index) => {
        const className = 
          word.type === "added" 
            ? "bg-green-100 text-green-800 px-1 rounded" 
            : word.type === "removed" 
            ? "bg-red-100 text-red-800 px-1 rounded line-through" 
            : "";
        
        return (
          <span key={index} className={className}>
            {word.value}
          </span>
        );
      })}
    </div>
  );
}
