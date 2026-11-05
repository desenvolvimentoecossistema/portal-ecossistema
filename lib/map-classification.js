export function classificationValues(values,missingLabel){
 const filled=(Array.isArray(values)?values:[]).map(value=>String(value).trim()).filter(Boolean);
 return filled.length?[...new Set(filled.map(value=>/^(n\/a|não aplicável|não se aplica)$/i.test(value)?'Não se aplica':value))]:[missingLabel];
}
export function classificationText(value,missingLabel){
 const text=String(value||'').trim();
 return text?(/^(n\/a|não aplicável|não se aplica)$/i.test(text)?'Não se aplica':text):missingLabel;
}
