import {writeFileSync} from 'node:fs';
// Standalone PDF 1.4 / AcroForm generator; no data is collected by the site.
const esc=s=>s.replace(/[\\()]/g,'\\$&');
function pdf(kind,title){
 const fields=['Nome ficticio','Codigo do imovel','Preferencias / observacoes'];
 let stream='0.969 0.953 0.925 rg 0 0 595 842 re f\n0.145 0.141 0.133 rg\n';
 const text=(s,x,y,size=12)=>`BT /F1 ${size} Tf ${x} ${y} Td (${esc(s)}) Tj ET\n`;
 stream+='0.91 0.71 0.12 rg 44 758 24 24 re f\n0.08 0.33 0.24 rg 44 731 24 24 re f\n0.145 0.141 0.133 rg\n';
 stream+=text('PROPERTY MATCH',82,758,23)+text('ZONA LESTE / MODELO DEMONSTRATIVO',82,738,9);
 stream+=text(title,44,675,25)+text('PDF preenchivel - use somente informacoes ficticias.',44,644,11);
 stream+=text('Este modelo nao substitui uma ficha cadastral operacional.',44,621,10);
 fields.forEach((s,i)=>{stream+=text(s,44,556-i*100,12);});
 stream+=text('Como preencher',44,235,15)+text('1. Abra em um leitor de PDF com suporte a formularios.',44,207,10)+text('2. Digite dados de exemplo nos campos e salve uma copia.',44,185,10)+text('3. Nenhum arquivo ou dado e enviado a esta plataforma.',44,163,10);
 stream+=text('Envio por WhatsApp (orientacao para um fluxo real):',44,120,10)+text('Confirme o contato do corretor antes de anexar documentos.',44,100,10)+text('PROTOTIPO VISUAL / SEM VALIDADE CADASTRAL',44,53,9);
 const objs=[];
 objs.push('<< /Type /Catalog /Pages 2 0 R /AcroForm 6 0 R >>');
 objs.push('<< /Type /Pages /Kids [3 0 R] /Count 1 >>');
 objs.push('<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R /Annots [7 0 R 8 0 R 9 0 R] >>');
 objs.push('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');
 objs.push(`<< /Length ${Buffer.byteLength(stream,'latin1')} >>\nstream\n${stream}endstream`);
 objs.push('<< /Fields [7 0 R 8 0 R 9 0 R] /NeedAppearances true /DR << /Font << /F1 4 0 R >> >> /DA (/F1 12 Tf 0 g) >>');
 fields.forEach((s,i)=>{const y=500-i*100;objs.push(`<< /Type /Annot /Subtype /Widget /FT /Tx /T (${kind}_${i}) /TU (${esc(s)}) /Rect [44 ${y} 551 ${y+40}] /P 3 0 R /F 4 /V () /DA (/F1 12 Tf 0 g) /MK << /BG [1 1 1] /BC [0.6 0.6 0.6] >> /BS << /W 1 /S /S >> >>`);});
 let out='%PDF-1.4\n';const offsets=[0];objs.forEach((o,i)=>{offsets.push(Buffer.byteLength(out,'latin1'));out+=`${i+1} 0 obj\n${o}\nendobj\n`;});const xref=Buffer.byteLength(out,'latin1');out+=`xref\n0 ${objs.length+1}\n0000000000 65535 f \n`;offsets.slice(1).forEach(n=>out+=String(n).padStart(10,'0')+' 00000 n \n');out+=`trailer\n<< /Size ${objs.length+1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
 writeFileSync(`dist/assets/ficha-${kind}.pdf`,Buffer.from(out,'latin1'));
}
pdf('locacao','Ficha de locacao');pdf('proprietario','Ficha de proprietario');pdf('interessado','Ficha de interessado');
console.log('3 PDFs demonstrativos gerados, cada um com 3 campos AcroForm.');
