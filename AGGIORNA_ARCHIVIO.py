#!/usr/bin/env python3
"""KING V3: aggiorna una COPIA dell'archivio, mai quello originale.
Uso: python AGGIORNA_ARCHIVIO.py archivio_attuale.json nuovi_ingredienti.json cartella_output
Input nuovi: intero archivio V3 con 'ingredients' oppure {'ingredients': [...]}.
Se l'ID esiste e il record e' differente, segnala conflitto e conserva il vecchio.
"""
import json,sys,pathlib,copy,datetime

def load(p):
    with open(p,encoding='utf-8') as f:return json.load(f)
def save(p,obj):
    p.write_text(json.dumps(obj,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')

def merge(old,new):
    if not isinstance(old.get('ingredients'),list) or not isinstance(new.get('ingredients'),list):
        raise ValueError("Entrambi i file devono contenere ingredients: []")
    result=copy.deepcopy(old); existing={}
    for i,record in enumerate(result['ingredients']):
        key=record.get('id');
        if not key or key in existing:raise ValueError('ID mancante o duplicato nell’archivio di partenza: '+str(key))
        existing[key]=i
    incoming_seen=set(); added=[];unchanged=[];conflicts=[]
    for record in new['ingredients']:
        key=record.get('id')
        if not isinstance(key,str) or not key.strip():raise ValueError('Nuovo record senza id stabile')
        if key in incoming_seen:raise ValueError('ID duplicato nel nuovo lotto: '+key)
        incoming_seen.add(key)
        if key not in existing:
            result['ingredients'].append(copy.deepcopy(record));existing[key]=len(result['ingredients'])-1;added.append(key)
        elif result['ingredients'][existing[key]]==record:unchanged.append(key)
        else:conflicts.append({'id':key,'reason':'Contenuti diversi: modifiche NON applicate, richiede revisione manuale','old_name':result['ingredients'][existing[key]].get('name_it'),'new_name':record.get('name_it')})
    # The source ledger is append-only. Preserve existing entries and flag altered source IDs.
    for field in ['sources','book_index']:
        if isinstance(new.get(field),list):
            result.setdefault(field,[])
            bykey={v.get('id'):v for v in result[field] if isinstance(v,dict) and v.get('id')}
            for v in new[field]:
                if not isinstance(v,dict):continue
                k=v.get('id')
                if not k:
                    if v not in result[field]:result[field].append(copy.deepcopy(v))
                elif k not in bykey:
                    result[field].append(copy.deepcopy(v));bykey[k]=v
                elif bykey[k]!=v:conflicts.append({'id':k,'field':field,'reason':'Fonte/indice con ID già presente e contenuto differente; non sovrascritto'})
    if new.get('book') and new['book']!=old.get('book'):
        books=result.setdefault('additional_books',[])
        if new['book'] not in books and new['book']!=result.get('book'):books.append(copy.deepcopy(new['book']))
    result.setdefault('changes',[]).append({'date':datetime.date.today().isoformat(),'type':'append_only_merged','new_ids':added,'unchanged_ids':unchanged,'conflicts_count':len(conflicts)})
    return result,{'added':added,'unchanged':unchanged,'conflicts':conflicts,'counts':{'old':len(old['ingredients']),'new':len(result['ingredients'])}}

def main():
    if len(sys.argv)!=4:raise SystemExit('Uso: python AGGIORNA_ARCHIVIO.py archivio_attuale.json nuovo_lotto.json cartella_output')
    old,new=load(sys.argv[1]),load(sys.argv[2]);out=pathlib.Path(sys.argv[3]);out.mkdir(parents=True,exist_ok=True)
    merged,report=merge(old,new)
    save(out/'KING_ARCHIVIO_V3_UNIFICATO.json',merged)
    save(out/'RAPPORTO_IMPORTAZIONE.json',report)
    (out/'king-laboratorio-v3-dati.js').write_text('window.KING_LAB_DATA='+json.dumps(merged,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf-8')
    print('Ingredienti iniziali:',report['counts']['old'],'Finali:',report['counts']['new'],'Aggiunti:',len(report['added']),'Conflitti:',len(report['conflicts']))
    print('Output:',out.resolve())
if __name__=='__main__':main()
