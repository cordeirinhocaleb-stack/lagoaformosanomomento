import re

# Read the file
with open(r"c:/Users/gusta/Downloads/Verções do site/lagoa-formosa-no-momento-alpha-1.099-060120260930/components/admin/editor/layout/EditorContent.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Find and replace the smart_block case
old_pattern = r"case 'smart_block':\s+console\.log.*?return \(\s+<div key=\{renderKey\}.*?</div>\s+\);"

new_code = """case 'smart_block':
                                        return (
                                            <div className="transition-all duration-300">
                                                <SmartBlockRenderer block={block} />
                                                {selectedBlockId === block.id && (
                                                    <div className="mt-4 border-t border-dashed border-zinc-200 pt-4 animate-fadeIn">
                                                        <SmartBlockEditor block={block} onUpdate={handleUpdateBlock} />
                                                    </div>
                                                )}
                                            </div>
                                        );"""

content = re.sub(old_pattern, new_code, content, flags=re.DOTALL)

# Write back
with open(r"c:/Users/gusta/Downloads/Verções do site/lagoa-formosa-no-momento-alpha-1.099-060120260930/components/admin/editor/layout/EditorContent.tsx", "w", encoding="utf-8") as f:
    f.write(content)

print("File updated successfully!")
